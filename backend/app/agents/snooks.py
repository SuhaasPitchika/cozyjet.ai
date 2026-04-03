"""
Snooks — Personal Brand Strategist
Temperature: 0.5 (balanced analytical creativity)
Uses Gemini 1.5 Flash for long-context strategic analysis.

Every suggestion must be grounded in actual user data.
Generic advice is detected and rejected internally.
"""
import json
import logging
from ..services.model_router import call_snooks as _call_snooks

logger = logging.getLogger("cozyjet.snooks")

# Under 200 words. Who I am, what I care about, how I think.
SYSTEM_PROMPT = (
    "You are Snooks, a personal brand strategist. You think in growth systems, not one-off "
    "tactics. You study patterns in what actually works for this specific person with this "
    "specific audience, identify the underlying reasons why, and build repeatable strategies "
    "from those reasons. You are direct, data-driven, and contrarian when the data supports "
    "it. You never give advice that would apply to anyone — everything you say is specific "
    "to this person. If you catch yourself writing 'post consistently' or 'use relevant "
    "hashtags' or 'engage with your audience', delete it and think harder. Every suggestion "
    "must cite a specific data point from what you were given."
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
            "data_anchor": "",
        }
    ]
}, indent=2)

GENERIC_PHRASES = [
    "post consistently", "use relevant hashtags", "engage with your audience",
    "grow your following", "build your brand", "share valuable content",
    "stay authentic", "be consistent", "provide value", "connect with",
    "leverage your", "optimize your", "maximize your", "boost your engagement",
]


def _is_generic(suggestion: dict) -> bool:
    """Check if a suggestion contains generic advice that applies to anyone."""
    text = f"{suggestion.get('reasoning', '')} {suggestion.get('angle', '')}".lower()
    return any(phrase in text for phrase in GENERIC_PHRASES)


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return text.strip()


