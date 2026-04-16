import json
import asyncio
from app.services.model_router import call_openrouter

SYSTEM = """You are Meta, an elite content writer who understands
human psychology and what makes people stop scrolling.
Never use: dive into, game-changer, in today's world,
it's important to note, delve, leverage, landscape, journey, unlock.
Write like a smart self-aware person being genuinely honest.
Always return valid JSON matching the output template exactly."""

PLATFORM_RULES = {
    "linkedin": "1200-1800 chars, professional but human, end with question, 3-5 hashtags",
    "twitter": "6-10 tweets each under 280 chars, first tweet standalone hook, numbered",
    "reddit": "detailed, community-first, no promotion, lead with value not yourself",
    "instagram": "150-300 chars, conversational, line breaks, 5-10 hashtags at end",
    "youtube": "hook in first 8 seconds, subscribe prompt at 2 min, 3 clear sections"
}


async def generate_hooks(seed: dict, platform: str, profile: dict) -> list:
    messages = [
        {"role": "system", "content": SYSTEM},
        {
            "role": "user",
            "content": json.dumps({
                "work": seed.get("story") or seed.get("description", ""),
                "platform": platform,
                "niche": profile.get("niche", ""),
                "tone": profile.get("tone", ""),
                "generate": "6 hooks",
                "each_hook": {"text": "", "mechanism": "", "score": 0}
            })
        }
    ]
    raw = await call_openrouter(
        messages,
        model="anthropic/claude-3.5-sonnet",
        max_tokens=400,
        temperature=0.92
    )
    try:
        parsed = json.loads(raw)
        hooks = parsed if isinstance(parsed, list) else parsed.get("hooks", [])
        return sorted(hooks, key=lambda x: x.get("score", 0), reverse=True)
    except Exception:
        return [{"text": seed.get("hook", ""), "score": 50}]


async def generate_body(seed, platform, hook, profile, observations=None):
    messages = [
        {"role": "system", "content": SYSTEM},
        {
            "role": "user",
            "content": json.dumps({
                "opening_hook": hook,
                "work_story": seed.get("story") or seed.get("description", ""),
                "platform": platform,
                "rules": PLATFORM_RULES.get(platform, ""),
                "write_in_this_style": (observations or [])[:8],
                "tone": profile.get("tone", ""),
                "output": {"full_content": "", "cta": "", "hashtags": []}
            })
        }
    ]
    raw = await call_openrouter(
        messages,
        model="anthropic/claude-3.5-sonnet",
        max_tokens=500,
        temperature=0.78
    )
    try:
        return json.loads(raw)
    except Exception:
        return {"full_content": raw, "cta": "", "hashtags": []}


async def score_content(content, platform, niche):
    messages = [
        {
            "role": "system",
            "content": "Score content on viral probability. Be honest. Return valid JSON only."
        },
        {
            "role": "user",
            "content": json.dumps({
                "content": content[:500],
                "platform": platform,
                "niche": niche,
                "output": {"score": 0, "what_works": "", "what_doesnt": "", "fix": ""}
            })
        }
    ]
    raw = await call_openrouter(
        messages,
        model="mistralai/mistral-7b-instruct",
        max_tokens=200,
        temperature=0.3
    )
    try:
        return json.loads(raw)
    except Exception:
        return {"score": 50, "what_works": "", "what_doesnt": "", "fix": ""}


async def generate_for_platform(seed, platform, profile, observations=None):
    try:
        hooks = await generate_hooks(seed, platform, profile)
        best_hook = hooks[0].get("text", "") if hooks else seed.get("hook", "")
        body = await generate_body(seed, platform, best_hook, profile, observations)
        full = f"{best_hook}\n\n{body.get('full_content', '')}"
        score = await score_content(full, platform, profile.get("niche", ""))
        return platform, {
            "hook": best_hook,
            "full_content": full,
            "cta": body.get("cta"),
            "hashtags": body.get("hashtags", []),
            "virality_score": score.get("score", 50),
            "virality_reasoning": score.get("what_works"),
            "improvement": score.get("fix")
        }
    except Exception as e:
        return platform, {"error": str(e)}


async def generate_all(seed, platforms, profile, observations=None):
    results = await asyncio.gather(
        *[generate_for_platform(seed, p, profile, observations) for p in platforms],
        return_exceptions=True
    )
    return {p: d for p, d in results if not isinstance(d, Exception)}
import json
import asyncio
from app.services.model_router import call_openrouter

SYSTEM = """You are Meta, an elite content writer who understands
human psychology and what makes people stop scrolling.

Never use these words: dive into, game-changer, in today's world,
it's important to note, delve, leverage, landscape, journey, unlock.

Write like a smart self-aware person being genuinely honest.
Virality is specific psychology executed well.
Always return valid JSON matching the output template exactly."""

