"""
Snooks — Personal Brand Strategist
Builds repeatable growth systems from real user data.
Temperature: 0.5 (balanced analytical creativity)
"""
import json
from ..services.model_router import call_snooks, call_openrouter

SYSTEM_PROMPT = (
    "You are Snooks, a personal brand strategist. You think in growth systems, not one-off "
    "tactics. You study patterns in what actually works for this specific person with this "
    "specific audience, identify the underlying reasons why, and build repeatable strategies "
    "from those reasons. You are direct, data-driven, and contrarian when the data supports "
    "it. You never give advice that would apply to anyone — everything you say is specific "
    "to this person."
)

SUGGESTIONS_SCHEMA = """{
  "suggestions": [
    {
      "title": "<compelling post title>",
      "angle": "<strategic angle — e.g. thought leadership, tutorial, behind the scenes>",
      "platform": "<linkedin|twitter|instagram|youtube|reddit>",
      "best_day": "<e.g. Tuesday>",
      "best_time": "<e.g. 9:00 AM>",
      "reasoning": "<why this content, why now, why this platform — grounded in their actual data>"
    }
  ]
}"""

GAPS_SCHEMA = """{
  "gaps": [
    {
      "week": "<YYYY-WW>",
      "issue": "<specific gap observed>",
      "recommendation": "<concrete, personalized fix>"
    }
  ]
}"""


def _strip_fences(content: str) -> str:
    content = content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
    return content.strip()


class SnooksAgent:
    async def suggest_content(
        self,
        seeds_summary: str,
        trends_summary: str,
        analytics_summary: str = "",
        voice_profile: dict = None,
    ) -> dict:
        profile_note = ""
        if voice_profile:
            profile_note = (
                f"\nUser voice profile: tone={voice_profile.get('tone', 'professional')}, "
                f"preferred platforms={voice_profile.get('preferred_platforms', ['linkedin'])}"
            )

        message = (
            f"Recent content seeds (last 14 days):\n{seeds_summary or 'None yet.'}\n\n"
            f"Performance analytics (last 30 days):\n{analytics_summary or 'No analytics yet.'}\n\n"
            f"Top trending topics:\n{trends_summary or 'None available.'}"
            f"{profile_note}\n\n"
            f"Generate exactly 5 weekly content recommendations grounded in their actual data.\n"
            f"Every suggestion must be specific to this person — if it applies to anyone, rewrite it.\n"
            f"Return ONLY this JSON:\n{SUGGESTIONS_SCHEMA}"
        )

        raw = await call_snooks(message)
        try:
            return json.loads(_strip_fences(raw))
        except json.JSONDecodeError:
            return {"suggestions": []}

    async def analyze_calendar_gaps(self, scheduled_content: list) -> dict:
        message = (
            f"Scheduled content calendar:\n{json.dumps(scheduled_content, indent=2)}\n\n"
            f"Identify specific gaps and imbalances. Be concrete — which days, which platforms.\n"
            f"Return ONLY this JSON:\n{GAPS_SCHEMA}"
        )

        raw = await call_openrouter(
            system_prompt=SYSTEM_PROMPT,
            user_message=message,
            temperature=0.5,
            max_tokens=800,
            json_mode=True,
        )
        try:
            return json.loads(_strip_fences(raw))
        except json.JSONDecodeError:
            return {"gaps": []}

    async def evaluate_experiment(self, hypothesis: str, results: dict) -> dict:
        message = (
            f"Growth experiment hypothesis: {hypothesis}\n\n"
            f"Results after 2 weeks:\n{json.dumps(results, indent=2)}\n\n"
            f"Evaluate whether the hypothesis was confirmed or refuted. "
            f"What should we test next based on these results? "
            f"Return JSON: {{\"confirmed\": true/false, \"insight\": \"...\", \"next_test\": \"...\"}}"
        )

        raw = await call_openrouter(
            system_prompt=SYSTEM_PROMPT,
            user_message=message,
            temperature=0.5,
            max_tokens=400,
            json_mode=True,
        )
        try:
            return json.loads(_strip_fences(raw))
        except json.JSONDecodeError:
            return {"confirmed": False, "insight": "", "next_test": ""}


snooks_agent = SnooksAgent()
