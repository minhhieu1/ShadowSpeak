"""Consent service for age gate and privacy consent management."""

from datetime import UTC, datetime

from app.core.errors import AppError
from app.logging.audit import ConsentAuditLog, write_audit_log
from app.models.auth import AdConsent, ConsentState, UpdateConsentInput
from app.repositories.consent_repository import ConsentRepository

VALID_AD_CONSENT_VALUES: set[str] = {"unknown", "personalized", "non_personalized"}


def _now_iso() -> str:
    return datetime.now(UTC).isoformat()


class ConsentService:
    """Business logic for consent management.

    Handles age gate validation, privacy consent, ad consent,
    and device-scoped pre-auth bootstrap records.
    """

    def __init__(self, repository: ConsentRepository) -> None:
        self._repository = repository

    def get_consent(
        self, user_id: str | None, device_id: str | None
    ) -> ConsentState:
        """Get current consent state.

        Returns existing consent record or a default (all-false) state.
        """
        consent = self._repository.get_consent(user_id, device_id)
        if consent is not None:
            return consent

        entity_id = user_id or device_id or "unknown"
        return ConsentState(
            userId=entity_id,
            ageVerified=False,
            privacyAccepted=False,
            adConsent="unknown",
            consentUpdatedAt=_now_iso(),
        )

    def save_consent(
        self,
        user_id: str | None,
        payload: UpdateConsentInput,
        device_id: str | None,
        locale: str | None = None,
    ) -> ConsentState:
        """Save consent state with validation.

        Validates:
        - Device ID is present when user_id is absent (pre-auth)
        - adConsent is one of the valid values
        """
        entity_id = user_id or device_id
        if entity_id is None:
            raise AppError(
                "VALIDATION_ERROR",
                "X-Device-Id is required before sign-in",
            )

        if payload.adConsent not in VALID_AD_CONSENT_VALUES:
            raise AppError(
                "VALIDATION_ERROR",
                f"Invalid adConsent value: {payload.adConsent}. "
                f"Must be one of: {', '.join(sorted(VALID_AD_CONSENT_VALUES))}",
            )

        consent = ConsentState(
            userId=entity_id,
            ageVerified=payload.ageVerified,
            privacyAccepted=payload.privacyAccepted,
            adConsent=payload.adConsent,
            consentUpdatedAt=_now_iso(),
            locale=locale,
        )

        self._repository.save_consent(consent)

        # Audit log
        write_audit_log(
            ConsentAuditLog(
                eventType="consent_update",
                userId=user_id,
                deviceId=device_id,
                ageVerified=payload.ageVerified,
                privacyAccepted=payload.privacyAccepted,
                adConsent=payload.adConsent,
                locale=locale,
                timestamp=consent.consentUpdatedAt,
            )
        )

        return consent

    def get_or_create_device_consent(self, device_id: str) -> ConsentState:
        """Read existing device consent or return default (all false)."""
        existing = self._repository.get_consent(None, device_id)
        if existing is not None:
            return existing
        return ConsentState(
            userId=device_id,
            ageVerified=False,
            privacyAccepted=False,
            adConsent="unknown",
            consentUpdatedAt=_now_iso(),
        )

    def has_given_consent(self, user_id: str) -> bool:
        """Check if user has completed consent (ageVerified + privacyAccepted)."""
        consent = self._repository.get_consent(user_id, None)
        if consent is None:
            return False
        return consent.ageVerified and consent.privacyAccepted
