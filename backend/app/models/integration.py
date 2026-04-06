import enum
import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, Text, Boolean, DateTime, JSON, Index
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin


class IntegrationPlatform(str, enum.Enum):
    github = "github"
    notion = "notion"
    figma = "figma"
    google_drive = "google_drive"
    google_calendar = "google_calendar"
    linkedin = "linkedin"
    twitter = "twitter"
    instagram = "instagram"


class Integration(Base, TimestampMixin):
    __tablename__ = "integrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(Enum(IntegrationPlatform), nullable=False)

    # AES-256 encrypted via Fernet — never stored as plaintext
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)

    platform_user_id = Column(String, nullable=True)
    platform_username = Column(String, nullable=True)
    scopes = Column(JSON, default=list)

    is_active = Column(Boolean, default=True)
    last_synced_at = Column(DateTime, nullable=True)
    sync_error = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_integration_user_platform", "user_id", "platform", unique=True),
    )
