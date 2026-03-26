from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User, TuneSample
from pydantic import BaseModel
from typing import List, Dict, Optional
import uuid

router = APIRouter()

class VoiceProfileUpdate(BaseModel):
    tone: str = "Professional"
    style: str = "Concise"
    emoji_usage: float = 0.5 # 0 to 1
    humor: float = 0.2
    formality: float = 0.8
    hashtags: bool = True

class SampleCreate(BaseModel):
    text: str
    platform: Optional[str] = "linkedin"

@router.get("/profile")
async def get_tuning_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch Samples
    stmt = select(TuneSample).where(TuneSample.user_id == current_user.id)
    res = await db.execute(stmt)
    samples = res.scalars().all()
    
    return {
        "voice_profile": current_user.voice_profile or {
            "tone": "Professional",
            "style": "Concise",
            "emoji_usage": 0.5,
            "humor": 0.2,
            "formality": 0.8,
            "hashtags": True
         },
        "samples": [
            {"id": s.id, "text": s.sample_text, "platform": s.platform} 
            for s in samples
        ]
    }

@router.patch("/profile")
async def update_voice_profile(
    update: VoiceProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.voice_profile = update.dict()
    await db.commit()
    return {"status": "success", "profile": current_user.voice_profile}

@router.post("/samples")
async def add_sample(
    sample: SampleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_sample = TuneSample(
        user_id=current_user.id,
        sample_text=sample.text,
        platform=sample.platform,
        source="manual"
    )
    db.add(new_sample)
    await db.commit()
    return {"status": "success", "id": new_sample.id}

@router.delete("/samples/{sample_id}")
async def delete_sample(
    sample_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(TuneSample).where(
        TuneSample.id == sample_id,
        TuneSample.user_id == current_user.id
    )
    res = await db.execute(stmt)
    sample = res.scalar_one_or_none()
    
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
        
    await db.delete(sample)
    await db.commit()
    return {"status": "success"}
