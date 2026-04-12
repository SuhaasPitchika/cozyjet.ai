from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.content_seed import ContentSeed
from app.models.conversation_opportunity import ConversationOpportunity, OpportunityStatus
from app.agents.skippy_agent import generate_seed, hunt_conversations

router = APIRouter(prefix="/api/skippy", tags=["skippy"])


class VoiceInput(BaseModel):
    transcription: str


@router.post("/voice")
async def voice_seed(
    data: VoiceInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.growth_profile:
        raise HTTPException(status_code=400, detail="Complete onboarding first")

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
    return {"seed_id": str(seed.id), "seed": seed_data}


@router.get("/seeds")
async def get_seeds(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
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


@router.post("/seeds")
async def create_seed(
    data: CreateSeedRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.growth_profile:
        raise HTTPException(status_code=400, detail="Complete onboarding first")

    text = (data.raw_text or data.title or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="raw_text or title is required")

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
    return {"id": str(seed.id), "title": seed.title, "description": seed.description}


@router.post("/hunt")
async def hunt(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.growth_profile:
        raise HTTPException(status_code=400, detail="Complete onboarding first")

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
    return {"found": len(opps), "opportunities": opps}


@router.get("/opportunities")
async def get_opportunities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
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
