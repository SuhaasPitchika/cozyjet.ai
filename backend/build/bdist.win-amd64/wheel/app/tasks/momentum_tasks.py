"""
Momentum Detection Tasks
─────────────────────────────────────────────────────────────────
check_momentum  — Runs every 15 minutes.
                  Checks all posts published within the last 90 minutes.
                  Compares save rate, comment rate, profile visits against
                  the user's personal baseline.
                  Triggers a WebSocket alert when momentum score > 50.
"""
import json
import logging
from .celery_app import celery_app

logger = logging.getLogger("cozyjet.momentum_tasks")


@celery_app.task(name="momentum.check_all")
def check_momentum():
    """Every 15 minutes: scan recent posts for momentum signals."""
    import asyncio
    asyncio.run(_check_momentum_async())


async def _check_momentum_async():
    from ..database import AsyncSessionLocal
    from ..models.content import Content, ContentStatus
    from ..models.analytics import PostAnalytics
    from ..models.user import User
    from ..services.momentum_detector import (
        compute_momentum_score,
        generate_amplification_actions,
        build_momentum_alert,
    )
    from sqlalchemy.future import select
    from datetime import datetime, timedelta

    cutoff = datetime.utcnow() - timedelta(minutes=90)

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Content)
            .where(Content.status == ContentStatus.published)
            .where(Content.published_at >= cutoff)
        )
        recent_posts = result.scalars().all()

        for post in recent_posts:
            try:
                # Get latest analytics for this post
                analytics_result = await db.execute(
                    select(PostAnalytics)
                    .where(PostAnalytics.content_id == post.id)
                    .order_by(PostAnalytics.recorded_at.desc())
                    .limit(1)
                )
                analytics = analytics_result.scalar_one_or_none()
                if not analytics:
                    continue

                # Get user for baseline and niche context
                user_result = await db.execute(
                    select(User).where(User.id == post.user_id)
                )
                user = user_result.scalar_one_or_none()
                if not user:
                    continue

                minutes_since = int(
                    (datetime.utcnow() - post.published_at).total_seconds() / 60
                )

                current_metrics = {
                    "saves": getattr(analytics, "saves", 0) or 0,
                    "comments": getattr(analytics, "comments", 0) or 0,
                    "impressions": getattr(analytics, "impressions", 1) or 1,
                    "profile_visits": getattr(analytics, "profile_clicks", 0) or 0,
                    "minutes_since_publish": minutes_since,
                }

                # Simple baseline — in production this would be calculated from history
                baseline = {
                    "avg_save_rate": 0.01,
                    "avg_comment_rate": 0.005,
                    "avg_profile_visits_60m": 10,
                }

                score, signals = compute_momentum_score(current_metrics, baseline)

                if score > 50:
                    niche = (user.growth_profile or {}).get("niche", "your niche")
                    actions = await generate_amplification_actions(
                        post.content_text[:300],
                        signals,
                        niche,
                    )
                    alert = build_momentum_alert(
                        post_id=str(post.id),
                        post_preview=post.content_text[:100],
                        score=score,
                        signals=signals,
                        minutes_since_publish=minutes_since,
                        amplification_actions=actions,
                    )
                    await _push_ws(str(post.user_id), alert)
                    logger.info(
                        f"Momentum alert sent for post {post.id} (score={score})"
                    )

            except Exception as e:
                logger.error(f"Momentum check failed for post {post.id}: {e}")

    logger.info("Momentum check complete")


async def _push_ws(user_id: str, payload: dict):
    """Push a message to the user's WebSocket channel via Redis pub/sub."""
    try:
        import redis.asyncio as aioredis
        from ..config import settings
        if not settings.REDIS_URL:
            return
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await r.publish(f"ws_user:{user_id}", json.dumps(payload))
        await r.aclose()
    except Exception as e:
        logger.warning(f"WebSocket push failed for user {user_id}: {e}")
