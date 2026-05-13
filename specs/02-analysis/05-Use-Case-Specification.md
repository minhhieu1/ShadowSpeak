# Use Case Specification

**Project:** ShadowSpeak (Audio-first English Shadowing Practice)  
**Document Type:** Use Case Specification  
**Date:** 2026-05-12  
**Status:** Draft  
**Version:** 1.1  
**Owner:** Product Manager / Business Analyst

---

## 1. Introduction

This Use Case Specification describes the primary user interactions for the ShadowSpeak MVP: an audio-first English shadowing practice app that helps learners build a daily speaking habit through reference audio, user recording, progress tracking, local reminders, and ad-supported access.

The document complements the Functional Requirements Specification and Non-Functional Requirements Document by mapping ShadowSpeak requirements into task-oriented flows for product, design, engineering, and QA review.

**References**

- Business Requirements Document (`specs/01-initiation-discovery/03-Business-Requirements-Document.md`)
- Functional Requirements Specification (`specs/02-analysis/03-Functional-Requirements-Specification.md`)
- Non-Functional Requirements Document (`specs/02-analysis/04-Non-Functional-Requirements-Document.md`)

---

## 2. Scope

**In Scope**

- Learner onboarding, age gate, and authentication
- Lesson discovery and daily recommendation
- Returning-user daily practice flow
- Audio-first shadowing practice
- Local recording and playback comparison
- Progress tracking and streak updates
- Offline lesson download and practice
- Local reminder notifications
- Settings and account management
- Audio interstitial ads at session boundaries

**Out of Scope**

- Real-time AI pronunciation scoring
- Live speech recognition or transcription
- Subscription or premium purchase flows
- Social sharing, leaderboards, and user-generated lessons
- Server-side push notification campaigns
- Waveform visualization and other advanced comparison features
- Streak freezes
- Cached offline ads
- Advanced personalization beyond consented ad targeting

---

## 3. Actors

| Actor | Description |
|-------|-------------|
| Learner | Primary mobile app user practicing English through shadowing. |
| Authentication Provider | External identity service for email, Google, or Apple sign-in. |
| Content Service | Backend service that provides lesson metadata, scripts, and audio asset URLs. |
| Progress Service | Backend service that stores session completion, practice minutes, and streak data. |
| Ad Network | Third-party ad provider used for ad-supported monetization. |
| Mobile OS | iOS or Android runtime providing microphone, audio playback, notifications, background audio, Bluetooth routing, and local storage. |
| Consent Store | App-managed consent state for age gate, privacy, and ad personalization choices. |

---

## 4. Use Case Catalog

| Use Case ID | Title | Primary Actor | Priority |
|-------------|-------|---------------|----------|
| UC-01 | Complete First-Time Onboarding | Learner | High |
| UC-02 | Browse and Select a Lesson | Learner | High |
| UC-03 | Complete a Shadowing Practice Session | Learner | High |
| UC-04 | Compare Recording with Reference Audio | Learner | Medium |
| UC-05 | Returning-User Daily Practice Flow | Learner | High |
| UC-06 | Download and Practice Offline | Learner | High |
| UC-07 | Manage Local Reminder Notifications | Learner | High |
| UC-08 | Track Practice Progress and Sync | Learner | High |
| UC-09 | Serve Audio Interstitial Ad | Ad Network | High |
| UC-10 | Manage Settings and Account | Learner | High |
| UC-11 | Handle Age Gate and Consent | Learner | High |

---

## Traceability Matrix

