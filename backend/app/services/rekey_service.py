"""Consent re-key service.

Transfers consent from a device-scoped bootstrap record (DEVICE#<deviceId>#CONSENT)
to a user-scoped record (USER#<userId>#CONSENT) after Cognito sign-in.
"""

from datetime import UTC, datetime

from app.logging.audit import ConsentAuditLog, write_audit_log
from app.models.auth import ConsentState
from app.repositories.consent_repository import ConsentRepository


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


class RekeyService:
    """Service for re-keying consent from device scope to user scope."""

    def __init__(self, consent_repository: ConsentRepository) -> None:
        self._repo = consent_repository

    def rekey_consent(
        self,
        user_id: str,
        device_id: str,
        request_id: str | None = None,
    ) -> ConsentState | None:
        """Re-key device-scoped consent to user-scoped.

        Copies consent from DEVICE#<deviceId>#CONSENT to USER#<userId>#CONSENT.

        Idempotent: if USER# consent already exists, returns existing consent.
        If no DEVICE# bootstrap exists, returns None (no-op).

        After successful re-key, the DEVICE# bootstrap record is deleted.
        """
        # Check if user-scoped consent already exists
        if self._repo.user_consent_exists(user_id):
            existing = self._repo.get_consent(user_id, None)
            return existing

        # Find device-scoped bootstrap
        device_consent = self._repo.get_consent(None, device_id)
        if device_consent is None:
            return None

        # Create user-scoped consent from device consent
        user_consent = ConsentState(
            userId=user_id,
            ageVerified=device_consent.ageVerified,
            privacyAccepted=device_consent.privacyAccepted,
            adConsent=device_consent.adConsent,
            consentUpdatedAt=_now_iso(),
            locale=device_consent.locale,
        )

        self._repo.save_consent(user_consent)

        # Delete device bootstrap
        self._repo.delete_device_consent(device_id)

        # Audit log
        write_audit_log(
            ConsentAuditLog(
                eventType="consent_update",
                userId=user_id,
                deviceId=device_id,
                ageVerified=user_consent.ageVerified,
                privacyAccepted=user_consent.privacyAccepted,
                adConsent=user_consent.adConsent,
                locale=user_consent.locale,
                timestamp=user_consent.consentUpdatedAt,
                requestId=request_id,
            )
        )

        return user_consent
