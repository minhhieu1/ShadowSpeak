# ShadowSpeak API Specification Document

## Document Metadata

| Field         | Value                      |
| ------------- | -------------------------- |
| Project       | ShadowSpeak                |
| Document Type | API Specification Document |
| Phase         | 04 - Solution Architecture |
| Date          | 2026-05-14                 |
| Version       | 1.0                        |
| Owner         | API Designer               |

## Source Basis

This API specification is derived from:

- [Solution Architecture Document](01-Solution-Architecture-Document.md)
- [High-Level Design Document](02-High-Level-Design-Document.md)
- [Low-Level Design Document](03-Low-Level-Design-Document.md)
- [Functional Requirements Specification](../02-analysis/03-Functional-Requirements-Specification.md)
- [Use Case Specification](../02-analysis/05-Use-Case-Specification.md)

The LLD is the primary source for exact schema/model names, field names, and error codes. The HLD is the primary source for module-level API coverage and traceability.

## Revision History

| Version | Date       | Author       | Description                                                       |
| ------- | ---------- | ------------ | ----------------------------------------------------------------- |
| 1.0     | 2026-05-14 | API Designer | Initial API specification for the ShadowSpeak MVP backend modules |

## 1. Scope

This document specifies the REST API surface exposed through Amazon API Gateway for the ShadowSpeak MVP backend.

In scope:

- Auth / Profile / Consent endpoints
- Content / Downloads endpoints
- Session / Progress endpoints
- Shared request and response conventions
- Error handling and rate limiting guidance
- Traceability to functional requirements, use cases, and LLD components

Out of scope:

- Future AI scoring APIs
- Subscriptions
- Social or leaderboard APIs
- Admin-only content publishing APIs
- Webhooks and event-driven orchestration

## 2. Global Conventions

### 2.1 Base URL Pattern

All endpoints are served over HTTPS from an API Gateway base URL shaped like:

`https://{apiId}.execute-api.{region}.amazonaws.com/{stage}/v1`

The `/v1` prefix is the logical API version for this MVP contract.

### 2.2 Authentication

- Protected endpoints require a Cognito JWT in the `Authorization` header.
- The bearer token format is `Authorization: Bearer <jwt>`.
- The backend validates JWTs server-side.
- `GET /consent` and `PUT /consent` are the only pre-auth onboarding exceptions in this MVP API surface.
- `JsonEnvelope<T>` is the REST-facing alias for the LLD's `ApiResult<T>` wrapper; the wire shape is identical.
- For pre-auth consent flows, clients should send `X-Device-Id` with a device-generated anonymous identifier so the server can store consent state before Cognito sign-in and re-key it to the canonical `userId` after authentication completes.

### 2.3 Request ID Header

- Clients should send `X-Request-Id` on every request when available.
- If the client omits it, the backend may generate one.
- The backend echoes the request ID in the `JsonEnvelope<T>.requestId` field.
- The backend must also return it as an `X-Request-Id` response header to support client-side log correlation.

### 2.4 Content Type

- JSON request bodies use `Content-Type: application/json`.
- All responses use the shared `JsonEnvelope<T>` wrapper.

### 2.5 Response Envelope

All endpoints return a `JsonEnvelope<T>` shape.

| Field       | Type              | Notes                                   |
| ----------- | ----------------- | --------------------------------------- |
| `requestId` | `string`          | Correlates the request and response     |
| `ok`        | `boolean`         | `true` for success, `false` for failure |
| `data`      | `T`               | Present on success                      |
| `error`     | `ApiErrorPayload` | Present on failure                      |

`ApiErrorPayload` uses the LLD fields:

| Field     | Type                      | Notes                            |
| --------- | ------------------------- | -------------------------------- |
| `code`    | `string`                  | Canonical application error code |
| `message` | `string`                  | User-safe message                |
| `details` | `Record<string, unknown>` | Optional structured diagnostics  |

### 2.6 Pagination

- Pagination is cursor-based.
- Query parameters use `cursor` and `limit`.
- Default page sizes should remain small.
- `limit` must be bounded server-side.
- `GET /lessons` and `GET /progress/history` use cursor pagination.

### 2.7 Rate Limiting

- Rate limiting is enforced at the edge and/or middleware layer.
- Write endpoints should have stricter limits than read endpoints.
- The client should treat `429 Too Many Requests` as retryable with backoff and jitter.
- Rate limiting does not introduce a new application error code in the LLD; it is an HTTP-level transport condition.

### 2.8 Success and Error Conventions