| Use Case ID | Objectives | KPIs | Functional Requirements | Non-Functional Requirements | Priority | Owner |
|-------------|------------|------|-------------------------|-----------------------------|----------|-------|
| UC-01 | OBJ-1, OBJ-2 | Onboarding completion, DAU | FR-1, FR-8 | NFR-13, NFR-15, NFR-19 | High | Product / Auth |
| UC-02 | OBJ-1, OBJ-4 | Practice starts, lesson discovery rate | FR-2, FR-7 | NFR-3, NFR-12, NFR-18 | High | Product / Content |
| UC-03 | OBJ-1, OBJ-3 | Practice minutes, retention | FR-3, FR-4, FR-5 | NFR-2, NFR-6, NFR-20 | High | Mobile Engineering |
| UC-04 | OBJ-1 | Retention, repeat practice | FR-4 | NFR-14, NFR-20 | Medium | Mobile Engineering |
| UC-05 | OBJ-1 | DAU, 7-day retention, streak length | FR-2, FR-5, FR-8 | NFR-12, NFR-21 | High | Product / Mobile |
| UC-06 | OBJ-1 | Practice minutes, offline completion rate | FR-7 | NFR-10, NFR-12 | High | Mobile Engineering |
| UC-07 | OBJ-1 | Daily return rate, reminder opt-in rate | FR-8 | NFR-13, NFR-14 | High | Mobile Engineering |
| UC-08 | OBJ-1, OBJ-2 | Practice minutes, streak length, sync success rate | FR-5, FR-8 | NFR-12, NFR-20 | High | Backend Engineering |
| UC-09 | OBJ-2 | Gross ad revenue per 1k MAU | FR-6 | NFR-13, NFR-15 | High | Monetization |
| UC-10 | OBJ-1, OBJ-2 | Retention, support deflection, deletion completion | FR-8 | NFR-13, NFR-14 | High | Product / Mobile |
| UC-11 | OBJ-2, OBJ-5 | Consent completion, ad eligibility compliance | FR-1, FR-6, FR-8 | NFR-13, NFR-15 | High | Product / Legal |

---

## 5. Detailed Use Cases

### UC-01: Complete First-Time Onboarding

**Actors**

- Primary: Learner
- Supporting: Authentication Provider, Mobile OS, Consent Store

**Preconditions**

- Learner has installed ShadowSpeak on a supported iOS 16+ or Android 10+ device.
- Network connectivity is available.
- Authentication Provider is reachable.

**Success Postconditions**

- Learner account is created or authenticated.
- Learner proficiency level and reminder preference are saved.
- Required microphone and notification permission prompts have been completed or deferred.
- Learner lands on the home screen with a recommended lesson.

**Failure Postconditions**

- No partial account is activated without successful authentication.
- Underage learners are blocked from account creation.
- Permission denial is recorded locally so the app can show recovery guidance later.

**Main Success Scenario**

1. Learner opens ShadowSpeak for the first time.
2. App presents concise onboarding screens explaining shadowing and daily practice.
3. App shows the age gate and privacy consent step.
4. Learner confirms eligibility and accepts the required notices.
5. Learner chooses a sign-in method.
6. Authentication Provider validates the learner and returns a valid session.
7. Learner selects an English proficiency level.
8. Learner chooses a daily reminder time or skips reminders.
9. App requests microphone permission before the first recording-dependent action.
10. App saves onboarding choices.
11. App displays the home screen with a recommended starter lesson.

**Extensions / Alternate Flows**

- 4a. Learner is underage: App blocks account creation and shows the age policy message.
- 6a. Authentication fails: App shows a retryable error and keeps the learner on the sign-in step.
- 8a. Learner denies notification permission: App disables reminders and provides a settings recovery path.
- 9a. Learner denies microphone permission: App allows listening-only preview but blocks recording with permission guidance.

**Acceptance Criteria**

- Given a new learner who passes the age gate, when they complete required consent and sign in, then the app creates the account and lands them on the home screen within the onboarding flow.
- Given a new learner who denies microphone permission, when they try to start recording later, then the app blocks recording and shows a permission recovery path.
- Given a learner who is underage, when they continue the onboarding flow, then the app prevents account creation and does not request personalized ads consent.

**Business Rules**

- UC-BR-01, UC-BR-02, UC-BR-08, UC-BR-12

**Special Requirements**

- Onboarding should complete within 3 minutes for most learners.
- Permission copy must be clear about why microphone access is needed.
- Authentication traffic must use TLS 1.2 or higher.

---

### UC-02: Browse and Select a Lesson

**Actors**

- Primary: Learner
- Supporting: Content Service

**Preconditions**

- Learner is authenticated or otherwise allowed to view lesson content.
- Content Service has available lesson metadata.

**Success Postconditions**

- Learner selects a lesson.
- App loads lesson metadata, script, and audio asset references.
- Selected lesson is ready to start or download.

**Failure Postconditions**

- Learner remains in the catalog or home screen.
- App shows a retry or empty-state message without losing local state.

**Main Success Scenario**

1. Learner opens the home screen or lesson library.
2. App displays a daily recommended lesson and available lesson categories.
3. Learner filters or browses by level, topic, or duration.
4. App retrieves matching lesson metadata.
5. Learner selects a lesson.
6. App opens the lesson detail screen with duration, level, topic, and start action.

