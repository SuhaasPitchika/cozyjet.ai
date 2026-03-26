from .celery_app import celery_app
from ..database import AsyncSessionLocal
from ..models.user import User, Integration, ContentSeed
from ..services.integrations import IntegrationService
from ..agents.skippy import SkippyAgent
from sqlalchemy.future import select
from datetime import datetime
import asyncio

# To run async code in Celery
def run_async(coro):
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(coro)

@celery_app.task(name="skippy_sync_user_integrations")
def skippy_sync_user_integrations(user_id: str):
    """
    Background worker that fetches raw data from integrations 
    and turns them into content seeds via Skippy Agent.
    """
    async def process():
        async with AsyncSessionLocal() as db:
            # 1. Get user integrations
            stmt = select(Integration).where(Integration.user_id == user_id, Integration.is_active == True)
            result = await db.execute(stmt)
            integrations = result.scalars().all()
            
            integration_service = IntegrationService()
            skippy = SkippyAgent()
            
            for integration in integrations:
                # 2. Fetch raw activity
                activity_list = []
                if integration.platform == "github":
                    activity_list = await integration_service.fetch_github_activity(integration)
                
                # 3. Summarize and Save
                for activity in activity_list:
                    summary = await skippy.summarize_activity(activity)
                    new_seed = ContentSeed(
                        user_id=user_id,
                        title=summary["title"],
                        description=summary["description"],
                        source_platform=integration.platform,
                        source_url=activity.get("url"),
                        tags=summary.get("tags", []),
                        source_metadata=activity.get("metadata", {})
                    )
                    db.add(new_seed)
                
                integration.last_synced_at = datetime.utcnow()
            
            await db.commit()
            
    return run_async(process())
