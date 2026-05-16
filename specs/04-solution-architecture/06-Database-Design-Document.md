# ShadowSpeak Database Design Document

## Document Metadata

| Field         | Value                      |
| ------------- | -------------------------- |
| Project       | ShadowSpeak                |
| Document Type | Database Design Document   |
| Phase         | 04 - Solution Architecture |
| Date          | 2026-05-14                 |
| Status        | Draft                      |
| Version       | 1.0                        |
| Owner         | Database Designer          |

> This document covers the **server-side DynamoDB** database design. See [07-Mobile-Storage-Design.md](07-Mobile-Storage-Design.md) for the mobile client SQLite offline schema.

## Source Basis

This document is derived from:

- [Solution Architecture Document](01-Solution-Architecture-Document.md)
- [High-Level Design Document](02-High-Level-Design-Document.md)
- [Low-Level-Design-Backend.md](03-Low-Level-Design-Backend.md)

The backend LLD is the primary source for the data models, naming, and access patterns. The SAD is the primary source for the overall AWS serverless architecture and the DynamoDB-first backend strategy.

## Revision History

| Version | Date       | Author            | Description                                     |
| ------- | ---------- | ----------------- | ----------------------------------------------- |
| 1.0     | 2026-05-14 | Database Designer | Initial DynamoDB design for the ShadowSpeak MVP |

## 1. Design Summary

ShadowSpeak MVP uses a **single DynamoDB table** with two GSIs.

This is the simplest practical design for the MVP because:

- the core access patterns are mostly point lookups or user-scoped queries
- one table keeps operational overhead low for a solo or small team
- the table can store both user state and lesson metadata without cross-table joins
- the required cross-access patterns are covered by two focused GSIs
- no Streams, DAX, or cross-region replication are needed in the MVP

### Table Choice

| Option        | Decision   | Reason                                                                                           |
| ------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| Single-table  | Yes        | Minimizes operational complexity and keeps user-scoped reads/writes in one partitioning strategy |
| Minimal-table | Not chosen | Two or more tables would split related state without adding meaningful MVP value                 |

## 2. DynamoDB Table Design

### 2.1 Primary Table

| Table Name      | Purpose                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `ShadowSpeakMain` | Stores user profile, consent, sessions, progress, sync queue items, lesson metadata, lesson access records, and download grants |

### 2.2 Key Conventions

The table uses a consistent string-prefix convention:

- `USER#<userId>` for user-owned state
- `SESSION#<sessionId>` for direct session lookups
- `LESSON#<lessonId>` for lesson detail
- `LESSONCAT#<level>#PUBLISHED` for lesson catalog access
- `PROGRESS#CURRENT` and `PROGRESS#HISTORY#...` for progress snapshots
- `MUTATION#<clientMutationId>` for sync queue items
- `DOWNLOAD#<lessonId>#<assetType>` for short-lived download grants
- `DEVICE#<deviceId>` only for transient pre-auth consent bootstrap records

This document uses uppercase prefixes for readability and to keep the item keys visually distinct from the LLD's compact notation.

### 2.3 Item Shapes

The table stores multiple logical entity types in the same physical table. Each item is identified by `PK` and `SK`.

| Attribute    | Meaning                                                |
| ------------ | ------------------------------------------------------ |
| `PK`         | Primary partition key                                  |
| `SK`         | Primary sort key                                       |
| `entityType` | Logical item type discriminator                        |
| `ttlEpoch`   | Internal DynamoDB TTL attribute, used only where noted |

## 3. Entity-to-DynamoDB Mapping

