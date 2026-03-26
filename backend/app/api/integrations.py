from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User, Integration, IntegrationPlatform
from ..config import settings
from ..services.encryption import token_encryption_service
import httpx
import secrets
import json
import redis.asyncio as redis
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter()

# Setup Redis for State Storage
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# Central OAuth Config
PLATFORM_CONFIG = {
    "github": {
        "auth_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token",
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "scopes": "repo read:user",
        "profile_api": "https://api.github.com/user"
    },
    "notion": {
        "auth_url": "https://api.notion.com/v1/oauth/authorize",
        "token_url": "https://api.notion.com/v1/oauth/token",
        "client_id": settings.NOTION_CLIENT_ID,
        "client_secret": settings.NOTION_CLIENT_SECRET,
        "redirect_uri": settings.NOTION_REDIRECT_URI,
        "scopes": "read_content",
        "profile_api": "https://api.notion.com/v1/users/me"
    },
    "figma": {
        "auth_url": "https://www.figma.com/oauth",
        "token_url": "https://www.figma.com/api/oauth/token",
        "client_id": settings.FIGMA_CLIENT_ID,
        "client_secret": settings.FIGMA_CLIENT_SECRET,
        "redirect_uri": settings.FIGMA_REDIRECT_URI,
        "scopes": "file_read",
        "profile_api": "https://api.figma.com/v1/me"
    },
    # Add Google, LinkedIn, etc. here following same pattern
}

@router.get("/connect/{platform}")
async def connect_platform(
    platform: str, 
    current_user: User = Depends(get_current_user)
):
    if platform not in PLATFORM_CONFIG:
        raise HTTPException(status_code=400, detail="Invalid platform")
        
    config = PLATFORM_CONFIG[platform]
    state = secrets.token_urlsafe(32)
    
    # Store state in Redis (5 min TTL)
    await redis_client.set(f"oauth_state:{current_user.id}:{platform}", state, ex=300)
    
    # Construct Authorization URL
    auth_url = (
        f"{config['auth_url']}?client_id={config['client_id']}"
        f"&redirect_uri={config['redirect_uri']}&state={state}"
        f"&response_type=code&scope={config['scopes']}"
    )
    
    return {"url": auth_url}

@router.get("/callback/{platform}")
async def oauth_callback(
    platform: str,
    code: str,
    state: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if platform not in PLATFORM_CONFIG:
        raise HTTPException(status_code=400, detail="Invalid platform")
        
    config = PLATFORM_CONFIG[platform]
    
    # Verify state
    saved_state = await redis_client.get(f"oauth_state:{current_user.id}:{platform}")
    if not saved_state or saved_state != state:
        raise HTTPException(status_code=403, detail="Invalid state parameter (CSRF protection)")
    
    # Consume state
    await redis_client.delete(f"oauth_state:{current_user.id}:{platform}")

    # Exchange code for token
    async with httpx.AsyncClient() as client:
        # Notion requires Basic Auth
        headers = {"Accept": "application/json"}
        if platform == "notion":
            auth = (config["client_id"], config["client_secret"])
            resp = await client.post(
                config["token_url"],
                data={ "grant_type": "authorization_code", "code": code, "redirect_uri": config["redirect_uri"] },
                auth=auth, headers=headers
            )
        else:
            resp = await client.post(
                config["token_url"],
                data={
                    "client_id": config["client_id"],
                    "client_secret": config["client_secret"],
                    "code": code,
                    "redirect_uri": config["redirect_uri"]
                },
                headers=headers
            )
        
        token_data = resp.json()

    if "access_token" not in token_data:
        raise HTTPException(status_code=400, detail=f"Failed to get tokens: {token_data}")

    # Fetch User Profile from Platform
    async with httpx.AsyncClient() as client:
        profile_headers = {"Authorization": f"Bearer {token_data['access_token']}"}
        # GitHub requires User-Agent
        if platform == "github": 
            profile_headers["User-Agent"] = "CozyJet-App"
            
        profile_resp = await client.get(config["profile_api"], headers=profile_headers)
        p_data = profile_resp.json()

    # Determine unique platform fields
    p_username = p_data.get("login") or p_data.get("name") or p_data.get("handle")
    p_user_id = str(p_data.get("id"))

    # Encryption Access Tokens
    encrypted_at = token_encryption_service.encrypt(token_data["access_token"])
    encrypted_rt = token_encryption_service.encrypt(token_data.get("refresh_token"))
    
    expires_in = token_data.get("expires_in")
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in) if expires_in else None

    # Upsert Integration
    stmt = select(Integration).where(Integration.user_id == current_user.id, Integration.platform == platform)
    result = await db.execute(stmt)
    integration = result.scalars().first()
    
    if not integration:
        integration = Integration(user_id=current_user.id, platform=platform)
        db.add(integration)
        
    integration.access_token_encrypted = encrypted_at
    integration.refresh_token_encrypted = encrypted_rt
    integration.token_expires_at = expires_at
    integration.is_active = True
    integration.platform_user_id = p_user_id
    integration.platform_username = p_username
    integration.last_synced_at = datetime.utcnow()
    
    await db.commit()
    
    # Success template for popup
    return """
    <html><body><script>
    window.opener.postMessage({success: true, platform: '%s'}, "*");
    window.close();
    </script></body></html>
    """ % platform

@router.delete("/{platform}")
async def disconnect_platform(
    platform: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Integration).where(Integration.user_id == current_user.id, Integration.platform == platform)
    result = await db.execute(stmt)
    integration = result.scalars().first()
    
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
        
    integration.is_active = False
    integration.access_token_encrypted = None
    integration.refresh_token_encrypted = None
    
    await db.commit()
    return {"message": f"{platform} disconnected successfully"}


@router.get("/")
async def list_integrations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Integration).where(Integration.user_id == current_user.id)
    result = await db.execute(stmt)
    integrations = result.scalars().all()
    
    return [
        {
            "platform": i.platform,
            "status": "connected" if i.is_active else "disconnected",
            "username": i.platform_username,
            "last_synced": i.last_synced_at,
            "error": i.sync_error
        } for i in integrations
    ]
