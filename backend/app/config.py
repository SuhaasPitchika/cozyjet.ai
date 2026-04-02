import os
from typing import Optional, List
from pydantic import model_validator
from pydantic_settings import BaseSettings


def _build_allowed_origins() -> List[str]:
    origins = [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000",
    ]
    replit_domains = os.environ.get("REPLIT_DOMAINS", "")
    for domain in replit_domains.split(","):
        domain = domain.strip()
        if domain:
            origins.append(f"https://{domain}")
    replit_dev = os.environ.get("REPLIT_DEV_DOMAIN", "")
    if replit_dev and f"https://{replit_dev}" not in origins:
        origins.append(f"https://{replit_dev}")
    return origins


class Settings(BaseSettings):
    # App Config
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "CozyJet Studio"
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: List[str] = []

    # Auth — JWT_SECRET_KEY falls back to SESSION_SECRET (Replit native secret)
    JWT_SECRET_KEY: str = ""
    SESSION_SECRET: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Encryption (for OAuth tokens at rest)
    ENCRYPTION_KEY: str = "ZmRlYWRiZWVmZmVlZGZhY2ViYWRkZWVkY2FmZWJhYmU="

    # Database — reads DATABASE_URL from env; falls back to constructing from PG* vars
    DATABASE_URL: str = ""

    # Redis — optional; rate limiting and WebSocket pub/sub are disabled if not set
    REDIS_URL: str = ""
    CELERY_BROKER_URL: str = ""

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

    @model_validator(mode="after")
    def _apply_derived_settings(self) -> "Settings":
        # JWT_SECRET_KEY: prefer explicit value, fall back to SESSION_SECRET
        if not self.JWT_SECRET_KEY:
            self.JWT_SECRET_KEY = self.SESSION_SECRET or "dev-secret-change-in-production"

        # DATABASE_URL: construct from PG* vars if not provided as full URL
        if not self.DATABASE_URL:
            pg_host = os.environ.get("PGHOST", "localhost")
            pg_port = os.environ.get("PGPORT", "5432")
            pg_user = os.environ.get("PGUSER", "postgres")
            pg_pass = os.environ.get("PGPASSWORD", "postgres")
            pg_db = os.environ.get("PGDATABASE", "cozyjet")
            self.DATABASE_URL = f"postgresql://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}"

        # ALLOWED_ORIGINS: always include Replit domains
        if not self.ALLOWED_ORIGINS:
            self.ALLOWED_ORIGINS = _build_allowed_origins()
        else:
            dynamic = _build_allowed_origins()
            merged = list(set(self.ALLOWED_ORIGINS + dynamic))
            self.ALLOWED_ORIGINS = merged

        # CELERY_BROKER_URL mirrors REDIS_URL if set
        if self.REDIS_URL and not self.CELERY_BROKER_URL:
            self.CELERY_BROKER_URL = self.REDIS_URL

        return self


settings = Settings()
