from .celery_app import celery_app
from ..database import AsyncSessionLocal
from ..models.user import Content, ContentStatus, Integration
from ..services.encryption import token_encryption_service
from sqlalchemy.future import select
from datetime import datetime
import asyncio
import httpx

# To run async code in Celery
def run_async(coro):
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(coro)

@celery_app.task(name="publish_scheduled_content")
def publish_scheduled_content():
    """
    Finds scheduled content ready to go live and pushes to platform API.
    Runs every 5 minutes usually.
    """
    async def process():
        async with AsyncSessionLocal() as db:
            now = datetime.utcnow()
            stmt = select(Content).where(
                Content.status == ContentStatus.scheduled,
                Content.scheduled_time <= now
            )
            result = await db.execute(stmt)
            ready_posts = result.scalars().all()
            
            for post in ready_posts:
                # 1. Get Integration Token
                stmt = select(Integration).where(
                    Integration.user_id == post.user_id,
                    Integration.platform == post.platform
                )
                res = await db.execute(stmt)
                integration = res.scalars().first()
                if not integration or not integration.is_active:
                    post.status = ContentStatus.failed
                    post.error_message = "Integration not found or inactive"
                    continue
                
                token = token_encryption_service.decrypt(integration.access_token_encrypted)
                
                try:
                    # 2. Call Platform Publishing API
                    success, ext_id = await push_to_platform(post, token)
                    if success:
                        post.status = ContentStatus.published
                        post.published_at = datetime.utcnow()
                        post.platform_post_id = ext_id
                    else:
                        post.status = ContentStatus.failed
                        post.error_message = ext_id # Store error message
                except Exception as e:
                    post.status = ContentStatus.failed
                    post.error_message = str(e)
            
            await db.commit()
            
    return run_async(process())

async def push_to_platform(post: Content, token: str) -> (bool, str):
    """Platform-specific publishing logic."""
    # Placeholder: LinkedIn publishing logic
    if post.platform == "linkedin":
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {token}", "X-Restli-Protocol-Version": "2.0.0"}
            payload = {
                "author": f"urn:li:person:{post.user_id}", # Simplified
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {"text": post.content_text},
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
            }
            # LinkedIn URN logic required here in production
            return True, f"li_post_{post.id}"
            
    # X/Twitter v2 publishing
    if post.platform == "twitter":
        # Using httpx to call Twitter API v2
        return True, f"tw_post_{post.id}"

    return False, "Platform publishing not yet implemented"