**Extensions / Alternate Flows**

- 4a. No lessons match filters: App shows "No lessons found" and offers filter reset.
- 4b. Network is unavailable: App shows downloaded lessons if available and marks the online catalog as unavailable.
- 5a. Lesson has been unpublished or deleted: App prevents session start, removes it from the current view, and offers another lesson.

**Acceptance Criteria**

- Given a lesson exists and is available, when the learner selects it, then the app opens the lesson detail screen with the correct metadata.
- Given a lesson is unpublished or deleted, when the learner selects it from a stale entry point, then the app blocks launch and returns them to a valid lesson choice.
- Given no lessons match a filter, when the learner applies that filter, then the app shows an empty state and keeps the prior filter state editable.
- Given the network is unavailable and no cached metadata exists, when the learner opens the library, then the app shows an offline or empty state without clearing the current filters.

**Business Rules**

- UC-BR-03, UC-BR-11, UC-BR-12

**Special Requirements**

- Catalog pagination should remain responsive under normal mobile network conditions.
- Lesson metadata must include level, topic, duration, and asset availability.

---

### UC-03: Complete a Shadowing Practice Session

**Actors**

- Primary: Learner
- Supporting: Mobile OS, Content Service, Progress Service

**Preconditions**

- Learner has selected a playable lesson.
- Audio output is available.
- Microphone permission is granted if recording is enabled.
- Required lesson assets are streamed or stored locally.

**Success Postconditions**

- Reference audio playback completes or the learner ends the session.
- Learner recording is saved locally when recording is enabled.
- Practice duration and completion status are queued for sync.
- Learner is offered playback comparison or next-step actions.

**Failure Postconditions**

- Incomplete session is not counted as completed unless it meets the completion threshold.
- Any recoverable progress is saved locally.
- App provides a clear retry path for playback, recording, or sync errors.

**Main Success Scenario**

1. Learner taps Start on a selected lesson.
2. App verifies audio asset availability and microphone readiness.
3. App starts reference audio playback.
4. Learner shadows the reference audio aloud.
5. App records learner audio locally while the reference audio plays.
6. Learner pauses, resumes, or completes the session.
7. App saves the local recording and session metrics.
8. App displays the completion state and comparison option.

**Extensions / Alternate Flows**

- 2a. Audio asset is unavailable: App shows "Unable to load lesson, please try again."
- 2b. Microphone is unavailable: App allows listening-only practice and explains how to enable recording.
- 2c. Microphone permission is revoked during the session: App pauses recording, keeps audio playback available where possible, and shows a recovery prompt.
- 3a. Learner backgrounds the app: App continues playback where OS background audio permissions allow.
- 3b. Incoming phone call or audio interruption occurs: App pauses playback and recording, then resumes only if the session can continue safely.
- 3c. Bluetooth route changes mid-session: App rebinds audio output or pauses briefly, then resumes without losing the recording state.
- 5a. Device storage becomes full during recording: App stops the recording, saves any recoverable draft, and shows storage guidance.
- 6a. Learner exits early: App saves partial time but does not mark the lesson completed unless the threshold is met.
- 7a. App is terminated during recording: App marks the session interrupted, preserves any recoverable local draft, and does not mark the lesson complete.
- 8a. Network sync fails: App stores metrics locally and retries on the next available connection.

**Acceptance Criteria**

- Given a learner has microphone permission, when they start a lesson, then reference audio begins and a local recording is created.
- Given microphone permission is revoked during a session, when the app detects the change, then it stops recording, preserves playback where possible, and prompts the learner to restore permission.
- Given the app is interrupted by a phone call or Bluetooth route change, when the interruption ends, then the app resumes only if it can continue without corrupting the session state.
- Given device storage fills during recording, when recording cannot continue, then the app stops the session, preserves any recoverable draft, and marks the lesson incomplete.
- Given the app terminates during recording, when the learner reopens it, then the app restores the interrupted state and does not mark the lesson complete unless the completion threshold was already met.

**Business Rules**

- UC-BR-03, UC-BR-04, UC-BR-06, UC-BR-12

**Special Requirements**

