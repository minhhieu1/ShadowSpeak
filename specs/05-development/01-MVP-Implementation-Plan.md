# ShadowSpeak MVP Implementation Plan

## Document Metadata

| Field     | Value                      |
| --------- | -------------------------- |
| Project   | ShadowSpeak                |
| Type      | Solo MVP Implementation    |
| Phase     | 05 - Development           |
| Date      | 2026-05-16                 |
| Status    | Draft                      |
| Owner     | Solo Dev                   |

## How to Use This

Each epic corresponds to a user story document in `specs/02-analysis/06-user-story/`. Tasks are ordered by dependency — start at the top of each epic. Check off tasks as you go.

---

## Epic 01 — Onboarding (`01-onboarding.md`)

### Layer: Frontend (React Native)

| # | Task | Depends On |
|---|------|------------|
| 1.1 | Age Gate screen (date picker + underage block) | — |
| 1.2 | Privacy & Ad Consent screen | 1.1 |
| 1.3 | Social sign-in buttons (Google/Apple) | 1.2 |
| 1.4 | Email/password sign-up + validation | 1.2 |
| 1.5 | Returning user sign-in screen | 1.4 |
| 1.6 | Forgot password / reset flow | 1.5 |
| 1.7 | Intro screens (swipe-through) | 1.3/1.4 |
| 1.8 | Level selection screen | 1.7 |
| 1.9 | Reminder setup + notification permission | 1.8 |
| 1.10 | Microphone permission screen | 1.9 |
| 1.11 | Deep-link handler for notification taps | 1.9 |

### Layer: Backend (Python FastAPI)

| # | Task | Depends On |
|---|------|------------|
| 1.12 | Cognito JWT verification middleware | — |
| 1.13 | `GET/PUT /consent` endpoints | 1.12 |
| 1.14 | `GET/PUT /me` profile endpoints | 1.12 |
| 1.15 | Pre-auth consent bootstrap (X-Device-Id) | 1.13 |
| 1.16 | Consent re-key after Cognito sign-in | 1.15 |
| 1.17 | Consent audit logging | 1.13 |
| 1.18 | `DELETE /account` (soft-delete, 30-day grace) | 1.14 |

---

## Epic 02 — Lesson Discovery (`02-lesson-discovery.md`)

### Layer: Frontend

| # | Task | Depends On |
|---|------|------------|
| 2.1 | Home screen with recommended lesson card | 1.11 |
| 2.2 | Lesson catalog screen with level/topic filters | 2.1 |
| 2.3 | Lesson detail screen | 2.2 |
| 2.4 | Offline library screen (downloaded only) | 2.2 |
| 2.5 | Offline mode banner | 2.4 |
| 2.6 | Stale lesson / loading failure error states | 2.3 |

### Layer: Backend

| # | Task | Depends On |
|---|------|------------|
| 2.7 | `GET /lessons` with filter + cursor pagination | 1.12 |
| 2.8 | `GET /lessons/{id}` lesson detail | 2.7 |
| 2.9 | `GET /home/recommendation` | 2.8 |
| 2.10 | `POST /downloads/{lessonId}/url` (signed S3 URL) | 2.8 |
| 2.11 | `POST /downloads/{lessonId}/verify` | 2.10 |
| 2.12 | DynamoDB lesson catalog GSI2 seeding | 2.7 |

### Layer: Infrastructure

| # | Task | Depends On |
|---|------|------------|
| 2.13 | S3 bucket for audio assets + CloudFront distribution | — |
| 2.14 | Content publishing script (semi-manual) | 2.13 |

---

## Epic 03 — Practice Session (`03-shadowing-session.md`)

### Layer: Frontend (React Native + Native Modules)

| # | Task | Depends On |
|---|------|------------|
| 3.1 | AudioPlayback native module (iOS AVAudioSession) | — |
| 3.2 | AudioPlayback native module (Android ExoPlayer) | — |
| 3.3 | Screen-off playback + lock screen controls | 3.1/3.2 |
| 3.4 | Bluetooth routing (A2DP/SCO) | 3.1/3.2 |
| 3.5 | Practice session screen (play/pause/restart UI) | 3.1/3.2 |
| 3.6 | Recording native module (iOS + Android) | — |
| 3.7 | Auto-record during session | 3.5, 3.6 |
| 3.8 | Recording failure handling | 3.7 |
| 3.9 | Post-session review screen (reference + user playback) | 3.7 |
| 3.10 | Dual-track comparison (solo_native / solo_user / simultaneous) | 3.9 |
| 3.11 | Early session termination dialog | 3.5 |
| 3.12 | Audio loading failure error state | 3.5 |

