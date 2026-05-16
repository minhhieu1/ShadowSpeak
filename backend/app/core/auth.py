from dataclasses import dataclass

from fastapi import Header

from app.core.config import get_settings
from app.core.errors import AppError


@dataclass(frozen=True)
class AuthContext:
    user_id: str
    token: str | None = None


def get_auth_context(authorization: str | None = Header(default=None)) -> AuthContext:
    """Development auth boundary.

    Production implementation should verify Cognito JWT claims here and return the
    Cognito subject as user_id. For local MVP scaffolding, a bearer token is accepted
    as the user id when dev auth is enabled.
    """

    settings = get_settings()
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        return AuthContext(user_id=token or "demo-user", token=token)

    if settings.allow_dev_auth:
        return AuthContext(user_id="demo-user")

    raise AppError("AUTH_UNAUTHORIZED", "Missing or invalid authorization token")
