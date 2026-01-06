from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.db.session import engine
from app.db.base import Base
from app.routers import health, submissions, admin, auth

# initialize logging for the application
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """handles app startup and shutdown lifecycle events"""
    # startup: create all database tables if they don't exist
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
    
    yield
    
    # cleanup on shutdown
    logger.info("Application shutting down")


# create the fastapi app with metadata
app = FastAPI(
    title="Multi-User Submission API",
    description="Backend API for user submissions with LLM processing",
    version="1.0.0",
    lifespan=lifespan
)

# setup cors to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# attach all the API routers
app.include_router(health.router)
app.include_router(submissions.router)
app.include_router(admin.router)
app.include_router(auth.router)


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Multi-User Submission API",
        "version": "1.0.0",
        "docs": "/docs"
    }
