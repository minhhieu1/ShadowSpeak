from fastapi import APIRouter, Depends, Query, Request

from app.core.auth import AuthContext, get_auth_context
from app.core.envelope import JsonEnvelope, success
from app.core.errors import AppError
from app.models.common import PagedResult
from app.models.content import (
    DownloadUrlRequest,
    DownloadUrlResponse,
    Lesson,
    LessonFilter,
    VerificationResponse,
    VerifyRequest,
)
from app.repositories.memory import repository

router = APIRouter(tags=["content-downloads"])


@router.get("/lessons", response_model=JsonEnvelope[PagedResult[Lesson]])
def list_lessons(
    request: Request,
    level: str | None = None,
    topic: str | None = None,
    duration_min: int | None = Query(default=None, alias="durationMin", ge=0),
    duration_max: int | None = Query(default=None, alias="durationMax", ge=0),
    cursor: str | None = None,
    limit: int = Query(default=20, ge=1, le=50),
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[PagedResult[Lesson]]:
    _ = auth
    if duration_min is not None and duration_max is not None and duration_min > duration_max:
        raise AppError("VALIDATION_ERROR", "durationMin must be less than or equal to durationMax")
    lesson_filter = LessonFilter(
        level=level,
        topic=topic,
        durationMin=duration_min,
        durationMax=duration_max,
        cursor=cursor,
        limit=limit,
    )
    return success(repository.list_lessons(lesson_filter), request)


@router.get("/lessons/{lesson_id}", response_model=JsonEnvelope[Lesson])
def get_lesson(
    lesson_id: str,
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[Lesson]:
    _ = auth
    return success(repository.get_lesson(lesson_id), request)


@router.get("/home/recommendation", response_model=JsonEnvelope[Lesson])
def get_home_recommendation(
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[Lesson]:
    profile = repository.get_profile(auth.user_id)
    return success(repository.get_recommendation(profile.level), request)


@router.post("/downloads/{lesson_id}/url", response_model=JsonEnvelope[DownloadUrlResponse])
def create_download_url(
    lesson_id: str,
    payload: DownloadUrlRequest,
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[DownloadUrlResponse]:
    _ = auth
    return success(repository.create_download_url(lesson_id, payload.assetType), request)


@router.post("/downloads/{lesson_id}/verify", response_model=JsonEnvelope[VerificationResponse])
def verify_download(
    lesson_id: str,
    payload: VerifyRequest,
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[VerificationResponse]:
    _ = auth
    return success(repository.verify_download(lesson_id, payload.assetType), request)
