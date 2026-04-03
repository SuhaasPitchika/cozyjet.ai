"""
Publishing tasks — automated content publishing to social platforms.
Runs every 60 seconds to check for approved scheduled content.
Supports: LinkedIn, Twitter, Instagram (via Facebook Graph API).
"""
import asyncio
import logging
from datetime import datetime

import httpx

from .celery_app import celery_app

logger = logging.getLogger("cozyjet.publishing")


def _run(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


async def _do_publish_scheduled():
    from ..database import AsyncSessionLocal
    from ..models.content import Content, ContentStatus
    from ..models.integration import Integration
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

            # Load user's OAuth integration for this platform
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
                logger.warning(f"No {platform} integration for user {content.user_id}")
                continue

            try:
                token = decrypt_token(integration.access_token)
                platform_user_id = integration.platform_user_id
                platform_meta = integration.scopes or {}

                success, post_id, error = await _publish_to_platform(
                    platform, token, content.content_text,
                    str(content.user_id), platform_user_id, platform_meta,
                )

                if success:
                    content.status = ContentStatus.published
                    content.published_at = datetime.utcnow()
                    content.platform_post_id = post_id
                    logger.info(f"Published {content.id} to {platform} (post_id={post_id})")
                else:
                    content.status = ContentStatus.failed
                    content.error_message = error
                    logger.error(f"Failed to publish {content.id} to {platform}: {error}")

            except Exception as e:
                content.status = ContentStatus.failed
                content.error_message = str(e)[:500]
                logger.error(f"Publishing exception for {content.id}: {e}")

        await db.commit()


async def _publish_to_platform(
    platform: str,
    token: str,
    text: str,
    user_id: str,
    platform_user_id: str = None,
    platform_meta: dict = None,
) -> tuple[bool, str | None, str | None]:
    """Returns (success, post_id, error_message)."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            if platform == "linkedin":
                return await _publish_linkedin(client, token, text, platform_user_id)
            elif platform == "twitter":
                return await _publish_twitter(client, token, text)
            elif platform == "instagram":
                return await _publish_instagram(client, token, text, platform_meta or {})
            else:
                return False, None, f"Publishing not supported for {platform}"
    except Exception as e:
        return False, None, str(e)


async def _publish_linkedin(
    client: httpx.AsyncClient,
    token: str,
    text: str,
    platform_user_id: str = None,
) -> tuple[bool, str | None, str | None]:
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # Resolve person URN — use cached platform_user_id if available
    if not platform_user_id:
        me_resp = await client.get("https://api.linkedin.com/v2/me", headers=headers)
        if me_resp.status_code != 200:
            return False, None, f"Failed to fetch LinkedIn profile: {me_resp.status_code}"
        platform_user_id = me_resp.json().get("id")

    author_urn = f"urn:li:person:{platform_user_id}"

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
        headers=headers,
        json=payload,
    )

    if resp.status_code == 201:
        post_id = resp.headers.get("x-restli-id", "")
        return True, post_id, None

    return False, None, f"LinkedIn error {resp.status_code}: {resp.text[:300]}"


async def _publish_twitter(
    client: httpx.AsyncClient,
    token: str,
    text: str,
) -> tuple[bool, str | None, str | None]:
    """
    Publish to Twitter v2. Handles threads by splitting on tweet numbering (1/n format).
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    # Detect if this is a thread (contains tweet numbering pattern)
    lines = text.strip().split("\n")
    tweets = _parse_thread(text)

    if len(tweets) <= 1:
        # Single tweet
        resp = await client.post(
            "https://api.twitter.com/2/tweets",
            headers=headers,
            json={"text": text[:280]},
        )
        if resp.status_code == 201:
            tweet_id = resp.json().get("data", {}).get("id", "")
            return True, tweet_id, None
        return False, None, f"Twitter error {resp.status_code}: {resp.text[:200]}"
    else:
        # Thread: post tweets sequentially, each replying to the previous
        first_id = None
        reply_to_id = None

        for i, tweet_text in enumerate(tweets):
            payload = {"text": tweet_text[:280]}
            if reply_to_id:
                payload["reply"] = {"in_reply_to_tweet_id": reply_to_id}

            resp = await client.post(
                "https://api.twitter.com/2/tweets",
                headers=headers,
                json=payload,
            )

            if resp.status_code != 201:
                return False, first_id, f"Thread tweet {i+1} failed: {resp.text[:200]}"

            tweet_id = resp.json().get("data", {}).get("id")
            if i == 0:
                first_id = tweet_id
            reply_to_id = tweet_id

        return True, first_id, None


def _parse_thread(text: str) -> list[str]:
    """
    Split a thread into individual tweets.
    Recognizes patterns like '1/n', '2/7', etc. or blank-line separated tweets.
    """
    import re

    # Split on tweet numbering pattern
    parts = re.split(r'\n\n(?=\d+/\d+)', text.strip())

    if len(parts) > 1:
        return [p.strip() for p in parts if p.strip()]

    # Fallback: split on double newline
    parts = [p.strip() for p in text.strip().split("\n\n") if p.strip()]
    return parts if len(parts) > 1 else [text]


async def _publish_instagram(
    client: httpx.AsyncClient,
    token: str,
    text: str,
    platform_meta: dict,
) -> tuple[bool, str | None, str | None]:
    """
    Instagram publishing via Facebook Graph API.
    Requires instagram_business_account_id stored in integration scopes/metadata.

    The flow:
    1. Create a text-only media container (caption only — Instagram requires an image
       for visual posts, but for caption-only brand posts we use a single-image workaround).
    2. For caption-only posts: requires a media URL. Without one, we attempt a Story text post.

    Note: Instagram's Graph API does not support caption-only posts without media.
    We store the limitation clearly rather than silently failing.
    """
    account_id = platform_meta.get("instagram_business_account_id") or platform_meta.get("page_id")

    if not account_id:
        return (
            False,
            None,
            "Instagram requires instagram_business_account_id in integration metadata. "
            "Please reconnect Instagram with a Business account.",
        )

    # For caption posts we need a media URL — use a plain 1x1 transparent placeholder
    # This is a known limitation of Instagram's API for text-only content
    PLACEHOLDER_IMAGE = "https://via.placeholder.com/1080x1080.png?text=."

    # Step 1: Create media container
    container_resp = await client.post(
        f"https://graph.facebook.com/v18.0/{account_id}/media",
        params={
            "image_url": PLACEHOLDER_IMAGE,
            "caption": text[:2200],
            "access_token": token,
        },
    )

    if container_resp.status_code != 200:
        return (
            False,
            None,
            f"Instagram container creation failed: {container_resp.text[:300]}",
        )

    container_id = container_resp.json().get("id")
    if not container_id:
        return False, None, "Instagram: no container ID returned"

    # Step 2: Publish the container
    publish_resp = await client.post(
        f"https://graph.facebook.com/v18.0/{account_id}/media_publish",
        params={
            "creation_id": container_id,
            "access_token": token,
        },
    )

    if publish_resp.status_code == 200:
        post_id = publish_resp.json().get("id", "")
        return True, post_id, None

    return (
        False,
        None,
        f"Instagram publish failed: {publish_resp.text[:300]}",
    )


@celery_app.task(name="publishing.publish_scheduled_content")
def publish_scheduled_content():
    """Check for approved scheduled content and publish it."""
    _run(_do_publish_scheduled())
