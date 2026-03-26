from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.user import User, ContentSeed, Content, ContentStatus, TuneSample
from ..database import get_db
from ..config import settings
import json

class MetaAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="openai/gpt-4-vision-preview" if "vision" in settings.OPENROUTER_MODEL else settings.OPENROUTER_MODEL,
            openai_api_base=settings.OPENROUTER_BASE_URL,
            openai_api_key=settings.OPENROUTER_API_KEY,
            temperature=0.7
        )

    async def generate_variations(self, user: User, seed: ContentSeed, db: AsyncSession) -> dict:
        """
        Generates 3 variations based on user's personal tuning and writing samples.
        """
        # 1. Fetch User Settings & Samples
        voice = user.voice_profile or {
            "tone": "Professional", "style": "Concise", 
            "emoji_usage": 0.5, "humor": 0.2, "hashtags": True
        }
        
        stmt_samples = select(TuneSample).where(TuneSample.user_id == user.id).limit(3)
        res_samples = await db.execute(stmt_samples)
        samples = res_samples.scalars().all()
        sample_text = "\n---\n".join([s.sample_text for s in samples])

        # 2. Build Prompt
        system_msg = f"""
        You are 'Meta', the high-end content factory agent for CozyJet.
        Your goal is to transform a 'Content Seed' into 3 platform-optimized social media variations.
        
        USER VOICE PROFILE:
        - Primary Tone: {voice.get('tone', 'Professional')}
        - Style: {voice.get('style', 'Concise')}
        - Emoji Usage (0-1): {voice.get('emoji_usage', 0.5)}
        - Humor Level (0-1): {voice.get('humor', 0.2)}
        - Include Hashtags: {voice.get('hashtags', True)}
        
        {f"WRITING SAMPLES (Mirror this exact prose style):\n{sample_text}" if sample_text else "No samples provided. Use a clean, professional, and slightly witty voice."}
        
        VARIATION SPECS:
        0. EMOTIONAL STORYTELLING: Engaging hooks, personal narrative, vulnerability.
        1. DEEPLY TECHNICAL: Fact-heavy, breakdown of implementation, peer-focused.
        2. MEASURABLE OUTCOMES: Results-first, ROI, tangible takeaways.
        
        OUTPUT FORMAT (RELAXED JSON):
        {{
          "variations": [
            {{ "index": 0, "text": "...", "type": "Storytelling" }},
            {{ "index": 1, "text": "...", "type": "Technical" }},
            {{ "index": 2, "text": "...", "type": "Outcomes" }}
          ]
        }}
        """

        human_msg = f"""
        CONTENT SEED:
        Title: {seed.title}
        Raw Context: {seed.description}
        Tags: {', '.join(seed.tags)}
        
        Generate the 3 variations now.
        """

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_msg),
            ("human", human_msg)
        ])

        # 3. Execute LLM call
        chain = prompt | self.llm
        response = await chain.ainvoke({})
        
        try:
            return json.loads(response.content)
        except:
            # Fallback for LLM weirdness
            return {"error": "Failed to parse variations"}

meta_agent = MetaAgent()
