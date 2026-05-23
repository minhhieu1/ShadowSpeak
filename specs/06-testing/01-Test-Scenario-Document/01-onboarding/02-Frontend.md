# Frontend Test Scenario Document — Epic 01 First-Time Onboarding and Access

## Document Metadata

| Field | Value |
|---|---|
| Project | ShadowSpeak |
| Epic | 01 — First-Time Onboarding and Access |
| Phase | 07 - Testing |
| Type | Frontend Test Scenario Document |
| Version | 1.0 |
| Date | 2026-05-23 |
| Status | Draft |
| Owner | QA |

## 1. Objective and Scope

This document defines frontend test scenarios for the Epic 01 onboarding flow in the React Native app. It focuses on screen behavior, client-side validation, navigation, recovery messaging, and local resume behavior as experienced by the user.

In scope:

- Age gate UI and underage block
- Consent UI and skip/decline handling
- Sign-up, sign-in, social-auth handoff states, forgot-password entry points
- Intro screens and onboarding navigation
- Level selection and reminder setup UX
- Microphone permission request and denial messaging
- Relaunch and resume behavior from the app perspective

Out of scope:

- Direct backend database validation
- API-only validation already covered in backend scenarios
- Full cross-layer orchestration timing beyond user-visible app behavior

## 2. References

- `specs/02-analysis/06-user-story/01-onboarding.md`
- `specs/05-development/01-epic-01-onboarding/02-Frontend-Technical-Task-Breakdown.md`
- `specs/03-ux-ui-design/`

## 3. Assumptions and Environment

- QA builds exist for iOS and Android.
- Testers can reset local app state between runs.
- OS permission prompts can be reset on the device.
- Test users and social test identities are available.

## 4. Scenario Coverage Matrix

| Group | Coverage Focus | Scenario IDs |
|---|---|---|
| Age Gate | First screen ordering, eligible flow, underage block | `TS-ONB-FE-01` to `TS-ONB-FE-03` |
| Consent | Display, accept, decline, skip block, retry state | `TS-ONB-FE-04` to `TS-ONB-FE-08` |
| Authentication | Sign-up forms, sign-in forms, social UI, forgot-password entry | `TS-ONB-FE-09` to `TS-ONB-FE-16` |
| Introduction | Intro display and suppression | `TS-ONB-FE-17` to `TS-ONB-FE-19` |
| Profile Setup | Level and reminder screens | `TS-ONB-FE-20` to `TS-ONB-FE-24` |
| Microphone | Permission rationale and denied recovery UI | `TS-ONB-FE-25` to `TS-ONB-FE-27` |
| Resume | Relaunch behavior and token-expiry routing | `TS-ONB-FE-28` to `TS-ONB-FE-31` |

## 5. Frontend Test Scenarios

#### TS-ONB-FE-01

- **Related User Story:** `US-1.1`
- **Title:** First launch shows age gate before sign-in
- **Description:** Verify the first actionable onboarding screen is the age gate.
- **Preconditions:** Fresh install; no local app data.
- **Test Data:** None.
- **Steps:**
  1. Launch the app for the first time.
  2. Observe the first actionable screen.
- **Expected Result:** Age gate appears before any sign-in or account-creation UI.
- **Priority:** High

#### TS-ONB-FE-02

- **Related User Story:** `US-1.1`
- **Title:** Eligible age selection advances to consent screen
- **Description:** Verify age-gate happy path navigation.
- **Preconditions:** User is on the age-gate screen.
- **Test Data:** Eligible age option.
- **Steps:**
  1. Select an eligible age.
  2. Continue.
- **Expected Result:** User is taken to the consent screen.
- **Priority:** High

#### TS-ONB-FE-03

- **Related User Story:** `US-1.2`
- **Title:** Underage selection shows blocked state with no forward navigation
- **Description:** Verify the client presents a clear blocked path for underage users.
- **Preconditions:** User is on age gate.
- **Test Data:** Underage option.
- **Steps:**
  1. Select an underage option.
  2. Confirm the selection.
  3. Attempt to proceed.
- **Expected Result:** User sees block messaging and cannot navigate to consent, sign-in, or home.
- **Priority:** High

#### TS-ONB-FE-04

- **Related User Story:** `US-2.1`
- **Title:** Consent screen displays privacy policy and terms
- **Description:** Verify the legal content is visible or linked on the consent screen.
- **Preconditions:** Eligible age-gate path completed.
- **Test Data:** None.
- **Steps:**
  1. Reach the consent screen.
  2. Inspect the screen contents.
- **Expected Result:** Privacy policy and terms are clearly presented.
- **Priority:** High

