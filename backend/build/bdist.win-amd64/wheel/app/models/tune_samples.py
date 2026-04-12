import enum
import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from .base import Base, TimestampMixin


class TuneSampleSource(str, enum.Enum):
    manual = "manual"
    imported = "imported"
    approved_post = "approved_post"


class TuneSample(Base, TimestampMixin):
    __tablename__ = "tune_samples"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sample_text = Column(Text, nullable=False)
    platform = Column(String, nullable=True)
    source = Column(Enum(TuneSampleSource), nullable=False, default=TuneSampleSource.manual)
