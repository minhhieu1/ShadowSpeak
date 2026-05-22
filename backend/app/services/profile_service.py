"""Profile service — business logic for user profiles."""

import re
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException

from app.core.errors import AppErrorCode, ERROR_STATUS_MAP, to_http_exception
from app.models.auth import DeleteAccountResult, OnboardingStep, UpdateProfileInput, UserProfile
from app.repositories.profile_repository import ProfileRepository
from app.services.consent_service import ConsentService
from app.services.rekey_service import RekeyService

VALID_LEVELS = {"beginner", "intermediate", "advanced"}
REMINDER_TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


class ProfileService:
    """Handles profile retrieval and updates with consent guard."""

    def __init__(
        self,
        repository: ProfileRepository,
        consent_service: ConsentService,
        rekey_service: RekeyService | None = None,
    ):
        self.repository = repository
        self.consent_service = consent_service
        self.rekey_service = rekey_service

    def get_profile(self, user_id: str) -> UserProfile | None:
        """Return the profile, requiring consent first."""
        self.consent_service.require_consent(user_id)
        return self.repository.get_profile(user_id)

    def get_profile_with_rekey(
        self, user_id: str, device_id: str | None = None, request_id: str | None = None
    ) -> UserProfile | None:
        """Return the profile, triggering a consent re-key if needed.

        If *device_id* is provided and the user has no consent yet, the
        re-key service will attempt to migrate device-level consent to
        the user account before checking consent.
        """
        if device_id and self.rekey_service:
            self.rekey_service.rekey_consent(device_id, user_id, request_id=request_id)
        return self.get_profile(user_id)

    def ensure_consent_with_rekey(
        self, user_id: str, device_id: str | None = None, request_id: str | None = None
    ) -> None:
        if device_id and self.rekey_service:
            self.rekey_service.rekey_consent(device_id, user_id, request_id=request_id)
        self.consent_service.require_consent(user_id)

    def update_profile(self, user_id: str, input_data: UpdateProfileInput) -> UserProfile:
        """Update a user's profile after consent validation."""
        normalized_input = self._normalize_input(input_data)
        self.consent_service.require_consent(user_id)
        self._validate(normalized_input)

        # Check if profile exists — if not, create one
        existing = self.repository.get_profile(user_id)
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        if existing is None:
            onboarding_step = normalized_input.onboardingStep.value if normalized_input.onboardingStep else None
            profile = UserProfile(
                userId=user_id,
                displayName=normalized_input.displayName,
                level=normalized_input.level,
                reminderTime=normalized_input.reminderTime,
                onboardingStep=onboarding_step,
                createdAt=now,
                updatedAt=now,
            )
            self.repository.put_profile(profile)
            return profile

        # Partial update via repository
        onboarding_step = normalized_input.onboardingStep.value if normalized_input.onboardingStep else None
        result = self.repository.update_profile(
            user_id=user_id,
            displayName=normalized_input.displayName,
            level=normalized_input.level,
            reminderTime=normalized_input.reminderTime,
            onboardingStep=onboarding_step,
        )
        assert result is not None
        return result

    def update_onboarding_step(self, user_id: str, step: OnboardingStep) -> UserProfile:
        self.consent_service.require_consent(user_id)
        existing = self.repository.get_profile(user_id)
        if existing is None:
            raise to_http_exception(
                AppErrorCode.USER_NOT_FOUND,
                "User profile not found",
            )
        result = self.repository.update_onboarding_step(user_id, step.value)
        assert result is not None
        return result

    def delete_account(self, user_id: str) -> DeleteAccountResult:
        """Soft-delete an account, setting a 30-day grace period."""
        self.consent_service.require_consent(user_id)

        now = datetime.now(timezone.utc)
        deletion_requested_at = now.isoformat().replace("+00:00", "Z")
        purge_after = (now + timedelta(days=30)).isoformat().replace("+00:00", "Z")

        profile = self.repository.get_profile(user_id)
        if profile is None:
            raise to_http_exception(
                AppErrorCode.USER_NOT_FOUND,
                "User profile not found",
            )

        self.repository.mark_deletion_requested(user_id, deletion_requested_at)

        return DeleteAccountResult(
            userId=user_id,
            deletionRequestedAt=deletion_requested_at,
            purgeAfter=purge_after,
            status="deletion_requested",
        )

    @staticmethod
    def _normalize_input(input_data: UpdateProfileInput) -> UpdateProfileInput:
        display_name = input_data.displayName
        if display_name is not None:
            display_name = display_name.strip()
        return input_data.model_copy(update={"displayName": display_name})

    @staticmethod
    def _validate(input_data: UpdateProfileInput) -> None:
        errors: list[dict] = []

        if input_data.displayName is not None:
            if len(input_data.displayName) > 80:
                errors.append(
                    {
                        "field": "displayName",
                        "message": "Display name must be 80 characters or fewer.",
                    }
                )
            if input_data.displayName == "":
                errors.append(
                    {
                        "field": "displayName",
                        "message": "Display name must not be empty.",
                    }
                )

        if input_data.level is not None and input_data.level not in VALID_LEVELS:
            errors.append(
                {
                    "field": "level",
                    "message": f"Level must be one of: {', '.join(sorted(VALID_LEVELS))}.",
                }
            )

        if input_data.reminderTime is not None and not REMINDER_TIME_RE.match(
            input_data.reminderTime
        ):
            errors.append(
                {
                    "field": "reminderTime",
                    "message": "Reminder time must be in HH:MM format (24h).",
                }
            )

        if errors:
            raise HTTPException(
                status_code=ERROR_STATUS_MAP[AppErrorCode.VALIDATION_ERROR],
                detail={
                    "code": AppErrorCode.VALIDATION_ERROR,
                    "message": "Profile validation failed",
                    "details": errors,
                },
            )