#### TS-ONB-FE-05

- **Related User Story:** `US-2.1`
- **Title:** Accepting consent advances to sign-in
- **Description:** Verify successful consent action transitions the user forward.
- **Preconditions:** User is on consent screen.
- **Test Data:** None.
- **Steps:**
  1. Tap `Accept`.
  2. Wait for the action to complete.
- **Expected Result:** User is navigated to sign-in or sign-up entry.
- **Priority:** High

#### TS-ONB-FE-06

- **Related User Story:** `US-2.1`
- **Title:** Declining consent leads to exit or dead-end path
- **Description:** Verify the app does not allow further onboarding after consent decline.
- **Preconditions:** User is on consent screen.
- **Test Data:** None.
- **Steps:**
  1. Tap `Decline`.
  2. Observe the resulting screen state.
- **Expected Result:** App shows exit/dead-end behavior with no route into the main app.
- **Priority:** High

#### TS-ONB-FE-07

- **Related User Story:** `US-2.1`
- **Title:** User cannot bypass consent without acceptance
- **Description:** Verify skip or back actions do not allow entering sign-in without consent.
- **Preconditions:** User is on consent screen.
- **Test Data:** None.
- **Steps:**
  1. Attempt to dismiss or bypass the consent step.
  2. Attempt to open sign-in.
- **Expected Result:** Progression is blocked until consent is accepted.
- **Priority:** High

#### TS-ONB-FE-08

- **Related User Story:** `US-2.1`
- **Title:** Consent save failure shows retryable UI state
- **Description:** Verify the app handles consent submission failure without navigating forward.
- **Preconditions:** Network failure can be simulated.
- **Test Data:** Valid accept action with offline or failing backend.
- **Steps:**
  1. Simulate failure.
  2. Tap `Accept`.
  3. Observe the screen state.
  4. Retry after restoring connectivity.
- **Expected Result:** User stays on consent screen, sees retry messaging, and can continue after successful retry.
- **Priority:** High

#### TS-ONB-FE-09

- **Related User Story:** `US-3.1`
- **Title:** Sign-up form accepts valid input and transitions into onboarding
- **Description:** Verify frontend sign-up happy path.
- **Preconditions:** Consent accepted.
- **Test Data:** Valid new email and strong password.
- **Steps:**
  1. Open sign-up.
  2. Enter valid credentials.
  3. Submit.
- **Expected Result:** User is signed in and taken to intro screens.
- **Priority:** High

#### TS-ONB-FE-10

- **Related User Story:** `US-3.1`
- **Title:** Sign-up form shows validation errors for invalid email and weak password
- **Description:** Verify client-side validation feedback.
- **Preconditions:** Consent accepted.
- **Test Data:** Invalid email; weak password.
- **Steps:**
  1. Enter invalid email and submit.
  2. Enter weak password and submit.
- **Expected Result:** Inline validation errors are displayed and submission does not proceed.
- **Priority:** High

#### TS-ONB-FE-11

- **Related User Story:** `US-3.1`, `US-3.3`
- **Title:** Duplicate email or wrong password errors are shown clearly
- **Description:** Verify auth failure states are understandable to the user.
- **Preconditions:** Existing account.
- **Test Data:** Registered email for duplicate sign-up; wrong password for sign-in.
- **Steps:**
  1. Attempt duplicate sign-up.
  2. Attempt sign-in with wrong password.
- **Expected Result:** User sees clear errors and appropriate recovery guidance.
- **Priority:** High

#### TS-ONB-FE-12

- **Related User Story:** `US-3.2`
- **Title:** Social sign-in buttons launch provider flow
- **Description:** Verify the user can start Google or Apple authentication from the sign-in screen.
- **Preconditions:** Consent accepted.
- **Test Data:** None.
- **Steps:**
  1. Tap `Sign in with Google`.
  2. Repeat with `Sign in with Apple`.
- **Expected Result:** App redirects to the selected provider flow.
- **Priority:** Medium

#### TS-ONB-FE-13

- **Related User Story:** `US-3.2`
- **Title:** Cancelled social auth returns user to sign-in screen
- **Description:** Verify cancellation does not break the sign-in screen state.
- **Preconditions:** Social provider flow available.
- **Test Data:** Cancelled provider flow.
- **Steps:**
  1. Start social auth.
  2. Cancel the provider flow.
  3. Return to the app.
- **Expected Result:** User remains on sign-in with no broken state.
- **Priority:** Medium

#### TS-ONB-FE-14

