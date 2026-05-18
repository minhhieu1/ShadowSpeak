import json
import time
from dataclasses import dataclass, field
from typing import Any

import jwt
import requests
from fastapi import Header

from app.core.config import get_settings
from app.core.errors import AppError


@dataclass(frozen=True)
class AuthContext:
    user_id: str
    token: str | None = None


JwtClaims = dict[str, Any]


def extract_bearer_token(authorization: str | None) -> str | None:
    """Extract the bearer token from an Authorization header.

    Returns the token string or None if the header is missing, empty,
    or doesn't use the Bearer scheme.
    """
    if not authorization:
        return None
    if not authorization.lower().startswith("bearer "):
        return None
    parts = authorization.split(" ", 1)
    if len(parts) < 2:
        return None
    token = parts[1].strip()
    return token or None


class JwksCache:
    """Thread-safe JWKS cache with TTL."""

    def __init__(self) -> None:
        self._keys: dict[str, Any] = {}
        self._fetched_at: float = 0.0
        self._ttl_seconds: int = 3600  # 1 hour default

    def get_signing_key(self, kid: str) -> dict[str, Any] | None:
        return self._keys.get(kid)

    def is_expired(self) -> bool:
        return time.monotonic() - self._fetched_at > self._ttl_seconds

    def set_keys(self, keys: list[dict[str, Any]]) -> None:
        self._keys = {key["kid"]: key for key in keys if "kid" in key}
        self._fetched_at = time.monotonic()


# Global JWKS cache
_jwks_cache = JwksCache()
_http_session = requests.Session()


def reset_jwks_cache() -> None:
    """Reset the JWKS cache (for testing)."""
    _jwks_cache._keys = {}
    _jwks_cache._fetched_at = 0.0


def _fetch_jwks() -> None:
    """Fetch and cache JWKS from Cognito."""
    settings = get_settings()
    if not settings.cognito_jwks_url:
        jwks_url = (
            f"https://cognito-idp.{settings.cognito_region}.amazonaws.com/"
            f"{settings.cognito_user_pool_id}/.well-known/jwks.json"
        )
    else:
        jwks_url = settings.cognito_jwks_url

    response = _http_session.get(jwks_url, timeout=5)
    response.raise_for_status()
    data = response.json()
    _jwks_cache.set_keys(data["keys"])


def _get_jwk(kid: str) -> dict[str, Any]:
    """Get a JWK by key ID, fetching or refreshing the cache if needed."""
    if _jwks_cache.is_expired() or not _jwks_cache.get_signing_key(kid):
        _fetch_jwks()

    key = _jwks_cache.get_signing_key(kid)
    if key is None:
        # Key might have been rotated; try refreshing once more
        _fetch_jwks()
        key = _jwks_cache.get_signing_key(kid)

    if key is None:
        raise AppError("AUTH_UNAUTHORIZED", "Invalid token: unknown signing key")
    return key


def verify_cognito_jwt(token: str | None) -> JwtClaims:
    """Verify a Cognito JWT and return the claims.

    Validates: signature, expiry (exp), issuer (iss), audience (aud),
    and token_use (must be 'access').

    Returns the decoded claims dict on success.
    Raises AppError with AUTH_UNAUTHORIZED on any validation failure.
    """
    if not token:
        raise AppError("AUTH_UNAUTHORIZED", "Missing authorization token")

    settings = get_settings()
    try:
        # Get the key ID from the unverified header
        unverified_headers = jwt.get_unverified_header(token)
        kid = unverified_headers.get("kid")
        if not kid:
            raise AppError("AUTH_UNAUTHORIZED", "Invalid token: missing key ID")

        # Get the signing key
        jwk = _get_jwk(kid)
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))

        # Only verify audience when a client ID is configured
        decoded = jwt.decode_complete(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=(
                f"https://cognito-idp.{settings.cognito_region}.amazonaws.com/"
                f"{settings.cognito_user_pool_id}"
            ),
            audience=settings.cognito_client_id if settings.cognito_client_id else None,
            options={
                "verify_exp": True,
                "verify_iat": True,
                "require": ["sub", "exp", "iss"],
            },
        )
        claims = decoded["payload"]

        # Verify token_use
        if claims.get("token_use") != "access":
            raise AppError("AUTH_UNAUTHORIZED", "Invalid token: not an access token")

        return claims

    except jwt.ExpiredSignatureError:
        raise AppError("AUTH_UNAUTHORIZED", "Token has expired")
    except jwt.InvalidTokenError as e:
        raise AppError("AUTH_UNAUTHORIZED", f"Invalid token: {e}")
    except AppError:
        raise
    except Exception as e:
        raise AppError("AUTH_UNAUTHORIZED", f"Token verification failed: {e}")


def get_auth_context(authorization: str | None = Header(default=None)) -> AuthContext:
    """FastAPI dependency that extracts and verifies the auth context.

    When allow_dev_auth is True (local dev mode), accepts any bearer token
    as the user ID for convenience. In production, performs full JWT verification.
    """
    settings = get_settings()
    token = extract_bearer_token(authorization)

    if settings.allow_dev_auth:
        if token:
            return AuthContext(user_id=token, token=token)
        return AuthContext(user_id="demo-user")

    # Production: require valid JWT
    if not token:
        raise AppError("AUTH_UNAUTHORIZED", "Missing or invalid authorization token")

    claims = verify_cognito_jwt(token)
    return AuthContext(
        user_id=claims["sub"],
        token=token,
    )


def get_optional_auth_context(
    authorization: str | None = Header(default=None),
) -> AuthContext | None:
    """FastAPI dependency for pre-auth endpoints.

    Returns AuthContext if a valid token is present, or None if no token.
    Does NOT reject unauthenticated requests.
    """
    settings = get_settings()
    token = extract_bearer_token(authorization)

    if not token:
        return None

    if settings.allow_dev_auth:
        return AuthContext(user_id=token, token=token)

    try:
        claims = verify_cognito_jwt(token)
        return AuthContext(user_id=claims["sub"], token=token)
    except AppError:
        return None
