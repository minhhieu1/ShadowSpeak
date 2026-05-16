# Epic 05 – Settings & Account Management

**Title:** Settings and Account Management

**User Story:** As a learner, I want to access a central Settings hub where I can manage my profile, playback preferences, reminders, consent, recordings, and account so that I can control my ShadowSpeak experience beyond onboarding.

**Priority:** Medium

**Related Functional Requirement(s):** FR‑1, FR‑8, FR‑9

**Assumptions / Constraints**

- The MVP does not include subscription or payment settings.
- Account deletion is a server-side operation that removes personal data in compliance with privacy requirements.
- All settings changes take effect immediately and are persisted to the cloud when online.
- Settings are accessible after onboarding completion only.
- The Settings hub lists 6 entry points: Playback Settings, Reminder Settings, Consent Settings, Profile Settings, Recording Library, Account Management.

---

## Decomposed User Stories

### Group 1 — Settings Hub

---

#### US-5.1: Settings Main Hub

**User Story:** As a learner, I want to open a central Settings screen with all available setting categories so that I can navigate to the setting I need.

**Acceptance Criteria:**

- Given I am signed in, when I tap the settings icon from any main screen (home, library, progress), then the Settings hub opens.
- Given the Settings hub is displayed, then it lists 6 tappable rows: Playback Settings, Reminder Settings, Consent Settings, Profile Settings, Recording Library, and Account Management.
- Given I tap any settings row, when the row is selected, then I am taken to the corresponding settings sub-screen.
- Given I am on the Settings hub, when I tap the back button, then I return to the previous screen.

**Priority:** Medium

**Dependencies:** US-7.1 (Onboarding Completion)

---

### Group 2 — Playback Settings

---

#### US-5.2: Playback Speed Control

**User Story:** As a learner, I want to set my default playback speed from the Playback Settings so that lesson audio plays at a pace comfortable for me.

**Acceptance Criteria:**

- Given I am on the Settings hub, when I tap "Playback Settings," then the Playback Settings screen opens showing the current speed selection.
- Given the Playback Settings screen is displayed, then I see a speed selector with options (e.g., 0.5×, 0.75×, 1×, 1.25×, 1.5×) and optional audio behavior notes.
- Given I select a new speed, when I tap "Save," then the preference is saved and applied to future playback sessions.
- Given I change the speed, when I tap "Reset to Default," then the speed reverts to the app default (1×) and is saved immediately.

**Priority:** Low

**Dependencies:** US-5.1

---

### Group 3 — Reminder Settings

---

#### US-5.3: Update Reminder Schedule

**User Story:** As a learner, I want to enable, disable, or change my daily practice reminder time from Reminder Settings so that my practice schedule stays aligned with my routine.

**Acceptance Criteria:**

- Given I am on the Settings hub, when I tap "Reminder Settings," then the Reminder Settings screen opens showing my current reminder status (enabled/disabled) and scheduled time.
- Given reminders are enabled, when I tap the toggle to disable them, then the scheduled local notification is cancelled and my preference is saved.
- Given reminders are disabled, when I tap the toggle to enable them, then a time picker appears and I can select a new reminder time.
- Given I change the reminder time, when I tap "Save," then the old notification is cancelled and a new one is scheduled.
- Given I tap "Disable Reminders," when I confirm, then the reminder is turned off and the local schedule is cancelled.

**Priority:** Low

**Dependencies:** US-5.1, US-5.2 (Reminder Preference Setup — from Epic 01)

---

#### US-5.4: Reminder Notification Permission Recovery

**User Story:** As a learner who previously denied notification permission, I want to see a recovery note in Reminder Settings so that I know how to re-enable notifications.

**Acceptance Criteria:**

- Given I am on the Reminder Settings screen, when notification permission was previously denied, then I see a permission recovery note with a button to open system settings.
- Given I tap the system settings button, when the OS settings app opens, then I can enable notification permission for ShadowSpeak.
- Given I return to the app after granting permission, when the Reminder Settings screen refreshes, then the permission status updates accordingly.

**Priority:** Low

**Dependencies:** US-5.3

---

### Group 4 — Consent Settings

---

#### US-5.5: Update Privacy and Ad Consent

**User Story:** As a learner, I want to review or change my privacy consent and ad personalization preferences from Consent Settings so that I stay in control of my data.

