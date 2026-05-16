from fastapi import APIRouter, Depends, Header, Request, Response, status

from app.core.auth import AuthContext, get_auth_context
from app.core.envelope import JsonEnvelope, success
from app.models.auth import (
    ConsentState,
    DeleteAccountResult,
    UpdateConsentInput,
    UpdateProfileInput,
    UserProfile,
)
from app.repositories.memory import repository

router = APIRouter(tags=["auth-profile-consent"])


@router.get("/me", response_model=JsonEnvelope[UserProfile])
def get_me(
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[UserProfile]:
    return success(repository.get_profile(auth.user_id), request)


@router.put("/me", response_model=JsonEnvelope[UserProfile])
def update_me(
    payload: UpdateProfileInput,
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[UserProfile]:
    return success(repository.update_profile(auth.user_id, payload), request)


@router.get("/consent", response_model=JsonEnvelope[ConsentState])
def get_consent(
    request: Request,
    authorization: str | None = Header(default=None),
    x_device_id: str | None = Header(default=None, alias="X-Device-Id"),
) -> JsonEnvelope[ConsentState]:
    user_id = None
    if authorization and authorization.lower().startswith("bearer "):
        user_id = authorization.split(" ", 1)[1].strip() or None
    return success(repository.get_consent(user_id, x_device_id), request)


@router.put("/consent", response_model=JsonEnvelope[ConsentState])
def update_consent(
    payload: UpdateConsentInput,
    request: Request,
    authorization: str | None = Header(default=None),
    x_device_id: str | None = Header(default=None, alias="X-Device-Id"),
) -> JsonEnvelope[ConsentState]:
    user_id = None
    if authorization and authorization.lower().startswith("bearer "):
        user_id = authorization.split(" ", 1)[1].strip() or None
    return success(repository.update_consent(payload, user_id, x_device_id), request)


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
    return success(repository.delete_account(auth.user_id), request)