- Success responses use `ok: true` and populate `data`.
- Failure responses use `ok: false` and populate `error`.
- The API should avoid leaking internal exception details in user-facing messages.
- The canonical application error codes are listed in Section 3.

## 3. Canonical Error Code Catalog

This section consolidates the exact error codes defined in the LLD so the endpoint tables can reference them consistently.

| Error Code              | HTTP Status | Source LLD Module        | Meaning                                                                                     |
| ----------------------- | ----------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| `AUTH_UNAUTHORIZED`     | 401         | Auth / Profile / Consent | Missing or invalid JWT                                                                      |
| `CONSENT_REQUIRED`      | 403         | Auth / Profile / Consent | Consent missing or age gate failed                                                          |
| `VALIDATION_ERROR`      | 422         | All modules              | Bad payload, query, or state input                                                          |
| `USER_NOT_FOUND`        | 404         | Auth / Profile / Consent | User profile missing                                                                        |
| `LESSON_NOT_FOUND`      | 404         | Content / Downloads      | Lesson missing                                                                              |
| `LESSON_NOT_PUBLISHED`  | 404         | Content / Downloads      | Hidden or unpublished content; the spec resolves the LLD's 403/404 ambiguity to 404 for MVP |
| `DOWNLOAD_DENIED`       | 403         | Content / Downloads      | No grant or expired grant                                                                   |
| `SESSION_NOT_FOUND`     | 404         | Session / Progress       | Missing session                                                                             |
| `SESSION_STATE_INVALID` | 409         | Session / Progress       | Wrong state transition                                                                      |
| `SYNC_CONFLICT`         | 409         | Session / Progress       | Duplicate or conflicting mutation                                                           |
| `SYSTEM_ERROR`          | 500         | All modules              | Database, S3, runtime, or integration failure                                               |

## 4. Shared Type Schemas

The following schemas reuse exact schema/model names from the LLD.

### 4.1 Auth / Profile / Consent Schemas

| Type                  | Fields                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ConsentState`        | `userId`, `ageVerified`, `privacyAccepted`, `adConsent`, `consentUpdatedAt`, `locale?`                                             |
| `UserProfile`         | `userId`, `displayName?`, `email?`, `level?`, `reminderTime?`, `deletionRequestedAt?`, `deletionStatus?`, `createdAt`, `updatedAt` |
| `UpdateConsentInput`  | `ageVerified`, `privacyAccepted`, `adConsent`                                                                                      |
| `UpdateProfileInput`  | `displayName?`, `level?`, `reminderTime?`                                                                                          |
| `DeleteAccountResult` | `userId`, `deletionRequestedAt`, `purgeAfter`, `status`                                                                            |

Notes:

- `ConsentState.userId` may be a device-scoped anonymous identifier before Cognito sign-in completes. Once the user authenticates, the server re-keys the consent record to the canonical authenticated `userId`.

### 4.2 Content / Downloads Schemas

| Type                   | Fields                                                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `Lesson`               | `lessonId`, `title`, `level`, `topic`, `durationSeconds`, `language`, `isPublished`, `thumbnailUrl`, `audioAssetKey`, `scriptAssetKey`, `updatedAt` |
| `LessonFilter`         | `level?`, `topic?`, `durationMin?`, `durationMax?`, `cursor?`, `limit?`                                                                             |
| `PagedResult<T>`       | `items`, `nextCursor?`                                                                                                                              |
| `DownloadUrlRequest`   | `assetType: "audio"                                                                                                                                 | "script"` |
| `DownloadUrlResponse`  | `url`, `expiresAt`, `sizeBytes`                                                                                                                     |
| `DownloadGrant`        | `userId`, `lessonId`, `grantedAt`, `expiresAt`, `assetKey`                                                                                          |
| `LessonAsset`          | `assetKey`, `checksum`, `version`, `sizeBytes`, `contentType`                                                                                       |
| `VerificationResponse` | `lessonId`, `verified`, `offlineAvailable`, `expectedChecksum?`                                                                                     |
| `VerifyRequest`        | `assetType: "audio"                                                                                                                                 | "script"` |

Notes:

- `DownloadUrlRequest` and `VerifyRequest` are intentionally separate request types even though they share the same current shape. Keeping them distinct preserves independent evolution for the download and verification endpoints without forcing a shared contract name.
- `Lesson.thumbnailUrl` is a CDN-backed URL keyed by `topic`. All lessons with the same `topic` (e.g. `"conversation"`) share the same `thumbnailUrl`. The client should cache downloaded thumbnails in app data using the topic name as key and reuse them across lessons. When a lesson returns a `topic` whose thumbnail is not yet cached, the client downloads it from `thumbnailUrl` once and stores it locally.

### 4.3 Session / Progress Schemas

| Type                   | Fields                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PracticeSession`      | `sessionId`, `userId`, `lessonId`, `status`, `startedAt`, `expiresAt?`, `completedAt?`, `completionPercent?`, `recordingLocalUri?`, `clientMutationId?` |
| `ProgressSnapshot`     | `userId`, `lessonId?`, `streakDays`, `minutesPracticed`, `lastPracticedAt?`, `completedLessonCount`, `updatedAt`                                        |
| `SyncQueueItem`        | `id`, `userId`, `type`, `payload`, `clientMutationId`, `retryCount`, `nextRetryAt?`, `status`                                                           |
| `SyncQueueItemInput`   | `id`, `type`, `payload`, `clientMutationId`                                                                                                             |
| `StartSessionInput`    | `lessonId`                                                                                                                                              |
| `UpdateSessionInput`   | `status?`, `completionPercent?`, `recordingLocalUri?`                                                                                                   |
| `CompleteSessionInput` | `completionPercent`, `durationSeconds`, `recordingLocalUri?`, `clientMutationId`                                                                        |
| `SyncBatch`            | `items: list[SyncQueueItemInput]`                                                                                                                       |
| `SyncResult`           | `synced`, `failed`                                                                                                                                      |

