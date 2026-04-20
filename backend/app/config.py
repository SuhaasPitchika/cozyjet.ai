import logging
import os
from pathlib import Path
from typing import Optional, List
from urllib.parse import urlparse
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("cozyjet.config")

# Always load backend/.env (not cwd-relative) so uvicorn picks it up from any working directory.
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
    # Always include the configured FRONTEND_URL (critical for production)
    normalized_frontend = _normalize_origin(frontend_url)
    if normalized_frontend and normalized_frontend not in origins:
        origins.append(normalized_frontend)
    # Also check the env var directly in case it wasn't passed yet
    env_frontend = _normalize_origin(os.environ.get("FRONTEND_URL", ""))
    if env_frontend and env_frontend not in origins:
        origins.append(env_frontend)
    for domain in os.environ.get("REPLIT_DOMAINS", "").split(","):
        domain = domain.strip()
        if domain:
            origins.append(f"https://{domain}")
    dev = os.environ.get("REPLIT_DEV_DOMAIN", "")
    if dev and f"https://{dev}" not in origins:
        origins.append(f"https://{dev}")
    return list(set(origins))


class Settings(BaseSettings):
    # App
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "CozyJet Studio"
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: List[str] = []

    # Auth
    JWT_SECRET_KEY: str = ""
    SESSION_SECRET: str = ""          # Replit native secret — maps to JWT_SECRET_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Encryption
    ENCRYPTION_KEY: str = "ZmRlYWRiZWVmZmVlZGZhY2ViYWRkZWVkY2FmZWJhYmU="

    # Database
    DATABASE_URL: str = ""

    # Redis (optional — graceful fallback if missing)
    REDIS_URL: str = ""
    CELERY_BROKER_URL: str = ""

    # ── AI Keys ─────────────────────────────────────────────
    # OpenRouter — stored in Replit as OPEN_ROUTER
    OPENROUTER_API_KEY: str = ""
    OPEN_ROUTER: str = ""                               # Replit secret name alias
    OPENROUTER_DEFAULT_MODEL: str = "anthropic/claude-3.5-sonnet"
    OPENROUTER_FALLBACK_MODEL: str = "google/gemini-pro"

    # Gemini — stored in Replit as GOOGLE_API_KEY
    GEMINI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""                            # Replit secret name alias

    # ElevenLabs — stored in Replit as ELEVENLABS_API_KEY (exact match)
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_DEFAULT_VOICE_ID: str = "EXAVITQu4vr4xnSDxMaL"

    # Legacy / optional
    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    # OAuth
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

        # JWT secret — prefer explicit, fall back to Replit SESSION_SECRET
        if not self.JWT_SECRET_KEY:
            if self.ENVIRONMENT.lower() in ("production", "staging"):
                raise ValueError("JWT_SECRET_KEY must be set in non-development environments")
            # Development fallback (never use in production).
            self.JWT_SECRET_KEY = self.SESSION_SECRET or "dev-secret-change-in-production"

        # OpenRouter key — Replit stores it as OPEN_ROUTER
        if not self.OPENROUTER_API_KEY:
            self.OPENROUTER_API_KEY = self.OPEN_ROUTER or ""

        # Gemini key — Replit stores it as GOOGLE_API_KEY
        if not self.GEMINI_API_KEY:
            self.GEMINI_API_KEY = self.GOOGLE_API_KEY or ""

        # DATABASE_URL — build from PG* vars if not a full URL
        if not self.DATABASE_URL:
            h = os.environ.get("PGHOST", "localhost")
            p = os.environ.get("PGPORT", "5432")
            u = os.environ.get("PGUSER", "postgres")
            pw = os.environ.get("PGPASSWORD", "postgres")
            db = os.environ.get("PGDATABASE", "cozyjet")
            self.DATABASE_URL = f"postgresql://{u}:{pw}@{h}:{p}/{db}"

        # ALLOWED_ORIGINS — always inject FRONTEND_URL + Replit domains
        self.ALLOWED_ORIGINS = _build_allowed_origins(self.FRONTEND_URL)

        # Celery mirrors Redis
        if self.REDIS_URL and not self.CELERY_BROKER_URL:
            self.CELERY_BROKER_URL = self.REDIS_URL

        # Warn about missing critical keys so they show up in startup logs
        if not self.OPENROUTER_API_KEY:
            logger.warning("OPENROUTER_API_KEY is not set — AI features will fail")
        if not self.DATABASE_URL:
            logger.warning("DATABASE_URL is not set — database features will fail")

        return self


settings = Settings()
