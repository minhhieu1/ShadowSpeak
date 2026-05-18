"""Tests for onboarding progress state."""

from unittest.mock import MagicMock

import pytest

from app.models.auth import UserProfile


class TestOnboardingProgress:
    def test_update_onboarding_step_valid(self) -> None:
        from app.services.profile_service import ProfileService

        existing = UserProfile(
            userId="user-123",
            createdAt="2026-01-01T00:00:00Z",
            updatedAt="2026-01-01T00:00:00Z",
        )
        mock_repo = MagicMock()
        mock_repo.get_profile.return_value = existing

        service = ProfileService(mock_repo)
        result = service.update_onboarding_step("user-123", "consent_done")

        assert result.onboardingStep == "consent_done"
        mock_repo.save_profile.assert_called_once()

    def test_update_onboarding_step_null_resets(self) -> None:
        from app.services.profile_service import ProfileService

        existing = UserProfile(
            userId="user-123",
            onboardingStep="complete",
            createdAt="2026-01-01T00:00:00Z",
            updatedAt="2026-01-01T00:00:00Z",
        )
        mock_repo = MagicMock()
        mock_repo.get_profile.return_value = existing

        service = ProfileService(mock_repo)
        result = service.update_onboarding_step("user-123", None)  # type: ignore[arg-type]

        assert result.onboardingStep is None

    def test_update_onboarding_step_invalid_raises(self) -> None:
        from app.core.errors import AppError
        from app.services.profile_service import ProfileService

        mock_repo = MagicMock()
        mock_repo.get_profile.return_value = UserProfile(
            userId="user-123",
            createdAt="2026-01-01T00:00:00Z",
            updatedAt="2026-01-01T00:00:00Z",
        )

        service = ProfileService(mock_repo)
        with pytest.raises(AppError) as exc:
            service.update_onboarding_step("user-123", "invalid_step")
        assert exc.value.detail["code"] == "VALIDATION_ERROR"

    def test_get_profile_returns_onboarding_step(self) -> None:
        from app.services.profile_service import ProfileService

        existing = UserProfile(
            userId="user-123",
            onboardingStep="level_selected",
            createdAt="2026-01-01T00:00:00Z",
            updatedAt="2026-01-01T00:00:00Z",
        )
        mock_repo = MagicMock()
        mock_repo.get_profile.return_value = existing

        service = ProfileService(mock_repo)
        result = service.get_profile("user-123")

        assert result.onboardingStep == "level_selected"


class TestOnboardingProgressAPI:
    def test_put_onboarding_step(self) -> None:
        from fastapi.testclient import TestClient

        from app.main import app

        client = TestClient(app)

        # First give consent
        client.put(
            "/v1/consent",
            headers={
                "Authorization": "Bearer progress-user",
                "X-Device-Id": "progress-device",
            },
            json={
                "ageVerified": True,
                "privacyAccepted": True,
                "adConsent": "personalized",
            },
        )

        response = client.put(
            "/v1/me/onboarding-step",
            headers={"Authorization": "Bearer progress-user"},
            json={"step": "level_selected"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["ok"] is True
        assert body["data"]["onboardingStep"] == "level_selected"

    def test_get_me_returns_onboarding_step(self) -> None:
        from fastapi.testclient import TestClient

        from app.main import app

        client = TestClient(app)

        response = client.get(
            "/v1/me",
            headers={"Authorization": "Bearer progress-user"},
        )
        assert response.status_code == 200
        body = response.json()
        assert "onboardingStep" in body["data"]
        assert body["data"]["onboardingStep"] == "level_selected"
