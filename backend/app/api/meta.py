import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.content_seed import ContentSeed
from app.models.content import Content, ContentStatus
from app.agents.meta_agent import generate_all
from app.agents.skippy_agent import generate_seed
from app.services.model_router import call_openrouter

router = APIRouter(prefix="/api/meta", tags=["meta"])


class GenRequest(BaseModel):
    seed_id: Optional[str] = None
    topic: Optional[str] = None
    platforms: List[str] = ["linkedin", "twitter"]


class RefineRequest(BaseModel):
    content_id: str
    instruction: str


class ApproveRequest(BaseModel):
    content_id: str
    scheduled_time: Optional[str] = None


@router.post("/generate")
async def generate(
    data: GenRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not current_user.growth_profile:
        raise HTTPException(400, "Complete onboarding first")

    if data.seed_id:
        r = await db.execute(
            select(ContentSeed).where(
                ContentSeed.id == data.seed_id,
                ContentSeed.user_id == current_user.id
            )
        )
        s = r.scalar_one_or_none()
        if not s:
            raise HTTPException(404, "Seed not found")
        seed = {"title": s.title, "story": s.description, "hook": s.hook}
    elif data.topic:
        seed = await generate_seed(data.topic, current_user.growth_profile, "idea")
    else:
        raise HTTPException(400, "Provide seed_id or topic")

    observations = (current_user.voice_profile or {}).get("observations", [])
    results = await generate_all(seed, data.platforms, current_user.growth_profile, observations)

    saved = {}
    for platform, cd in results.items():
        if "error" in cd:
            continue
        record = Content(
            user_id=current_user.id,
            seed_id=uuid.UUID(data.seed_id) if data.seed_id else None,
            platform=platform,
            content_text=cd.get("full_content", ""),
            hook=cd.get("hook"),
            status=ContentStatus.draft,
            virality_score=cd.get("virality_score", 0),
            virality_reasoning=cd.get("virality_reasoning")
        )
        db.add(record)
        await db.flush()
        saved[platform] = {**cd, "content_id": str(record.id)}

    await db.commit()
    return {"generated": saved}


@router.post("/refine")
async def refine(
    data: RefineRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    r = await db.execute(
        select(Content).where(
            Content.id == data.content_id,
            Content.user_id == current_user.id
        )
    )
    content = r.scalar_one_or_none()
    if not content:
        raise HTTPException(404, "Content not found")

    revised = await call_openrouter(
        [
            {"role": "system", "content": "You are Meta. Revise this content per the instruction. Return only the revised text."},
            {"role": "user", "content": f"Content:\n{content.content_text}\n\nInstruction: {data.instruction}"}
        ],
        max_tokens=500,
        temperature=0.8
    )
    content.content_text = revised
    await db.commit()
    return {"content_id": data.content_id, "revised": revised}


@router.post("/approve")
async def approve(
    data: ApproveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    r = await db.execute(
        select(Content).where(
            Content.id == data.content_id,
            Content.user_id == current_user.id
        )
    )
    content = r.scalar_one_or_none()
    if not content:
        raise HTTPException(404, "Content not found")

    if data.scheduled_time:
        content.scheduled_time = datetime.fromisoformat(data.scheduled_time)
        content.status = ContentStatus.scheduled
    else:
        content.status = ContentStatus.approved

    await db.commit()
    return {"status": content.status, "content_id": data.content_id}


@router.get("/content")
async def get_content(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
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
                "created_at": c.created_at.isoformat()
            }
            for c in items
        ]
    }
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
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

router = APIRouter(prefix="/api/meta", tags=["meta"])


class GenRequest(BaseModel):
    seed_id: Optional[str] = None
    topic: Optional[str] = None
    platforms: List[str] = ["linkedin", "twitter"]


class RefineRequest(BaseModel):
    content_id: str
    instruction: str


class ApproveRequest(BaseModel):
    content_id: str
    scheduled_time: Optional[str] = None


@router.post("/generate")
async def generate(
    data: GenRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not current_user.growth_profile:
        raise HTTPException(400, "Complete onboarding first")

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
    elif data.topic:
        seed = await generate_seed(data.topic, current_user.growth_profile, "idea")
    else:
        raise HTTPException(400, "Provide seed_id or topic")

    observations = (current_user.voice_profile or {}).get("observations", [])
    results = await generate_all(
        seed, data.platforms, current_user.growth_profile, observations
    )

    saved = {}
    for platform, cd in results.items():
        if "error" in cd:
            continue
        record = Content(
            user_id=current_user.id,
            seed_id=uuid.UUID(data.seed_id) if data.seed_id else None,
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
    return {"generated": saved}


@router.post("/refine")
async def refine(
    data: RefineRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    r = await db.execute(
        select(Content).where(
            Content.id == data.content_id, Content.user_id == current_user.id
        )
    )
    content = r.scalar_one_or_none()
    if not content:
        raise HTTPException(404, "Content not found")

    revised = await call_openrouter(
        messages=[
            {
                "role": "system",
                "content": "You are Meta. Revise this content per the instruction. Return only the revised text, nothing else.",
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
    return {"content_id": data.content_id, "revised": revised}


@router.post("/approve")
async def approve(
    data: ApproveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    r = await db.execute(
        select(Content).where(
            Content.id == data.content_id, Content.user_id == current_user.id
        )
    )
    content = r.scalar_one_or_none()
    if not content:
        raise HTTPException(404, "Content not found")

    if data.scheduled_time:
        content.scheduled_time = datetime.fromisoformat(data.scheduled_time)
        content.status = ContentStatus.scheduled
    else:
        content.status = ContentStatus.approved

    await db.commit()
    return {"status": content.status, "content_id": data.content_id}


@router.get("/content")
async def get_content(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
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
                "virality_reasoning": c.virality_reasoning,
                "scheduled_time": c.scheduled_time.isoformat()
                if c.scheduled_time
                else None,
                "created_at": c.created_at.isoformat(),
            }
            for c in items
        ]
    }
