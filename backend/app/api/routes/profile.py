"""Profile and consent routes."""

import re

from pydantic import BaseModel
from fastapi import APIRouter, Depends, Header, Request

from app.core.deps import get_auth_context, get_optional_auth_context
from app.core.envelope import JsonEnvelope, success
from app.core.errors import AppErrorCode, to_http_exception
from app.models.auth import AuthContext, ConsentState, DeleteAccountResult, UpdateConsentInput, UpdateOnboardingStepInput, UserProfile, UpdateProfileInput
from app.repositories.consent_repository import ConsentRepository
from app.repositories.dynamodb import get_table
from app.repositories.profile_repository import ProfileRepository
from app.services.consent_service import ConsentService
from app.services.profile_service import ProfileService
from app.services.rekey_service import RekeyService
from app.core.config import Settings, get_settings

router = APIRouter()
_DEVICE_ID_RE = re.compile(r"^[a-zA-Z0-9\-_]{1,128}$")


class DeleteAccountEnvelope(JsonEnvelope[DeleteAccountResult]):
    pass


def _get_consent_service(request: Request) -> ConsentService:
    settings: Settings = getattr(request.app.state, "settings", None) or get_settings()
    table = get_table(settings)
    repo = ConsentRepository(table)
    return ConsentService(repo)


def _get_profile_service(
    request: Request,
    consent_service: ConsentService = Depends(_get_consent_service),
) -> ProfileService:
    settings: Settings = getattr(request.app.state, "settings", None) or get_settings()
    table = get_table(settings)
    repo = ProfileRepository(table)
    consent_repo = ConsentRepository(table)
    rekey_svc = RekeyService(consent_repo)
    return ProfileService(repo, consent_service, rekey_svc)


@router.get("/consent")
async def get_consent(
    request: Request,
    x_device_id: str | None = Header(None),
    auth: AuthContext | None = Depends(get_optional_auth_context),
    consent_service: ConsentService = Depends(_get_consent_service),
) -> JsonEnvelope[ConsentState]:
    """Return the current consent state.

    Priority:
    1. Authenticated user → ``USER#`` consent
    2. Device ID → ``DEVICE#`` consent (returns defaults when no record exists)
    """
    request_id = getattr(request.state, "request_id", "")
    if auth:
        state = consent_service.get_consent(auth.userId)
    else:
        device_id = _require_valid_device_id(x_device_id)
        state = consent_service.get_or_create_device_consent(device_id)

    return success(state, request_id)


@router.put("/consent")
async def put_consent(
    request: Request,
    body: UpdateConsentInput,
    x_device_id: str | None = Header(None),
    accept_language: str | None = Header(None),
    auth: AuthContext | None = Depends(get_optional_auth_context),
    consent_service: ConsentService = Depends(_get_consent_service),
) -> JsonEnvelope[ConsentState]:
    """Save consent state.

    Priority:
    1. Authenticated user → ``USER#`` consent
    2. Device ID → ``DEVICE#`` consent
    """
    request_id = getattr(request.state, "request_id", "")
    locale = _parse_locale(accept_language)

    if auth:
        state = consent_service.save_consent(
            user_id=auth.userId,
            age_verified=body.ageVerified,
            privacy_accepted=body.privacyAccepted,
            ad_consent=body.adConsent,
            locale=locale,
            request_id=request_id,
        )
    else:
        device_id = _require_valid_device_id(x_device_id)
        state = consent_service.save_device_consent(
            device_id=device_id,
            age_verified=body.ageVerified,
            privacy_accepted=body.privacyAccepted,
            ad_consent=body.adConsent,
            locale=locale,
            request_id=request_id,
        )

    return success(state, request_id)


@router.get("/me")
async def get_profile_endpoint(
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
    x_device_id: str | None = Header(None),
    profile_service: ProfileService = Depends(_get_profile_service),
) -> JsonEnvelope[UserProfile | None]:
    """Return the authenticated user's profile (requires consent)."""
    request_id = getattr(request.state, "request_id", "")
    device_id = _require_valid_device_id(x_device_id) if x_device_id is not None else None
    profile = profile_service.get_profile_with_rekey(auth.userId, device_id, request_id=request_id)
    return success(profile, request_id)


@router.put("/me")
async def put_profile_endpoint(
    request: Request,
    body: UpdateProfileInput,
    auth: AuthContext = Depends(get_auth_context),
    x_device_id: str | None = Header(None),
    profile_service: ProfileService = Depends(_get_profile_service),
) -> JsonEnvelope[UserProfile]:
    """Update the authenticated user's profile (requires consent)."""
    request_id = getattr(request.state, "request_id", "")
    device_id = _require_valid_device_id(x_device_id) if x_device_id is not None else None
    profile_service.ensure_consent_with_rekey(auth.userId, device_id, request_id=request_id)
    profile = profile_service.update_profile(auth.userId, body)
    return success(profile, request_id)


@router.put("/me/onboarding-step")
async def put_onboarding_step_endpoint(
    request: Request,
    body: UpdateOnboardingStepInput,
    auth: AuthContext = Depends(get_auth_context),
    profile_service: ProfileService = Depends(_get_profile_service),
) -> JsonEnvelope[UserProfile]:
    request_id = getattr(request.state, "request_id", "")
    profile = profile_service.update_onboarding_step(auth.userId, body.step)
    return success(profile, request_id)


@router.delete("/account", status_code=202)
async def delete_account_endpoint(
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
    profile_service: ProfileService = Depends(_get_profile_service),
) -> JsonEnvelope[DeleteAccountResult]:
    """Soft-delete the authenticated user's account (requires consent)."""
    request_id = getattr(request.state, "request_id", "")
    result = profile_service.delete_account(auth.userId)
    return success(result, request_id)


def _parse_locale(accept_language: str | None) -> str | None:
    """Extract the primary locale from Accept-Language header."""
    if not accept_language:
        return "en-US"
    # "en-US,en;q=0.9" → "en-US"
    return accept_language.split(",")[0].strip()


def _require_valid_device_id(device_id: str | None) -> str:
    if not device_id:
        raise to_http_exception(
            AppErrorCode.VALIDATION_ERROR,
            "X-Device-Id header is required for unauthenticated consent access",
            details={"field": "X-Device-Id"},
        )
    if not _DEVICE_ID_RE.match(device_id):
        raise to_http_exception(
            AppErrorCode.VALIDATION_ERROR,
            "X-Device-Id must be 1-128 chars of letters, numbers, dash, or underscore",
            details={"field": "X-Device-Id"},
        )
    return device_id
