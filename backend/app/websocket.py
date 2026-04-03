"""
WebSocket handler: WS /ws/main?token={jwt}

- Authenticates via JWT query param
- Handles ping/pong and chat message routing to agents
- Redis pub/sub used if REDIS_URL is configured; gracefully skipped otherwise
"""
import asyncio
import json
import logging
from fastapi import WebSocket, WebSocketDisconnect, Query
from jose import jwt, JWTError
from sqlalchemy.future import select

from .config import settings
from .database import AsyncSessionLocal
from .models.user import User

logger = logging.getLogger("cozyjet.websocket")


async def _get_user(user_id: str):
    async with AsyncSessionLocal() as db:
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


async def _route_chat(content: str, mode: str, user) -> str:
    try:
        if mode == "meta":
            from .agents.meta import meta_agent
            result = await meta_agent.generate_from_idea(
                content, user.voice_profile or {}, ["linkedin", "twitter"]
            )
            first = next(iter(result.values()), [""])[0] if result else ""
            return first or "I couldn't generate content right now."

        elif mode == "snooks":
            from .agents.snooks import snooks_agent
            result = await snooks_agent.suggest_content(
                seeds_summary=content,
                trends_summary="",
                voice_profile=user.voice_profile or {},
            )
            suggestions = result.get("suggestions", [])
            if suggestions:
                top = suggestions[0]
                return f"{top.get('title', '')} — {top.get('reasoning', '')}"
            return "No specific suggestions right now — try adding more content seeds."

        else:
            from .agents.skippy import skippy_agent
            seed = await skippy_agent.process_activity(content, platform="chat")
            return seed.get("description", "Got it — I've noted that as a content seed.")

    except Exception as e:
        logger.error(f"Chat routing error (mode={mode}): {e}")
        return f"I ran into an issue: {str(e)}"


async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
    except JWTError:
        await websocket.close(code=4001)
        return

    user = await _get_user(user_id)
    if not user:
        await websocket.close(code=4001)
        return

    await websocket.accept()

    redis_conn = None
    pubsub_task = None

    if settings.REDIS_URL:
        try:
            import redis.asyncio as aioredis
            redis_conn = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            await redis_conn.ping()
            pubsub = redis_conn.pubsub()
            await pubsub.subscribe(f"ws_user:{user_id}")
            await redis_conn.hset(f"ws_connections:{user_id}", "status", "connected")
            await redis_conn.expire(f"ws_connections:{user_id}", 86400)

            async def _listen():
                async for message in pubsub.listen():
                    if message["type"] == "message":
                        try:
                            await websocket.send_text(message["data"])
                        except Exception:
                            break

            pubsub_task = asyncio.create_task(_listen())
        except Exception as e:
            logger.warning(f"Redis unavailable — WebSocket pub/sub disabled: {e}")
            redis_conn = None

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"type": "error", "message": "Invalid JSON"}))
                continue

            msg_type = data.get("type")

            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

            elif msg_type == "chat":
                content = data.get("content", "")
                mode = data.get("mode", "skippy")
                await websocket.send_text(json.dumps({"type": "typing", "agent": mode}))
                response = await _route_chat(content, mode, user)
                await websocket.send_text(json.dumps({
                    "type": "chat_response",
                    "agent": mode,
                    "content": response,
                }))

            else:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": f"Unknown message type: {msg_type}",
                }))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if pubsub_task:
            pubsub_task.cancel()
        if redis_conn:
            try:
                await redis_conn.hdel(f"ws_connections:{user_id}", "status")
                await redis_conn.aclose()
            except Exception:
                pass
