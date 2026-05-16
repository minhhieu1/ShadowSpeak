from typing import Any, Literal

from pydantic import BaseModel, Field

SessionStatus = Literal["created", "active", "paused", "completed", "synced"]
SyncStatus = Literal["pending", "processing", "failed", "synced"]
SyncType = Literal["session_complete", "progress_update"]


class PracticeSession(BaseModel):
    sessionId: str
    userId: str
    lessonId: str
    status: SessionStatus
    startedAt: str
    expiresAt: str | None = None
    completedAt: str | None = None
    completionPercent: int | None = Field(default=None, ge=0, le=100)
    recordingLocalUri: str | None = None
    clientMutationId: str | None = None


class ProgressSnapshot(BaseModel):
    userId: str
    lessonId: str | None = None
    streakDays: int = 0
    minutesPracticed: int = 0
    lastPracticedAt: str | None = None
    completedLessonCount: int = 0
    updatedAt: str


class SyncQueueItemInput(BaseModel):
    id: str
    type: SyncType
    payload: dict[str, Any]
    clientMutationId: str = Field(min_length=1)


class StartSessionInput(BaseModel):
    lessonId: str


class UpdateSessionInput(BaseModel):
    status: Literal["active", "paused"] | None = None
    completionPercent: int | None = Field(default=None, ge=0, le=100)
    recordingLocalUri: str | None = None


class CompleteSessionInput(BaseModel):
    completionPercent: int = Field(ge=0, le=100)
    durationSeconds: int = Field(gt=0)
    recordingLocalUri: str | None = None
    clientMutationId: str = Field(min_length=1)


class SyncBatch(BaseModel):
    items: list[SyncQueueItemInput]


class SyncResult(BaseModel):
    synced: list[str]
    failed: list[str]
