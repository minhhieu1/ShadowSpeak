# User Story Document

**Project:** ShadowSpeak  
**Document Type:** User Story Document  
**Date:** 2026-05-12  
**Status:** Draft  
**Version:** 1.0  
**Owner:** Product Manager / Product Owner

## Brief Description

This document captures the core MVP user stories for ShadowSpeak, an audio-first English shadowing practice app. The stories focus on the main learner journey: onboarding, selecting a lesson, completing a shadowing practice session, and returning to practice consistently with progress saved.

## User Story 1: First-Time Onboarding and Access

**Title:** First-Time Onboarding and Access

**User Story:** As a new learner, I want to create an account, confirm my eligibility, and set up my practice preferences so that I can start using ShadowSpeak with a personalized daily routine.

**Acceptance Criteria:**

- Given I am a new learner, when I open the app for the first time, then I am shown an onboarding flow that explains the app and the shadowing practice concept.
- Given I am eligible to use the app, when I complete the required consent and sign-in steps, then my account is created or authenticated successfully.
- Given I choose a practice level and reminder preference, when I finish onboarding, then those settings are saved to my profile.
- Given I deny microphone permission, when I later try to start a practice session, then the app explains why microphone access is needed and blocks recording until permission is granted.
- Given I am underage, when I continue onboarding, then the app blocks account creation and does not proceed to the main experience.

**Priority:** High

**Related Functional Requirement(s):** FR-1, FR-8

**Assumptions / Constraints:**

- The MVP uses email/password or social sign-in only.
- No real-time AI coaching or pronunciation scoring is included in onboarding.
- Consent, privacy, and age-gate requirements must be completed before access to practice content.

## User Story 2: Browse and Start a Lesson

**Title:** Browse and Start a Lesson

**User Story:** As a returning learner, I want to browse recommended lessons and start one quickly so that I can begin practice without friction.

**Acceptance Criteria:**

- Given I am signed in, when I open the home screen or lesson library, then I can see a recommended lesson and available lesson filters.
- Given lesson metadata is available, when I select a lesson, then the lesson detail screen shows the correct level, topic, and duration.
- Given a lesson is unavailable or removed, when I tap it from a stale view, then the app prevents launch and shows an alternative valid lesson choice.
- Given I have no network connection, when I open downloaded content, then the app still shows any cached lessons that are available offline.

**Priority:** High

**Related Functional Requirement(s):** FR-2, FR-7

**Assumptions / Constraints:**

- Lesson discovery is limited to the MVP lesson catalog.
- Free lessons only are shown in the MVP.
- Downloaded lessons must remain available offline if they were previously saved successfully.

## User Story 3: Complete a Shadowing Practice Session

**Title:** Complete a Shadowing Practice Session

**User Story:** As a learner, I want to listen to a lesson, record my voice, and replay my recording so that I can practice speaking and compare my performance with the native audio.

**Acceptance Criteria:**

- Given I start a lesson, when the practice session begins, then the audio playback starts and the recording channel is opened.
- Given the lesson is playing, when I record my voice, then the app captures my audio locally for the session.
- Given I finish the session, when I replay the lesson, then I can listen to my recording and the reference audio for self-comparison.
- Given the session completes successfully, when the app saves the result, then the session metrics are persisted to the cloud.
- Given recording fails or the lesson audio cannot load, when I try to continue, then the app shows a clear retryable error message.

**Priority:** High

**Related Functional Requirement(s):** FR-3, FR-4, FR-5

**Assumptions / Constraints:**

- The MVP does not include real-time speech recognition, AI scoring, or live feedback.
- Recording playback comparison is manual, not automated.
- Practice sessions are limited by the session rules defined in the FRS.

## User Story 4: Return to Practice and Track Progress

**Title:** Return to Practice and Track Progress

**User Story:** As a returning learner, I want to see my progress and resume today's practice so that I can build a consistent daily habit.

**Acceptance Criteria:**

- Given I return to the app, when I open the home screen, then I can see my current streak or progress status.
- Given I completed a prior session, when I return later, then my progress history is still available.
- Given I enabled reminders, when the scheduled time arrives, then the app can prompt me locally to return to practice.
- Given I have downloaded lessons, when I am offline, then I can still resume from the downloaded content without losing progress data already stored locally.

**Priority:** Medium

**Related Functional Requirement(s):** FR-5, FR-7, FR-8

**Assumptions / Constraints:**

- Progress syncing depends on the user being authenticated and having network connectivity.
- Reminder behavior is limited to local notifications in the MVP.
- Ad-supported access remains the only monetization model for the MVP; there are no subscriptions.

