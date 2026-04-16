from app.tasks.celery_app import celery_app

@celery_app.task
def hunt_all_users():
    import asyncio
    from sqlalchemy import select
    from app.database import AsyncSessionLocal
    from app.models.user import User
    from app.models.content_seed import ContentSeed
    from app.models.conversation_opportunity import ConversationOpportunity
    from app.agents.skippy_agent import hunt_conversations

    async def run():
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(User).where(User.onboarding_complete == True)
            )
            users = result.scalars().all()
            for user in users:
                try:
                    seeds_result = await db.execute(
                        select(ContentSeed)
                        .where(ContentSeed.user_id == user.id)
                        .order_by(ContentSeed.created_at.desc())
                        .limit(3)
                    )
                    recent = [{"title": s.title} for s in seeds_result.scalars().all()]
                    opps = await hunt_conversations(user.growth_profile, recent)
                    for o in opps:
                        db.add(ConversationOpportunity(
                            user_id=user.id,
                            platform=o.get("platform", "twitter"),
                            thread_url=o.get("url", ""),
                            thread_title=o.get("topic", ""),
                            drafted_reply=o.get("drafted_reply", ""),
                            relevance_score=o.get("relevance_score", 50),
                            opportunity_reason=o.get("why_this_works", "")
                        ))
                    await db.commit()
                except Exception as e:
                    print(f"Hunt failed for user {user.id}: {e}")

    asyncio.run(run())
