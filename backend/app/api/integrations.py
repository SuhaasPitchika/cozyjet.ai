from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.user import User, Integration, IntegrationPlatform
from ..database import get_db
from ..dependencies import get_current_user
from ..services.integrations import IntegrationService
from datetime import datetime
import httpx
import os

router = APIRouter()
integrations_service = IntegrationService()

# Redirects from social platforms
@router.get("/callback/github")
async def github_callback(code: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Exchange code for token
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://github.com/login/oauth/access_token",
            params={
                "client_id": os.getenv("GITHUB_CLIENT_ID"),
                "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
                "code": code
            },
            headers={"Accept": "application/json"}
        )
        token_data = resp.json()
        
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Failed to get GitHub access token")
        
    # Encrypt and Save
    integration = Integration(
        user_id=current_user.id,
        platform=IntegrationPlatform.github,
        access_token=integrations_service.encrypt_token(access_token),
        is_active=True,
        last_synced_at=datetime.utcnow()
    )
    db.add(integration)
    await db.commit()
    
    # Trigger immediate sync (Celery task placeholder)
    # skippy_sync_user_integrations.delay(str(current_user.id))
    
    return {"message": "GitHub connected successfully"}

@router.get("/")
async def list_integrations(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # List active integrations
    pass
