from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User, Content, PostAnalytics, ContentStatus
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/summary")
async def get_analytics_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns high-level KPI cards for the dashboard.
    """
    # Total Posts Published
    stmt_total = select(func.count(Content.id)).where(
        Content.user_id == current_user.id,
        Content.status == ContentStatus.published
    )
    res_total = await db.execute(stmt_total)
    total_posts = res_total.scalar() or 0
    
    # Aggregated Stats
    stmt_stats = select(
        func.sum(PostAnalytics.views).label("views"),
        func.sum(PostAnalytics.likes).label("likes"),
        func.sum(PostAnalytics.comments).label("comments"),
        func.sum(PostAnalytics.shares).label("shares")
    ).join(Content).where(Content.user_id == current_user.id)
    
    res_stats = await db.execute(stmt_stats)
    stats = res_stats.first()
    
    # Calculate Engagement Rate (Mocked baseline for now)
    total_engagement = (stats.likes or 0) + (stats.comments or 0) + (stats.shares or 0)
    engagement_rate = (total_engagement / (stats.views or 1)) * 100 if stats.views else 0.0

    return {
        "kpis": [
            {"label": "Total Impressions", "value": f"{stats.views or 0:,}", "trend": "+12.5%", "status": "up"},
            {"label": "Engagement", "value": f"{total_engagement:,}", "trend": "+8.2%", "status": "up"},
            {"label": "Engagement Rate", "value": f"{engagement_rate:.2f}%", "trend": "-1.1%", "status": "down"},
            {"label": "Posts Published", "value": f"{total_posts}", "trend": "+33.3%", "status": "up"}
        ]
    }

@router.get("/variation-performance")
async def get_variation_performance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compares how the 3 Meta Variations are performing.
    0: Storytelling, 1: Technical, 2: Outcomes
    """
    perf = []
    labels = ["Emotional Storytelling", "Deeply Technical", "Measurable Outcomes"]
    
    for i in range(3):
        stmt = select(func.avg(PostAnalytics.engagement_rate)).join(Content).where(
            Content.user_id == current_user.id,
            Content.variation_index == i
        )
        res = await db.execute(stmt)
        avg_er = res.scalar() or 0.0
        perf.append({"label": labels[i], "score": round(avg_er, 2)})
        
    return perf

@router.get("/recent")
async def get_recent_performance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns the last 5 posts and their stats."""
    stmt = select(Content, PostAnalytics).outerjoin(PostAnalytics).where(
        Content.user_id == current_user.id,
        Content.status == ContentStatus.published
    ).order_by(Content.published_at.desc()).limit(5)
    
    res = await db.execute(stmt)
    rows = res.all()
    
    return [
        {
            "id": row.Content.id,
            "platform": row.Content.platform,
            "text": row.Content.content_text[:60] + "...",
            "variation": row.Content.variation_index,
            "stats": {
                "views": row.PostAnalytics.views if row.PostAnalytics else 0,
                "likes": row.PostAnalytics.likes if row.PostAnalytics else 0,
                "comments": row.PostAnalytics.comments if row.PostAnalytics else 0
            }
        } for row in rows
    ]