| Entity                     | PK Pattern            | SK Pattern                                              | Attribute List                                                                                                                                                                                   | Notes                                                                     |
| -------------------------- | --------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `UserProfile`              | `USER#<userId>`       | `PROFILE`                                               | `userId`, `displayName`, `email`, `level`, `reminderTime`, `deletionRequestedAt`, `deletionStatus`, `createdAt`, `updatedAt`, `entityType`                                                       | Single profile row per user                                               |
| `ConsentState`             | `USER#<userId>`       | `CONSENT`                                               | `userId`, `ageVerified`, `privacyAccepted`, `adConsent`, `consentUpdatedAt`, `locale`, `entityType`                                                                                              | Durable consent row after Cognito sign-in                                 |
| `ConsentState` bootstrap   | `DEVICE#<deviceId>`   | `CONSENT`                                               | `userId?`, `ageVerified`, `privacyAccepted`, `adConsent`, `consentUpdatedAt`, `locale`, `entityType`, `ttlEpoch`                                                                                 | Transient pre-auth consent row, re-keyed to `USER#<userId>` after sign-in |
| `Lesson`                   | `LESSON#<lessonId>`   | `METADATA`                                              | `lessonId`, `title`, `level`, `topic`, `durationSeconds`, `language`, `isPublished`, `thumbnailUrl`, `audioAssetKey`, `scriptAssetKey`, `updatedAt`, `entityType`, `gsi2pk`, `gsi2sk`            | Lesson detail and catalog metadata                                        |
| `PracticeSession`          | `SESSION#<sessionId>` | `METADATA`                                              | `sessionId`, `userId`, `lessonId`, `status`, `startedAt`, `expiresAt`, `completedAt`, `completionPercent`, `recordingLocalUri`, `clientMutationId`, `entityType`, `gsi1pk`, `gsi1sk`, `ttlEpoch` | Direct lookup by sessionId                                                |
| `ProgressSnapshot` current | `USER#<userId>`       | `PROGRESS#CURRENT`                                      | `userId`, `lessonId?`, `streakDays`, `minutesPracticed`, `lastPracticedAt`, `completedLessonCount`, `updatedAt`, `entityType`                                                                    | Aggregate snapshot, one current item per user                             |
| `ProgressSnapshot` history | `USER#<userId>`       | `PROGRESS#HISTORY#<completedAt>#<lessonId>#<sessionId>` | `userId`, `lessonId`, `streakDays`, `minutesPracticed`, `lastPracticedAt`, `completedLessonCount`, `updatedAt`, `entityType`                                                                     | Append-only history rows, `lessonId` always populated                     |
| `SyncQueueItem`            | `USER#<userId>`       | `MUTATION#<clientMutationId>`                           | `id`, `userId`, `type`, `payload`, `clientMutationId`, `retryCount`, `nextRetryAt`, `status`, `entityType`, `ttlEpoch?`                                                                          | Queue state stays user-scoped and keyed by immutable mutation token       |
| `DownloadGrant`            | `USER#<userId>`       | `DOWNLOAD#<lessonId>#<assetType>`                       | `userId`, `lessonId`, `grantedAt`, `expiresAt`, `assetKey`, `entityType`, `ttlEpoch`                                                                                                             | Short-lived grant for signed URL and verification                         |

### 3.1 Entity Consolidation Notes

- The `LessonAsset` model from the backend LLD is not stored as a separate DynamoDB entity. Asset checksum, version, size, and content type are resolved from S3 object metadata by the asset service. DynamoDB only stores the lesson metadata and asset keys.

- The HLD's `OfflineLessonFlag` concept is subsumed by `DownloadGrant` on the backend and by local cached lesson state on device. No separate DynamoDB entity is used for that flag in the MVP.

- `RecordingReferenceRow` is device-local only. Recordings are local-first and are not uploaded by default in the MVP, so no DynamoDB entity is needed for recording references.

- `UserSettings` from the HLD is folded into `UserProfile` through the `level` and `reminderTime` fields, so it does not require a separate DynamoDB entity.

## 4. Secondary Indexes

### 4.1 GSI Definitions

| Index Name                 | PK Pattern                    | SK Pattern                              | Projection | Supported Access Pattern                                           |
| -------------------------- | ----------------------------- | --------------------------------------- | ---------- | ------------------------------------------------------------------ |
| `GSI1_UserSessionTimeline` | `USER#<userId>`               | `SESSION#<startedAt>#<sessionId>`       | `INCLUDE`  | Query sessions by `userId`                                         |
| `GSI2_LessonCatalog`       | `LESSONCAT#<level>#PUBLISHED` | `UPDATED#<updatedAt>#LESSON#<lessonId>` | `INCLUDE`  | Browse lessons by level and publication state, plus recommendation |

### 4.2 LSI Definitions

No LSIs are required for the MVP.

Reason:

- the base table already supports the user-scoped lookups and history queries
- the two GSIs cover the cross-entity queries without complicating the write path
- LSIs would add little value without a matching local-sort access pattern

