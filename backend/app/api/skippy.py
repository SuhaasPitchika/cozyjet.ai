import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, constr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.skippy_agent import generate_seed, hunt_conversations
from app.database import get_db
from app.dependencies import get_current_user
from app.models.content_seed import ContentSeed
from app.models.conversation_opportunity import ConversationOpportunity, OpportunityStatus
from app.models.user import User

logger = logging.getLogger("cozyjet.api.skippy")

router = APIRouter(prefix="/api/skippy", tags=["skippy"])


class VoiceInput(BaseModel):
    transcription: constr(min_length=1, max_length=5000)


class CreateSeedRequest(BaseModel):
    raw_text: str | None = None
    title: str | None = None
    source_type: str | None = "manual"


@router.post("/voice")
async def voice_seed(
    data: VoiceInput,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request_id = getattr(request.state, "request_id", "-")
    logger.info("Voice seed  user_id=%s  request_id=%s", current_user.id, request_id)

    if not current_user.growth_profile:
        raise HTTPException(status_code=400, detail="Complete onboarding first")

    try:
        seed_data = await generate_seed(
            data.transcription,
            current_user.growth_profile,
            "voice",
        )

        seed = ContentSeed(
            user_id=current_user.id,
            title=seed_data.get("title", "Untitled"),
            description=seed_data.get("story", ""),
            hook=seed_data.get("hook"),
            source_platform="voice",
            source_metadata={"original": data.transcription},
        )
        db.add(seed)
        await db.commit()
        await db.refresh(seed)
        logger.info("Voice seed created  seed_id=%s  user_id=%s", seed.id, current_user.id)
        return {"seed_id": str(seed.id), "seed": seed_data}

    except HTTPException:
        raise
    except TimeoutError as e:
        logger.error("Voice seed timed out  user_id=%s  request_id=%s", current_user.id, request_id)
        raise HTTPException(status_code=503, detail="AI service timed out. Please try again.") from e
    except Exception as e:
        logger.exception("Voice seed failed  user_id=%s  request_id=%s", current_user.id, request_id)
        raise HTTPException(status_code=503, detail="Seed generation failed. Please try again.") from e


@router.get("/seeds")
async def get_seeds(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        r = await db.execute(
            select(ContentSeed)
            .where(
                ContentSeed.user_id == current_user.id,
                ContentSeed.is_dismissed.is_(False),
            )
            .order_by(ContentSeed.created_at.desc())
            .limit(20)
        )
        seeds = r.scalars().all()
        # Top-level list matches dashboard Create page (expects Array.isArray).
        return [
            {
                "id": str(s.id),
                "title": s.title,
                "description": s.description,
                "raw_text": s.description,
                "hook": s.hook,
                "source_platform": s.source_platform,
                "source_type": s.source_platform,
                "tags": (s.source_metadata or {}).get("tags", []),
                "virality_score": s.virality_score,
                "relevance_score": s.virality_score,
                "created_at": s.created_at.isoformat(),
            }
            for s in seeds
        ]
    except Exception as e:
        logger.exception("Failed to fetch seeds  user_id=%s", current_user.id)
        raise HTTPException(status_code=500, detail="Failed to fetch seeds.") from e


@router.post("/seeds", status_code=201)
async def create_seed(
    data: CreateSeedRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request_id = getattr(request.state, "request_id", "-")

    if not current_user.growth_profile:
        raise HTTPException(status_code=400, detail="Complete onboarding first")

    text = (data.raw_text or data.title or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="raw_text or title is required")
    if len(text) > 5000:
        raise HTTPException(status_code=400, detail="Input text exceeds 5000 character limit")

    try:
        seed_data = await generate_seed(
            text,
            current_user.growth_profile,
            data.source_type or "manual",
        )
        seed = ContentSeed(
            user_id=current_user.id,
            title=seed_data.get("title", data.title[:255] if data.title else "Untitled"),
            description=seed_data.get("story", text),
            hook=seed_data.get("hook"),
            source_platform=(data.source_type or "manual")[:50],
            source_metadata={
                "tags": seed_data.get("tags", []),
                "original": text,
            },
        )
        db.add(seed)
        await db.commit()
        await db.refresh(seed)
        logger.info("Seed created  seed_id=%s  user_id=%s", seed.id, current_user.id)
        return {"id": str(seed.id), "title": seed.title, "description": seed.description}

    except HTTPException:
        raise
    except TimeoutError as e:
        logger.error("Seed creation timed out  user_id=%s  request_id=%s", current_user.id, request_id)
        raise HTTPException(status_code=503, detail="AI service timed out. Please try again.") from e
    except Exception as e:
        logger.exception("Seed creation failed  user_id=%s  request_id=%s", current_user.id, request_id)
        raise HTTPException(status_code=503, detail="Seed creation failed. Please try again.") from e


@router.post("/hunt")
async def hunt(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request_id = getattr(request.state, "request_id", "-")
    logger.info("Conversation hunt  user_id=%s  request_id=%s", current_user.id, request_id)

    if not current_user.growth_profile:
        raise HTTPException(status_code=400, detail="Complete onboarding first")

    try:
        r = await db.execute(
            select(ContentSeed)
            .where(ContentSeed.user_id == current_user.id)
            .order_by(ContentSeed.created_at.desc())
            .limit(3)
        )
        recent = [{"title": s.title} for s in r.scalars().all()]
        opps = await hunt_conversations(current_user.growth_profile, recent)

        for o in opps:
            db.add(
                ConversationOpportunity(
                    user_id=current_user.id,
                    platform=o.get("platform", "twitter"),
                    thread_url=o.get("url", ""),
                    thread_title=o.get("topic", ""),
                    drafted_reply=o.get("drafted_reply", ""),
                    relevance_score=o.get("relevance_score", 50),
                    opportunity_reason=o.get("why_this_works", ""),
                )
            )

        await db.commit()
        logger.info("Hunt complete  found=%d  user_id=%s", len(opps), current_user.id)
        return {"found": len(opps), "opportunities": opps}

    except HTTPException:
        raise
    except TimeoutError as e:
        logger.error("Hunt timed out  user_id=%s  request_id=%s", current_user.id, request_id)
        raise HTTPException(status_code=503, detail="AI service timed out. Please try again.") from e
    except Exception as e:
        logger.exception("Hunt failed  user_id=%s  request_id=%s", current_user.id, request_id)
        raise HTTPException(status_code=503, detail="Conversation hunt failed. Please try again.") from e


@router.get("/opportunities")
async def get_opportunities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        r = await db.execute(
            select(ConversationOpportunity)
            .where(
                ConversationOpportunity.user_id == current_user.id,
                ConversationOpportunity.status == OpportunityStatus.pending,
            )
            .order_by(ConversationOpportunity.created_at.desc())
            .limit(10)
        )
        opps = r.scalars().all()
        return {
            "opportunities": [
                {
                    "id": str(o.id),
                    "platform": o.platform,
                    "topic": o.thread_title,
                    "drafted_reply": o.drafted_reply,
                    "relevance_score": o.relevance_score,
                    "reason": o.opportunity_reason,
                }
                for o in opps
            ]
        }
    except Exception as e:
        logger.exception("Failed to fetch opportunities  user_id=%s", current_user.id)
        raise HTTPException(status_code=500, detail="Failed to fetch opportunities.") from e
