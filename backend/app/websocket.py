"""
WebSocket handler: WS /ws/main?token={jwt}

- Authenticates via JWT query param
- Registers connection in Redis hash ws_connections:{user_id}
- Handles ping/pong and chat message routing to agents
- Subscribes to Redis pub/sub channel ws_user:{user_id} for push events
"""
import asyncio
import json
from fastapi import WebSocket, WebSocketDisconnect, Query
from jose import jwt, JWTError
import redis.asyncio as aioredis
from sqlalchemy.future import select

from .config import settings
from .database import AsyncSessionLocal
from .models.user import User


async def _get_user(user_id: str) -> User | None:
    async with AsyncSessionLocal() as db:
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


async def _route_chat(content: str, mode: str, user: User) -> str:
    """Route a chat message to the appropriate agent and return a response."""
    try:
        if mode == "meta":
            from .agents.meta import meta_agent
            result = await meta_agent.generate_from_idea(content, user.voice_profile or {}, ["linkedin", "twitter"])
            first_variation = next(iter(result.values()), [""])[0] if result else ""
            return first_variation or "I couldn't generate content right now. Please try again."
        elif mode == "refine":
            return "Please use the /api/meta/refine endpoint for content refinement."
        else:
            from .agents.skippy import skippy_agent
            seed = await skippy_agent.process_activity(content, platform="chat")
            return seed.get("description", "Got it — I've noted that as a content seed.")
    except Exception as e:
        return f"Error processing your message: {str(e)}"


async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    # Authenticate
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

    r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    connection_key = f"ws_connections:{user_id}"
    await r.hset(connection_key, "status", "connected")
    await r.expire(connection_key, 86400)

    pubsub = r.pubsub()
    await pubsub.subscribe(f"ws_user:{user_id}")

    async def _listen_pubsub():
        """Forward Redis pub/sub messages to the WebSocket client."""
        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    await websocket.send_text(message["data"])
                except Exception:
                    break

    pubsub_task = asyncio.create_task(_listen_pubsub())

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
                # Send typing indicator
                await websocket.send_text(json.dumps({"type": "typing", "agent": mode}))
                response = await _route_chat(content, mode, user)
                await websocket.send_text(json.dumps({
                    "type": "chat_response",
                    "agent": mode,
                    "content": response,
                }))

            else:
                await websocket.send_text(json.dumps({"type": "error", "message": f"Unknown message type: {msg_type}"}))

    except WebSocketDisconnect:
        pass
    finally:
        pubsub_task.cancel()
        await pubsub.unsubscribe(f"ws_user:{user_id}")
        await r.hdel(connection_key, "status")
        await r.aclose()
