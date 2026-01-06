from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional, List, Dict, Any


class AdminSubmissionItem(BaseModel):
    """Schema for admin submission list item."""
    id: UUID
    rating: int
    status: str
    created_at: datetime
    review_preview: str
    admin_summary: Optional[str] = None
    recommended_actions: Optional[List[str]] = None
    error_message: Optional[str] = None
    
    class Config:
        from_attributes = True


class AdminSubmissionsResponse(BaseModel):
    """Schema for paginated admin submissions response."""
    items: List[AdminSubmissionItem]
    total: int
    limit: int
    offset: int


class AnalyticsResponse(BaseModel):
    """Schema for analytics data."""
    counts_by_rating: Dict[int, int]
    counts_by_status: Dict[str, int]
    submissions_per_day: List[Dict[str, Any]]
