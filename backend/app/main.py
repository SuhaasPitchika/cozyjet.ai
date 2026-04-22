import logging
import time

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
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
from app.middleware import LoggingMiddleware, RateLimitMiddleware, RequestIDMiddleware
from app.models import *  # noqa: F401,F403

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)
logger = logging.getLogger("cozyjet.main")

app = FastAPI(
    title="CozyJet API",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

allowed_origins = settings.ALLOWED_ORIGINS or [settings.FRONTEND_URL, "http://localhost:3000"]

# ── Middleware (outermost = first to run on request, last on response) ──

# 1. Request ID — must be first so all subsequent middleware can read it
app.add_middleware(RequestIDMiddleware)

# 2. Structured request/response logging
app.add_middleware(LoggingMiddleware)

# 3. GZip compression for responses > 1 KB
app.add_middleware(GZipMiddleware, minimum_size=1024)

# 4. CORS — explicit expose_headers so clients can read tracing/rate-limit headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=[
        "X-Request-ID",
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "Retry-After",
    ],
    max_age=600,
)

# 5. Redis-backed rate limiting (no-op when Redis is not configured)
app.add_middleware(RateLimitMiddleware)

# ── Routers ───────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(onboarding_router)
app.include_router(skippy_router)
app.include_router(meta_router)
app.include_router(tune_router)
app.include_router(analytics_router)
app.include_router(ws_router)


# ── Lifecycle ─────────────────────────────────────────────────────

@app.on_event("startup")
async def on_startup():
    logger.info("=" * 60)
    logger.info("CozyJet API starting up")
    logger.info("  environment   : %s", settings.ENVIRONMENT)
    logger.info("  frontend URL  : %s", settings.FRONTEND_URL)
    logger.info("  allowed origins (%d): %s", len(allowed_origins), sorted(allowed_origins))
    logger.info("  database      : %s", "configured" if settings.DATABASE_URL else "NOT SET")
    logger.info("  redis         : %s", "configured" if settings.REDIS_URL else "not configured")
    logger.info("  openrouter    : %s", "configured" if settings.OPENROUTER_API_KEY else "NOT SET")
    logger.info("  elevenlabs    : %s", "configured" if settings.ELEVENLABS_API_KEY else "not configured")
    logger.info("  gemini        : %s", "configured" if settings.GEMINI_API_KEY else "not configured")
    logger.info(
        "  api docs      : %s",
        "disabled (production)" if settings.ENVIRONMENT == "production" else "/docs",
    )
    logger.info("=" * 60)


# ── Exception Handlers ────────────────────────────────────────────

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "-")
    logger.exception(
        "Unhandled error on %s %s  request_id=%s",
        request.method,
        request.url.path,
        request_id,
    )
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": {
                "code": "internal_server_error",
                "message": "An unexpected error occurred. Please try again.",
                "details": None,
            },
        },
        headers={"X-Request-ID": request_id},
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    request_id = getattr(request.state, "request_id", "-")
    logger.warning(
        "Validation error on %s %s: %s  request_id=%s",
        request.method,
        request.url.path,
        str(exc),
        request_id,
    )
    return JSONResponse(
        status_code=400,
        content={
            "status": "error",
            "error": {
                "code": "bad_request",
                "message": str(exc),
                "details": None,
            },
        },
        headers={"X-Request-ID": request_id},
    )


# ── Health Endpoints ──────────────────────────────────────────────

@app.get("/health", tags=["health"])
async def health():
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
        "timestamp": time.time(),
    }


@app.get("/health/db", tags=["health"])
async def health_db(db: AsyncSession = Depends(get_db)):
    start = time.perf_counter()
    await db.execute(text("SELECT 1"))
    elapsed_ms = (time.perf_counter() - start) * 1000
    return {
        "status": "ok",
        "database": "connected",
        "latency_ms": round(elapsed_ms, 2),
    }