- Audio playback should begin quickly after the learner starts the session.
- Recording and reference audio playback should remain sufficiently synchronized for self-comparison.
- Screen-off playback and lock-screen controls should work on supported OS versions.
- App must provide safety copy discouraging use while driving or in unsafe contexts.

---

### UC-04: Compare Recording with Reference Audio

**Actors**

- Primary: Learner
- Supporting: Mobile OS

**Preconditions**

- Learner completed or partially completed a recorded practice session.
- Reference audio and learner recording are available on device.

**Success Postconditions**

- Learner can replay reference audio, learner recording, or both for manual self-comparison.
- Learner can repeat the lesson or return to the lesson list.

**Failure Postconditions**

- Corrupted or missing recordings are not used.
- Learner receives a clear message and can retry the practice session.

**Main Success Scenario**

1. App displays the post-session comparison screen.
2. Learner chooses reference-only, recording-only, or side-by-side playback.
3. App plays the selected audio mode.
4. Learner listens for pronunciation, rhythm, and intonation differences.
5. Learner chooses to repeat, finish, or start another lesson.

**Extensions / Alternate Flows**

- 2a. Learner skips comparison: App marks the session result and returns to progress or home.
- 3a. Recording file is unavailable: App shows "Recording unavailable -- please try another session."
- 3b. Audio sync cannot be maintained: App falls back to separate reference-only and recording-only playback.

**Acceptance Criteria**

- Given a finished session with a valid local recording, when the learner opens comparison, then the app offers reference-only, recording-only, and side-by-side playback.
- Given the recording file is missing or corrupted, when the learner opens comparison, then the app shows an error and does not attempt playback.
- Given sync cannot be maintained, when the learner selects side-by-side mode, then the app falls back to separate playback modes without crashing.
- Given the learner chooses to skip comparison, when they exit the screen, then the app returns to progress or home without blocking the next action.

**Business Rules**

- UC-BR-03, UC-BR-04

**Special Requirements**

- Playback controls must be accessible and usable with one hand.
- Comparison playback should avoid overlapping UI instructions with audio controls.

---

### UC-05: Returning-User Daily Practice Flow

**Actors**

- Primary: Learner
- Supporting: Content Service, Progress Service, Mobile OS

**Preconditions**

- Learner has an existing account.
- App has a stored streak or progress record, or can create an empty one.

**Success Postconditions**

- Learner sees the daily recommended lesson or a valid fallback lesson.
- Learner can resume the last unfinished lesson, start the recommendation, or review progress.
- Reminder and streak context are visible before practice begins.

**Failure Postconditions**

- App does not lose the prior daily state if the recommended lesson is unavailable.
- If the app cannot hydrate progress, it falls back to local state and a starter lesson.

**Main Success Scenario**

1. Learner opens the app on a later day.
2. App restores the learner profile, streak state, and reminder status.
3. App displays today's recommended lesson and the last unfinished lesson if one exists.
4. Learner chooses to continue, start the recommendation, or browse another lesson.
5. App routes the learner into the selected flow without forcing a new onboarding step.

**Extensions / Alternate Flows**

- 3a. Recommended lesson is unpublished or deleted: App replaces it with a valid lesson before the learner starts.
- 3b. No network is available: App uses cached progress and locally available lesson metadata.
- 4a. Learner has already completed today's practice: App shows the completed state and suggests progress review or a new lesson for fun, without adding a second streak credit.

**Acceptance Criteria**

- Given a returning learner who opens the app, when the profile loads, then the app shows today's lesson, current streak, and the correct reminder status.
- Given the recommended lesson has been deleted, when the learner opens the home screen, then the app replaces it with a valid lesson before start.
- Given the learner already earned today's streak credit, when they practice again the same calendar day, then the app does not award another streak increment.
- Given progress cannot be hydrated from the backend, when the app opens, then it falls back to local state and still offers a valid starter lesson.

**Business Rules**

- UC-BR-05, UC-BR-11, UC-BR-12

**Special Requirements**

- The daily practice surface should be available within a few taps from launch.
- The screen must remain usable offline once cached progress is available.

---

### UC-06: Download and Practice Offline

**Actors**

- Primary: Learner
- Supporting: Content Service, Mobile OS

**Preconditions**

- Learner is online when initiating download.
- Device has sufficient storage.
- Lesson supports offline availability.

**Success Postconditions**

- Lesson audio, script, and metadata are stored locally.
- Lesson is marked available offline.
- Learner can complete the session without network connectivity.

