"""Tests for consent management."""

from datetime import UTC, datetime
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestConsentService:
    """Unit tests for ConsentService business logic."""

    @patch("app.repositories.consent_repository.ConsentRepository")
    def test_get_consent_authenticated(self, mock_repo_cls: MagicMock) -> None:
        from app.models.auth import ConsentState
        from app.services.consent_service import ConsentService

        mock_repo = MagicMock()
        mock_repo_cls.return_value = mock_repo
        mock_repo.get_consent.return_value = ConsentState(
            userId="user-123",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            consentUpdatedAt="2026-01-01T00:00:00Z",
            locale="en-US",
        )

        service = ConsentService(mock_repo)
        result = service.get_consent("user-123", None)

        assert result.ageVerified is True
        assert result.privacyAccepted is True
        assert result.adConsent == "personalized"
        mock_repo.get_consent.assert_called_once_with("user-123", None)

    @patch("app.repositories.consent_repository.ConsentRepository")
    def test_get_consent_device_scoped(self, mock_repo_cls: MagicMock) -> None:
        from app.models.auth import ConsentState
        from app.services.consent_service import ConsentService

        mock_repo = MagicMock()
        mock_repo_cls.return_value = mock_repo
        mock_repo.get_consent.return_value = ConsentState(
            userId="device-abc",
            ageVerified=False,
            privacyAccepted=False,
            adConsent="unknown",
            consentUpdatedAt="2026-01-01T00:00:00Z",
        )

        service = ConsentService(mock_repo)
        result = service.get_consent(None, "device-abc")

        assert result.userId == "device-abc"
        mock_repo.get_consent.assert_called_once_with(None, "device-abc")

    @patch("app.repositories.consent_repository.ConsentRepository")
    def test_save_consent_valid(self, mock_repo_cls: MagicMock) -> None:
        from app.models.auth import ConsentState, UpdateConsentInput
        from app.services.consent_service import ConsentService

        mock_repo = MagicMock()
        mock_repo_cls.return_value = mock_repo
        mock_repo.get_consent.return_value = None

        service = ConsentService(mock_repo)
        result = service.save_consent(
            "user-123",
            UpdateConsentInput(
                ageVerified=True,
                privacyAccepted=True,
                adConsent="personalized",
            ),
            None,
        )

        assert result.ageVerified is True
        assert result.privacyAccepted is True
        assert result.adConsent == "personalized"
        assert result.userId == "user-123"
        assert result.locale is None
        # Verify the repo was called with the consent data
        mock_repo.save_consent.assert_called_once()
        saved = mock_repo.save_consent.call_args[0][0]
        assert saved.ageVerified is True

    @patch("app.repositories.consent_repository.ConsentRepository")
    def test_save_consent_missing_device_id_raises(self, mock_repo_cls: MagicMock) -> None:
        from app.models.auth import UpdateConsentInput
        from app.core.errors import AppError
        from app.services.consent_service import ConsentService

        mock_repo = MagicMock()
        mock_repo_cls.return_value = mock_repo

        service = ConsentService(mock_repo)
        with pytest.raises(AppError) as exc:
            service.save_consent(
                None,
                UpdateConsentInput(
                    ageVerified=True,
                    privacyAccepted=True,
                    adConsent="personalized",
                ),
                None,
            )
        assert exc.value.detail["code"] == "VALIDATION_ERROR"

    def test_save_consent_invalid_ad_consent(self) -> None:
        from pydantic import ValidationError

        from app.models.auth import UpdateConsentInput

        # Pydantic Literal validation catches invalid adConsent at the model level
        with pytest.raises(ValidationError):
            UpdateConsentInput(
                ageVerified=True,
                privacyAccepted=True,
                adConsent="invalid_value",  # type: ignore[arg-type]
            )

    @patch("app.repositories.consent_repository.ConsentRepository")
    def test_save_consent_with_locale(self, mock_repo_cls: MagicMock) -> None:
        from app.models.auth import UpdateConsentInput
        from app.services.consent_service import ConsentService

        mock_repo = MagicMock()
        mock_repo_cls.return_value = mock_repo

        service = ConsentService(mock_repo)
        result = service.save_consent(
            "user-123",
            UpdateConsentInput(
                ageVerified=True,
                privacyAccepted=True,
                adConsent="non_personalized",
            ),
            None,
            locale="fr-FR",
        )

        assert result.locale == "fr-FR"


class TestConsentAPI:
    """Integration tests for consent endpoints."""

    def test_get_consent_authenticated(self) -> None:
        response = client.get(
            "/v1/consent",
            headers={
                "Authorization": "Bearer test-user",
                "X-Device-Id": "device-abc",
                "X-Request-Id": "req-1",
            },
        )
        assert response.status_code == 200
        body = response.json()
        assert body["ok"] is True

    def test_get_consent_pre_auth_requires_device_id(self) -> None:
        response = client.get("/v1/consent")
        body = response.json()
        assert response.status_code == 422
        assert body["error"]["code"] == "VALIDATION_ERROR"

    def test_put_consent_pre_auth_round_trip(self) -> None:
        headers = {"X-Device-Id": "device-test-2", "X-Request-Id": "req-put-1"}
        response = client.put(
            "/v1/consent",
            headers=headers,
            json={
                "ageVerified": True,
                "privacyAccepted": True,
                "adConsent": "non_personalized",
            },
        )
        body = response.json()
        assert response.status_code == 200
        assert body["ok"] is True
        assert body["data"]["userId"] == "device-test-2"
        assert body["data"]["privacyAccepted"] is True

    def test_put_consent_missing_device_id_422(self) -> None:
        response = client.put(
            "/v1/consent",
            json={
                "ageVerified": True,
                "privacyAccepted": True,
                "adConsent": "non_personalized",
            },
        )
        assert response.status_code == 422

    def test_put_consent_invalid_ad_consent_422(self) -> None:
        headers = {"X-Device-Id": "device-test-3"}
        response = client.put(
            "/v1/consent",
            headers=headers,
            json={
                "ageVerified": True,
                "privacyAccepted": True,
                "adConsent": "invalid",
            },
        )
        assert response.status_code == 422

    def test_consent_persists_after_save(self) -> None:
        device_id = "device-persist-1"
        client.put(
            "/v1/consent",
            headers={"X-Device-Id": device_id},
            json={
                "ageVerified": True,
                "privacyAccepted": True,
                "adConsent": "personalized",
            },
        )
        response = client.get(
            "/v1/consent",
            headers={"X-Device-Id": device_id},
        )
        body = response.json()
        assert body["data"]["privacyAccepted"] is True
        assert body["data"]["adConsent"] == "personalized"