### 4.3 Projected Attributes

| Index                      | Projected Attributes                                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GSI1_UserSessionTimeline` | `sessionId`, `userId`, `lessonId`, `status`, `startedAt`, `completedAt`, `completionPercent`, `expiresAt`, `clientMutationId`                       |
| `GSI2_LessonCatalog`       | `lessonId`, `title`, `level`, `topic`, `durationSeconds`, `language`, `isPublished`, `thumbnailUrl`, `audioAssetKey`, `scriptAssetKey`, `updatedAt` |

Notes:

- `PracticeSession.gsi1pk = USER#<userId>` and `PracticeSession.gsi1sk = SESSION#<startedAt>#<sessionId>`.
- `Lesson.gsi2pk = LESSONCAT#<level>#PUBLISHED` and `Lesson.gsi2sk = UPDATED#<updatedAt>#LESSON#<lessonId>`.
- `Lesson.gsi2pk` and `Lesson.gsi2sk` are sparse-index attributes: they are set only when `isPublished = true`. For unpublished lessons, these attributes must be absent so DynamoDB excludes the item from `GSI2_LessonCatalog`.
- When a published lesson is taken offline, the backend must update the row with `SET isPublished = :false` and `REMOVE gsi2pk, gsi2sk` in the same `UpdateItem` so the item disappears from the sparse index.

## 5. Access Pattern Matrix

| Operation                             | Table / Index              | Key Condition                                                                      | Filter / Sort                                                        | Notes                                                                                                                             |
| ------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Get profile by `userId`               | `ShadowSpeakMain`          | `PK = USER#<userId>`, `SK = PROFILE`                                               | None                                                                 | Direct `GetItem`                                                                                                                  |
| Get consent by `userId`               | `ShadowSpeakMain`          | `PK = USER#<userId>`, `SK = CONSENT`                                               | None                                                                 | Direct `GetItem`                                                                                                                  |
| Save consent changes                  | `ShadowSpeakMain`          | `PK = USER#<userId>`, `SK = CONSENT`                                               | Conditional update                                                   | Idempotent `UpdateItem`                                                                                                           |
| Pre-auth consent bootstrap            | `ShadowSpeakMain`          | `PK = DEVICE#<deviceId>`, `SK = CONSENT`                                           | None                                                                 | Transient item before sign-in, then re-key to `USER#<userId>`                                                                     |
| Create or refresh `DownloadGrant`     | `ShadowSpeakMain`          | `PK = USER#<userId>`, `SK = DOWNLOAD#<lessonId>#<assetType>`                       | Condition on expiry/state                                            | Short-lived grant, TTL-backed                                                                                                     |
| Read `DownloadGrant` for verification | `ShadowSpeakMain`          | `PK = USER#<userId>`, `SK = DOWNLOAD#<lessonId>#<assetType>`                       | Application-layer check after `GetItem`: verify `expiresAt > now()`  | Verifies the signed URL request before returning checksum metadata                                                                |
| Get lesson detail by `lessonId`       | `ShadowSpeakMain`          | `PK = LESSON#<lessonId>`, `SK = METADATA`                                          | None                                                                 | Direct `GetItem`                                                                                                                  |
| Browse lessons by `level` and `topic` | `GSI2_LessonCatalog`       | `GSI2PK = LESSONCAT#<level>#PUBLISHED`                                             | Filter on `topic` and optional `durationSeconds`                     | Used by lesson catalog and recommendation surfaces; unpublished lessons are excluded by sparse indexing                           |
| Get daily recommendation              | `GSI2_LessonCatalog`       | `GSI2PK = LESSONCAT#<level>#PUBLISHED`                                             | `ScanIndexForward = false`, `Limit = 1` and optional topic filter    | Reuses the catalog index; unpublished lessons are excluded by sparse indexing                                                     |
| Get session detail by `sessionId`     | `ShadowSpeakMain`          | `PK = SESSION#<sessionId>`, `SK = METADATA`                                        | None                                                                 | Direct `GetItem`                                                                                                                  |
| Query sessions by `userId`            | `GSI1_UserSessionTimeline` | `GSI1PK = USER#<userId>`                                                           | Sort by `startedAt` descending                                       | Power session history/listing                                                                                                     |
| Update active session state           | `ShadowSpeakMain`          | `PK = SESSION#<sessionId>`, `SK = METADATA`                                        | Condition on current status                                          | Use `clientMutationId` when the mutation can be retried                                                                           |
| Complete session                      | `ShadowSpeakMain`          | `PK = SESSION#<sessionId>`, `SK = METADATA`                                        | Condition on `status` and `clientMutationId`                         | Idempotent completion write                                                                                                       |
| Mark session synced                   | `ShadowSpeakMain`          | `PK = SESSION#<sessionId>`, `SK = METADATA`                                        | Condition on `status = completed` and matching `clientMutationId`    | Terminal server acknowledgement after offline reconciliation; no key change                                                       |
| Fetch current progress snapshot       | `ShadowSpeakMain`          | `PK = USER#<userId>`, `SK = PROGRESS#CURRENT`                                      | None                                                                 | One row per user                                                                                                                  |
| Append progress history               | `ShadowSpeakMain`          | `PK = USER#<userId>`, `SK = PROGRESS#HISTORY#<completedAt>#<lessonId>#<sessionId>` | None                                                                 | Append-only audit/history                                                                                                         |
| Query progress history                | `ShadowSpeakMain`          | `PK = USER#<userId>`, `SK begins_with PROGRESS#HISTORY#`                           | Sort reverse-chronologically by sort key                             | History rows always include `lessonId`                                                                                            |
| Upsert sync queue item                | `ShadowSpeakMain`          | `PK = USER#<userId>`, `SK = MUTATION#<clientMutationId>`                           | Condition on `clientMutationId` uniqueness                           | Client owns `id` and `clientMutationId`; `id` is the local queue-row identifier and `clientMutationId` is the DynamoDB dedupe key |
| Query sync queue items by status      | `ShadowSpeakMain`          | `PK = USER#<userId>`                                                               | FilterExpression `status = :status` and optional `nextRetryAt` range | No GSI needed; queue volume is small in MVP                                                                                       |
| Delete all user-owned state           | `ShadowSpeakMain`          | `PK = USER#<userId>` plus session GSI lookup                                       | Query and batch delete                                               | Used by account purge workflow                                                                                                    |

