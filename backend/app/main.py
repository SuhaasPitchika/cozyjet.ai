"""
CozyJet AI Studio — FastAPI Entry Point
─────────────────────────────────────────────────────────────────────────────
Routers mounted:
  /api/auth          → auth.py       (signup, login, logout, refresh, /me)
  /api/skippy        → skippy.py     (enhance, voice, screenshot, sync-now, seeds)
  /api/meta          → meta.py       (generate, repurpose, refine, approve, content)
  /api/snooks        → snooks.py     (suggest, calendar, trends, experiment)
  /api/audio         → audio.py      (speak, transcribe)
  /api/integrations  → integrations  (connect, callback, status, disconnect)
  /api/analytics     → analytics.py  (track, summary, top-performing)
  /api/tune          → tune.py       (samples, process, voice-profile)

WebSocket:
  /ws/main?token=    → websocket.py  (Skippy/Snooks/Meta chat + Redis pub/sub)

Security:
  CORS with per-environment allowed origins (Replit + localhost)
  Redis sliding-window rate limiting (graceful no-op when Redis is absent)
  JWT auth on every protected route via get_current_user dependency
  AES-256 Fernet encryption on all OAuth tokens at rest
"""
import logging
import logging.config
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .middleware import RateLimitMiddleware

# ── Logging ──────────────────────────────────────────────────────────────────

logging.config.dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
        }
    },
    "root": {"level": "INFO", "handlers": ["console"]},
    "loggers": {
        "cozyjet": {"level": "DEBUG", "propagate": True},
        "uvicorn.error": {"level": "INFO"},
        "uvicorn.access": {"level": "WARNING"},
        "sqlalchemy.engine": {"level": "WARNING"},
    },
})

logger = logging.getLogger("cozyjet.main")


# ── DB table creation on startup ──────────────────────────────────────────────

async def _create_tables():
    """Create all database tables if they don't exist yet.

    Uses asyncpg — fails gracefully when DATABASE_URL is not configured
    (e.g. a dev box with no Postgres).
    """
    try:
        from .database import async_engine
        from .models import Base  # noqa: F401 — imports all model metadata

        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created / verified")
    except Exception as e:
        logger.warning(f"DB init skipped (no database configured or unavailable): {e}")


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CozyJet AI Studio starting up …")
    await _create_tables()
    yield
    logger.info("CozyJet AI Studio shutting down …")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="CozyJet AI Studio",
    description=(
        "Autonomous AI marketing engine for solopreneurs and founders. "
        "Three agents — Skippy (intelligence), Snooks (strategy), Meta (content) — "
        "working together to build your brand in public."
    ),
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)


# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

# ── Rate limiting (Redis sliding-window; no-op without Redis) ─────────────────

app.add_middleware(RateLimitMiddleware)


# ── Global exception handler ─────────────────────────────────────────────────

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    """Used by Railway, Replit, and load-balancers to verify the service is alive."""
    db_ok = False
    redis_ok = False

    try:
        from .database import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            await db.execute(__import__("sqlalchemy").text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    try:
        if settings.REDIS_URL:
            import redis.asyncio as aioredis
            r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            await r.ping()
            await r.aclose()
            redis_ok = True
    except Exception:
        pass

    return {
        "status": "online",
        "version": "2.0.0",
        "services": {
            "database": "ok" if db_ok else "unavailable",
            "redis": "ok" if redis_ok else "unavailable (rate-limiting and Celery disabled)",
        },
        "ai": {
            "openrouter": "configured" if settings.OPENROUTER_API_KEY else "missing",
            "gemini": "configured" if settings.GEMINI_API_KEY else "missing",
            "elevenlabs": "configured" if settings.ELEVENLABS_API_KEY else "missing",
        },
    }


# ── Routers ───────────────────────────────────────────────────────────────────

from .api.auth import router as auth_router
from .api.skippy import router as skippy_router
from .api.meta import router as meta_router
from .api.snooks import router as snooks_router
from .api.audio import router as audio_router
from .api.integrations import router as integrations_router
from .api.analytics import router as analytics_router
from .api.tune import router as tune_router
from .api.onboarding import router as onboarding_router
from .api.relationships import router as relationships_router
from .api.opportunities import router as opportunities_router
from .api.chat import router as chat_router

app.include_router(auth_router,          prefix="/api/auth",          tags=["Auth"])
app.include_router(onboarding_router,    prefix="/api/onboarding",    tags=["Onboarding"])
app.include_router(skippy_router,        prefix="/api/skippy",        tags=["Skippy"])
app.include_router(meta_router,          prefix="/api/meta",          tags=["Meta"])
app.include_router(snooks_router,        prefix="/api/snooks",        tags=["Snooks"])
app.include_router(audio_router,         prefix="/api/audio",         tags=["Audio"])
app.include_router(integrations_router,  prefix="/api/integrations",  tags=["Integrations"])
app.include_router(analytics_router,     prefix="/api/analytics",     tags=["Analytics"])
app.include_router(tune_router,          prefix="/api/tune",          tags=["Tune"])
app.include_router(relationships_router, prefix="/api/relationships",  tags=["Relationships"])
app.include_router(opportunities_router, prefix="/api/opportunities", tags=["Opportunities"])
app.include_router(chat_router,          prefix="/api/chat",           tags=["Chat"])


# ── WebSocket ─────────────────────────────────────────────────────────────────

from .websocket import websocket_endpoint
from fastapi import WebSocket, Query

@app.websocket("/ws/main")
async def ws_main(websocket: WebSocket, token: str = Query(...)):
    """
    Authenticated real-time channel.
    - Routes chat messages to Skippy / Snooks / Meta
    - Streams ElevenLabs audio alongside text responses
    - Forwards Celery task notifications via Redis pub/sub
    """
    await websocket_endpoint(websocket, token=token)
