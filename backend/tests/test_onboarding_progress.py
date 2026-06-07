"""Tests for onboarding progress state."""
from datetime import datetime, timezone
from unittest.mock import patch

import boto3
import jwt as pyjwt
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.config import Settings
from app.main import create_app
from app.models.auth import UserProfile
from app.repositories.consent_repository import ConsentRepository
from app.repositories.profile_repository import ProfileRepository
from app.services.consent_service import ConsentService
from app.services.profile_service import ProfileService
from app.services.rekey_service import RekeyService

_ISSUER = "http://test-oidc.local/auth/realms/test-realm"
_AUDIENCE = "test-api-client"
_KID = "test-key-1"


def _build_rsa_key():
    from cryptography.hazmat.primitives.asymmetric import rsa
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


def _b64url(num: int) -> str:
    import base64
    byte_count = (num.bit_length() + 7) // 8
    return base64.urlsafe_b64encode(num.to_bytes(byte_count, "big")).rstrip(b"=").decode()


@pytest.fixture(scope="session")
def rsa_keys():
    key = _build_rsa_key()
    return {"private": key, "public": key.public_key()}


@pytest.fixture
def jwks_response(rsa_keys):
    n = rsa_keys["public"].public_numbers().n
    return {"keys": [{"kty": "RSA", "kid": _KID, "use": "sig", "alg": "RS256", "n": _b64url(n), "e": "AQAB"}]}


def _create_jwt(rsa_keys, **overrides) -> str:
    from datetime import timedelta
    now = datetime.now(timezone.utc)
    payload = {"sub": "user-123", "iss": _ISSUER, "aud": _AUDIENCE, "exp": int((now + timedelta(hours=1)).timestamp()), "iat": int(now.timestamp()), **overrides}
    return pyjwt.encode(payload, rsa_keys["private"], algorithm="RS256", headers={"kid": _KID})


def _auth_header(rsa_keys) -> dict:
    return {"Authorization": f"Bearer {_create_jwt(rsa_keys)}"}


@pytest.fixture
def settings():
    return Settings(_env_file=None, app_env="test", app_name="Test", api_version="v1", log_level="DEBUG", auth_provider="keycloak", auth_issuer=_ISSUER, auth_jwks_url=f"{_ISSUER}/certs", auth_audience=_AUDIENCE, auth_user_id_claim="sub", auth_roles_claim="groups", dynamodb_table_name="test-table", dynamodb_region="us-east-1", dynamodb_endpoint="http://localhost:8000", aws_access_key_id="dummy", aws_secret_access_key="dummy", aws_default_region="us-east-1")


@pytest.fixture
def mock_dynamodb_table():
    from moto import mock_aws
    with mock_aws():
        client = boto3.resource("dynamodb", region_name="us-east-1")
        table = client.create_table(TableName="test-table", KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}, {"AttributeName": "sk", "KeyType": "RANGE"}], AttributeDefinitions=[{"AttributeName": "pk", "AttributeType": "S"}, {"AttributeName": "sk", "AttributeType": "S"}], BillingMode="PAY_PER_REQUEST")
        yield table


@pytest.fixture
def app_with_onboarding(settings):
    from app.core.auth import clear_jwks_cache
    clear_jwks_cache()
    return create_app(settings)


@pytest.fixture
async def client(app_with_onboarding, mock_dynamodb_table, settings):
    from app.api.routes.profile import _get_consent_service, _get_profile_service
    from app.core.config import get_settings

    consent_repo = ConsentRepository(mock_dynamodb_table)
    consent_svc = ConsentService(consent_repo)
    profile_repo = ProfileRepository(mock_dynamodb_table)
    rekey_svc = RekeyService(consent_repo)
    profile_svc = ProfileService(profile_repo, consent_svc, rekey_svc)

    app_with_onboarding.dependency_overrides[_get_consent_service] = lambda: consent_svc
    app_with_onboarding.dependency_overrides[_get_profile_service] = lambda: profile_svc
    app_with_onboarding.dependency_overrides[get_settings] = lambda: settings
    transport = ASGITransport(app=app_with_onboarding)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


class TestOnboardingEndpoints:
    @pytest.mark.asyncio
    async def test_get_me_includes_onboarding_step(self, client, jwks_response, rsa_keys, mock_dynamodb_table):
        """GET /me returns onboardingStep field."""
        from app.core.auth import _fetch_jwks
        consent_repo = ConsentRepository(mock_dynamodb_table)
        consent_repo.put_consent(user_id="user-123", ageVerified=True, privacyAccepted=True, adConsent="personalized", locale="en")
        profile_repo = ProfileRepository(mock_dynamodb_table)
        profile_repo.put_profile(UserProfile(userId="user-123", onboardingStep="consent_done", createdAt="2026-01-01T00:00:00Z", updatedAt="2026-01-01T00:00:00Z"))

        with patch("app.core.auth._fetch_jwks") as m:
            m.return_value = jwks_response
            resp = await client.get("/v1/me", headers=_auth_header(rsa_keys))
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["onboardingStep"] == "consent_done"

    @pytest.mark.asyncio
    async def test_put_onboarding_step_validates_value(self, client, jwks_response, rsa_keys, mock_dynamodb_table):
        """PUT /me/onboarding-step with invalid step returns 422."""
        from app.core.auth import _fetch_jwks
        consent_repo = ConsentRepository(mock_dynamodb_table)
        consent_repo.put_consent(user_id="user-123", ageVerified=True, privacyAccepted=True, adConsent="personalized", locale="en")

        with patch("app.core.auth._fetch_jwks") as m:
            m.return_value = jwks_response
            resp = await client.put("/v1/me/onboarding-step", json={"step": "invalid_step"}, headers={**_auth_header(rsa_keys), "Content-Type": "application/json"})
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_onboarding_step_values(self):
        """Verify onboarding step enum values."""
        from app.models.auth import OnboardingStep
        assert OnboardingStep.AGE_GATE_DONE.value == "age_gate_done"
        assert OnboardingStep.CONSENT_DONE.value == "consent_done"
        assert OnboardingStep.INTRO_DONE.value == "intro_done"
        assert OnboardingStep.LEVEL_SELECTED.value == "level_selected"
        assert OnboardingStep.REMINDER_SET.value == "reminder_set"
        assert OnboardingStep.MIC_PERMISSION_DONE.value == "mic_permission_done"
        assert OnboardingStep.COMPLETE.value == "complete"

    @pytest.mark.asyncio
    async def test_put_onboarding_step_updates_profile(self, client, jwks_response, rsa_keys, mock_dynamodb_table):
        """PUT /me/onboarding-step updates the profile field."""
        from app.core.auth import _fetch_jwks
        consent_repo = ConsentRepository(mock_dynamodb_table)
        consent_repo.put_consent(user_id="user-123", ageVerified=True, privacyAccepted=True, adConsent="personalized", locale="en")
        profile_repo = ProfileRepository(mock_dynamodb_table)
        profile_repo.put_profile(UserProfile(userId="user-123", onboardingStep="age_gate_done", createdAt="2026-01-01T00:00:00Z", updatedAt="2026-01-01T00:00:00Z"))

        with patch("app.core.auth._fetch_jwks") as m:
            m.return_value = jwks_response
            resp = await client.put("/v1/me/onboarding-step", json={"step": "intro_done"}, headers={**_auth_header(rsa_keys), "Content-Type": "application/json"})
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["onboardingStep"] == "intro_done"

    @pytest.mark.asyncio
    async def test_put_onboarding_step_requires_auth(self, client):
        resp = await client.put("/v1/me/onboarding-step", json={"step": "intro_done"})
        assert resp.status_code == 401
