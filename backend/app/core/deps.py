"""FastAPI dependency injection for auth and consent.

Provides reusable dependencies that can be injected into route handlers.
"""

import logging
from typing import Optional

from fastapi import Depends, HTTPException, Request

from app.core.auth import _unauthorized, extract_bearer_token, verify_oidc_jwt
from app.core.config import Settings, get_settings
from app.core.errors import AppErrorCode, to_http_exception
from app.models.auth import AuthContext

logger = logging.getLogger("shadowspeak.auth")


async def get_auth_context(
    request: Request,
) -> AuthContext:
    """FastAPI dependency that requires a valid JWT.

    Extracts the Bearer token from the ``Authorization`` header, verifies
    it against the configured OIDC JWKS endpoint, and returns an
    ``AuthContext`` with the user's identity.

    Raises ``HTTPException(401)`` if the token is missing or invalid.
    """
    settings: Settings = getattr(request.app.state, "settings", None) or get_settings()
    token = extract_bearer_token(request.headers.get("Authorization"))
    if not token:
        raise to_http_exception(
            AppErrorCode.AUTH_UNAUTHORIZED,
            "Missing or invalid Authorization header",
        )

    claims = await verify_oidc_jwt(token, settings)

    user_id_claim = settings.auth_user_id_claim
    user_id = claims.get(user_id_claim) or claims.get("sub")
    if not user_id:
        logger.warning("Token missing identity claim '%s' and 'sub'", user_id_claim)
        raise _unauthorized()

    # Resolve roles — split dotted claims like "realm_access.roles"
    roles_claim = settings.auth_roles_claim
    groups = _resolve_roles_claim(claims, roles_claim)

    return AuthContext(userId=user_id, claims=claims, groups=groups)


async def get_optional_auth_context(
    request: Request,
) -> Optional[AuthContext]:
    """FastAPI dependency that optionally extracts auth context.

    Returns ``None`` instead of raising 401 when no valid JWT is present.
    This is used for pre-auth endpoints like consent where authentication
    is optional.
    """
    settings: Settings = getattr(request.app.state, "settings", None) or get_settings()
    authorization = request.headers.get("Authorization")
    token = extract_bearer_token(authorization)
    if authorization and not token:
        raise to_http_exception(
            AppErrorCode.AUTH_UNAUTHORIZED,
            "Missing or invalid Authorization header",
        )
    if not token:
        return None

    claims = await verify_oidc_jwt(token, settings)
    user_id_claim = settings.auth_user_id_claim
    user_id = claims.get(user_id_claim) or claims.get("sub")
    if not user_id:
        raise _unauthorized()
    roles_claim = settings.auth_roles_claim
    groups = _resolve_roles_claim(claims, roles_claim)
    return AuthContext(userId=user_id, claims=claims, groups=groups)


def _resolve_roles_claim(claims: dict, claim_path: str) -> list[str]:
    """Resolve a dotted claim path into a list of role/group strings.

    Supports both flat claims (e.g. ``cognito:groups``) and nested
    claims (e.g. ``realm_access.roles``).
    """
    parts = claim_path.split(".")
    value = claims
    for part in parts:
        if isinstance(value, dict):
            value = value.get(part, [])
        else:
            logger.warning("Failed to resolve roles claim '%s' at '%s'", claim_path, part)
            return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return [value]
    logger.warning("Unexpected roles claim type '%s' for path '%s'", type(value).__name__, claim_path)
    return []