## 6. Idempotency and Conditional Writes

### 6.1 Consent Writes

Consent writes are idempotent because the consent row is overwritten with the latest accepted values.

Recommended pattern:

- `UpdateItem` on `PK = USER#<userId>`, `SK = CONSENT`
- rely on Cognito JWT validation and the existing authenticated user context before the write is attempted
- write the same booleans and `consentUpdatedAt` every time the user resubmits the same state

For pre-auth onboarding:

- write to `PK = DEVICE#<deviceId>`, `SK = CONSENT`
- re-key the row to `PK = USER#<userId>`, `SK = CONSENT` after Cognito sign-in
- delete the device-scoped bootstrap item after re-keying succeeds

### 6.2 Session Completion

`PracticeSession.clientMutationId` is the idempotency token for completion.

Recommended pattern:

- use `GetItem` on `SESSION#<sessionId>` to confirm ownership and current status
- if `clientMutationId` already matches the stored value, return the existing completed session without reapplying totals
- if the stored status is already `completed` and the token differs, reject the request as a state conflict
- only transition from `created`, `active`, or `paused` into `completed`
- if an offline reconciliation has already been accepted, the same record may be updated in place from `completed` to `synced`; this does not change the key or retention policy

### 6.3 Sync Queue Writes

`SyncQueueItem.id` is the client queue-row identifier. `clientMutationId` is the replay token for the business mutation and the DynamoDB deduplication key.

Recommended pattern:

- first enqueue uses `PutItem` with `attribute_not_exists(PK)` and `attribute_not_exists(SK)` semantics
- retries update the same item by `clientMutationId`
- server processing updates `retryCount`, `nextRetryAt`, and `status`
- successful processing marks the item `synced`, then TTL removes it later

### 6.4 Download Grants

Download grants are short-lived and keyed by `userId`, `lessonId`, and `assetType`.

Recommended pattern:

- `PutItem` or `UpdateItem` on `PK = USER#<userId>`, `SK = DOWNLOAD#<lessonId>#<assetType>`
- refresh `expiresAt` when issuing a new signed URL
- rely on TTL for automatic cleanup after the grant expires

