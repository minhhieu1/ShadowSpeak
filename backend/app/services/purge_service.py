"""Purge service for async account deletion after 30-day grace period."""

from datetime import UTC, datetime, timedelta

from app.models.auth import UserProfile
from app.repositories.purge_repository import PurgeRepository


class PurgeService:
    """Service for async purge of expired account deletion requests.

    Handles cascade deletion of user data after the 30-day grace period.
    """

    def __init__(self, repository: PurgeRepository) -> None:
        self._repo = repository

    def find_expired_deletions(self) -> list[UserProfile]:
        """Find profiles where the 30-day grace period has expired.

        Returns profiles with deletionStatus = deletion_requested and
        deletionRequestedAt older than 30 days.
        """
        now = datetime.now(UTC)
        cutoff = now - timedelta(days=30)

        all_requested = self._repo.find_profiles_with_deletion_requested()
        expired = []
        for profile in all_requested:
            if profile.deletionRequestedAt is None:
                continue
            try:
                requested_at = datetime.fromisoformat(profile.deletionRequestedAt)
                if requested_at < cutoff:
                    expired.append(profile)
            except (ValueError, TypeError):
                continue

        return expired

    def purge_account(self, user_id: str) -> None:
        """Cascade delete all data for a user account.

        Cascade order:
        1. Consent record
        2. Session records (via GSI1)
        3. Sync queue items
        4. Download grants
        5. Profile tombstone
        """
        self._repo.purge_user_data(user_id)

    def complete_purge(self, user_id: str) -> None:
        """Mark the profile as purged with final tombstone."""
        self._repo.mark_as_purged(user_id)
