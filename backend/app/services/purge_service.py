"""Purge service — async job to soft-delete expired accounts.

Scheduled to run periodically (e.g. via Lambda cron trigger).
Permanently removes consent records and marks profiles as purged
after the 30-day grace period expires.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import boto3

from app.models.auth import UserProfile
from app.repositories.consent_repository import ConsentRepository
from app.repositories.profile_repository import ProfileRepository
from app.repositories.purge_repository import PurgeRepository

logger = logging.getLogger("shadowspeak.purge")

_ID_REGEX_STR = r"^[a-zA-Z0-9\-_]+$"
_ID_MAX_LENGTH = 128

import re
_id_pattern = re.compile(_ID_REGEX_STR)


def _validate_id(id_value: str, label: str) -> None:
    if not _id_pattern.match(id_value):
        raise ValueError(f"Invalid {label}: must match {_ID_REGEX_STR}")
    if len(id_value) > _ID_MAX_LENGTH:
        raise ValueError(f"{label} too long (max {_ID_MAX_LENGTH} chars)")


_MAX_RETRIES = 3
_BACKOFF_BASE = 0.1


class PurgeService:
    """Find expired deletion requests and purge account data."""

    def __init__(
        self,
        consent_repository: ConsentRepository,
        profile_repository: ProfileRepository,
        table: Any,
    ):
        self.consent_repository = consent_repository
        self.profile_repository = profile_repository
        self.purge_repository = PurgeRepository(table)
        self.table = table

    def find_expired_deletions(self) -> list[UserProfile]:
        """Return profiles past the 30-day grace period.

        Handles DynamoDB pagination internally — pages through all results
        so that datasets larger than 1 MB are not silently truncated.
        Only reads the fields needed for identification and purge scheduling.
        """
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        cutoff = thirty_days_ago.isoformat().replace("+00:00", "Z")

        condition = (
            boto3.dynamodb.conditions.Attr("entityType").eq("profile")
            & boto3.dynamodb.conditions.Attr("deletionStatus").eq("deletion_requested")
            & boto3.dynamodb.conditions.Attr("deletionRequestedAt").lt(cutoff)
        )

        results = []
        last_key = None

        while True:
            kwargs: dict[str, Any] = {
                "FilterExpression": condition,
                "ProjectionExpression": "pk, deletionRequestedAt, deletionStatus, createdAt, updatedAt",
            }
            if last_key:
                kwargs["ExclusiveStartKey"] = last_key

            try:
                response = self.table.scan(**kwargs)
            except Exception:
                logger.exception("DynamoDB scan failed during find_expired_deletions")
                raise

            for item in response.get("Items", []):
                pk = item.get("pk", "")
                if pk.startswith("USER#"):
                    user_id = pk[5:]
                    results.append(UserProfile(
                        userId=user_id,
                        deletionRequestedAt=item.get("deletionRequestedAt"),
                        deletionStatus=item.get("deletionStatus"),
                        createdAt=item.get("createdAt", ""),
                        updatedAt=item.get("updatedAt", ""),
                    ))

            last_key = response.get("LastEvaluatedKey")
            if not last_key:
                break

        return results

    def purge_account(self, user_id: str) -> None:
        """Delete consent record and mark profile as purged.

        Guards against accidental misuse by verifying the account is
        eligible (exists and in ``deletion_requested`` status) before
        performing destructive operations.
        """
        _validate_id(user_id, "user_id")

        profile = self.profile_repository.get_profile(user_id)
        if profile is None:
            logger.warning("Purge skipped: user %s not found", user_id)
            return
        if profile.deletionStatus != "deletion_requested":
            logger.warning(
                "Purge skipped: user %s has status %s, expected deletion_requested",
                user_id,
                profile.deletionStatus,
            )
            return

        try:
            self.purge_repository.delete_consent(user_id)
            self.purge_repository.delete_session_items(user_id)
            self.purge_repository.delete_items_with_sk_prefixes(
                user_id,
                prefixes=["MUTATION#", "DOWNLOAD#"],
            )
        except Exception:
            logger.exception("Failed to purge some items for user %s", user_id)

        now = datetime.now(timezone.utc)
        ttl = int((now + timedelta(days=30)).timestamp())
        now_iso = now.isoformat().replace("+00:00", "Z")

        self.table.update_item(
            Key={"pk": f"USER#{user_id}", "sk": "PROFILE"},
            UpdateExpression="SET deletionStatus = :ds, updatedAt = :ua, ttlEpoch = :ttl",
            ExpressionAttributeValues={
                ":ds": "purged",
                ":ua": now_iso,
                ":ttl": ttl,
            },
        )
        logger.info("Purged account %s", user_id)
