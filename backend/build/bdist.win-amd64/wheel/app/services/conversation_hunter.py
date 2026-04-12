"""
Conversation Hunter
─────────────────────────────────────────────────────────────────
Finds conversation opportunities where the user can add genuine
value right now. Uses Claude Sonnet at temperature 0.7.

Output per opportunity:
  platform, topic, angle, drafted_reply,
  why_this_works, estimated_profile_visit_probability

These are saved to conversation_opportunities and pushed to the
dashboard via WebSocket as "new_opportunity" events.
"""
import json
import logging
from ..services.model_router import call_openrouter

logger = logging.getLogger("cozyjet.conversation_hunter")

HUNTER_SYSTEM = (
    "You find conversation opportunities where this creator can add genuine value right now. "
    "You think about timing, relevance, and what angle would make people want to check out "
    "this person's profile. Every opportunity must be specific and actionable. "
    "You never suggest generic participation — every opportunity has a specific angle "
    "only this creator can bring from their exact niche and experience."
)

OPPORTUNITY_TEMPLATE = {
    "platform": "",
    "topic": "",
    "angle": "",
    "thread_url": "",
    "thread_title": "",
    "original_post": "",
    "drafted_reply": "",
    "why_this_works": "",
    "estimated_profile_visit_probability": "",
    "relevance_score": 0,
}


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return text.strip()


async def hunt_conversations(
    growth_profile: dict,
    recent_content: list,
) -> list[dict]:
    """
    Find 5 conversation opportunities for this creator.

    Args:
        growth_profile: Full growth profile from onboarding
        recent_content: Last 3 published posts (title, platform, hook)

    Returns:
        List of opportunity dicts ready to save to conversation_opportunities
    """
    user_message = json.dumps({
        "creator": {
            "niche": growth_profile.get("niche", ""),
            "sub_niche": growth_profile.get("sub_niche", ""),
            "goal": growth_profile.get("goal", ""),
            "tone": growth_profile.get("tone", ""),
            "positioning_opportunity": growth_profile.get("positioning_opportunity", ""),
        },
        "recent_work": recent_content[:3],
        "find": "5 specific conversations happening right now where this person has something real to add",
        "for_each": OPPORTUNITY_TEMPLATE,
        "output": {"opportunities": []},
    })

    try:
        raw = await call_openrouter(
            system_prompt=HUNTER_SYSTEM,
            user_message=user_message,
            model="anthropic/claude-3.5-sonnet",
            temperature=0.7,
            max_tokens=800,
            json_mode=True,
        )
        result = json.loads(_strip_fences(raw))
        opportunities = result.get("opportunities", [])

        # Normalize each opportunity
        normalized = []
        for opp in opportunities:
            normalized.append({
                "platform": opp.get("platform", "twitter"),
                "thread_url": opp.get("thread_url", "https://twitter.com"),
                "thread_title": opp.get("thread_title", opp.get("topic", "")),
                "original_post": opp.get("original_post", opp.get("topic", "")),
                "drafted_reply": opp.get("drafted_reply", ""),
                "relevance_score": max(0, min(100, int(opp.get("relevance_score", 70)))),
                "opportunity_reason": opp.get("why_this_works", ""),
            })
        return normalized
    except Exception as e:
        logger.error(f"Conversation hunting failed: {e}")
        return []
