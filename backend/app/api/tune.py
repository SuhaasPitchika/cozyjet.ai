import json
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.model_router import call_openrouter

router = APIRouter(prefix="/api/tune", tags=["tune"])


class SampleInput(BaseModel):
    sample_text: str = Field(min_length=1)


class ProfileUpdate(BaseModel):
    formality: Optional[int] = None
    technical_depth: Optional[int] = None
    humor: Optional[int] = None
    emoji_usage: Optional[str] = None
    tone_tags: Optional[List[str]] = None


@router.post("/analyze")
async def analyze(
    data: SampleInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raw = await call_openrouter(
        messages=[
            {
                "role": "system",
                "content": "Extract specific writing style observations. Concrete rules not vague descriptions. Return JSON only with key observations as array.",
            },
            {
                "role": "user",
                "content": json.dumps(
                    {"sample": data.sample_text[:3000], "output": {"observations": []}}
                ),
            },
        ],
        model="anthropic/claude-3.5-sonnet",
        max_tokens=400,
        temperature=0.2,
    )
    try:
        obs = json.loads(raw).get("observations", [])
    except Exception:
        obs = []

    profile = current_user.voice_profile or {}
    existing = profile.get("observations", [])
    profile["observations"] = list(set(existing + obs))[:20]
    current_user.voice_profile = profile
    await db.commit()
    return {"observations": obs, "total_saved": len(profile["observations"])}


@router.patch("/profile")
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = current_user.voice_profile or {}
    for field, val in data.model_dump(exclude_none=True).items():
        profile[field] = val
    current_user.voice_profile = profile
    await db.commit()
    return {"voice_profile": profile}


@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {"voice_profile": current_user.voice_profile or {}}
