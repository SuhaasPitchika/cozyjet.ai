from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.content import Content, ContentStatus
from app.models.content_seed import ContentSeed
from app.models.conversation_opportunity import ConversationOpportunity

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
async def summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total = (
        await db.execute(select(func.count(Content.id)).where(Content.user_id == current_user.id))
    ).scalar()

    published = (
        await db.execute(
            select(func.count(Content.id)).where(
                Content.user_id == current_user.id,
                Content.status == ContentStatus.published,
            )
        )
    ).scalar()

    seeds = (
        await db.execute(select(func.count(ContentSeed.id)).where(ContentSeed.user_id == current_user.id))
    ).scalar()

    opps = (
        await db.execute(
            select(func.count(ConversationOpportunity.id)).where(
                ConversationOpportunity.user_id == current_user.id,
                ConversationOpportunity.status == "pending",
            )
        )
    ).scalar()

    return {
        "total_content_generated": total,
        "published_posts": published,
        "total_seeds": seeds,
        "pending_opportunities": opps,
        "onboarding_complete": current_user.onboarding_complete,
        "voice_observations": len(
            (current_user.voice_profile or {}).get("observations", [])
        ),
    }
