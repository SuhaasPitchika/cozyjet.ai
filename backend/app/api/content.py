from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User, Content, ContentStatus, ContentSeed
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/generate")
async def generate_content(
    seed_id: uuid.UUID,
    platforms: List[str],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Triggers Meta to generate variations for the given seed.
    (This usually triggers a Celery task or an AI agent call)
    """
    pass

@router.post("/{content_id}/approve")
async def approve_content(
    content_id: uuid.UUID,
    scheduled_time: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Content).where(Content.id == content_id, Content.user_id == current_user.id)
    result = await db.execute(stmt)
    content = result.scalars().first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
        
    content.status = ContentStatus.scheduled if scheduled_time else ContentStatus.approved
    if scheduled_time:
        content.scheduled_time = scheduled_time
        
    await db.commit()
    return {"message": "Content approved and scheduled", "status": content.status}

@router.get("/calendar")
async def get_calendar_content(
    start_date: datetime,
    end_date: datetime,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns all scheduled/published content for the calendar view."""
    stmt = select(Content).where(
        Content.user_id == current_user.id,
        Content.scheduled_time.between(start_date, end_date)
    )
    result = await db.execute(stmt)
    posts = result.scalars().all()
    
    return [
        {
            "id": p.id,
            "platform": p.platform,
            "text": p.content_text,
            "status": p.status,
            "scheduled_time": p.scheduled_time,
            "variation_index": p.variation_index
        } for p in posts
    ]

@router.get("/seeds")
async def get_user_seeds(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns the Skippy Feed seeds for the user."""
    stmt = select(ContentSeed).where(
        ContentSeed.user_id == current_user.id,
        ContentSeed.is_used == False
    ).order_by(ContentSeed.created_at.desc())
    
    result = await db.execute(stmt)
    seeds = result.scalars().all()
    return seeds
