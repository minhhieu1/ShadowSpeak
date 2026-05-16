from typing import Literal

from pydantic import BaseModel, Field

from app.models.auth import Level

AssetType = Literal["audio", "script"]


class Lesson(BaseModel):
    lessonId: str
    title: str
    level: Level
    topic: str
    durationSeconds: int
    language: str
    isPublished: bool
    thumbnailUrl: str
    audioAssetKey: str
    scriptAssetKey: str
    updatedAt: str


class LessonFilter(BaseModel):
    level: Level | None = None
    topic: str | None = None
    durationMin: int | None = Field(default=None, ge=0)
    durationMax: int | None = Field(default=None, ge=0)
    cursor: str | None = None
    limit: int = Field(default=20, ge=1, le=50)


class DownloadUrlRequest(BaseModel):
    assetType: AssetType


class DownloadUrlResponse(BaseModel):
    url: str
    expiresAt: str
    sizeBytes: int


class VerifyRequest(BaseModel):
    assetType: AssetType


class VerificationResponse(BaseModel):
    lessonId: str
    verified: bool
    offlineAvailable: bool
    expectedChecksum: str | None = None
