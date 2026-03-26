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

@router.get("/variations/{seed_id}")
async def get_variations(
    seed_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the 3 variations (Storytelling, Technical, Outcomes) for a seed.
    """
    stmt = select(Content).where(
        Content.seed_id == seed_id,
        Content.user_id == current_user.id
    ).order_by(Content.variation_index)
    
    result = await db.execute(stmt)
    variations = result.scalars().all()
    
    if not variations:
        raise HTTPException(status_code=404, detail="No variations found for this seed")
        
    return [
        {
            "id": v.id,
            "text": v.content_text,
            "type": v.content_type or ("Storytelling" if v.variation_index == 0 else "Technical" if v.variation_index == 1 else "Outcomes"),
            "index": v.variation_index,
            "status": v.status
        } for v in variations
    ]

@router.patch("/{content_id}")
async def update_content(
    content_id: uuid.UUID,
    text: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update the text of a draft before approving."""
    stmt = select(Content).where(Content.id == content_id, Content.user_id == current_user.id)
    result = await db.execute(stmt)
    content = result.scalars().first()
    
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
        
    content.content_text = text
    content.updated_at = datetime.utcnow()
    await db.commit()
    return {"status": "success", "content_text": content.content_text}

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
