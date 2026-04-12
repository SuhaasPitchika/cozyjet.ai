"""
Celery tasks for Skippy integration syncing and the morning autonomous loop.

skippy_sync_all_users   — scheduled every 2 hours
skippy_sync_user        — per-user dispatcher
skippy_sync_integration — per-integration core sync (GitHub, Notion, Figma, Drive, Calendar)
skippy_morning_digest   — 7AM daily: sync + fill calendar gaps + notify
snooks_run_growth_experiment — weekly: hypothesis generation + experiment scheduling
"""
import asyncio
import logging
from datetime import datetime, timedelta

import httpx

from .celery_app import celery_app

logger = logging.getLogger("cozyjet.skippy_tasks")


def _run(coro):
    """Run an async coroutine from a synchronous Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


# ── Core sync logic ──────────────────────────────────────────────

async def _do_sync_all_users():
    from ..database import AsyncSessionLocal
    from ..models.user import User
    from ..models.integration import Integration
    from sqlalchemy.future import select

    async with AsyncSessionLocal() as db:
        stmt = (
            select(User.id)
            .join(Integration, Integration.user_id == User.id)
            .where(Integration.is_active == True)
            .distinct()
        )
        result = await db.execute(stmt)
        user_ids = [str(row[0]) for row in result.fetchall()]

    for uid in user_ids:
        skippy_sync_user.delay(uid)
        logger.info(f"Queued sync for user {uid}")


async def _do_sync_user(user_id: str):
    from ..database import AsyncSessionLocal
    from ..models.integration import Integration
    from sqlalchemy.future import select

    async with AsyncSessionLocal() as db:
        stmt = select(Integration).where(
            Integration.user_id == user_id, Integration.is_active == True
        )
        result = await db.execute(stmt)
        integrations = result.scalars().all()
        integration_ids = [str(i.id) for i in integrations]

    for iid in integration_ids:
        skippy_sync_integration.delay(iid)


async def _do_sync_integration(integration_id: str):
    from ..database import AsyncSessionLocal
    from ..models.integration import Integration
    from ..models.content_seed import ContentSeed
    from ..models.user import User
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

        # Load user for context
        user_stmt = select(User).where(User.id == intg.user_id)
        user_result = await db.execute(user_stmt)
        user = user_result.scalar_one_or_none()
        user_context = ""
        if user and user.voice_profile:
            tone = user.voice_profile.get("tone", "professional")
            style = user.voice_profile.get("preferred_style", "storytelling")
            user_context = (
                f"A {tone} {style} content creator. "
                f"Preferred platforms: {', '.join(user.voice_profile.get('preferred_platforms', ['linkedin']))}"
            )

        # Load recent seed titles to avoid repetition
        from sqlalchemy import desc
        recent_stmt = (
            select(ContentSeed.title)
            .where(ContentSeed.user_id == intg.user_id)
            .order_by(desc(ContentSeed.created_at))
            .limit(5)
        )
        recent_result = await db.execute(recent_stmt)
        recent_titles = [row[0] for row in recent_result.fetchall()]

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
            logger.error(f"Sync failed [{platform}/{integration_id}]: {e}")
            return

        # Also try narrative arc detection if multiple activities
        if len(raw_activities) >= 3:
            try:
                arc = await skippy_agent.analyze_narrative_arc(raw_activities, user_context)
                if arc.get("has_arc") and arc.get("arc_title"):
                    raw_activities.insert(0, f"NARRATIVE ARC: {arc['arc_description']}")
            except Exception as e:
                logger.warning(f"Arc detection skipped: {e}")

        for activity_text in raw_activities[:10]:  # limit per sync run
            try:
                seed_data = await skippy_agent.process_activity(
                    activity_text,
                    platform=platform,
                    user_context=user_context,
                    recent_titles=recent_titles,
                )
                source_platform = (platform or "manual")[:50]
                seed = ContentSeed(
                    user_id=intg.user_id,
                    title=seed_data.get("title", activity_text[:60]),
                    description=seed_data.get("description", activity_text[:300]),
                    source_platform=source_platform,
                    source_metadata={
                        "tags": seed_data.get("tags", []),
                        "content_angles": seed_data.get("content_angles", []),
                        "story_hook": seed_data.get("story_hook", ""),
                        "platform": platform,
                    },
                )
                db.add(seed)
                recent_titles.insert(0, seed_data.get("title", ""))
                recent_titles = recent_titles[:5]
            except Exception as e:
                logger.warning(f"Seed creation failed: {e}")
                continue

        intg.last_synced_at = datetime.utcnow()
        intg.sync_error = None
        await db.commit()


# ── Platform sync helpers ─────────────────────────────────────────

async def _sync_github(client: httpx.AsyncClient, token: str, since: datetime) -> list:
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"}
    activities = []

    repos_resp = await client.get(
        "https://api.github.com/user/repos?per_page=20&sort=pushed",
        headers=headers,
    )
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
            msg = commit.get("commit", {}).get("message", "").split("\n")[0]  # first line only
            stats = commit.get("stats", {})
            if msg:
                activity = f"GitHub commit in {owner}/{name}: {msg}"
                if stats.get("additions") or stats.get("deletions"):
                    activity += (
                        f" (+{stats.get('additions', 0)}/-{stats.get('deletions', 0)} lines)"
                    )
                activities.append(activity)

    return activities


async def _sync_notion(client: httpx.AsyncClient, token: str, since: datetime) -> list:
    headers = {
        "Authorization": f"Bearer {token}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
    }
    activities = []

    resp = await client.post(
        "https://api.notion.com/v1/search",
        headers=headers,
        json={
            "filter": {"value": "page", "property": "object"},
            "sort": {"direction": "descending", "timestamp": "last_edited_time"},
        },
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
            parent = page.get("parent", {}).get("type", "")
            if title:
                activities.append(f"Notion page updated ({parent}): '{title}'")

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
            activities.append(f"Figma design updated: '{name}'")

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
        doc_type = (
            "document" if "document" in mime
            else "spreadsheet" if "spreadsheet" in mime
            else "presentation" if "presentation" in mime
            else "file"
        )
        activities.append(f"Google Drive {doc_type} updated: '{name}'")

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
            "timeMax": (now + timedelta(hours=24)).isoformat() + "Z",
            "singleEvents": "true",
            "orderBy": "startTime",
            "maxResults": 10,
        },
    )
    if resp.status_code != 200:
        return activities

    for event in resp.json().get("items", []):
        summary = event.get("summary", "Untitled event")
        start = event.get("start", {}).get("dateTime", event.get("start", {}).get("date", ""))
        activities.append(f"Google Calendar event: '{summary}' at {start}")

    return activities


# ── Morning digest ────────────────────────────────────────────────

async def _do_morning_digest():
    """
    7AM daily task:
    1. Sync all integrations for fresh seeds
    2. Check next 7 days of calendar per user
    3. Find gaps
    4. Ask Snooks to propose draft entries for empty days
    5. Push notification to user via WebSocket/Redis pub/sub
    """
    from ..database import AsyncSessionLocal
    from ..models.user import User
    from ..models.integration import Integration
    from ..models.calendar import CalendarEntry
    from ..models.content_seed import ContentSeed
    from ..models.trends import Trend
    from ..agents.snooks import snooks_agent
    from sqlalchemy.future import select
    from sqlalchemy import desc, and_
    import json

    async with AsyncSessionLocal() as db:
        # Get all users with active integrations
        stmt = (
            select(User)
            .join(Integration, Integration.user_id == User.id)
            .where(Integration.is_active == True)
            .distinct()
        )
        result = await db.execute(stmt)
        users = result.scalars().all()

        now = datetime.utcnow()
        next_week = now + timedelta(days=7)

        for user in users:
            try:
                # Load next 7 days of calendar
                cal_stmt = select(CalendarEntry).where(
                    CalendarEntry.user_id == user.id,
                    CalendarEntry.scheduled_time >= now,
                    CalendarEntry.scheduled_time <= next_week,
                )
                cal_result = await db.execute(cal_stmt)
                entries = cal_result.scalars().all()
                scheduled = [
                    {"platform": e.platform, "scheduled_time": e.scheduled_time.isoformat()}
                    for e in entries
                ]

                # Find days with no content
                scheduled_days = set()
                for entry in entries:
                    scheduled_days.add(entry.scheduled_time.date())
                all_days = [(now + timedelta(days=i)).date() for i in range(7)]
                empty_days = [str(d) for d in all_days if d not in scheduled_days]

                if not empty_days:
                    continue  # Calendar looks full — no action needed

                # Load unused seeds for topic suggestions
                seeds_stmt = (
                    select(ContentSeed)
                    .where(
                        ContentSeed.user_id == user.id,
                        ContentSeed.is_used == False,
                        ContentSeed.is_dismissed == False,
                    )
                    .order_by(desc(ContentSeed.created_at))
                    .limit(10)
                )
                seeds_result = await db.execute(seeds_stmt)
                seeds = seeds_result.scalars().all()
                seeds_summary = "\n".join([
                    f"- {s.title}: {s.description[:100]}"
                    for s in seeds
                ]) or "None"

                # Load trending topics
                trends_stmt = select(Trend).order_by(desc(Trend.trend_score)).limit(5)
                trends_result = await db.execute(trends_stmt)
                trends = trends_result.scalars().all()
                trend_data = [
                    {"topic": t.topic, "platform": t.platform, "score": t.trend_score}
                    for t in trends
                ]

                # Ask Snooks to generate morning digest
                digest = await snooks_agent.generate_morning_digest(
                    gaps=empty_days,
                    trend_data=trend_data,
                    seeds_summary=seeds_summary,
                    voice_profile=user.voice_profile or {},
                )

                # Push digest to user via Redis pub/sub
                if settings_available():
                    from ..config import settings
                    import redis.asyncio as aioredis
                    if settings.REDIS_URL:
                        try:
                            r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
                            await r.publish(
                                f"ws_user:{user.id}",
                                json.dumps({
                                    "type": "morning_digest",
                                    "message": digest.get("message", ""),
                                    "proposed_entries": digest.get("proposed_entries", []),
                                    "empty_days": empty_days,
                                }),
                            )
                            await r.aclose()
                        except Exception as e:
                            logger.warning(f"Redis push failed for morning digest: {e}")

            except Exception as e:
                logger.error(f"Morning digest failed for user {user.id}: {e}")
                continue


def settings_available() -> bool:
    try:
        from ..config import settings
        return True
    except Exception:
        return False


# ── Growth experiment ─────────────────────────────────────────────

async def _do_growth_experiment():
    """
    Weekly task (Monday 8AM):
    1. Load last 2 weeks of content performance
    2. Identify top and bottom performers
    3. Form a hypothesis about what drove performance
    4. Generate 2 test content variations
    5. Schedule them for the coming week
    """
    from ..database import AsyncSessionLocal
    from ..models.user import User
    from ..models.content import Content, ContentStatus
    from ..models.analytics import PostAnalytics
    from ..models.calendar import CalendarEntry, CalendarStatus
    from ..models.content_seed import ContentSeed
    from ..agents.snooks import snooks_agent
    from ..agents.meta import meta_agent
    from sqlalchemy.future import select
    from sqlalchemy import desc
    import json

    async with AsyncSessionLocal() as db:
        stmt = select(User).limit(100)
        result = await db.execute(stmt)
        users = result.scalars().all()

        since_2w = datetime.utcnow() - timedelta(days=14)
        now = datetime.utcnow()

        for user in users:
            try:
                # Load published content from last 2 weeks with analytics
                content_stmt = select(Content).where(
                    Content.user_id == user.id,
                    Content.status == ContentStatus.published,
                    Content.created_at >= since_2w,
                )
                content_result = await db.execute(content_stmt)
                content_items = content_result.scalars().all()

                if len(content_items) < 4:
                    continue  # Not enough data to form a hypothesis

                content_ids = [c.id for c in content_items]
                content_map = {c.id: c for c in content_items}

                analytics_stmt = (
                    select(PostAnalytics)
                    .where(PostAnalytics.content_id.in_(content_ids))
                    .order_by(desc(PostAnalytics.engagement_rate))
                )
                analytics_result = await db.execute(analytics_stmt)
                all_analytics = analytics_result.scalars().all()

                if not all_analytics:
                    continue

                top_3 = all_analytics[:3]
                bottom_3 = all_analytics[-3:]

                def _format(analytics_list):
                    out = []
                    for a in analytics_list:
                        if a.content_id in content_map:
                            c = content_map[a.content_id]
                            out.append({
                                "platform": a.platform,
                                "preview": c.content_text[:120],
                                "engagement_rate": a.engagement_rate,
                                "likes": a.likes,
                                "views": a.views,
                            })
                    return out

                top_performers = _format(top_3)
                bottom_performers = _format(bottom_3)

                hypothesis_data = await snooks_agent.form_growth_hypothesis(
                    top_performers=top_performers,
                    bottom_performers=bottom_performers,
                    voice_profile=user.voice_profile or {},
                )

                hypothesis = hypothesis_data.get("hypothesis", "")
                if not hypothesis:
                    continue

                # Generate test content for test_a and test_b
                for test_key in ("test_a", "test_b"):
                    test = hypothesis_data.get(test_key, {})
                    if not test.get("topic"):
                        continue

                    seed = {
                        "title": test.get("topic", "")[:60],
                        "description": (
                            f"Growth experiment test. Hypothesis: {hypothesis}. "
                            f"Angle: {test.get('angle', '')}. "
                            f"What to measure: {test.get('what_to_measure', '')}."
                        ),
                        "tags": ["experiment"],
                        "story_hook": "",
                    }
                    platform = test.get("platform", "linkedin")
                    if platform not in ["linkedin", "twitter", "instagram", "youtube", "reddit"]:
                        platform = "linkedin"

                    generated = await meta_agent.generate_content(
                        seed=seed,
                        voice_profile=user.voice_profile or {},
                        platforms=[platform],
                    )

                    variations = generated.get(platform, [])
                    if not variations or not variations[0]:
                        continue

                    from ..models.content import ContentPlatform, ContentType
                    new_content = Content(
                        user_id=user.id,
                        platform=ContentPlatform(platform),
                        content_type=ContentType.post,
                        content_text=variations[0],
                        variation_index=0,
                        status=ContentStatus.draft,
                    )
                    db.add(new_content)
                    await db.flush()

                    # Schedule it for the coming week (spread across days)
                    days_offset = 3 if test_key == "test_a" else 5
                    scheduled_time = now + timedelta(days=days_offset, hours=10)

                    entry = CalendarEntry(
                        user_id=user.id,
                        content_id=new_content.id,
                        platform=platform,
                        scheduled_time=scheduled_time,
                        status=CalendarStatus.draft,
                    )
                    db.add(entry)

                await db.commit()
                logger.info(f"Growth experiment scheduled for user {user.id}: {hypothesis[:80]}")

            except Exception as e:
                logger.error(f"Growth experiment failed for user {user.id}: {e}")
                continue


# ── Celery task registrations ─────────────────────────────────────

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


@celery_app.task(name="skippy.morning_digest")
def skippy_morning_digest():
    _run(_do_morning_digest())


@celery_app.task(name="snooks.run_growth_experiment")
def snooks_run_growth_experiment():
    _run(_do_growth_experiment())
