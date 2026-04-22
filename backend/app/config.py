import logging
import os
from pathlib import Path
from typing import List, Optional
from urllib.parse import urlparse

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("cozyjet.config")

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_ENV_FILE = _BACKEND_DIR / ".env"


def _normalize_origin(raw: str) -> str:
    raw = (raw or "").strip()
    if not raw:
        return ""
    parsed = urlparse(raw)
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme}://{parsed.netloc}"
    return raw.rstrip("/")


def _build_allowed_origins(frontend_url: str = "") -> List[str]:
    origins = [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000",
    ]
    normalized_frontend = _normalize_origin(frontend_url)
    if normalized_frontend and normalized_frontend not in origins:
        origins.append(normalized_frontend)
    env_frontend = _normalize_origin(os.environ.get("FRONTEND_URL", ""))
    if env_frontend and env_frontend not in origins:
        origins.append(env_frontend)
    for domain in os.environ.get("REPLIT_DOMAINS", "").split(","):
        domain = domain.strip()
        if domain:
            origins.append(f"https://{domain}")
    dev = os.environ.get("REPLIT_DEV_DOMAIN", "").strip()
    if dev:
        origins.append(f"https://{dev}")
    explicit_origins = os.environ.get("ALLOWED_ORIGINS", "")
    for origin in explicit_origins.split(","):
        normalized = _normalize_origin(origin)
        if normalized and normalized not in origins:
            origins.append(normalized)
    return sorted(set(origins))


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "CozyJet Studio"
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: List[str] = []

    JWT_SECRET_KEY: str = ""
    SESSION_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    ENCRYPTION_KEY: str = "ZmRlYWRiZWVmZmVlZGZhY2ViYWRkZWVkY2FmZWJhYmU="

    DATABASE_URL: str = ""
    REDIS_URL: str = ""
    CELERY_BROKER_URL: str = ""

    OPENROUTER_API_KEY: str = ""
    OPEN_ROUTER: str = ""
    OPENROUTER_DEFAULT_MODEL: str = "anthropic/claude-3.5-sonnet"
    OPENROUTER_FALLBACK_MODEL: str = "google/gemini-pro"

    GEMINI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_DEFAULT_VOICE_ID: str = "EXAVITQu4vr4xnSDxMaL"

    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    NOTION_CLIENT_ID: Optional[str] = None
    NOTION_CLIENT_SECRET: Optional[str] = None
    FIGMA_CLIENT_ID: Optional[str] = None
    FIGMA_CLIENT_SECRET: Optional[str] = None
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None
    TWITTER_CLIENT_ID: Optional[str] = None
    TWITTER_CLIENT_SECRET: Optional[str] = None
    INSTAGRAM_CLIENT_ID: Optional[str] = None
    INSTAGRAM_CLIENT_SECRET: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @model_validator(mode="after")
    def _resolve(self) -> "Settings":
        self.FRONTEND_URL = _normalize_origin(self.FRONTEND_URL) or self.FRONTEND_URL

        if not self.JWT_SECRET_KEY:
            self.JWT_SECRET_KEY = self.SESSION_SECRET or "dev-secret-change-in-production"

        if not self.ALGORITHM:
            self.ALGORITHM = self.JWT_ALGORITHM
        else:
            self.JWT_ALGORITHM = self.ALGORITHM

        if not self.OPENROUTER_API_KEY:
            self.OPENROUTER_API_KEY = self.OPEN_ROUTER or ""

        if not self.GEMINI_API_KEY:
            self.GEMINI_API_KEY = self.GOOGLE_API_KEY or ""

        if not self.DATABASE_URL:
            host = os.environ.get("PGHOST", "localhost")
            port = os.environ.get("PGPORT", "5432")
            user = os.environ.get("PGUSER", "postgres")
            password = os.environ.get("PGPASSWORD", "postgres")
            database = os.environ.get("PGDATABASE", "cozyjet")
            self.DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{database}"

        self.ALLOWED_ORIGINS = _build_allowed_origins(self.FRONTEND_URL)

        if self.REDIS_URL and not self.CELERY_BROKER_URL:
            self.CELERY_BROKER_URL = self.REDIS_URL

        if not self.OPENROUTER_API_KEY:
            logger.warning("OPENROUTER_API_KEY is not set; AI features will fail")
        if not self.DATABASE_URL:
            logger.warning("DATABASE_URL is not set; database features will fail")

        return self


settings = Settings()
