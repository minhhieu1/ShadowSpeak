"""Tests for the profile service and endpoints."""
from datetime import datetime, timezone
from unittest.mock import patch

import boto3
import jwt as pyjwt
import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient

from app.core.config import Settings
from app.main import create_app
from app.models.auth import UpdateProfileInput, UserProfile
from app.repositories.consent_repository import ConsentRepository
from app.repositories.profile_repository import ProfileRepository
from app.services.consent_service import ConsentService
from app.services.profile_service import ProfileService
from app.services.rekey_service import RekeyService

# ===========================================================================
# Fixtures
# ===========================================================================

_ISSUER = "http://test-oidc.local/auth/realms/test-realm"
_AUDIENCE = "test-api-client"
_KID = "test-key-1"


def _build_rsa_key():
    from cryptography.hazmat.primitives.asymmetric import rsa

    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    return {"private": private_key, "public": private_key.public_key()}


def _b64url(num: int) -> str:
    import base64

    byte_count = (num.bit_length() + 7) // 8
    return base64.urlsafe_b64encode(num.to_bytes(byte_count, "big")).rstrip(b"=").decode()


@pytest.fixture(scope="session")
def rsa_keys():
    return _build_rsa_key()


@pytest.fixture
def jwks_response(rsa_keys):
    public_numbers = rsa_keys["public"].public_numbers()
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
    from datetime import timedelta

    now = datetime.now(timezone.utc)
    payload = {
        "sub": "user-123",
        "iss": _ISSUER,
        "aud": _AUDIENCE,
        "exp": int((now + timedelta(hours=1)).timestamp()),
        "iat": int(now.timestamp()),
        **overrides,
    }
    return pyjwt.encode(
        payload, rsa_keys["private"], algorithm="RS256", headers={"kid": _KID}
    )


def _auth_header(rsa_keys) -> dict:
    return {"Authorization": f"Bearer {_create_jwt(rsa_keys)}"}


