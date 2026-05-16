from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.core.errors import AppError
from app.models.auth import (
    ConsentState,
    DeleteAccountResult,
    UpdateConsentInput,
    UpdateProfileInput,
    UserProfile,
)
from app.models.common import PagedResult
from app.models.content import (
    AssetType,
    DownloadUrlResponse,
    Lesson,
    LessonFilter,
    VerificationResponse,
)
from app.models.session import (
    CompleteSessionInput,
    PracticeSession,
    ProgressSnapshot,
    SyncBatch,
    SyncResult,
    UpdateSessionInput,
)


def now_iso() -> str:
    return datetime.now(UTC).isoformat()


class MemoryRepository:
    def __init__(self) -> None:
        timestamp = now_iso()
        self.profiles: dict[str, UserProfile] = {
            "demo-user": UserProfile(
                userId="demo-user",
                displayName="Shadow Learner",
                email="demo@shadowspeak.app",
                level="beginner",
                reminderTime="19:30",
                createdAt=timestamp,
                updatedAt=timestamp,
            )
        }
        self.consents: dict[str, ConsentState] = {
            "demo-user": ConsentState(
                userId="demo-user",
                ageVerified=True,
                privacyAccepted=True,
                adConsent="non_personalized",
                consentUpdatedAt=timestamp,
                locale="en-US",
            )
        }
        self.device_consents: dict[str, ConsentState] = {}
        self.lessons: dict[str, Lesson] = {
            "lesson_cafe_small_talk_001": Lesson(
                lessonId="lesson_cafe_small_talk_001",
                title="Cafe Small Talk",
                level="beginner",
                topic="conversation",
                durationSeconds=480,
                language="en-US",
                isPublished=True,
                thumbnailUrl="https://cdn.shadowspeak.app/thumbnails/conversation.webp",
                audioAssetKey="audio/cafe-small-talk-001.mp3",
                scriptAssetKey="scripts/cafe-small-talk-001.json",
                updatedAt=timestamp,
            ),
            "lesson_traveling_abroad_001": Lesson(
                lessonId="lesson_traveling_abroad_001",
                title="At the Airport",
                level="intermediate",
                topic="travel",
                durationSeconds=720,
                language="en-US",
                isPublished=True,
                thumbnailUrl="https://cdn.shadowspeak.app/thumbnails/travel.webp",
                audioAssetKey="audio/at-the-airport-001.mp3",
                scriptAssetKey="scripts/at-the-airport-001.json",
                updatedAt=timestamp,
            ),
            "lesson_business_meeting_001": Lesson(
                lessonId="lesson_business_meeting_001",
                title="Quick Team Update",
                level="advanced",
                topic="business",
                durationSeconds=600,
                language="en-US",
                isPublished=True,
                thumbnailUrl="https://cdn.shadowspeak.app/thumbnails/business.webp",
                audioAssetKey="audio/quick-team-update-001.mp3",
                scriptAssetKey="scripts/quick-team-update-001.json",
                updatedAt=timestamp,
            ),
        }
        self.sessions: dict[str, PracticeSession] = {}
        self.completed_mutations: dict[str, str] = {}

    def get_profile(self, user_id: str) -> UserProfile:
        profile = self.profiles.get(user_id)
        if profile is None:
            timestamp = now_iso()
            profile = UserProfile(userId=user_id, createdAt=timestamp, updatedAt=timestamp)
            self.profiles[user_id] = profile
        return profile

    def update_profile(self, user_id: str, payload: UpdateProfileInput) -> UserProfile:
        profile = self.get_profile(user_id)
        updates = payload.model_dump(exclude_none=True)
        if "displayName" in updates and updates["displayName"] is not None:
            updates["displayName"] = updates["displayName"].strip()
        profile = profile.model_copy(update={**updates, "updatedAt": now_iso()})
        self.profiles[user_id] = profile
        return profile

    def get_consent(self, user_id: str | None, device_id: str | None) -> ConsentState:
        key = user_id or device_id
        if key is None:
            raise AppError("VALIDATION_ERROR", "X-Device-Id is required before sign-in")

        store = self.consents if user_id else self.device_consents
        consent = store.get(key)
        if consent is None:
            consent = ConsentState(
                userId=key,
                ageVerified=False,
                privacyAccepted=False,
                adConsent="unknown",
                consentUpdatedAt=now_iso(),
            )
            store[key] = consent
        return consent

    def update_consent(
        self,
        payload: UpdateConsentInput,
        user_id: str | None,
        device_id: str | None,
    ) -> ConsentState:
        key = user_id or device_id
        if key is None:
            raise AppError("VALIDATION_ERROR", "X-Device-Id is required before sign-in")
        if not payload.ageVerified or not payload.privacyAccepted:
            raise AppError(
                "VALIDATION_ERROR",
                "Age verification and privacy acceptance are required",
            )

        consent = ConsentState(
            userId=key,
            ageVerified=payload.ageVerified,
            privacyAccepted=payload.privacyAccepted,
            adConsent=payload.adConsent,
            consentUpdatedAt=now_iso(),
        )
        if user_id:
            self.consents[user_id] = consent
        else:
            self.device_consents[key] = consent
        return consent

    def delete_account(self, user_id: str) -> DeleteAccountResult:
        requested_at = now_iso()
        purge_after = (datetime.now(UTC) + timedelta(days=30)).isoformat()
        profile = self.get_profile(user_id).model_copy(
            update={
                "deletionRequestedAt": requested_at,
                "deletionStatus": "deletion_requested",
                "updatedAt": requested_at,
            }
        )
        self.profiles[user_id] = profile
        self.consents.pop(user_id, None)
        return DeleteAccountResult(
            userId=user_id,
            deletionRequestedAt=requested_at,
            purgeAfter=purge_after,
            status="deletion_requested",
        )

    def list_lessons(self, lesson_filter: LessonFilter) -> PagedResult[Lesson]:
        lessons = [lesson for lesson in self.lessons.values() if lesson.isPublished]
        if lesson_filter.level:
            lessons = [lesson for lesson in lessons if lesson.level == lesson_filter.level]
        if lesson_filter.topic:
            lessons = [lesson for lesson in lessons if lesson.topic == lesson_filter.topic]
        if lesson_filter.durationMin is not None:
            lessons = [
                lesson
                for lesson in lessons
                if lesson.durationSeconds >= lesson_filter.durationMin * 60
            ]
        if lesson_filter.durationMax is not None:
            lessons = [
                lesson
                for lesson in lessons
                if lesson.durationSeconds <= lesson_filter.durationMax * 60
            ]
        return PagedResult(items=lessons[: lesson_filter.limit])

    def get_lesson(self, lesson_id: str) -> Lesson:
        lesson = self.lessons.get(lesson_id)
        if lesson is None or not lesson.isPublished:
            raise AppError("LESSON_NOT_FOUND", "Lesson not found")
        return lesson

    def get_recommendation(self, level: str | None = None) -> Lesson:
        lessons = [lesson for lesson in self.lessons.values() if lesson.isPublished]
        if level:
            lessons = [lesson for lesson in lessons if lesson.level == level]
        if not lessons:
            raise AppError("LESSON_NOT_FOUND", "No recommended lesson is available")
        return sorted(lessons, key=lambda lesson: lesson.updatedAt, reverse=True)[0]

    def create_download_url(self, lesson_id: str, asset_type: AssetType) -> DownloadUrlResponse:
        lesson = self.get_lesson(lesson_id)
        asset_key = lesson.audioAssetKey if asset_type == "audio" else lesson.scriptAssetKey
        size_bytes = 3_200_000 if asset_type == "audio" else 48_000
        return DownloadUrlResponse(
            url=f"https://cdn.shadowspeak.app/{asset_key}?signed=local-dev",
            expiresAt=(datetime.now(UTC) + timedelta(minutes=15)).isoformat(),
            sizeBytes=size_bytes,
        )

    def verify_download(self, lesson_id: str, asset_type: AssetType) -> VerificationResponse:
        self.get_lesson(lesson_id)
        return VerificationResponse(
            lessonId=lesson_id,
            verified=True,
            offlineAvailable=True,
            expectedChecksum=f"local-dev-{asset_type}-checksum",
        )

    def start_session(self, user_id: str, lesson_id: str) -> PracticeSession:
        self.get_lesson(lesson_id)
        started_at = now_iso()
        session = PracticeSession(
            sessionId=str(uuid4()),
            userId=user_id,
            lessonId=lesson_id,
            status="created",
            startedAt=started_at,
            expiresAt=(datetime.now(UTC) + timedelta(hours=6)).isoformat(),
        )
        self.sessions[session.sessionId] = session
        return session

    def get_session(self, user_id: str, session_id: str) -> PracticeSession:
        session = self.sessions.get(session_id)
        if session is None or session.userId != user_id:
            raise AppError("SESSION_NOT_FOUND", "Practice session not found")
        return session

    def update_session(
        self,
        user_id: str,
        session_id: str,
        payload: UpdateSessionInput,
    ) -> PracticeSession:
        session = self.get_session(user_id, session_id)
        if session.status in ("completed", "synced"):
            raise AppError("SESSION_STATE_INVALID", "Completed sessions cannot be updated")
        updates = payload.model_dump(exclude_none=True)
        session = session.model_copy(update=updates)
        self.sessions[session_id] = session
        return session

    def complete_session(
        self,
        user_id: str,
        session_id: str,
        payload: CompleteSessionInput,
    ) -> PracticeSession:
        session = self.get_session(user_id, session_id)
        existing_session_id = self.completed_mutations.get(payload.clientMutationId)
        if existing_session_id:
            if existing_session_id == session_id:
                return self.sessions[session_id]
            raise AppError("SYNC_CONFLICT", "Client mutation id was already used")
        if session.status in ("completed", "synced"):
            raise AppError("SESSION_STATE_INVALID", "Session is already complete")

        session = session.model_copy(
            update={
                "status": "completed",
                "completedAt": now_iso(),
                "completionPercent": payload.completionPercent,
                "recordingLocalUri": payload.recordingLocalUri,
                "clientMutationId": payload.clientMutationId,
            }
        )
        self.sessions[session_id] = session
        self.completed_mutations[payload.clientMutationId] = session_id
        return session

    def get_progress(self, user_id: str) -> ProgressSnapshot:
        completed = [
            session
            for session in self.sessions.values()
            if session.userId == user_id and session.status in ("completed", "synced")
        ]
        minutes = sum(
            max(1, self.lessons[session.lessonId].durationSeconds // 60) for session in completed
        )
        return ProgressSnapshot(
            userId=user_id,
            streakDays=3 if completed else 0,
            minutesPracticed=minutes,
            lastPracticedAt=completed[-1].completedAt if completed else None,
            completedLessonCount=len(completed),
            updatedAt=now_iso(),
        )

    def get_progress_history(self, user_id: str, limit: int) -> PagedResult[ProgressSnapshot]:
        completed = [
            session
            for session in self.sessions.values()
            if session.userId == user_id and session.status in ("completed", "synced")
        ]
        items = [
            ProgressSnapshot(
                userId=user_id,
                lessonId=session.lessonId,
                streakDays=3,
                minutesPracticed=max(1, self.lessons[session.lessonId].durationSeconds // 60),
                lastPracticedAt=session.completedAt,
                completedLessonCount=1,
                updatedAt=session.completedAt or now_iso(),
            )
            for session in completed
        ]
        return PagedResult(items=items[:limit])

    def sync_progress(self, batch: SyncBatch) -> SyncResult:
        return SyncResult(
            synced=[item.clientMutationId for item in batch.items],
            failed=[],
        )


repository = MemoryRepository()
