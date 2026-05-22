"""Integration tests for end-to-end user flows.

Covers the full account lifecycle:
1. Full onboarding flow: consent → profile → step progression
2. Pre-auth consent re-keys to user consent after JWT authentication
3. Account deletion flow: soft-delete → grace period → purge
"""
from datetime import datetime, timedelta, timezone
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
from app.services.purge_service import PurgeService
from app.services.rekey_service import RekeyService

# ===========================================================================
# Shared test config
# ===========================================================================

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
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "user-int-123", "iss": _ISSUER, "aud": _AUDIENCE,
        "exp": int((now + timedelta(hours=1)).timestamp()),
        "iat": int(now.timestamp()),
        **overrides,
    }
    return pyjwt.encode(payload, rsa_keys["private"], algorithm="RS256", headers={"kid": _KID})


def _auth_header(rsa_keys, **jwt_overrides) -> dict:
    return {"Authorization": f"Bearer {_create_jwt(rsa_keys, **jwt_overrides)}"}


@pytest.fixture
def settings():
    return Settings(
        _env_file=None, app_env="test", app_name="IntegrationTest", api_version="v1",
        log_level="DEBUG", auth_provider="oidc", auth_issuer=_ISSUER,
        auth_jwks_url=f"{_ISSUER}/certs", auth_audience=_AUDIENCE,
        auth_user_id_claim="sub", auth_roles_claim="groups",
        dynamodb_table_name="test-table", dynamodb_region="us-east-1",
        dynamodb_endpoint="http://localhost:8000",
        aws_access_key_id="dummy", aws_secret_access_key="dummy",
        aws_default_region="us-east-1",
    )


