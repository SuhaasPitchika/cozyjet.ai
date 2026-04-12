"""
Virality Scorer
─────────────────────────────────────────────────────────────────
Uses Mistral 7B at temperature 0.3 to score content 0-100 against
the probability of performing above average in the creator's niche.

Returns: score (int), what_works (str), what_doesnt (str), fix (str)

Runs after every Meta generation so users see an honest pre-assessment
before deciding whether to approve or improve a piece.
"""
import json
import logging
from ..services.model_router import call_openrouter

logger = logging.getLogger("cozyjet.virality_scorer")

SCORER_SYSTEM = (
    "You are a virality analyst for social media content. "
    "You score content 0-100 against the probability of performing above average "
    "in a given niche. You are honest, specific, and never generous. "
    "You identify exactly what works and what doesn't in plain language. "
    "Your fix must be one concrete sentence — not a suggestion, an instruction."
)

OUTPUT_TEMPLATE = {
    "score": 0,
    "what_works": "",
    "what_doesnt": "",
    "fix": ""
}


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return text.strip()


async def score_content(
    content_text: str,
    platform: str,
    niche: str,
    growth_profile: dict = None,
) -> dict:
    """
    Score content for virality potential.

    Returns:
        {score: int 0-100, what_works: str, what_doesnt: str, fix: str}
    """
    profile_context = ""
    if growth_profile:
        profile_context = (
            f"Niche: {growth_profile.get('niche', niche)}. "
            f"Sub-niche: {growth_profile.get('sub_niche', '')}. "
            f"Audience goal: {growth_profile.get('goal', '')}."
        )

    user_message = json.dumps({
        "platform": platform,
        "niche": profile_context or niche,
        "content": content_text[:2000],
        "task": (
            "Score this content 0-100 for virality probability in this niche. "
            "Be honest — 50 is average. Most AI content scores 30-45. "
            "Genuinely specific, human, well-hooked content scores 60-80. "
            "Viral outliers score 80+."
        ),
        "output": OUTPUT_TEMPLATE,
    })

    try:
        raw = await call_openrouter(
            system_prompt=SCORER_SYSTEM,
            user_message=user_message,
            model="mistralai/mistral-7b-instruct",
            temperature=0.3,
            max_tokens=300,
            json_mode=True,
        )
        result = json.loads(_strip_fences(raw))
        return {
            "score": max(0, min(100, int(result.get("score", 0)))),
            "what_works": result.get("what_works", ""),
            "what_doesnt": result.get("what_doesnt", ""),
            "fix": result.get("fix", ""),
        }
    except Exception as e:
        logger.error(f"Virality scoring failed: {e}")
        return {"score": 0, "what_works": "", "what_doesnt": "", "fix": ""}


async def score_and_improve(
    content_text: str,
    platform: str,
    niche: str,
    score_result: dict,
    growth_profile: dict = None,
) -> str:
    """
    Pass low-scoring content back to Meta with the virality reasoning
    as additional context to target the identified weakness.
    """
    from ..services.model_router import call_meta

    system = (
        "You are Meta improving a piece of content based on a virality score assessment. "
        "Apply the fix instruction exactly. Keep the person's voice. Return only the improved content."
    )

    user_message = json.dumps({
        "platform": platform,
        "original_content": content_text[:1500],
        "virality_score": score_result.get("score"),
        "what_doesnt_work": score_result.get("what_doesnt"),
        "fix_instruction": score_result.get("fix"),
        "instruction": "Apply the fix. Improve the weakest element. Return the full improved content.",
    })

    try:
        return await call_meta(
            system_prompt=system,
            user_message=user_message,
            platform=platform,
        )
    except Exception as e:
        logger.error(f"Content improvement failed: {e}")
        return content_text
