import json
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.model_router import call_openrouter

logger = logging.getLogger("cozyjet.api.tune")

router = APIRouter(prefix="/api/tune", tags=["tune"])


class SampleInput(BaseModel):
    sample_text: str = Field(min_length=1, max_length=5000)


class ProfileUpdate(BaseModel):
    formality: Optional[int] = None
    technical_depth: Optional[int] = None
    humor: Optional[int] = None
    emoji_usage: Optional[str] = None
    tone_tags: Optional[List[str]] = None


@router.post("/analyze")
async def analyze(
    data: SampleInput,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request_id = getattr(request.state, "request_id", "-")
    logger.info(
        "Voice analysis requested  user_id=%s  sample_len=%d  request_id=%s",
        current_user.id,
        len(data.sample_text),
        request_id,
    )

    try:
        raw = await call_openrouter(
            [
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
            logger.warning("Failed to parse voice analysis JSON  user_id=%s", current_user.id)
            obs = []

        profile = current_user.voice_profile or {}
        existing = profile.get("observations", [])
        profile["observations"] = list(set(existing + obs))[:20]
        current_user.voice_profile = profile
        await db.commit()

        logger.info(
            "Voice analysis complete  user_id=%s  new_obs=%d  total=%d",
            current_user.id,
            len(obs),
            len(profile["observations"]),
        )
        return {"observations": obs, "total_saved": len(profile["observations"])}

    except HTTPException:
        raise
    except TimeoutError as e:
        logger.error("Voice analysis timed out  user_id=%s  request_id=%s", current_user.id, request_id)
        raise HTTPException(status_code=503, detail="AI service timed out. Please try again.") from e
    except Exception as e:
        logger.exception("Voice analysis failed  user_id=%s  request_id=%s", current_user.id, request_id)
        raise HTTPException(status_code=503, detail="Voice analysis failed. Please try again.") from e


@router.patch("/profile")
async def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        profile = current_user.voice_profile or {}
        for field, val in data.model_dump(exclude_none=True).items():
            profile[field] = val
        current_user.voice_profile = profile
        await db.commit()
        logger.info("Voice profile updated  user_id=%s", current_user.id)
        return {"voice_profile": profile}
    except Exception as e:
        logger.exception("Failed to update voice profile  user_id=%s", current_user.id)
        raise HTTPException(status_code=500, detail="Failed to update voice profile.") from e


@router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {"voice_profile": current_user.voice_profile or {}}
