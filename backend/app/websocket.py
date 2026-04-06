"""
WebSocket handler: WS /ws/main?token={jwt}

- Authenticates via JWT query param
- Handles ping/pong and chat message routing to agents
- Skippy chat responses include ElevenLabs audio URL (voice on by default)
- Calendar intent detection: Skippy auto-detects future commitments in chat
- Redis pub/sub forwards Celery task notifications to connected clients
"""
import asyncio
import base64
import json
import logging
from uuid import UUID
from fastapi import WebSocket, WebSocketDisconnect, Query
from jose import jwt, JWTError
from sqlalchemy.future import select

from .config import settings
from .database import AsyncSessionLocal
from .models.user import User
from .models.chat_sessions import ChatSession, ChatMode as ChatSessionMode

logger = logging.getLogger("cozyjet.websocket")


async def _get_user(user_id: str):
    async with AsyncSessionLocal() as db:
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


async def _get_or_create_chat_session(user, mode: str, session_id: str | None = None):
    try:
        mode_enum = ChatSessionMode(mode)
    except ValueError:
        return None, "invalid_mode"

    async with AsyncSessionLocal() as db:
        if session_id:
            try:
                session_uuid = UUID(session_id)
            except ValueError:
                return None, "invalid_session_id"

            stmt = select(ChatSession).where(
                ChatSession.id == session_uuid,
                ChatSession.user_id == user.id,
            )
            result = await db.execute(stmt)
            session = result.scalar_one_or_none()
            if not session:
                return None, "session_not_found"
            if session.mode != mode_enum:
                return None, "mode_mismatch"
            return session, None

        session = ChatSession(
            user_id=user.id,
            mode=mode_enum,
            messages=[],
        )
        db.add(session)
        await db.flush()
        return session, None


async def _route_chat(content: str, mode: str, user) -> dict:
    """
    Route a chat message to the appropriate agent.
    Returns: {"text": str, "audio_b64": str|None, "agent": str, "extras": dict}
    """
    text_response = ""
    audio_b64 = None
    extras = {}

    try:
        if mode == "meta":
            from .agents.meta import meta_agent
            result = await meta_agent.generate_from_idea(
                content, user.voice_profile or {}, ["linkedin", "twitter"]
            )
            # Return the best variation across platforms
            if result:
                platform = list(result.keys())[0]
                variations = result[platform]
                text_response = variations[0] if variations else "I couldn't generate content right now."
            else:
                text_response = "I couldn't generate content right now."

            extras = {
                "type": "content_generated",
                "platforms": list(result.keys()) if result else [],
            }

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
                text_response = (
                    f"Here's what I'd focus on: {top.get('title', '')}. "
                    f"{top.get('reasoning', '')} "
                    f"Best on {top.get('platform', '')} on {top.get('best_day', 'Tuesday')} "
                    f"around {top.get('best_time', '9am')}."
                )
                extras = {"suggestions": suggestions}
            else:
                text_response = "Let me see more of your recent work before I can give you specific advice."

        else:
            # Skippy mode — default
            from .agents.skippy import skippy_agent

            # Check for calendar intent first
            intent_data = await skippy_agent.detect_calendar_intent(content)
            if intent_data.get("intent"):
                event = intent_data.get("event", {})
                text_response = (
                    f"Got it — I'll add '{event.get('title', content[:40])}' "
                    f"to your calendar{(' for ' + event.get('date_hint')) if event.get('date_hint') else ''}. "
                    f"I'll draft the content when it's time."
                )
                extras = {
                    "type": "calendar_intent",
                    "event": event,
                }
            else:
                # Regular Skippy — process as a content seed
                seed = await skippy_agent.process_activity(
                    content,
                    platform="chat",
                    user_context=_build_user_context(user),
                )
                text_response = seed.get("description", "Got it — I've noted that as a content seed.")
                extras = {
                    "type": "seed_created",
                    "seed": {
                        "title": seed.get("title", ""),
                        "story_hook": seed.get("story_hook", ""),
                        "content_angles": seed.get("content_angles", []),
                    },
                }

    except Exception as e:
        logger.error(f"Chat routing error (mode={mode}): {e}")
        text_response = f"I ran into an issue processing that. Try again?"

    # ElevenLabs voice — Skippy and Snooks responses are spoken by default
    # Meta content is too long for TTS; skip it
    if mode in ("skippy", "snooks") and text_response and settings.ELEVENLABS_API_KEY:
        try:
            from .services.model_router import call_elevenlabs
            voice_id = (user.voice_profile or {}).get("elevenlabs_voice_id")
            audio_bytes = await call_elevenlabs(text_response, voice_id=voice_id)
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        except Exception as e:
            logger.warning(f"ElevenLabs TTS failed (non-fatal): {e}")
            audio_b64 = None

    return {
        "text": text_response,
        "audio_b64": audio_b64,
        "agent": mode,
        "extras": extras,
    }


def _build_user_context(user) -> str:
    """Build a two-sentence user context from voice profile for Skippy."""
    profile = user.voice_profile or {}
    name = user.display_name or "a developer and creator"
    tone = profile.get("tone", "professional")
    platforms = ", ".join(profile.get("preferred_platforms", ["linkedin"]))
    style = profile.get("preferred_style", "storytelling")
    return (
        f"{name} is a {tone} creator who writes in a {style} style. "
        f"They primarily post on {platforms} and are focused on building in public."
    )


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

    redis_conn = None
    pubsub_task = None

    # Redis pub/sub: forward Celery task notifications to this client
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
            try:
                data = await websocket.receive_json()
            except ValueError:
                await websocket.send_text(
                    json.dumps({"type": "error", "message": "Invalid JSON"})
                )
                continue

            msg_type = data.get("type")

            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue

            if msg_type != "chat":
                await websocket.send_text(
                    json.dumps({"type": "error", "message": f"Unknown message type: {msg_type}"})
                )
                continue

            content = data.get("content", "")
            mode = data.get("mode", "skippy")
            session_id = data.get("session_id")

            if not isinstance(content, str) or not content.strip():
                await websocket.send_text(
                    json.dumps({"type": "error", "message": "content is required"})
                )
                continue

            session, session_error = await _get_or_create_chat_session(user, mode, session_id)
            if session_error:
                await websocket.send_text(
                    json.dumps({
                        "type": "error",
                        "message": session_error,
                    })
                )
                continue

            # Persist the user message
            session.messages = list(session.messages or []) + [{"role": "user", "content": content}]
            async with AsyncSessionLocal() as db:
                db.add(session)
                await db.commit()
                await db.refresh(session)

            # Send typing indicator immediately
            await websocket.send_text(
                json.dumps({"type": "typing", "agent": mode, "session_id": str(session.id)})
            )

            result = await _route_chat(content, mode, user)

            # Persist the assistant response
            session.messages.append({"role": "assistant", "content": result["text"]})
            async with AsyncSessionLocal() as db:
                db.add(session)
                await db.commit()
                await db.refresh(session)

            response_payload = {
                "type": "chat_response",
                "agent": result["agent"],
                "content": result["text"],
                "session_id": str(session.id),
            }

            # Include audio as base64 if available
            if result.get("audio_b64"):
                response_payload["audio_b64"] = result["audio_b64"]
                response_payload["audio_format"] = "mp3"

            if result.get("extras"):
                response_payload["extras"] = result["extras"]

            await websocket.send_text(json.dumps(response_payload))

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
