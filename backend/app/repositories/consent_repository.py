"""Consent repository — DynamoDB access for consent state.

Supports both authenticated (``USER#``) and pre-auth (``DEVICE#``) key
patterns in the single-table design.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from app.models.auth import ConsentState

_ID_REGEX_STR = r"^[a-zA-Z0-9\-_]+$"
_ID_MAX_LENGTH = 128

import re
_id_pattern = re.compile(_ID_REGEX_STR)


def _validate_id(id_value: str, label: str) -> None:
    if not _id_pattern.match(id_value):
        raise ValueError(f"Invalid {label}: must match {_ID_REGEX_STR}")
    if len(id_value) > _ID_MAX_LENGTH:
        raise ValueError(f"{label} too long (max {_ID_MAX_LENGTH} chars)")


class ConsentRepository:
    """Read and write consent state from DynamoDB."""

    def __init__(self, table):
        self.table = table

    # ------------------------------------------------------------------
    # User consent (authenticated)
    # ------------------------------------------------------------------

    def get_consent(self, user_id: str) -> Optional[ConsentState]:
        """Return the consent state for *user_id*, or ``None``."""
        _validate_id(user_id, "user_id")
        key = {"pk": f"USER#{user_id}", "sk": "CONSENT"}
        item = self.table.get_item(Key=key).get("Item")
        if not item:
            return None
        return ConsentState(
            userId=user_id,
            ageVerified=item["ageVerified"],
            privacyAccepted=item["privacyAccepted"],
            adConsent=item["adConsent"],
            consentUpdatedAt=item["consentUpdatedAt"],
            locale=item.get("locale"),
        )

    def put_consent(
        self,
        user_id: str,
        ageVerified: bool,
        privacyAccepted: bool,
        adConsent: str,
        locale: str | None,
    ) -> None:
        """Store or update the consent state for *user_id*."""
        _validate_id(user_id, "user_id")
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        item = {
            "pk": f"USER#{user_id}",
            "sk": "CONSENT",
            "entityType": "consent",
            "ageVerified": ageVerified,
            "privacyAccepted": privacyAccepted,
            "adConsent": adConsent,
            "consentUpdatedAt": now,
        }
        if locale is not None:
            item["locale"] = locale
        self.table.put_item(Item=item)

    # ------------------------------------------------------------------
    # Device consent (pre-auth)
    # ------------------------------------------------------------------

    def get_device_consent(self, device_id: str) -> Optional[ConsentState]:
        """Return the consent state stored against a device ID."""
        _validate_id(device_id, "device_id")
        key = {"pk": f"DEVICE#{device_id}", "sk": "CONSENT"}
        item = self.table.get_item(Key=key).get("Item")
        if not item:
            return None
        return ConsentState(
            userId=device_id,
            ageVerified=item["ageVerified"],
            privacyAccepted=item["privacyAccepted"],
            adConsent=item["adConsent"],
            consentUpdatedAt=item["consentUpdatedAt"],
            locale=item.get("locale"),
        )

    def put_device_consent(
        self,
        device_id: str,
        ageVerified: bool,
        privacyAccepted: bool,
        adConsent: str,
        locale: str | None,
    ) -> None:
        """Store consent against a device with a 24-hour TTL."""
        _validate_id(device_id, "device_id")
        now = datetime.now(timezone.utc)
        ttl = int((now + timedelta(hours=24)).timestamp())
        item = {
            "pk": f"DEVICE#{device_id}",
            "sk": "CONSENT",
            "entityType": "consent",
            "ageVerified": ageVerified,
            "privacyAccepted": privacyAccepted,
            "adConsent": adConsent,
            "consentUpdatedAt": now.isoformat().replace("+00:00", "Z"),
            "ttlEpoch": ttl,
        }
        if locale is not None:
            item["locale"] = locale
        self.table.put_item(Item=item)

    def delete_device_consent(self, device_id: str) -> None:
        """Remove the device-level consent record."""
        _validate_id(device_id, "device_id")
        self.table.delete_item(Key={"pk": f"DEVICE#{device_id}", "sk": "CONSENT"})
