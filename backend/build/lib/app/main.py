"""FastAPI entrypoint. Ensures `backend/` is on sys.path when cwd is repo root (Docker/Railway)."""
import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parent.parent
_root = str(_BACKEND_ROOT)
if _root not in sys.path:
    sys.path.insert(0, _root)

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.config import settings
from app.database import get_db
from app.models import *
from app.api.auth import router as auth_router
from app.api.onboarding import router as onboarding_router
from app.api.skippy import router as skippy_router
from app.api.meta import router as meta_router

app = FastAPI(title="CozyJet API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(onboarding_router)
app.include_router(skippy_router)
app.include_router(meta_router, prefix="/api/meta", tags=["meta"])


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}


@app.get("/health/db")
async def health_db(db: AsyncSession = Depends(get_db)):
    await db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
