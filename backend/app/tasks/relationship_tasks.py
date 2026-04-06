"""
Relationship Engine Tasks
─────────────────────────────────────────────────────────────────
relationship_engine — Runs daily at 9AM UTC.
                      Identifies new targets from recent post engagements.
                      Updates stage for existing targets.
                      Pushes next action for each active relationship sequence.

conversation_hunt   — Runs daily at 7AM UTC alongside morning digest.
                      Uses the conversation hunter to find 5 reply opportunities
                      per user and saves them to conversation_opportunities.
"""
import json
import logging
from .celery_app import celery_app

logger = logging.getLogger("cozyjet.relationship_tasks")


@celery_app.task(name="relationships.run_engine")
def relationship_engine():
    """Daily 9AM: update relationship pipeline for all active users."""
    import asyncio
    asyncio.run(_relationship_engine_async())


async def _relationship_engine_async():
    from ..database import AsyncSessionLocal
    from ..models.user import User
    from ..models.relationship import RelationshipTarget, RelationshipStage
    from ..models.content import Content, ContentStatus
    from sqlalchemy.future import select
    from datetime import datetime, timedelta

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.onboarding_complete == True))
        users = result.scalars().all()

        for user in users:
            try:
                # Update stages for targets with recent engagement
                targets_result = await db.execute(
                    select(RelationshipTarget).where(RelationshipTarget.user_id == user.id)
                )
                targets = targets_result.scalars().all()

                for target in targets:
                    if (
                        target.engagement_count >= 3
                        and target.relationship_stage == RelationshipStage.identified
                    ):
                        target.relationship_stage = RelationshipStage.warming
                        db.add(target)
                    elif (
                        target.engagement_count >= 6
                        and target.relationship_stage == RelationshipStage.warming
                    ):
                        target.relationship_stage = RelationshipStage.engaged
                        db.add(target)

                    # Push next action notification for active targets
                    if target.relationship_stage in (
                        RelationshipStage.warming,
                        RelationshipStage.engaged,
                    ):
                        await _push_ws(str(user.id), {
                            "type": "relationship_action_required",
                            "target_username": target.target_username,
                            "target_platform": target.target_platform,
                            "current_stage": target.relationship_stage,
                            "engagement_count": target.engagement_count,
                        })

            except Exception as e:
                logger.error(f"Relationship engine failed for user {user.id}: {e}")

        await db.commit()
    logger.info("Relationship engine task complete")


@celery_app.task(name="relationships.hunt_conversations")
def hunt_conversations_task():
    """Daily 7AM: find conversation opportunities for all active users."""
    import asyncio
    asyncio.run(_hunt_conversations_async())


async def _hunt_conversations_async():
    from ..database import AsyncSessionLocal
    from ..models.user import User
    from ..models.content import Content, ContentStatus
    from ..models.conversation_opportunity import ConversationOpportunity
    from ..services.conversation_hunter import hunt_conversations
    from sqlalchemy.future import select
    from datetime import datetime, timedelta

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.onboarding_complete == True))
        users = result.scalars().all()

        for user in users:
            growth_profile = user.growth_profile or {}
            if not growth_profile.get("niche"):
                continue

            try:
                # Get last 3 published posts for context
                posts_result = await db.execute(
                    select(Content)
                    .where(Content.user_id == user.id)
                    .where(Content.status == ContentStatus.published)
                    .order_by(Content.published_at.desc())
                    .limit(3)
                )
                recent_posts = posts_result.scalars().all()
                recent_content = [
                    {"title": p.hook or p.content_text[:80], "platform": p.platform}
                    for p in recent_posts
                ]

                opportunities = await hunt_conversations(growth_profile, recent_content)

                for opp in opportunities:
                    record = ConversationOpportunity(
                        user_id=user.id,
                        platform=opp["platform"],
                        thread_url=opp["thread_url"],
                        thread_title=opp["thread_title"],
                        original_post=opp["original_post"],
                        drafted_reply=opp["drafted_reply"],
                        relevance_score=opp["relevance_score"],
                        opportunity_reason=opp["opportunity_reason"],
                    )
                    db.add(record)

                if opportunities:
                    await _push_ws(str(user.id), {
                        "type": "new_opportunities",
                        "count": len(opportunities),
                        "message": f"Skippy found {len(opportunities)} conversation opportunities for you today",
                    })

            except Exception as e:
                logger.error(f"Conversation hunt failed for user {user.id}: {e}")

        await db.commit()
    logger.info("Conversation hunt task complete")


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