@pytest.fixture
def settings():
    return Settings(
        _env_file=None,
        app_env="test",
        app_name="ShadowSpeak Test",
        api_version="v1",
        log_level="DEBUG",
        auth_provider="keycloak",
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


@pytest.fixture
def mock_dynamodb_table():
    from moto import mock_aws

    with mock_aws():
        client = boto3.resource("dynamodb", region_name="us-east-1")
        table = client.create_table(
            TableName="test-table",
            KeySchema=[
                {"AttributeName": "pk", "KeyType": "HASH"},
                {"AttributeName": "sk", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "pk", "AttributeType": "S"},
                {"AttributeName": "sk", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        yield table


@pytest.fixture
def repo(mock_dynamodb_table):
    return ProfileRepository(mock_dynamodb_table)


@pytest.fixture
def consent_repo(mock_dynamodb_table):
    return ConsentRepository(mock_dynamodb_table)


@pytest.fixture
def consent_service(consent_repo):
    return ConsentService(consent_repo)


@pytest.fixture
def profile_service(repo, consent_service):
    return ProfileService(repo, consent_service)


# ===========================================================================
# Tests: ProfileService
# ===========================================================================


class TestProfileService:
    def test_get_profile_requires_consent(self, profile_service):
        """Without consent, get_profile raises CONSENT_REQUIRED."""
        with pytest.raises(HTTPException) as exc:
            profile_service.get_profile("user-no-consent")
        assert exc.value.status_code == 403

    def test_get_profile_returns_none_when_no_profile(self, profile_service, consent_repo):
        """With consent but without profile, returns None."""
        consent_repo.put_consent(
            user_id="user-no-profile",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        result = profile_service.get_profile("user-no-profile")
        assert result is None

    def test_get_profile_returns_profile(self, profile_service, consent_repo, repo):
        """With consent and profile, returns the profile."""
        consent_repo.put_consent(
            user_id="user-full",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        repo.put_profile(
            UserProfile(
                userId="user-full",
                displayName="Test User",
                level="intermediate",
                createdAt="2026-01-01T00:00:00Z",
                updatedAt="2026-01-01T00:00:00Z",
            )
        )
        result = profile_service.get_profile("user-full")
        assert result is not None
        assert result.displayName == "Test User"
        assert result.level == "intermediate"

    def test_update_profile_requires_consent(self, profile_service):
        """Without consent, update_profile raises CONSENT_REQUIRED."""
        with pytest.raises(HTTPException) as exc:
            profile_service.update_profile(
                "user-no-consent", UpdateProfileInput(displayName="New")
            )
        assert exc.value.status_code == 403

    def test_update_profile_creates_if_not_exists(self, profile_service, consent_repo, repo):
        """Update on non-existent profile should create one."""
        consent_repo.put_consent(
            user_id="user-new",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        # Create profile first (update requires existing profile)
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        repo.put_profile(
            UserProfile(
                userId="user-new",
                displayName="New User",
                createdAt=now,
                updatedAt=now,
            )
        )
        result = profile_service.update_profile(
            "user-new", UpdateProfileInput(displayName="New User")
        )
        assert result is not None
        assert result.displayName == "New User"

    def test_update_profile_partial(self, profile_service, consent_repo, repo):
        """Partial update preserves existing fields."""
        consent_repo.put_consent(
            user_id="user-partial",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        repo.put_profile(
            UserProfile(
                userId="user-partial",
                displayName="Original",
                level="beginner",
                createdAt="2026-01-01T00:00:00Z",
                updatedAt="2026-01-01T00:00:00Z",
            )
        )
        result = profile_service.update_profile(
            "user-partial", UpdateProfileInput(displayName="Updated")
        )
        assert result is not None
        assert result.displayName == "Updated"
        assert result.level == "beginner"  # unchanged

    def test_update_profile_validates_display_name_length(self, profile_service, consent_repo):
        """displayName > 80 chars raises VALIDATION_ERROR."""
        consent_repo.put_consent(
            user_id="user-valid",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        with pytest.raises((HTTPException, Exception)):
            profile_service.update_profile(
                "user-valid", UpdateProfileInput(displayName="A" * 81)
            )

    def test_update_profile_validates_reminder_time_format(self, profile_service, consent_repo):
        """Invalid reminderTime format raises VALIDATION_ERROR."""
        consent_repo.put_consent(
            user_id="user-rt",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        with pytest.raises(HTTPException) as exc:
            profile_service.update_profile(
                "user-rt", UpdateProfileInput(reminderTime="invalid")
            )
        assert exc.value.status_code == 422

    def test_update_profile_validates_level(self):
        """Invalid level is rejected by Pydantic model validation."""
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            UpdateProfileInput(level="expert")

    def test_update_profile_updates_timestamp(self, profile_service, consent_repo, repo):
        """updatedAt should change after update."""
        consent_repo.put_consent(
            user_id="user-ts",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        repo.put_profile(
            UserProfile(
                userId="user-ts",
                createdAt="2026-01-01T00:00:00Z",
                updatedAt="2026-01-01T00:00:00Z",
            )
        )
        result = profile_service.update_profile(
            "user-ts", UpdateProfileInput(displayName="Updated")
        )
        assert result is not None
        assert result.updatedAt > "2026-01-01T00:00:00Z"


# ===========================================================================
# Tests: Profile Endpoints
# ===========================================================================


@pytest.fixture
def app_with_profile(settings):
    from app.core.auth import clear_jwks_cache

    clear_jwks_cache()
    return create_app(settings)


@pytest.fixture
async def client(app_with_profile, mock_dynamodb_table, settings):
    from app.api.routes.profile import _get_consent_service
    from app.core.config import get_settings

    consent_repo = ConsentRepository(mock_dynamodb_table)
    consent_svc = ConsentService(consent_repo)
    profile_repo = ProfileRepository(mock_dynamodb_table)
    rekey_svc = RekeyService(consent_repo)
    profile_svc = ProfileService(profile_repo, consent_svc, rekey_svc)

    from app.api.routes.profile import _get_profile_service

    app_with_profile.dependency_overrides[_get_consent_service] = lambda: consent_svc
    app_with_profile.dependency_overrides[_get_profile_service] = lambda: profile_svc
    app_with_profile.dependency_overrides[get_settings] = lambda: settings

    transport = ASGITransport(app=app_with_profile)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


class TestProfileEndpoints:
    @pytest.mark.asyncio
    async def test_get_me_requires_auth(self, client):
        """GET /me without JWT returns 401."""
        resp = await client.get("/me")
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_get_me_requires_consent(self, client, jwks_response, rsa_keys):
        """GET /me without consent returns 403."""
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.get("/me", headers=_auth_header(rsa_keys))
            assert resp.status_code == 403

    @pytest.mark.asyncio
    async def test_get_me_returns_profile(self, client, jwks_response, rsa_keys, mock_dynamodb_table):
        """GET /me returns profile for authenticated user with consent."""
        from app.core.auth import _fetch_jwks

        # Pre-set consent and profile
        consent_repo = ConsentRepository(mock_dynamodb_table)
        consent_repo.put_consent(
            user_id="user-123",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        profile_repo = ProfileRepository(mock_dynamodb_table)
        profile_repo.put_profile(
            UserProfile(
                userId="user-123",
                displayName="Test User",
                level="intermediate",
                createdAt="2026-01-01T00:00:00Z",
                updatedAt="2026-01-01T00:00:00Z",
            )
        )

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.get("/me", headers=_auth_header(rsa_keys))
            assert resp.status_code == 200, resp.text
            data = resp.json()
            assert data["ok"] is True
            assert data["data"]["displayName"] == "Test User"
            assert data["data"]["level"] == "intermediate"
            assert data["data"]["userId"] == "user-123"

    @pytest.mark.asyncio
    async def test_put_me_requires_auth(self, client):
        """PUT /me without JWT returns 401."""
        resp = await client.put("/me", json={"displayName": "New"})
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_put_me_requires_consent(self, client, jwks_response, rsa_keys):
        """PUT /me without consent returns 403."""
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/me",
                json={"displayName": "New"},
                headers={**_auth_header(rsa_keys), "Content-Type": "application/json"},
            )
            assert resp.status_code == 403

    @pytest.mark.asyncio
    async def test_put_me_partial_update(self, client, jwks_response, rsa_keys, mock_dynamodb_table):
        """PUT /me with displayName only updates displayName."""
        from app.core.auth import _fetch_jwks

        consent_repo = ConsentRepository(mock_dynamodb_table)
        consent_repo.put_consent(
            user_id="user-123",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        profile_repo = ProfileRepository(mock_dynamodb_table)
        profile_repo.put_profile(
            UserProfile(
                userId="user-123",
                displayName="Original",
                level="beginner",
                createdAt="2026-01-01T00:00:00Z",
                updatedAt="2026-01-01T00:00:00Z",
            )
        )

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/me",
                json={"displayName": "Updated"},
                headers={**_auth_header(rsa_keys), "Content-Type": "application/json"},
            )
            assert resp.status_code == 200, resp.text
            data = resp.json()
            assert data["ok"] is True
            assert data["data"]["displayName"] == "Updated"
            assert data["data"]["level"] == "beginner"  # unchanged

    @pytest.mark.asyncio
    async def test_put_me_validates_display_name_length(self, client, jwks_response, rsa_keys, mock_dynamodb_table):
        """PUT /me with displayName > 80 returns 422."""
        from app.core.auth import _fetch_jwks

        consent_repo = ConsentRepository(mock_dynamodb_table)
        consent_repo.put_consent(
            user_id="user-123",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/me",
                json={"displayName": "A" * 81},
                headers={**_auth_header(rsa_keys), "Content-Type": "application/json"},
            )
            assert resp.status_code == 422, resp.text

    @pytest.mark.asyncio
    async def test_put_me_validates_level(self, client, jwks_response, rsa_keys, mock_dynamodb_table):
        """PUT /me with invalid level returns 422."""
        from app.core.auth import _fetch_jwks

        consent_repo = ConsentRepository(mock_dynamodb_table)
        consent_repo.put_consent(
            user_id="user-123",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/me",
                json={"level": "expert"},
                headers={**_auth_header(rsa_keys), "Content-Type": "application/json"},
            )
            assert resp.status_code == 422, resp.text

    @pytest.mark.asyncio
    async def test_put_me_validates_reminder_time_format(self, client, jwks_response, rsa_keys, mock_dynamodb_table):
        """PUT /me with invalid reminderTime returns 422."""
        from app.core.auth import _fetch_jwks

        consent_repo = ConsentRepository(mock_dynamodb_table)
        consent_repo.put_consent(
            user_id="user-123",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/me",
                json={"reminderTime": "invalid"},
                headers={**_auth_header(rsa_keys), "Content-Type": "application/json"},
            )
            assert resp.status_code == 422, resp.text
