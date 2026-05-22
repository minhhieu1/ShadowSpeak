"""Consent service — business logic for consent management."""

from datetime import datetime, timezone

from fastapi import HTTPException

from app.core.errors import AppErrorCode, ERROR_STATUS_MAP
from app.logging.audit import write_audit_log
from app.models.auth import ConsentState
from app.repositories.consent_repository import ConsentRepository


VALID_AD_CONSENT_VALUES = {"unknown", "personalized", "non_personalized"}


class ConsentService:
    """Handles consent validation and persistence."""

    def __init__(self, repository: ConsentRepository):
        self.repository = repository

    # ------------------------------------------------------------------
    # User consent (authenticated)
    # ------------------------------------------------------------------

    def get_consent(self, user_id: str) -> ConsentState | None:
        return self.repository.get_consent(user_id)

    def save_consent(
        self,
        user_id: str,
        age_verified: bool,
        privacy_accepted: bool,
        ad_consent: str,
        locale: str | None,
        request_id: str | None = None,
    ) -> ConsentState:
        self._validate(age_verified, privacy_accepted, ad_consent)
        self.repository.put_consent(
            user_id=user_id,
            ageVerified=age_verified,
            privacyAccepted=privacy_accepted,
            adConsent=ad_consent,
            locale=locale,
        )
        result = self.repository.get_consent(user_id)
        assert result is not None  # just saved
        self._audit("consent_update", user_id, result, request_id)
        return result

    # ------------------------------------------------------------------
    # Device consent (pre-auth)
    # ------------------------------------------------------------------

    def get_device_consent(self, device_id: str) -> ConsentState | None:
        return self.repository.get_device_consent(device_id)

    def save_device_consent(
        self,
        device_id: str,
        age_verified: bool,
        privacy_accepted: bool,
        ad_consent: str,
        locale: str | None,
        request_id: str | None = None,
    ) -> ConsentState:
        self._validate(age_verified, privacy_accepted, ad_consent)
        self.repository.put_device_consent(
            device_id=device_id,
            ageVerified=age_verified,
            privacyAccepted=privacy_accepted,
            adConsent=ad_consent,
            locale=locale,
        )
        result = self.repository.get_device_consent(device_id)
        assert result is not None
        self._audit("consent_update", device_id, result, request_id, actor_scope="device")
        return result

    def delete_device_consent(self, device_id: str) -> None:
        self.repository.delete_device_consent(device_id)

    def get_or_create_device_consent(self, device_id: str, locale: str = "en-US") -> ConsentState:
        state = self.repository.get_device_consent(device_id)
        if state is not None:
            return state
        now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        return ConsentState(
            userId=device_id,
            ageVerified=False,
            privacyAccepted=False,
            adConsent="unknown",
            consentUpdatedAt=now,
            locale=locale,
        )

    # ------------------------------------------------------------------
    # Guard
    # ------------------------------------------------------------------

    def require_consent(self, user_id: str) -> ConsentState:
        """Return the consent state or raise 403 if consent is missing.

        A valid consent requires both ``age_verified`` and
        ``privacy_accepted`` to be ``True``.
        """
        state = self.get_consent(user_id)
        if not state or not state.ageVerified or not state.privacyAccepted:
            raise HTTPException(
                status_code=ERROR_STATUS_MAP[AppErrorCode.CONSENT_REQUIRED],
                detail={
                    "code": AppErrorCode.CONSENT_REQUIRED,
                    "message": "Consent is required to access this resource",
                },
            )
        return state

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    @staticmethod
    def _validate(age_verified: bool, privacy_accepted: bool, ad_consent: str) -> None:
        errors: list[dict] = []

        if not age_verified:
            errors.append(
                {
                    "field": "ageVerified",
                    "message": "Age must be verified (13+).",
                }
            )

        if not privacy_accepted:
            errors.append(
                {
                    "field": "privacyAccepted",
                    "message": "Privacy policy must be accepted.",
                }
            )

        if ad_consent not in VALID_AD_CONSENT_VALUES:
            errors.append(
                {
                    "field": "adConsent",
                    "message": f"adConsent must be one of: {', '.join(sorted(VALID_AD_CONSENT_VALUES))}.",
                }
            )

        if errors:
            raise HTTPException(
                status_code=ERROR_STATUS_MAP[AppErrorCode.VALIDATION_ERROR],
                detail={
                    "code": AppErrorCode.VALIDATION_ERROR,
                    "message": "Consent validation failed",
                    "details": errors,
                },
            )

    @staticmethod
    def _audit(
        event_type: str,
        user_id: str,
        state: ConsentState,
        request_id: str | None,
        actor_scope: str = "user",
    ) -> None:
        write_audit_log(
            {
                "eventType": event_type,
                "actorScope": actor_scope,
                "userId": user_id,
                "ageVerified": state.ageVerified,
                "privacyAccepted": state.privacyAccepted,
                "adConsent": state.adConsent,
                "locale": state.locale,
                "requestId": request_id,
                "timestamp": state.consentUpdatedAt,
            }
        )
