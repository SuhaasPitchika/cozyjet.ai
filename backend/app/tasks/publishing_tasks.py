from app.tasks.celery_app import celery_app

@celery_app.task
def publish_due():
    import asyncio
    from datetime import datetime
    from sqlalchemy import select
    from app.database import AsyncSessionLocal
    from app.models.content import Content, ContentStatus

    async def run():
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Content).where(
                    Content.status == ContentStatus.scheduled,
                    Content.scheduled_time <= datetime.utcnow()
                )
            )
            due = result.scalars().all()
            for c in due:
                try:
                    c.status = ContentStatus.published
                    c.published_at = datetime.utcnow()
                except Exception as e:
                    c.status = ContentStatus.failed
                    c.error_message = str(e)
            await db.commit()

    asyncio.run(run())
