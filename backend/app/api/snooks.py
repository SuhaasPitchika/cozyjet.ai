import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..models.calendar import CalendarEntry, CalendarStatus
from ..models.trends import Trend
from ..models.content_seed import ContentSeed
from ..models.analytics import PostAnalytics
from ..agents.snooks import snooks_agent

router = APIRouter()


@router.post("/suggest")
async def suggest_content(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Last 14 days of seeds
    since_14d = datetime.utcnow() - timedelta(days=14)
    seeds_stmt = select(ContentSeed).where(ContentSeed.user_id == user.id, ContentSeed.created_at >= since_14d)
    seeds_result = await db.execute(seeds_stmt)
    seeds = seeds_result.scalars().all()
    seeds_summary = "\n".join([f"- [{s.source_type}] {s.title}: {s.description[:100]}" for s in seeds]) or "None"

    # Last 30 days of analytics
    from ..models.content import Content
    since_30d = datetime.utcnow() - timedelta(days=30)
    content_stmt = select(Content).where(Content.user_id == user.id, Content.created_at >= since_30d)
    content_result = await db.execute(content_stmt)
    content_items = content_result.scalars().all()
    content_ids = [c.id for c in content_items]

    analytics_summary = "None"
    if content_ids:
        analytics_stmt = select(PostAnalytics).where(PostAnalytics.content_id.in_(content_ids))
        analytics_result = await db.execute(analytics_stmt)
        analytics = analytics_result.scalars().all()
        if analytics:
            analytics_summary = "\n".join([
                f"- platform={a.platform} views={a.views} likes={a.likes} engagement={a.engagement_rate:.1f}%"
                for a in analytics[:10]
            ])

    # Top 10 trends
    trend_stmt = select(Trend).order_by(Trend.trend_score.desc()).limit(10)
    trend_result = await db.execute(trend_stmt)
    trends = trend_result.scalars().all()
    trends_summary = "\n".join([f"- {t.topic} ({t.platform}, score={t.trend_score})" for t in trends]) or "None"

    result = await snooks_agent.suggest_content(seeds_summary, trends_summary, analytics_summary)
    return {"suggestions": result.get("suggestions", [])}


@router.get("/calendar")
async def get_calendar(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(CalendarEntry).where(CalendarEntry.user_id == user.id).order_by(CalendarEntry.scheduled_time)
    result = await db.execute(stmt)
    entries = result.scalars().all()

    return [
        {
            "id": str(e.id),
            "platform": e.platform,
            "scheduled_time": e.scheduled_time.isoformat(),
            "status": e.status,
            "content_id": str(e.content_id) if e.content_id else None,
        }
        for e in entries
    ]


@router.post("/calendar/schedule")
async def schedule_content(payload: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    content_id = payload.get("content_id")
    platform = payload.get("platform")
    scheduled_time_str = payload.get("scheduled_time")

    if not all([content_id, platform, scheduled_time_str]):
        raise HTTPException(status_code=400, detail="content_id, platform, and scheduled_time are required")

    scheduled_time = datetime.fromisoformat(scheduled_time_str)

    entry = CalendarEntry(
        user_id=user.id,
        content_id=content_id,
        platform=platform,
        scheduled_time=scheduled_time,
        status=CalendarStatus.scheduled,
    )
    db.add(entry)

    # Also update content status
    from ..models.content import Content
    from uuid import UUID
    content_stmt = select(Content).where(Content.id == UUID(content_id), Content.user_id == user.id)
    content_result = await db.execute(content_stmt)
    content = content_result.scalar_one_or_none()
    if content:
        from ..models.content import ContentStatus
        content.status = ContentStatus.scheduled
        content.scheduled_time = scheduled_time

    await db.commit()
    return {"success": True, "scheduled_time": scheduled_time.isoformat()}


@router.get("/trends")
async def get_trends(platform: str = "twitter", db: AsyncSession = Depends(get_db)):
    stmt = select(Trend).where(Trend.platform == platform).order_by(Trend.trend_score.desc()).limit(10)
    result = await db.execute(stmt)
    trends = result.scalars().all()
    return [{"id": str(t.id), "topic": t.topic, "score": t.trend_score, "keywords": t.related_keywords} for t in trends]


@router.get("/calendar/gaps")
async def calendar_gaps(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(CalendarEntry).where(CalendarEntry.user_id == user.id).order_by(CalendarEntry.scheduled_time)
    result = await db.execute(stmt)
    entries = result.scalars().all()
    scheduled = [{"platform": e.platform, "scheduled_time": e.scheduled_time.isoformat()} for e in entries]
    gap_analysis = await snooks_agent.analyze_calendar_gaps(scheduled)
    return gap_analysis
