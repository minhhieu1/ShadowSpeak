# Epic 01 – First-Time Onboarding and Access

**Title:** First-Time Onboarding and Access

**User Story:** As a new learner, I want to confirm my age eligibility, create an account, and set up my practice preferences so that I can start using ShadowSpeak with a personalized daily routine.

**Priority:** High

**Related Functional Requirement(s):** FR‑1, FR‑8, FR‑9

**Assumptions / Constraints**

- The MVP uses email/password or social sign‑in only.
- No real‑time AI coaching or pronunciation scoring is included in onboarding.
- Consent, privacy, and age‑gate requirements must be completed before access to practice content.
- If a store‑provided age signal is available, it may be used as a shortcut for the age gate, but the in‑app age check remains the fallback and final decision.

---

## Decomposed User Stories

### Group 1 — Age Gate

---

#### US-1.1: Age Eligibility Check

**User Story:** As a new learner opening the app for the first time, I want to confirm that I am old enough to use ShadowSpeak so that I can proceed with account creation.

**Acceptance Criteria:**

- Given I am a new learner, when I open the app for the first time, then I am presented with an age gate screen before any sign‑in or account creation screen.
- Given I am on the age gate screen, when I select an age indicating I am old enough to use the app, then I am allowed to proceed to the consent and sign‑in flow.
- Given a store‑provided age signal is available, when the app launches, then the age gate may use it as a shortcut, but the in‑app age check remains the final decision.

**Priority:** High

**Dependencies:** None

---

#### US-1.2: Underage Block

**User Story:** As an underage learner, I want to be informed that I cannot use ShadowSpeak so that I understand why account creation is blocked.

**Acceptance Criteria:**

- Given I am on the age gate screen, when I select an age indicating I am underage, then the app displays a clear message that I am not eligible to use ShadowSpeak.
- Given I am underage, when the block message is shown, then the app does **not** proceed to account creation or the main experience.
- Given I am underage, when the block message is shown, then no account is created and no personal data is stored.

**Priority:** High

**Dependencies:** US-1.1

---

### Group 2 — Consent & Privacy

---

#### US-2.1: Consent and Privacy Acknowledgment

**User Story:** As a new learner, I want to review and accept the privacy policy and terms of service so that I can proceed with account creation in compliance with consent requirements.

**Acceptance Criteria:**

- Given I have passed the age gate, when I reach the consent screen, then I am shown the privacy policy and terms of service.
- Given I am on the consent screen, when I tap "Accept," then my consent preference is recorded and I proceed to sign‑in.
- Given I am on the consent screen, when I tap "Decline," then the app exits the onboarding flow and does not create an account.
- Given consent has not been given, when I try to skip this step, then the app blocks progression to sign‑in.

**Priority:** High

**Dependencies:** US-1.1

---

### Group 3 — Authentication

---

#### US-3.1: Email/Password Sign-Up

**User Story:** As a new learner, I want to create an account using my email and a password so that I can access ShadowSpeak with a persistent identity.

**Acceptance Criteria:**

- Given I am on the sign‑up screen, when I enter a valid email and a password meeting the minimum strength requirements, then my account is created successfully.
- Given I have submitted the sign‑up form, when the account is created, then I am authenticated and redirected to the onboarding intro screens.
- Given I enter an email that is already registered, when I submit the form, then I am shown an error message and prompted to sign in instead.
- Given I enter an invalid email or a weak password, when I submit the form, then I am shown inline validation errors and the account is not created.

**Priority:** High

**Dependencies:** US-2.1

---

#### US-3.2: Social Sign-In

**User Story:** As a new learner, I want to sign up or sign in using a social account (Google or Apple) so that I can skip manual credential entry.

**Acceptance Criteria:**

- Given I am on the sign‑in screen, when I tap "Sign in with Google" or "Sign in with Apple," then I am redirected to the respective provider's authentication flow.
- Given the social authentication succeeds, when I return to the app, then my account is created (if new) or authenticated (if returning), and I proceed to the onboarding intro screens.
- Given the social authentication fails or is cancelled by the user, when I return to the app, then I remain on the sign‑in screen with no account created.

**Priority:** Medium

**Dependencies:** US-2.1

---

#### US-3.3: Returning User Sign-In

**User Story:** As a returning learner, I want to sign in with my existing credentials so that I can resume my practice.

**Acceptance Criteria:**

- Given I am a returning user, when I open the app, then I am presented with a sign‑in screen (skipping the age gate and consent flow).
- Given I enter the correct email and password, when I tap "Sign In," then I am authenticated and taken to the home screen.
- Given I enter an incorrect password, when I submit the form, then I am shown an error message with a "Forgot Password?" link.
- Given I tap the "Forgot Password?" link, when the screen transitions, then I am taken to the password reset flow (US-3.4).
- Given I previously signed up with a social provider, when I tap that provider's button, then I am authenticated without needing email/password.

**Priority:** High

**Dependencies:** US-3.1, US-3.2

---

#### US-3.4: Forgot Password / Password Reset

**User Story:** As a returning learner who forgot my password, I want to reset it using my email address so that I can regain access to my account.

**Acceptance Criteria:**

