from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from ..config import settings
import json

class SnooksAgent:
    def __init__(self):
        # OpenRouter/Gemini configuration (Gemini excels at structured planning)
        self.llm = ChatOpenAI(
            model="google/gemini-2.0-flash-001",
            openai_api_key=settings.OPEN_ROUTER,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.7,
            model_kwargs={"response_format": {"type": "json_object"}}
        )

    async def suggest_content(self, recent_history: str, trends: str) -> dict:
        system_prompt = """You are Snooks, the Content Planner/Strategist for CozyJet. 
        Analyze the user's recent work history and current trends to identify content gaps.
        Suggest 5 specific content ideas with titles and platform recommendations.
        Return ONLY a JSON object: {"suggestions": [{"title": "", "platform": "", "reasoning": ""}]}
        """
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", "Recent History: {history}\nTrending Topics: {trends}")
        ])
        
        chain = prompt | self.llm
        response = await chain.ainvoke({"history": recent_history, "trends": trends})
        return json.loads(response.content)

snooks_agent = SnooksAgent()
