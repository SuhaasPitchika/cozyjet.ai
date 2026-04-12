"""
Tune API — Voice profile learning system.
Users add writing samples; the system extracts stylistic observations and
updates the voice_profile JSON used by Meta for content generation.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..models.tune_samples import TuneSample, TuneSampleSource
from ..agents.meta import meta_agent

router = APIRouter()


@router.get("/samples")
async def list_samples(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(TuneSample)
        .where(TuneSample.user_id == user.id)
        .order_by(TuneSample.created_at.desc())
    )
    result = await db.execute(stmt)
    samples = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "sample_text": s.sample_text,
            "platform": s.platform,
            "source": s.source,
            "created_at": s.created_at.isoformat(),
        }
        for s in samples
    ]


@router.post("/samples")
async def add_sample(
    payload: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    text = payload.get("sample_text", "").strip()
    if len(text) < 20:
        raise HTTPException(status_code=400, detail="sample_text must be at least 20 characters")

    sample = TuneSample(
        user_id=user.id,
        sample_text=text,
        platform=payload.get("platform"),
        source=TuneSampleSource.manual,
    )
    db.add(sample)
    await db.commit()
    await db.refresh(sample)

    return {
        "id": str(sample.id),
        "sample_text": sample.sample_text,
        "platform": sample.platform,
        "source": sample.source,
        "created_at": sample.created_at.isoformat(),
    }


@router.post("/samples/upload")
async def upload_sample(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raw = await file.read()
    try:
        text = raw.decode("utf-8").strip()
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be plain text (UTF-8)")

    if len(text) < 20:
        raise HTTPException(status_code=400, detail="File content too short")

    sample = TuneSample(
        user_id=user.id,
        sample_text=text[:10000],
        platform=None,
        source=TuneSampleSource.imported,
    )
    db.add(sample)
    await db.commit()
    await db.refresh(sample)

    return {
        "id": str(sample.id),
        "chars": len(text),
        "source": sample.source,
        "created_at": sample.created_at.isoformat(),
    }


@router.delete("/samples/{sample_id}")
async def delete_sample(
    sample_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(TuneSample).where(
        TuneSample.id == UUID(sample_id), TuneSample.user_id == user.id
    )
    result = await db.execute(stmt)
    sample = result.scalar_one_or_none()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    await db.delete(sample)
    await db.commit()
    return {"success": True}


@router.post("/process")
async def process_samples(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(TuneSample)
        .where(TuneSample.user_id == user.id)
        .order_by(TuneSample.created_at.desc())
        .limit(20)
    )
    result = await db.execute(stmt)
    samples = result.scalars().all()

    if not samples:
        raise HTTPException(status_code=400, detail="No writing samples found. Add some samples first.")

    combined = "\n\n---\n\n".join(s.sample_text for s in samples)[:12000]

    style_data = await meta_agent.process_tuning_sample(combined)

    profile = user.voice_profile or {}
    profile.update({
        "tone": style_data.get("tone") or profile.get("tone", "professional"),
        "formality": style_data.get("formality") or profile.get("formality", "semi-formal"),
        "humor": style_data.get("humor") or profile.get("humor", "witty"),
        "preferred_style": style_data.get("preferred_style") or profile.get("preferred_style", "storytelling"),
        "style_observations": style_data.get("observations", []),
        "samples_count": len(samples),
    })
    user.voice_profile = profile
    await db.commit()

    return {
        "success": True,
        "voice_profile": profile,
        "samples_analyzed": len(samples),
        "observations": style_data.get("observations", []),
    }


@router.get("/voice-profile")
async def get_voice_profile(user: User = Depends(get_current_user)):
    return {
        "voice_profile": user.voice_profile or {},
        "is_tuned": bool((user.voice_profile or {}).get("style_observations")),
    }


@router.put("/voice-profile")
async def update_voice_profile(
    payload: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    allowed = {"tone", "style", "formality", "humor", "emoji_usage", "preferred_platforms", "preferred_style"}
    updates = {k: v for k, v in payload.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=400, detail="No valid profile fields provided")

    profile = user.voice_profile or {}
    profile.update(updates)
    user.voice_profile = profile
    await db.commit()
    return {"success": True, "voice_profile": profile}
