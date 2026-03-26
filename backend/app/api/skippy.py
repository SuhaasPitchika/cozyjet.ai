from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..models.content_seed import ContentSeed, SourceType
from ..agents.skippy import skippy_agent
import base64
import httpx

router = APIRouter()

@router.post("/enhance")
async def enhance_work(payload: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    raw_desc = payload.get("description")
    context = payload.get("context", "")
    
    enhanced = await skippy_agent.enhance_work_description(raw_desc, context)
    
    # Save as content seed
    seed = ContentSeed(
        user_id=user.id,
        title=f"Work: {raw_desc[:30]}...",
        description=enhanced,
        source_type=SourceType.manual
    )
    db.add(seed)
    await db.flush()
    
    return {"seed_id": seed.id, "enhanced_description": enhanced}

@router.post("/screenshot-upload")
async def upload_screenshot(file: UploadFile = File(...), user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    content = await file.read()
    # base64_image = base64.b64encode(content).decode("utf-8")
    
    # Analyze image with Skippy (using GPT-4 Vision or similar)
    # Placeholder analysis text for now
    analysis = "Identified: VSCode editor with Python code for a FastAPI backend. Solved database migration issue."
    
    seed = ContentSeed(
        user_id=user.id,
        title="Screen Analysis",
        description=analysis,
        source_type=SourceType.screenshot
    )
    db.add(seed)
    await db.flush()
    
    return {"seed_id": seed.id, "analysis": analysis}

@router.post("/integration/github")
async def github_integration(payload: dict, user: User = Depends(get_current_user)):
    token = payload.get("token")
    repo = payload.get("repo")
    
    # Fetch last 10 commits (httpx implementation)
    # ...
    return {"commits": []}
