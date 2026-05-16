# Epic 04 – Return to Practice and Track Progress

**Title:** Return to Practice and Track Progress

**User Story:** As a returning learner, I want to see my progress and resume today's practice so that I can build a consistent daily habit.

**Priority:** Medium

**Related Functional Requirement(s):** FR‑5, FR‑7, FR‑8

**Assumptions / Constraints**

- Progress syncing depends on the user being authenticated and having network connectivity.
- Reminder behavior is limited to local notifications in the MVP.
- Ad‑supported access remains the only monetization model for the MVP; there are no subscriptions.

---

## Decomposed User Stories

### Group 1 — Progress Overview

---

#### US-4.1: Home Screen Progress Summary

**User Story:** As a returning learner, I want to see my current practice streak and daily progress on the home screen so that I can stay motivated.

**Acceptance Criteria:**

- Given I am signed in, when I open the home screen, then I see a progress summary card showing my current streak (consecutive days practiced) and total sessions completed.
- Given I practiced today, when I view the home screen, then the progress card shows today's session count and marks the current day as complete on the streak indicator.
- Given I have not practiced yet today, when I view the home screen, then the progress card shows a prompt or call-to-action to start today's practice.
- Given I am a new user with no sessions, when I open the home screen, then the progress card shows an empty state with an invitation to complete the first session.

**Priority:** Medium

**Dependencies:** US-3.7 (Session Metrics Persistence)

---

#### US-4.2: Progress History View

**User Story:** As a returning learner, I want to view my practice history so that I can see my progress over time.

**Acceptance Criteria:**

- Given I am on the progress screen, when the view loads, then I see a list or calendar of past sessions with date, lesson title, and duration.
- Given I have completed multiple sessions across different days, when I view the history, then sessions are grouped by date in reverse chronological order.
- Given I tap on a past session entry, when the detail view opens, then I see the lesson name, duration, completion status, and can replay the session recording.
- Given I have no session history, when I open the progress screen, then I see an empty state with a message to complete my first session.

**Priority:** Medium

**Dependencies:** US-3.7

---

### Group 2 — Streak & Milestones

---

#### US-4.3: Streak Calculation and Reset

**User Story:** As a returning learner, I want my streak to accurately reflect my consecutive practice days so that I trust the progress tracking.

**Acceptance Criteria:**

- Given I completed at least one session on a given day, when the streak is calculated, then that day counts toward my consecutive streak.
- Given I missed a day (no sessions completed), when the streak is recalculated, then the streak resets to zero.
- Given my streak resets, when I complete a session the next day, then the streak restarts at 1.
- Given I am in a different timezone, when the streak is calculated, then it uses the user's local timezone to determine practice days.

**Priority:** Medium

**Dependencies:** US-3.7

---

#### US-4.4: Milestone Celebrations

**User Story:** As a learner, I want to receive a congratulatory message when I reach a milestone streak (e.g., 7 days, 30 days) so that I feel recognized for my consistency.

**Acceptance Criteria:**

- Given I reach a 7-day streak, when I open the app, then I see a celebration overlay or banner congratulating me on the milestone.
- Given I reach a 30-day streak, when I open the app, then I see a celebration experience (can be a full-screen animation or award card).
- Given I have already seen the milestone celebration, when I open the app again, then I am taken to the home screen without repeating the celebration.

**Priority:** Low

**Dependencies:** US-4.3

---

### Group 3 — Reminder Notifications

---

#### US-4.5: Daily Practice Reminder via Local Notification

**User Story:** As a learner who enabled reminders, I want the app to send me a local notification at my chosen time so that I remember to practice daily.

**Acceptance Criteria:**

- Given I have set a reminder time in my profile, when the scheduled time arrives, then the app sends a local push notification with a message like "Time for your daily shadowing practice!"
- Given I tap the notification, when the app opens, then I am taken to the home screen.
- Given I have completed my practice for the day, when the scheduled reminder time arrives, then the notification is still sent (the MVP does not suppress notifications after practice).
- Given I have not set a reminder, when the day passes, then no notification is sent.

**Priority:** Low

**Dependencies:** US-5.2 (Reminder Preference Setup — from Epic 01)

---

#### US-4.6: Notification Permission Request

**User Story:** As a learner who enabled reminders, I want to be prompted for notification permission at the appropriate time so that the app can deliver reminders.

**Acceptance Criteria:**

- Given I have set a reminder time during onboarding, when I tap "Continue," then the app requests notification permission through the OS dialog.
- Given I grant notification permission, when the reminder time arrives, then the local notification is delivered.
- Given I deny notification permission, when the reminder time arrives, then no notification is delivered and the app gracefully handles the denied permission.

**Priority:** Low

**Dependencies:** US-4.5

---

### Group 4 — Offline Continuity

---

#### US-4.7: Offline Progress Preservation

**User Story:** As a learner practicing offline, I want my session progress to be saved locally so that I don't lose data when there is no network connection.

**Acceptance Criteria:**

- Given I am offline, when I complete a session, then the session data is saved to local storage.
- Given I have locally saved session data, when connectivity is restored, then the app automatically syncs the queued session data to the cloud.
- Given I have unsynced data, when I close and reopen the app while still offline, then the locally stored data persists and is not lost.
- Given the sync completes successfully, when all queued sessions are uploaded, then the local queue is cleared and the progress screen updates with the latest data.

**Priority:** Medium

**Dependencies:** US-3.7

---

#### US-4.8: Resume Practice After App Interruption

**User Story:** As a learner, I want to resume my practice from where I left off if the app is interrupted so that I don't lose my place.

**Acceptance Criteria:**

- Given I was in the middle of a session, when the app is closed (or crashes) and reopened, then I am prompted to resume the incomplete session or start a new one.
- Given I choose to resume, when the session restarts, then playback resumes from the last saved position and any recorded audio up to that point is retained.
- Given I choose not to resume, when I dismiss the prompt, then the incomplete session is discarded and I am taken to the home screen.

**Priority:** Low

**Dependencies:** US-3.1