- Given I am on the sign‑in screen, when I tap "Forgot Password?", then I am taken to the password reset screen where I can enter my email address.
- Given I enter my registered email, when I tap "Send Reset Link," then a password reset email is sent to that address.
- Given I enter an unregistered email, when I tap "Send Reset Link," then I see an error message that no account is associated with that email.
- Given I receive the reset email, when I tap the reset link, then I am taken to a secure page where I can enter a new password meeting the minimum strength requirements.
- Given I enter a valid new password, when I submit the reset form, then my password is updated and I am redirected to the sign‑in screen with a success message.
- Given I enter a weak password, when I submit the reset form, then I see a validation error and the password is not updated.
- Given the reset link has expired, when I tap it, then I see an expiration message and am prompted to request a new reset link.

**Priority:** Medium

**Dependencies:** US-3.1

---

### Group 4 — Onboarding Introduction

---

#### US-4.1: App Introduction Screens

**User Story:** As a new learner, I want to view a brief introduction to ShadowSpeak and the shadowing practice concept so that I understand what the app does before setting up my preferences.

**Acceptance Criteria:**

- Given I am authenticated for the first time, when I finish sign‑in, then I am shown a sequence of introduction screens explaining the app and the shadowing practice concept.
- Given I am on an introduction screen, when I swipe or tap "Next," then I advance to the next screen in the sequence.
- Given I am on the last introduction screen, when I tap "Get Started," then I proceed to the profile setup flow.
- Given I have completed the introduction screens once, when I sign out and sign back in, then I am **not** shown the introduction screens again.

**Priority:** Medium

**Dependencies:** US-3.1 or US-3.2

---

### Group 5 — Profile Setup

---

#### US-5.1: Practice Level Selection

**User Story:** As a new learner, I want to select my English practice level (e.g., Beginner, Intermediate, Advanced) so that the app can tailor content difficulty to my skill.

**Acceptance Criteria:**

- Given I am in the profile setup flow, when I reach the practice level screen, then I am presented with 3–4 clearly described level options.
- Given I select a practice level, when I tap "Continue," then my choice is saved to my profile.
- Given I do not select any level, when I try to continue, then the app prompts me to make a selection before proceeding.

**Priority:** Medium

**Dependencies:** US-4.1

---

#### US-5.2: Reminder Preference Setup

**User Story:** As a new learner, I want to set a daily practice reminder time so that I can build a consistent shadowing habit.

**Acceptance Criteria:**

- Given I am in the profile setup flow, when I reach the reminder screen, then I am offered a time picker to choose my preferred daily reminder time.
- Given I select a time and enable reminders, when I tap "Continue," then the reminder is scheduled and saved to my profile.
- Given I choose to skip reminders, when I tap "Skip," then no reminder is scheduled and I proceed to the next step.
- Given I have set a reminder, when the chosen time arrives, then the app sends a local push notification to prompt me to practice.

**Priority:** Low

**Dependencies:** US-5.1

---

### Group 6 — Microphone Permission

---

#### US-6.1: Microphone Permission Request During Onboarding

**User Story:** As a new learner, I want to grant microphone permission during onboarding so that I can record my voice during shadowing sessions.

**Acceptance Criteria:**

- Given I am near the end of the onboarding flow, when I reach the microphone permission screen, then the app displays a clear explanation of why microphone access is needed for shadowing practice.
- Given I tap "Allow," when the system permission dialog appears, then I can grant microphone access through the OS dialog.
- Given I grant microphone permission, when the onboarding completes, then the permission status is recorded and I proceed to the home screen.

**Priority:** Medium

**Dependencies:** US-5.2

---

#### US-6.2: Microphone Permission Denied — Graceful Handling

**User Story:** As a learner who denied microphone permission, I want to understand why it is needed and have a path to enable it later so that I can still use the app and unlock recording when ready.

**Acceptance Criteria:**

- Given I denied microphone permission during onboarding, when onboarding completes, then I proceed to the home screen without recording capability.
- Given I denied microphone permission, when I later try to start a practice session, then the app shows an explanation of why microphone access is required and offers a button to open system settings.
- Given I tap the settings button, when the system settings app opens, then I can enable microphone permission for ShadowSpeak.
- Given I have not granted microphone permission, when I attempt to start a recording-based session, then the app blocks recording and shows the permission explanation screen.

**Priority:** Medium

**Dependencies:** US-6.1

---

### Group 7 — Onboarding Completion & Edge Cases

---

#### US-7.1: Onboarding Completion and Home Screen Entry

**User Story:** As a new learner, I want to complete the full onboarding flow and land on the home screen so that I can start exploring content.

**Acceptance Criteria:**

- Given I have completed all onboarding steps (age gate, consent, sign‑in, intro screens, practice level, reminder, microphone), when I finish, then I am taken to the home screen.
- Given I am on the home screen for the first time, then all my selected preferences (practice level, reminder, microphone status) are persisted in my profile.

**Priority:** High

**Dependencies:** US-1.1, US-2.1, US-3.1 or US-3.2, US-4.1, US-5.1, US-5.2, US-6.1

---

#### US-7.2: Onboarding Abandonment and Partial Progress

**User Story:** As a new learner, I want to be able to abandon the onboarding flow at any step and return later without losing my progress so that I can complete onboarding at my own pace.

**Acceptance Criteria:**

- Given I have completed the age gate and consent steps but not yet signed in, when I close the app and reopen it, then I am returned to the sign‑in screen.
- Given I have signed in but not completed profile setup, when I close the app and reopen it, then I am returned to the first incomplete onboarding step.
- Given I have completed all onboarding steps, when I close the app and reopen it, then I am taken directly to the home screen.

**Priority:** Low

**Dependencies:** US-1.1, US-2.1, US-3.1 or US-3.2
