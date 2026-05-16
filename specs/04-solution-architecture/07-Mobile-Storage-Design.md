# ShadowSpeak Mobile Storage Design

## Document Metadata

| Field         | Value                          |
| ------------- | ------------------------------ |
| Project       | ShadowSpeak                    |
| Document Type | Mobile Storage Design Document |
| Phase         | 04 - Solution Architecture     |
| Date          | 2026-05-14                     |
| Status        | Draft                          |
| Version       | 1.0                            |
| Owner         | Mobile Developer               |

> This document covers the **device-local** encrypted SQLite storage for the mobile client. See [06-Database-Design-Document.md](06-Database-Design-Document.md) for the server-side DynamoDB design.

## Source Basis

- [Low-Level-Design-Mobile.md](04-Low-Level-Design-Mobile.md)
- [Low-Level-Design-Backend.md](03-Low-Level-Design-Backend.md)
- [Database Design Document](06-Database-Design-Document.md)

## 1. Design Summary

The mobile app uses an **encrypted SQLite store** (or Realm equivalent) for:

- Offline lesson cache (downloaded assets with checksums for integrity)
- Session drafts created during offline practice
- Queued progress mutations for sync after reconnect
- Recording references (local-first, not uploaded in MVP)
- Ad frequency counters (daily cap enforcement)

## 2. Local Table Schemas

### 2.1 PracticeSession

```sql
CREATE TABLE practice_sessions (
    session_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('created', 'active', 'paused', 'completed', 'synced')),
    started_at TEXT NOT NULL,
    expires_at TEXT,
    completed_at TEXT,
    completion_percent INTEGER,
    recording_local_uri TEXT,
    client_mutation_id TEXT
);

CREATE INDEX idx_practice_sessions_user_started
    ON practice_sessions(user_id, started_at DESC);

CREATE INDEX idx_practice_sessions_status
    ON practice_sessions(status);
```

### 2.2 ProgressSnapshot

```sql
CREATE TABLE progress_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lesson_id TEXT,
    snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('current', 'history')),
    streak_days INTEGER NOT NULL,
    minutes_practiced INTEGER NOT NULL,
    last_practiced_at TEXT,
    completed_lesson_count INTEGER NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX idx_progress_snapshots_user_type_updated
    ON progress_snapshots(user_id, snapshot_type, updated_at DESC);
```

### 2.3 SyncQueueItem

```sql
CREATE TABLE sync_queue_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    client_mutation_id TEXT NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    next_retry_at TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'failed', 'synced'))
);

CREATE INDEX idx_sync_queue_items_user_status_retry
    ON sync_queue_items(user_id, status, next_retry_at);
```

### 2.4 CachedLesson

```ts
export type CachedLessonRow = {
  lessonId: LessonId;
  title: string;
  level: string;
  topic: string;
  thumbnailUrl: string;
  durationSeconds: number;
  audioAssetPath: string;
  scriptAssetPath: string;
  audioChecksum: string; // verified against LessonAsset.checksum after download
  scriptChecksum: string; // verified against LessonAsset.checksum after download
  sizeBytes: number; // used by StorageQuotaManager for accurate quota accounting
  downloadedAt: IsoDateTime;
};
```

### 2.5 ThumbnailCache

```ts
/**
 * Thumbnails are cached in app data under `thumbnails/<topic>.webp`.
 * The path is derived from `Lesson.thumbnailUrl` when downloaded.
 * All lessons sharing the same topic reuse the same cached file.
 */
export type ThumbnailCacheRow = {
  topic: string; // cache key, matches Lesson.topic
  localPath: string; // e.g. "thumbnails/conversation.webp"
  sourceUrl: string; // the CDN URL it was fetched from
  downloadedAt: IsoDateTime;
};
```

### 2.6 RecordingReference

Recordings are device-local only and are not uploaded by default in the MVP.

```ts
export type RecordingReferenceRow = {
  sessionId: SessionId;
  fileUri: string;
  checksum?: string;
  createdAt: IsoDateTime;
};
```

### 2.7 AdCounter

```ts
export type AdCounterRow = {
  userId: UserId;
  dateKey: string; // format: YYYY-MM-DD in device local time
  shownCount: number;
  updatedAt: IsoDateTime;
};
```

`AdCounterRow` is keyed by `(userId, dateKey)` and is the authoritative source for daily frequency capping enforced by `AdIntegrationController.canShowAd()`.

## 3. Storage Quota Management

```ts
export interface StorageQuotaManager {
  checkAvailable(requiredBytes: number): boolean;
  evictLeastRecentlyUsed(): Promise<void>;
}
```

- The per-user offline storage cap is **500 MB**.
- Eviction removes the least-recently-used downloaded lessons first.
- The quota manager should run before large downloads and again after download completion if the cache is close to the cap.
- If quota cannot be recovered, the download flow should transition to an `insufficient_storage` state.

```ts
export type DownloadStorageState =
  | "idle"
  | "checking"
  | "evicting"
  | "downloading"
  | "insufficient_storage"
  | "complete";
```

## 4. Local Storage Notes

- `payload_json` stores the serialized mutation payload for offline replay
- `snapshot_type = current` represents the aggregate progress snapshot
- `snapshot_type = history` represents completed lesson history rows
- the client can derive `lesson_id` as nullable for the current snapshot and populated for history rows
- local indexes should keep the newest session and retryable sync items cheap to read

## 5. Revision History

| Version | Date       | Author          | Description                                                    |
| ------- | ---------- | --------------- | -------------------------------------------------------------- |
| 1.0     | 2026-05-14 | Mobile Developer | Initial mobile storage design — extracted from unified DB design and LLD |
