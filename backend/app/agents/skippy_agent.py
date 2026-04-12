import json
from app.services.model_router import call_openrouter

SYSTEM = """You are Skippy, CozyJet's intelligence agent.
Find what is worth sharing. Think like a journalist.
Specific, curious, no fluff. Never generic.
Always return valid JSON matching the output template exactly."""


async def generate_seed(raw: str, profile: dict, source: str = "manual") -> dict:
    messages = [
        {"role": "system", "content": SYSTEM},
        {
            "role": "user",
            "content": json.dumps({
                "input": raw,
                "source": source,
                "creator": {
                    "niche": profile.get("niche", ""),
                    "goal": profile.get("goal", ""),
                    "tone": profile.get("tone", ""),
                    "audience": profile.get("sub_niche", ""),
                },
                "output": {
                    "title": "",
                    "hook": "",
                    "story": "",
                    "why_audience_cares": "",
                    "tags": [],
                    "best_platforms": [],
                },
            }),
        },
    ]

    raw_response = await call_openrouter(
        messages=messages,
        model="mistralai/mistral-7b-instruct",
        max_tokens=300,
        temperature=0.35,
    )

    try:
        return json.loads(raw_response)
    except Exception:
        return {
            "title": "Untitled",
            "hook": raw[:100],
            "story": raw,
            "why_audience_cares": "",
            "tags": [],
            "best_platforms": [],
        }


async def hunt_conversations(profile: dict, recent: list) -> list:
    messages = [
        {
            "role": "system",
            "content": "Find conversation opportunities where this creator adds genuine value. Return a JSON array only.",
        },
        {
            "role": "user",
            "content": json.dumps({
                "creator": {
                    "niche": profile.get("niche", ""),
                    "goal": profile.get("goal", ""),
                    "tone": profile.get("tone", ""),
                },
                "recent_work": [w.get("title", "") for w in recent[:3]],
                "return": "JSON array of 5 opportunities",
                "each_item": {
                    "platform": "",
                    "topic": "",
                    "angle": "",
                    "drafted_reply": "",
                    "why_this_works": "",
                    "relevance_score": 0,
                },
            }),
        },
    ]

    raw = await call_openrouter(
        messages=messages,
        model="anthropic/claude-3.5-sonnet",
        max_tokens=600,
        temperature=0.7,
    )

    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, list) else parsed.get("opportunities", [])
    except Exception:
        return []
