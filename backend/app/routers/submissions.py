from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Submission, SubmissionStatus
from app.schemas.submissions import SubmissionCreate, SubmissionResponse, SubmissionDetail
from app.services.processing import process_submission
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/submissions", tags=["submissions"])


@router.post("")
def create_submission(
    submission: SubmissionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """accepts a new review submission and queues it for llm processing"""
    # validate and truncate review if it exceeds the limit
    review_text = submission.review
    if len(review_text) > settings.MAX_REVIEW_CHARS:
        logger.warning(f"Review exceeds {settings.MAX_REVIEW_CHARS} chars, truncating")
        review_text = review_text[:settings.MAX_REVIEW_CHARS]
    
    # create the submission in the database
    db_submission = Submission(
        rating=submission.rating,
        review=review_text,
        status=SubmissionStatus.PENDING
    )
    
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    logger.info(f"Created submission {db_submission.id}")
    
    # queue up background llm processing
    background_tasks.add_task(process_submission, str(db_submission.id), db)
    
    return SubmissionResponse(
        submission_id=db_submission.id,
        status=db_submission.status.value
    )


@router.get("/{submission_id}")
def get_submission(submission_id: str, db: Session = Depends(get_db)):
    """retrieves the current status and details of a submission"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    response_data = {
        "id": submission.id,
        "rating": submission.rating,
        "review": submission.review,
        "status": submission.status.value,
        "created_at": submission.created_at
    }
    
    # add the ai response if processing is complete
    if submission.status == SubmissionStatus.COMPLETED:
        response_data["user_ai_response"] = submission.user_ai_response
    
    # return generic error message for failed submissions
    if submission.status == SubmissionStatus.FAILED:
        response_data["error_message"] = "We encountered an issue processing your submission. Please try again later."
    
    return SubmissionDetail(**response_data)
