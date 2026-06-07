"""Middleware chain: request ID, logging, CORS, rate limiting."""

import logging
from collections import defaultdict, deque
import re
import time
import uuid

from fastapi import status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

_VALID_REQUEST_ID_RE = re.compile(r"^[a-zA-Z0-9\-_.]{1,64}$")


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Assign a request ID if the client did not send one.

    The request ID is set on the request state, added to the response
    headers under ``X-Request-Id``, and made available to handler code
    via ``request.state.request_id``.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        client_id = (request.headers.get("X-Request-Id") or "").strip()
        request_id = client_id if _VALID_REQUEST_ID_RE.match(client_id) else uuid.uuid4().hex
        request.state.request_id = request_id

        response = await call_next(request)

        response.headers["X-Request-Id"] = request_id
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every request with method, path, status, and duration."""

    def __init__(self, app, logger: logging.Logger | None = None):
        super().__init__(app)
        self.logger = logger or logging.getLogger("shadowspeak")

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start = time.monotonic()
        response = await call_next(request)
        duration_ms = (time.monotonic() - start) * 1000

        self.logger.info(
            "request",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "duration_ms": round(duration_ms, 2),
                "request_id": getattr(request.state, "request_id", None),
            },
        )
        return response


class CORSMiddleware(BaseHTTPMiddleware):
    """Permissive CORS for local development.

    In production, replace with a restricted CORS policy or API Gateway CORS.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.method == "OPTIONS":
            response = Response(status_code=204)
        else:
            response = await call_next(request)

        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = (
            "Authorization, Content-Type, X-Request-Id, X-Device-Id"
        )
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        *,
        window_seconds: int,
        authenticated_limit: int,
        preauth_limit: int,
    ):
        super().__init__(app)
        self.window_seconds = window_seconds
        self.authenticated_limit = authenticated_limit
        self.preauth_limit = preauth_limit
        self._requests: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.method not in {"POST", "PUT", "PATCH", "DELETE"}:
            return await call_next(request)

        is_preauth_consent = request.url.path == "/v1/consent" and "Authorization" not in request.headers
        limit = self.preauth_limit if is_preauth_consent else self.authenticated_limit
        if limit <= 0:
            return await call_next(request)

        key = self._build_key(request, is_preauth_consent)
        now = time.monotonic()
        bucket = self._requests[key]
        while bucket and (now - bucket[0]) > self.window_seconds:
            bucket.popleft()
        if len(bucket) >= limit:
            return Response(status_code=status.HTTP_429_TOO_MANY_REQUESTS)
        bucket.append(now)
        return await call_next(request)

    @staticmethod
    def _build_key(request: Request, is_preauth_consent: bool) -> str:
        if is_preauth_consent:
            client_host = request.client.host if request.client else "unknown"
            return f"preauth:{client_host}:{request.url.path}"
        auth_header = request.headers.get("Authorization", "")
        if auth_header:
            return f"auth:{auth_header}:{request.url.path}"
        client_host = request.client.host if request.client else "unknown"
        return f"fallback:{client_host}:{request.url.path}"
