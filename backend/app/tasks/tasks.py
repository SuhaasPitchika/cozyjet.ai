from .celery_app import celery_app
from ..database import AsyncSessionLocal
from ..models.content import Content, ContentStatus
from ..models.trends import Trend
from sqlalchemy.future import select
from datetime import datetime
import asyncio

# To run async code in Celery
def run_async(coro):
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(coro)

@celery_app.task(name="publish_scheduled_content")
def publish_scheduled_content():
    """Finds approved content ready to go live and pushes to platform API."""
    async def process():
        async with AsyncSessionLocal() as db:
            now = datetime.utcnow()
            stmt = select(Content).where(
                Content.status == ContentStatus.approved,
                Content.scheduled_time <= now
            )
            result = await db.execute(stmt)
            ready_posts = result.scalars().all()
            
            for post in ready_posts:
                try:
                    # Platform-specific publishing logic placeholder
                    # post_id = await platform_api_call(post.platform, post.content_text)
                    post.status = ContentStatus.published
                    post.published_at = datetime.utcnow()
                    post.platform_post_id = f"ext_{post.id}"
                except Exception as e:
                    post.status = ContentStatus.failed
                    post.error_message = str(e)
            
            await db.commit()
            
    return run_async(process())

@celery_app.task(name="detect_trends")
def detect_trends():
    """Scrapes/Filters trends for tech, design, and founder niches."""
    async def process():
        async with AsyncSessionLocal() as db:
            # Mock trends detection logic
            trends_to_add = [
                {"topic": "Next.js 15 Server Components", "platform": "twitter", "score": 92},
                {"topic": "AI-First SaaS growth", "platform": "linkedin", "score": 88},
                {"topic": "Claude 3.5 Sonnet Artifacts", "platform": "twitter", "score": 95},
            ]
            
            for t in trends_to_add:
                new_trend = Trend(
                    topic=t["topic"],
                    platform=t["platform"],
                    trend_score=t["score"],
                    detected_at=datetime.utcnow(),
                    expires_at=datetime.utcnow() # Expiry logic 24h
                )
                db.add(new_trend)
            
            await db.commit()
            
    return run_async(process())
