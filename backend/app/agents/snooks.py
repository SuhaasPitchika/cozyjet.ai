from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from ..config import settings
import json

class SnooksAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="anthropic/claude-3.5-sonnet",
            openai_api_key=settings.OPENROUTER_API_KEY,
            openai_api_base=settings.OPENROUTER_BASE_URL,
            temperature=0.7,
            default_headers={
                "HTTP-Referer": settings.FRONTEND_URL,
                "X-Title": "CozyJet AI"
            }
        )

    async def generate_strategy(self, content_seeds: list, voice_profile: dict) -> dict:
        """
        Generates a 7-day content strategy based on available seeds 
        and user voice profile.
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are Snooks, a master content strategist for solo creators. "
                "Review the content seeds and create a high-impact 7-day plan. "
                "Ensure platform diversification and strategic narrative flow. "
                "Categorize into: Educate, Entertain, Inspire, Promote. "
                "Output as JSON with 'plan' key containing daily assignments."
            )),
            ("human", "Available Seeds: {seeds}\nVoice Profile: {voice}")
        ])
        
        chain = prompt | self.llm
        resp = await chain.ainvoke({
            "seeds": json.dumps(content_seeds),
            "voice": json.dumps(voice_profile)
        })
        
        try:
            res_text = resp.content
            if "```json" in res_text:
                res_text = res_text.split("```json")[1].split("```")[0].strip()
            return json.loads(res_text)
        except:
            return {"error": "Failed to parse strategy", "raw": resp.content}