**Failure Postconditions**

- Partial downloads are removed or safely resumable.
- Lesson is not marked offline-ready until integrity checks pass.

**Main Success Scenario**

1. Learner taps Download on a lesson.
2. App checks storage availability and network status.
3. App downloads lesson assets.
4. App verifies downloaded asset integrity.
5. App marks the lesson as available offline.
6. Learner starts the lesson while offline.
7. App records progress locally and syncs when network returns.

**Extensions / Alternate Flows**

- 2a. Storage is insufficient: App shows storage guidance and cancels download.
- 3a. Network drops: App pauses or fails the download with a retry option.
- 4a. Integrity check fails: App deletes invalid assets and prompts retry.
- 6a. Lesson has expired authorization or been removed from the catalog: App prevents offline start and prompts the learner to download another lesson.
- 7a. App remains offline after completion: Metrics stay queued locally.

**Acceptance Criteria**

- Given a lesson is marked offline-eligible and storage is sufficient, when the learner downloads it, then the lesson becomes playable without a network connection.
- Given storage is insufficient, when the learner taps Download, then the app cancels the download and shows storage guidance.
- Given the learner finishes an offline session, when connectivity returns, then the app queues the progress for sync without losing the local recording.
- Given a lesson has been unpublished or its authorization has expired, when the learner tries to open it offline, then the app blocks playback and points them to another downloadable lesson.

**Business Rules**

- UC-BR-06, UC-BR-07, UC-BR-09

**Special Requirements**

- Download progress should be visible and cancelable.
- Offline status must be clear without interrupting practice.

---

### UC-07: Manage Local Reminder Notifications

**Actors**

- Primary: Learner
- Supporting: Mobile OS

**Preconditions**

- Learner has a device that supports local notifications.
- Reminder permission is granted, or the learner is on the permission recovery path.

**Success Postconditions**

- A local reminder is scheduled for the chosen time.
- Tapping the reminder opens the app to the daily practice surface or the current recommended lesson.
- Reminder changes are reflected immediately in the local schedule.

**Failure Postconditions**

- If notifications are denied, no reminder is scheduled.
- The app keeps reminder settings editable from Settings.

**Main Success Scenario**

1. Learner opens the reminder settings.
2. App shows the current reminder time and permission status.
3. Learner schedules or changes a reminder time.
4. App saves the preference and updates the local notification schedule.
5. At the scheduled time, the mobile OS delivers the notification.
6. Learner taps the notification and lands on the daily practice flow.

**Extensions / Alternate Flows**

- 2a. Notification permission is denied: App shows that reminders are disabled and offers a settings shortcut.
- 4a. Learner disables reminders: App cancels the local schedule.
- 6a. Learner re-enables notifications later: App reschedules reminders after permission is restored.

**Acceptance Criteria**

- Given reminder permission is granted, when the learner schedules a time, then the app creates a local notification for that time.
- Given reminder permission is denied, when the learner opens reminder settings, then the app shows a recovery path and does not schedule a notification.
- Given the learner taps a reminder notification, when the app opens, then it routes directly to the daily practice surface.
- Given notifications were denied earlier and the learner later re-enables permission in system settings, when they return to the app, then reminders are rescheduled using the saved local preference.

**Business Rules**

- UC-BR-08, UC-BR-12

**Special Requirements**

- Reminder copy must explain that the schedule is local to the device.
- Reminder changes must not require a server push workflow.

---

### UC-08: Track Practice Progress and Sync

**Actors**

- Primary: Learner
- Supporting: Progress Service, Mobile OS

**Preconditions**

- Learner has completed at least part of one practice session.
- App has local or synced session metrics.

**Success Postconditions**

- Learner sees updated practice minutes, completed lessons, and streak status.
- Progress Service stores synced metrics when connectivity is available.

**Failure Postconditions**

- Local progress remains available if cloud sync fails.
- App avoids duplicate counting when retrying sync.

**Main Success Scenario**

1. Learner completes a practice session.
2. App calculates session duration and completion state.
3. App updates local progress immediately.
4. App syncs metrics to Progress Service.
5. Learner opens progress view.
6. App displays current streak, total practice time, and recent session history.

**Extensions / Alternate Flows**

