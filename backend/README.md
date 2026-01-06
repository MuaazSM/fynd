# Multi-User Submission API - Backend

A scalable FastAPI backend for managing user submissions with LLM-powered processing and admin dashboard.

## Features

- **User Submission Flow**: Public API for submitting ratings and reviews
- **LLM Processing**: Server-side AI processing with structured output
- **Admin Dashboard**: JWT-protected endpoints for viewing submissions and analytics
- **Background Processing**: Async processing with FastAPI BackgroundTasks
- **PostgreSQL Database**: Robust data persistence with programmatic table creation
- **Validation**: Comprehensive input validation with Pydantic v2
- **Error Handling**: Graceful handling of LLM failures, long reviews, and edge cases
- **Flexible LLM Provider**: Mock, OpenAI, and Gemini support

## Prerequisites

- Python 3.11 or higher
- PostgreSQL 12+ (running locally or remote)
- pip or poetry for dependency management

## Installation

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure required variables:

```env
# Database - REQUIRED
DATABASE_URL=postgresql+psycopg://postgres:yourpassword@localhost:5432/app_db

# Admin Credentials - REQUIRED
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# JWT Secret - REQUIRED (use a secure random string)
JWT_SECRET=your_secret_key_here_change_this

# LLM Configuration
LLM_PROVIDER=mock  # Options: mock, openai, gemini
LLM_API_KEY=your_api_key_if_using_openai_or_gemini
LLM_MODEL=gpt-4
```

### 5. Setup Database

Create the PostgreSQL database:

```bash
psql -U postgres
CREATE DATABASE app_db;
\q
```

Tables will be created automatically when you start the server.

## Running the Server

Start the development server:

```bash
uvicorn app.main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **OpenAPI Spec**: http://localhost:8000/openapi.json

## Running Tests

Execute the test suite:

```bash
pytest tests/ -v
```

For test coverage:

```bash
pytest tests/ --cov=app --cov-report=html
```

## API Usage Examples

### 1. Submit a Review (Public)

```bash
curl -X POST http://localhost:8000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "review": "Amazing product! Really exceeded my expectations."
  }'
```

Response:
```json
{
  "submission_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PENDING"
}
```

### 2. Check Submission Status

```bash
curl http://localhost:8000/api/submissions/550e8400-e29b-41d4-a716-446655440000
```

Response (when PENDING):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "rating": 5,
  "review": "Amazing product! Really exceeded my expectations.",
  "status": "PENDING",
  "created_at": "2026-01-06T12:00:00"
}
```

Response (when COMPLETED):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "rating": 5,
  "review": "Amazing product! Really exceeded my expectations.",
  "status": "COMPLETED",
  "created_at": "2026-01-06T12:00:00",
  "user_ai_response": "Thank you for your positive feedback! We're thrilled to hear you had a great experience."
}
```

### 3. Admin Login

```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_password"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 4. List Submissions (Admin)

```bash
curl http://localhost:8000/api/admin/submissions?limit=10&offset=0 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

With filters:
```bash
curl "http://localhost:8000/api/admin/submissions?rating=5&status=COMPLETED&q=amazing" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "rating": 5,
      "status": "COMPLETED",
      "created_at": "2026-01-06T12:00:00",
      "review_preview": "Amazing product! Really exceeded my expectations.",
      "admin_summary": "Positive review - customer satisfied",
      "recommended_actions": ["Send thank you note", "Request online review"],
      "error_message": null
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

### 5. Get Analytics (Admin)

```bash
curl http://localhost:8000/api/admin/analytics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
{
  "counts_by_rating": {
    "1": 5,
    "2": 3,
    "3": 8,
    "4": 15,
    "5": 20
  },
  "counts_by_status": {
    "PENDING": 2,
    "COMPLETED": 48,
    "FAILED": 1
  },
  "submissions_per_day": [
    {"date": "2026-01-01", "count": 10},
    {"date": "2026-01-02", "count": 12},
    {"date": "2026-01-03", "count": 8}
  ]
}
```

### 6. Health Check

```bash
curl http://localhost:8000/api/health
```

Response:
```json
{
  "status": "ok"
}
```

## Architecture Highlights

