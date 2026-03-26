import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Enum, DateTime, JSON, ForeignKey, Text, Integer, Float, ARRAY, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base

class SubscriptionTier(str, enum.Enum):
    free = "free"
    pro = "pro"
    studio = "studio"

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    display_name = Column(String)
    avatar_url = Column(String, nullable=True)
    subscription_tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.free)
    
    # Voice Profile: {tone, style, emoji_usage, formality, humor, preferred_platforms, writing_examples}
    voice_profile = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class IntegrationPlatform(str, enum.Enum):
    github = "github"
    notion = "notion"
    figma = "figma"
    google_drive = "google_drive"
    google_calendar = "google_calendar"
    linkedin = "linkedin"
    twitter = "twitter"
    instagram = "instagram"

class Integration(Base):
    __tablename__ = "integrations"
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    platform = Column(Enum(IntegrationPlatform), nullable=False)
    
    # Encrypted fields
    access_token_encrypted = Column(Text, nullable=False)
    refresh_token_encrypted = Column(Text, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    
    is_active = Column(Boolean, default=True)
    scopes = Column(ARRAY(String), default=[])
    platform_user_id = Column(String, nullable=True)
    platform_username = Column(String, nullable=True)
    
    last_synced_at = Column(DateTime, nullable=True)
    sync_error = Column(Text, nullable=True)
    metadata = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class IntegrationSyncLog(Base):
    __tablename__ = "integration_sync_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    integration_id = Column(UUID(as_uuid=True), ForeignKey("integrations.id", ondelete="CASCADE"))
    status = Column(String) # "success", "failure"
    seeds_created = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)

class ContentSeed(Base):
    __tablename__ = "content_seeds"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    source_platform = Column(String) 
    source_url = Column(String, nullable=True)
    source_metadata = Column(JSON, default=dict)
    tags = Column(ARRAY(String), default=[])
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ContentStatus(str, enum.Enum):
    draft = "draft"
    approved = "approved"
    scheduled = "scheduled"
    published = "published"
    failed = "failed"

class Content(Base):
    __tablename__ = "content"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    seed_id = Column(UUID(as_uuid=True), ForeignKey("content_seeds.id"), nullable=True)
    platform = Column(String, nullable=False)
    content_type = Column(String) 
    content_text = Column(Text, nullable=False)
    variation_index = Column(Integer, default=0) # 0, 1, 2
    
    status = Column(Enum(ContentStatus), default=ContentStatus.draft)
    scheduled_time = Column(DateTime, nullable=True)
    published_at = Column(DateTime, nullable=True)
    platform_post_id = Column(String, nullable=True)
    error_message = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PostAnalytics(Base):
    __tablename__ = "post_analytics"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(UUID(as_uuid=True), ForeignKey("content.id", ondelete="CASCADE"))
    platform = Column(String)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    shares = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)
    fetched_at = Column(DateTime, default=datetime.utcnow)

class TuneSample(Base):
    __tablename__ = "tune_samples"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    sample_text = Column(Text, nullable=False)
    platform = Column(String)
    source = Column(String) 
    created_at = Column(DateTime, default=datetime.utcnow)