PLATFORM_RULES = {
    "linkedin": "1200-1800 chars, professional but human, end with question, 3-5 hashtags",
    "twitter": "6-10 tweets each under 280 chars, first tweet standalone hook, numbered",
    "reddit": "detailed, community-first, no promotion, lead with value not yourself",
    "instagram": "150-300 chars, conversational, line breaks, 5-10 hashtags at end",
    "youtube": "hook in first 8 seconds, subscribe prompt at 2 min, 3 clear sections",
}


async def generate_hooks(seed: dict, platform: str, profile: dict) -> list:
    messages = [
        {"role": "system", "content": SYSTEM},
        {
            "role": "user",
            "content": json.dumps(
                {
                    "work": seed.get("story") or seed.get("description", ""),
                    "platform": platform,
                    "niche": profile.get("niche", ""),
                    "tone": profile.get("tone", ""),
                    "psychological_profile": profile.get("psychological_profile", ""),
                    "generate": "6 hooks",
                    "each_hook": {"text": "", "mechanism": "", "score": 0},
                }
            ),
        },
    ]

    raw = await call_openrouter(
        messages=messages,
        model="anthropic/claude-3.5-sonnet",
        max_tokens=400,
        temperature=0.92,
    )

    try:
        parsed = json.loads(raw)
        hooks = parsed if isinstance(parsed, list) else parsed.get("hooks", [])
        return sorted(hooks, key=lambda x: x.get("score", 0), reverse=True)
    except Exception:
        return [{"text": seed.get("hook", ""), "score": 50}]


async def generate_body(
    seed: dict,
    platform: str,
    hook: str,
    profile: dict,
    observations: list = None,
) -> dict:
    messages = [
        {"role": "system", "content": SYSTEM},
        {
            "role": "user",
            "content": json.dumps(
                {
                    "opening_hook": hook,
                    "work_story": seed.get("story") or seed.get("description", ""),
                    "platform": platform,
                    "rules": PLATFORM_RULES.get(platform, ""),
                    "write_in_this_style": (observations or [])[:8],
                    "tone": profile.get("tone", ""),
                    "output": {"full_content": "", "cta": "", "hashtags": []},
                }
            ),
        },
    ]

    raw = await call_openrouter(
        messages=messages,
        model="anthropic/claude-3.5-sonnet",
        max_tokens=500,
        temperature=0.78,
    )

    try:
        return json.loads(raw)
    except Exception:
        return {"full_content": raw, "cta": "", "hashtags": []}


async def score_content(content: str, platform: str, niche: str) -> dict:
    messages = [
        {
            "role": "system",
            "content": "Score content on viral probability. Be honest and specific. Return valid JSON only.",
        },
        {
            "role": "user",
            "content": json.dumps(
                {
                    "content": content[:500],
                    "platform": platform,
                    "niche": niche,
                    "output": {
                        "score": 0,
                        "what_works": "",
                        "what_doesnt": "",
                        "fix": "",
                    },
                }
            ),
        },
    ]

    raw = await call_openrouter(
        messages=messages,
        model="mistralai/mistral-7b-instruct",
        max_tokens=200,
        temperature=0.3,
    )

    try:
        return json.loads(raw)
    except Exception:
        return {"score": 50, "what_works": "", "what_doesnt": "", "fix": ""}


async def generate_for_platform(
    seed: dict,
    platform: str,
    profile: dict,
    observations: list = None,
) -> tuple:
    try:
        hooks = await generate_hooks(seed, platform, profile)
        best_hook = hooks[0].get("text", "") if hooks else seed.get("hook", "")
        body = await generate_body(seed, platform, best_hook, profile, observations)
        full = f"{best_hook}\n\n{body.get('full_content', '')}"
        score = await score_content(full, platform, profile.get("niche", ""))
        return platform, {
            "hook": best_hook,
            "full_content": full,
            "cta": body.get("cta"),
            "hashtags": body.get("hashtags", []),
            "virality_score": score.get("score", 50),
            "virality_reasoning": score.get("what_works"),
            "improvement": score.get("fix"),
        }
    except Exception as e:
        return platform, {"error": str(e)}


async def generate_all(
    seed: dict,
    platforms: list,
    profile: dict,
    observations: list = None,
) -> dict:
    results = await asyncio.gather(
        *[generate_for_platform(seed, p, profile, observations) for p in platforms],
        return_exceptions=True,
    )
    return {p: d for p, d in results if not isinstance(d, Exception)}
