"""
Chat API — REST chat endpoint for AI conversation.
POST /api/chat/message — Send a chat message to Skippy, Snooks, or Meta.
GET  /api/chat/sessions  — List active chat sessions.
GET  /api/chat/sessions/{session_id} — Fetch a session's messages.
"""
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..dependencies import get_current_user
from ..models.chat_sessions import ChatSession, ChatMode as ChatSessionMode
from ..models.user import User
from ..websocket import _route_chat

router = APIRouter()


class ChatMode(str, Enum):
    skippy = "skippy"
    snooks = "snooks"
    meta = "meta"


class ChatRequest(BaseModel):
    content: str
    mode: ChatMode = ChatMode.skippy
    session_id: Optional[str] = None


class ChatSessionResponse(BaseModel):
    id: str
    mode: ChatMode
    message_count: int
    created_at: str
    updated_at: Optional[str] = None


async def _get_or_create_chat_session(
    user: User,
    mode: ChatMode,
    db: AsyncSession,
    session_id: Optional[str] = None,
) -> ChatSession:
    if session_id:
        try:
            session_uuid = UUID(session_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid session_id")

        result = await db.execute(
            select(ChatSession).where(
                ChatSession.id == session_uuid,
                ChatSession.user_id == user.id,
            )
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        if session.mode != ChatSessionMode(mode.value):
            raise HTTPException(
                status_code=400,
                detail="Session mode mismatch. Use the same mode for an existing session.",
            )
        return session

    session = ChatSession(
        user_id=user.id,
        mode=ChatSessionMode(mode.value),
        messages=[],
    )
    db.add(session)
    await db.flush()
    return session


@router.post("/message")
async def message_chat(
    body: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a chat message through CozyJet's AI chat backend."""
    if not body.content.strip():
        raise HTTPException(status_code=400, detail="content is required")

    session = await _get_or_create_chat_session(user, body.mode, db, body.session_id)
    session.messages = list(session.messages or []) + [{"role": "user", "content": body.content}]

    try:
        response = await _route_chat(body.content, body.mode.value, user)
    except Exception as e:
        raise HTTPException(status_code=503, detail="AI service unavailable") from e

    session.messages.append({"role": "assistant", "content": response["text"]})
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return {
        "session_id": str(session.id),
        "response": response["text"],
        "agent": response["agent"],
        "audio_b64": response.get("audio_b64"),
        "extras": response.get("extras", {}),
    }


@router.get("/sessions")
async def list_chat_sessions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == user.id).order_by(ChatSession.updated_at.desc())
    )
    sessions = result.scalars().all()
    return {
        "sessions": [
            {
                "id": str(session.id),
                "mode": session.mode.value,
                "message_count": len(session.messages or []),
                "created_at": session.created_at.isoformat(),
                "updated_at": session.updated_at.isoformat() if session.updated_at else None,
            }
            for session in sessions
        ]
    }


@router.get("/sessions/{session_id}")
async def get_chat_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        session_uuid = UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session_id")

    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == session_uuid,
            ChatSession.user_id == user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    return {
        "id": str(session.id),
        "mode": session.mode.value,
        "messages": session.messages or [],
        "created_at": session.created_at.isoformat(),
        "updated_at": session.updated_at.isoformat() if session.updated_at else None,
    }


@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        session_uuid = UUID(session_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session_id")

    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == session_uuid,
            ChatSession.user_id == user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    await db.delete(session)
    await db.commit()
    return {"message": "Chat session deleted"}