def _format_voice(profile: dict) -> str:
    if not profile:
        return "No voice profile established yet."
    obs = profile.get("style_observations", [])
    preferred = profile.get("preferred_platforms", ["linkedin", "twitter"])
    length = profile.get("length_preference", "medium")
    humor = profile.get("humor", "moderate")
    base = (
        f"Tone: {profile.get('tone', 'professional')}. "
        f"Formality: {profile.get('formality', 'semi-formal')}. "
        f"Humor: {humor}. "
        f"Length preference: {length}. "
        f"Preferred platforms: {', '.join(preferred)}."
    )
    if obs:
        base += " Writing observations from their actual samples: " + "; ".join(obs[:4]) + "."
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

        # Two-sentence user voice summary + structured data context
        user_message = (
            f"Voice profile (2 sentences): {voice_str[:200]}\n"
            f"Preferred platforms: {', '.join(prefs)}.\n\n"
            f"=== THEIR LAST 14 DAYS OF WORK (seeds) ===\n"
            f"{seeds_summary or 'No seeds yet — cannot ground suggestions in work data.'}\n\n"
            f"=== THEIR LAST 30 DAYS OF ANALYTICS ===\n"
            f"{analytics_summary or 'No analytics yet.'}\n\n"
            f"=== CURRENT TRENDING TOPICS IN THEIR NICHE ===\n"
            f"{trends_summary or 'No trend data available.'}\n\n"
            f"Generate exactly 5 content recommendations. Rules:\n"
            f"1. Every recommendation must cite a specific data point above (a seed title, an engagement number, a trend).\n"
            f"2. The 'data_anchor' field must quote the specific thing from the data that grounds this suggestion.\n"
            f"3. If a suggestion would work for any random person, delete it and think harder.\n"
            f"4. Max 150 tokens per suggestion. Be surgical, not comprehensive.\n\n"
            f"Return ONLY this JSON:\n{SUGGESTION_TEMPLATE}"
        )

        try:
            raw = await _call_snooks(user_message, SYSTEM_PROMPT)
            result = json.loads(_strip_fences(raw))
            suggestions = result.get("suggestions", [])

            # Filter out any generic suggestions that slipped through
            good = [s for s in suggestions if not _is_generic(s)]
            if len(good) < len(suggestions):
                logger.warning(
                    f"Snooks: {len(suggestions) - len(good)} generic suggestion(s) filtered out"
                )
            return {"suggestions": good or suggestions}
        except Exception as e:
            logger.error(f"Snooks suggest failed: {e}")
            return {"suggestions": []}

    async def analyze_calendar_gaps(
        self,
        scheduled_content: list,
        voice_profile: dict = None,
        seeds_summary: str = "",
    ) -> dict:
        template = json.dumps({
            "gaps": [{"week": "", "days_missing": [], "issue": "", "recommendation": "", "suggested_topic": ""}]
        }, indent=2)

        prefs = (voice_profile or {}).get("preferred_platforms", ["linkedin", "twitter"])

        user_message = (
            f"Preferred platforms: {', '.join(prefs)}\n\n"
            f"Scheduled content:\n{json.dumps(scheduled_content, indent=2)}\n\n"
            f"Recent work seeds available:\n{seeds_summary or 'None'}\n\n"
            f"Identify specific gaps. For each gap, suggest a concrete topic from their seeds if available. "
            f"Be specific about which days are empty on which platforms.\n\n"
            f"Return ONLY this JSON:\n{template}"
        )

        try:
            raw = await _call_snooks(user_message, SYSTEM_PROMPT)
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Snooks calendar analysis failed: {e}")
            return {"gaps": []}

    async def evaluate_experiment(self, hypothesis: str, results: dict) -> dict:
        template = json.dumps({
            "confirmed": False,
            "confidence": "",
            "insight": "",
            "what_the_data_says": "",
            "next_test": "",
        })

        user_message = (
            f"Growth experiment hypothesis: {hypothesis}\n\n"
            f"Results:\n{json.dumps(results, indent=2)}\n\n"
            f"Was the hypothesis confirmed? What do the actual numbers say? "
            f"Do not interpret charitably — be honest about what the data shows. "
            f"The 'what_the_data_says' field must quote specific numbers from the results.\n\n"
            f"Return ONLY this JSON:\n{template}"
        )

        try:
            raw = await _call_snooks(user_message, SYSTEM_PROMPT)
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Experiment evaluation failed: {e}")
            return {"confirmed": False, "confidence": "low", "insight": "", "what_the_data_says": "", "next_test": ""}

    async def generate_morning_digest(
        self,
        gaps: list,
        trend_data: list,
        seeds_summary: str,
        voice_profile: dict = None,
    ) -> dict:
        """
        Called daily at 7AM: review next 7 days, find gaps, propose draft content entries.
        Returns a human-readable digest message + list of proposed calendar entries.
        """
        template = json.dumps({
            "message": "",
            "proposed_entries": [
                {"day": "", "platform": "", "topic": "", "seed_angle": ""}
            ],
        })

        prefs = (voice_profile or {}).get("preferred_platforms", ["linkedin", "twitter"])

        user_message = (
            f"It is 7AM for this user. Review their next 7 days.\n\n"
            f"Empty days detected:\n{json.dumps(gaps, indent=2)}\n\n"
            f"Recent work they haven't posted about yet:\n{seeds_summary or 'None'}\n\n"
            f"Trending topics in their niche:\n{json.dumps(trend_data, indent=2)}\n\n"
            f"Their preferred platforms: {', '.join(prefs)}\n\n"
            f"Write a brief, conversational morning message (2-3 sentences, no corporate language) "
            f"and propose draft calendar entries for the empty days. "
            f"Ground every entry in their actual work or a specific trend.\n\n"
            f"Return ONLY this JSON:\n{template}"
        )

        try:
            raw = await _call_snooks(user_message, SYSTEM_PROMPT)
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Morning digest failed: {e}")
            return {"message": "Your calendar has some empty days this week.", "proposed_entries": []}

    async def form_growth_hypothesis(
        self,
        top_performers: list,
        bottom_performers: list,
        voice_profile: dict = None,
    ) -> dict:
        """
        Weekly: form a hypothesis about why top content worked, design a test.
        """
        template = json.dumps({
            "hypothesis": "",
            "supporting_evidence": "",
            "test_a": {"topic": "", "angle": "", "platform": "", "what_to_measure": ""},
            "test_b": {"topic": "", "angle": "", "platform": "", "what_to_measure": ""},
        })

        user_message = (
            f"Top performing posts (last 2 weeks):\n{json.dumps(top_performers, indent=2)}\n\n"
            f"Lowest performing posts:\n{json.dumps(bottom_performers, indent=2)}\n\n"
            f"Form a hypothesis about WHY the top posts outperformed the bottom. "
            f"Be specific — was it the hook format? The topic category? The time? The platform? "
            f"Then design two content variations to test the hypothesis next week.\n\n"
            f"Return ONLY this JSON:\n{template}"
        )

        try:
            raw = await _call_snooks(user_message, SYSTEM_PROMPT)
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Hypothesis formation failed: {e}")
            return {"hypothesis": "", "supporting_evidence": "", "test_a": {}, "test_b": {}}


snooks_agent = SnooksAgent()