**Acceptance Criteria:**

- Given I am on the Settings hub, when I tap "Consent Settings," then the Consent Settings screen opens showing my current age/consent status.
- Given the Consent Settings screen is displayed, then I see a privacy consent toggle and an ad consent toggle with their current states.
- Given I change a consent toggle, when I tap "Save," then the updated preference is persisted immediately.
- Given I withdraw ad consent, when the change is saved, then personalized ad requests stop for future sessions.
- Given I change a consent setting while offline, when I tap "Save," then the change is queued and synced when connectivity is restored.

**Priority:** Medium

**Dependencies:** US-5.1, US-2.1 (Consent and Privacy Acknowledgment — from Epic 01)

---

### Group 5 — Profile Settings

---

#### US-5.6: Edit Profile Information

**User Story:** As a learner, I want to update my display name and view my account details from Profile Settings so that my profile reflects my preferred identity.

**Acceptance Criteria:**

- Given I am on the Settings hub, when I tap "Profile Settings," then the Profile Settings screen opens showing my current display name, level summary, and account email.
- Given I edit my display name, when I tap "Save," then the name is validated and updated on my profile.
- Given I enter an empty or invalid display name, when I tap "Save," then I see a validation error and the name is not saved.
- Given I tap "Cancel," when the changes are discarded, then I return to the Settings hub.

**Priority:** Medium

**Dependencies:** US-5.1

---

### Group 6 — Recording Library

---

#### US-5.7: View and Play Saved Recordings

**User Story:** As a learner, I want to browse my saved session recordings from Recording Library so that I can listen to past practice and track my speaking progress.

**Acceptance Criteria:**

- Given I am on the Settings hub, when I tap "Recording Library," then the Recording Library screen opens showing a list of saved recordings with lesson title, date, and duration.
- Given I tap a recording entry, when the item is selected, then I can play back the recording.
- Given I have no saved recordings, when I open the Recording Library, then I see an empty state with a message to complete a session first.

**Priority:** Low

**Dependencies:** US-5.1, US-3.3 (Voice Recording During Session — from Epic 03)

---

#### US-5.8: Delete Recording from Library

**User Story:** As a learner, I want to delete a recording from my Recording Library so that I can manage storage and remove unwanted recordings.

**Acceptance Criteria:**

- Given I am on the Recording Library screen, when I tap "Delete" on a recording entry, then a confirmation dialog asks if I am sure.
- Given I confirm deletion, when the recording is removed locally, then a sync status indicator shows the delete is queued for remote deletion.
- Given the remote delete succeeds, when the sync completes, then the recording is removed from the cloud as well.
- Given the remote delete fails, when the error occurs, then the app shows a retryable error message.

**Priority:** Low

**Dependencies:** US-5.7

---

### Group 7 — Account Management

---

#### US-5.9: Sign Out

**User Story:** As a signed-in learner, I want to sign out from the Account Management screen so that I can switch accounts or secure my device.

**Acceptance Criteria:**

- Given I am on the Settings hub, when I tap "Account Management," then the Account Management screen opens showing my account summary (display name and email).
- Given I am on the Account Management screen, when I tap "Sign Out," then a confirmation dialog asks if I am sure.
- Given I confirm sign-out, when the session ends, then I am signed out and returned to the sign‑in screen.
- Given I cancel, when the dialog is dismissed, then I remain signed in on the Account Management screen.

**Priority:** Medium

**Dependencies:** US-5.1

---

#### US-5.10: Delete Account with Confirmation

**User Story:** As a learner, I want to permanently delete my account and all associated data from the Account Management screen so that I can fully remove my presence from ShadowSpeak.

**Acceptance Criteria:**

- Given I am on the Account Management screen, when I tap "Delete Account," then a warning screen explains that all data will be permanently removed (account, profile, progress, recordings).
- Given the warning is shown, when I proceed, then a second confirmation step is required before deletion executes.
- Given I confirm deletion, when the request is sent, then my account and all personal data are permanently removed from the server.
- Given the deletion succeeds, when the process completes, then I am signed out and returned to the sign‑in screen.
- Given I am offline, when I tap "Delete Account," then I am informed that account deletion requires a network connection.
- Given the backend deletion fails, when an error occurs, then I remain signed in and a retryable error is displayed.

**Priority:** Low

**Dependencies:** US-5.9
