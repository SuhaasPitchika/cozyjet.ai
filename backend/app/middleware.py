"""
Middleware collection for CozyJet API.

RequestIDMiddleware   — attaches a unique X-Request-ID to every request/response.
LoggingMiddleware     — structured request/response logging with timing.
RateLimitMiddleware   — Redis sliding-window rate limiting (pass-through when Redis
                        is not configured or unavailable).
"""
import time
import uuid
import logging
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from .config import settings

logger = logging.getLogger("cozyjet.middleware")


# ── Request ID ────────────────────────────────────────────────────

class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach a unique request ID to every request for end-to-end tracing."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


# ── Request / Response Logging ────────────────────────────────────

_SKIP_LOG_PATHS = {"/health", "/health/db", "/docs", "/openapi.json", "/redoc"}


class LoggingMiddleware(BaseHTTPMiddleware):
    """Log every request with method, path, status code, and elapsed time."""

    async def dispatch(self, request: Request, call_next):
        if request.url.path in _SKIP_LOG_PATHS:
            return await call_next(request)

        request_id = getattr(request.state, "request_id", "-")
        start = time.perf_counter()

        logger.info(
            "→ %s %s  request_id=%s  client=%s",
            request.method,
            request.url.path,
            request_id,
            request.client.host if request.client else "unknown",
        )

        try:
            response = await call_next(request)
        except Exception:
            elapsed = (time.perf_counter() - start) * 1000
            logger.exception(
                "✗ %s %s  request_id=%s  elapsed=%.1fms  UNHANDLED EXCEPTION",
                request.method,
                request.url.path,
                request_id,
                elapsed,
            )
            raise

        elapsed = (time.perf_counter() - start) * 1000
        level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(
            level,
            "← %s %s  request_id=%s  status=%d  elapsed=%.1fms",
            request.method,
            request.url.path,
            request_id,
            response.status_code,
            elapsed,
        )
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self._redis = None
        self._redis_enabled = bool(settings.REDIS_URL)

    async def _get_redis(self):
        if not self._redis_enabled:
            return None
        if self._redis is None:
            try:
                import redis.asyncio as aioredis
                self._redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
                await self._redis.ping()
            except Exception as e:
                logger.warning(f"Redis unavailable — rate limiting disabled: {e}")
                self._redis_enabled = False
                self._redis = None
        return self._redis

    async def dispatch(self, request: Request, call_next):
        r = await self._get_redis()
        if r is None:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        limit = 100
        window = 60

        if "/api/auth" in path:
            limit = 10
        elif "/api/meta/generate" in path:
            limit = 15
        elif "/api/audio/speak" in path:
            limit = 20

        key = f"rate_limit:{client_ip}:{path}"

        now = time.time()
        request_count = 0
        try:
            pipe = r.pipeline()
            pipe.zremrangebyscore(key, 0, now - window)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, window)
            results = await pipe.execute()
            request_count = results[2]

            if request_count > limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please try again later.",
                    headers={
                        "Retry-After": str(window),
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(int(now) + window),
                    },
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Rate limit check failed, skipping: {e}")

        response = await call_next(request)
        remaining = max(0, limit - request_count)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(now) + window)
        return response
