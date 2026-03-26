from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..models.calendar import CalendarEntry, CalendarStatus
from ..models.trends import Trend
from ..models.content_seed import ContentSeed
from ..agents.snooks import snooks_agent
import json
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/calendar")
async def get_calendar(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(CalendarEntry).where(CalendarEntry.user_id == user.id)
    result = await db.execute(stmt)
    entries = result.scalars().all()
    
    return [
        {
            "id": e.id, 
            "platform": e.platform, 
            "scheduled_time": e.scheduled_time.isoformat(), 
            "status": e.status, 
            "content_id": e.content_id
        } for e in entries
    ]

@router.post("/suggest")
async def suggest_content(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Fetch user's recent seeds from last 14 days
    since = datetime.utcnow() - timedelta(days=14)
    stmt = select(ContentSeed).where(ContentSeed.user_id == user.id, ContentSeed.created_at >= since)
    result = await db.execute(stmt)
    seeds = result.scalars().all()
    
    seeds_summary = ", ".join([f"{s.source_type}: {s.title}" for s in seeds])
    
    # Fetch top trends
    trend_stmt = select(Trend).order_by(Trend.trend_score.desc()).limit(5)
    trend_result = await db.execute(trend_stmt)
    trends = trend_result.scalars().all()
    trends_summary = ", ".join([t.topic for t in trends])
    
    # Call Snooks Gemini Agent
    suggestions = await snooks_agent.suggest_content(seeds_summary, trends_summary)
    
    return {"suggestions": suggestions.get("suggestions", [])}

@router.get("/trends")
async def get_trends(platform: str = "twitter", db: AsyncSession = Depends(get_db)):
    stmt = select(Trend).where(Trend.platform == platform).order_by(Trend.trend_score.desc()).limit(10)
    result = await db.execute(stmt)
    trends = result.scalars().all()
    
    return [{"topic": t.topic, "score": t.trend_score, "keywords": t.related_keywords} for t in trends]
