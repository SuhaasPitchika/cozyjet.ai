import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

logger = logging.getLogger("cozyjet.api.auth")

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
        algorithm=settings.JWT_ALGORITHM,
    )


@router.post("/signup", status_code=201)
async def signup(
    data: SignupRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    request_id = getattr(request.state, "request_id", "-")
    logger.info("Signup attempt  email=%s  request_id=%s", data.email, request_id)

    try:
        existing = await db.execute(
            select(User).where(User.email == data.email)
        )
        if existing.scalar_one_or_none():
            logger.warning("Signup rejected — email already registered: %s", data.email)
            raise HTTPException(status_code=400, detail="Email already registered")

        if len(data.password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        if len(data.password.encode("utf-8")) > 1024:
            raise HTTPException(status_code=400, detail="Password too long")
        if not data.display_name.strip():
            raise HTTPException(status_code=400, detail="display_name is required")

        user = User(
            email=data.email,
            password_hash=pwd.hash(data.password),
            display_name=data.display_name.strip(),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        logger.info("User created  user_id=%s  email=%s", user.id, user.email)
        return {
            "access_token": make_token(str(user.id)),
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "display_name": user.display_name,
                "onboarding_complete": user.onboarding_complete,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Signup failed  email=%s  request_id=%s", data.email, request_id)
        raise HTTPException(status_code=500, detail="Signup failed. Please try again.") from e


@router.post("/login")
async def login(
    data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    request_id = getattr(request.state, "request_id", "-")
    logger.info("Login attempt  email=%s  request_id=%s", data.email, request_id)

    try:
        result = await db.execute(
            select(User).where(User.email == data.email)
        )
        user = result.scalar_one_or_none()
        if not user or not pwd.verify(data.password, user.password_hash):
            logger.warning("Login failed — invalid credentials  email=%s", data.email)
            raise HTTPException(status_code=401, detail="Invalid credentials")

        logger.info("Login successful  user_id=%s", user.id)
        return {
            "access_token": make_token(str(user.id)),
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "display_name": user.display_name,
                "onboarding_complete": user.onboarding_complete,
                "subscription_tier": user.subscription_tier,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Login failed  email=%s  request_id=%s", data.email, request_id)
        raise HTTPException(status_code=500, detail="Login failed. Please try again.") from e


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "display_name": current_user.display_name,
        "onboarding_complete": current_user.onboarding_complete,
        "subscription_tier": current_user.subscription_tier,
        "growth_profile": current_user.growth_profile,
        "voice_profile": current_user.voice_profile,
    }
