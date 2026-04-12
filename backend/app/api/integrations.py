import secrets
import httpx
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import redis.asyncio as aioredis

from ..config import settings
from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..models.integration import Integration, IntegrationPlatform
from ..models.content_seed import ContentSeed
from ..services.encryption_service import encrypt_token, decrypt_token
from ..schemas.integration import IntegrationStatus, OAuthConnectResponse

router = APIRouter()

# --- OAuth config per platform ---
OAUTH_CONFIG = {
    "github": {
        "auth_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token",
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "scope": "repo read:user",
    },
    "notion": {
        "auth_url": "https://api.notion.com/v1/oauth/authorize",
        "token_url": "https://api.notion.com/v1/oauth/token",
        "client_id": settings.NOTION_CLIENT_ID,
        "client_secret": settings.NOTION_CLIENT_SECRET,
        "scope": "",
    },
    "figma": {
        "auth_url": "https://www.figma.com/oauth",
        "token_url": "https://www.figma.com/api/oauth/token",
        "client_id": settings.FIGMA_CLIENT_ID,
        "client_secret": settings.FIGMA_CLIENT_SECRET,
        "scope": "file_read",
    },
    "google_drive": {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "scope": "https://www.googleapis.com/auth/drive.readonly",
    },
    "google_calendar": {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "scope": "https://www.googleapis.com/auth/calendar.readonly",
    },
    "linkedin": {
        "auth_url": "https://www.linkedin.com/oauth/v2/authorization",
        "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "client_secret": settings.LINKEDIN_CLIENT_SECRET,
        "scope": "r_liteprofile r_emailaddress w_member_social",
    },
    "twitter": {
        "auth_url": "https://twitter.com/i/oauth2/authorize",
        "token_url": "https://api.twitter.com/2/oauth2/token",
        "client_id": settings.TWITTER_CLIENT_ID,
        "client_secret": settings.TWITTER_CLIENT_SECRET,
        "scope": "tweet.read tweet.write users.read offline.access",
    },
    "instagram": {
        "auth_url": "https://api.instagram.com/oauth/authorize",
        "token_url": "https://api.instagram.com/oauth/access_token",
        "client_id": settings.INSTAGRAM_CLIENT_ID,
        "client_secret": settings.INSTAGRAM_CLIENT_SECRET,
        "scope": "instagram_basic instagram_content_publish",
    },
}


def _redirect_uri(platform: str) -> str:
    return f"{settings.FRONTEND_URL}/api/integrations/callback/{platform}"


async def _get_redis():
    return aioredis.from_url(settings.REDIS_URL, decode_responses=True)


@router.get("/connect/{platform}", response_model=OAuthConnectResponse)
async def connect_integration(platform: str, user: User = Depends(get_current_user)):
    if platform not in OAUTH_CONFIG:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")

    cfg = OAUTH_CONFIG[platform]
    if not cfg.get("client_id"):
        raise HTTPException(status_code=501, detail=f"{platform} OAuth not configured on this server")

    state = secrets.token_urlsafe(32)
    state_key = f"oauth_state:{state}"

    r = await _get_redis()
    await r.setex(state_key, 300, str(user.id))  # 5 minute TTL
    await r.aclose()

    params = {
        "client_id": cfg["client_id"],
        "redirect_uri": _redirect_uri(platform),
        "state": state,
        "response_type": "code",
    }
    if cfg.get("scope"):
        params["scope"] = cfg["scope"]

    if platform in ("google_drive", "google_calendar"):
        params["access_type"] = "offline"
        params["prompt"] = "consent"

    from urllib.parse import urlencode
    auth_url = f"{cfg['auth_url']}?{urlencode(params)}"
    return {"authorization_url": auth_url, "state": state}


