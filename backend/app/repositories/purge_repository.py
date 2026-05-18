"""Purge repository for account cascade deletion via DynamoDB."""

from datetime import UTC, datetime

from app.db.dynamodb import get_table
from app.models.auth import UserProfile

_PROFILE_SK = "PROFILE"
_CONSENT_SK = "CONSENT"


def _user_pk(user_id: str) -> str:
    return f"USER#{user_id}"


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


class PurgeRepository:
    """Repository for purge/cascade-delete operations via DynamoDB."""

    @property
    def _table(self):
        return get_table()

    def find_profiles_with_deletion_requested(
        self,
    ) -> list[UserProfile]:
        items = self._table.scan(
            filter_expression="deletionStatus = :ds AND SK = :sk",
            expr_attr_values={
                ":ds": {"S": "deletion_requested"},
                ":sk": {"S": _PROFILE_SK},
            },
        )
        return [UserProfile(**item) for item in items]

    def purge_user_data(self, user_id: str) -> None:
        pk = _user_pk(user_id)
        items = self._table.query(pk)
        keys = [(pk, item.get("SK", "")) for item in items]
        if keys:
            # Add the profile SK if not already present
            all_keys = {(pk, _PROFILE_SK), (pk, _CONSENT_SK)} | {
                (pk, sk) for _, sk in keys
            }
            self._table.batch_delete(list(all_keys))

    def mark_as_purged(self, user_id: str) -> None:
        self._table.update_item_attributes(
            _user_pk(user_id),
            _PROFILE_SK,
            {"deletionStatus": "purged", "updatedAt": _now_iso()},
        )

    def register_profile(self, profile: UserProfile) -> None:
        data = profile.model_dump()
        self._table.put_item(data, _user_pk(profile.userId), _PROFILE_SK)
