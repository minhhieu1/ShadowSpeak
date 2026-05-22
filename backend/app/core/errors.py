"""Canonical error codes for the ShadowSpeak API.

These codes are used across all API endpoints in the JsonEnvelope error
payload. They map to specific HTTP status codes as documented in the
API specification.
"""

from fastapi import HTTPException


class AppErrorCode:
    AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED"
    CONSENT_REQUIRED = "CONSENT_REQUIRED"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    USER_NOT_FOUND = "USER_NOT_FOUND"
    SYSTEM_ERROR = "SYSTEM_ERROR"


class AppError(Exception):
    """Application-level error with code and message."""

    def __init__(self, code: str, message: str, status_code: int, details: dict | None = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details


def to_http_exception(code: str, message: str, details: dict | None = None) -> HTTPException:
    return HTTPException(
        status_code=ERROR_STATUS_MAP[code],
        detail={
            "code": code,
            "message": message,
            "details": details,
        },
    )


# HTTP status code mapping
ERROR_STATUS_MAP: dict[str, int] = {
    AppErrorCode.AUTH_UNAUTHORIZED: 401,
    AppErrorCode.CONSENT_REQUIRED: 403,
    AppErrorCode.VALIDATION_ERROR: 422,
    AppErrorCode.USER_NOT_FOUND: 404,
    AppErrorCode.SYSTEM_ERROR: 500,
}
