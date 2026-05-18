"""Tests for consent re-key service."""

from unittest.mock import MagicMock, patch

import pytest

from app.models.auth import ConsentState
from app.services.rekey_service import RekeyService


class TestRekeyService:
    def test_rekey_copies_consent_and_deletes_bootstrap(self) -> None:
        mock_repo = MagicMock()
        mock_repo.user_consent_exists.return_value = False
        mock_repo.get_consent.side_effect = (
            lambda uid, did: ConsentState(
                userId="device-abc",
                ageVerified=True,
                privacyAccepted=True,
                adConsent="personalized",
                consentUpdatedAt="2026-01-01T00:00:00Z",
                locale="en-US",
            )
            if did == "device-abc"
            else None
        )

        service = RekeyService(mock_repo)
        result = service.rekey_consent("user-123", "device-abc")

        assert result is not None
        assert result.userId == "user-123"
        assert result.ageVerified is True
        assert result.privacyAccepted is True
        assert result.adConsent == "personalized"
        assert result.locale == "en-US"
        mock_repo.save_consent.assert_called_once()
        mock_repo.delete_device_consent.assert_called_once_with("device-abc")

    def test_rekey_idempotent_when_user_consent_exists(self) -> None:
        mock_repo = MagicMock()
        mock_repo.user_consent_exists.return_value = True
        mock_repo.get_consent.return_value = ConsentState(
            userId="user-123",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="non_personalized",
            consentUpdatedAt="2026-01-01T00:00:00Z",
        )

        service = RekeyService(mock_repo)
        result = service.rekey_consent("user-123", "device-abc")

        assert result is not None
        assert result.userId == "user-123"
        # Should NOT save or delete anything
        mock_repo.save_consent.assert_not_called()
        mock_repo.delete_device_consent.assert_not_called()

    def test_rekey_noop_when_no_device_bootstrap(self) -> None:
        mock_repo = MagicMock()
        mock_repo.user_consent_exists.return_value = False
        mock_repo.get_consent.return_value = None

        service = RekeyService(mock_repo)
        result = service.rekey_consent("user-123", "device-abc")

        assert result is None
        mock_repo.save_consent.assert_not_called()
        mock_repo.delete_device_consent.assert_not_called()

    def test_rekey_preserves_consent_state_values(self) -> None:
        mock_repo = MagicMock()
        mock_repo.user_consent_exists.return_value = False
        mock_repo.get_consent.side_effect = (
            lambda uid, did: ConsentState(
                userId="device-xyz",
                ageVerified=False,
                privacyAccepted=True,
                adConsent="unknown",
                consentUpdatedAt="2026-01-01T00:00:00Z",
            )
            if did == "device-xyz"
            else None
        )

        service = RekeyService(mock_repo)
        result = service.rekey_consent("user-456", "device-xyz")

        assert result is not None
        assert result.ageVerified is False
        assert result.privacyAccepted is True
        assert result.adConsent == "unknown"
