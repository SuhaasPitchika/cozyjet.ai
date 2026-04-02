from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # App Config
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "CozyJet Studio"
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5000"]

    # Auth
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Encryption (for OAuth tokens at rest)
    ENCRYPTION_KEY: str = "ZmRlYWRiZWVmZmVlZGZhY2ViYWRkZWVkY2FmZWJhYmU="

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/cozyjet"

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"

    # AI Keys
    OPEN_ROUTER: str = ""
    ELEVENLABS_API_KEY: str = ""
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    # OAuth — GitHub
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None

    # OAuth — Notion
    NOTION_CLIENT_ID: Optional[str] = None
    NOTION_CLIENT_SECRET: Optional[str] = None

    # OAuth — Figma
    FIGMA_CLIENT_ID: Optional[str] = None
    FIGMA_CLIENT_SECRET: Optional[str] = None

    # OAuth — Google (Drive + Calendar)
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # OAuth — LinkedIn
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None

    # OAuth — Twitter
    TWITTER_CLIENT_ID: Optional[str] = None
    TWITTER_CLIENT_SECRET: Optional[str] = None

    # OAuth — Instagram / Facebook
    INSTAGRAM_CLIENT_ID: Optional[str] = None
    INSTAGRAM_CLIENT_SECRET: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
