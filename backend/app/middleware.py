"""
Rate limit middleware — uses Redis sliding window when Redis is available.
Falls back silently to pass-through if Redis is not configured or unavailable.
"""
import time
import logging
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from .config import settings

logger = logging.getLogger("cozyjet.middleware")


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

        try:
            now = time.time()
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
                    headers={"Retry-After": str(window)},
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Rate limit check failed, skipping: {e}")

        return await call_next(request)
