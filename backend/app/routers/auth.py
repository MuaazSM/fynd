from fastapi import APIRouter, HTTPException
from app.schemas.auth import LoginRequest, TokenResponse
from app.core.security import create_access_token
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/admin", tags=["auth"])


@router.post("/login")
def admin_login(credentials: LoginRequest):
    """
    Admin login endpoint.
    Validates credentials against environment variables and returns JWT token.
    """
    if (credentials.username != settings.ADMIN_USERNAME or 
        credentials.password != settings.ADMIN_PASSWORD):
        logger.warning(f"Failed login attempt for user: {credentials.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    access_token = create_access_token(data={"sub": credentials.username})
    
    logger.info(f"Successful login for user: {credentials.username}")
    
    return TokenResponse(access_token=access_token)
