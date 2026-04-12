"""
Snooks Celery Tasks
─────────────────────────────────────────────────────────────────
run_growth_experiment  — Every Monday 8AM UTC: analyze top/bottom performers,
                         form hypothesis, design A/B test, save to experiments
weekly_strategy        — Every Sunday 8PM UTC: generate 7-day content plan for all users
morning_digest         — Called from skippy_tasks at 7AM: Snooks reviews calendar gaps
"""
import logging
from .celery_app import celery_app

logger = logging.getLogger("cozyjet.snooks_tasks")


@celery_app.task(name="snooks.run_growth_experiment")
def run_growth_experiment():
    """
    Weekly: form a hypothesis about top/bottom content performance,
    design a test, save to experiments table.
    """
    import asyncio
    asyncio.run(_run_growth_experiment_async())


async def _run_growth_experiment_async():
    from ..database import AsyncSessionLocal
    from ..models.user import User
    from ..models.analytics import PostAnalytics
    from ..models.experiment import Experiment
    from ..agents.snooks import snooks_agent
    from sqlalchemy.future import select
    from datetime import datetime, timedelta

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.onboarding_complete == True))
        users = result.scalars().all()

        for user in users:
            try:
                cutoff = datetime.utcnow() - timedelta(days=14)
                analytics_result = await db.execute(
                    select(PostAnalytics)
                    .where(PostAnalytics.user_id == user.id)
                    .where(PostAnalytics.recorded_at >= cutoff)
                    .order_by(PostAnalytics.engagement_rate.desc())
                )
                all_analytics = analytics_result.scalars().all()

                if len(all_analytics) < 4:
                    continue

                top = [
                    {"platform": a.platform, "engagement_rate": float(a.engagement_rate or 0)}
                    for a in all_analytics[:3]
                ]
                bottom = [
                    {"platform": a.platform, "engagement_rate": float(a.engagement_rate or 0)}
                    for a in all_analytics[-3:]
                ]

                hypothesis_data = await snooks_agent.form_growth_hypothesis(
                    top_performers=top,
                    bottom_performers=bottom,
                    voice_profile=user.voice_profile,
                )

                if hypothesis_data.get("hypothesis"):
                    experiment = Experiment(
                        user_id=user.id,
                        hypothesis=hypothesis_data["hypothesis"],
                        content_variable=hypothesis_data.get("supporting_evidence", "")[:255],
                        started_at=datetime.utcnow(),
                        applied_to_profile=False,
                    )
                    db.add(experiment)

            except Exception as e:
                logger.error(f"Growth experiment failed for user {user.id}: {e}")

        await db.commit()
    logger.info("Weekly growth experiment task complete")


@celery_app.task(name="snooks.weekly_strategy")
def weekly_strategy():
    """
    Sunday 8PM UTC: generate a fresh 7-day content plan for all active users.
    Pushes result to each user's WebSocket channel.
    """
    import asyncio
    asyncio.run(_weekly_strategy_async())


async def _weekly_strategy_async():
    from ..database import AsyncSessionLocal
    from ..models.user import User
    from ..agents.snooks import snooks_agent
    from sqlalchemy.future import select

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.onboarding_complete == True))
        users = result.scalars().all()

        for user in users:
            try:
                strategy = await snooks_agent.suggest_content(
                    seeds_summary="",
                    trends_summary="",
                    analytics_summary="",
                    voice_profile=user.voice_profile,
                )
                await _push_ws(str(user.id), {
                    "type": "weekly_strategy_ready",
                    "strategy": strategy,
                })
            except Exception as e:
                logger.error(f"Weekly strategy failed for user {user.id}: {e}")

    logger.info("Weekly strategy task complete")


async def _push_ws(user_id: str, payload: dict):
    """Push a message to the user's WebSocket channel via Redis pub/sub."""
    import json
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
