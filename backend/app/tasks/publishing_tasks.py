"""
Celery task for publishing scheduled content to social platforms.
Runs every 60 seconds.
"""
import asyncio
from datetime import datetime
import httpx

from .celery_app import celery_app


def _run(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


async def _do_publish_scheduled():
    from ..database import AsyncSessionLocal
    from ..models.content import Content, ContentStatus
    from ..models.integration import Integration, IntegrationPlatform
    from ..services.encryption_service import decrypt_token
    from sqlalchemy.future import select

    async with AsyncSessionLocal() as db:
        now = datetime.utcnow()
        stmt = select(Content).where(
            Content.status == ContentStatus.approved,
            Content.scheduled_time <= now,
            Content.scheduled_time.isnot(None),
        )
        result = await db.execute(stmt)
        items = result.scalars().all()

        for content in items:
            platform = content.platform.value

            # Find user's integration for this platform
            intg_stmt = select(Integration).where(
                Integration.user_id == content.user_id,
                Integration.platform == platform,
                Integration.is_active == True,
            )
            intg_result = await db.execute(intg_stmt)
            integration = intg_result.scalar_one_or_none()

            if not integration:
                content.status = ContentStatus.failed
                content.error_message = f"No active {platform} integration found"
                continue

            try:
                token = decrypt_token(integration.access_token)
                success, post_id, error = await _publish_to_platform(
                    platform, token, content.content_text, content.user_id
                )
                if success:
                    content.status = ContentStatus.published
                    content.published_at = datetime.utcnow()
                    content.platform_post_id = post_id
                else:
                    content.status = ContentStatus.failed
                    content.error_message = error
            except Exception as e:
                content.status = ContentStatus.failed
                content.error_message = str(e)[:500]

        await db.commit()


async def _publish_to_platform(platform: str, token: str, text: str, user_id) -> tuple:
    """Returns (success, post_id, error_message)."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            if platform == "linkedin":
                return await _publish_linkedin(client, token, text, user_id)
            elif platform == "twitter":
                return await _publish_twitter(client, token, text)
            elif platform == "instagram":
                return await _publish_instagram(client, token, text)
            else:
                return False, None, f"Publishing not supported for {platform}"
    except Exception as e:
        return False, None, str(e)


async def _publish_linkedin(client: httpx.AsyncClient, token: str, text: str, user_id) -> tuple:
    # Get LinkedIn person URN
    me_resp = await client.get(
        "https://api.linkedin.com/v2/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    if me_resp.status_code != 200:
        return False, None, "Failed to fetch LinkedIn profile"

    person_id = me_resp.json().get("id")
    author_urn = f"urn:li:person:{person_id}"

    payload = {
        "author": author_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": text},
                "shareMediaCategory": "NONE",
            }
        },
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }

    resp = await client.post(
        "https://api.linkedin.com/v2/ugcPosts",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=payload,
    )
    if resp.status_code == 201:
        post_id = resp.headers.get("x-restli-id", "")
        return True, post_id, None
    return False, None, f"LinkedIn error: {resp.text[:200]}"


async def _publish_twitter(client: httpx.AsyncClient, token: str, text: str) -> tuple:
    resp = await client.post(
        "https://api.twitter.com/2/tweets",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"text": text[:280]},
    )
    if resp.status_code == 201:
        tweet_id = resp.json().get("data", {}).get("id", "")
        return True, tweet_id, None
    return False, None, f"Twitter error: {resp.text[:200]}"


async def _publish_instagram(client: httpx.AsyncClient, token: str, text: str) -> tuple:
    # Instagram requires a page_id — simplified flow
    # Step 1: Create media container
    # Step 2: Publish container
    # This requires facebook_page_id — stored in integration metadata
    return False, None, "Instagram publishing requires page_id configuration"


@celery_app.task(name="publishing.publish_scheduled_content")
def publish_scheduled_content():
    _run(_do_publish_scheduled())
