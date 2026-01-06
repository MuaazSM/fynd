from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta
from typing import Optional
from app.db.session import get_db
from app.db.models import Submission, SubmissionStatus
from app.schemas.admin import AdminSubmissionItem, AdminSubmissionsResponse, AnalyticsResponse
from app.core.security import verify_token
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/submissions")
def list_submissions(
    rating: Optional[int] = Query(None, ge=1, le=5),
    status: Optional[str] = Query(None),
    q: Optional[str] = Query(None, description="Search in review text"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """lists all submissions with optional filtering and pagination - admin only"""
    query = db.query(Submission)
    
    # apply rating filter if provided
    if rating:
        query = query.filter(Submission.rating == rating)
    
    # apply status filter if provided
    if status:
        try:
            status_enum = SubmissionStatus[status.upper()]
            query = query.filter(Submission.status == status_enum)
        except KeyError:
            raise HTTPException(status_code=422, detail=f"Invalid status: {status}")
    
    if q:
        query = query.filter(Submission.review.ilike(f"%{q}%"))
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    submissions = query.order_by(Submission.created_at.desc()).offset(offset).limit(limit).all()
    
    # Format response
    items = []
    for sub in submissions:
        items.append(AdminSubmissionItem(
            id=sub.id,
            rating=sub.rating,
            status=sub.status.value,
            created_at=sub.created_at,
            review_preview=sub.review[:200] if len(sub.review) > 200 else sub.review,
            admin_summary=sub.admin_summary,
            recommended_actions=sub.recommended_actions,
            error_message=sub.error_message
        ))
    
    return AdminSubmissionsResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    username: str = Depends(verify_token)
):
    """
    Get analytics data for admin dashboard.
    Admin only - requires JWT authentication.
    """
    # Counts by rating
    rating_counts = db.query(
        Submission.rating,
        func.count(Submission.id)
    ).group_by(Submission.rating).all()
    
    counts_by_rating = {rating: count for rating, count in rating_counts}
    
    # Counts by status
    status_counts = db.query(
        Submission.status,
        func.count(Submission.id)
    ).group_by(Submission.status).all()
    
    counts_by_status = {status.value: count for status, count in status_counts}
    
    # Submissions per day for last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    daily_counts = db.query(
        cast(Submission.created_at, Date).label('date'),
        func.count(Submission.id).label('count')
    ).filter(
        Submission.created_at >= seven_days_ago
    ).group_by('date').order_by('date').all()
    
    submissions_per_day = [
        {"date": str(date), "count": count}
        for date, count in daily_counts
    ]
    
    return AnalyticsResponse(
        counts_by_rating=counts_by_rating,
        counts_by_status=counts_by_status,
        submissions_per_day=submissions_per_day
    )