### Folder Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── core/
│   │   ├── config.py        # Environment-based configuration
│   │   ├── logging.py       # Centralized logging
│   │   └── security.py      # JWT authentication
│   ├── db/
│   │   ├── base.py          # SQLAlchemy base
│   │   ├── session.py       # Database session management
│   │   └── models.py        # Database models
│   ├── schemas/
│   │   ├── submissions.py   # Pydantic schemas for submissions
│   │   ├── admin.py         # Admin response schemas
│   │   └── auth.py          # Auth request/response schemas
│   ├── routers/
│   │   ├── health.py        # Health check endpoint
│   │   ├── submissions.py   # User submission endpoints
│   │   ├── admin.py         # Admin dashboard endpoints
│   │   └── auth.py          # Authentication endpoints
│   ├── services/
│   │   ├── llm.py           # LLM client with retry logic
│   │   ├── prompts.py       # LLM prompt templates
│   │   └── processing.py    # Background processing logic
│   └── utils/
│       └── pagination.py    # Pagination utilities
├── tests/
│   ├── conftest.py          # Pytest fixtures
│   ├── test_submission_validation.py
│   └── test_submission_flow.py
├── requirements.txt
├── .env.example
└── README.md
```

### Design Decisions

#### 1. Review Truncation
- Reviews exceeding `MAX_REVIEW_CHARS` (default 4000) are automatically truncated
- Truncation happens at submission time to ensure database consistency
- Behavior is logged for monitoring

#### 2. Background Processing
- Uses FastAPI BackgroundTasks for simple async processing
- Designed to be easily migrated to Celery or other queue systems
- Processing logic in `services/processing.py` is independent of execution method

#### 3. LLM Providers
- **Mock Provider** (default): Deterministic responses for dev/testing
- **OpenAI**: GPT-4 or other models via OpenAI API
- **Gemini**: Google's Gemini models
- Switch via `LLM_PROVIDER` environment variable
- All providers return structured JSON validated by Pydantic

#### 4. Error Handling
- LLM failures are caught and marked in database with `FAILED` status
- Internal error details stored in `error_message` (admin-visible only)
- Users see generic error message: "We encountered an issue..."
- Exponential backoff retry with configurable attempts

#### 5. Security
- JWT tokens for admin authentication
- Passwords/secrets never logged or exposed in responses
- CORS configured via environment variable
- Admin credentials from environment (never hardcoded)

#### 6. Database
- PostgreSQL with automatic table creation on startup
- UUID primary keys for submissions
- Indexes on `created_at`, `rating`, `status` for query performance
- JSONB field for flexible `recommended_actions` storage

## Configuration Reference

All configuration is managed through environment variables in `.env`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `ADMIN_USERNAME` | Yes | - | Admin login username |
| `ADMIN_PASSWORD` | Yes | - | Admin login password |
| `JWT_SECRET` | Yes | - | Secret key for JWT signing |
| `JWT_ALGORITHM` | No | HS256 | JWT algorithm |
| `JWT_EXPIRE_MINUTES` | No | 1440 | Token expiry (24 hours) |
| `MAX_REVIEW_CHARS` | No | 4000 | Maximum review length |
| `LLM_PROVIDER` | No | mock | LLM provider (mock/openai/gemini) |
| `LLM_API_KEY` | Conditional | - | API key for OpenAI/Gemini |
| `LLM_MODEL` | No | gpt-4 | Model name |
| `LLM_BASE_URL` | No | - | Custom API endpoint |
| `LLM_TIMEOUT_SECONDS` | No | 30 | Request timeout |
| `LLM_MAX_RETRIES` | No | 2 | Retry attempts |
| `CORS_ORIGINS` | No | localhost:3000 | Comma-separated origins |
| `LOG_LEVEL` | No | INFO | Logging level |

## Troubleshooting

### Database Connection Issues

If you see `could not connect to server`:
1. Verify PostgreSQL is running: `psql -U postgres`
2. Check `DATABASE_URL` in `.env` matches your PostgreSQL config
3. Ensure database exists: `CREATE DATABASE app_db;`

### LLM Processing Failures

If submissions get stuck in PENDING:
1. Check logs for LLM errors: Look for "Failed to process submission"
2. Verify `LLM_PROVIDER` is set correctly (use "mock" for testing)
3. For OpenAI/Gemini: Ensure `LLM_API_KEY` is valid

### Admin Login Not Working

1. Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`
2. Check `JWT_SECRET` is set (must be non-empty string)
3. Restart server after changing `.env`

## Development Tips

- Use `LLM_PROVIDER=mock` for development (no API calls, instant responses)
- Run tests before committing: `pytest tests/`
- Check API docs at http://localhost:8000/docs for interactive testing
- Monitor logs for debugging: Set `LOG_LEVEL=DEBUG` in `.env`

## Production Considerations

Before deploying to production:

1. **Change all secrets**: Generate strong random values for `JWT_SECRET`, `ADMIN_PASSWORD`
2. **Use real LLM provider**: Set `LLM_PROVIDER=openai` or `gemini` with valid API key
3. **Configure CORS**: Set `CORS_ORIGINS` to your frontend domain(s)
4. **Database**: Use managed PostgreSQL service with backups
5. **Background tasks**: Consider migrating to Celery for distributed processing
6. **Logging**: Integrate with application monitoring (Sentry, Datadog, etc.)
7. **Rate limiting**: Add rate limiting middleware for public endpoints
8. **HTTPS**: Always use HTTPS in production

## License

This project is provided as-is for demonstration purposes.

## Support

For issues or questions, please refer to the inline code documentation or FastAPI documentation at https://fastapi.tiangolo.com/
