# ShadowSpeak Backend

FastAPI backend scaffold for the ShadowSpeak MVP.

## Stack

- Python 3.12
- FastAPI + Pydantic v2
- Mangum adapter for AWS Lambda
- Local in-memory repository for development
- Future production adapters: Cognito, DynamoDB single-table, S3, CloudFront

## Structure

```text
backend/
├── app/
│   ├── api/routes/        # REST routes under /v1
│   ├── core/              # config, auth boundary, envelopes, errors
│   ├── models/            # Pydantic schemas from specs
│   ├── repositories/      # in-memory repository, future DynamoDB adapter boundary
│   ├── lambda_handler.py  # AWS Lambda entrypoint
│   └── main.py            # FastAPI app factory
├── tests/
└── pyproject.toml
```

## Local Setup

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

If `python3.12` is not installed locally, use any Python `>=3.12`.

## Run

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Useful URLs:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

## Test And Lint

```bash
cd backend
source .venv/bin/activate
pytest
ruff check app tests
```

## Implemented API Surface

- `GET /health`
- `GET /v1/me`
- `PUT /v1/me`
- `GET /v1/consent`
- `PUT /v1/consent`
- `DELETE /v1/account`
- `GET /v1/lessons`
- `GET /v1/lessons/{lesson_id}`
- `GET /v1/home/recommendation`
- `POST /v1/downloads/{lesson_id}/url`
- `POST /v1/downloads/{lesson_id}/verify`
- `GET /v1/sessions/{session_id}`
- `POST /v1/sessions`
- `PATCH /v1/sessions/{session_id}`
- `POST /v1/sessions/{session_id}/complete`
- `GET /v1/progress`
- `GET /v1/progress/history`
- `POST /v1/progress/sync`

## Auth Boundary

Local development uses `ALLOW_DEV_AUTH=true`, so protected endpoints resolve to `demo-user`
without a bearer token. If a bearer token is provided, the token value is treated as the
development user id.

Production work should replace `app.core.auth.get_auth_context` with Cognito JWT validation
while preserving the same `AuthContext` boundary for services and routers.
