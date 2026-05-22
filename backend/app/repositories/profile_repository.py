"""Profile repository — DynamoDB access for user profiles."""

import re
from datetime import datetime, timezone

from app.models.auth import UserProfile

_ID_REGEX_STR = r"^[a-zA-Z0-9\-_]+$"
_ID_MAX_LENGTH = 128
_id_pattern = re.compile(_ID_REGEX_STR)


def _validate_id(id_value: str, label: str) -> None:
    if not _id_pattern.match(id_value):
        raise ValueError(f"Invalid {label}: must match {_ID_REGEX_STR}")
    if len(id_value) > _ID_MAX_LENGTH:
        raise ValueError(f"{label} too long (max {_ID_MAX_LENGTH} chars)")


class ProfileRepository:
    """Read and write user profiles from DynamoDB."""

    def __init__(self, table):
        self.table = table

    def get_profile(self, user_id: str) -> UserProfile | None:
        """Return the profile for *user_id*, or ``None``."""
        _validate_id(user_id, "user_id")
        key = {"pk": f"USER#{user_id}", "sk": "PROFILE"}
        item = self.table.get_item(Key=key).get("Item")
        if not item:
            return None
        return UserProfile(
            userId=user_id,
            displayName=item.get("displayName"),
            email=item.get("email"),
            level=item.get("level"),
            reminderTime=item.get("reminderTime"),
            deletionRequestedAt=item.get("deletionRequestedAt"),
            deletionStatus=item.get("deletionStatus"),
            onboardingStep=item.get("onboardingStep"),
            createdAt=item["createdAt"],
            updatedAt=item["updatedAt"],
        )

    def put_profile(self, profile: UserProfile) -> None:
        """Store a full profile record."""
        _validate_id(profile.userId, "user_id")
        item = {
            "pk": f"USER#{profile.userId}",
            "sk": "PROFILE",
            "entityType": "profile",
            "createdAt": profile.createdAt,
            "updatedAt": profile.updatedAt,
        }
        if profile.displayName is not None:
            item["displayName"] = profile.displayName
        if profile.email is not None:
            item["email"] = profile.email
        if profile.level is not None:
            item["level"] = profile.level
        if profile.reminderTime is not None:
            item["reminderTime"] = profile.reminderTime
        if profile.deletionRequestedAt is not None:
            item["deletionRequestedAt"] = profile.deletionRequestedAt
        if profile.deletionStatus is not None:
            item["deletionStatus"] = profile.deletionStatus
        if profile.onboardingStep is not None:
            item["onboardingStep"] = profile.onboardingStep
        self.table.put_item(Item=item)

    def update_profile(
        self,
        user_id: str,
        displayName: str | None,
        level: str | None,
        reminderTime: str | None,
        onboardingStep: str | None = None,
    ) -> UserProfile | None:
        """Partially update a profile.

        Only the provided fields are updated. ``None`` means *do not
        update*. Returns the updated profile or ``None`` if not found.
        """
        _validate_id(user_id, "user_id")
        existing = self.get_profile(user_id)
        if not existing:
            return None

        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        # Build update expression dynamically
        update_expr_parts = ["SET updatedAt = :now"]
        expr_attr_values = {":now": now}
        expr_attr_names = {}

        if displayName is not None:
            update_expr_parts.append("#dn = :dn")
            expr_attr_values[":dn"] = displayName
            expr_attr_names["#dn"] = "displayName"

        if level is not None:
            update_expr_parts.append("#lv = :lv")
            expr_attr_values[":lv"] = level
            expr_attr_names["#lv"] = "level"

        if reminderTime is not None:
            update_expr_parts.append("#rt = :rt")
            expr_attr_values[":rt"] = reminderTime
            expr_attr_names["#rt"] = "reminderTime"

        if onboardingStep is not None:
            update_expr_parts.append("#os = :os")
            expr_attr_values[":os"] = onboardingStep
            expr_attr_names["#os"] = "onboardingStep"

        update_expression = ", ".join(update_expr_parts)

        self.table.update_item(
            Key={"pk": f"USER#{user_id}", "sk": "PROFILE"},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expr_attr_values,
            ExpressionAttributeNames=expr_attr_names if expr_attr_names else {},
        )

        return self.get_profile(user_id)

    def update_onboarding_step(self, user_id: str, onboarding_step: str) -> UserProfile | None:
        _validate_id(user_id, "user_id")
        existing = self.get_profile(user_id)
        if not existing:
            return None

        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        self.table.update_item(
            Key={"pk": f"USER#{user_id}", "sk": "PROFILE"},
            UpdateExpression="SET updatedAt = :now, onboardingStep = :step",
            ExpressionAttributeValues={
                ":now": now,
                ":step": onboarding_step,
            },
        )
        return self.get_profile(user_id)

    def mark_deletion_requested(self, user_id: str, requested_at: str) -> UserProfile | None:
        _validate_id(user_id, "user_id")
        existing = self.get_profile(user_id)
        if not existing:
            return None

        self.table.update_item(
            Key={"pk": f"USER#{user_id}", "sk": "PROFILE"},
            UpdateExpression="SET deletionStatus = :status, deletionRequestedAt = :requested_at, updatedAt = :updated_at",
            ExpressionAttributeValues={
                ":status": "deletion_requested",
                ":requested_at": requested_at,
                ":updated_at": requested_at,
            },
        )
        return self.get_profile(user_id)
