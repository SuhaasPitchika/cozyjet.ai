"""
Onboarding API
─────────────────────────────────────────────────────────────────
POST /api/onboarding/chat   — Multi-turn onboarding conversation
GET  /api/onboarding/status — Check if onboarding is complete
POST /api/onboarding/reset  — Reset onboarding (dev/testing)

The conversation is powered by Claude via OpenRouter.
After 8-10 exchanges the conversation ends naturally and a second
extraction call at temperature 0.1 builds the user's growth_profile,
which is saved to the users table and powers every agent from then on.
"""
import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..models.onboarding_session import OnboardingSession
from ..services.model_router import call_openrouter

logger = logging.getLogger("cozyjet.onboarding")

router = APIRouter()

ONBOARDING_SYSTEM = """You are the CozyJet onboarding guide. 
Your job is to understand this person deeply enough that 
every piece of content CozyJet creates feels like it came 
from their best self on their best day.

Ask one question at a time. Listen to the answer before 
asking the next thing. React like a real person would — 
if they say something interesting, acknowledge it before 
moving on. Be warm and direct. Never list questions. 
Never use bullet points. Talk like a smart friend who 
genuinely wants to help them grow.

You need to understand: their niche, their goal, their 
current situation, their fears about posting, their 
content style, their tone, and how much time they have.

After 8-10 exchanges end the conversation naturally and 
tell them CozyJet is ready to start working for them."""


class ChatRequest(BaseModel):
    message: str


async def _get_or_create_session(
    user: User,
    db: AsyncSession,
) -> OnboardingSession:
    result = await db.execute(
        select(OnboardingSession).where(OnboardingSession.user_id == user.id)
    )
    session = result.scalar_one_or_none()
    if not session:
        session = OnboardingSession(user_id=user.id, messages=[], is_complete=False)
        db.add(session)
        await db.flush()
    return session


async def _extract_growth_profile(conversation_history: list) -> dict:
    """
    Second extraction call at temperature 0.1.
    Parses the full conversation and returns a structured growth_profile.
    """
    messages_text = json.dumps(conversation_history)

    system = (
        "Extract a structured growth profile from this onboarding conversation. "
        "Return only valid JSON, nothing else."
    )
    user = (
        f"Conversation: {messages_text}\n\n"
        "Return this exact structure filled with specifics:\n"
        "{\n"
        '    "niche": "",\n'
        '    "sub_niche": "",\n'
        '    "goal": "",\n'
        '    "goal_timeline": "",\n'
        '    "current_state": "",\n'
        '    "fear": "",\n'
        '    "tone": "",\n'
        '    "content_style": [],\n'
        '    "admired_creators": [],\n'
        '    "time_available_minutes": 0,\n'
        '    "comfort_zone": "",\n'
        '    "positioning_opportunity": "",\n'
        '    "psychological_profile": ""\n'
        "}"
    )

    try:
        raw = await call_openrouter(
            system_prompt=system,
            user_message=user,
            model="anthropic/claude-3.5-sonnet",
            temperature=0.1,
            max_tokens=600,
            json_mode=True,
        )
        return json.loads(raw.strip())
    except Exception as e:
        logger.error(f"Growth profile extraction failed: {e}")
        return {}


@router.post("/chat")
async def onboarding_chat(
    body: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Multi-turn onboarding conversation.
    Each user message is appended to the session, Claude responds,
    and after 8-10 exchanges the conversation is marked complete
    and the growth_profile is extracted and saved.
    """
    session = await _get_or_create_session(user, db)

    if session.is_complete:
        return {
            "reply": "Your onboarding is already complete! CozyJet is ready to work for you.",
            "is_complete": True,
            "growth_profile": user.growth_profile,
        }

    # Append the user's message
    messages = list(session.messages or [])
    messages.append({"role": "user", "content": body.message})

    # Call Claude with the full conversation history
    try:
        openai_messages = [{"role": "system", "content": ONBOARDING_SYSTEM}] + messages
        from ..config import settings
        from openai import AsyncOpenAI

        client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
            default_headers={
                "HTTP-Referer": "https://cozyjet.ai",
                "X-Title": "CozyJet AI Studio",
            },
        )
        resp = await client.chat.completions.create(
            model="anthropic/claude-3.5-sonnet",
            messages=openai_messages,
            temperature=0.85,
            max_tokens=300,
        )
        reply = resp.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Onboarding chat call failed: {e}")
        raise HTTPException(status_code=503, detail="AI service unavailable. Please try again.")

    # Append assistant reply
    messages.append({"role": "assistant", "content": reply})
    session.messages = messages

    # Detect conversation end (8+ exchanges = 8+ user messages)
    user_message_count = sum(1 for m in messages if m["role"] == "user")
    is_complete = False

    if user_message_count >= 8:
        # Check if the reply signals completion
        completion_signals = [
            "ready to start working for you",
            "cozyjet is ready",
            "let's get started",
            "ready to work",
        ]
        if any(signal in reply.lower() for signal in completion_signals) or user_message_count >= 10:
            is_complete = True
            session.is_complete = True

            # Extract growth profile
            growth_profile = await _extract_growth_profile(messages)
            if growth_profile:
                user.growth_profile = growth_profile
                user.onboarding_complete = True
                db.add(user)
                logger.info(f"Growth profile extracted for user {user.id}")

    db.add(session)
    await db.commit()

    return {
        "reply": reply,
        "is_complete": is_complete,
        "exchange_count": user_message_count,
        "growth_profile": user.growth_profile if is_complete else None,
    }


@router.get("/status")
async def onboarding_status(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Check if the user has completed onboarding."""
    session = await _get_or_create_session(user, db)
    await db.commit()

    return {
        "is_complete": session.is_complete,
        "exchange_count": sum(1 for m in (session.messages or []) if m["role"] == "user"),
        "has_growth_profile": bool(user.growth_profile),
        "growth_profile": user.growth_profile if session.is_complete else None,
    }


@router.post("/reset")
async def reset_onboarding(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reset onboarding session — for testing and re-onboarding."""
    result = await db.execute(
        select(OnboardingSession).where(OnboardingSession.user_id == user.id)
    )
    session = result.scalar_one_or_none()
    if session:
        session.messages = []
        session.is_complete = False
        db.add(session)

    user.growth_profile = {}
    user.onboarding_complete = False
    db.add(user)
    await db.commit()

    return {"message": "Onboarding reset. Start a new conversation at POST /api/onboarding/chat"}
