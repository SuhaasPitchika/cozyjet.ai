"""
Model Router — CozyJet AI
─────────────────────────────────────────────────────────────────
OpenAI SDK → OpenRouter    : Meta content generation, Skippy analysis
google-generativeai        : Snooks strategic analysis (long context)
ElevenLabs SDK             : All audio generation and transcription

Every call to OpenRouter includes HTTP-Referer and X-Title headers.
"""
import asyncio
import logging
from typing import Optional

from openai import AsyncOpenAI

logger = logging.getLogger("cozyjet.model_router")


# ── Platform-level constants ─────────────────────────────────────
PLATFORM_TEMPERATURES: dict[str, float] = {
    "linkedin": 0.75,
    "twitter": 0.90,
    "reddit": 0.65,
    "instagram": 0.85,
    "youtube": 0.70,
}

PLATFORM_MAX_TOKENS: dict[str, int] = {
    "linkedin": 400,
    "twitter": 300,
    "reddit": 900,
    "instagram": 300,
    "youtube": 800,
}


# ── Lazy client constructors (avoid import-time settings reads) ──
def _openrouter_client() -> AsyncOpenAI:
    from ..config import settings
    return AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.OPENROUTER_API_KEY,
        default_headers={
            "HTTP-Referer": "https://cozyjet.ai",
            "X-Title": "CozyJet AI Studio",
        },
    )


def _get_gemini_model(model_name: str = "gemini-1.5-flash"):
    import google.generativeai as genai
    from ..config import settings
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(model_name)


def _elevenlabs_client():
    from elevenlabs import ElevenLabs
    from ..config import settings
    return ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)


# ── Core call functions ───────────────────────────────────────────

async def call_openrouter(
    system_prompt: str,
    user_message: str,
    model: Optional[str] = None,
    temperature: float = 0.5,
    max_tokens: int = 1200,
    json_mode: bool = False,
) -> str:
    from ..config import settings
    model = model or settings.OPENROUTER_DEFAULT_MODEL
    client = _openrouter_client()

    kwargs: dict = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    try:
        resp = await client.chat.completions.create(**kwargs)
        return resp.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"OpenRouter call failed (model={model}): {e}")
        # Retry once with fallback model
        if model != settings.OPENROUTER_FALLBACK_MODEL:
            kwargs["model"] = settings.OPENROUTER_FALLBACK_MODEL
            try:
                resp = await client.chat.completions.create(**kwargs)
                return resp.choices[0].message.content.strip()
            except Exception as e2:
                logger.error(f"Fallback model also failed: {e2}")
        raise


async def call_gemini(
    system_prompt: str,
    user_message: str,
    temperature: float = 0.5,
    max_tokens: int = 2048,
) -> str:
    import google.generativeai as genai
    from google.generativeai.types import GenerationConfig

    model = _get_gemini_model("gemini-1.5-flash")
    full_prompt = f"{system_prompt}\n\n{user_message}"
    config = GenerationConfig(temperature=temperature, max_output_tokens=max_tokens)

    loop = asyncio.get_event_loop()
    try:
        response = await loop.run_in_executor(
            None,
            lambda: model.generate_content(full_prompt, generation_config=config)
        )
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini call failed: {e}")
        raise


# ── Agent-specific wrappers ───────────────────────────────────────

async def call_meta(
    system_prompt: str,
    user_message: str,
    platform: str,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
) -> str:
    temp = temperature if temperature is not None else PLATFORM_TEMPERATURES.get(platform, 0.85)
    tokens = max_tokens if max_tokens is not None else PLATFORM_MAX_TOKENS.get(platform, 500)
    return await call_openrouter(
        system_prompt=system_prompt,
        user_message=user_message,
        temperature=temp,
        max_tokens=tokens,
    )


async def call_skippy(user_message: str, system_prompt: str) -> str:
    return await call_openrouter(
        system_prompt=system_prompt,
        user_message=user_message,
        model="mistralai/mistral-7b-instruct",
        temperature=0.3,
        max_tokens=800,
        json_mode=True,
    )


async def call_snooks(user_message: str, system_prompt: str) -> str:
    return await call_gemini(
        system_prompt=system_prompt,
        user_message=user_message,
        temperature=0.5,
        max_tokens=2048,
    )


async def call_hook_generator(topic: str, platform: str, top_hooks: list[str]) -> str:
    examples = "\n".join([f"- {h}" for h in top_hooks[:3]]) if top_hooks else "None yet."
    system = (
        "You are a hook writer. You write opening lines that stop the scroll. "
        "Be specific, bold, never cliched."
    )
    user = (
        f"Write ONE opening hook for a {platform} post about: {topic}\n\n"
        f"User's best-performing hooks:\n{examples}\n\n"
        f"Must create curiosity, tension, surprise, or a strong opinion. Under 15 words. "
        f"Return ONLY the hook line."
    )
    return await call_openrouter(
        system_prompt=system,
        user_message=user,
        model="mistralai/mistral-7b-instruct",
        temperature=0.9,
        max_tokens=50,
    )


async def call_intent_classifier(text: str) -> str:
    system = (
        "You are a calendar intent classifier. Determine if the user message implies "
        "a future commitment, deadline, or scheduled activity. "
        "Return ONLY JSON: {\"intent\": true/false, \"event\": {\"title\": \"\", \"date_hint\": \"\", \"platform\": \"\"}}"
    )
    return await call_openrouter(
        system_prompt=system,
        user_message=text,
        model="mistralai/mistral-7b-instruct",
        temperature=0.1,
        max_tokens=120,
        json_mode=True,
    )


# ── ElevenLabs audio ─────────────────────────────────────────────

def _clean_for_speech(text: str) -> str:
    return (
        text
        .replace("#", "")
        .replace("@", "at ")
        .replace("→", ". ")
        .replace("•", ". ")
        .replace("**", "")
        .replace("*", "")
    )[:2500]


async def call_elevenlabs(text: str, voice_id: Optional[str] = None) -> bytes:
    from ..config import settings
    from elevenlabs import ElevenLabs

    voice = voice_id or settings.ELEVENLABS_DEFAULT_VOICE_ID
    clean = _clean_for_speech(text)

    client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
    loop = asyncio.get_event_loop()

    def _generate():
        audio_iter = client.generate(
            text=clean,
            voice=voice,
            model="eleven_turbo_v2_5",
        )
        return b"".join(audio_iter)

    return await loop.run_in_executor(None, _generate)


async def call_elevenlabs_transcribe(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    import httpx
    from ..config import settings

    async with httpx.AsyncClient(timeout=60) as http:
        resp = await http.post(
            "https://api.elevenlabs.io/v1/speech-to-text",
            headers={"xi-api-key": settings.ELEVENLABS_API_KEY},
            files={"file": (filename, audio_bytes, "audio/webm")},
            data={"model_id": "scribe_v1"},
        )
        resp.raise_for_status()
        return resp.json().get("text", "")
