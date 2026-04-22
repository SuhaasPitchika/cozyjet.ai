import logging
from datetime import datetime
from typing import List, Literal, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, constr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.meta_agent import generate_all
from app.agents.skippy_agent import generate_seed
from app.database import get_db
from app.dependencies import get_current_user
from app.models.content import Content, ContentStatus
from app.models.content_seed import ContentSeed
from app.models.user import User
from app.services.model_router import call_openrouter

logger = logging.getLogger("cozyjet.api.meta")

router = APIRouter(prefix="/api/meta", tags=["meta"])

Platform = Literal["linkedin", "twitter", "reddit", "instagram", "youtube"]


class GenRequest(BaseModel):
    seed_id: Optional[UUID] = None
    topic: Optional[constr(min_length=1, max_length=200)] = None
    platforms: List[Platform] = ["linkedin", "twitter"]


class RefineRequest(BaseModel):
    content_id: UUID
    instruction: constr(min_length=1, max_length=2000)


class ApproveRequest(BaseModel):
    content_id: UUID
    scheduled_time: Optional[datetime] = None


@router.post("/generate")
async def generate(
    data: GenRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request_id = getattr(request.state, "request_id", "-")
    logger.info(
        "Content generation requested  user_id=%s  platforms=%s  request_id=%s",
        current_user.id,
        data.platforms,
        request_id,
    )

    if not current_user.growth_profile:
        raise HTTPException(400, "Complete onboarding first")

    if bool(data.seed_id) == bool(data.topic):
        raise HTTPException(400, "Provide exactly one of seed_id or topic")

    try:
        if data.seed_id:
            r = await db.execute(
                select(ContentSeed).where(
                    ContentSeed.id == data.seed_id,
                    ContentSeed.user_id == current_user.id,
                )
            )
            s = r.scalar_one_or_none()
            if not s:
                raise HTTPException(404, "Seed not found")
            seed = {"title": s.title, "story": s.description, "hook": s.hook}
        else:
            seed = await generate_seed(data.topic, current_user.growth_profile, "idea")

        observations = (current_user.voice_profile or {}).get("observations", [])
        results = await generate_all(seed, data.platforms, current_user.growth_profile, observations)

        saved = {}
        for platform, cd in results.items():
            if "error" in cd:
                logger.warning(
                    "Platform generation error  platform=%s  error=%s  user_id=%s",
                    platform,
                    cd["error"],
                    current_user.id,
                )
                continue
            record = Content(
                user_id=current_user.id,
                seed_id=data.seed_id,
                platform=platform,
                content_text=cd.get("full_content", ""),
                hook=cd.get("hook"),
                status=ContentStatus.draft,
                virality_score=cd.get("virality_score", 0),
                virality_reasoning=cd.get("virality_reasoning"),
            )
            db.add(record)
            await db.flush()
            saved[platform] = {**cd, "content_id": str(record.id)}

        await db.commit()
        logger.info(
            "Content generated  user_id=%s  platforms_saved=%s  request_id=%s",
            current_user.id,
            list(saved.keys()),
            request_id,
        )
        return {"generated": saved}

    except HTTPException:
        raise
    except TimeoutError as e:
        logger.error("Content generation timed out  user_id=%s  request_id=%s", current_user.id, request_id)
        raise HTTPException(status_code=503, detail="AI service timed out. Please try again.") from e
    except Exception as e:
        logger.exception("Content generation failed  user_id=%s  request_id=%s", current_user.id, request_id)
        raise HTTPException(status_code=503, detail="Content generation failed. Please try again.") from e


@router.post("/refine")
async def refine(
    data: RefineRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request_id = getattr(request.state, "request_id", "-")
    logger.info(
        "Content refinement requested  content_id=%s  user_id=%s  request_id=%s",
        data.content_id,
        current_user.id,
        request_id,
    )

    try:
        r = await db.execute(
            select(Content).where(
                Content.id == data.content_id,
                Content.user_id == current_user.id,
            )
        )
        content = r.scalar_one_or_none()
        if not content:
            raise HTTPException(404, "Content not found")

        revised = await call_openrouter(
            [
                {
                    "role": "system",
                    "content": "You are Meta. Revise this content per the instruction. Return only the revised text.",
                },
                {
                    "role": "user",
                    "content": f"Content:\n{content.content_text}\n\nInstruction: {data.instruction}",
                },
            ],
            max_tokens=500,
            temperature=0.8,
        )
        content.content_text = revised
        await db.commit()
        logger.info("Content refined  content_id=%s  user_id=%s", data.content_id, current_user.id)
        return {"content_id": str(data.content_id), "revised": revised}

    except HTTPException:
        raise
    except TimeoutError as e:
        logger.error("Content refinement timed out  content_id=%s  request_id=%s", data.content_id, request_id)
        raise HTTPException(status_code=503, detail="AI service timed out. Please try again.") from e
    except Exception as e:
        logger.exception("Content refinement failed  content_id=%s  request_id=%s", data.content_id, request_id)
        raise HTTPException(status_code=503, detail="Content refinement failed. Please try again.") from e


@router.post("/approve")
async def approve(
    data: ApproveRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request_id = getattr(request.state, "request_id", "-")

    try:
        r = await db.execute(
            select(Content).where(
                Content.id == data.content_id,
                Content.user_id == current_user.id,
            )
        )
        content = r.scalar_one_or_none()
        if not content:
            raise HTTPException(404, "Content not found")

        if data.scheduled_time:
            content.scheduled_time = data.scheduled_time
            content.status = ContentStatus.scheduled
        else:
            content.status = ContentStatus.approved

        await db.commit()
        logger.info(
            "Content approved  content_id=%s  status=%s  user_id=%s",
            data.content_id,
            content.status,
            current_user.id,
        )
        return {"status": content.status, "content_id": str(data.content_id)}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Content approval failed  content_id=%s  request_id=%s", data.content_id, request_id)
        raise HTTPException(status_code=500, detail="Failed to approve content. Please try again.") from e


@router.get("/content")
async def get_content(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        r = await db.execute(
            select(Content)
            .where(Content.user_id == current_user.id)
            .order_by(Content.created_at.desc())
            .limit(30)
        )
        items = r.scalars().all()
        return {
            "content": [
                {
                    "id": str(c.id),
                    "platform": c.platform,
                    "content_text": c.content_text,
                    "hook": c.hook,
                    "status": c.status,
                    "virality_score": c.virality_score,
                    "scheduled_time": c.scheduled_time.isoformat() if c.scheduled_time else None,
                    "created_at": c.created_at.isoformat(),
                }
                for c in items
            ]
        }
    except Exception as e:
        logger.exception("Failed to fetch content  user_id=%s", current_user.id)
        raise HTTPException(status_code=500, detail="Failed to fetch content.") from e
