from sqlalchemy.orm import Session
from app.db.models import Submission, SubmissionStatus
from app.services.llm import llm_client
from app.core.logging import get_logger

logger = get_logger(__name__)


def process_submission(submission_id: str, db: Session):
    """processes a submission by calling llm and updating the database with results"""
    logger.info(f"Processing submission {submission_id}")
    
    try:
        # fetch the submission from the database
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            logger.error(f"Submission {submission_id} not found")
            return
        
        # call the llm to generate a response
        llm_output = llm_client.generate(submission.review, submission.rating)
        
        # save the llm results to the submission
        submission.user_ai_response = llm_output.user_ai_response
        submission.admin_summary = llm_output.admin_summary
        submission.recommended_actions = llm_output.recommended_actions
        submission.status = SubmissionStatus.COMPLETED
        submission.error_message = None
        
        db.commit()
        logger.info(f"Successfully processed submission {submission_id}")
        
    except Exception as e:
        logger.error(f"Failed to process submission {submission_id}: {str(e)}")
        
        # mark submission as failed and record the error
        try:
            submission = db.query(Submission).filter(Submission.id == submission_id).first()
            if submission:
                submission.status = SubmissionStatus.FAILED
                submission.error_message = str(e)
                db.commit()
        except Exception as db_error:
            logger.error(f"Failed to update submission status: {str(db_error)}")
            db.rollback()