Notes:

- `SyncQueueItemInput` is the client-submitted shape for offline sync. The server assigns `retryCount`, `nextRetryAt`, and `status`; clients must not submit those fields.
- `SyncResult.synced` and `SyncResult.failed` contain `clientMutationId` values, not server-assigned `SyncQueueItem.id` values, so the client can match results back to its local queue.
- `ProgressSnapshot.lessonId` is optional on the aggregate snapshot returned by `GET /progress`; the history view always populates it for completed lesson sessions.

## 5. Auth / Profile / Consent

### 5.1 GET /me

| Item                 | Details                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| Method               | `GET`                                                                     |
| Path                 | `/me`                                                                     |
| Description          | Fetch the current authenticated user profile and settings                 |
| Authentication       | Required                                                                  |
| Request headers      | `Authorization: Bearer <jwt>`, `X-Request-Id` recommended                 |
| Path parameters      | None                                                                      |
| Query parameters     | None                                                                      |
| Request body         | None                                                                      |
| Response body        | `JsonEnvelope<UserProfile>`                                               |
| Success status codes | `200 OK`                                                                  |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `USER_NOT_FOUND`, `SYSTEM_ERROR` |

Notes:

- The response returns the current `UserProfile` record for the authenticated user.
- The `deletionRequestedAt` and `deletionStatus` fields are part of the `UserProfile` schema and should be included when present.

### 5.2 PUT /me

| Item                 | Details                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Method               | `PUT`                                                                                         |
| Path                 | `/me`                                                                                         |
| Description          | Update profile and account preference fields                                                  |
| Authentication       | Required                                                                                      |
| Request headers      | `Authorization: Bearer <jwt>`, `Content-Type: application/json`, `X-Request-Id` recommended   |
| Path parameters      | None                                                                                          |
| Query parameters     | None                                                                                          |
| Request body         | `UpdateProfileInput`                                                                          |
| Response body        | `JsonEnvelope<UserProfile>`                                                                   |
| Success status codes | `200 OK`                                                                                      |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `VALIDATION_ERROR`, `USER_NOT_FOUND`, `SYSTEM_ERROR` |

Notes:

- This is a partial update operation.
- Omitted fields must remain unchanged.
- `displayName` must be trimmed and length-limited.
- `reminderTime` must follow the `HH:MM` local-time format when present.

### 5.3 GET /consent

| Item                 | Details                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| Method               | `GET`                                                                         |
| Path                 | `/consent`                                                                    |
| Description          | Read the current consent state for the onboarding or authenticated user flow  |
| Authentication       | Not required for onboarding; JWT accepted if already available                |
| Request headers      | `X-Device-Id` required for pre-auth consent flows, `X-Request-Id` recommended |
| Path parameters      | None                                                                          |
| Query parameters     | None                                                                          |
| Request body         | None                                                                          |
| Response body        | `JsonEnvelope<ConsentState>`                                                  |
| Success status codes | `200 OK`                                                                      |
| Error codes          | `VALIDATION_ERROR`, `SYSTEM_ERROR`                                            |

