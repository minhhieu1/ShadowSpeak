from fastapi import APIRouter, Depends, Query, Request, Response, status

from app.core.auth import AuthContext, get_auth_context
from app.core.envelope import JsonEnvelope, success
from app.models.common import PagedResult
from app.models.session import (
    CompleteSessionInput,
    PracticeSession,
    ProgressSnapshot,
    StartSessionInput,
    SyncBatch,
    SyncResult,
    UpdateSessionInput,
)
from app.repositories.memory import repository

router = APIRouter(tags=["sessions-progress"])


@router.get("/sessions/{session_id}", response_model=JsonEnvelope[PracticeSession])
def get_session(
    session_id: str,
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[PracticeSession]:
    return success(repository.get_session(auth.user_id, session_id), request)


@router.post(
    "/sessions",
    response_model=JsonEnvelope[PracticeSession],
    status_code=status.HTTP_201_CREATED,
)
def start_session(
    payload: StartSessionInput,
    request: Request,
    response: Response,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[PracticeSession]:
    response.status_code = status.HTTP_201_CREATED
    return success(repository.start_session(auth.user_id, payload.lessonId), request)


@router.patch("/sessions/{session_id}", response_model=JsonEnvelope[PracticeSession])
def update_session(
    session_id: str,
    payload: UpdateSessionInput,
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[PracticeSession]:
    return success(repository.update_session(auth.user_id, session_id, payload), request)


@router.post("/sessions/{session_id}/complete", response_model=JsonEnvelope[PracticeSession])
def complete_session(
    session_id: str,
    payload: CompleteSessionInput,
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[PracticeSession]:
    return success(repository.complete_session(auth.user_id, session_id, payload), request)


@router.get("/progress", response_model=JsonEnvelope[ProgressSnapshot])
def get_progress(
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[ProgressSnapshot]:
    return success(repository.get_progress(auth.user_id), request)


@router.get("/progress/history", response_model=JsonEnvelope[PagedResult[ProgressSnapshot]])
def get_progress_history(
    request: Request,
    cursor: str | None = None,
    limit: int = Query(default=20, ge=1, le=50),
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[PagedResult[ProgressSnapshot]]:
    _ = cursor
    return success(repository.get_progress_history(auth.user_id, limit), request)


@router.post("/progress/sync", response_model=JsonEnvelope[SyncResult])
def sync_progress(
    payload: SyncBatch,
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
) -> JsonEnvelope[SyncResult]:
    _ = auth
    return success(repository.sync_progress(payload), request)
