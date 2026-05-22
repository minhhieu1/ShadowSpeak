"""Tests for generic OIDC JWT verification.

These tests validate that the auth module works with ANY OIDC provider
(Keycloak, Cognito, Auth0, Okta) by using the config-based settings.
"""

import json
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch

import jwt
import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient

from app.core.auth import extract_bearer_token, verify_oidc_jwt, clear_jwks_cache
from app.core.config import Settings
from app.main import create_app

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

_ISSUER = "http://test-oidc.local/auth/realms/test-realm"
_AUDIENCE = "test-api-client"
_KID = "test-key-1"


def _build_rsa_key() -> dict:
    """Generate a minimal RSA key pair for testing JWT signatures."""
    from cryptography.hazmat.primitives import asymmetric
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.backends import default_backend
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend(),
    )
    public_key = private_key.public_key()
    return {"private": private_key, "public": public_key}


@pytest.fixture(scope="session")
def rsa_keys():
    return _build_rsa_key()


@pytest.fixture
def jwks_response(rsa_keys):
    """Build a minimal JWKS response containing our test public key."""
    from cryptography.hazmat.primitives import serialization

    public_numbers = rsa_keys["public"].public_numbers()
    # Encode n and e as base64url
    import base64

    def _b64url(num: int) -> str:
        byte_count = (num.bit_length() + 7) // 8
        return base64.urlsafe_b64encode(num.to_bytes(byte_count, "big")).rstrip(b"=").decode()

    return {
        "keys": [
            {
                "kty": "RSA",
                "kid": _KID,
                "use": "sig",
                "alg": "RS256",
                "n": _b64url(public_numbers.n),
                "e": _b64url(public_numbers.e),
            }
        ]
    }


def _create_jwt(rsa_keys, **overrides) -> str:
    """Create a test JWT signed with our test RSA key."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "user-123",
        "iss": _ISSUER,
        "aud": _AUDIENCE,
        "exp": int((now + timedelta(hours=1)).timestamp()),
        "iat": int(now.timestamp()),
        "email": "test@example.com",
        **overrides,
    }
    return jwt.encode(payload, rsa_keys["private"], algorithm="RS256", headers={"kid": _KID})


def _create_expired_jwt(rsa_keys, **overrides) -> str:
    """Create an expired JWT."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "user-123",
        "iss": _ISSUER,
        "aud": _AUDIENCE,
        "exp": int((now - timedelta(hours=1)).timestamp()),
        "iat": int((now - timedelta(hours=2)).timestamp()),
        **overrides,
    }
    return jwt.encode(payload, rsa_keys["private"], algorithm="RS256", headers={"kid": _KID})


# ---------------------------------------------------------------------------
# Settings fixture
# ---------------------------------------------------------------------------

@pytest.fixture
def settings():
    return Settings(
        _env_file=None,
        app_env="test",
        app_name="ShadowSpeak Test",
        api_version="v1",
        log_level="DEBUG",
        auth_provider="oidc",
        auth_issuer=_ISSUER,
        auth_jwks_url=f"{_ISSUER}/protocol/openid-connect/certs",
        auth_audience=_AUDIENCE,
        auth_user_id_claim="sub",
        auth_roles_claim="groups",
        dynamodb_table_name="test-table",
        dynamodb_region="us-east-1",
        dynamodb_endpoint="http://localhost:8000",
        aws_access_key_id="dummy",
        aws_secret_access_key="dummy",
        aws_default_region="us-east-1",
    )


# ===========================================================================
# Tests: extract_bearer_token
# ===========================================================================


class TestExtractBearerToken:
    def test_valid_bearer_token(self):
        token = extract_bearer_token("Bearer abc123")
        assert token == "abc123"

    def test_missing_header(self):
        assert extract_bearer_token(None) is None

    def test_empty_header(self):
        assert extract_bearer_token("") is None

    def test_invalid_scheme(self):
        assert extract_bearer_token("Basic abc123") is None

    def test_malformed_header(self):
        assert extract_bearer_token("Bearer") is None


# ===========================================================================
# Tests: verify_oidc_jwt
# ===========================================================================


