from fastapi import APIRouter, Depends, Header, Request, Response, status

from app.core.auth import AuthContext, get_auth_context, get_optional_auth_context
from app.core.deps import get_consent_service, get_consent_repository, require_consent
from app.core.envelope import JsonEnvelope, success
from app.core.errors import AppError
from app.models.auth import (
    ConsentState,
    DeleteAccountResult,
    UpdateConsentInput,
    UpdateProfileInput,
    UserProfile,
)
from app.repositories.consent_repository import ConsentRepository
from app.repositories.profile_repository import ProfileRepository
from app.services.consent_service import ConsentService
from app.services.profile_service import ProfileService
from app.services.rekey_service import RekeyService

router = APIRouter(tags=["auth-profile-consent"])

# Shared instances (singletons for MVP)
_profile_repo = ProfileRepository()
_consent_repo = get_consent_repository()
_rekey_service = RekeyService(_consent_repo)
_profile_service = ProfileService(_profile_repo, _consent_repo, _rekey_service)


@router.get("/me", response_model=JsonEnvelope[UserProfile])
def get_me(
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
    _: None = Depends(require_consent),
    x_device_id: str | None = Header(default=None, alias="X-Device-Id"),
) -> JsonEnvelope[UserProfile]:
    return success(_profile_service.get_profile(auth.user_id, x_device_id), request)


@router.put("/me", response_model=JsonEnvelope[UserProfile])
def update_me(
    payload: UpdateProfileInput,
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
    _: None = Depends(require_consent),
    x_device_id: str | None = Header(default=None, alias="X-Device-Id"),
) -> JsonEnvelope[UserProfile]:
    return success(_profile_service.update_profile(auth.user_id, payload), request)


@router.get("/consent", response_model=JsonEnvelope[ConsentState])
def get_consent(
    request: Request,
    auth: AuthContext | None = Depends(get_optional_auth_context),
    x_device_id: str | None = Header(default=None, alias="X-Device-Id"),
) -> JsonEnvelope[ConsentState]:
    consent_service = get_consent_service()
    user_id = auth.user_id if auth else None

    if not user_id and not x_device_id:
        raise AppError("VALIDATION_ERROR", "X-Device-Id is required before sign-in")

    return success(consent_service.get_consent(user_id, x_device_id), request)


@router.put("/consent", response_model=JsonEnvelope[ConsentState])
def update_consent(
    payload: UpdateConsentInput,
    request: Request,
    auth: AuthContext | None = Depends(get_optional_auth_context),
    x_device_id: str | None = Header(default=None, alias="X-Device-Id"),
    accept_language: str | None = Header(default=None),
) -> JsonEnvelope[ConsentState]:
    consent_service = get_consent_service()
    user_id = auth.user_id if auth else None

    if not user_id and not x_device_id:
        raise AppError("VALIDATION_ERROR", "X-Device-Id is required before sign-in")

    locale = None
    if accept_language:
        locale = accept_language.split(",")[0].strip()

    result = consent_service.save_consent(user_id, payload, x_device_id, locale=locale)
    return success(result, request)


@router.put("/me/onboarding-step", response_model=JsonEnvelope[UserProfile])
def update_onboarding_step(
    payload: dict,
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[UserProfile]:
    step = payload.get("step")
    if not step:
        raise AppError("VALIDATION_ERROR", "step field is required")

    return success(
        _profile_service.update_onboarding_step(auth.user_id, step), request
    )


@router.delete(
    "/account",
    response_model=JsonEnvelope[DeleteAccountResult],
    status_code=status.HTTP_202_ACCEPTED,
)
def delete_account(
    request: Request,
    response: Response,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[DeleteAccountResult]:
    response.status_code = status.HTTP_202_ACCEPTED
    return success(_profile_service.delete_account(auth.user_id), request)
