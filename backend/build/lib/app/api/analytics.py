from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..models.analytics import PostAnalytics
from ..models.content import Content, ContentStatus

router = APIRouter()


@router.post("/track")
async def track_analytics(
    payload: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content_id = payload.get("content_id")
    if not content_id:
        raise HTTPException(status_code=400, detail="content_id is required")

    stmt = select(Content).where(Content.id == UUID(content_id), Content.user_id == user.id)
    result = await db.execute(stmt)
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    views = int(payload.get("views", 0))
    likes = int(payload.get("likes", 0))
    comments = int(payload.get("comments", 0))
    shares = int(payload.get("shares", 0))
    engagement_rate = round(((likes + comments + shares) / views * 100) if views > 0 else 0.0, 2)

    existing_stmt = select(PostAnalytics).where(
        PostAnalytics.content_id == UUID(content_id),
        PostAnalytics.platform == payload.get("platform", content.platform.value),
    )
    existing_result = await db.execute(existing_stmt)
    existing = existing_result.scalar_one_or_none()

    if existing:
        existing.views = views
        existing.likes = likes
        existing.comments = comments
        existing.shares = shares
        existing.engagement_rate = engagement_rate
        existing.fetched_at = datetime.utcnow()
        analytics = existing
    else:
        analytics = PostAnalytics(
            content_id=UUID(content_id),
            platform=payload.get("platform", content.platform.value),
            views=views,
            likes=likes,
            comments=comments,
            shares=shares,
            engagement_rate=engagement_rate,
            fetched_at=datetime.utcnow(),
        )
        db.add(analytics)

    if views > 0 or likes > 0:
        content.status = ContentStatus.published
        content.published_at = content.published_at or datetime.utcnow()

    await db.commit()
    await db.refresh(analytics)

    return {
        "id": str(analytics.id),
        "content_id": str(analytics.content_id),
        "platform": analytics.platform,
        "views": analytics.views,
        "likes": analytics.likes,
        "comments": analytics.comments,
        "shares": analytics.shares,
        "engagement_rate": analytics.engagement_rate,
        "fetched_at": analytics.fetched_at.isoformat(),
    }


@router.get("/content/{content_id}")
async def get_content_analytics(
    content_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content_stmt = select(Content).where(Content.id == UUID(content_id), Content.user_id == user.id)
    content_result = await db.execute(content_stmt)
    content = content_result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    stmt = select(PostAnalytics).where(PostAnalytics.content_id == UUID(content_id))
    result = await db.execute(stmt)
    rows = result.scalars().all()

    return [
        {
            "id": str(a.id),
            "platform": a.platform,
            "views": a.views,
            "likes": a.likes,
            "comments": a.comments,
            "shares": a.shares,
            "engagement_rate": a.engagement_rate,
            "fetched_at": a.fetched_at.isoformat(),
        }
        for a in rows
    ]


@router.get("/summary")
async def get_analytics_summary(
    days: int = 30,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.utcnow() - timedelta(days=days)

    content_stmt = select(Content).where(
        Content.user_id == user.id,
        Content.created_at >= since,
    )
    content_result = await db.execute(content_stmt)
    content_items = content_result.scalars().all()
    content_ids = [c.id for c in content_items]

    if not content_ids:
        return {
            "period_days": days,
            "total_posts": 0,
            "total_views": 0,
            "total_likes": 0,
            "total_comments": 0,
            "total_shares": 0,
            "avg_engagement_rate": 0.0,
            "by_platform": {},
        }

    analytics_stmt = select(PostAnalytics).where(PostAnalytics.content_id.in_(content_ids))
    analytics_result = await db.execute(analytics_stmt)
    analytics = analytics_result.scalars().all()

    total_views = sum(a.views for a in analytics)
    total_likes = sum(a.likes for a in analytics)
    total_comments = sum(a.comments for a in analytics)
    total_shares = sum(a.shares for a in analytics)
    avg_engagement = round(
        sum(a.engagement_rate for a in analytics) / len(analytics) if analytics else 0.0,
        2,
    )

    by_platform: dict = {}
    for a in analytics:
        p = a.platform
        if p not in by_platform:
            by_platform[p] = {"views": 0, "likes": 0, "comments": 0, "shares": 0, "posts": 0}
        by_platform[p]["views"] += a.views
        by_platform[p]["likes"] += a.likes
        by_platform[p]["comments"] += a.comments
        by_platform[p]["shares"] += a.shares
        by_platform[p]["posts"] += 1

    return {
        "period_days": days,
        "total_posts": len(content_ids),
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "avg_engagement_rate": avg_engagement,
        "by_platform": by_platform,
    }


@router.get("/top-performing")
async def get_top_performing(
    limit: int = 10,
    days: int = 30,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.utcnow() - timedelta(days=days)

    content_stmt = select(Content).where(
        Content.user_id == user.id,
        Content.created_at >= since,
    )
    content_result = await db.execute(content_stmt)
    content_items = content_result.scalars().all()
    content_ids = [c.id for c in content_items]
    content_map = {c.id: c for c in content_items}

    if not content_ids:
        return []

    analytics_stmt = (
        select(PostAnalytics)
        .where(PostAnalytics.content_id.in_(content_ids))
        .order_by(PostAnalytics.engagement_rate.desc())
        .limit(limit)
    )
    analytics_result = await db.execute(analytics_stmt)
    analytics = analytics_result.scalars().all()

    return [
        {
            "analytics_id": str(a.id),
            "content_id": str(a.content_id),
            "platform": a.platform,
            "preview": (content_map[a.content_id].content_text[:120] + "...")
            if a.content_id in content_map
            else "",
            "views": a.views,
            "likes": a.likes,
            "comments": a.comments,
            "shares": a.shares,
            "engagement_rate": a.engagement_rate,
        }
        for a in analytics
    ]


@router.delete("/{analytics_id}")
async def delete_analytics(
    analytics_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(PostAnalytics).where(PostAnalytics.id == UUID(analytics_id))
    result = await db.execute(stmt)
    analytics = result.scalar_one_or_none()
    if not analytics:
        raise HTTPException(status_code=404, detail="Analytics record not found")

    content_stmt = select(Content).where(
        Content.id == analytics.content_id, Content.user_id == user.id
    )
    content_result = await db.execute(content_stmt)
    if not content_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Forbidden")

    await db.delete(analytics)
    await db.commit()
    return {"success": True}