- **Related User Story:** `US-3.4`
- **Title:** Forgot-password link opens reset-request flow
- **Description:** Verify the reset entry point is reachable from sign-in.
- **Preconditions:** User is on sign-in.
- **Test Data:** None.
- **Steps:**
  1. Tap `Forgot Password?`.
- **Expected Result:** User is navigated to the password reset request screen.
- **Priority:** High

#### TS-ONB-FE-15

- **Related User Story:** `US-3.4`
- **Title:** Reset screen shows feedback for registered and unregistered email submissions
- **Description:** Verify reset-request submission feedback is visible to the user.
- **Preconditions:** Reset-request screen is open.
- **Test Data:** Registered email; unregistered email.
- **Steps:**
  1. Submit a registered email.
  2. Submit an unregistered email.
- **Expected Result:** User sees success guidance for valid request and error guidance for unknown email.
- **Priority:** Medium

#### TS-ONB-FE-16

- **Related User Story:** `US-3.4`
- **Title:** Reset-password screen shows weak-password and expired-link states
- **Description:** Verify the client presents clear validation and expiry messaging during password reset.
- **Preconditions:** Reset-password page is reachable.
- **Test Data:** Weak replacement password; expired link.
- **Steps:**
  1. Submit a weak password.
  2. Open an expired link.
- **Expected Result:** User sees clear validation or expiration messaging and a path to retry.
- **Priority:** Medium

#### TS-ONB-FE-17

- **Related User Story:** `US-4.1`
- **Title:** New user sees intro sequence after first authentication
- **Description:** Verify intro screens appear for first-time authenticated users.
- **Preconditions:** New user just authenticated.
- **Test Data:** None.
- **Steps:**
  1. Complete first authentication.
  2. Observe the next screen.
- **Expected Result:** Intro sequence is shown.
- **Priority:** Medium

#### TS-ONB-FE-18

- **Related User Story:** `US-4.1`
- **Title:** Intro sequence supports forward navigation to profile setup
- **Description:** Verify intro slides progress and final CTA works.
- **Preconditions:** User is on intro sequence.
- **Test Data:** None.
- **Steps:**
  1. Tap `Next` or swipe through each slide.
  2. Tap `Get Started` on the final slide.
- **Expected Result:** User reaches level-selection or profile-setup flow.
- **Priority:** Medium

#### TS-ONB-FE-19

- **Related User Story:** `US-4.1`
- **Title:** Intro sequence is not shown again after completion
- **Description:** Verify intro suppression on later launches or sign-ins.
- **Preconditions:** Intro already completed.
- **Test Data:** Existing user with completed intro.
- **Steps:**
  1. Sign out and sign back in.
- **Expected Result:** Intro is skipped.
- **Priority:** Medium

#### TS-ONB-FE-20

- **Related User Story:** `US-5.1`
- **Title:** Level-selection screen requires one valid choice
- **Description:** Verify user must select a level before continuing.
- **Preconditions:** User is on level-selection screen.
- **Test Data:** `beginner`, `intermediate`, `advanced`.
- **Steps:**
  1. Try to continue without choosing a level.
  2. Choose a valid level and continue.
- **Expected Result:** Empty selection is blocked; valid selection proceeds.
- **Priority:** High

#### TS-ONB-FE-21

- **Related User Story:** `US-5.2`
- **Title:** Reminder setup allows valid time selection and save
- **Description:** Verify reminder UI supports enablement and time selection.
- **Preconditions:** User is on reminder setup.
- **Test Data:** Valid time such as `08:00`.
- **Steps:**
  1. Enable reminders.
  2. Select a valid time.
  3. Continue.
- **Expected Result:** User proceeds and sees no validation error.
- **Priority:** Medium

#### TS-ONB-FE-22

- **Related User Story:** `US-5.2`
- **Title:** Reminder setup can be skipped
- **Description:** Verify users can continue without enabling reminders.
- **Preconditions:** User is on reminder setup.
- **Test Data:** None.
- **Steps:**
  1. Tap `Skip`.
- **Expected Result:** User proceeds to the next onboarding step.
- **Priority:** Medium

#### TS-ONB-FE-23

- **Related User Story:** `US-5.2`
- **Title:** Invalid reminder input shows validation feedback
- **Description:** Verify malformed reminder input is rejected in the UI.
- **Preconditions:** Reminder screen permits malformed-input simulation if applicable.
- **Test Data:** Invalid time values.
- **Steps:**
  1. Attempt to save invalid reminder input.
- **Expected Result:** Validation feedback is shown and progression is blocked until corrected.
- **Priority:** Low

#### TS-ONB-FE-24

