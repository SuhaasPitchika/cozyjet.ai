"""
Meta API — content generation endpoints.
Fetches top-performing opening hooks from analytics to ground hook generation.
"""
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from uuid import UUID

from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..models.content_seed import ContentSeed
from ..models.content import Content, ContentPlatform, ContentType, ContentStatus
from ..models.analytics import PostAnalytics
from ..models.trends import Trend
from ..models.tune_samples import TuneSample, TuneSampleSource
from ..agents.meta import meta_agent

router = APIRouter()


def _save_variations(user_id, seed_id, platform, variations, db_session):
    items = []
    for i, text in enumerate(variations[:3]):
        if not text.strip():
            continue
        c = Content(
            user_id=user_id,
            seed_id=seed_id,
            platform=ContentPlatform(platform),
            content_type=ContentType.post,
            content_text=text,
            variation_index=i,
            status=ContentStatus.draft,
        )
        db_session.add(c)
        items.append(c)
    return items


async def _get_top_hooks(user_id, platforms: list, db: AsyncSession, days: int = 90) -> list[str]:
    """
    Fetch the opening lines of the user's top-performing content across all platforms.
    These are passed to hook generation so it can match the user's proven style.
    """
    since = datetime.utcnow() - timedelta(days=days)
    content_stmt = (
        select(Content)
        .where(
            Content.user_id == user_id,
            Content.status == ContentStatus.published,
            Content.created_at >= since,
        )
        .limit(100)
    )
    content_result = await db.execute(content_stmt)
    content_items = content_result.scalars().all()

    if not content_items:
        return []

    content_ids = [c.id for c in content_items]
    content_map = {c.id: c for c in content_items}

    analytics_stmt = (
        select(PostAnalytics)
        .where(
            PostAnalytics.content_id.in_(content_ids),
            PostAnalytics.engagement_rate > 0,
        )
        .order_by(desc(PostAnalytics.engagement_rate))
        .limit(10)
    )
    analytics_result = await db.execute(analytics_stmt)
    top_analytics = analytics_result.scalars().all()

    hooks = []
    for a in top_analytics:
        if a.content_id in content_map:
            text = content_map[a.content_id].content_text
            first_line = text.split("\n")[0].strip()[:120]
            if first_line and first_line not in hooks:
                hooks.append(first_line)

    return hooks[:5]


