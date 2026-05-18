"""Tests for Cognito JWT verification."""

import time
from unittest.mock import ANY, MagicMock, patch

import jwt
import pytest
from fastapi import Header

from app.core.auth import (
    AuthContext,
    extract_bearer_token,
    get_auth_context,
    get_optional_auth_context,
    verify_cognito_jwt,
)
from app.core.config import get_settings
from app.core.errors import AppError


class TestExtractBearerToken:
    def test_valid_bearer_token(self) -> None:
        token = extract_bearer_token("Bearer my.jwt.token")
        assert token == "my.jwt.token"

    def test_lowercase_bearer(self) -> None:
        token = extract_bearer_token("bearer my.jwt.token")
        assert token == "my.jwt.token"

    def test_none_header(self) -> None:
        token = extract_bearer_token(None)
        assert token is None

    def test_empty_header(self) -> None:
        token = extract_bearer_token("")
        assert token is None

    def test_missing_bearer_prefix(self) -> None:
        token = extract_bearer_token("my.jwt.token")
        assert token is None

    def test_bearer_with_extra_spaces(self) -> None:
        token = extract_bearer_token("Bearer  my.jwt.token")
        assert token == "my.jwt.token"


class TestVerifyCognitoJwt:
    @pytest.fixture(autouse=True)
    def _reset_cache(self) -> None:
        from app.core.auth import reset_jwks_cache

        reset_jwks_cache()

    @patch("app.core.auth._http_session.get")
    def test_valid_jwt_returns_claims(self, mock_get: MagicMock) -> None:
        settings = get_settings()
        # Generate a real RSA key pair for testing
        from cryptography.hazmat.primitives import asymmetric

        key = asymmetric.rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        public_key = key.public_key()

        # Mock JWKS response
        from jwt.utils import base64url_decode, base64url_encode
        from cryptography.hazmat.primitives import serialization

        # Get public key components
        pub_numbers = public_key.public_numbers()

        # Manually build JWK
        import json

        def int_to_base64url(n: int) -> str:
            byte_length = (n.bit_length() + 7) // 8
            return base64url_encode(n.to_bytes(byte_length, "big")).decode("ascii")

        kid = "test-key-1"
        jwks = {
            "keys": [
                {
                    "kty": "RSA",
                    "n": int_to_base64url(pub_numbers.n),
                    "e": int_to_base64url(pub_numbers.e),
                    "kid": kid,
                    "alg": "RS256",
                }
            ]
        }

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = jwks
        mock_get.return_value = mock_response

        # Create a valid JWT
        now = int(time.time())
        payload = {
            "sub": "user-123",
            "email": "test@example.com",
            "token_use": "access",
            "iss": f"https://cognito-idp.{settings.cognito_region}.amazonaws.com/{settings.cognito_user_pool_id}",
            "aud": settings.cognito_client_id,
            "exp": now + 3600,
            "iat": now,
        }
        token = jwt.encode(payload, key, algorithm="RS256", headers={"kid": kid})

        # Verify
        claims = verify_cognito_jwt(token)
        assert claims["sub"] == "user-123"
        assert claims["email"] == "test@example.com"
        mock_get.assert_called_once()

    @patch("app.core.auth._http_session.get")
    def test_expired_jwt_raises_unauthorized(self, mock_get: MagicMock) -> None:
        settings = get_settings()
        from cryptography.hazmat.primitives import asymmetric

        key = asymmetric.rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        public_key = key.public_key()
        pub_numbers = public_key.public_numbers()

        from jwt.utils import base64url_encode

        def int_to_base64url(n: int) -> str:
            byte_length = (n.bit_length() + 7) // 8
            return base64url_encode(n.to_bytes(byte_length, "big")).decode("ascii")

        kid = "test-key-1"
        jwks = {
            "keys": [
                {
                    "kty": "RSA",
                    "n": int_to_base64url(pub_numbers.n),
                    "e": int_to_base64url(pub_numbers.e),
                    "kid": kid,
                    "alg": "RS256",
                }
            ]
        }
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = jwks
        mock_get.return_value = mock_response

        now = int(time.time())
        payload = {
            "sub": "user-123",
            "token_use": "access",
            "iss": f"https://cognito-idp.{settings.cognito_region}.amazonaws.com/{settings.cognito_user_pool_id}",
            "aud": settings.cognito_client_id,
            "exp": now - 3600,  # Expired
            "iat": now - 7200,
        }
        token = jwt.encode(payload, key, algorithm="RS256", headers={"kid": kid})

        with pytest.raises(AppError) as exc:
            verify_cognito_jwt(token)
        assert exc.value.detail["code"] == "AUTH_UNAUTHORIZED"

    @patch("app.core.auth._http_session.get")
    def test_invalid_signature_raises_unauthorized(self, mock_get: MagicMock) -> None:
        settings = get_settings()
        # Generate two different keys
        from cryptography.hazmat.primitives import asymmetric

        key1 = asymmetric.rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        key2 = asymmetric.rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        pub_numbers = key1.public_key().public_numbers()

        from jwt.utils import base64url_encode

        def int_to_base64url(n: int) -> str:
            byte_length = (n.bit_length() + 7) // 8
            return base64url_encode(n.to_bytes(byte_length, "big")).decode("ascii")

        kid = "test-key-1"
        jwks = {
            "keys": [
                {
                    "kty": "RSA",
                    "n": int_to_base64url(pub_numbers.n),
                    "e": int_to_base64url(pub_numbers.e),
                    "kid": kid,
                    "alg": "RS256",
                }
            ]
        }
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = jwks
        mock_get.return_value = mock_response

        now = int(time.time())
        payload = {
            "sub": "user-123",
            "token_use": "access",
            "iss": f"https://cognito-idp.{settings.cognito_region}.amazonaws.com/{settings.cognito_user_pool_id}",
            "aud": settings.cognito_client_id,
            "exp": now + 3600,
            "iat": now,
        }
        # Sign with key2, but JWKS has key1
        token = jwt.encode(payload, key2, algorithm="RS256", headers={"kid": kid})

        with pytest.raises(AppError) as exc:
            verify_cognito_jwt(token)
        assert exc.value.detail["code"] == "AUTH_UNAUTHORIZED"

    @patch("app.core.auth._http_session.get")
    def test_jwks_cached(self, mock_get: MagicMock) -> None:
        """JWKS should be cached and not re-fetched on subsequent calls."""
        settings = get_settings()
        from cryptography.hazmat.primitives import asymmetric

        key = asymmetric.rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        pub_numbers = key.public_key().public_numbers()

        from jwt.utils import base64url_encode

        def int_to_base64url(n: int) -> str:
            byte_length = (n.bit_length() + 7) // 8
            return base64url_encode(n.to_bytes(byte_length, "big")).decode("ascii")

        kid = "test-key-1"
        jwks = {
            "keys": [
                {
                    "kty": "RSA",
                    "n": int_to_base64url(pub_numbers.n),
                    "e": int_to_base64url(pub_numbers.e),
                    "kid": kid,
                    "alg": "RS256",
                }
            ]
        }
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = jwks
        mock_get.return_value = mock_response

        now = int(time.time())
        payload = {
            "sub": "user-123",
            "token_use": "access",
            "iss": f"https://cognito-idp.{settings.cognito_region}.amazonaws.com/{settings.cognito_user_pool_id}",
            "aud": settings.cognito_client_id,
            "exp": now + 3600,
            "iat": now,
        }

        token1 = jwt.encode(
            payload, key, algorithm="RS256", headers={"kid": kid}
        )
        token2 = jwt.encode(
            {**payload, "sub": "user-456"},
            key,
            algorithm="RS256",
            headers={"kid": kid},
        )

        verify_cognito_jwt(token1)
        verify_cognito_jwt(token2)

        # JWKS should only be fetched once
        assert mock_get.call_count == 1

    def test_missing_token_raises_unauthorized(self) -> None:
        with pytest.raises(AppError) as exc:
            verify_cognito_jwt(None)
        assert exc.value.detail["code"] == "AUTH_UNAUTHORIZED"

    def test_empty_token_raises_unauthorized(self) -> None:
        with pytest.raises(AppError) as exc:
            verify_cognito_jwt("")
        assert exc.value.detail["code"] == "AUTH_UNAUTHORIZED"

    def test_invalid_token_format_raises_unauthorized(self) -> None:
        with pytest.raises(AppError) as exc:
            verify_cognito_jwt("not-a-jwt")
        assert exc.value.detail["code"] == "AUTH_UNAUTHORIZED"