Notes:

- This is the only pre-auth read endpoint in the MVP API surface.
- The route exists to support onboarding before the user fully authenticates.
- The response schema remains `ConsentState`; the implementation should bind the record to the device-scoped anonymous identifier from `X-Device-Id` before authentication and re-key it to the eventual authenticated identity after sign-in without changing the contract.
- If `X-Device-Id` is absent during a pre-auth request, the backend should reject the request as `VALIDATION_ERROR`.

### 5.4 PUT /consent

| Item                 | Details                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| Method               | `PUT`                                                                                                           |
| Path                 | `/consent`                                                                                                      |
| Description          | Save age gate and consent decisions                                                                             |
| Authentication       | Not required for onboarding; JWT accepted if already available                                                  |
| Request headers      | `Content-Type: application/json`, `X-Device-Id` required for pre-auth consent flows, `X-Request-Id` recommended |
| Path parameters      | None                                                                                                            |
| Query parameters     | None                                                                                                            |
| Request body         | `UpdateConsentInput`                                                                                            |
| Response body        | `JsonEnvelope<ConsentState>`                                                                                    |
| Success status codes | `200 OK`                                                                                                        |
| Error codes          | `VALIDATION_ERROR`, `SYSTEM_ERROR`                                                                              |

Notes:

- `ageVerified` must be true before account completion.
- `privacyAccepted` must be true before onboarding can continue.
- `adConsent` must be one of `unknown`, `personalized`, or `non_personalized`.
- Consent writes must be idempotent and store a server timestamp in `consentUpdatedAt`.
- Invalid or incomplete age-gate payloads are reported as `VALIDATION_ERROR` on the write path.
- The server keys pre-auth consent writes by `X-Device-Id` and re-keys the consent record to the authenticated `userId` when Cognito sign-in completes.
- If `X-Device-Id` is absent during a pre-auth request, the backend should reject the request as `VALIDATION_ERROR`.

### 5.5 DELETE /account

| Item                 | Details                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| Method               | `DELETE`                                                                  |
| Path                 | `/account`                                                                |
| Description          | Request account deletion using the MVP soft-delete lifecycle              |
| Authentication       | Required                                                                  |
| Request headers      | `Authorization: Bearer <jwt>`, `X-Request-Id` recommended                 |
| Path parameters      | None                                                                      |
| Query parameters     | None                                                                      |
| Request body         | None                                                                      |
| Response body        | `JsonEnvelope<DeleteAccountResult>`                                       |
| Success status codes | `202 Accepted`                                                            |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `USER_NOT_FOUND`, `SYSTEM_ERROR` |

Notes:

- This endpoint does not hard-delete immediately.
- The response includes `deletionRequestedAt` and `purgeAfter` so the client can show the 30-day grace period.
- The `status` field should indicate `deletion_requested` on the initial response.
- The deletion cascade order in the LLD is profile, consent, session records, sync queue items, then local device data.
- This endpoint uses the `/account` path rather than `/me` to signal a destructive, irreversible action distinct from profile updates.

## 6. Content / Downloads

### 6.1 GET /lessons

| Item                 | Details                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| Method               | `GET`                                                                       |
| Path                 | `/lessons`                                                                  |
| Description          | Fetch a paginated lesson catalog with filters                               |
| Authentication       | Required                                                                    |
| Request headers      | `Authorization: Bearer <jwt>`, `X-Request-Id` recommended                   |
| Path parameters      | None                                                                        |
| Query parameters     | `level`, `topic`, `durationMin`, `durationMax`, `cursor`, `limit`           |
| Request body         | None                                                                        |
| Response body        | `JsonEnvelope<PagedResult<Lesson>>`                                         |
| Success status codes | `200 OK`                                                                    |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `VALIDATION_ERROR`, `SYSTEM_ERROR` |

Notes:

- Only published lessons should be returned to regular learners.
- `limit` must be bounded server-side.
- `durationMin` must be less than or equal to `durationMax` when both are present.
- This endpoint uses cursor-based pagination.

### 6.2 GET /lessons/{id}

| Item                 | Details                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| Method               | `GET`                                                                                               |
| Path                 | `/lessons/{id}`                                                                                     |
| Description          | Fetch a single lesson detail record                                                                 |
| Authentication       | Required                                                                                            |
| Request headers      | `Authorization: Bearer <jwt>`, `X-Request-Id` recommended                                           |
| Path parameters      | `id`                                                                                                |
| Query parameters     | None                                                                                                |
| Request body         | None                                                                                                |
| Response body        | `JsonEnvelope<Lesson>`                                                                              |
| Success status codes | `200 OK`                                                                                            |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `LESSON_NOT_FOUND`, `LESSON_NOT_PUBLISHED`, `SYSTEM_ERROR` |

