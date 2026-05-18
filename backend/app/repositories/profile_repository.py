"""Profile repository for DynamoDB access.

Single-table design:
  PK=USER#<userId>  SK=PROFILE
"""

from datetime import UTC, datetime

from app.db.dynamodb import get_table
from app.models.auth import UserProfile

_PROFILE_SK = "PROFILE"


def _user_pk(user_id: str) -> str:
    return f"USER#{user_id}"


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


class ProfileRepository:
    """Repository for user profiles stored in DynamoDB."""

    @property
    def _table(self):
        return get_table()

    def get_profile(self, user_id: str) -> UserProfile | None:
        item = self._table.get_item(_user_pk(user_id), _PROFILE_SK)
        if item is None:
            return None
        return UserProfile(**item)

    def save_profile(self, profile: UserProfile) -> UserProfile:
        data = profile.model_dump()
        self._table.put_item(data, _user_pk(profile.userId), _PROFILE_SK)
        return profile

    def mark_deletion_requested(
        self, user_id: str, requested_at: str
    ) -> UserProfile:
        existing = self.get_profile(user_id)
        if existing is None:
            profile = UserProfile(
                userId=user_id,
                createdAt=_now_iso(),
                updatedAt=requested_at,
                deletionRequestedAt=requested_at,
                deletionStatus="deletion_requested",
            )
            self.save_profile(profile)
            return profile

        profile = existing.model_copy(
            update={
                "deletionRequestedAt": requested_at,
                "deletionStatus": "deletion_requested",
                "updatedAt": requested_at,
            }
        )
        self._table.put_item(profile.model_dump(), _user_pk(user_id), _PROFILE_SK)
        return profile
