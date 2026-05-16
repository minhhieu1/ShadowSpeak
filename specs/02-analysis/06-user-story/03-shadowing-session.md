# Epic 03 – Complete a Shadowing Practice Session

**Title:** Complete a Shadowing Practice Session

**User Story:** As a learner, I want to listen to a lesson, record my voice, and replay my recording so that I can practice speaking and compare my performance with the native audio.

**Priority:** High

**Related Functional Requirement(s):** FR‑3, FR‑4, FR‑5

**Assumptions / Constraints**

- The MVP does not include real‑time speech recognition, AI scoring, or live feedback.
- Recording playback comparison is manual, not automated.
- Practice sessions are limited by the session rules defined in the FRS.

---

## Decomposed User Stories

### Group 1 — Session Start & Playback

---

#### US-3.1: Start Session with Audio Playback

**User Story:** As a learner, I want to start a practice session so that the lesson audio begins playing and I am in the active practice state.

**Acceptance Criteria:**

- Given I am on the lesson detail screen, when I tap "Start Practice," then the practice session screen opens and the lesson audio starts playing automatically.
- Given the session has started, when the audio is playing, then the screen displays the current playback position, a waveform or progress bar, and a pause/resume control.
- Given the session screen is open, when the audio reaches the end, then playback stops and the session transitions to the post-session review screen.

**Priority:** High

**Dependencies:** US-2.3 (Lesson Detail Screen)

---

#### US-3.2: Pause, Resume, and Restart Playback

**User Story:** As a learner, I want to pause, resume, or restart the lesson audio so that I can control the pace of my practice.

**Acceptance Criteria:**

- Given audio is playing, when I tap "Pause," then playback stops and the pause button changes to a "Resume" button.
- Given audio is paused, when I tap "Resume," then playback continues from the paused position.
- Given the session is active, when I tap "Restart," then playback resets to the beginning.

**Priority:** Medium

**Dependencies:** US-3.1

---

### Group 2 — Recording

---

#### US-3.3: Voice Recording During Session

**User Story:** As a learner, I want to record my voice while the lesson audio plays so that I can practice shadowing the speaker.

**Acceptance Criteria:**

- Given the session has started, when playback begins, then the recording channel opens automatically.
- Given recording is active, when I speak into the microphone, then the app captures my audio locally for the duration of the session.
- Given the session ends (audio completes or user taps "End Session"), when recording stops, then the captured audio is saved as a local recording associated with this session.

**Priority:** High

**Dependencies:** US-3.1, US-6.1 (Microphone Permission — from Epic 01)

---

#### US-3.4: Recording Failure Handling

**User Story:** As a learner, I want to be notified if recording fails during a session so that I can retry or continue with listening-only practice.

**Acceptance Criteria:**

- Given the session has started, when the recording channel fails to open, then the app displays an error message explaining the recording failure.
- Given the recording error is shown, when I tap "Retry," then the app attempts to reopen the recording channel.
- Given recording fails and I choose not to retry, when I dismiss the error, then the session continues in listening-only mode (no recording captured).

**Priority:** Medium

**Dependencies:** US-3.3

---

### Group 3 — Session Completion & Replay

---

#### US-3.5: Post-Session Review Screen

**User Story:** As a learner, I want to see a review screen after completing a session so that I can replay my recording alongside the reference audio.

**Acceptance Criteria:**

- Given the session has ended (audio finished or user tapped "End Session"), when the review screen appears, then it displays the lesson title, duration practiced, and playback controls for both my recording and the reference audio.
- Given the review screen is displayed, when I tap "Play Reference," then the original lesson audio plays.
- Given the review screen is displayed, when I tap "Play My Recording," then my captured voice recording plays.
- Given both recordings exist, when I toggle between them, then I can manually compare my shadowing with the native speaker.

**Priority:** High

**Dependencies:** US-3.3

---

#### US-3.6: Early Session Termination

**User Story:** As a learner, I want to end a session early so that I can stop practicing before the lesson finishes.

**Acceptance Criteria:**

- Given I am in an active session, when I tap "End Session," then a confirmation dialog asks if I am sure.
- Given the confirmation dialog is shown, when I confirm, then the session ends, any captured recording up to that point is saved, and I am taken to the review screen.
- Given the confirmation dialog is shown, when I cancel, then the session continues.

**Priority:** Medium

**Dependencies:** US-3.1

---

### Group 4 — Persistence

---

#### US-3.7: Session Metrics Persistence

**User Story:** As a learner, I want my completed session data to be saved to the cloud so that I can track my practice history across devices.

**Acceptance Criteria:**

- Given I complete a session and reach the review screen, when the session ends, then the following metrics are persisted to the cloud: lesson ID, session duration, completion status, and timestamp.
- Given the device is online, when the session completes, then the data is synced to the cloud immediately.
- Given the device is offline, when the session completes, then the data is stored locally and queued for sync when connectivity is restored.
- Given the sync fails, when the session data cannot reach the cloud, then the data remains in the local queue and retries on next app launch.

**Priority:** High

**Dependencies:** US-3.5

---

### Group 5 — Error & Edge Cases

---

#### US-3.8: Audio Loading Failure

**User Story:** As a learner, I want to be informed if the lesson audio cannot be loaded so that I can retry or choose a different lesson.

**Acceptance Criteria:**

- Given I tap "Start Practice," when the lesson audio fails to load, then the app shows a clear error message with a "Retry" button.
- Given the error message is shown, when I tap "Retry," then the app attempts to load the audio again.
- Given the retry also fails, when the error persists, then the app offers a "Back to Library" option to choose another lesson.

**Priority:** High

**Dependencies:** US-2.3
