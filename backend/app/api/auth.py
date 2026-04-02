import re
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
import redis.asyncio as aioredis

from ..config import settings
from ..database import get_db
from ..models.user import User, SubscriptionTier
from ..schemas.auth import UserSignup, UserLogin, Token, UserProfile
from ..dependencies import get_current_user, oauth2_scheme

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

PASSWORD_RE = re.compile(r'^(?=.*[A-Z])(?=.*\d).{8,}$')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup, db: AsyncSession = Depends(get_db)):
    if not PASSWORD_RE.match(user_data.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters with one uppercase letter and one number",
        )

    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    verification_token = secrets.token_urlsafe(32)
    new_user = User(
        email=user_data.email,
        password_hash=pwd_context.hash(user_data.password),
        display_name=user_data.display_name,
        subscription_tier=SubscriptionTier.free,
        verification_token=verification_token,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id)})
    refresh_token = create_access_token(
        data={"sub": str(new_user.id)},
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not pwd_context.verify(user_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme), current_user: User = Depends(get_current_user)):
    # Blacklist the token in Redis for its remaining TTL
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        exp = payload.get("exp", 0)
        ttl = max(0, int(exp - datetime.utcnow().timestamp()))
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await r.setex(f"blacklist:{token}", ttl, "1")
        await r.aclose()
    except Exception:
        pass
    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=Token)
async def refresh_token(payload: dict, db: AsyncSession = Depends(get_db)):
    token = payload.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail="refresh_token is required")

    credentials_exception = HTTPException(status_code=401, detail="Invalid refresh token")
    try:
        decoded = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = decoded.get("sub")
        if not user_id:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise credentials_exception

    access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh = create_access_token(data={"sub": str(user.id)}, expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    return {"access_token": access_token, "refresh_token": new_refresh, "token_type": "bearer"}


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me/voice-profile")
async def update_voice_profile(payload: dict, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    profile = current_user.voice_profile or {}
    profile.update(payload)
    current_user.voice_profile = profile
    await db.commit()
    return {"voice_profile": current_user.voice_profile}
