"""
Snooks API — content strategy endpoints.
Passes full user voice profile to ensure grounded, non-generic suggestions.
"""
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..models.calendar import CalendarEntry, CalendarStatus
from ..models.trends import Trend
from ..models.content_seed import ContentSeed
from ..models.content import Content, ContentStatus
from ..models.analytics import PostAnalytics
from ..agents.snooks import snooks_agent

router = APIRouter()


@router.post("/suggest")
async def suggest_content(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate 5 data-grounded content recommendations.
    Loads 14 days of seeds, 30 days of analytics, and top 10 trends.
    Passes voice profile so suggestions are specific to this person.
    """
    # Last 14 days of seeds
    since_14d = datetime.utcnow() - timedelta(days=14)
    seeds_stmt = (
        select(ContentSeed)
        .where(ContentSeed.user_id == user.id, ContentSeed.created_at >= since_14d)
        .order_by(desc(ContentSeed.created_at))
        .limit(30)
    )
    seeds_result = await db.execute(seeds_stmt)
    seeds = seeds_result.scalars().all()
    seeds_summary = "\n".join([
        f"- [{s.source_platform}] {s.title}: {s.description[:120]}"
        for s in seeds
    ]) or "None yet."

    # Last 30 days of analytics
    since_30d = datetime.utcnow() - timedelta(days=30)
    content_stmt = select(Content).where(
        Content.user_id == user.id,
        Content.created_at >= since_30d,
    )
    content_result = await db.execute(content_stmt)
    content_items = content_result.scalars().all()
    content_ids = [c.id for c in content_items]
    content_map = {c.id: c for c in content_items}

    analytics_summary = "No analytics data yet."
    if content_ids:
        analytics_stmt = (
            select(PostAnalytics)
            .where(PostAnalytics.content_id.in_(content_ids))
            .order_by(desc(PostAnalytics.engagement_rate))
            .limit(20)
        )
        analytics_result = await db.execute(analytics_stmt)
        analytics = analytics_result.scalars().all()
        if analytics:
            lines = []
            for a in analytics:
                preview = ""
                if a.content_id in content_map:
                    preview = content_map[a.content_id].content_text[:60]
                lines.append(
                    f"- [{a.platform}] views={a.views} likes={a.likes} "
                    f"engagement={a.engagement_rate:.1f}% | '{preview}...'"
                )
            analytics_summary = "\n".join(lines)

    # Top 10 trends in the user's detected niches
    trend_stmt = (
        select(Trend)
        .order_by(desc(Trend.trend_score))
        .limit(10)
    )
    trend_result = await db.execute(trend_stmt)
    trends = trend_result.scalars().all()
    trends_summary = "\n".join([
        f"- {t.topic} (platform={t.platform}, score={t.trend_score}, "
        f"keywords={', '.join((t.related_keywords or [])[:3])})"
        for t in trends
    ]) or "None available."

    result = await snooks_agent.suggest_content(
        seeds_summary=seeds_summary,
        trends_summary=trends_summary,
        analytics_summary=analytics_summary,
        voice_profile=user.voice_profile or {},   # ← this was missing before
    )
    return {"suggestions": result.get("suggestions", [])}


@router.get("/calendar")
async def get_calendar(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CalendarEntry)
        .where(CalendarEntry.user_id == user.id)
        .order_by(CalendarEntry.scheduled_time)
    )
    result = await db.execute(stmt)
    entries = result.scalars().all()

    return [
        {
            "id": str(e.id),
            "platform": e.platform,
            "scheduled_time": e.scheduled_time.isoformat(),
            "status": e.status,
            "content_id": str(e.content_id) if e.content_id else None,
            "topic": e.topic if hasattr(e, "topic") else None,
        }
        for e in entries
    ]


@router.post("/calendar/schedule")
async def schedule_content(
    payload: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content_id = payload.get("content_id")
    platform = payload.get("platform")
    scheduled_time_str = payload.get("scheduled_time")

    if not all([content_id, platform, scheduled_time_str]):
        raise HTTPException(
            status_code=400,
            detail="content_id, platform, and scheduled_time are required",
        )

    scheduled_time = datetime.fromisoformat(scheduled_time_str)

    entry = CalendarEntry(
        user_id=user.id,
        content_id=content_id,
        platform=platform,
        scheduled_time=scheduled_time,
        status=CalendarStatus.scheduled,
    )
    db.add(entry)

    # Update content status to scheduled
    from ..models.content import Content
    from uuid import UUID
    content_stmt = select(Content).where(
        Content.id == UUID(content_id), Content.user_id == user.id
    )
    content_result = await db.execute(content_stmt)
    content = content_result.scalar_one_or_none()
    if content:
        from ..models.content import ContentStatus
        content.status = ContentStatus.scheduled
        content.scheduled_time = scheduled_time

    await db.commit()
    return {"success": True, "scheduled_time": scheduled_time.isoformat()}


@router.delete("/calendar/{entry_id}")
async def delete_calendar_entry(
    entry_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from uuid import UUID
    stmt = select(CalendarEntry).where(
        CalendarEntry.id == UUID(entry_id), CalendarEntry.user_id == user.id
    )
    result = await db.execute(stmt)
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Calendar entry not found")
    await db.delete(entry)
    await db.commit()
    return {"success": True}


@router.get("/trends")
async def get_trends(
    platform: str = None,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Trend)
    if platform:
        stmt = stmt.where(Trend.platform == platform)
    stmt = stmt.order_by(desc(Trend.trend_score)).limit(limit)
    result = await db.execute(stmt)
    trends = result.scalars().all()

    return [
        {
            "id": str(t.id),
            "topic": t.topic,
            "platform": t.platform,
            "score": t.trend_score,
            "keywords": t.related_keywords or [],
            "niche_tags": t.niche_tags if hasattr(t, "niche_tags") else [],
            "detected_at": t.detected_at.isoformat() if t.detected_at else None,
        }
        for t in trends
    ]


@router.get("/calendar/gaps")
async def calendar_gaps(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CalendarEntry)
        .where(CalendarEntry.user_id == user.id)
        .order_by(CalendarEntry.scheduled_time)
    )
    result = await db.execute(stmt)
    entries = result.scalars().all()
    scheduled = [
        {"platform": e.platform, "scheduled_time": e.scheduled_time.isoformat()}
        for e in entries
    ]

    # Load unused seeds to suggest topics for gaps
    seeds_stmt = (
        select(ContentSeed)
        .where(
            ContentSeed.user_id == user.id,
            ContentSeed.is_used == False,
            ContentSeed.is_dismissed == False,
        )
        .order_by(desc(ContentSeed.created_at))
        .limit(10)
    )
    seeds_result = await db.execute(seeds_stmt)
    seeds = seeds_result.scalars().all()
    seeds_summary = "\n".join([f"- {s.title}: {s.description[:80]}" for s in seeds]) or "None"

    gap_analysis = await snooks_agent.analyze_calendar_gaps(
        scheduled_content=scheduled,
        voice_profile=user.voice_profile or {},
        seeds_summary=seeds_summary,
    )
    return gap_analysis


@router.post("/experiment/evaluate")
async def evaluate_experiment(
    payload: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Evaluate a growth experiment hypothesis against actual results."""
    hypothesis = payload.get("hypothesis", "")
    results = payload.get("results", {})
    if not hypothesis:
        raise HTTPException(status_code=400, detail="hypothesis is required")

    evaluation = await snooks_agent.evaluate_experiment(hypothesis, results)
    return evaluation
