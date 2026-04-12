"""
Analytics tasks — automated post-performance fetching from social platforms.

Runs every 4 hours for published content to pull real engagement numbers.
Supports LinkedIn and Twitter (the platforms we can publish to with OAuth tokens).
"""
import asyncio
import logging
from datetime import datetime, timedelta

import httpx

from .celery_app import celery_app

logger = logging.getLogger("cozyjet.analytics")


def _run(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


async def _do_refresh_analytics():
    from ..database import AsyncSessionLocal
    from ..models.content import Content, ContentStatus
    from ..models.analytics import PostAnalytics
    from ..models.integration import Integration
    from ..services.encryption_service import decrypt_token
    from sqlalchemy.future import select
    from sqlalchemy import desc

    async with AsyncSessionLocal() as db:
        # Only fetch analytics for content published in the last 90 days
        since = datetime.utcnow() - timedelta(days=90)
        stmt = (
            select(Content)
            .where(
                Content.status == ContentStatus.published,
                Content.published_at >= since,
                Content.platform_post_id.isnot(None),
            )
            .limit(200)
        )
        result = await db.execute(stmt)
        published_items = result.scalars().all()

        if not published_items:
            return

        # Group by user_id and platform for efficient token lookup
        by_user_platform: dict = {}
        for item in published_items:
            key = (str(item.user_id), item.platform.value)
            if key not in by_user_platform:
                by_user_platform[key] = []
            by_user_platform[key].append(item)

        for (user_id, platform), items in by_user_platform.items():
            # Load the user's integration token for this platform
            intg_stmt = select(Integration).where(
                Integration.user_id == user_id,
                Integration.platform == platform,
                Integration.is_active == True,
            )
            intg_result = await db.execute(intg_stmt)
            integration = intg_result.scalar_one_or_none()

            if not integration:
                continue

            try:
                token = decrypt_token(integration.access_token)
            except Exception:
                continue

            async with httpx.AsyncClient(timeout=30) as client:
                for content in items:
                    try:
                        metrics = await _fetch_metrics(
                            client, platform, token, content.platform_post_id
                        )
                        if not metrics:
                            continue

                        views = metrics.get("impressions", 0) or metrics.get("views", 0)
                        likes = metrics.get("likes", 0) or metrics.get("likeCount", 0)
                        comments = metrics.get("comments", 0) or metrics.get("commentCount", 0)
                        shares = metrics.get("shares", 0) or metrics.get("shareCount", 0)
                        engagement_rate = (
                            round(((likes + comments + shares) / views * 100), 2)
                            if views > 0 else 0.0
                        )

                        # Upsert analytics record
                        existing_stmt = select(PostAnalytics).where(
                            PostAnalytics.content_id == content.id,
                            PostAnalytics.platform == platform,
                        )
                        existing_result = await db.execute(existing_stmt)
                        existing = existing_result.scalar_one_or_none()

                        if existing:
                            existing.views = views
                            existing.likes = likes
                            existing.comments = comments
                            existing.shares = shares
                            existing.engagement_rate = engagement_rate
                            existing.fetched_at = datetime.utcnow()
                        else:
                            new_analytics = PostAnalytics(
                                content_id=content.id,
                                platform=platform,
                                views=views,
                                likes=likes,
                                comments=comments,
                                shares=shares,
                                engagement_rate=engagement_rate,
                                fetched_at=datetime.utcnow(),
                            )
                            db.add(new_analytics)

                    except Exception as e:
                        logger.warning(
                            f"Analytics fetch failed [{platform}/{content.platform_post_id}]: {e}"
                        )
                        continue

        await db.commit()


async def _fetch_metrics(
    client: httpx.AsyncClient,
    platform: str,
    token: str,
    post_id: str,
) -> dict | None:
    """Fetch engagement metrics for a single published post."""
    try:
        if platform == "linkedin":
            return await _fetch_linkedin_metrics(client, token, post_id)
        elif platform == "twitter":
            return await _fetch_twitter_metrics(client, token, post_id)
        else:
            return None
    except Exception as e:
        logger.debug(f"Metric fetch error [{platform}]: {e}")
        return None


async def _fetch_linkedin_metrics(
    client: httpx.AsyncClient, token: str, post_id: str
) -> dict | None:
    """
    LinkedIn UGC Post analytics via the Social Actions API.
    Returns impressions, likes, comments, shares.
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "LinkedIn-Version": "202304",
    }

    # Fetch social actions (likes, comments, shares)
    actions_url = f"https://api.linkedin.com/v2/socialActions/{post_id}"
    resp = await client.get(actions_url, headers=headers)

    if resp.status_code != 200:
        return None

    data = resp.json()
    likes = data.get("likesSummary", {}).get("totalLikes", 0)
    comments = data.get("commentsSummary", {}).get("totalFirstLevelComments", 0)
    shares = data.get("sharesSummary", {}).get("totalShares", 0)

    # Fetch impressions via statistics endpoint
    impressions = 0
    stats_url = (
        f"https://api.linkedin.com/v2/organizationalEntityShareStatistics"
        f"?q=organizationalEntity&organizationalEntity={post_id}"
    )
    stats_resp = await client.get(stats_url, headers=headers)
    if stats_resp.status_code == 200:
        stats_data = stats_resp.json()
        elements = stats_data.get("elements", [])
        if elements:
            impressions = elements[0].get("totalShareStatistics", {}).get("impressionCount", 0)

    return {
        "impressions": impressions,
        "likes": likes,
        "comments": comments,
        "shares": shares,
    }


async def _fetch_twitter_metrics(
    client: httpx.AsyncClient, token: str, tweet_id: str
) -> dict | None:
    """
    Twitter v2 Tweet metrics.
    Returns impression_count, like_count, reply_count, retweet_count.
    """
    resp = await client.get(
        f"https://api.twitter.com/2/tweets/{tweet_id}",
        headers={"Authorization": f"Bearer {token}"},
        params={
            "tweet.fields": "public_metrics,non_public_metrics",
        },
    )

    if resp.status_code != 200:
        return None

    data = resp.json().get("data", {})
    public = data.get("public_metrics", {})
    non_public = data.get("non_public_metrics", {})

    return {
        "views": non_public.get("impression_count", 0) or public.get("impression_count", 0),
        "likes": public.get("like_count", 0),
        "comments": public.get("reply_count", 0),
        "shares": public.get("retweet_count", 0) + public.get("quote_count", 0),
    }


@celery_app.task(name="analytics.refresh_all")
def analytics_refresh_all():
    """Fetch fresh engagement metrics for all published content."""
    _run(_do_refresh_analytics())
