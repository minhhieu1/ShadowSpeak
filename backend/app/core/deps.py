"""FastAPI dependency injection for auth, consent, and shared state."""

from fastapi import Depends, Header, Request

from app.core.auth import AuthContext, get_auth_context
from app.core.errors import AppError
from app.repositories.consent_repository import ConsentRepository
from app.services.consent_service import ConsentService

# Shared instances (singletons for MVP)
_consent_repo = ConsentRepository()


def get_consent_service() -> ConsentService:
    return ConsentService(_consent_repo)


def get_consent_repository() -> ConsentRepository:
    return _consent_repo


def require_consent(
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> None:
    """FastAPI dependency that checks consent before allowing access.

    Used on authenticated endpoints (GET /me, PUT /me) to ensure
    the user has completed consent before accessing profile data.

    Returns 403 CONSENT_REQUIRED if consent is not given.
    """
    consent_service = get_consent_service()
    user_id = auth.user_id

    has_consent = consent_service.has_given_consent(user_id)
    if not has_consent:
        raise AppError(
            "CONSENT_REQUIRED",
            "Age verification and privacy acceptance are required",
        )
