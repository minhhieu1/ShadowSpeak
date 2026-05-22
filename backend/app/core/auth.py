"""Generic OIDC JWT verification.

This module works with ANY OIDC provider — Keycloak, Cognito, Auth0,
Okta, etc. — by reading the provider configuration from ``Settings``.

The JWKS endpoint is fetched and cached with TTL so that repeated
validations do not hammer the provider.
"""

import asyncio
import json
import logging
import time
from typing import Any

import httpx
import jwt

from app.core.config import Settings
from app.core.errors import AppErrorCode, to_http_exception

logger = logging.getLogger("shadowspeak.auth")

# ---------------------------------------------------------------------------
# JWKS cache
# ---------------------------------------------------------------------------

_jwks_cache: dict[str, Any] = {"data": None, "fetched_at": 0.0}
_jwks_lock = asyncio.Lock()
_JWKS_TTL = 300  # 5 minutes


def clear_jwks_cache() -> None:
    """Clear the JWKS cache (useful for testing)."""
    _jwks_cache["data"] = None
    _jwks_cache["fetched_at"] = 0.0


_shared_client: httpx.AsyncClient | None = None


def _get_http_client() -> httpx.AsyncClient:
    global _shared_client
    if _shared_client is None:
        _shared_client = httpx.AsyncClient(timeout=10)
    return _shared_client


async def _fetch_jwks(jwks_url: str) -> dict[str, Any]:
    """Fetch JWKS from the OIDC provider with connection reuse."""
    client = _get_http_client()
    response = await client.get(jwks_url)
    response.raise_for_status()
    return response.json()


async def _get_jwks(settings: Settings) -> dict[str, Any]:
    """Return cached JWKS or fetch a fresh copy (thread-safe)."""
    now = time.monotonic()
    if _jwks_cache["data"] is not None and (now - _jwks_cache["fetched_at"]) < _JWKS_TTL:
        return _jwks_cache["data"]

    async with _jwks_lock:
        # Double-check after acquiring lock
        if _jwks_cache["data"] is not None and (now - _jwks_cache["fetched_at"]) < _JWKS_TTL:
            return _jwks_cache["data"]
        jwks = await _fetch_jwks(settings.auth_jwks_url)
        _jwks_cache["data"] = jwks
        _jwks_cache["fetched_at"] = time.monotonic()
        return jwks


# ---------------------------------------------------------------------------
# Token extraction
# ---------------------------------------------------------------------------


def extract_bearer_token(authorization: str | None) -> str | None:
    """Extract a Bearer token from the ``Authorization`` header.

    Returns ``None`` if the header is missing, empty, or uses a scheme
    other than ``Bearer``.
    """
    if not authorization:
        return None
    parts = authorization.strip().split()
    if len(parts) != 2 or parts[0] != "Bearer":
        return None
    return parts[1]


# ---------------------------------------------------------------------------
# JWT verification
# ---------------------------------------------------------------------------

_GENERIC_AUTH_ERROR = "Invalid authentication credentials"


async def verify_oidc_jwt(token: str, settings: Settings) -> dict[str, Any]:
    """Verify a JWT issued by the configured OIDC provider.

    Returns the decoded claims on success.

    Raises ``HTTPException(401)`` on any verification failure.
    """
    from fastapi import HTTPException

    try:
        headers = jwt.get_unverified_header(token)
    except Exception:
        raise _unauthorized()

    # Defense-in-depth: reject anything other than RS256 early
    if headers.get("alg") != "RS256":
        raise _unauthorized()

    kid = headers.get("kid")
    if not kid:
        raise _unauthorized()

    # Fetch JWKS (with TTL cache)
    try:
        jwks = await _get_jwks(settings)
    except Exception:
        logger.exception("Failed to fetch JWKS from %s", settings.auth_jwks_url)
        raise _unauthorized()

    # Find the matching key
    key_data = None
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            key_data = key
            break

    if not key_data:
        logger.warning("Key %s not found in JWKS", kid)
        raise _unauthorized()

    # Build the public key
    try:
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key_data))
    except Exception:
        logger.exception("Failed to build public key from JWK")
        raise _unauthorized()

    # Verify and decode
    try:
        claims = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            issuer=settings.auth_issuer,
            audience=settings.auth_audience,
            leeway=settings.auth_jwt_leeway,
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
                "verify_iss": True,
                "verify_aud": True,
            },
        )
    except jwt.ExpiredSignatureError:
        raise _unauthorized()
    except jwt.InvalidIssuerError:
        raise _unauthorized()
    except jwt.InvalidAudienceError:
        raise _unauthorized()
    except Exception:
        logger.exception("JWT verification failed")
        raise _unauthorized()

    required_claims = settings.get_auth_required_claims()
    for claim_name, expected_value in required_claims.items():
        actual_value = claims.get(claim_name)
        if actual_value != expected_value:
            logger.warning(
                "JWT missing required claim %s=%s (actual=%s)",
                claim_name,
                expected_value,
                actual_value,
            )
            raise _unauthorized()

    return claims


def _unauthorized(message: str = _GENERIC_AUTH_ERROR):
    return to_http_exception(AppErrorCode.AUTH_UNAUTHORIZED, message)
