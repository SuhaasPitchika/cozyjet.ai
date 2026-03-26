from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from ..config import settings
import json

class MetaAgent:
    def __init__(self):
        # OpenRouter/Claude Sonnet or Gemini 
        self.llm = ChatOpenAI(
            model="google/gemini-2.0-flash-001", # OR anthropic/claude-3.5-sonnet
            openai_api_key=settings.OPEN_ROUTER,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.75,
            model_kwargs={"response_format": {"type": "json_object"}}
        )

    async def generate_content(self, seed: dict, voice_profile: dict, platforms: list) -> dict:
        system_prompt = """You are Meta, the elite marketing intelligence. 
        Generate 3 variations for each platform (Storytelling, Technical, Outcome-led).
        Apply platform-specific constraints: LinkedIn (1300-1900 chars), Twitter (6-12 tweets thread), etc.
        Return ONLY valid JSON with keys: {platform_name: [variation1, variation2, variation3]}
        """
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", "User Voice Profile: {voice}\nPlatforms: {platforms}\nContent Seed: {seed}")
        ])
        
        chain = prompt | self.llm
        # Invoke and return parsed JSON
        response = await chain.ainvoke({"voice": json.dumps(voice_profile), "platforms": ", ".join(platforms), "seed": json.dumps(seed)})
        return json.loads(response.content)

meta_agent = MetaAgent()
