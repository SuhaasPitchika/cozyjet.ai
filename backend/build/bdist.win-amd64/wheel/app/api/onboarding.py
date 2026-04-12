import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.onboarding import OnboardingSession
from app.services.model_router import call_openrouter

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

SYSTEM = """You are the CozyJet onboarding guide.
Understand this person deeply so every piece of content feels
like their best self on their best day.
Ask one question at a time. React naturally. Be warm and direct.
Never list questions. Talk like a smart friend.
Discover: niche, goal, current situation, fears about posting,
content style, tone, time available.
After 8 to 10 exchanges end naturally and say CozyJet is ready."""


class ChatMsg(BaseModel):
    message: str


def _exchange_count(msgs: list | None) -> int:
    return len([m for m in (msgs or []) if m.get("role") == "user"])


@router.get("/status")
async def onboarding_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(OnboardingSession).where(OnboardingSession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    gp = current_user.growth_profile or {}
    return {
        "is_complete": current_user.onboarding_complete,
        "exchange_count": _exchange_count(session.messages if session else None),
        "has_growth_profile": bool(gp),
        "growth_profile": gp if gp else None,
    }


@router.post("/reset")
async def onboarding_reset(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(OnboardingSession).where(OnboardingSession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()
    if session:
        session.messages = []
        session.is_complete = False
    current_user.onboarding_complete = False
    current_user.growth_profile = {}
    await db.commit()
    return {"ok": True}


@router.post("/chat")
async def chat(
    data: ChatMsg,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(OnboardingSession).where(OnboardingSession.user_id == current_user.id)
    )
    session = result.scalar_one_or_none()

    if session and session.is_complete:
        return {
            "response": "You've already finished onboarding — your growth profile is saved.",
            "is_complete": True,
            "turn": 0,
        }

    if not session:
        session = OnboardingSession(
            user_id=current_user.id,
            messages=[],
        )
        db.add(session)
        await db.flush()

    msgs = list(session.messages or [])
    msgs.append({"role": "user", "content": data.message})

    response = await call_openrouter(
        messages=[{"role": "system", "content": SYSTEM}] + msgs,
        model="anthropic/claude-3.5-sonnet",
        max_tokens=300,
        temperature=0.85,
    )

    msgs.append({"role": "assistant", "content": response})
    session.messages = msgs

    done = any(
        p in response.lower()
        for p in [
            "ready to start",
            "cozyjet is ready",
            "let's get started",
            "ready for you",
        ]
    )

    if done:
        try:
            extraction = await call_openrouter(
                [
                    {
                        "role": "system",
                        "content": "Extract growth profile. Return ONLY valid JSON. No markdown. No explanation.",
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Conversation: {json.dumps(msgs)}\n\n"
                            "Return this exact JSON filled in:\n"
                            '{"niche":"","sub_niche":"","goal":"","tone":"","content_style":[],'
                            '"fear":"","time_available_minutes":0,"positioning_opportunity":"",'
                            '"psychological_profile":""}'
                        ),
                    },
                ],
                model="anthropic/claude-3.5-sonnet",
                max_tokens=400,
                temperature=0.1,
            )
            current_user.growth_profile = json.loads(extraction)
            current_user.onboarding_complete = True
            session.is_complete = True
        except Exception:
            pass

    await db.commit()

    gp_out = (current_user.growth_profile or {}) if done else None
    ex = len([m for m in msgs if m.get("role") == "user"])
    return {
        "reply": response,
        "response": response,
        "is_complete": done,
        "exchange_count": ex,
        "growth_profile": gp_out if gp_out else None,
        "turn": ex,
    }
