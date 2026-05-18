"""Consent repository for DynamoDB access.

Single-table design:
  User consent:  PK=USER#<userId>     SK=CONSENT
  Device consent: PK=DEVICE#<deviceId> SK=CONSENT
"""

from app.db.dynamodb import get_table
from app.models.auth import ConsentState

_USER_CONSENT_SK = "CONSENT"
_DEVICE_CONSENT_SK = "CONSENT"


def _user_pk(user_id: str) -> str:
    return f"USER#{user_id}"


def _device_pk(device_id: str) -> str:
    return f"DEVICE#{device_id}"


class ConsentRepository:
    """Repository for consent state stored in DynamoDB."""

    @property
    def _table(self):
        return get_table()

    def get_consent(
        self, user_id: str | None, device_id: str | None
    ) -> ConsentState | None:
        if user_id:
            item = self._table.get_item(_user_pk(user_id), _USER_CONSENT_SK)
        elif device_id:
            item = self._table.get_item(_device_pk(device_id), _DEVICE_CONSENT_SK)
        else:
            return None

        if item is None:
            return None
        return ConsentState(**item)

    def save_consent(self, consent: ConsentState) -> ConsentState:
        data = consent.model_dump()
        if consent.userId.startswith("device-") or consent.userId.startswith("DEVICE#"):
            pk = _device_pk(consent.userId)
        else:
            pk = _user_pk(consent.userId)
        self._table.put_item(data, pk, _USER_CONSENT_SK)
        return consent

    def delete_device_consent(self, device_id: str) -> None:
        self._table.delete_item(_device_pk(device_id), _DEVICE_CONSENT_SK)

    def user_consent_exists(self, user_id: str) -> bool:
        item = self._table.get_item(_user_pk(user_id), _USER_CONSENT_SK)
        return item is not None
