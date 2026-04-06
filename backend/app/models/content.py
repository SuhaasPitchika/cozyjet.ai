import enum
import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, Text, Integer, JSON, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin

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

class ContentStatus(str, enum.Enum):
    draft = "draft"
    approved = "approved"
    scheduled = "scheduled"
    published = "published"
    failed = "failed"

class Content(Base, TimestampMixin):
    __tablename__ = "content"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    seed_id = Column(UUID(as_uuid=True), ForeignKey("content_seeds.id", ondelete="SET NULL"), nullable=True)
    
    platform = Column(Enum(ContentPlatform), nullable=False)
    content_type = Column(Enum(ContentType), nullable=False)
    content_text = Column(Text, nullable=False)
    
    # Opening hook line (extracted separately at high temperature)
    hook = Column(Text, nullable=True)

    variation_index = Column(Integer, default=0)  # 0 to 2
    status = Column(Enum(ContentStatus), default=ContentStatus.draft)

    # Virality pre-assessment: 0-100 + reasoning from Mistral 7B
    virality_score = Column(Integer, default=0)
    virality_reasoning = Column(Text, nullable=True)

    scheduled_time = Column(DateTime, nullable=True)
    published_at = Column(DateTime, nullable=True)

    platform_post_id = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)

    # Narrative arc linkage
    narrative_arc_id = Column(UUID(as_uuid=True), ForeignKey("narrative_arcs.id", ondelete="SET NULL"), nullable=True)
    arc_stage = Column(String(100), nullable=True)  # e.g. "teaser", "struggle", "breakthrough"

    # Indexes for performance
    __table_args__ = (
        Index("idx_user_id_status", "user_id", "status"),
        Index("idx_scheduled_ready", "scheduled_time", 
              postgresql_where=(scheduled_time != None) & (status == 'approved'))
    )