Notes:

- The response must include the lesson script and asset references through the `Lesson` schema.
- Hidden or unpublished content is returned as `404` in the MVP to keep client behavior consistent.

### 6.3 GET /home/recommendation

| Item                 | Details                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| Method               | `GET`                                                                       |
| Path                 | `/home/recommendation`                                                      |
| Description          | Fetch the daily recommended lesson for the home surface                     |
| Authentication       | Required                                                                    |
| Request headers      | `Authorization: Bearer <jwt>`, `X-Request-Id` recommended                   |
| Path parameters      | None                                                                        |
| Query parameters     | None                                                                        |
| Request body         | None                                                                        |
| Response body        | `JsonEnvelope<Lesson>`                                                      |
| Success status codes | `200 OK`                                                                    |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `LESSON_NOT_FOUND`, `SYSTEM_ERROR` |

Notes:

- The LLD allows this endpoint to return the newest eligible lesson or a curated daily lesson.
- The API contract remains `Lesson`; no separate recommendation object is introduced in the MVP.
- If no eligible published lesson exists for recommendation, the server returns `LESSON_NOT_FOUND` (`404`). The client should fall back to displaying the lesson catalog.

### 6.4 POST /downloads/{lessonId}/url

| Item                 | Details                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Method               | `POST`                                                                                                                 |
| Path                 | `/downloads/{lessonId}/url`                                                                                            |
| Description          | Generate a signed asset URL for lesson download or playback                                                            |
| Authentication       | Required                                                                                                               |
| Request headers      | `Authorization: Bearer <jwt>`, `Content-Type: application/json`, `X-Request-Id` recommended                            |
| Path parameters      | `lessonId`                                                                                                             |
| Query parameters     | None                                                                                                                   |
| Request body         | `DownloadUrlRequest`                                                                                                   |
| Response body        | `JsonEnvelope<DownloadUrlResponse>`                                                                                    |
| Success status codes | `200 OK`                                                                                                               |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `LESSON_NOT_FOUND`, `LESSON_NOT_PUBLISHED`, `DOWNLOAD_DENIED`, `SYSTEM_ERROR` |

Notes:

- `assetType` selects which lesson asset to sign: `audio` maps to `Lesson.audioAssetKey` and `script` maps to `Lesson.scriptAssetKey`.
- The signed URL is short-lived and scoped to one asset.
- The backend should create or refresh a `DownloadGrant` before returning the signed URL.
- `DownloadUrlResponse.sizeBytes` is required so the client can perform quota checks before the fetch.
- The asset bytes are delivered from S3 or CloudFront, not through the API response.

### 6.5 POST /downloads/{lessonId}/verify

| Item                 | Details                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Method               | `POST`                                                                                                                 |
| Path                 | `/downloads/{lessonId}/verify`                                                                                         |
| Description          | Confirm download integrity and offline availability for the lesson                                                     |
| Authentication       | Required                                                                                                               |
| Request headers      | `Authorization: Bearer <jwt>`, `Content-Type: application/json`, `X-Request-Id` recommended                            |
| Path parameters      | `lessonId`                                                                                                             |
| Query parameters     | None                                                                                                                   |
| Request body         | `VerifyRequest`                                                                                                        |
| Response body        | `JsonEnvelope<VerificationResponse>`                                                                                   |
| Success status codes | `200 OK`                                                                                                               |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `LESSON_NOT_FOUND`, `LESSON_NOT_PUBLISHED`, `DOWNLOAD_DENIED`, `SYSTEM_ERROR` |

Notes:

- The server-side response includes `expectedChecksum`.
- The backend should validate the matching `DownloadGrant` before returning verification.
- The client compares its local checksum against `expectedChecksum` after the download completes.
- `assetType` identifies which downloaded asset is being verified, consistent with the `assetType` used in `POST /downloads/{lessonId}/url`. The `expectedChecksum` in the response corresponds to the requested asset.

## 7. Session / Progress

### 7.1 GET /sessions/{id}