@router.get("/callback/{platform}")
async def oauth_callback(
    platform: str,
    code: str,
    state: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    if platform not in OAUTH_CONFIG:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")

    r = await _get_redis()
    state_key = f"oauth_state:{state}"
    user_id = await r.get(state_key)
    if not user_id:
        await r.aclose()
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state")
    await r.delete(state_key)

    cfg = OAUTH_CONFIG[platform]
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            cfg["token_url"],
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": _redirect_uri(platform),
                "client_id": cfg["client_id"],
                "client_secret": cfg["client_secret"],
            },
            headers={"Accept": "application/json"},
        )

    if token_resp.status_code != 200:
        await r.aclose()
        raise HTTPException(status_code=502, detail="Failed to exchange OAuth code for tokens")

    token_data = token_resp.json()
    access_token_raw = token_data.get("access_token", "")
    refresh_token_raw = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in")
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in) if expires_in else None

    encrypted_access = encrypt_token(access_token_raw)
    encrypted_refresh = encrypt_token(refresh_token_raw) if refresh_token_raw else None

    # Resolve platform username
    platform_username = None
    platform_user_id = None
    try:
        async with httpx.AsyncClient() as client:
            if platform == "github":
                me = await client.get("https://api.github.com/user", headers={"Authorization": f"Bearer {access_token_raw}"})
                if me.status_code == 200:
                    d = me.json()
                    platform_username = d.get("login")
                    platform_user_id = str(d.get("id"))
            elif platform == "notion":
                me = await client.get("https://api.notion.com/v1/users/me", headers={"Authorization": f"Bearer {access_token_raw}", "Notion-Version": "2022-06-28"})
                if me.status_code == 200:
                    d = me.json()
                    platform_username = d.get("name")
                    platform_user_id = d.get("id")
            elif platform == "figma":
                me = await client.get("https://api.figma.com/v1/me", headers={"Authorization": f"Bearer {access_token_raw}"})
                if me.status_code == 200:
                    d = me.json()
                    platform_username = d.get("handle")
                    platform_user_id = str(d.get("id"))
    except Exception:
        pass

    # Upsert integration record
    from sqlalchemy.dialects.postgresql import insert as pg_insert
    stmt = select(Integration).where(Integration.user_id == user_id, Integration.platform == platform)
    result = await db.execute(stmt)
    integration = result.scalar_one_or_none()

    if integration:
        integration.access_token = encrypted_access
        integration.refresh_token = encrypted_refresh
        integration.token_expires_at = expires_at
        integration.platform_username = platform_username
        integration.platform_user_id = platform_user_id
        integration.is_active = True
        integration.sync_error = None
    else:
        integration = Integration(
            user_id=user_id,
            platform=IntegrationPlatform(platform),
            access_token=encrypted_access,
            refresh_token=encrypted_refresh,
            token_expires_at=expires_at,
            platform_username=platform_username,
            platform_user_id=platform_user_id,
            scopes=cfg.get("scope", "").split(),
            is_active=True,
        )
        db.add(integration)

    await db.commit()

    # Publish connected event to Redis pub/sub for WebSocket delivery
    await r.publish(f"ws_user:{user_id}", f'{{"type":"integration_connected","platform":"{platform}"}}')
    await r.aclose()

    return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard/skippy?connected={platform}")


@router.get("/status", response_model=list[IntegrationStatus])
async def integration_status(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from datetime import timedelta
    stmt = select(Integration).where(Integration.user_id == user.id)
    result = await db.execute(stmt)
    integrations = result.scalars().all()

    since_24h = datetime.utcnow() - timedelta(hours=24)

    output = []
    for intg in integrations:
        seed_stmt = select(ContentSeed).where(
            ContentSeed.user_id == user.id,
            ContentSeed.source_platform == intg.platform.value,
            ContentSeed.created_at >= since_24h,
        )
        seed_result = await db.execute(seed_stmt)
        seeds_count = len(seed_result.scalars().all())

        output.append(IntegrationStatus(
            platform=intg.platform.value,
            is_active=intg.is_active,
            last_synced_at=intg.last_synced_at,
            platform_username=intg.platform_username,
            seeds_last_24h=seeds_count,
            sync_error=intg.sync_error,
        ))

    return output


@router.delete("/{platform}")
async def disconnect_integration(platform: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Integration).where(Integration.user_id == user.id, Integration.platform == platform)
    result = await db.execute(stmt)
    integration = result.scalar_one_or_none()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    integration.is_active = False
    integration.access_token = ""
    integration.refresh_token = None
    await db.commit()

    return {"success": True, "message": f"{platform} disconnected"}
