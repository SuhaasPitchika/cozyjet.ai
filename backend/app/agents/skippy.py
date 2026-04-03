"""
Skippy — Work Intelligence Agent
Temperature: 0.3 (factual accuracy — no hallucination on facts)
Uses OpenRouter via the OpenAI SDK.
"""
import json
import logging
from ..services.model_router import call_skippy as _call_skippy, call_openrouter, call_intent_classifier

logger = logging.getLogger("cozyjet.skippy")

SYSTEM_PROMPT = (
    "You are Skippy, a work intelligence agent. You read raw activity data from developer "
    "and creator tools and find the professional story worth telling. You think like a "
    "journalist who covers technology — you look for what is genuinely interesting, novel, "
    "or useful to an audience of builders and creators. You write with economy. Every word "
    "earns its place. You never pad, never generalize, never produce boilerplate."
)

OUTPUT_TEMPLATE = '{"title": "", "description": "", "tags": [], "target_audience": "", "content_angles": []}'


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return text.strip()


class SkippyAgent:
    async def process_activity(
        self,
        raw_activity: str,
        platform: str = "manual",
        user_context: str = "",
        recent_titles: list = None,
    ) -> dict:
        message = json.dumps({
            "activity": raw_activity,
            "user_context": user_context or "A developer and creator focused on building in public.",
            "recent_seeds": recent_titles or [],
            "output": json.loads(OUTPUT_TEMPLATE),
        })

        try:
            raw = await _call_skippy(message, SYSTEM_PROMPT)
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Skippy seed generation failed: {e}")
            return {
                "title": raw_activity[:60],
                "description": raw_activity[:250],
                "tags": [platform],
                "target_audience": "developers and creators",
                "content_angles": ["storytelling", "technical detail", "outcome"],
            }

    async def enhance_work_description(self, raw_input: str, user_context: str = "") -> str:
        result = await self.process_activity(raw_input, user_context=user_context)
        return result.get("description", raw_input)

    async def analyze_screenshot(self, base64_image: str) -> dict:
        from ..services.model_router import _openrouter_client, PLATFORM_TEMPERATURES
        client = _openrouter_client()

        try:
            resp = await client.chat.completions.create(
                model="anthropic/claude-3-haiku",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": (
                                    f"{SYSTEM_PROMPT}\n\n"
                                    f"Analyze this screenshot and return ONLY this JSON:\n{OUTPUT_TEMPLATE}"
                                ),
                            },
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/png;base64,{base64_image}"},
                            },
                        ],
                    }
                ],
                temperature=0.3,
                max_tokens=600,
            )
            raw = resp.choices[0].message.content.strip()
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Screenshot analysis failed: {e}")
            return {
                "title": "Screenshot Analysis",
                "description": "Visual work captured from screenshot.",
                "tags": ["screenshot"],
                "target_audience": "developers and creators",
                "content_angles": ["visual insight", "process detail", "outcome"],
            }

    async def detect_calendar_intent(self, message: str) -> dict:
        try:
            raw = await call_intent_classifier(message)
            return json.loads(_strip_fences(raw))
        except Exception as e:
            logger.error(f"Intent detection failed: {e}")
            return {"intent": False, "event": {}}


skippy_agent = SkippyAgent()
