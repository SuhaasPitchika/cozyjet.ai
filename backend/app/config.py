from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # App Config
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "CozyJet Studio"
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Auth
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str
    
    # Redis & Celery
    REDIS_URL: str
    CELERY_BROKER_URL: str
    
    # AI Keys (OpenRouter as Primary)
    OPEN_ROUTER: str
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"

settings = Settings()
