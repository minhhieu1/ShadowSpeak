from typing import Any, Generic, TypeVar
from uuid import uuid4

from fastapi import Request
from pydantic import BaseModel

T = TypeVar("T")


class ApiErrorPayload(BaseModel):
    code: str
    message: str
    details: dict[str, Any] | None = None


class JsonEnvelope(BaseModel, Generic[T]):
    ok: bool
    requestId: str
    data: T | None = None
    error: ApiErrorPayload | None = None


def get_request_id(request: Request | None) -> str:
    if request is None:
        return str(uuid4())
    # Prefer request.state (set by RequestIDMiddleware), then header, then generate
    request_id = getattr(request.state, "request_id", None)
    if request_id:
        return request_id
    return request.headers.get("X-Request-Id") or str(uuid4())


def success(data: T, request: Request | None = None) -> JsonEnvelope[T]:
    return JsonEnvelope(ok=True, requestId=get_request_id(request), data=data)


def failure(
    code: str,
    message: str,
    request: Request | None = None,
    details: dict[str, Any] | None = None,
) -> JsonEnvelope[None]:
    return JsonEnvelope(
        ok=False,
        requestId=get_request_id(request),
        error=ApiErrorPayload(code=code, message=message, details=details),
    )