- 4a. Sync fails because connectivity is lost: App queues the update and retries later.
- 4b. Sync fails because authentication expired: App preserves the local queue, refreshes the session if possible, and otherwise prompts the learner to sign in again.
- 4c. Duplicate sync attempt occurs: Progress Service ignores or merges duplicate session IDs.
- 6a. Learner has no history: App shows an empty state with a starter lesson action.

**Acceptance Criteria**

- Given a learner completes a session, when the session ends, then the app updates local progress immediately before attempting cloud sync.
- Given authentication expires during sync, when the app retries, then it keeps the local data queued and prompts re-authentication if token refresh fails.
- Given duplicate progress data is retried, when the Progress Service receives it again, then the service does not double-count the session.
- Given the app is offline or the backend is unavailable, when sync is attempted, then the app preserves the queue locally and retries later without dropping session data.

**Business Rules**

- UC-BR-05, UC-BR-06, UC-BR-10

**Special Requirements**

- Progress view should load from local data quickly, then refresh after sync.
- Metrics should support KPI reporting for retention, streaks, and practice minutes.

---

### UC-09: Serve Audio Interstitial Ad

**Actors**

- Primary: Ad Network
- Supporting: Learner, Mobile OS

**Preconditions**

- Learner has reached a monetized session boundary.
- Ad SDK is initialized where network and consent rules permit.
- Learner is eligible to receive ads under privacy, age, and region rules.

**Success Postconditions**

- Audio interstitial is displayed or played at the allowed boundary.
- Ad result is tracked.
- Learner can continue without losing session progress.

**Failure Postconditions**

- Failed ad load does not block lesson completion or progress updates.
- App records non-fatal ad errors for monitoring where appropriate.

**Main Success Scenario**

1. App reaches a configured session boundary.
2. App requests an audio interstitial from the Ad Network.
3. Ad Network returns a valid ad.
4. App plays the ad without interrupting saved progress.
5. App records impression or completion events.
6. Learner continues to home, comparison, or the next lesson.

**Extensions / Alternate Flows**

- 2a. Learner is offline: App skips the ad and continues.
- 3a. No fill from Ad Network: App skips the ad and records no-fill status.
- 4a. Ad playback fails: App closes the ad container and continues the learner flow.
- 4b. Learner has reached the daily frequency cap: App skips the ad.
- 4c. Personalized ads are not permitted: App serves only non-personalized inventory or skips the request if the policy requires it.

**Acceptance Criteria**

- Given a session boundary is reached and the cap has not been exceeded, when the ad request is made, then the app plays an audio interstitial.
- Given the learner is offline or the ad network has no fill, when the boundary is reached, then the app continues without blocking progress.
- Given the learner has not consented to personalized ads, when ads are requested, then the app does not send personalized targeting data.
- Given the learner has already reached 3 ads per day, when another boundary is reached, then the app skips the ad and continues the session flow.

**Business Rules**

- UC-BR-08, UC-BR-09, UC-BR-12

**Special Requirements**

- Ad failures must be non-blocking.
- Ad SDK integration must comply with App Store and Play Store policies.
- Ad events must not expose unnecessary personal data.

---

### UC-10: Manage Settings and Account

**Actors**

- Primary: Learner
- Supporting: Authentication Provider, Mobile OS, Progress Service

**Preconditions**

- Learner is authenticated.
- Current profile and settings state can be loaded locally or from the server.

**Success Postconditions**

- Playback speed, reminder settings, and profile data are updated.
- Selected recordings are deleted locally and from synced storage where applicable.
- Account deletion removes personal data according to policy.

**Failure Postconditions**

- Validation errors leave the prior settings unchanged.
- A failed deletion does not silently erase only part of the learner data.

**Main Success Scenario**

1. Learner opens Settings.
2. App shows playback speed, reminder, profile, recording, and account options.
3. Learner changes playback speed.
4. App saves the new speed and applies it to future playback.
5. Learner updates reminder preferences or profile fields.
6. App validates and saves the changes.
7. Learner deletes a recording or requests account deletion.
8. App confirms the action and removes the data according to the selected scope.

**Extensions / Alternate Flows**

- 3a. Playback speed value is outside the supported range: App rejects the value and keeps the current setting.
- 5a. Reminder permission is off: App offers the local notification recovery path.
- 7a. Recording deletion is requested for a synced recording: App deletes the local copy and queues the remote deletion if needed.
- 7b. Account deletion is requested: App signs the learner out, removes local data, and initiates backend deletion.

