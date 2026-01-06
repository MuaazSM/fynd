from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from uuid import UUID
from typing import Optional, List


class SubmissionCreate(BaseModel):
    """Schema for creating a new submission."""
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    review: str = Field(..., min_length=1, description="Review text")
    
    @field_validator('review')
    @classmethod
    def review_not_empty(cls, v: str):
        """Ensure review is not empty after stripping whitespace."""
        if not v.strip():
            raise ValueError("Review cannot be empty")
        return v.strip()


class SubmissionResponse(BaseModel):
    """Schema for submission response."""
    submission_id: UUID
    status: str
    
    class Config:
        from_attributes = True


class SubmissionDetail(BaseModel):
    """Schema for detailed submission information."""
    id: UUID
    rating: int
    review: str
    status: str
    created_at: datetime
    user_ai_response: Optional[str] = None
    error_message: Optional[str] = None
    
    class Config:
        from_attributes = True


class LLMOutput(BaseModel):
    """Schema for LLM-generated output validation."""
    user_ai_response: str
    admin_summary: str
    recommended_actions: List[str]
