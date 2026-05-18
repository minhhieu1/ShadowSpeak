"""Tests for profile service."""

from datetime import UTC, datetime
from unittest.mock import MagicMock, patch

import pytest

from app.models.auth import DeleteAccountResult, UpdateProfileInput, UserProfile


class TestProfileService:
    def test_get_profile_creates_default_if_not_found(self) -> None:
        from app.services.profile_service import ProfileService

        mock_repo = MagicMock()
        mock_repo.get_profile.return_value = None

        service = ProfileService(mock_repo)
        result = service.get_profile("user-123")

        assert result.userId == "user-123"
        assert result.displayName is None
        assert result.level is None
        assert result.deletionStatus == "active"
        mock_repo.save_profile.assert_called_once()

    def test_get_profile_returns_existing(self) -> None:
        from app.services.profile_service import ProfileService

        existing = UserProfile(
            userId="user-123",
            displayName="Test User",
            createdAt="2026-01-01T00:00:00Z",
            updatedAt="2026-01-01T00:00:00Z",
        )
        mock_repo = MagicMock()
        mock_repo.get_profile.return_value = existing

        service = ProfileService(mock_repo)
        result = service.get_profile("user-123")

        assert result == existing
        mock_repo.save_profile.assert_not_called()

    def test_update_profile_partial_update(self) -> None:
        from app.services.profile_service import ProfileService

        existing = UserProfile(
            userId="user-123",
            displayName="Old Name",
            level="beginner",
            reminderTime="09:00",
            createdAt="2026-01-01T00:00:00Z",
            updatedAt="2026-01-01T00:00:00Z",
        )
        mock_repo = MagicMock()
        mock_repo.get_profile.return_value = existing

        service = ProfileService(mock_repo)
        result = service.update_profile(
            "user-123",
            UpdateProfileInput(level="intermediate"),
        )

        assert result.displayName == "Old Name"  # Unchanged
        assert result.level == "intermediate"  # Updated
        assert result.reminderTime == "09:00"  # Unchanged
        mock_repo.save_profile.assert_called_once()

    def test_update_profile_trims_display_name(self) -> None:
        from app.services.profile_service import ProfileService

        existing = UserProfile(
            userId="user-123",
            createdAt="2026-01-01T00:00:00Z",
            updatedAt="2026-01-01T00:00:00Z",
        )
        mock_repo = MagicMock()
        mock_repo.get_profile.return_value = existing

        service = ProfileService(mock_repo)
        result = service.update_profile(
            "user-123",
            UpdateProfileInput(displayName="  Hello World  "),
        )

        assert result.displayName == "Hello World"

    def test_delete_account_returns_expected_result(self) -> None:
        from app.services.profile_service import ProfileService

        mock_repo = MagicMock()

        service = ProfileService(mock_repo)
        result = service.delete_account("user-123")

        assert isinstance(result, DeleteAccountResult)
        assert result.userId == "user-123"
        assert result.status == "deletion_requested"
        assert result.deletionRequestedAt is not None
        assert result.purgeAfter is not None
        mock_repo.mark_deletion_requested.assert_called_once()


class TestProfileAPI:
    """Integration tests for profile endpoints."""

    def test_get_me_authenticated(self) -> None:
        from fastapi.testclient import TestClient

        from app.main import app

        client = TestClient(app)

        # First give consent
        client.put(
            "/v1/consent",
            headers={
                "Authorization": "Bearer test-user",
                "X-Device-Id": "test-device",
            },
            json={
                "ageVerified": True,
                "privacyAccepted": True,
                "adConsent": "non_personalized",
            },
        )

        response = client.get(
            "/v1/me",
            headers={"Authorization": "Bearer test-user"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["ok"] is True
        assert body["data"]["userId"] == "test-user"

    def test_put_me_updates_profile(self) -> None:
        from fastapi.testclient import TestClient

        from app.main import app

        client = TestClient(app)

        response = client.put(
            "/v1/me",
            headers={"Authorization": "Bearer test-user"},
            json={"displayName": "New Name", "level": "advanced"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["data"]["displayName"] == "New Name"
        assert body["data"]["level"] == "advanced"

    def test_put_me_reminder_time_format_valid(self) -> None:
        from fastapi.testclient import TestClient

        from app.main import app

        client = TestClient(app)

        response = client.put(
            "/v1/me",
            headers={"Authorization": "Bearer test-user"},
            json={"reminderTime": "14:30"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["data"]["reminderTime"] == "14:30"

    def test_put_me_reminder_time_format_invalid_422(self) -> None:
        from fastapi.testclient import TestClient

        from app.main import app

        client = TestClient(app)

        response = client.put(
            "/v1/me",
            headers={"Authorization": "Bearer test-user"},
            json={"reminderTime": "invalid"},
        )
        assert response.status_code == 422

    def test_get_me_requires_auth_or_returns_403(self) -> None:
        from fastapi.testclient import TestClient

        from app.main import app

        client = TestClient(app)
        response = client.get("/v1/me")
        # With allow_dev_auth=True, missing auth defaults to "demo-user"
        # which doesn't have consent → 403 CONSENT_REQUIRED
        assert response.status_code == 403
        body = response.json()
        assert body["error"]["code"] == "CONSENT_REQUIRED"
