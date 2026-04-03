"""
Snooks — Personal Brand Strategist
Temperature: 0.5 (balanced analytical creativity)
Uses Gemini directly for long-context strategic analysis.
"""
import json
import logging
from ..services.model_router import call_snooks as _call_snooks, call_openrouter

logger = logging.getLogger("cozyjet.snooks")

SYSTEM_PROMPT = (
    "You are Snooks, a personal brand strategist. You think in growth systems, not one-off "
    "tactics. You study patterns in what actually works for this specific person with this "
    "specific audience, identify the underlying reasons why, and build repeatable strategies "
    "from those reasons. You are direct, data-driven, and contrarian when the data supports "
    "it. You never give advice that would apply to anyone — everything you say is specific "
    "to this person."
)

SUGGESTION_TEMPLATE = json.dumps({
    "suggestions": [
        {
            "title": "",
            "angle": "",
            "platform": "",
            "best_day": "",
            "best_time": "",
            "reasoning": "",
        }
    ]
}, indent=2)


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return text.strip()


def _format_voice(profile: dict) -> str:
    if not profile:
        return "authentic, direct professional"
    obs = profile.get("style_observations", [])
    base = (
        f"tone={profile.get('tone', 'professional')}, "
        f"formality={profile.get('formality', 'semi-formal')}, "
        f"humor={profile.get('humor', 'witty')}"
    )
    if obs:
        base += ". Stylistic notes: " + "; ".join(obs[:3])
    return base


class SnooksAgent:
    async def suggest_content(
        self,
        seeds_summary: str,
        trends_summary: str,
        analytics_summary: str = "",
        voice_profile: dict = None,
    ) -> dict:
        voice_str = _format_voice(voice_profile or {})
        prefs = (voice_profile or {}).get("preferred_platforms", ["linkedin", "twitter"])

        user_message = (
            f"User voice profile (2 sentences): {voice_str}. "
            f"Preferred platforms: {', '.join(prefs)}.\n\n"
            f"Recent seeds (last 14 days):\n{seeds_summary or 'None yet.'}\n\n"
            f"Analytics (last 30 days):\n{analytics_summary or 'No data yet.'}\n\n"
            f"Trending topics:\n{trends_summary or 'None available.'}\n\n"
            f"Generate exactly 5 weekly content recommendations specific to this person. "
            f"Every suggestion must be grounded in their actual data — not generic advice. "
            f"Max 150 tokens per suggestion.\n\n"
            f"Return ONLY this JSON:\n{SUGGESTION_TEMPLATE}"
        )

        try:
            raw = await _call_snooks(user_message, SYSTEM_PROMPT)
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Snooks suggest failed: {e}")
            return {"suggestions": []}

    async def analyze_calendar_gaps(self, scheduled_content: list) -> dict:
        template = json.dumps({
            "gaps": [{"week": "", "issue": "", "recommendation": ""}]
        }, indent=2)

        user_message = (
            f"Scheduled content calendar:\n{json.dumps(scheduled_content, indent=2)}\n\n"
            f"Identify specific gaps by day and platform. "
            f"Every recommendation must be concrete and specific to this user.\n\n"
            f"Return ONLY this JSON:\n{template}"
        )

        try:
            raw = await _call_snooks(user_message, SYSTEM_PROMPT)
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Snooks calendar analysis failed: {e}")
            return {"gaps": []}

    async def evaluate_experiment(self, hypothesis: str, results: dict) -> dict:
        template = json.dumps({"confirmed": False, "insight": "", "next_test": ""})

        user_message = (
            f"Growth experiment hypothesis: {hypothesis}\n\n"
            f"Results:\n{json.dumps(results, indent=2)}\n\n"
            f"Was the hypothesis confirmed? What does the data actually say? "
            f"What should be tested next?\n\n"
            f"Return ONLY this JSON:\n{template}"
        )

        try:
            raw = await _call_snooks(user_message, SYSTEM_PROMPT)
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Experiment evaluation failed: {e}")
            return {"confirmed": False, "insight": "", "next_test": ""}


snooks_agent = SnooksAgent()