**Acceptance Criteria**

- Given a valid playback speed selection, when the learner saves Settings, then future sessions use the new speed.
- Given a recording is selected for deletion, when the learner confirms, then the app deletes the local copy and no longer shows it in playback lists.
- Given the learner requests account deletion, when the action is confirmed, then the app signs the learner out and removes personal data according to policy.
- Given the learner enters an unsupported playback speed, when they save Settings, then the app rejects the value and keeps the previous speed.
- Given a synced recording is deleted, when the deletion completes, then the app removes the local copy and queues the remote deletion for sync.
- Given account deletion fails on the backend, when the app receives the error, then it keeps the learner signed in until deletion can be completed and shows a retryable error.
- Given reminder permission is off, when the learner opens Settings, then the app shows the local notification recovery path instead of silently changing the preference.

**Business Rules**

- UC-BR-04, UC-BR-08, UC-BR-10, UC-BR-12

**Special Requirements**

- Supported playback speeds should be 0.75x, 1.0x, 1.25x, and 1.5x.
- Deletion flows must use explicit confirmation before action is taken.

---

### UC-11: Handle Age Gate and Consent

**Actors**

- Primary: Learner
- Supporting: Authentication Provider, Ad Network, Consent Store

**Preconditions**

- Learner is at the age gate, account creation step, or ad personalization step.

**Success Postconditions**

- Learner eligibility is recorded.
- Consent choices are stored.
- Account creation can continue only when the age gate is passed.
- Personalized ads are used only when permitted by age and consent.

**Failure Postconditions**

- If age eligibility is not met, account creation stops.
- If consent is declined, personalized ads are disabled without breaking core practice flows.

**Main Success Scenario**

1. App presents the age gate before account creation.
2. Learner confirms eligibility.
3. App presents privacy and ad-consent choices.
4. Learner accepts or declines each optional choice.
5. App stores the consent state.
6. App continues to account creation or returns to the prior flow.

**Extensions / Alternate Flows**

- 2a. Learner does not meet the age requirement: App blocks account creation and shows the eligibility message.
- 4a. Learner declines ad personalization: App disables personalized ad requests.
- 5a. Consent is withdrawn later: App updates the stored choice and stops requesting personalized ads.

**Acceptance Criteria**

- Given a learner does not meet the age requirement, when they continue the age gate, then the app blocks account creation.
- Given the learner declines personalized ads, when the app reaches an ad boundary later, then the app sends only non-personalized or no ad request according to policy.
- Given the learner later changes consent, when they reopen consent settings, then the stored choice updates and the new choice applies immediately.
- Given the learner is underage, when they reach the age gate, then the app stops the account flow before any personalized ad consent is requested.
- Given consent is withdrawn later, when the learner saves the new choice, then the app stops requesting personalized ads and preserves core practice access.

**Business Rules**

- UC-BR-01, UC-BR-08, UC-BR-09, UC-BR-12

**Special Requirements**

- Consent language must be concise and legible on mobile screens.
- The app must not request personalized ad targeting before age verification is complete.

---

## 6. Cross-Cutting Business Rules

| ID | Rule | BRD Mapping | FRS Mapping | NFR Mapping |
|----|------|-------------|-------------|-------------|
| UC-BR-01 | Minimum age for account creation is 13, and age eligibility must be confirmed before any account is created or personalized ads are requested. | OBJ-2, OBJ-5 | FR-1, FR-6, FR-8 | NFR-13, NFR-15 |
| UC-BR-02 | First-time onboarding must complete within 3 minutes for most learners. | OBJ-1 | FR-1, FR-8 | NFR-19 |
| UC-BR-03 | "Reference audio" is the standard term for lesson-model audio across the product and specification set. | OBJ-1, OBJ-3 | FR-3, FR-4 | NFR-2 |
| UC-BR-04 | Lesson completion counts only when the learner reaches 90% of lesson duration or explicitly ends the session after 90% has elapsed. | OBJ-1 | FR-3, FR-5 | NFR-21 |
| UC-BR-05 | Streaks increment once per local calendar day in the learner's device timezone; streak freezes are excluded from MVP. | OBJ-1 | FR-5 | NFR-21 |
| UC-BR-06 | Progress and recording sync are local-first; the app queues data immediately, retries after connectivity returns, and handles expired auth before retrying. | OBJ-1 | FR-5 | NFR-12, NFR-20 |
| UC-BR-07 | Offline lesson storage quota is 500 MB per learner, and only downloaded lessons may be played offline. | OBJ-1 | FR-7 | NFR-10, NFR-12 |
| UC-BR-08 | Local reminders are scheduled on-device only; server push notification campaigns are not used in MVP. | OBJ-1 | FR-8 | NFR-13 |
| UC-BR-09 | Ads use one MVP format only: audio interstitial at session boundaries, with a cap of 3 ads per day and no blocking behavior. | OBJ-2 | FR-6 | NFR-15 |
| UC-BR-10 | Account deletion removes profile data, progress data, and recordings from local and synced storage according to policy. | OBJ-2 | FR-8 | NFR-13 |
| UC-BR-11 | Deleted or unpublished lessons must be hidden or replaced and cannot be launched from any entry point. | OBJ-4 | FR-2, FR-7 | NFR-11 |
| UC-BR-12 | Supported OS targets are iOS 16+ and Android 10+, with background audio, notifications, Bluetooth routing, and lock-screen behavior following platform rules. | OBJ-3 | FR-3, FR-7, FR-8 | NFR-18 |

