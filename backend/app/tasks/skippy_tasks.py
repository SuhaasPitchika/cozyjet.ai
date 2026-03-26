from .celery_app import celery_app
from ..database import AsyncSessionLocal
from ..models.user import Integration, IntegrationPlatform, ContentSeed, IntegrationSyncLog
from ..services.integrations import IntegrationService
from ..services.encryption import token_encryption_service
from ..agents.skippy import SkippyAgent
from sqlalchemy.future import select
from datetime import datetime
import asyncio
import httpx
import json

# To run async code in Celery
def run_async(coro):
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(coro)

@celery_app.task(name="skippy_sync_integration")
def skippy_sync_integration(integration_id: str):
    """
    Main background task to sync a specific integration.
    """
    async def process():
        async with AsyncSessionLocal() as db:
            # 1. Load integration
            stmt = select(Integration).where(Integration.id == integration_id)
            result = await db.execute(stmt)
            integration = result.scalars().first()
            if not integration or not integration.is_active:
                return "Inactive or missing"

            start_time = datetime.utcnow()
            log = IntegrationSyncLog(integration_id=integration.id, status="running")
            db.add(log)
            await db.flush()

            try:
                # 2. Get Valid Token (handles refresh)
                token = await IntegrationService.get_valid_token(integration, db)
                
                # 3. Call Platform-Specific Sync
                seeds_found = 0
                if integration.platform == IntegrationPlatform.github:
                    seeds_found = await sync_github(integration, token, db)
                elif integration.platform == IntegrationPlatform.notion:
                    seeds_found = await sync_notion(integration, token, db)
                elif integration.platform == IntegrationPlatform.figma:
                    seeds_found = await sync_figma(integration, token, db)
                elif integration.platform == IntegrationPlatform.google_drive:
                    seeds_found = await sync_google_drive(integration, token, db)
                elif integration.platform == IntegrationPlatform.google_calendar:
                    seeds_found = await sync_google_calendar(integration, token, db)
                
                # 4. Update logs on success
                log.status = "success"
                log.seeds_created = seeds_found
                integration.last_synced_at = datetime.utcnow()
                integration.sync_error = None
            
            except Exception as e:
                log.status = "failure"
                log.error_message = str(e)
                integration.sync_error = str(e)
            
            log.completed_at = datetime.utcnow()
            log.duration_ms = int((log.completed_at - start_time).total_seconds() * 1000)
            await db.commit()

    return run_async(process())

async def sync_github(integration, token, db):
    """
    GitHub Sync: Fetch recent commits.
    """
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github.v3+json"}
    skippy = SkippyAgent()
    seeds_count = 0
    
    async with httpx.AsyncClient() as client:
        # Get repos
        repos_resp = await client.get("https://api.github.com/user/repos?sort=updated&per_page=5", headers=headers)
        repos = repos_resp.json()
        
        since = integration.last_synced_at.isoformat() if integration.last_synced_at else None
        
        for repo in repos:
            repo_full_name = repo["full_name"]
            commits_url = f"https://api.github.com/repos/{repo_full_name}/commits?per_page=5"
            if since: commits_url += f"&since={since}"
            
            commits_resp = await client.get(commits_url, headers=headers)
            commits = commits_resp.json() if commits_resp.status_code == 200 else []
            
            for commit in commits:
                msg = commit["commit"]["message"]
                # Skip merges/automated
                if "Merge" in msg or "bot" in commit.get("author", {}).get("login", "").lower():
                    continue
                
                # Ask Skippy to generate a seed
                summary = await skippy.summarize_activity({
                    "platform": "github",
                    "title": f"Commit in {repo['name']}",
                    "description": msg,
                    "url": commit["html_url"],
                    "metadata": {"repo": repo_full_name, "files_changed": len(commit.get("files", []))}
                })
                
                seed = ContentSeed(
                    user_id=integration.user_id,
                    title=summary["title"],
                    description=summary["description"],
                    source_platform="github",
                    source_url=commit["html_url"],
                    tags=summary.get("tags", []),
                    source_metadata={"repo": repo_full_name, "sha": commit["sha"]}
                )
                db.add(seed)
                seeds_count += 1
                
    return seeds_count

