from pydantic import BaseModel


class LoginRequest(BaseModel):
    """Schema for admin login request."""
    username: str
    password: str


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