- **Related User Story:** `US-5.2`
- **Title:** Reminder-permission denial does not break onboarding flow
- **Description:** Verify the screen handles notification-permission denial gracefully if reminder enablement requires it.
- **Preconditions:** Notification permission not granted.
- **Test Data:** Denied notification permission.
- **Steps:**
  1. Enable reminders.
  2. Deny the notification permission if prompted.
  3. Observe the screen state.
- **Expected Result:** User sees clear recovery or skip behavior and can continue onboarding.
- **Priority:** Low

#### TS-ONB-FE-25

- **Related User Story:** `US-6.1`
- **Title:** Microphone-permission screen explains why access is needed
- **Description:** Verify permission rationale is clear before the OS prompt.
- **Preconditions:** User is on microphone-permission step.
- **Test Data:** None.
- **Steps:**
  1. Review the permission screen.
- **Expected Result:** The UI clearly explains why microphone access is needed for shadowing.
- **Priority:** High

#### TS-ONB-FE-26

- **Related User Story:** `US-6.1`
- **Title:** Granting microphone permission completes the allow flow
- **Description:** Verify the happy path for microphone permission.
- **Preconditions:** OS microphone status not yet decided.
- **Test Data:** None.
- **Steps:**
  1. Tap `Allow`.
  2. Accept the OS prompt.
  3. Continue onboarding.
- **Expected Result:** Permission is granted and the user can finish onboarding.
- **Priority:** High

#### TS-ONB-FE-27

- **Related User Story:** `US-6.2`
- **Title:** Denying microphone permission shows recovery guidance and still allows continuation
- **Description:** Verify denied state messaging and non-blocking behavior.
- **Preconditions:** OS microphone status not yet decided.
- **Test Data:** Denied microphone permission.
- **Steps:**
  1. Trigger microphone permission.
  2. Deny the OS prompt.
  3. Observe the denied state.
  4. Continue onboarding.
- **Expected Result:** User sees denied-state messaging, optional open-settings guidance, and can still continue.
- **Priority:** High

#### TS-ONB-FE-28

- **Related User Story:** `US-7.2`
- **Title:** Relaunch after consent but before sign-in resumes at sign-in
- **Description:** Verify the client restores the user to sign-in after pre-auth progress is completed.
- **Preconditions:** Age gate and consent completed; user not signed in.
- **Test Data:** None.
- **Steps:**
  1. Close the app after consent.
  2. Reopen the app.
- **Expected Result:** User returns to sign-in rather than restarting from age gate.
- **Priority:** Medium

#### TS-ONB-FE-29

- **Related User Story:** `US-7.2`
- **Title:** Relaunch after authenticated partial onboarding resumes at the first incomplete screen
- **Description:** Verify resume behavior for incomplete authenticated users.
- **Preconditions:** Account exists with incomplete onboarding state.
- **Test Data:** Accounts stopped at intro, level, reminder, and microphone steps.
- **Steps:**
  1. Reopen the app for each incomplete state.
- **Expected Result:** Each account resumes at the correct first incomplete screen.
- **Priority:** High

#### TS-ONB-FE-30

- **Related User Story:** `US-7.2`
- **Title:** Relaunch after completed onboarding goes directly to home
- **Description:** Verify completed users bypass onboarding on app launch.
- **Preconditions:** User has completed onboarding.
- **Test Data:** Existing onboarded account.
- **Steps:**
  1. Reopen the app.
- **Expected Result:** User lands directly on home.
- **Priority:** High

#### TS-ONB-FE-31

- **Related User Story:** `US-7.2`
- **Title:** Expired saved session routes safely back into onboarding or sign-in
- **Description:** Verify the app handles expired token restore without leaving the user stuck.
- **Preconditions:** Expired saved token.
- **Test Data:** Expired auth token.
- **Steps:**
  1. Launch the app with an expired session.
  2. Observe the boot outcome.
- **Expected Result:** App clears invalid session and routes user to sign-in or the correct pre-auth step.
- **Priority:** Medium

## 6. Traceability Summary

| Coverage Area | Scenarios |
|---|---|
| Age gate and underage block | `TS-ONB-FE-01` to `TS-ONB-FE-03` |
| Consent UI | `TS-ONB-FE-04` to `TS-ONB-FE-08` |
| Authentication UX | `TS-ONB-FE-09` to `TS-ONB-FE-16` |
| Intro flow | `TS-ONB-FE-17` to `TS-ONB-FE-19` |
| Profile setup flow | `TS-ONB-FE-20` to `TS-ONB-FE-24` |
| Microphone flow | `TS-ONB-FE-25` to `TS-ONB-FE-27` |
| Resume and relaunch | `TS-ONB-FE-28` to `TS-ONB-FE-31` |
