import logging

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router
from app.api.meta import router as meta_router
from app.api.onboarding import router as onboarding_router
from app.api.skippy import router as skippy_router
from app.api.tune import router as tune_router
from app.api.websockets import router as ws_router
from app.config import settings
from app.database import get_db
from app.models import *  # noqa: F401,F403

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)
logger = logging.getLogger("cozyjet.main")

app = FastAPI(title="CozyJet API", version="1.0.0")

allowed_origins = settings.ALLOWED_ORIGINS or [settings.FRONTEND_URL, "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(onboarding_router)
app.include_router(skippy_router)
app.include_router(meta_router)
app.include_router(tune_router)
app.include_router(analytics_router)
app.include_router(ws_router)


@app.on_event("startup")
async def on_startup():
    logger.info("CozyJet API starting")
    logger.info("Environment=%s", settings.ENVIRONMENT)
    logger.info("Frontend URL=%s", settings.FRONTEND_URL)
    logger.info("Allowed origins=%s", sorted(allowed_origins))
    logger.info("Database configured=%s", bool(settings.DATABASE_URL))


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "path": request.url.path},
    )


@app.get("/health")
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}


@app.get("/health/db")
async def health_db(db: AsyncSession = Depends(get_db)):
    await db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