| Item                 | Details                                                                      |
| -------------------- | ---------------------------------------------------------------------------- |
| Method               | `GET`                                                                        |
| Path                 | `/sessions/{id}`                                                             |
| Description          | Fetch the current state of a practice session                                |
| Authentication       | Required                                                                     |
| Request headers      | `Authorization: Bearer <jwt>`, `X-Request-Id` recommended                    |
| Path parameters      | `id`                                                                         |
| Query parameters     | None                                                                         |
| Request body         | None                                                                         |
| Response body        | `JsonEnvelope<PracticeSession>`                                              |
| Success status codes | `200 OK`                                                                     |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `SESSION_NOT_FOUND`, `SYSTEM_ERROR` |

Notes:

- This endpoint lets the client recover session state after an app restart or crash.
- The server only returns sessions that belong to the authenticated user.

### 7.2 POST /sessions

| Item                 | Details                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Method               | `POST`                                                                                      |
| Path                 | `/sessions`                                                                                 |
| Description          | Start a new practice session                                                                |
| Authentication       | Required                                                                                    |
| Request headers      | `Authorization: Bearer <jwt>`, `Content-Type: application/json`, `X-Request-Id` recommended |
| Path parameters      | None                                                                                        |
| Query parameters     | None                                                                                        |
| Request body         | `StartSessionInput`                                                                         |
| Response body        | `JsonEnvelope<PracticeSession>`                                                             |
| Success status codes | `201 Created`                                                                               |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `VALIDATION_ERROR`, `SYSTEM_ERROR`                 |

Notes:

- Session creation should write a server-side record immediately.
- The returned `PracticeSession` initial `status` is `created`.
- `POST /sessions` is not idempotent in the MVP; repeated client retries can create duplicate sessions if the caller resubmits the request. Clients should only call it once per visible session start.
- If the `lessonId` is invalid, the session module may surface `VALIDATION_ERROR` rather than `LESSON_NOT_FOUND` because lesson existence is validated at the module boundary.

### 7.3 PATCH /sessions/{id}

| Item                 | Details                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Method               | `PATCH`                                                                                                                   |
| Path                 | `/sessions/{id}`                                                                                                          |
| Description          | Update an active session state                                                                                            |
| Authentication       | Required                                                                                                                  |
| Request headers      | `Authorization: Bearer <jwt>`, `Content-Type: application/json`, `X-Request-Id` recommended                               |
| Path parameters      | `id`                                                                                                                      |
| Query parameters     | None                                                                                                                      |
| Request body         | `UpdateSessionInput`                                                                                                      |
| Response body        | `JsonEnvelope<PracticeSession>`                                                                                           |
| Success status codes | `200 OK`                                                                                                                  |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `SESSION_NOT_FOUND`, `SESSION_STATE_INVALID`, `VALIDATION_ERROR`, `SYSTEM_ERROR` |

Notes:

- This endpoint is for active-session lifecycle changes such as pause and resume.
- `completionPercent` must remain between `0` and `100`.
- `recordingLocalUri` may be included when the client needs to persist a local recording reference.
- `completed` is not a valid value for `status` on this endpoint. Session completion must go through `POST /sessions/{id}/complete`, and submitting `status: completed` must return `VALIDATION_ERROR`.

### 7.4 POST /sessions/{id}/complete

| Item                 | Details                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Method               | `POST`                                                                                                                                     |
| Path                 | `/sessions/{id}/complete`                                                                                                                  |
| Description          | Finalize a completed lesson and persist the completion payload                                                                             |
| Authentication       | Required                                                                                                                                   |
| Request headers      | `Authorization: Bearer <jwt>`, `Content-Type: application/json`, `X-Request-Id` recommended                                                |
| Path parameters      | `id`                                                                                                                                       |
| Query parameters     | None                                                                                                                                       |
| Request body         | `CompleteSessionInput`                                                                                                                     |
| Response body        | `JsonEnvelope<PracticeSession>`                                                                                                            |
| Success status codes | `200 OK`                                                                                                                                   |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `SESSION_NOT_FOUND`, `SESSION_STATE_INVALID`, `VALIDATION_ERROR`, `SYNC_CONFLICT`, `SYSTEM_ERROR` |

Notes:

- This endpoint must be idempotent by `clientMutationId`.
- The server should not roll streaks or totals forward more than once for the same mutation.
- If the request is retried with the same `clientMutationId`, the server should return the already-completed state rather than create a duplicate completion.
- `completionPercent` must be between `0` and `100`.
- `durationSeconds` must be positive.

### 7.5 GET /progress

