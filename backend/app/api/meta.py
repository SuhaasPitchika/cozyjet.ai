import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..models.content_seed import ContentSeed
from ..models.content import Content, ContentPlatform, ContentType, ContentStatus
from ..models.trends import Trend
from ..models.tune_samples import TuneSample, TuneSampleSource
from ..agents.meta import meta_agent

router = APIRouter()


def _save_variations(user_id, seed_id, platform, variations, db_session):
    items = []
    for i, text in enumerate(variations[:3]):
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


@router.post("/generate")
async def generate(payload: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    seed_id = payload.get("seed_id")
    platforms = payload.get("platforms", ["linkedin", "twitter"])

    stmt = select(ContentSeed).where(ContentSeed.id == UUID(seed_id))
    result = await db.execute(stmt)
    seed_obj = result.scalar_one_or_none()
    if not seed_obj:
        raise HTTPException(status_code=404, detail="Content seed not found")

    generated = await meta_agent.generate_content(
        seed={"title": seed_obj.title, "description": seed_obj.description},
        voice_profile=user.voice_profile or {},
        platforms=platforms,
    )

    created = []
    for platform, variations in generated.items():
        items = _save_variations(user.id, seed_obj.id, platform, variations, db)
        created.extend(items)

    seed_obj.is_used = True
    await db.commit()

    return {"generated": [{"id": str(c.id), "platform": c.platform, "text": c.content_text, "variation": c.variation_index} for c in created]}


@router.post("/generate-from-idea")
async def generate_from_idea(payload: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    topic = payload.get("topic", "")
    platforms = payload.get("platforms", ["linkedin", "twitter"])
    if not topic:
        raise HTTPException(status_code=400, detail="topic is required")

    generated = await meta_agent.generate_from_idea(topic, user.voice_profile or {}, platforms)

    created = []
    for platform, variations in generated.items():
        items = _save_variations(user.id, None, platform, variations, db)
        created.extend(items)

    await db.commit()
    return {"generated": [{"id": str(c.id), "platform": c.platform, "text": c.content_text, "variation": c.variation_index} for c in created]}


@router.post("/generate-from-trend")
async def generate_from_trend(payload: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    trend_id = payload.get("trend_id")
    platforms = payload.get("platforms", ["linkedin", "twitter"])
    if not trend_id:
        raise HTTPException(status_code=400, detail="trend_id is required")

    stmt = select(Trend).where(Trend.id == UUID(trend_id))
    result = await db.execute(stmt)
    trend = result.scalar_one_or_none()
    if not trend:
        raise HTTPException(status_code=404, detail="Trend not found")

    trend_data = {"topic": trend.topic, "related_keywords": trend.related_keywords or []}
    generated = await meta_agent.generate_from_trend(trend_data, user.voice_profile or {}, platforms)

    created = []
    for platform, variations in generated.items():
        items = _save_variations(user.id, None, platform, variations, db)
        created.extend(items)

    await db.commit()
    return {"generated": [{"id": str(c.id), "platform": c.platform, "text": c.content_text, "variation": c.variation_index} for c in created]}


@router.post("/repurpose")
async def repurpose(payload: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    source_text = payload.get("source_text", "")
    target_platforms = payload.get("target_platforms", ["linkedin", "twitter"])
    if not source_text:
        raise HTTPException(status_code=400, detail="source_text is required")

    generated = await meta_agent.repurpose(source_text, target_platforms, user.voice_profile or {})

    created = []
    for platform, variations in generated.items():
        items = _save_variations(user.id, None, platform, variations, db)
        created.extend(items)

    await db.commit()
    return {"generated": [{"id": str(c.id), "platform": c.platform, "text": c.content_text, "variation": c.variation_index} for c in created]}


@router.post("/refine")
async def refine(payload: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    content_id = payload.get("content_id")
    instruction = payload.get("instruction", "")
    if not content_id or not instruction:
        raise HTTPException(status_code=400, detail="content_id and instruction are required")

    stmt = select(Content).where(Content.id == UUID(content_id), Content.user_id == user.id)
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

    # Voice profile learning — store the instruction as a preference signal
    _update_voice_profile(user, instruction)

    # Save tune sample
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
async def approve_content(content_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Content).where(Content.id == UUID(content_id), Content.user_id == user.id)
    result = await db.execute(stmt)
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    content.status = ContentStatus.approved

    # Save as tune sample for voice learning
    sample = TuneSample(
        user_id=user.id,
        sample_text=content.content_text,
        platform=content.platform.value,
        source=TuneSampleSource.approved_post,
    )
    db.add(sample)
    await db.commit()

    return {"success": True, "status": "approved"}


def _update_voice_profile(user: User, instruction: str):
    """Parse refine instruction keywords and update voice_profile signals."""
    profile = user.voice_profile or {}
    instruction_lower = instruction.lower()

    if any(word in instruction_lower for word in ["casual", "informal", "relaxed"]):
        profile["formality"] = "informal"
    elif any(word in instruction_lower for word in ["formal", "professional", "corporate"]):
        profile["formality"] = "formal"

    if any(word in instruction_lower for word in ["shorter", "concise", "brief"]):
        profile["length_preference"] = "short"
    elif any(word in instruction_lower for word in ["longer", "detailed", "expand"]):
        profile["length_preference"] = "long"

    if any(word in instruction_lower for word in ["no emoji", "remove emoji", "without emoji"]):
        profile["emoji_usage"] = "none"
    elif any(word in instruction_lower for word in ["more emoji", "add emoji"]):
        profile["emoji_usage"] = "high"

    if any(word in instruction_lower for word in ["funny", "humor", "witty", "joke"]):
        profile["humor"] = "high"

    user.voice_profile = profile