class TestVerifyOidcJwt:
    """Tests for generic OIDC JWT verification.

    These tests mock the JWKS endpoint so they do NOT require a real
    OIDC provider. The same code works with Keycloak, Cognito, Auth0,
    or any other OIDC provider by simply changing the config.
    """

    @pytest.fixture(autouse=True)
    def _clear_cache(self):
        clear_jwks_cache()
        yield

    @pytest.mark.asyncio
    async def test_valid_token(self, rsa_keys, jwks_response, settings):
        token = _create_jwt(rsa_keys)
        with patch("app.core.auth._fetch_jwks", AsyncMock(return_value=jwks_response)):
            claims = await verify_oidc_jwt(token, settings)
        assert claims["sub"] == "user-123"
        assert claims["iss"] == _ISSUER
        assert claims["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_expired_token(self, rsa_keys, jwks_response, settings):
        token = _create_expired_jwt(rsa_keys)
        with patch("app.core.auth._fetch_jwks", AsyncMock(return_value=jwks_response)):
            with pytest.raises(HTTPException) as exc:
                await verify_oidc_jwt(token, settings)
        assert exc.value.status_code == 401
        detail = exc.value.detail
        assert detail["code"] == "AUTH_UNAUTHORIZED"

    @pytest.mark.asyncio
    async def test_invalid_signature(self, rsa_keys, jwks_response, settings):
        """JWT signed with a different key should fail."""
        other_keys = _build_rsa_key()
        token = _create_jwt(other_keys)
        with patch("app.core.auth._fetch_jwks", AsyncMock(return_value=jwks_response)):
            with pytest.raises(HTTPException) as exc:
                await verify_oidc_jwt(token, settings)
        assert exc.value.status_code == 401
        detail = exc.value.detail
        assert detail["code"] == "AUTH_UNAUTHORIZED"

    @pytest.mark.asyncio
    async def test_wrong_issuer(self, rsa_keys, jwks_response, settings):
        token = _create_jwt(rsa_keys, iss="http://evil-issuer.local")
        with patch("app.core.auth._fetch_jwks", AsyncMock(return_value=jwks_response)):
            with pytest.raises(HTTPException) as exc:
                await verify_oidc_jwt(token, settings)
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_wrong_audience(self, rsa_keys, jwks_response, settings):
        token = _create_jwt(rsa_keys, aud="wrong-audience")
        with patch("app.core.auth._fetch_jwks", AsyncMock(return_value=jwks_response)):
            with pytest.raises(HTTPException) as exc:
                await verify_oidc_jwt(token, settings)
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_missing_jwks_key(self, rsa_keys, settings):
        """JWT with a kid not in JWKS should fail."""
        token = _create_jwt(rsa_keys)
        empty_jwks = {"keys": []}
        with patch("app.core.auth._fetch_jwks", AsyncMock(return_value=empty_jwks)):
            with pytest.raises(HTTPException) as exc:
                await verify_oidc_jwt(token, settings)
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_caches_jwks(self, rsa_keys, jwks_response, settings):
        """JWKS should be cached; second call does not re-fetch."""
        token = _create_jwt(rsa_keys)
        mock_fetch = AsyncMock(return_value=jwks_response)
        with patch("app.core.auth._fetch_jwks", mock_fetch):
            await verify_oidc_jwt(token, settings)
            await verify_oidc_jwt(token, settings)
        # Should only fetch once due to caching
        assert mock_fetch.call_count == 1

    @pytest.mark.asyncio
    async def test_invalid_token_format(self, settings):
        """Completely invalid token should fail."""
        with pytest.raises(HTTPException) as exc:
            await verify_oidc_jwt("not-a-jwt", settings)
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_required_claims_are_enforced(self, rsa_keys, jwks_response):
        settings = Settings(
            _env_file=None,
            app_env="test",
            app_name="ShadowSpeak Test",
            api_version="v1",
            log_level="DEBUG",
            auth_provider="oidc",
            auth_issuer=_ISSUER,
            auth_jwks_url=f"{_ISSUER}/protocol/openid-connect/certs",
            auth_audience=_AUDIENCE,
            auth_user_id_claim="sub",
            auth_roles_claim="groups",
            auth_required_claims='{"token_use":"access"}',
            dynamodb_table_name="test-table",
            dynamodb_region="us-east-1",
            dynamodb_endpoint="http://localhost:8000",
            aws_access_key_id="dummy",
            aws_secret_access_key="dummy",
            aws_default_region="us-east-1",
        )
        valid_token = _create_jwt(rsa_keys, token_use="access")
        invalid_token = _create_jwt(rsa_keys, token_use="id")
        with patch("app.core.auth._fetch_jwks", AsyncMock(return_value=jwks_response)):
            claims = await verify_oidc_jwt(valid_token, settings)
            assert claims["token_use"] == "access"
            with pytest.raises(HTTPException) as exc:
                await verify_oidc_jwt(invalid_token, settings)
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_refreshes_jwks_after_ttl(self, rsa_keys, jwks_response, settings):
        from app.core.auth import _jwks_cache

        token = _create_jwt(rsa_keys)
        mock_fetch = AsyncMock(return_value=jwks_response)
        with patch("app.core.auth._fetch_jwks", mock_fetch):
            await verify_oidc_jwt(token, settings)
            expired_time = _jwks_cache["fetched_at"] + 301.0
            with patch("app.core.auth.time.monotonic", return_value=expired_time):
                await verify_oidc_jwt(token, settings)
        assert mock_fetch.call_count == 2


# ===========================================================================
# Tests: FastAPI dependencies (get_auth_context, get_optional_auth_context)
# ===========================================================================


@pytest.fixture
def app_with_auth():
    settings = Settings(
        _env_file=None,
        app_env="test",
        app_name="ShadowSpeak Test",
        api_version="v1",
        log_level="DEBUG",
        auth_provider="oidc",
        auth_issuer=_ISSUER,
        auth_jwks_url=f"{_ISSUER}/protocol/openid-connect/certs",
        auth_audience=_AUDIENCE,
        auth_user_id_claim="sub",
        auth_roles_claim="groups",
        dynamodb_table_name="test-table",
        dynamodb_region="us-east-1",
        dynamodb_endpoint="http://localhost:8000",
        aws_access_key_id="dummy",
        aws_secret_access_key="dummy",
        aws_default_region="us-east-1",
    )
    return create_app(settings)


@pytest.fixture
async def auth_client(app_with_auth):
    transport = ASGITransport(app=app_with_auth)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


class TestAuthDependencies:
    """Test the FastAPI auth dependencies through actual endpoint calls."""

    @pytest.mark.asyncio
    async def test_no_auth_header_raises(self, rsa_keys, jwks_response, settings):
        """Calling verify_oidc_jwt with None should raise."""
        with pytest.raises(HTTPException) as exc:
            await verify_oidc_jwt(None, settings)  # type: ignore[arg-type]
        assert exc.value.status_code == 401
