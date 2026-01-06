import os
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """loads all app settings from environment variables, with sensible defaults where needed"""
    # database connection string
    DATABASE_URL: str
    DATABASE_URL_TEST: str = ""
    
    # app limits and logging
    MAX_REVIEW_CHARS: int = 4000
    LOG_LEVEL: str = "INFO"
    
    # admin login credentials
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str 
    
    # jwt token config - supports both SECRET_KEY (from Render) and JWT_SECRET (local)
    SECRET_KEY: Optional[str] = None
    JWT_SECRET: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    
    @property
    def jwt_secret_key(self) -> str:
        """returns the jwt secret, preferring SECRET_KEY for Render compatibility"""
        return self.SECRET_KEY or self.JWT_SECRET or "dev-secret-change-me"
    
    # llm provider settings
    LLM_PROVIDER: str = "groq"
    LLM_API_KEY: str = ""
    GROQ_API_KEY: Optional[str] = None  # groq api key if using groq provider
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    LLM_BASE_URL: str = ""
    LLM_TIMEOUT_SECONDS: int = 30
    LLM_MAX_RETRIES: int = 2
    
    @property
    def llm_api_key(self) -> str:
        """returns the api key based on which provider is configured"""
        if self.LLM_PROVIDER == "groq":
            return self.GROQ_API_KEY or self.LLM_API_KEY or ""
    
    # cors allowed origins (comma-separated)
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    
    def get_cors_origins(self) -> List[str]:
        """parses cors origins from a comma-separated string into a list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
