"""Tests for account deletion (soft-delete)."""

from unittest.mock import MagicMock

import pytest


class TestAccountDeletionService:
    def test_delete_account_sets_tombstone_fields(self) -> None:
        from app.services.profile_service import ProfileService

        mock_repo = MagicMock()
        mock_repo.mark_deletion_requested.return_value = MagicMock()

        service = ProfileService(mock_repo)
        result = service.delete_account("user-123")

        assert result.userId == "user-123"
        assert result.status == "deletion_requested"
        assert result.deletionRequestedAt is not None
        assert result.purgeAfter is not None
        mock_repo.mark_deletion_requested.assert_called_once_with(
            "user-123", result.deletionRequestedAt
        )

    def test_profile_shows_deletion_requested_after_delete(self) -> None:
        from app.services.profile_service import ProfileService

        mock_repo = MagicMock()
        # Simulate mark_deletion_requested setting the status
        updated_profile = MagicMock()
        updated_profile.deletionStatus = "deletion_requested"
        updated_profile.deletionRequestedAt = "2026-06-01T00:00:00Z"
        mock_repo.mark_deletion_requested.return_value = updated_profile

        service = ProfileService(mock_repo)
        result = service.delete_account("user-123")

        assert result.status == "deletion_requested"


class TestAccountDeletionAPI:
    def test_delete_account_returns_202(self) -> None:
        from fastapi.testclient import TestClient

        from app.main import app

        client = TestClient(app)

        # First give consent
        client.put(
            "/v1/consent",
            headers={
                "Authorization": "Bearer delete-user",
                "X-Device-Id": "delete-device",
            },
            json={
                "ageVerified": True,
                "privacyAccepted": True,
                "adConsent": "personalized",
            },
        )

        response = client.delete(
            "/v1/account",
            headers={"Authorization": "Bearer delete-user"},
        )
        assert response.status_code == 202
        body = response.json()
        assert body["ok"] is True
        assert body["data"]["userId"] == "delete-user"
        assert body["data"]["status"] == "deletion_requested"
        assert body["data"]["deletionRequestedAt"] is not None
        assert body["data"]["purgeAfter"] is not None

    def test_get_me_during_grace_period(self) -> None:
        from fastapi.testclient import TestClient

        from app.main import app

        client = TestClient(app)

        response = client.get(
            "/v1/me",
            headers={"Authorization": "Bearer delete-user"},
        )
        # Profile should still be accessible during grace period with consent still in place
        assert response.status_code == 200
        body = response.json()
        assert body["data"]["deletionStatus"] == "deletion_requested"
        assert body["data"]["deletionRequestedAt"] is not None
