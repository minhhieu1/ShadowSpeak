"""Profile service for user profile management."""

from datetime import UTC, datetime, timedelta

from app.models.auth import (
    DeleteAccountResult,
    UpdateProfileInput,
    UserProfile,
)
from app.repositories.consent_repository import ConsentRepository
from app.repositories.profile_repository import ProfileRepository
from app.services.rekey_service import RekeyService


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


class ProfileService:
    """Business logic for user profile operations.

    Handles profile CRUD, partial updates, consent guard integration,
    soft-delete, and onboarding progress state.
    """

    def __init__(
        self,
        profile_repository: ProfileRepository,
        consent_repository: ConsentRepository | None = None,
        rekey_service: RekeyService | None = None,
    ) -> None:
        self._profile_repo = profile_repository
        self._consent_repo = consent_repository
        self._rekey_service = rekey_service

    def get_profile(
        self, user_id: str, device_id: str | None = None
    ) -> UserProfile:
        """Get a user profile, creating a default one if none exists.

        If device_id is provided and no user-scoped consent exists,
        triggers re-key from device-scoped consent bootstrap.
        """
        existing = self._profile_repo.get_profile(user_id)
        if existing is not None:
            # Trigger re-key if consent hasn't been migrated yet
            if (
                self._rekey_service
                and device_id
                and self._consent_repo
                and not self._consent_repo.user_consent_exists(user_id)
            ):
                self._rekey_service.rekey_consent(user_id, device_id)
            return existing

        now = _now_iso()
        profile = UserProfile(
            userId=user_id,
            createdAt=now,
            updatedAt=now,
        )
        self._profile_repo.save_profile(profile)
        return profile

    def update_profile(
        self, user_id: str, payload: UpdateProfileInput
    ) -> UserProfile:
        """Update a user profile with partial update semantics.

        Only fields present in the payload are updated. Omitted fields
        remain unchanged.
        """
        profile = self.get_profile(user_id)
        updates = payload.model_dump(exclude_none=True)

        if "displayName" in updates and updates["displayName"] is not None:
            updates["displayName"] = updates["displayName"].strip()

        profile = profile.model_copy(update={**updates, "updatedAt": _now_iso()})
        self._profile_repo.save_profile(profile)
        return profile

    def update_onboarding_step(self, user_id: str, step: str) -> UserProfile:
        """Update the onboarding step for a user."""
        VALID_STEPS = {
            None,
            "age_gate_done",
            "consent_done",
            "intro_done",
            "level_selected",
            "reminder_set",
            "mic_permission_done",
            "complete",
        }

        from app.core.errors import AppError

        if step not in VALID_STEPS:
            raise AppError(
                "VALIDATION_ERROR",
                f"Invalid onboarding step: {step}. "
                f"Must be one of: {', '.join(sorted(VALID_STEPS - {None}))}",
            )

        profile = self.get_profile(user_id)
        profile = profile.model_copy(
            update={"onboardingStep": step, "updatedAt": _now_iso()}
        )
        self._profile_repo.save_profile(profile)
        return profile

    def delete_account(self, user_id: str) -> DeleteAccountResult:
        """Initiate account deletion (soft-delete).

        Sets deletionRequestedAt and deletionStatus = deletion_requested.
        Does NOT hard-delete any data.
        """
        requested_at = _now_iso()
        purge_after = (datetime.now(UTC) + timedelta(days=30)).isoformat()

        self._profile_repo.mark_deletion_requested(user_id, requested_at)

        return DeleteAccountResult(
            userId=user_id,
            deletionRequestedAt=requested_at,
            purgeAfter=purge_after,
            status="deletion_requested",
        )