async def sync_notion(integration, token, db):
    """
    Notion Sync: Recently edited pages.
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
    }
    skippy = SkippyAgent()
    seeds_count = 0
    
    async with httpx.AsyncClient() as client:
        # Search for recently edited pages
        search_data = {
            "filter": {"value": "page", "property": "object"},
            "sort": {"direction": "descending", "timestamp": "last_edited_time"}
        }
        res = await client.post("https://api.notion.com/v1/search", headers=headers, json=search_data)
        pages = res.json().get("results", [])
        
        for page in pages[:3]: # Limit for demo
            title = "Untitled"
            props = page.get("properties", {})
            for p_name, p_val in props.items():
                if p_val.get("type") == "title":
                    title_parts = p_val.get("title", [])
                    if title_parts: title = title_parts[0].get("plain_text", title)
            
            # Fetch content excerpt (blocks)
            blocks_res = await client.get(f"https://api.notion.com/v1/blocks/{page['id']}/children?page_size=10", headers=headers)
            blocks = blocks_res.json().get("results", [])
            content_text = ""
            for b in blocks:
                b_type = b.get("type")
                if b_type in ["paragraph", "heading_1", "heading_2", "bulleted_list_item"]:
                    rich_text = b.get(b_type, {}).get("rich_text", [])
                    if rich_text: content_text += rich_text[0].get("plain_text", "") + " "
            
            summary = await skippy.summarize_activity({
                "platform": "notion",
                "title": f"Notion Edit: {title}",
                "description": content_text[:500],
                "url": page.get("url"),
            })
            
            seed = ContentSeed(
                user_id=integration.user_id,
                title=summary["title"],
                description=summary["description"],
                source_platform="notion",
                source_url=page.get("url"),
                tags=summary.get("tags", [])
            )
            db.add(seed)
            seeds_count += 1
            
    return seeds_count

async def sync_figma(integration, token, db):
    # Placeholder for figma logic 
    return 0

async def sync_google_drive(integration, token, db):
    """
    Google Drive Sync: Recently modified files.
    """
    headers = {"Authorization": f"Bearer {token}"}
    skippy = SkippyAgent()
    seeds_count = 0
    
    async with httpx.AsyncClient() as client:
        # Fetch files modified in last 24h
        q = "modifiedTime > '" + (integration.last_synced_at or datetime.utcnow()).isoformat() + "Z' and trashed = false"
        res = await client.get(f"https://www.googleapis.com/drive/v3/files?q={q}&fields=files(id,name,mimeType,webViewLink)", headers=headers)
        files = res.json().get("files", [])
        
        for file in files[:5]: # Limit
            # Generate seed only for relevant types (docs, slides, sheets)
            if any(t in file["mimeType"] for t in ["document", "presentation", "spreadsheet"]):
                summary = await skippy.summarize_activity({
                    "platform": "google_drive",
                    "title": f"Drive Update: {file['name']}",
                    "description": f"Working on a {file['mimeType'].split('.')[-1]} titled {file['name']}.",
                    "url": file.get("webViewLink")
                })
                
                seed = ContentSeed(
                    user_id=integration.user_id,
                    title=summary["title"],
                    description=summary["description"],
                    source_platform="google_drive",
                    source_url=file.get("webViewLink")
                )
                db.add(seed)
                seeds_count += 1
    return seeds_count

async def sync_google_calendar(integration, token, db):
    """
    Google Calendar Sync: Events from the last 24h.
    """
    headers = {"Authorization": f"Bearer {token}"}
    skippy = SkippyAgent()
    seeds_count = 0
    
    async with httpx.AsyncClient() as client:
        time_min = (integration.last_synced_at or datetime.utcnow()).isoformat() + "Z"
        res = await client.get(f"https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin={time_min}", headers=headers)
        events = res.json().get("items", [])
        
        for event in events:
            # Only sync meaningful events (longer than 30 mins)
            start = datetime.fromisoformat(event["start"].get("dateTime", event["start"].get("date")).replace("Z", ""))
            end = datetime.fromisoformat(event["end"].get("dateTime", event["end"].get("date")).replace("Z", ""))
            duration_mins = (end - start).total_seconds() / 60
            
            if duration_mins >= 30:
                summary = await skippy.summarize_activity({
                    "platform": "google_calendar",
                    "title": f"Calendar Event: {event['summary']}",
                    "description": f"Finished a {int(duration_mins)} minute session: {event['summary']}.",
                })
                
                seed = ContentSeed(
                    user_id=integration.user_id,
                    title=summary["title"],
                    description=summary["description"],
                    source_platform="google_calendar"
                )
                db.add(seed)
                seeds_count += 1
    return seeds_count