@router.post("/generate")
async def generate(
    payload: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    seed_id = payload.get("seed_id")
    platforms = payload.get("platforms", ["linkedin", "twitter"])

    if not seed_id:
        raise HTTPException(status_code=400, detail="seed_id is required")

    stmt = select(ContentSeed).where(
        ContentSeed.id == UUID(seed_id),
        ContentSeed.user_id == user.id,
    )
    result = await db.execute(stmt)
    seed_obj = result.scalar_one_or_none()
    if not seed_obj:
        raise HTTPException(status_code=404, detail="Content seed not found")

    # Fetch user's top hooks from analytics — grounds hook generation in proven style
    top_hooks = await _get_top_hooks(user.id, platforms, db)

    seed = {
        "title": seed_obj.title,
        "description": seed_obj.description,
        "tags": (seed_obj.source_data or {}).get("tags", []),
        "story_hook": (seed_obj.source_data or {}).get("story_hook", ""),
    }

    generated = await meta_agent.generate_content(
        seed=seed,
        voice_profile=user.voice_profile or {},
        platforms=platforms,
        top_hooks=top_hooks,
    )

    created = []
    for platform, variations in generated.items():
        items = _save_variations(user.id, seed_obj.id, platform, variations, db)
        created.extend(items)

    seed_obj.is_used = True
    await db.commit()

    return {
        "generated": [
            {
                "id": str(c.id),
                "platform": c.platform,
                "text": c.content_text,
                "variation": c.variation_index,
            }
            for c in created
        ]
    }


@router.post("/generate-from-idea")
async def generate_from_idea(
    payload: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    topic = payload.get("topic", "").strip()
    platforms = payload.get("platforms", ["linkedin", "twitter"])
    if not topic:
        raise HTTPException(status_code=400, detail="topic is required")

    top_hooks = await _get_top_hooks(user.id, platforms, db)

    generated = await meta_agent.generate_from_idea(
        topic, user.voice_profile or {}, platforms
    )
    # Rerun with hooks if we got them (idea generation doesn't use hooks by default)
    if top_hooks and not generated:
        generated = await meta_agent.generate_from_idea(
            topic, user.voice_profile or {}, platforms
        )

    created = []
    for platform, variations in generated.items():
        items = _save_variations(user.id, None, platform, variations, db)
        created.extend(items)

    await db.commit()
    return {
        "generated": [
            {
                "id": str(c.id),
                "platform": c.platform,
                "text": c.content_text,
                "variation": c.variation_index,
            }
            for c in created
        ]
    }


@router.post("/generate-from-trend")
async def generate_from_trend(
    payload: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    trend_id = payload.get("trend_id")
    platforms = payload.get("platforms", ["linkedin", "twitter"])
    if not trend_id:
        raise HTTPException(status_code=400, detail="trend_id is required")

    stmt = select(Trend).where(Trend.id == UUID(trend_id))
    result = await db.execute(stmt)
    trend = result.scalar_one_or_none()
    if not trend:
        raise HTTPException(status_code=404, detail="Trend not found")

    top_hooks = await _get_top_hooks(user.id, platforms, db)
    trend_data = {"topic": trend.topic, "related_keywords": trend.related_keywords or []}

    generated = await meta_agent.generate_from_trend(
        trend_data, user.voice_profile or {}, platforms
    )

    created = []
    for platform, variations in generated.items():
        items = _save_variations(user.id, None, platform, variations, db)
        created.extend(items)

    await db.commit()
    return {
        "generated": [
            {
                "id": str(c.id),
                "platform": c.platform,
                "text": c.content_text,
                "variation": c.variation_index,
            }
            for c in created
        ]
    }


@router.post("/repurpose")
async def repurpose(
    payload: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    source_text = payload.get("source_text", "").strip()
    target_platforms = payload.get("target_platforms", ["linkedin", "twitter"])
    if not source_text:
        raise HTTPException(status_code=400, detail="source_text is required")

    generated = await meta_agent.repurpose(
        source_text, target_platforms, user.voice_profile or {}
    )

    created = []
    for platform, variations in generated.items():
        items = _save_variations(user.id, None, platform, variations, db)
        created.extend(items)

    await db.commit()
    return {
        "generated": [
            {
                "id": str(c.id),
                "platform": c.platform,
                "text": c.content_text,
                "variation": c.variation_index,
            }
            for c in created
        ]
    }


@router.post("/refine")
async def refine(
    payload: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content_id = payload.get("content_id")
    instruction = payload.get("instruction", "").strip()
    if not content_id or not instruction:
        raise HTTPException(status_code=400, detail="content_id and instruction are required")

    stmt = select(Content).where(
        Content.id == UUID(content_id), Content.user_id == user.id
    )
    result = await db.execute(stmt)
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    refined_text = await meta_agent.refine(
        content_text=content.content_text,
        instruction=instruction,
        platform=content.platform.value,
        voice_profile=user.voice_profile or {},
    )

    content.content_text = refined_text
    content.updated_at = datetime.utcnow()

    # Update voice profile signals based on what the user asked for
    _update_voice_profile(user, instruction)

    # Save as tune sample — approved edits teach the voice profile
    sample = TuneSample(
        user_id=user.id,
        sample_text=refined_text,
        platform=content.platform.value,
        source=TuneSampleSource.approved_post,
    )
    db.add(sample)
    await db.commit()

    return {"refined_content": refined_text, "content_id": str(content.id)}


@router.post("/approve/{content_id}")
async def approve_content(
    content_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Content).where(
        Content.id == UUID(content_id), Content.user_id == user.id
    )
    result = await db.execute(stmt)
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    content.status = ContentStatus.approved

    # Save as tune sample — approved content teaches what resonates
    sample = TuneSample(
        user_id=user.id,
        sample_text=content.content_text,
        platform=content.platform.value,
        source=TuneSampleSource.approved_post,
    )
    db.add(sample)
    await db.commit()

    return {"success": True, "status": "approved"}


@router.get("/content")
async def list_content(
    platform: str = None,
    status: str = None,
    limit: int = 20,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Content).where(Content.user_id == user.id)
    if platform:
        stmt = stmt.where(Content.platform == platform)
    if status:
        stmt = stmt.where(Content.status == status)
    stmt = stmt.order_by(desc(Content.created_at)).limit(limit)
    result = await db.execute(stmt)
    items = result.scalars().all()

    return [
        {
            "id": str(c.id),
            "platform": c.platform,
            "content_type": c.content_type,
            "text": c.content_text,
            "variation": c.variation_index,
            "status": c.status,
            "scheduled_time": c.scheduled_time.isoformat() if c.scheduled_time else None,
            "published_at": c.published_at.isoformat() if c.published_at else None,
            "created_at": c.created_at.isoformat(),
        }
        for c in items
    ]


@router.get("/content/{content_id}")
async def get_content(
    content_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Content).where(
        Content.id == UUID(content_id), Content.user_id == user.id
    )
    result = await db.execute(stmt)
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    return {
        "id": str(content.id),
        "platform": content.platform,
        "content_type": content.content_type,
        "text": content.content_text,
        "variation": content.variation_index,
        "status": content.status,
        "scheduled_time": content.scheduled_time.isoformat() if content.scheduled_time else None,
        "published_at": content.published_at.isoformat() if content.published_at else None,
        "seed_id": str(content.seed_id) if content.seed_id else None,
        "created_at": content.created_at.isoformat(),
    }


def _update_voice_profile(user: User, instruction: str):
    """Parse refine instruction keywords and update voice_profile signals."""
    profile = user.voice_profile or {}
    instruction_lower = instruction.lower()

    if any(w in instruction_lower for w in ["casual", "informal", "relaxed", "conversational"]):
        profile["formality"] = "informal"
    elif any(w in instruction_lower for w in ["formal", "professional", "corporate"]):
        profile["formality"] = "formal"

    if any(w in instruction_lower for w in ["shorter", "concise", "brief", "tighter", "punchy"]):
        profile["length_preference"] = "short"
    elif any(w in instruction_lower for w in ["longer", "detailed", "expand", "more depth"]):
        profile["length_preference"] = "long"

    if any(w in instruction_lower for w in ["no emoji", "remove emoji", "without emoji"]):
        profile["emoji_usage"] = "none"
    elif any(w in instruction_lower for w in ["more emoji", "add emoji"]):
        profile["emoji_usage"] = "high"

    if any(w in instruction_lower for w in ["funny", "humor", "witty", "joke", "playful"]):
        profile["humor"] = "high"
    elif any(w in instruction_lower for w in ["serious", "professional", "no jokes"]):
        profile["humor"] = "low"

    user.voice_profile = profile
