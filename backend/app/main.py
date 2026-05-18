from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import content, health, profile, session
from app.core.config import get_settings
from app.core.envelope import failure, get_request_id
from app.core.errors import AppError
from app.core.middleware import (
    RateLimitMiddleware,
    RequestIDMiddleware,
    RequestLoggingMiddleware,
)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="0.1.0")

    # CORS middleware (outermost)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # LLD Middleware chain order:
    # 1. Request ID assignment
    # 2. Structured request logging
    # 3. Rate limiting
    # (JWT verification, consent check, input validation via DI)
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        detail = exc.detail if isinstance(exc.detail, dict) else {}
        body = failure(
            detail.get("code", "SYSTEM_ERROR"),
            detail.get("message", "Unexpected system error"),
            request,
            detail.get("details"),
        )
        return JSONResponse(status_code=exc.status_code, content=body.model_dump())

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        body = failure(
            "VALIDATION_ERROR",
            "Request validation failed",
            request,
            {"errors": exc.errors()},
        )
        return JSONResponse(status_code=422, content=body.model_dump())

    app.include_router(health.router)
    app.include_router(profile.router, prefix=f"/{settings.api_version}")
    app.include_router(content.router, prefix=f"/{settings.api_version}")
    app.include_router(session.router, prefix=f"/{settings.api_version}")
    return app


app = create_app()
