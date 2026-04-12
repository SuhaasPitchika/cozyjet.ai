import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Enum as SAEnum, Index, text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ContentStatus(str, enum.Enum):
    draft = "draft"
    approved = "approved"
    scheduled = "scheduled"
    published = "published"
    failed = "failed"


class ContentPlatform(str, enum.Enum):
    linkedin = "linkedin"
    twitter = "twitter"
    instagram = "instagram"
    youtube = "youtube"
    reddit = "reddit"


class ContentType(str, enum.Enum):
    post = "post"
    thread = "thread"
    carousel = "carousel"
    video_script = "video_script"
    article = "article"


class Content(Base):
    __tablename__ = "content"
    __table_args__ = (
        Index("idx_user_id_status", "user_id", "status"),
        Index(
            "idx_scheduled_ready",
            "scheduled_time",
            postgresql_where=text(
                "scheduled_time IS NOT NULL AND status = 'approved'"
            ),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    seed_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("content_seeds.id", ondelete="SET NULL"),
        nullable=True,
    )
    platform: Mapped[ContentPlatform] = mapped_column(SAEnum(ContentPlatform))
    content_type: Mapped[ContentType] = mapped_column(
        SAEnum(ContentType), default=ContentType.post
    )
    content_text: Mapped[str] = mapped_column(Text, default="")
    hook: Mapped[str | None] = mapped_column(Text, nullable=True)
    variation_index: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[ContentStatus] = mapped_column(
        SAEnum(ContentStatus), default=ContentStatus.draft, index=True
    )
    virality_score: Mapped[int] = mapped_column(Integer, default=0)
    virality_reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    scheduled_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    platform_post_id: Mapped[str | None] = mapped_column(String, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    narrative_arc_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("narrative_arcs.id", ondelete="SET NULL"),
        nullable=True,
    )
    arc_stage: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
