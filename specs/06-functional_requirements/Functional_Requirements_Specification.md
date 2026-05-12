# Functional Requirements Specification

**Version:** 1.0

**Date:** 2026-05-11

**Owner:** Business Analyst / Product Manager

---

## 1. Introduction

**Purpose**

This Functional Requirements Specification (FRS) defines the functional behavior, validation criteria, business rules, and error handling for the ShadowSpeak audio-first English shadowing practice application. It serves as a definitive guide for designers, developers, QA, and stakeholders to ensure the system meets the agreed-upon business objectives.

**Scope**

The FRS covers all user-facing functionalities within the MVP, including content streaming, practice sessions, progress tracking, and ad-supported monetization. Backend services such as content generation (offline TTS and script creation) are referenced but not detailed here; they are covered in the TO-BE Process Document.

**References**

- TO-BE Process Document (specs/05-future_state_analysis/Future_State_Analysis.md)
- Business Requirements Document (specs/03-business-requirements/Business_Requirements_Document.md)
- AS-IS Analysis (specs/04-current_state_analysis/AS-IS_Analysis.md)
- Future State Analysis (specs/05-future_state_analysis/Future_State_Analysis.md)

---

## 2. Functional Overview

ShadowSpeak enables learners to improve English speaking fluency by listening to native-speaker audio recordings and simultaneously shadowing (repeating) the content. The system provides:

1. **Content Discovery** -- Browse, search, and filter lessons.
2. **Practice Sessions** -- Play audio, record user voice, and replay recording alongside native audio for self-comparison.
3. **Progress Tracking** -- Store session metrics (completion, time spent) and visualise trends.
4. **Ad-Supported Monetisation** -- Serve non-intrusive ads between lessons.
5. **Offline Capability** -- Download lessons for practice without internet connectivity.

No real-time AI processing is used inside the app during practice sessions. AI is only used offline for content generation (TTS voices, script writing) outside the app.

---

## 3. Detailed Functional Requirements

| ID | Description | Preconditions | Postconditions | Validation Criteria | Business Rules | Error Handling |
|----|-------------|---------------|----------------|---------------------|----------------|----------------|
| FR-1 | **User Registration & Authentication** -- Allow new users to create an account using email/password or social login (Google/Apple). | User has internet connectivity. | Account is created and a JWT token is issued. | Email format validated; password at least 8 characters with mixed case and numeric. | Account must be unique per email. | Show error if email already exists or network failure. |
| FR-2 | **Lesson Catalog Browsing** -- Display a paginated list of available lessons with filters (level, topic, duration). | User is authenticated. | List of lessons displayed according to filter criteria. | At least 20 lessons per page; filters return correct subset. | Only free lessons are shown in MVP. | Show message "No lessons found" when filter yields empty result. |
| FR-3 | **Start Practice Session** -- User selects a lesson and begins a practice session. | Lesson metadata is loaded; device audio I/O functional. | Audio playback starts; recording channel opened; UI shows lesson script. | Playback starts within 2 seconds; recording captures at least 90% of audio length. | Session limited to 30 minutes per lesson. | If audio fails to load, display "Unable to load lesson, please try again." |
| FR-4 | **Recording Playback Comparison** -- After recording, user can play back their recording alongside the native audio for manual self-comparison. | Session completed; recording saved locally. | Both audio tracks playable; user can toggle between solo and simultaneous modes. | Playback syncs within +/- 500 ms of native audio start. | Recording retained locally until user deletes or app cache is cleared. | If recording file is corrupted, show "Recording unavailable -- please try another session." |
| FR-5 | **Progress Persistence** -- Save session metrics (duration, timestamp, lesson completed) to the cloud. | User is authenticated; network available. | Metrics stored; user can view history. | Data persisted within 5 seconds of session end. | Retain data for 2 years; purge after user deletion. | Retry up to 3 times; on failure, store locally and sync when online. |
| FR-6 | **Ad Insertion** -- Load and display a non-intrusive banner ad after every completed lesson. | Lesson completed; ad SDK initialized. | Ad rendered; click-through tracked. | Ad loads within 1 second; no more than one ad per lesson. | Ads displayed for all users in MVP. | If ad fails, continue without disruption. |
| FR-7 | **Offline Lesson Download** -- Allow user to download lesson assets for offline practice. | User selects "Download" and has sufficient storage. | Lesson files saved locally; marked as available offline. | Download completes with 100% integrity checksum. | Max 500 MB total offline storage per user. | Show "Download failed -- retry?" on network error. |
| FR-8 | **User Settings Management** -- Users can update profile, notification preferences, and delete account. | User is authenticated. | Changes saved; confirmation displayed. | All fields validated per type; email change triggers verification email. | Deleting account removes all personal data within 30 days. | Show specific error messages for each validation failure. |

---

## 4. Assumptions & Dependencies

- The TO-BE Process Document provides detailed workflow diagrams and external service contracts (e.g., AWS Cognito, AdMob SDK). See `specs/05-future_state_analysis/Future_State_Analysis.md`.
- The application backend is built with Python FastAPI for REST APIs.
- No real-time AI or speech-to-text processing is performed inside the app during MVP. AI is used offline only for content generation (TTS audio, lesson scripts).
- Internet connectivity is required for registration, sync, and ad loading; offline mode is limited to already downloaded lessons.

---

## 5. Glossary

| Term | Definition |
|------|------------|
| MVP | Minimum Viable Product -- the initial release aiming to validate core hypotheses. |
| Shadowing | Technique where learners repeat spoken audio immediately after hearing it. |
| JWT | JSON Web Token -- used for stateless authentication. |
| TO-BE | Future state analysis describing the target architecture and processes. |
| SDK | Software Development Kit -- packaged libraries (e.g., AdMob SDK). |
| UI | User Interface. |
| TTS | Text-to-Speech -- AI-generated voice audio. |

---

## 6. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-05-11 | Business Analyst / Product Manager | Initial creation of Functional Requirements Specification |
| 1.1 | 2026-05-11 | Business Analyst / Product Manager | Removed FR-4 real-time transcription (requires live AI, not permitted in MVP); replaced with offline recording playback comparison. Updated Functional Overview and Assumptions to reflect no-real-time-AI constraint. |

---
