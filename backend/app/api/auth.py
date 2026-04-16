from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.user import User
from app.config import settings
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])
# Use PBKDF2 only to avoid bcrypt backend/runtime issues on this environment.
pwd = CryptContext(
    schemes=["pbkdf2_sha256"],
    default="pbkdf2_sha256",
    deprecated="auto",
)


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def make_token(user_id: str) -> str:
    exp = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    return jwt.encode(
        {"sub": user_id, "exp": exp},
        settings.JWT_SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


@router.post("/signup")
async def signup(
    data: SignupRequest,
    db: AsyncSession = Depends(get_db)
):
    existing = await db.execute(
        select(User).where(User.email == data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password min 8 chars")
    if len(data.password.encode("utf-8")) > 1024:
        raise HTTPException(status_code=400, detail="Password too long")

    user = User(
        email=data.email,
        password_hash=pwd.hash(data.password),
        display_name=data.display_name
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {
        "access_token": make_token(str(user.id)),
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "display_name": user.display_name,
            "onboarding_complete": user.onboarding_complete
        }
    }


@router.post("/login")
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.email == data.email)
    )
    user = result.scalar_one_or_none()
    if not user or not pwd.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "access_token": make_token(str(user.id)),
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "display_name": user.display_name,
            "onboarding_complete": user.onboarding_complete,
            "subscription_tier": user.subscription_tier
        }
    }


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "display_name": current_user.display_name,
        "onboarding_complete": current_user.onboarding_complete,
        "subscription_tier": current_user.subscription_tier,
        "growth_profile": current_user.growth_profile,
        "voice_profile": current_user.voice_profile
    }
