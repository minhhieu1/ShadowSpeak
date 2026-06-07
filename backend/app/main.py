import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.requests import Request

from app.api.routes import profile
from app.core.config import Settings, get_settings
from app.core.envelope import ApiErrorPayload, failure
from app.core.errors import AppError, AppErrorCode
from app.core.middleware import CORSMiddleware, RateLimitMiddleware, RequestIDMiddleware, RequestLoggingMiddleware


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    app = FastAPI(title=settings.app_name, version="0.1.0")
    app.state.settings = settings

    _setup_logging(settings)
    _register_middleware(app, settings)
    app.include_router(profile.router)
    _register_exception_handlers(app)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "env": settings.app_env}

    @app.get("/v1/config/runtime")
    def runtime_config(request: Request) -> dict[str, object]:
        """OIDC configuration for the mobile app.

        Returns enough information for the frontend to initialise the
        authentication flow (discovery URL, client ID, scopes, redirect
        URI) without hard-coding any provider-specific details.  The
        frontend uses this to configure the auth SDK at boot time.

        The four endpoint fields map to provider-specific URLs:
          - Keycloak: issuer + "protocol/openid-connect/{auth,token,revoke,logout}"
          - Cognito:  domain + "/oauth2/{authorize,token,...}"
        They are set via env vars and can differ per provider without
        any code change.
        """
        return {
            "version": 1,
            "provider": settings.auth_provider,
            "issuer": settings.auth_issuer,
            "clientId": settings.auth_client_id,
            "redirectUri": settings.auth_redirect_uri,
            "scopes": settings.auth_scopes,
            "authorizationEndpoint": settings.auth_authorization_endpoint or None,
            "tokenEndpoint": settings.auth_token_endpoint or None,
            "revocationEndpoint": settings.auth_revocation_endpoint or None,
            "endSessionEndpoint": settings.auth_end_session_endpoint or None,
        }

    return app


def _setup_logging(settings: Settings) -> None:
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(levelname)s\t%(message)s",
    )


def _register_middleware(app: FastAPI, settings: Settings) -> None:
    """Register middleware — last added runs first (outermost).

    Effective request order: RequestID → CORS → Logging.
    """
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(CORSMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    if settings.rate_limit_enabled:
        app.add_middleware(
            RateLimitMiddleware,
            window_seconds=settings.rate_limit_window_seconds,
            authenticated_limit=settings.rate_limit_authenticated_writes,
            preauth_limit=settings.rate_limit_preauth_writes,
        )


def _register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        detail = exc.detail if isinstance(exc.detail, dict) else {
            "code": AppErrorCode.SYSTEM_ERROR,
            "message": str(exc.detail),
        }
        envelope = failure(
            ApiErrorPayload(
                code=detail.get("code", AppErrorCode.SYSTEM_ERROR),
                message=detail.get("message", "Request failed"),
                details=detail.get("details"),
            ),
            getattr(request.state, "request_id", ""),
        )
        return JSONResponse(status_code=exc.status_code, content=envelope.model_dump())

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        envelope = failure(
            ApiErrorPayload(
                code=AppErrorCode.VALIDATION_ERROR,
                message="Validation failed",
                details={"errors": exc.errors()},
            ),
            getattr(request.state, "request_id", ""),
        )
        return JSONResponse(status_code=422, content=envelope.model_dump())

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        envelope = failure(
            ApiErrorPayload(code=exc.code, message=exc.message, details=exc.details),
            getattr(request.state, "request_id", ""),
        )
        return JSONResponse(status_code=exc.status_code, content=envelope.model_dump())

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        envelope = failure(
            ApiErrorPayload(
                code=AppErrorCode.SYSTEM_ERROR,
                message="Internal server error",
            ),
            getattr(request.state, "request_id", ""),
        )
        return JSONResponse(status_code=500, content=envelope.model_dump())


try:
    app = create_app()
except Exception:
    logging.getLogger("shadowspeak").warning(
        "Skipping module-level app creation because runtime settings are unavailable"
    )
    app = FastAPI()
