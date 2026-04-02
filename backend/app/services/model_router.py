"""
Model Router — CozyJet AI
Routes AI calls to the right model with the right temperature per task.

OpenRouter  → Skippy (activity analysis) + Meta (content generation)
ElevenLabs  → All audio/TTS generation
"""
import asyncio
import httpx
from typing import Optional
from ..config import settings

OPENROUTER_BASE = "https://openrouter.ai/api/v1"
OPENROUTER_HEADERS = {
    "Authorization": f"Bearer {settings.OPEN_ROUTER}",
    "HTTP-Referer": "https://cozyjet.ai",
    "X-Title": "CozyJet AI Studio",
    "Content-Type": "application/json",
}

ELEVENLABS_BASE = "https://api.elevenlabs.io/v1"
DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"
DEFAULT_TTS_MODEL = "eleven_turbo_v2_5"

PLATFORM_TEMPERATURES = {
    "linkedin": 0.75,
    "twitter": 0.90,
    "reddit": 0.65,
    "instagram": 0.85,
    "youtube": 0.70,
}

PLATFORM_MAX_TOKENS = {
    "linkedin": 500,
    "twitter": 350,
    "reddit": 900,
    "instagram": 300,
    "youtube": 800,
}


async def call_openrouter(
    system_prompt: str,
    user_message: str,
    model: str = "google/gemini-2.0-flash-001",
    temperature: float = 0.5,
    max_tokens: int = 1200,
    json_mode: bool = False,
) -> str:
    payload: dict = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{OPENROUTER_BASE}/chat/completions",
            headers=OPENROUTER_HEADERS,
            json=payload,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


async def call_skippy(user_message: str) -> str:
    return await call_openrouter(
        system_prompt=(
            "You are Skippy, a work intelligence agent. You read raw activity data from developer "
            "and creator tools and find the professional story worth telling. You think like a "
            "journalist who covers technology — you look for what is genuinely interesting, novel, "
            "or useful to an audience of builders and creators. You write with economy. Every word "
            "earns its place. You never pad, never generalize, never produce boilerplate."
        ),
        user_message=user_message,
        temperature=0.3,
        max_tokens=800,
        json_mode=True,
    )


async def call_meta_for_platform(
    system_prompt: str,
    user_message: str,
    platform: str,
) -> str:
    temp = PLATFORM_TEMPERATURES.get(platform, 0.8)
    tokens = PLATFORM_MAX_TOKENS.get(platform, 500)
    return await call_openrouter(
        system_prompt=system_prompt,
        user_message=user_message,
        temperature=temp,
        max_tokens=tokens,
    )


async def call_meta_parallel(
    system_prompt: str,
    user_messages: dict[str, str],
) -> dict[str, str]:
    tasks = {
        platform: call_meta_for_platform(system_prompt, msg, platform)
        for platform, msg in user_messages.items()
    }
    results = await asyncio.gather(*tasks.values(), return_exceptions=True)
    return {
        platform: (result if isinstance(result, str) else "")
        for platform, result in zip(tasks.keys(), results)
    }


async def call_snooks(user_message: str) -> str:
    return await call_openrouter(
        system_prompt=(
            "You are Snooks, a personal brand strategist. You think in growth systems, not one-off "
            "tactics. You study patterns in what actually works for this specific person with this "
            "specific audience, identify the underlying reasons why, and build repeatable strategies "
            "from those reasons. You are direct, data-driven, and contrarian when the data supports "
            "it. You never give advice that would apply to anyone — everything you say is specific "
            "to this person."
        ),
        user_message=user_message,
        model="google/gemini-2.0-flash-001",
        temperature=0.5,
        max_tokens=1500,
        json_mode=True,
    )


async def generate_hook(topic: str, platform: str, top_hooks: list[str]) -> str:
    examples = "\n".join([f"- {h}" for h in top_hooks[:3]]) if top_hooks else "None yet."
    prompt = (
        f"Write ONE opening hook line for a {platform} post about: {topic}\n\n"
        f"Examples of this user's best-performing hooks:\n{examples}\n\n"
        f"The hook must create curiosity, tension, surprise, or a strong opinion in under fifteen words. "
        f"Return ONLY the hook line — nothing else."
    )
    return await call_openrouter(
        system_prompt=(
            "You are a hook writer. You write opening lines that stop the scroll. "
            "Be specific. Be bold. Never use cliches."
        ),
        user_message=prompt,
        temperature=0.9,
        max_tokens=60,
    )


async def generate_audio_elevenlabs(
    text: str,
    voice_id: str = DEFAULT_VOICE_ID,
    api_key: Optional[str] = None,
) -> bytes:
    key = api_key or settings.ELEVENLABS_API_KEY
    if not key:
        raise ValueError("ELEVENLABS_API_KEY is not configured")

    clean_text = (
        text
        .replace("#", "")
        .replace("@", "at ")
        .replace("→", ".")
        .replace("•", ".")
    )

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{ELEVENLABS_BASE}/text-to-speech/{voice_id}",
            headers={
                "xi-api-key": key,
                "Content-Type": "application/json",
            },
            json={
                "text": clean_text[:2500],
                "model_id": DEFAULT_TTS_MODEL,
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                },
            },
        )
        resp.raise_for_status()
        return resp.content


async def transcribe_audio_elevenlabs(
    audio_bytes: bytes,
    filename: str = "audio.webm",
    api_key: Optional[str] = None,
) -> str:
    key = api_key or settings.ELEVENLABS_API_KEY
    if not key:
        raise ValueError("ELEVENLABS_API_KEY is not configured")

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{ELEVENLABS_BASE}/speech-to-text",
            headers={"xi-api-key": key},
            files={"file": (filename, audio_bytes, "audio/webm")},
            data={"model_id": "scribe_v1"},
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("text", "")
