"""Tests for the consent service and endpoints."""
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import boto3
import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient

from app.core.config import Settings
from app.main import create_app
from app.models.auth import ConsentState
from app.repositories.consent_repository import ConsentRepository
from app.services.consent_service import ConsentService


# ===========================================================================
# Fixtures
# ===========================================================================

@pytest.fixture
def dynamodb_table():
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
def repo(dynamodb_table):
    return ConsentRepository(dynamodb_table)


@pytest.fixture
def service(repo):
    return ConsentService(repo)


# ===========================================================================
# Tests: ConsentService
# ===========================================================================


class TestConsentService:
    def test_get_consent_returns_state(self, service, repo):
        repo.put_consent(
            user_id="user-1",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        result = service.get_consent("user-1")
        assert result is not None
        assert result.ageVerified is True
        assert result.privacyAccepted is True
        assert result.adConsent == "personalized"

    def test_get_consent_returns_none(self, service):
        assert service.get_consent("nonexistent") is None

    def test_save_consent_validates_age_gate(self, service):
        with pytest.raises(HTTPException) as exc:
            service.save_consent(
                user_id="user-1",
                age_verified=False,
                privacy_accepted=True,
                ad_consent="personalized",
                locale="en",
            )
        assert exc.value.status_code == 422

    def test_save_consent_validates_ad_consent(self, service):
        with pytest.raises(HTTPException) as exc:
            service.save_consent(
                user_id="user-1",
                age_verified=True,
                privacy_accepted=True,
                ad_consent="invalid_value",
                locale="en",
            )
        assert exc.value.status_code == 422

    def test_save_consent_validates_privacy_accepted(self, service):
        with pytest.raises(HTTPException) as exc:
            service.save_consent(
                user_id="user-1",
                age_verified=True,
                privacy_accepted=False,
                ad_consent="personalized",
                locale="en",
            )
        assert exc.value.status_code == 422

    def test_save_consent_stores_locale(self, service):
        service.save_consent(
            user_id="user-1",
            age_verified=True,
            privacy_accepted=True,
            ad_consent="personalized",
            locale="fr-FR",
        )
        result = service.get_consent("user-1")
        assert result is not None
        assert result.locale == "fr-FR"

    def test_save_consent_without_locale(self, service):
        service.save_consent(
            user_id="user-1",
            age_verified=True,
            privacy_accepted=True,
            ad_consent="non_personalized",
            locale=None,
        )
        result = service.get_consent("user-1")
        assert result is not None
        assert result.locale is None

    def test_get_or_create_device_consent_returns_default_without_persisting(self, service):
        result = service.get_or_create_device_consent("device-default")
        assert result.userId == "device-default"
        assert result.ageVerified is False
        assert result.privacyAccepted is False
        assert result.adConsent == "unknown"
        assert service.get_device_consent("device-default") is None

    def test_save_consent_updates_timestamp(self, service):
        service.save_consent(
            user_id="user-1",
            age_verified=True,
            privacy_accepted=True,
            ad_consent="personalized",
            locale="en",
        )
        result = service.get_consent("user-1")
        assert result is not None
        # Verify it's a valid ISO datetime
        assert "T" in result.consentUpdatedAt

    def test_get_device_consent(self, service, repo):
        repo.put_device_consent(
            device_id="device-1",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        result = service.get_device_consent("device-1")
        assert result is not None
        assert result.ageVerified is True

    def test_save_device_consent(self, service):
        service.save_device_consent(
            device_id="device-1",
            age_verified=True,
            privacy_accepted=True,
            ad_consent="personalized",
            locale="en",
        )
        result = service.get_device_consent("device-1")
        assert result is not None
        assert result.privacyAccepted is True
        assert result.locale == "en"

    def test_save_device_consent_validates_age_gate(self, service):
        with pytest.raises(HTTPException) as exc:
            service.save_device_consent(
                device_id="device-1",
                age_verified=False,
                privacy_accepted=True,
                ad_consent="personalized",
                locale="en",
            )
        assert exc.value.status_code == 422

    def test_delete_device_consent(self, service, repo):
        repo.put_device_consent(
            device_id="device-1",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        service.delete_device_consent("device-1")
        assert service.get_device_consent("device-1") is None

    def test_save_consent_emits_audit_log(self, service):
        with patch("app.services.consent_service.write_audit_log") as mock_audit:
            service.save_consent(
                user_id="user-audit",
                age_verified=True,
                privacy_accepted=True,
                ad_consent="personalized",
                locale="en-US",
                request_id="req-1",
            )
        mock_audit.assert_called_once()


# ===========================================================================
# Tests: Consent Endpoints
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
    import jwt as pyjwt
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
def app_with_consent(settings):
    from app.core.auth import clear_jwks_cache

    clear_jwks_cache()
    return create_app(settings)


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
async def client(app_with_consent, mock_dynamodb_table, settings):
    """Override the consent_service dependency with a mocked DynamoDB-backed one."""
    from app.api.routes.profile import _get_consent_service
    from app.core.config import get_settings

    repo = ConsentRepository(mock_dynamodb_table)
    svc = ConsentService(repo)

    app_with_consent.dependency_overrides[_get_consent_service] = lambda: svc
    app_with_consent.dependency_overrides[get_settings] = lambda: settings

    transport = ASGITransport(app=app_with_consent)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


def _auth_header(rsa_keys) -> dict:
    return {"Authorization": f"Bearer {_create_jwt(rsa_keys)}"}


class TestConsentEndpoints:
    """Test GET/PUT /consent endpoints via the actual FastAPI app."""

    @pytest.mark.asyncio
    async def test_get_consent_pre_auth_with_device_id(self, client, jwks_response):
        """GET /consent with X-Device-Id should read from device consent."""
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            # First, PUT consent with device id
            put_resp = await client.put(
                "/consent",
                json={
                    "ageVerified": True,
                    "privacyAccepted": True,
                    "adConsent": "personalized",
                },
                headers={"X-Device-Id": "test-device", "Content-Type": "application/json"},
            )
            assert put_resp.status_code == 200, put_resp.text

            # Then GET it back
            get_resp = await client.get(
                "/consent", headers={"X-Device-Id": "test-device"}
            )
            assert get_resp.status_code == 200, get_resp.text
            data = get_resp.json()
            assert data["ok"] is True
            assert data["data"]["ageVerified"] is True
            assert data["data"]["privacyAccepted"] is True
            assert data["data"]["adConsent"] == "personalized"

    @pytest.mark.asyncio
    async def test_put_consent_pre_auth_with_device_id(self, client, jwks_response):
        """PUT /consent with X-Device-Id should write device consent."""
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/consent",
                json={
                    "ageVerified": True,
                    "privacyAccepted": True,
                    "adConsent": "non_personalized",
                },
                headers={"X-Device-Id": "device-put-test", "Content-Type": "application/json"},
            )
            assert resp.status_code == 200, resp.text
            data = resp.json()
            assert data["ok"] is True
            assert data["data"]["adConsent"] == "non_personalized"

    @pytest.mark.asyncio
    async def test_put_consent_validates_age_gate(self, client, jwks_response):
        """PUT /consent with ageVerified=False should return 422.

        The invalid consent must NOT be persisted — the subsequent GET
        should return the default unverified consent state, not the
        rejected input.
        """
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/consent",
                json={
                    "ageVerified": False,
                    "privacyAccepted": True,
                    "adConsent": "personalized",
                },
                headers={"X-Device-Id": "device-validation", "Content-Type": "application/json"},
            )
            assert resp.status_code == 422, resp.text
            follow_up = await client.get("/consent", headers={"X-Device-Id": "device-validation"})
            assert follow_up.status_code == 200
            data = follow_up.json()["data"]
            # The failed PUT must NOT have persisted — default unverified consent.
            assert data is not None
            assert data["ageVerified"] is False
            assert data["privacyAccepted"] is False
            assert data["adConsent"] == "unknown"

    @pytest.mark.asyncio
    async def test_put_consent_validates_ad_consent(self, client, jwks_response):
        """PUT /consent with invalid adConsent should return 422."""
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/consent",
                json={
                    "ageVerified": True,
                    "privacyAccepted": True,
                    "adConsent": "invalid",
                },
                headers={"X-Device-Id": "device-validation-2", "Content-Type": "application/json"},
            )
            assert resp.status_code == 422, resp.text

    @pytest.mark.asyncio
    async def test_get_consent_requires_device_id_when_unauthenticated(self, client):
        resp = await client.get("/consent")
        assert resp.status_code == 422
        assert resp.json()["error"]["code"] == "VALIDATION_ERROR"

    @pytest.mark.asyncio
    async def test_put_consent_requires_device_id_when_unauthenticated(self, client):
        resp = await client.put(
            "/consent",
            json={"ageVerified": True, "privacyAccepted": True, "adConsent": "personalized"},
        )
        assert resp.status_code == 422
        assert resp.json()["error"]["code"] == "VALIDATION_ERROR"

    @pytest.mark.asyncio
    async def test_put_consent_rejects_invalid_optional_auth(self, client):
        resp = await client.put(
            "/consent",
            json={"ageVerified": True, "privacyAccepted": True, "adConsent": "personalized"},
            headers={"Authorization": "Bearer", "X-Device-Id": "device-1"},
        )
        assert resp.status_code == 401
        assert resp.json()["error"]["code"] == "AUTH_UNAUTHORIZED"

    @pytest.mark.asyncio
    async def test_put_consent_defaults_locale_to_en_us(self, client, jwks_response):
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/consent",
                json={
                    "ageVerified": True,
                    "privacyAccepted": True,
                    "adConsent": "personalized",
                },
                headers={"X-Device-Id": "device-default-locale", "Content-Type": "application/json"},
            )
            assert resp.status_code == 200, resp.text
            assert resp.json()["data"]["locale"] == "en-US"

    @pytest.mark.asyncio
    async def test_put_consent_rejects_invalid_device_id(self, client, jwks_response):
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/consent",
                json={
                    "ageVerified": True,
                    "privacyAccepted": True,
                    "adConsent": "personalized",
                },
                headers={"X-Device-Id": "bad id", "Content-Type": "application/json"},
            )
            assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_get_consent_authenticated(self, client, jwks_response, rsa_keys):
        """GET /consent with JWT should read from USER# key."""
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            # Put consent first (needs to go through the repo directly since
            # there's no auth + consent endpoint yet)
            resp = await client.get(
                "/consent", headers=_auth_header(rsa_keys)
            )
            # No consent stored yet
            assert resp.status_code == 200, resp.text
            data = resp.json()
            assert data["ok"] is True
            assert data["data"] is None

    @pytest.mark.asyncio
    async def test_put_consent_authenticated(self, client, jwks_response, rsa_keys):
        """PUT /consent with JWT should write to USER# key."""
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/consent",
                json={
                    "ageVerified": True,
                    "privacyAccepted": True,
                    "adConsent": "personalized",
                },
                headers={**_auth_header(rsa_keys), "Content-Type": "application/json"},
            )
            assert resp.status_code == 200, resp.text
            data = resp.json()
            assert data["ok"] is True
            assert data["data"]["ageVerified"] is True

    @pytest.mark.asyncio
    async def test_put_consent_authenticated_stores_locale(
        self, client, jwks_response, rsa_keys
    ):
        """PUT /consent with JWT should store locale from header."""
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/consent",
                json={
                    "ageVerified": True,
                    "privacyAccepted": True,
                    "adConsent": "personalized",
                },
                headers={
                    **_auth_header(rsa_keys),
                    "Content-Type": "application/json",
                    "Accept-Language": "de-DE",
                },
            )
            assert resp.status_code == 200, resp.text
            data = resp.json()
            assert data["data"]["locale"] == "de-DE"

    @pytest.mark.asyncio
    async def test_put_consent_authenticated_emits_audit_log(
        self, client, jwks_response, rsa_keys
    ):
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch, patch(
            "app.services.consent_service.write_audit_log"
        ) as mock_audit:
            mock_fetch.return_value = jwks_response
            resp = await client.put(
                "/consent",
                json={
                    "ageVerified": True,
                    "privacyAccepted": True,
                    "adConsent": "personalized",
                },
                headers={**_auth_header(rsa_keys), "Content-Type": "application/json"},
            )
            assert resp.status_code == 200, resp.text
        mock_audit.assert_called_once()

    @pytest.mark.asyncio
    async def test_require_consent_blocks_missing(self, client, jwks_response, rsa_keys):
        """Accessing a consent-guarded endpoint without consent returns 403."""
        from app.core.auth import _fetch_jwks

        with patch("app.core.auth._fetch_jwks") as mock_fetch:
            mock_fetch.return_value = jwks_response
            # /me requires consent — without it we should get 403
            resp = await client.get("/me", headers=_auth_header(rsa_keys))
            assert resp.status_code == 403, resp.text