@pytest.fixture
def dynamodb_table():
    from moto import mock_aws
    with mock_aws():
        client = boto3.resource("dynamodb", region_name="us-east-1")
        table = client.create_table(
            TableName="test-table",
            KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}, {"AttributeName": "sk", "KeyType": "RANGE"}],
            AttributeDefinitions=[{"AttributeName": "pk", "AttributeType": "S"}, {"AttributeName": "sk", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        yield table


@pytest.fixture
def consent_repo(dynamodb_table):
    return ConsentRepository(dynamodb_table)


@pytest.fixture
def profile_repo(dynamodb_table):
    return ProfileRepository(dynamodb_table)


@pytest.fixture
def consent_svc(consent_repo):
    return ConsentService(consent_repo)


@pytest.fixture
def rekey_svc(consent_repo):
    return RekeyService(consent_repo)


@pytest.fixture
def profile_svc(profile_repo, consent_svc, rekey_svc):
    return ProfileService(profile_repo, consent_svc, rekey_svc)


@pytest.fixture
def purge_svc(consent_repo, profile_repo, dynamodb_table):
    return PurgeService(consent_repo, profile_repo, dynamodb_table)


@pytest.fixture
def integration_app(settings):
    from app.core.auth import clear_jwks_cache
    clear_jwks_cache()
    return create_app(settings)


@pytest.fixture
async def client(integration_app, dynamodb_table, settings):
    from app.api.routes.profile import _get_consent_service, _get_profile_service
    from app.core.config import get_settings

    consent_repo = ConsentRepository(dynamodb_table)
    consent_svc = ConsentService(consent_repo)
    profile_repo = ProfileRepository(dynamodb_table)
    rekey_svc = RekeyService(consent_repo)
    profile_svc = ProfileService(profile_repo, consent_svc, rekey_svc)

    integration_app.dependency_overrides[_get_consent_service] = lambda: consent_svc
    integration_app.dependency_overrides[_get_profile_service] = lambda: profile_svc
    integration_app.dependency_overrides[get_settings] = lambda: settings
    transport = ASGITransport(app=integration_app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ===========================================================================
# Integration test: Full onboarding flow
# ===========================================================================


class TestFullOnboardingFlow:
    """Age gate → consent → sign-in → profile setup → step progression."""

    @pytest.mark.asyncio
    async def test_full_onboarding_via_device(self, client, dynamodb_table):
        """Device-based onboarding: set consent, then sign in, see profile."""
        # Step 1: Pre-auth consent via device
        resp = await client.put(
            "/consent",
            json={"ageVerified": True, "privacyAccepted": True, "adConsent": "personalized"},
            headers={"X-Device-Id": "device-abc", "Content-Type": "application/json"},
        )
        assert resp.status_code == 200, resp.text
        assert resp.json()["ok"] is True

        # Step 2: Verify device consent is readable
        resp = await client.get("/consent", headers={"X-Device-Id": "device-abc"})
        assert resp.status_code == 200
        assert resp.json()["data"]["ageVerified"] is True

    @pytest.mark.asyncio
    async def test_onboarding_consent_then_profile(
        self, client, dynamodb_table, jwks_response, rsa_keys
    ):
        """Authenticated flow: set consent, set up profile, update onboarding step."""
        from app.core.auth import _fetch_jwks

        headers = _auth_header(rsa_keys)
        headers["Content-Type"] = "application/json"

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response

            # Step 1: PUT consent
            resp = await client.put(
                "/consent",
                json={"ageVerified": True, "privacyAccepted": True, "adConsent": "personalized"},
                headers=headers,
            )
            assert resp.status_code == 200, resp.text
            assert resp.json()["data"]["ageVerified"] is True

            # Step 2: GET consent
            resp = await client.get("/consent", headers=_auth_header(rsa_keys))
            assert resp.status_code == 200
            assert resp.json()["data"]["ageVerified"] is True

            # Step 3: PUT profile
            resp = await client.put(
                "/me",
                json={"displayName": "Integration User", "level": "beginner"},
                headers=headers,
            )
            assert resp.status_code == 200, resp.text
            data = resp.json()["data"]
            assert data["displayName"] == "Integration User"
            assert data["level"] == "beginner"

            # Step 4: GET profile
            resp = await client.get("/me", headers=_auth_header(rsa_keys))
            assert resp.status_code == 200
            data = resp.json()["data"]
            assert data["displayName"] == "Integration User"
            assert data["level"] == "beginner"

            # Step 5: Update onboarding step
            resp = await client.put(
                "/me/onboarding-step",
                json={"step": "consent_done"},
                headers=headers,
            )
            assert resp.status_code == 200, resp.text
            assert resp.json()["data"]["onboardingStep"] == "consent_done"

    @pytest.mark.asyncio
    async def test_unauthenticated_access_blocked(self, client):
        """All authenticated endpoints return 401 without JWT."""
        assert (await client.get("/me")).status_code == 401
        assert (await client.put("/me", json={})).status_code == 401
        assert (await client.delete("/account")).status_code == 401


# ===========================================================================
# Integration test: Pre-auth consent re-keys after sign-in
# ===========================================================================


class TestConsentRekeyFlow:
    """Device consent migrates to user consent after JWT auth."""

    @pytest.mark.asyncio
    async def test_device_consent_rekeys_on_profile_access(
        self, client, dynamodb_table, jwks_response, rsa_keys
    ):
        """Device consent data is accessible after JWT sign-in via rekey."""
        from app.core.auth import _fetch_jwks

        # Step 1: Set consent via device (pre-auth)
        resp = await client.put(
            "/consent",
            json={"ageVerified": True, "privacyAccepted": True, "adConsent": "non_personalized"},
            headers={"X-Device-Id": "device-rekey", "Content-Type": "application/json"},
        )
        assert resp.status_code == 200

        # Step 2: Verify device consent is stored
        consent_repo = ConsentRepository(dynamodb_table)
        device = consent_repo.get_device_consent("device-rekey")
        assert device is not None
        assert device.ageVerified is True

        # Step 3: GET /me as authenticated user with X-Device-Id — triggers rekey
        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            headers = _auth_header(rsa_keys, sub="user-rekeyed")
            headers["X-Device-Id"] = "device-rekey"
            resp = await client.get("/me", headers=headers)
            assert resp.status_code == 200, resp.text

        # Step 4: Consent should now be accessible under USER# key
        user_consent = consent_repo.get_consent("user-rekeyed")
        assert user_consent is not None
        assert user_consent.ageVerified is True
        assert user_consent.adConsent == "non_personalized"

        # Step 5: Device consent should be deleted after rekey
        device_gone = consent_repo.get_device_consent("device-rekey")
        assert device_gone is None


# ===========================================================================
# Integration test: Account deletion lifecycle
# ===========================================================================


class TestAccountDeletionLifecycle:
    """DELETE /account → grace period → purge job → account gone."""

    @pytest.mark.asyncio
    async def test_account_deletion_and_purge(
        self, client, dynamodb_table, jwks_response, rsa_keys,
        consent_repo, profile_repo, purge_svc,
    ):
        """Full deletion lifecycle: soft-delete, grace period, purge."""
        from app.core.auth import _fetch_jwks

        user_id = "user-lifecycle"

        # Step 1: Set up consent + profile
        consent_repo.put_consent(
            user_id=user_id, ageVerified=True, privacyAccepted=True,
            adConsent="personalized", locale="en",
        )
        profile_repo.put_profile(UserProfile(
            userId=user_id, displayName="Lifecycle User", level="intermediate",
            reminderTime="09:00", email="user@example.com",
            createdAt="2026-01-01T00:00:00Z", updatedAt="2026-01-01T00:00:00Z",
        ))

        # Step 2: Soft-delete via endpoint
        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.delete("/account", headers=_auth_header(rsa_keys, sub=user_id))
        assert resp.status_code == 202
        data = resp.json()["data"]
        assert data["status"] == "deletion_requested"

        # Step 3: Verify profile is preserved during grace period
        profile = profile_repo.get_profile(user_id)
        assert profile is not None
        assert profile.displayName == "Lifecycle User"
        assert profile.level == "intermediate"
        assert profile.reminderTime == "09:00"
        assert profile.email == "user@example.com"
        assert profile.deletionStatus == "deletion_requested"

        # Step 4: Backdate the deletion request to simulate grace period expiry
        past = (datetime.now(timezone.utc) - timedelta(days=31)).isoformat().replace("+00:00", "Z")
        dynamodb_table.update_item(
            Key={"pk": f"USER#{user_id}", "sk": "PROFILE"},
            UpdateExpression="SET deletionRequestedAt = :past",
            ExpressionAttributeValues={":past": past},
        )

        # Step 5: Purge job finds and processes the expired account
        expired = purge_svc.find_expired_deletions()
        expired_ids = [p.userId for p in expired]
        assert user_id in expired_ids

        purge_svc.purge_account(user_id)

        # Step 6: Verify consent is deleted
        assert consent_repo.get_consent(user_id) is None

        # Step 7: Verify profile is marked purged with TTL
        purged = profile_repo.get_profile(user_id)
        assert purged is not None
        assert purged.deletionStatus == "purged"
        raw = dynamodb_table.get_item(Key={"pk": f"USER#{user_id}", "sk": "PROFILE"}).get("Item")
        assert raw is not None
        assert "ttlEpoch" in raw
        assert raw["ttlEpoch"] > 0

    @pytest.mark.asyncio
    async def test_purge_guards_against_invalid_states(
        self, dynamodb_table, consent_repo, profile_repo, purge_svc,
    ):
        """Purge guard: active profiles and non-existent users are skipped."""
        user_id = "user-guard"

        # Active profile — not eligible for purge
        profile_repo.put_profile(UserProfile(
            userId=user_id, deletionStatus="active",
            createdAt="2026-01-01T00:00:00Z", updatedAt="2026-01-01T00:00:00Z",
        ))
        purge_svc.purge_account(user_id)
        profile = profile_repo.get_profile(user_id)
        assert profile is not None
        assert profile.deletionStatus == "active"  # unchanged

        # Non-existent user — should not raise
        purge_svc.purge_account("non-existent-user")  # no error
