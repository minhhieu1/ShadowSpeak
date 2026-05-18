"""Middleware chain for request ID, logging, and rate limiting.

Follows the LLD middleware chain order:
1. Request ID assignment
2. Structured request logging
3. JWT verification (via dependency injection)
4. Consent check (via dependency injection)
5. Input validation (FastAPI built-in via Pydantic)
6. Rate limiting
7. Handler execution
8. Response formatting (via envelope)
"""

import logging
import time
from uuid import uuid4

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

logger = logging.getLogger("shadowspeak.api")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware that ensures every request has an X-Request-Id.

    If the client sends one, it is echoed back. Otherwise, a new UUID is generated.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        request_id = request.headers.get("X-Request-Id")
        if not request_id:
            request_id = str(uuid4())

        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-Id"] = request_id
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that logs structured request info for every request."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        start_time = time.monotonic()
        method = request.method
        path = request.url.path

        response = await call_next(request)

        duration_ms = int((time.monotonic() - start_time) * 1000)
        status_code = response.status_code

        logger.info(
            "REQUEST %s %s %d %dms",
            method,
            path,
            status_code,
            duration_ms,
        )
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting middleware.

    Per-user rate limit for writes, per-IP for pre-auth endpoints.
    Uses a sliding window approach.

    Note: For MVP this is a basic in-memory implementation.
    Production would use a distributed rate limiter (e.g., Redis or API Gateway).
    """

    def __init__(
        self,
        app,
        max_requests: int = 100,
        window_seconds: int = 60,
    ) -> None:
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[float]] = {}

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        client_key = self._get_client_key(request)
        now = time.monotonic()

        if client_key:
            self._cleanup(client_key, now)
            timestamps = self._requests.setdefault(client_key, [])
            if len(timestamps) >= self.max_requests:
                response = Response(
                    status_code=429,
                    content='{"ok":false,"error":{"code":"RATE_LIMITED",'
                    '"message":"Too many requests"}}',
                    media_type="application/json",
                )
                request_id = getattr(request.state, "request_id", str(uuid4()))
                response.headers["X-Request-Id"] = request_id
                response.headers["Retry-After"] = str(self.window_seconds)
                return response
            timestamps.append(now)

        return await call_next(request)

    def _get_client_key(self, request: Request) -> str | None:
        """Get a client identifier for rate limiting.

        For authenticated requests, uses the user ID.
        For pre-auth requests, uses the client IP.
        """
        auth_header = request.headers.get("Authorization", "")
        if auth_header and auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1].strip()
            if token:
                return f"user:{token}"
        # Non-authenticated: use IP
        forwarded = request.headers.get("X-Forwarded-For", "")
        if forwarded:
            return f"ip:{forwarded.split(',')[0].strip()}"
        client_host = request.client.host if request.client else None
        if client_host:
            return f"ip:{client_host}"
        return None

    def _cleanup(self, client_key: str, now: float) -> None:
        """Remove expired timestamps."""
        cutoff = now - self.window_seconds
        timestamps = self._requests.get(client_key, [])
        self._requests[client_key] = [t for t in timestamps if t > cutoff]
