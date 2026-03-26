from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # App Config
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "CozyJet AI"
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Auth & Security
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    TOKEN_ENCRYPTION_KEY: str # For Fernet AES-256
    
    # Database
    DATABASE_URL: str
    
    # Redis & Celery
    REDIS_URL: str
    CELERY_BROKER_URL: str # Matches REDIS_URL usually
    
    # AI Keys (OpenRouter as Primary)
    OPENROUTER_API_KEY: str
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # OAuth Integration Credentials
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_REDIRECT_URI: str = "http://localhost:8000/api/integrations/callback/github"
    
    NOTION_CLIENT_ID: str = ""
    NOTION_CLIENT_SECRET: str = ""
    NOTION_REDIRECT_URI: str = "http://localhost:8000/api/integrations/callback/notion"
    
    FIGMA_CLIENT_ID: str = ""
    FIGMA_CLIENT_SECRET: str = ""
    FIGMA_REDIRECT_URI: str = "http://localhost:8000/api/integrations/callback/figma"
    
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/integrations/callback/google"
    
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""
    LINKEDIN_REDIRECT_URI: str = "http://localhost:8000/api/integrations/callback/linkedin"
    
    TWITTER_CLIENT_ID: str = ""
    TWITTER_CLIENT_SECRET: str = ""
    TWITTER_REDIRECT_URI: str = "http://localhost:8000/api/integrations/callback/twitter"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
