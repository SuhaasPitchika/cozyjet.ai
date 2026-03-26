import enum
import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, Text, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from .base import Base, TimestampMixin

class SourceType(str, enum.Enum):
    github = "github"
    figma = "figma"
    notion = "notion"
    voice = "voice"
    screenshot = "screenshot"
    manual = "manual"

class ContentSeed(Base, TimestampMixin):
    __tablename__ = "content_seeds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    source_type = Column(Enum(SourceType), nullable=False)
    
    # Store commit hashes, repo names, Figma keys, etc.
    source_data = Column(JSON, default={})
    
    # PostgreSQL array for categorization
    tags = Column(ARRAY(String), default=[])
    
    is_used = Column(Boolean, default=False)
