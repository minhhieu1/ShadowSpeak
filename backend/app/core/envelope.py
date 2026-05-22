"""Response envelope — all API responses use JsonEnvelope<T>."""

from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiErrorPayload(BaseModel):
    code: str
    message: str
    details: Optional[dict[str, Any] | list[Any]] = None


class JsonEnvelope(BaseModel, Generic[T]):
    ok: bool
    requestId: str
    data: Optional[T] = None
    error: Optional[ApiErrorPayload] = None


def success(data: T, request_id: str) -> JsonEnvelope[T]:
    """Build a success response envelope."""
    return JsonEnvelope(ok=True, data=data, requestId=request_id)


def failure(error: ApiErrorPayload, request_id: str) -> JsonEnvelope[None]:
    """Build a failure response envelope."""
    return JsonEnvelope(ok=False, error=error, requestId=request_id)
