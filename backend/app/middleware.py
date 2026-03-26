import time
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import redis.asyncio as redis
from .config import settings

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def dispatch(self, request: Request, call_next):
        # Identify user (by IP or User ID if authenticated)
        # For simplicity, using IP for now, or user_id from token if available
        # But middleware runs before auth dependency, so we use IP
        client_ip = request.client.host
        path = request.url.path
        
        # Define limits
        limit = 100 # Default
        window = 60 # 1 minute
        
        if "/api/auth" in path:
            limit = 5
        elif "/api/meta/generate" in path:
            limit = 10
            
        key = f"rate_limit:{client_ip}:{path}"
        
        # Sliding window with Redis sorted sets
        now = time.time()
        pipe = self.redis.pipeline()
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
                headers={"Retry-After": str(window)}
            )
            
        return await call_next(request)
