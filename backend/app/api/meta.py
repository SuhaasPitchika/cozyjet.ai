from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..models.content_seed import ContentSeed
from ..models.content import Content, ContentPlatform, ContentType, ContentStatus
from ..agents.meta import meta_agent
from ..agents.skippy import skippy_agent
import json
import uuid

router = APIRouter()

@router.post("/generate")
async def generate(payload: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    seed_id = payload.get("seed_id")
    platforms = payload.get("platforms", ["linkedin", "twitter"])
    
    # Load seed
    stmt = select(ContentSeed).where(ContentSeed.id == seed_id)
    result = await db.execute(stmt)
    seed_obj = result.scalar_one_or_none()
    
    if not seed_obj:
        raise HTTPException(status_code=404, detail="Content seed not found")
    
    # Generate content variations with Meta Agent
    generated_payload = await meta_agent.generate_content(
        seed={"title": seed_obj.title, "description": seed_obj.description},
        voice_profile=user.voice_profile,
        platforms=platforms
    )
    
    created_content = []
    
    for platform, variations in generated_payload.items():
        for i, variation in enumerate(variations):
            content_item = Content(
                user_id=user.id,
                seed_id=seed_obj.id,
                platform=ContentPlatform(platform),
                content_type=ContentType.post, # Default to post/thread for now
                content_text=variation,
                variation_index=i,
                status=ContentStatus.draft
            )
            db.add(content_item)
            created_content.append(content_item)
    
    await db.flush()
    # Masking Content type mapping in return
    return {"generated": [{ "id": c.id, "platform": c.platform, "text": c.content_text, "variation": c.variation_index } for c in created_content]}

@router.post("/refine")
async def refine(payload: dict, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    content_id = payload.get("content_id")
    instruction = payload.get("instruction")
    
    # Refine logic placeholder
    return {"refined_content": "Revised version of post info..."}
