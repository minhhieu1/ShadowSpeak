"""Consent re-key service.

Migrates consent from a ``DEVICE#`` key pattern to a ``USER#`` key
pattern when a user signs in after completing consent pre-auth.
"""

import logging

from app.logging.audit import write_audit_log
from app.repositories.consent_repository import ConsentRepository

logger = logging.getLogger("shadowspeak.rekey")


class RekeyService:
    """Handles consent migration from device-level to user-level."""

    def __init__(self, repository: ConsentRepository):
        self.repository = repository

    def rekey_consent(self, device_id: str, user_id: str, request_id: str | None = None) -> None:
        """Migrate device consent to the user's account.

        If the user already has consent stored, the device consent is
        *not* overwritten (existing consent takes priority).  If there
        is no device consent, this is a no-op.
        """
        existing_user_consent = self.repository.get_consent(user_id)
        if existing_user_consent is not None:
            logger.info("User %s already has consent; skipping rekey", user_id)
            return

        device_consent = self.repository.get_device_consent(device_id)
        if device_consent is None:
            logger.info("No device consent for %s; skipping rekey", device_id)
            return

        self.repository.put_consent(
            user_id=user_id,
            ageVerified=device_consent.ageVerified,
            privacyAccepted=device_consent.privacyAccepted,
            adConsent=device_consent.adConsent,
            locale=device_consent.locale,
        )

        user_consent = self.repository.get_consent(user_id)
        self.repository.delete_device_consent(device_id)
        if user_consent is not None:
            write_audit_log(
                {
                    "eventType": "consent_rekey",
                    "actorScope": "user",
                    "userId": user_id,
                    "deviceId": device_id,
                    "ageVerified": user_consent.ageVerified,
                    "privacyAccepted": user_consent.privacyAccepted,
                    "adConsent": user_consent.adConsent,
                    "locale": user_consent.locale,
                    "requestId": request_id,
                    "timestamp": user_consent.consentUpdatedAt,
                }
            )
        logger.info(
            "Rekeyed consent from device %s to user %s", device_id, user_id
        )
