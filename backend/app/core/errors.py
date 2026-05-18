from fastapi import HTTPException

ERROR_STATUS: dict[str, int] = {
    "AUTH_UNAUTHORIZED": 401,
    "CONSENT_REQUIRED": 403,
    "VALIDATION_ERROR": 422,
    "USER_NOT_FOUND": 404,
    "LESSON_NOT_FOUND": 404,
    "LESSON_NOT_PUBLISHED": 404,
    "DOWNLOAD_DENIED": 403,
    "SESSION_NOT_FOUND": 404,
    "SESSION_STATE_INVALID": 409,
    "SYNC_CONFLICT": 409,
    "RATE_LIMITED": 429,
    "SYSTEM_ERROR": 500,
}


class AppError(HTTPException):
    def __init__(self, code: str, message: str, details: dict | None = None) -> None:
        super().__init__(
            status_code=ERROR_STATUS.get(code, 500),
            detail={"code": code, "message": message, "details": details},
        )
