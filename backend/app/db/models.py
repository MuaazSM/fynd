import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, Index, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base
import enum

# helper function to get current time with timezone
def utc_now():
    """returns current time in utc with timezone info"""
    return datetime.now(timezone.utc)


class SubmissionStatus(str, enum.Enum):
    """possible states for a submission throughout its lifecycle"""
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Submission(Base):
    """stores user reviews and rating with ai-generated analysis and metadata"""
    __tablename__ = "submissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rating = Column(Integer, nullable=False)
    review = Column(Text, nullable=False)
    status = Column(SQLEnum(SubmissionStatus), nullable=False, default=SubmissionStatus.PENDING)
    
    # fields populated by the llm
    user_ai_response = Column(Text, nullable=True)
    admin_summary = Column(Text, nullable=True)
    recommended_actions = Column(JSONB, nullable=True)
    
    # tracks any errors during processing
    error_message = Column(Text, nullable=True)
    
    # creation and update timestamps (timezone-aware utc)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
    
    # indexes for faster queries
    __table_args__ = (
        Index("idx_created_at", "created_at"),
        Index("idx_rating", "rating"),
        Index("idx_status", "status"),
    )