### Layer: Backend

| # | Task | Depends On |
|---|------|------------|
| 3.13 | `POST /sessions` start session | 1.12 |
| 3.14 | `PATCH /sessions/{id}` pause/resume | 3.13 |
| 3.15 | `POST /sessions/{id}/complete` (idempotent by clientMutationId) | 3.14 |
| 3.16 | `GET /sessions/{id}` for crash recovery | 3.13 |

---

## Epic 04 — Progress & Retention (`04-progress-retention.md`)

### Layer: Frontend

| # | Task | Depends On |
|---|------|------------|
| 4.1 | Home screen progress summary card (streak + daily) | 3.15 |
| 4.2 | Progress history screen (reverse-chronological) | 4.1 |
| 4.3 | Streak calculation (local, using completed sessions) | 4.1 |
| 4.4 | Milestone celebration overlay (7-day, 30-day) | 4.3 |
| 4.5 | Offline progress queue + auto-sync on reconnect | 3.15 |
| 4.6 | Resume practice prompt after interruption | 3.11 |
| 4.7 | Daily reminder notification (local) | 1.9 |

### Layer: Backend

| # | Task | Depends On |
|---|------|------------|
| 4.8 | `GET /progress` aggregate snapshot | 3.15 |
| 4.9 | `GET /progress/history` paginated history | 4.8 |
| 4.10 | `POST /progress/sync` offline batch reconciliation | 3.15 |
| 4.11 | Sync queue idempotency (clientMutationId dedup) | 4.10 |

---

## Epic 05 — Settings & Account (`05-settings-account-management.md`)

### Layer: Frontend

| # | Task | Depends On |
|---|------|------------|
| 5.1 | Settings hub screen (6 entry points) | 1.11 |
| 5.2 | Playback speed selector (0.5× – 1.5×) | 5.1, 3.1/3.2 |
| 5.3 | Reminder settings (enable/disable + time picker) | 5.1 |
| 5.4 | Notification permission recovery flow | 5.3 |
| 5.5 | Consent settings (privacy + ad toggles) | 5.1 |
| 5.6 | Profile settings (display name edit) | 5.1 |
| 5.7 | Recording library screen | 5.1, 3.7 |
| 5.8 | Recording delete with confirmation | 5.7 |
| 5.9 | Sign out flow | 5.1 |
| 5.10 | Delete account (warning → confirm → execute) | 5.9 |

---

## Cross-cutting Concerns

| # | Task | Layer |
|---|------|-------|
| C.1 | FastAPI project scaffold + middleware chain | Backend |
| C.2 | DynamoDB single-table `ShadowSpeakMain` + 2 GSIs | Infra |
| C.3 | API Gateway + Lambda deployment (dev/staging/prod) | Infra |
| C.4 | Cognito user pool setup | Infra |
| C.5 | AdMob SDK initialization + consent-aware request | Mobile |
| C.6 | Ad interstitial preload + show at session boundary | Mobile |
| C.7 | Frequency capping (2 ads/day, local counter) | Mobile |
| C.8 | Encrypted SQLite local store setup | Mobile |
| C.9 | Zustand stores (auth, consent, lessons, session, sync) | Mobile |
| C.10 | Global error boundary + unhandled promise handler | Mobile |
| C.11 | Structured JSON logging (CloudWatch) | Backend |
| C.12 | GitHub Actions CI (backend test + deploy) | Infra |
| C.13 | EAS Build config for mobile releases | Infra |

---

## Suggested Build Order

| Phase | Epics | Milestone |
|-------|-------|-----------|
| **Phase 1** | C.1–C.4 + Epic 01 (backend + frontend) | User can onboard fully |
| **Phase 2** | C.8–C.9 + Epic 02 | User can browse and download lessons |
| **Phase 3** | C.5–C.7 + Epic 03 | User can complete a full practice session |
| **Phase 4** | C.10–C.13 + Epic 04 + Epic 05 | Progress tracking, settings, polish, deploy |

---

## Revision History

| Version | Date       | Author   | Description                                       |
| ------- | ---------- | -------- | ------------------------------------------------- |
| 1.0     | 2026-05-16 | Solo Dev | Initial MVP implementation plan from 5 epics |