| Item                 | Details                                                   |
| -------------------- | --------------------------------------------------------- |
| Method               | `GET`                                                     |
| Path                 | `/progress`                                               |
| Description          | Fetch the current progress summary                        |
| Authentication       | Required                                                  |
| Request headers      | `Authorization: Bearer <jwt>`, `X-Request-Id` recommended |
| Path parameters      | None                                                      |
| Query parameters     | None                                                      |
| Request body         | None                                                      |
| Response body        | `JsonEnvelope<ProgressSnapshot>`                          |
| Success status codes | `200 OK`                                                  |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `SYSTEM_ERROR`   |

Notes:

- The response represents the latest aggregate progress snapshot for the authenticated user.
- `ProgressSnapshot` includes streak and minutes-practiced totals.

### 7.6 GET /progress/history

| Item                 | Details                                                   |
| -------------------- | --------------------------------------------------------- |
| Method               | `GET`                                                     |
| Path                 | `/progress/history`                                       |
| Description          | Fetch paginated practice history                          |
| Authentication       | Required                                                  |
| Request headers      | `Authorization: Bearer <jwt>`, `X-Request-Id` recommended |
| Path parameters      | None                                                      |
| Query parameters     | `cursor`, `limit`                                         |
| Request body         | None                                                      |
| Response body        | `JsonEnvelope<PagedResult<ProgressSnapshot>>`             |
| Success status codes | `200 OK`                                                  |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `SYSTEM_ERROR`   |

Notes:

- The endpoint uses cursor-based pagination.
- The `items` collection contains `ProgressSnapshot` records ordered reverse-chronologically by `completedAt`.
- Each `ProgressSnapshot` in the history `items` list will always have `lessonId` populated because it represents a completed lesson session. The aggregate snapshot returned by `GET /progress` may have `lessonId` absent.

### 7.7 POST /progress/sync

| Item                 | Details                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Method               | `POST`                                                                                       |
| Path                 | `/progress/sync`                                                                             |
| Description          | Sync an offline progress batch after reconnect                                               |
| Authentication       | Required                                                                                     |
| Request headers      | `Authorization: Bearer <jwt>`, `Content-Type: application/json`, `X-Request-Id` recommended  |
| Path parameters      | None                                                                                         |
| Query parameters     | None                                                                                         |
| Request body         | `SyncBatch`                                                                                  |
| Response body        | `JsonEnvelope<SyncResult>`                                                                   |
| Success status codes | `200 OK`                                                                                     |
| Error codes          | `AUTH_UNAUTHORIZED`, `CONSENT_REQUIRED`, `SYNC_CONFLICT`, `VALIDATION_ERROR`, `SYSTEM_ERROR` |

Notes:

- Offline sync should be reconciled in the order of client mutation time.
- The server response returns the `clientMutationId` values of synced items and failed items.
- The client should retry failed items with backoff and should not re-order already-processed mutations.
- The server assigns `retryCount`, `nextRetryAt`, and `status`; clients must not submit these fields in the sync payload.

## 8. Endpoint Matrix

This module summary shows the API surface at a glance.

| Module                   | Endpoint                       | Method   | Auth             | Response Type                                 |
| ------------------------ | ------------------------------ | -------- | ---------------- | --------------------------------------------- |
| Auth / Profile / Consent | `/me`                          | `GET`    | Required         | `JsonEnvelope<UserProfile>`                   |
| Auth / Profile / Consent | `/me`                          | `PUT`    | Required         | `JsonEnvelope<UserProfile>`                   |
| Auth / Profile / Consent | `/consent`                     | `GET`    | Pre-auth allowed | `JsonEnvelope<ConsentState>`                  |
| Auth / Profile / Consent | `/consent`                     | `PUT`    | Pre-auth allowed | `JsonEnvelope<ConsentState>`                  |
| Auth / Profile / Consent | `/account`                     | `DELETE` | Required         | `JsonEnvelope<DeleteAccountResult>`           |
| Content / Downloads      | `/lessons`                     | `GET`    | Required         | `JsonEnvelope<PagedResult<Lesson>>`           |
| Content / Downloads      | `/lessons/{id}`                | `GET`    | Required         | `JsonEnvelope<Lesson>`                        |
| Content / Downloads      | `/home/recommendation`         | `GET`    | Required         | `JsonEnvelope<Lesson>`                        |
| Content / Downloads      | `/downloads/{lessonId}/url`    | `POST`   | Required         | `JsonEnvelope<DownloadUrlResponse>`           |
| Content / Downloads      | `/downloads/{lessonId}/verify` | `POST`   | Required         | `JsonEnvelope<VerificationResponse>`          |
| Session / Progress       | `/sessions/{id}`               | `GET`    | Required         | `JsonEnvelope<PracticeSession>`               |
| Session / Progress       | `/sessions`                    | `POST`   | Required         | `JsonEnvelope<PracticeSession>`               |
| Session / Progress       | `/sessions/{id}`               | `PATCH`  | Required         | `JsonEnvelope<PracticeSession>`               |
| Session / Progress       | `/sessions/{id}/complete`      | `POST`   | Required         | `JsonEnvelope<PracticeSession>`               |
| Session / Progress       | `/progress`                    | `GET`    | Required         | `JsonEnvelope<ProgressSnapshot>`              |
| Session / Progress       | `/progress/history`            | `GET`    | Required         | `JsonEnvelope<PagedResult<ProgressSnapshot>>` |
| Session / Progress       | `/progress/sync`               | `POST`   | Required         | `JsonEnvelope<SyncResult>`                    |