class TestGetAuthContext:
    def test_valid_token_returns_auth_context(self) -> None:
        """With dev auth enabled, any bearer token is accepted as user_id."""
        ctx = get_auth_context("Bearer dev-user-123")
        assert ctx.user_id == "dev-user-123"
        assert ctx.token == "dev-user-123"

    def test_missing_token_with_dev_auth_returns_demo(self) -> None:
        ctx = get_auth_context(None)
        assert ctx.user_id == "demo-user"

    @patch("app.core.auth.get_settings")
    def test_missing_token_without_dev_auth_raises(self, mock_settings) -> None:
        settings = get_settings()
        settings.allow_dev_auth = False
        mock_settings.return_value = settings
        with pytest.raises(AppError) as exc:
            get_auth_context(None)
        assert exc.value.detail["code"] == "AUTH_UNAUTHORIZED"


class TestGetOptionalAuthContext:
    def test_with_token_returns_auth_context(self) -> None:
        result = get_optional_auth_context("Bearer user-123")
        assert result is not None
        assert result.user_id == "user-123"

    def test_without_token_returns_none(self) -> None:
        result = get_optional_auth_context(None)
        assert result is None

    @patch("app.core.auth.get_settings")
    def test_without_token_dev_auth_disabled_returns_none(self, mock_settings) -> None:
        settings = get_settings()
        settings.allow_dev_auth = False
        mock_settings.return_value = settings
        result = get_optional_auth_context(None)
        assert result is None
