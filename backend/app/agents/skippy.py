"""
Skippy — Work Intelligence Agent
Reads raw activity data and surfaces the professional story worth telling.
Temperature: 0.3 (factual accuracy — no hallucination on facts)
"""
import json
from ..services.model_router import call_skippy, call_openrouter

SYSTEM_PROMPT = (
    "You are Skippy, a work intelligence agent. You read raw activity data from developer "
    "and creator tools and find the professional story worth telling. You think like a "
    "journalist who covers technology — you look for what is genuinely interesting, novel, "
    "or useful to an audience of builders and creators. You write with economy. Every word "
    "earns its place. You never pad, never generalize, never produce boilerplate."
)

OUTPUT_SCHEMA = """{
  "title": "<concise title under 60 chars>",
  "description": "<2-3 sentences: what was done, why it matters professionally, who would find it interesting>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "target_audience": "<one sentence>",
  "content_angles": ["<storytelling hook>", "<technical detail>", "<outcome/result>"]
}"""


def _build_seed_message(activity: str, platform: str, user_context: str = "", recent_titles: list = None) -> str:
    parts = [f"Platform: {platform}"]
    if user_context:
        parts.append(f"User context: {user_context}")
    if recent_titles:
        parts.append("Recent seeds (avoid repetition): " + ", ".join(recent_titles[:5]))
    parts.append(f"\nRaw activity:\n{activity}")
    parts.append(f"\nReturn ONLY this JSON (no markdown, no explanation):\n{OUTPUT_SCHEMA}")
    return "\n".join(parts)


def _strip_fences(content: str) -> str:
    content = content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
    return content.strip()


class SkippyAgent:
    async def process_activity(
        self,
        raw_activity: str,
        platform: str = "manual",
        user_context: str = "",
        recent_titles: list = None,
    ) -> dict:
        message = _build_seed_message(raw_activity, platform, user_context, recent_titles)
        raw = await call_skippy(message)
        try:
            return json.loads(_strip_fences(raw))
        except json.JSONDecodeError:
            return {
                "title": f"Work via {platform}"[:60],
                "description": raw_activity[:300],
                "tags": [platform],
                "target_audience": "developers and creators",
                "content_angles": ["storytelling", "technical detail", "outcome"],
            }

    async def enhance_work_description(self, raw_input: str, user_context: str = "") -> str:
        result = await self.process_activity(raw_input, platform="manual", user_context=user_context)
        return result.get("description", raw_input)

    async def analyze_screenshot(self, base64_image: str) -> dict:
        from ..services.model_router import OPENROUTER_HEADERS, OPENROUTER_BASE
        import httpx

        payload = {
            "model": "google/gemini-2.0-flash-001",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                f"{SYSTEM_PROMPT}\n\n"
                                f"Analyze this screenshot and return ONLY this JSON:\n{OUTPUT_SCHEMA}"
                            ),
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/png;base64,{base64_image}"},
                        },
                    ],
                }
            ],
            "temperature": 0.3,
            "max_tokens": 800,
        }

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{OPENROUTER_BASE}/chat/completions",
                headers=OPENROUTER_HEADERS,
                json=payload,
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"].strip()

        try:
            return json.loads(_strip_fences(content))
        except json.JSONDecodeError:
            return {
                "title": "Screenshot Analysis",
                "description": content[:300],
                "tags": ["screenshot"],
                "target_audience": "developers and creators",
                "content_angles": ["visual insight", "process detail", "outcome"],
            }

    async def detect_calendar_intent(self, message: str) -> dict:
        """
        Lightweight classifier: detect if a message implies a future commitment.
        Returns {"intent": true/false, "event": {...}} using a small fast model.
        """
        raw = await call_openrouter(
            system_prompt=(
                "You are a calendar intent classifier. Determine if the user message implies "
                "a future commitment, deadline, or scheduled activity. "
                "Return ONLY JSON: "
                "{\"intent\": true/false, \"event\": {\"title\": \"\", \"date_hint\": \"\", \"platform\": \"\"}}"
            ),
            user_message=message,
            model="mistralai/mistral-7b-instruct",
            temperature=0.1,
            max_tokens=120,
            json_mode=True,
        )
        try:
            return json.loads(_strip_fences(raw))
        except Exception:
            return {"intent": False, "event": {}}


skippy_agent = SkippyAgent()