## 7. TTL Strategy

| Entity                                                              | TTL Policy                                                                                                            | Notes                                                                                     |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `SyncQueueItem`                                                     | TTL after a successful sync or permanent failure, typically 30 days after `ttlEpoch` is set                           | Keeps retry history short-lived                                                           |
| `PracticeSession`                                                   | TTL set at creation for 2 years from `startedAt`, accelerated to the 30-day account-deletion grace window when needed | Matches the retention policy and keeps session state available for replay and history |
| `DownloadGrant`                                                     | TTL at `expiresAt`                                                                                                    | Signed URL grants are short-lived by design                                               |
| `ConsentState` bootstrap                                            | TTL 24 hours after creation or sooner after re-keying                                                                 | Device-scoped consent bootstrap records are temporary only                                |
| `UserProfile`, durable `ConsentState`, `ProgressSnapshot`, `Lesson` | No TTL in MVP                                                                                                         | These records are core product state                                                      |

## 8. Account Deletion Design

### 8.1 Cascade Order

Account deletion follows this order:

1. Mark the user profile as deletion requested
2. Remove durable consent state
3. Remove session records
4. Remove progress and sync queue items
5. Remove download grants and any other user-scoped short-lived state
6. Allow the user profile tombstone to expire after the 30-day grace period

### 8.2 Tombstone and Purge Fields

| Field                 | Meaning                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `deletionRequestedAt` | Tombstone timestamp on `UserProfile`                                 |
| `deletionStatus`      | Lifecycle state: `active`, `deletion_requested`, `purged`            |
| `ttlEpoch`            | Internal purge deadline used by DynamoDB TTL, not exposed in the API |

### 8.3 Purge Behavior

- The initial delete request sets `deletionRequestedAt` and `deletionStatus = deletion_requested`
- A follow-up purge job performs batch deletes against the user partition and session GSI lookups
- No Streams are required for the MVP
- The purge job can be a scheduled Lambda or operational cleanup task

## 9. Item Size and Cardinality Estimates

| Entity                     | Estimated Item Size | Cardinality                                                              | Notes                                   |
| -------------------------- | ------------------- | ------------------------------------------------------------------------ | --------------------------------------- |
| `UserProfile`              | 0.5 KB — 2 KB       | 1 per user                                                               | Small profile document                  |
| `ConsentState`             | 0.5 KB — 1 KB       | 1 durable row per user, plus short-lived bootstrap row during onboarding | Bootstrap row is transient              |
| `Lesson`                   | 1 KB — 6 KB         | Tens to a few hundred total lessons                                      | Lesson metadata only, not large scripts |
| `PracticeSession`          | 1 KB — 3 KB         | Several active rows and dozens to hundreds of historical rows per user   | TTL controls stale growth               |
| `ProgressSnapshot` current | 0.5 KB — 1 KB       | 1 per user                                                               | Aggregate snapshot                      |
| `ProgressSnapshot` history | 0.5 KB — 2 KB       | 1 per completed lesson session                                           | History can grow with use               |
| `SyncQueueItem`            | 1 KB — 4 KB         | Usually 0 — 50 per user                                                  | Payload size drives variance            |
| `DownloadGrant`            | < 1 KB              | Usually 0 — 2 live grants per user per lesson                            | Very short-lived                        |

### Capacity Note

All item shapes remain well below DynamoDB's 400 KB item limit in the MVP.

## 10. Indexing Strategy Summary

| Index                      | Why It Exists                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `GSI1_UserSessionTimeline` | Supports listing a user's sessions by `userId` without scanning the base table                        |
| `GSI2_LessonCatalog`       | Supports lesson catalog browsing and the recommendation surface by lesson level and publication state |
| Base table user partitions | Support direct profile, consent, progress, sync queue, and deletion workflows                         |
| Base table session items   | Support direct `GetItem` by `sessionId`                                                               |
| Base table lesson items    | Support direct lesson detail lookups by `lessonId`                                                    |

## 11. Design Notes and Constraints

- No DAX is used in MVP
- No Streams are used in MVP
- No cross-region replication is used in MVP
- No additional durable entities are introduced beyond the LLD models and the supporting short-lived download grant
- The design favors simple query patterns and predictable item growth over elaborate normalization