## 9. Rate Limiting Notes

- Read endpoints such as `/lessons`, `/home/recommendation`, `/sessions/{id}`, and `/progress/history` should tolerate moderate burst traffic while still meeting the NFR-3 target of 95% of responses at or below 300 ms.
- Write endpoints such as `/sessions`, `/sessions/{id}/complete`, and `/progress/sync` should have tighter per-user controls.
- Public onboarding consent routes should also be rate-limited to deter abuse.
- API Gateway usage plans should be configured to support at least 10,000 concurrent active users per NFR-9.
- If a rate limit is exceeded, the transport layer should return `429 Too Many Requests` with a retryable posture.
- Clients should back off exponentially and preserve local state while waiting to retry.

## 10. Traceability Matrix

| Endpoint                            | Functional Requirement(s) | Use Case(s)  | LLD Component            |
| ----------------------------------- | ------------------------- | ------------ | ------------------------ |
| `GET /me`                           | FR-8                      | UC-10        | Auth / Profile / Consent |
| `PUT /me`                           | FR-8                      | UC-07, UC-10 | Auth / Profile / Consent |
| `GET /consent`                      | FR-9                      | UC-11        | Auth / Profile / Consent |
| `PUT /consent`                      | FR-9                      | UC-01, UC-11 | Auth / Profile / Consent |
| `DELETE /account`                   | FR-8                      | UC-10        | Auth / Profile / Consent |
| `GET /lessons`                      | FR-2                      | UC-02, UC-05 | Content / Downloads      |
| `GET /lessons/{id}`                 | FR-2                      | UC-02        | Content / Downloads      |
| `GET /home/recommendation`          | FR-2                      | UC-02, UC-05 | Content / Downloads      |
| `POST /downloads/{lessonId}/url`    | FR-7                      | UC-06        | Content / Downloads      |
| `POST /downloads/{lessonId}/verify` | FR-7                      | UC-06        | Content / Downloads      |
| `GET /sessions/{id}`                | FR-5                      | UC-08        | Session / Progress       |
| `POST /sessions`                    | FR-3                      | UC-03        | Session / Progress       |
| `PATCH /sessions/{id}`              | FR-3                      | UC-03        | Session / Progress       |
| `POST /sessions/{id}/complete`      | FR-3, FR-4, FR-5          | UC-03, UC-08 | Session / Progress       |
| `GET /progress`                     | FR-5                      | UC-08        | Session / Progress       |
| `GET /progress/history`             | FR-5                      | UC-08        | Session / Progress       |
| `POST /progress/sync`               | FR-5                      | UC-08        | Session / Progress       |

Excluded from backend REST traceability because they are client-side or managed-service concerns in the MVP:

- FR-1, because registration and authentication are handled by Cognito
- FR-4, because recording comparison is a client-side audio feature
- FR-6, because ad insertion is handled by the AdMob SDK on the client
- UC-04, because it is a client-side recording comparison flow
- UC-09, because ad serving is client-side

## 11. Implementation Notes

- The API contract should stay aligned with the LLD schema/model definitions rather than introducing separate REST DTO names.
- Responses must always use `JsonEnvelope<T>`.
- Protected endpoints should perform JWT verification before business logic.
- Consent and progress writes should be idempotent.
- Download URL issuance should be short-lived and grant-scoped.
- The mobile client should treat all `SYSTEM_ERROR` responses as retryable unless a stricter endpoint-specific state is known.
- No extra MVP endpoints should be added for subscriptions, social features, or real-time AI.