---

## 7. Special Requirements Summary

- **Performance:** Lesson start, playback controls, reminder delivery, and progress updates should feel immediate under normal mobile conditions.
- **Reliability:** Playback, recording, and local progress capture must tolerate phone calls, audio interruptions, Bluetooth route changes, app termination, and network loss.
- **Privacy:** Age gating, consent capture, recording retention, and deletion flows must be explicit and auditable.
- **Accessibility:** Core controls must support screen readers, sufficient contrast, and mobile tap target guidance.
- **Safety:** App copy should discourage hands-free practice in unsafe contexts such as driving.
- **Platform Support:** MVP targets iOS 16+ and Android 10+ with background audio, lock-screen controls, local notifications, and local storage support.
- **MVP Acceptance Criteria:** Onboarding should complete within 3 minutes; lesson completion should use the fixed 90% threshold; recording and progress sync should remain queued until connectivity and valid auth return, with a practical tolerance of 5 minutes after reconnection; ads are capped at 3 per day; offline storage is capped at 500 MB; streaks follow the local device calendar day.
- **Excluded from MVP:** Waveform visualization, streak freezes, cached offline ads, and advanced personalization.

---

## 8. Open Issues / Assumptions

All MVP assumptions captured below are recorded as decision records; no unresolved open assumptions remain in this revision.

### Decision Records

| ID | Decision Record | Owner | Due Date | Status |
|----|-----------------|-------|----------|--------|
| DR-01 | Guest mode is not included in the MVP; learners must complete age-gate and authentication before access. | Product / Legal | 2026-05-19 | Locked |
| DR-02 | MVP authentication methods are email/password, Google, and Apple sign-in. | Product / Auth | 2026-05-19 | Locked |
| DR-03 | Session completion threshold is fixed at 90% of lesson duration. | Product / Analytics | 2026-05-19 | Locked |
| DR-04 | Streak boundaries use the learner's local device timezone, and no streak freeze is available in MVP. | Product / Analytics | 2026-05-19 | Locked |
| DR-05 | Offline storage quota is 500 MB per learner. | Product / Engineering | 2026-05-19 | Locked |
| DR-06 | Ads use a single MVP format: audio interstitial, capped at 3 per day. | Product / Monetization | 2026-05-19 | Locked |
| DR-07 | Recording and progress sync are local-first and retry automatically; expired auth triggers re-authentication before retry. | Engineering | 2026-05-19 | Locked |
| DR-08 | Waveform visualization is deferred to future work. | Product / Design | 2026-05-19 | Locked |
| DR-09 | iOS 16+ and Android 10+ are the supported MVP OS targets. | Engineering | 2026-05-19 | Locked |

---

## 9. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-05-12 | Product Manager / Business Analyst | Initial Use Case Specification for ShadowSpeak MVP |
| 1.1 | 2026-05-12 | Product Manager / Business Analyst | Alignment Review update: added returning-user, reminder, settings, and age-gate use cases; renamed native audio to reference audio; standardized audio interstitial ads; added traceability and decision records; updated MVP acceptance criteria and OS support targets. |

---

*Updated per the Alignment Review feedback dated 2026-05-12.*
