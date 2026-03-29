import base64
import httpx
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..models.content_seed import ContentSeed, SourceType
from ..models.integration import Integration
from ..agents.skippy import skippy_agent

router = APIRouter()


@router.post("/enhance")
async def enhance_work(payload: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    raw_desc = payload.get("description", "")
    context = payload.get("context", "")

    result = await skippy_agent.process_activity(
        f"Context: {context}\n{raw_desc}" if context else raw_desc,
        platform="manual",
    )

    seed = ContentSeed(
        user_id=user.id,
        title=result.get("title", raw_desc[:60]),
        description=result.get("description", raw_desc),
        source_type=SourceType.manual,
        source_data={"tags": result.get("tags", []), "content_angles": result.get("content_angles", [])},
    )
    db.add(seed)
    await db.commit()
    await db.refresh(seed)

    return {"seed_id": str(seed.id), "seed": result}


@router.post("/voice")
async def voice_input(payload: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    transcription = payload.get("transcription", "")
    if not transcription:
        raise HTTPException(status_code=400, detail="transcription is required")

    result = await skippy_agent.process_activity(transcription, platform="voice")

    seed = ContentSeed(
        user_id=user.id,
        title=result.get("title", transcription[:60]),
        description=result.get("description", transcription),
        source_type=SourceType.voice,
        source_data={"tags": result.get("tags", [])},
    )
    db.add(seed)
    await db.commit()
    await db.refresh(seed)

    return {"seed_id": str(seed.id), "seed": result}


@router.post("/screenshot")
async def upload_screenshot(file: UploadFile = File(...), user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    content = await file.read()
    base64_image = base64.b64encode(content).decode("utf-8")

    result = await skippy_agent.analyze_screenshot(base64_image)

    seed = ContentSeed(
        user_id=user.id,
        title=result.get("title", "Screenshot Analysis"),
        description=result.get("description", "Analyzed screenshot."),
        source_type=SourceType.screenshot,
        source_data={"tags": result.get("tags", [])},
    )
    db.add(seed)
    await db.commit()
    await db.refresh(seed)

    return {"seed_id": str(seed.id), "seed": result}


@router.post("/sync-now")
async def sync_now(background_tasks: BackgroundTasks, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Trigger sync for all of the user's active integrations via Celery
    stmt = select(Integration).where(Integration.user_id == user.id, Integration.is_active == True)
    result = await db.execute(stmt)
    integrations = result.scalars().all()

    if not integrations:
        return {"message": "No active integrations to sync", "queued": 0}

    try:
        from ..tasks.skippy_tasks import skippy_sync_user
        skippy_sync_user.delay(str(user.id))
        queued = len(integrations)
    except Exception:
        queued = 0

    return {"message": "Sync queued", "queued": queued}


@router.get("/seeds")
async def get_seeds(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(ContentSeed).where(
        ContentSeed.user_id == user.id,
        ContentSeed.is_used == False,
    ).order_by(ContentSeed.created_at.desc()).limit(50)
    result = await db.execute(stmt)
    seeds = result.scalars().all()

    return [
        {
            "id": str(s.id),
            "title": s.title,
            "description": s.description,
            "source_type": s.source_type,
            "source_data": s.source_data,
            "created_at": s.created_at.isoformat(),
        }
        for s in seeds
    ]


@router.post("/seeds/{seed_id}/dismiss")
async def dismiss_seed(seed_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from uuid import UUID
    stmt = select(ContentSeed).where(ContentSeed.id == UUID(seed_id), ContentSeed.user_id == user.id)
    result = await db.execute(stmt)
    seed = result.scalar_one_or_none()
    if not seed:
        raise HTTPException(status_code=404, detail="Seed not found")
    seed.is_used = True
    await db.commit()
    return {"success": True}
