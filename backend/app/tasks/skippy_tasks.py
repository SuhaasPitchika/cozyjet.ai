"""
Celery tasks for Skippy integration syncing.

skippy_sync_all_users — scheduled every 2 hours
skippy_sync_user — per-user dispatcher
skippy_sync_integration — per-integration core sync
"""
import asyncio
from datetime import datetime, timedelta
from celery import shared_task
import httpx

from .celery_app import celery_app


def _run(coro):
    """Run an async coroutine from a synchronous Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


async def _do_sync_all_users():
    from ..database import AsyncSessionLocal
    from ..models.user import User
    from ..models.integration import Integration
    from sqlalchemy.future import select

    async with AsyncSessionLocal() as db:
        stmt = select(User.id).join(Integration, Integration.user_id == User.id).where(Integration.is_active == True).distinct()
        result = await db.execute(stmt)
        user_ids = [str(row[0]) for row in result.fetchall()]

    for uid in user_ids:
        skippy_sync_user.delay(uid)


async def _do_sync_user(user_id: str):
    from ..database import AsyncSessionLocal
    from ..models.integration import Integration
    from sqlalchemy.future import select

    async with AsyncSessionLocal() as db:
        stmt = select(Integration).where(Integration.user_id == user_id, Integration.is_active == True)
        result = await db.execute(stmt)
        integrations = result.scalars().all()
        integration_ids = [str(i.id) for i in integrations]

    for iid in integration_ids:
        skippy_sync_integration.delay(iid)


async def _do_sync_integration(integration_id: str):
    from ..database import AsyncSessionLocal
    from ..models.integration import Integration
    from ..models.content_seed import ContentSeed, SourceType
    from ..agents.skippy import skippy_agent
    from ..services.encryption_service import decrypt_token
    from sqlalchemy.future import select

    async with AsyncSessionLocal() as db:
        stmt = select(Integration).where(Integration.id == integration_id)
        result = await db.execute(stmt)
        intg = result.scalar_one_or_none()
        if not intg or not intg.is_active:
            return

        try:
            access_token = decrypt_token(intg.access_token)
        except Exception:
            intg.sync_error = "Failed to decrypt access token"
            await db.commit()
            return

        platform = intg.platform.value
        since = datetime.utcnow() - timedelta(hours=2)
        raw_activities = []

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                if platform == "github":
                    raw_activities = await _sync_github(client, access_token, since)
                elif platform == "notion":
                    raw_activities = await _sync_notion(client, access_token, since)
                elif platform == "figma":
                    raw_activities = await _sync_figma(client, access_token, since)
                elif platform == "google_drive":
                    raw_activities = await _sync_google_drive(client, access_token, since)
                elif platform == "google_calendar":
                    raw_activities = await _sync_google_calendar(client, access_token, since)
        except Exception as e:
            intg.sync_error = str(e)[:500]
            await db.commit()
            return

        for activity_text in raw_activities:
            try:
                seed_data = await skippy_agent.process_activity(activity_text, platform=platform)
                seed = ContentSeed(
                    user_id=intg.user_id,
                    title=seed_data.get("title", activity_text[:60]),
                    description=seed_data.get("description", activity_text[:300]),
                    source_type=SourceType(platform) if platform in [e.value for e in SourceType] else SourceType.manual,
                    source_data={
                        "tags": seed_data.get("tags", []),
                        "content_angles": seed_data.get("content_angles", []),
                        "platform": platform,
                    },
                )
                db.add(seed)
            except Exception:
                continue

        intg.last_synced_at = datetime.utcnow()
        intg.sync_error = None
        await db.commit()


async def _sync_github(client: httpx.AsyncClient, token: str, since: datetime) -> list:
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"}
    activities = []

    repos_resp = await client.get("https://api.github.com/user/repos?per_page=20&sort=pushed", headers=headers)
    if repos_resp.status_code != 200:
        return activities

    repos = repos_resp.json()
    for repo in repos[:10]:
        owner = repo["owner"]["login"]
        name = repo["name"]
        commits_resp = await client.get(
            f"https://api.github.com/repos/{owner}/{name}/commits",
            headers=headers,
            params={"since": since.isoformat() + "Z", "per_page": 5},
        )
        if commits_resp.status_code != 200:
            continue
        for commit in commits_resp.json():
            msg = commit.get("commit", {}).get("message", "")
            if msg:
                activities.append(f"GitHub commit in {owner}/{name}: {msg}")

    return activities


async def _sync_notion(client: httpx.AsyncClient, token: str, since: datetime) -> list:
    headers = {"Authorization": f"Bearer {token}", "Notion-Version": "2022-06-28", "Content-Type": "application/json"}
    activities = []

    resp = await client.post(
        "https://api.notion.com/v1/search",
        headers=headers,
        json={"filter": {"value": "page", "property": "object"}, "sort": {"direction": "descending", "timestamp": "last_edited_time"}},
    )
    if resp.status_code != 200:
        return activities

    for page in resp.json().get("results", [])[:10]:
        last_edited = page.get("last_edited_time", "")
        if last_edited and last_edited > since.isoformat():
            title = ""
            props = page.get("properties", {})
            for key in ("Name", "Title", "title"):
                if key in props:
                    title_parts = props[key].get("title", [])
                    if title_parts:
                        title = title_parts[0].get("plain_text", "")
                        break
            if title:
                activities.append(f"Notion page updated: {title}")

    return activities


async def _sync_figma(client: httpx.AsyncClient, token: str, since: datetime) -> list:
    headers = {"Authorization": f"Bearer {token}"}
    activities = []

    resp = await client.get("https://api.figma.com/v1/me/files", headers=headers)
    if resp.status_code != 200:
        return activities

    for f in resp.json().get("files", [])[:10]:
        last_modified = f.get("last_modified", "")
        if last_modified and last_modified > since.isoformat():
            name = f.get("name", "Untitled file")
            activities.append(f"Figma file updated: {name}")

    return activities


async def _sync_google_drive(client: httpx.AsyncClient, token: str, since: datetime) -> list:
    headers = {"Authorization": f"Bearer {token}"}
    activities = []

    resp = await client.get(
        "https://www.googleapis.com/drive/v3/files",
        headers=headers,
        params={
            "q": f"modifiedTime > '{since.isoformat()}Z'",
            "fields": "files(name,mimeType,modifiedTime)",
            "pageSize": 10,
        },
    )
    if resp.status_code != 200:
        return activities

    for f in resp.json().get("files", []):
        mime = f.get("mimeType", "")
        name = f.get("name", "Untitled")
        doc_type = "document" if "document" in mime else "spreadsheet" if "spreadsheet" in mime else "file"
        activities.append(f"Google Drive {doc_type} updated: {name}")

    return activities


async def _sync_google_calendar(client: httpx.AsyncClient, token: str, since: datetime) -> list:
    headers = {"Authorization": f"Bearer {token}"}
    activities = []

    now = datetime.utcnow()
    resp = await client.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        headers=headers,
        params={
            "timeMin": since.isoformat() + "Z",
            "timeMax": (now + timedelta(hours=2)).isoformat() + "Z",
            "singleEvents": "true",
            "orderBy": "startTime",
            "maxResults": 10,
        },
    )
    if resp.status_code != 200:
        return activities

    for event in resp.json().get("items", []):
        summary = event.get("summary", "Untitled event")
        activities.append(f"Google Calendar event: {summary}")

    return activities


@celery_app.task(name="skippy.sync_all_users")
def skippy_sync_all_users():
    _run(_do_sync_all_users())


@celery_app.task(name="skippy.sync_user")
def skippy_sync_user(user_id: str):
    _run(_do_sync_user(user_id))


@celery_app.task(name="skippy.sync_integration", bind=True, max_retries=3)
def skippy_sync_integration(self, integration_id: str):
    try:
        _run(_do_sync_integration(integration_id))
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
