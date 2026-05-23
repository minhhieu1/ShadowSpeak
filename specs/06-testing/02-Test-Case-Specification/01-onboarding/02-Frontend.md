# Frontend Test Case Specification — Epic 01 First-Time Onboarding and Access

## Document Metadata

| Field | Value |
|---|---|
| Project | ShadowSpeak |
| Epic | 01 — First-Time Onboarding and Access |
| Phase | 06 - Testing |
| Type | Frontend Test Case Specification |
| Version | 1.1 |
| Date | 2026-05-23 |
| Status | Draft |
| Owner | QA |
| Derived From | `specs/06-testing/01-Test-Scenario-Document/01-onboarding/02-Frontend.md` |

## 1. Objective and Scope

This document defines detailed frontend test cases for the ShadowSpeak onboarding experience. It is intended to be sign-off ready for QA execution and covers user-visible behavior, client-side validation, onboarding progression, permission UX, relaunch recovery, and observable persistence outcomes on the mobile app.

In scope:

- Age gate and underage blocking behavior
- Privacy and ad consent UX
- Sign-up, sign-in, social auth handoff, and forgot-password UX
- Intro screens, profile setup, reminder setup, and permission prompts
- Notification and microphone permission recovery paths
- Relaunch and resume behavior for partially completed onboarding
- Observable persistence outcomes on first Home entry and follow-up surfaces

Out of scope:

- Backend persistence validation at database level
- API contract validation already covered by backend TCS
- Hosted provider pages beyond app handoff and return behavior

## 2. References

- `specs/02-analysis/06-user-story/01-onboarding.md`
- `specs/02-analysis/03-Functional-Requirements-Specification.md`
- `specs/03-ux-ui-design/03-Wireframe-Document.md`
- `specs/06-testing/01-Test-Scenario-Document/01-onboarding/02-Frontend.md`
- `specs/03-ux-ui-design/generated-screens/`

## 3. Source Precedence and Approved Test Assumptions

When source documents conflict, use the following precedence for this TCS:

1. User story acceptance criteria
2. Functional Requirements Specification
3. Frontend Test Scenario Document
4. Wireframe document and generated screens

Approved assumptions used in this TCS:

- Intro screens are treated as in scope and canonical because `US-4.1` and `TS-ONB-FE-17` to `TS-ONB-FE-19` require them, even though the current wireframe route omits that step.
- Level selection is treated as mandatory because `US-5.1` requires blocking progression until one level is selected. The wireframe `Skip / choose later` CTA is treated as a design inconsistency and not a valid MVP path for sign-off.
- Reminder setup is modeled with a time picker, so malformed manual values such as `25:99` are not considered executable frontend test data.
- Notification and microphone permissions are tested as part of the onboarding permission stage because the wireframe defines a combined `Permission Prompts` step and the scenario document explicitly covers reminder-permission denial.

## 4. Execution Rules

Unless a test case states otherwise, verify:

- Screen title, primary CTA, and secondary action match the intended onboarding step.
- The user cannot bypass required steps through back, dismiss, or relaunch behavior.
- Error or denied states remain actionable and do not trap the user unless the requirement is explicitly blocking.
- Observable saved state is verified on first Home entry, or in Settings when the Home screen does not expose the saved preference directly.

## 5. Test Environment and Data

- QA builds are available for iOS and Android.
- App local state can be reset between runs.
- OS notification and microphone permissions can be reset per device.
- Test identities exist for:
  - New email sign-up
  - Existing email/password sign-in
  - Duplicate-email sign-up
  - Registered and unregistered forgot-password flows
  - Google and Apple social-auth test users
- Reminder test devices can display local notification permission prompts.

## 6. Test Cases

### 6.1 Age Gate and Consent

#### TC-ONB-FE-001

- **Related Scenario ID:** `TS-ONB-FE-01`
- **Related User Story:** `US-1.1`
- **Related FR:** `FR-9`
- **Related Wireframe Screen:** `1.2 Age Gate`
- **Title:** Show age gate as the first actionable screen on first launch
- **Objective:** Verify first-run users must complete age eligibility before any authentication UI appears.
- **Preconditions:** Fresh install; no local app data; no authenticated session.
- **Test Data:** None.
- **Steps:**
  1. Launch the app for the first time.
  2. Wait until the first actionable onboarding screen is shown.
- **Expected Result:** `Age Gate` is displayed before any sign-in, sign-up, or home content; no authentication controls are visible.
- **Priority:** High

#### TC-ONB-FE-001A

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-1.1`
- **Related FR:** `FR-9`
- **Related Wireframe Screen:** `1.2 Age Gate`
- **Title:** Launch with store-provided age signal still honors the in-app age decision path
- **Objective:** Verify the app handles a platform-provided age signal without bypassing the onboarding age-gate rules.
- **Preconditions:** Fresh install; no local app data; platform test setup can simulate store-provided age signal availability.
- **Test Data:** Available store-provided age signal for an eligible user.
- **Steps:**
  1. Launch the app in an environment where a store-provided age signal is available.
  2. Observe age-gate routing behavior.
  3. Continue through the age confirmation path as supported by the build.
- **Expected Result:** The app uses the store-provided age signal as an input or shortcut only if supported, but still preserves the in-app age eligibility decision path and routes only eligible users forward to consent.
- **Priority:** Medium

#### TC-ONB-FE-002

- **Related Scenario ID:** `TS-ONB-FE-02`
- **Related User Story:** `US-1.1`
- **Related FR:** `FR-9`
- **Related Wireframe Screen:** `1.2 Age Gate`
- **Title:** Eligible age selection continues to consent
- **Objective:** Verify the eligible age path advances to the legal consent step.
- **Preconditions:** User is on `Age Gate`.
- **Test Data:** Eligible age option.
- **Steps:**
  1. Select an eligible age option.
  2. Tap `Continue`.
- **Expected Result:** The app records the age-eligible decision for the current onboarding session and navigates to `Privacy and Ad Consent`.
- **Priority:** High

#### TC-ONB-FE-003

- **Related Scenario ID:** `TS-ONB-FE-03`
- **Related User Story:** `US-1.2`
- **Related FR:** `FR-9`
- **Related Wireframe Screen:** `1.3 Age Policy Block`
- **Title:** Underage selection shows a blocked state with no forward navigation
- **Objective:** Verify underage users are blocked from account creation and practice access.
- **Preconditions:** User is on `Age Gate`.
- **Test Data:** Underage age option.
- **Steps:**
  1. Select an underage age option.
  2. Confirm the selection.
  3. Attempt to navigate forward, back into onboarding, or into the app shell.
- **Expected Result:** `Age Policy Block` is shown with a dead-end exit path only; the user cannot reach consent, authentication, or Home.
- **Priority:** High

#### TC-ONB-FE-004

- **Related Scenario ID:** `TS-ONB-FE-04`
- **Related User Story:** `US-2.1`
- **Related FR:** `FR-9`
- **Related Wireframe Screen:** `1.4 Privacy and Ad Consent`
- **Title:** Consent screen exposes privacy policy and terms
- **Objective:** Verify legal content is visible or directly accessible before the user can continue.
- **Preconditions:** Eligible age-gate path completed.
- **Test Data:** None.
- **Steps:**
  1. Reach `Privacy and Ad Consent`.
  2. Review visible legal copy and any document links.
- **Expected Result:** Privacy policy and terms of service are visible or reachable from the screen before consent acceptance.
- **Priority:** High

#### TC-ONB-FE-005

- **Related Scenario ID:** `TS-ONB-FE-05`
- **Related User Story:** `US-2.1`
- **Related FR:** `FR-9`
- **Related Wireframe Screen:** `1.4 Privacy and Ad Consent`
- **Title:** Accept consent and move to authentication entry
- **Objective:** Verify consent acceptance advances the onboarding flow.
- **Preconditions:** User is on `Privacy and Ad Consent`.
- **Test Data:** Valid accept action.
- **Steps:**
  1. Tap `Accept and Continue`.
  2. Wait for the app response.
- **Expected Result:** Consent is accepted for the onboarding session and the user is navigated to the authentication entry screen.
- **Priority:** High

#### TC-ONB-FE-006

- **Related Scenario ID:** `TS-ONB-FE-06`
- **Related User Story:** `US-2.1`
- **Related FR:** `FR-9`
- **Related Wireframe Screen:** `1.4 Privacy and Ad Consent`
- **Title:** Decline consent prevents entry into onboarding and the app shell
- **Objective:** Verify declining required consent blocks onboarding continuation.
- **Preconditions:** User is on `Privacy and Ad Consent`.
- **Test Data:** None.
- **Steps:**
  1. Tap `Decline and Exit`.
  2. Observe the resulting app state.
- **Expected Result:** The app exits onboarding or shows a dead-end state; the user cannot proceed to authentication or Home without restarting and accepting consent.
- **Priority:** High

#### TC-ONB-FE-007

- **Related Scenario ID:** `TS-ONB-FE-07`
- **Related User Story:** `US-2.1`
- **Related FR:** `FR-9`
- **Related Wireframe Screen:** `1.4 Privacy and Ad Consent`
- **Title:** Block bypass attempts while consent is still pending
- **Objective:** Verify required consent cannot be skipped via back, dismiss, or deep-link style navigation.
- **Preconditions:** User is on `Privacy and Ad Consent`; consent not yet accepted.
- **Test Data:** None.
- **Steps:**
  1. Attempt to dismiss the screen, use the back action, or reach sign-in without acceptance.
  2. Relaunch the app if needed and retry progression.
- **Expected Result:** The user remains blocked from authentication until consent is accepted.
- **Priority:** High

#### TC-ONB-FE-008

- **Related Scenario ID:** `TS-ONB-FE-08`
- **Related User Story:** `US-2.1`
- **Related FR:** `FR-9`
- **Related Wireframe Screen:** `1.4 Privacy and Ad Consent`
- **Title:** Consent submission failure keeps the user on the consent step with retry guidance
- **Objective:** Verify the UI handles consent-save failures without false progression.
- **Preconditions:** Network or backend failure can be simulated.
- **Test Data:** Valid accept action during a simulated failure.
- **Steps:**
  1. Simulate a consent-save failure.
  2. Tap `Accept and Continue`.
  3. Observe the error state.
  4. Restore connectivity and retry.
- **Expected Result:** The user remains on the consent screen with a retryable error message; after retry succeeds, the app proceeds to authentication.
- **Priority:** High

### 6.2 Authentication

#### TC-ONB-FE-009

- **Related Scenario ID:** `TS-ONB-FE-09`
- **Related User Story:** `US-3.1`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.6 Sign Up`
- **Title:** New user sign-up with valid email and password enters first-time onboarding
- **Objective:** Verify successful account creation transitions a new user into the first-time post-auth flow.
- **Preconditions:** Consent accepted; sign-up screen open.
- **Test Data:** New email; strong password; matching confirmation password if shown.
- **Steps:**
  1. Open `Sign Up`.
  2. Enter valid new-user credentials.
  3. Submit the form.
- **Expected Result:** The account is created, the user becomes authenticated, and the app routes to the first-time onboarding continuation flow beginning with the intro sequence defined by `US-4.1`.
- **Priority:** High

#### TC-ONB-FE-010

- **Related Scenario ID:** `TS-ONB-FE-10`
- **Related User Story:** `US-3.1`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.6 Sign Up`
- **Title:** Sign-up blocks invalid email format
- **Objective:** Verify invalid email input is rejected on the client.
- **Preconditions:** Sign-up screen open.
- **Test Data:** Invalid email such as `abc`.
- **Steps:**
  1. Enter the invalid email.
  2. Enter a valid password and confirmation.
  3. Submit the form.
- **Expected Result:** An inline email validation error is shown; submission does not proceed; the user remains on `Sign Up`.
- **Priority:** High

#### TC-ONB-FE-011

- **Related Scenario ID:** `TS-ONB-FE-10`
- **Related User Story:** `US-3.1`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.6 Sign Up`
- **Title:** Sign-up blocks weak password
- **Objective:** Verify password strength rules are enforced in the UI.
- **Preconditions:** Sign-up screen open.
- **Test Data:** Valid email; invalid passwords that violate `FR-1`, such as fewer than 8 characters, missing uppercase, missing lowercase, or missing numeric character.
- **Steps:**
  1. Enter a valid email.
  2. Enter each invalid password variant one at a time.
  3. Submit the form for each variant.
- **Expected Result:** Password validation feedback is shown for every invalid variant; account creation is blocked until the password meets the minimum 8-character, mixed-case, and numeric rule set.
- **Priority:** High

#### TC-ONB-FE-011A

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.1`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.6 Sign Up`
- **Title:** Sign-up blocks mismatched password confirmation
- **Objective:** Verify the confirm-password field prevents accidental account creation with mismatched values.
- **Preconditions:** Sign-up screen open.
- **Test Data:** Valid email; valid password; different confirm-password value.
- **Steps:**
  1. Enter a valid email.
  2. Enter a valid password.
  3. Enter a non-matching confirm-password value.
  4. Submit the form.
- **Expected Result:** The app shows a password mismatch validation error and does not create the account.
- **Priority:** Medium

#### TC-ONB-FE-012

- **Related Scenario ID:** `TS-ONB-FE-11`
- **Related User Story:** `US-3.1`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.6 Sign Up`
- **Title:** Duplicate-email sign-up shows recovery guidance
- **Objective:** Verify duplicate-account failures are understandable and recoverable.
- **Preconditions:** An account already exists for the test email.
- **Test Data:** Registered email; strong password.
- **Steps:**
  1. Attempt sign-up with an already registered email.
- **Expected Result:** The user sees a duplicate-email error and is guided to sign in instead; the app remains on an authentication screen.
- **Priority:** High

#### TC-ONB-FE-012A

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.1`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.6 Sign Up`
- **Title:** Sign-up network failure shows retryable error without false progression
- **Objective:** Verify the app handles backend or connectivity failure during account creation.
- **Preconditions:** Sign-up screen open; consent accepted; network failure can be simulated.
- **Test Data:** New email; strong password.
- **Steps:**
  1. Simulate offline mode or backend unavailability.
  2. Enter valid sign-up credentials.
  3. Submit the form.
- **Expected Result:** The app does not create a false success state or advance into onboarding; a retryable network or service error is shown and the user remains on `Sign Up`.
- **Priority:** High

#### TC-ONB-FE-013

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.3`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Returning user sign-in with valid credentials goes directly to Home
- **Objective:** Verify the positive returning-user email/password path.
- **Preconditions:** Existing onboarded account; no active session; sign-in screen open.
- **Test Data:** Valid registered email and correct password.
- **Steps:**
  1. Enter valid existing-user credentials.
  2. Tap `Sign In`.
- **Expected Result:** The user is authenticated and taken directly to Home; age gate, consent, intro, and setup screens are not re-shown.
- **Priority:** High

#### TC-ONB-FE-013A

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.3`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Sign-in network failure shows retryable error without leaving the sign-in screen
- **Objective:** Verify the app handles backend or connectivity failure during returning-user authentication.
- **Preconditions:** Existing account; sign-in screen open; network failure can be simulated.
- **Test Data:** Valid registered email and correct password.
- **Steps:**
  1. Simulate offline mode or backend unavailability.
  2. Enter valid credentials.
  3. Tap `Sign In`.
- **Expected Result:** The app shows a retryable network or service error; no authenticated state is created; the user remains on `Sign In`.
- **Priority:** High

#### TC-ONB-FE-014

- **Related Scenario ID:** `TS-ONB-FE-11`
- **Related User Story:** `US-3.3`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Wrong-password sign-in preserves recovery options
- **Objective:** Verify invalid credential errors are shown without breaking the sign-in form.
- **Preconditions:** Existing account; sign-in screen open.
- **Test Data:** Valid email; wrong password.
- **Steps:**
  1. Attempt sign-in with a wrong password.
- **Expected Result:** An authentication error is shown; the user remains on `Sign In`; `Forgot Password?` stays visible and usable.
- **Priority:** High

#### TC-ONB-FE-015

- **Related Scenario ID:** `TS-ONB-FE-12`
- **Related User Story:** `US-3.2`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Google social-auth button launches provider flow
- **Objective:** Verify the Google entry point is wired from the app.
- **Preconditions:** Sign-in screen visible.
- **Test Data:** None.
- **Steps:**
  1. Tap `Sign in with Google`.
- **Expected Result:** The Google provider flow is launched from the app.
- **Priority:** Medium

#### TC-ONB-FE-016

- **Related Scenario ID:** `TS-ONB-FE-12`
- **Related User Story:** `US-3.2`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Apple social-auth button launches provider flow
- **Objective:** Verify the Apple entry point is wired from the app.
- **Preconditions:** Sign-in screen visible.
- **Test Data:** None.
- **Steps:**
  1. Tap `Sign in with Apple`.
- **Expected Result:** The Apple provider flow is launched from the app.
- **Priority:** Medium

#### TC-ONB-FE-016A

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.2`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** First-time social-auth success enters the first-time onboarding continuation flow
- **Objective:** Verify successful social authentication creates or authenticates a new user and routes them through the new-user onboarding path.
- **Preconditions:** Consent accepted; social provider test account is new to ShadowSpeak.
- **Test Data:** Valid Google or Apple first-time social-auth account.
- **Steps:**
  1. Start a social-auth flow from `Sign In`.
  2. Complete provider authentication successfully with a first-time account.
  3. Return to the app.
- **Expected Result:** The app authenticates the user and routes them to the first-time onboarding continuation flow beginning with the intro sequence.
- **Priority:** High

#### TC-ONB-FE-016B

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.2`, `US-3.3`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Returning social-auth success goes directly to Home
- **Objective:** Verify successful social authentication for an existing onboarded user bypasses onboarding.
- **Preconditions:** Existing onboarded account linked to Google or Apple; no active session.
- **Test Data:** Valid returning social-auth account.
- **Steps:**
  1. Start a social-auth flow from `Sign In`.
  2. Complete provider authentication successfully with the existing account.
  3. Return to the app.
- **Expected Result:** The app authenticates the returning user and routes directly to Home without showing onboarding steps again.
- **Priority:** High

#### TC-ONB-FE-017

- **Related Scenario ID:** `TS-ONB-FE-13`
- **Related User Story:** `US-3.2`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Cancelled social-auth returns to a usable sign-in screen
- **Objective:** Verify provider cancellation does not leave the app in a broken state.
- **Preconditions:** Social provider flow available.
- **Test Data:** Cancelled Google or Apple auth flow.
- **Steps:**
  1. Start a social-auth flow.
  2. Cancel it at the provider.
  3. Return to the app.
- **Expected Result:** The app returns to `Sign In` with working controls and no partial onboarding progression.
- **Priority:** Medium

#### TC-ONB-FE-017A

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.2`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Provider-side social-auth failure returns the user to sign-in without account creation
- **Objective:** Verify a provider error is handled distinctly from manual cancel.
- **Preconditions:** Social provider flow available; a provider-side failure can be simulated or triggered with a test identity.
- **Test Data:** Social-auth attempt that returns an error from Google or Apple.
- **Steps:**
  1. Start a social-auth flow.
  2. Trigger or simulate a provider-side authentication failure.
  3. Return to the app.
- **Expected Result:** The app returns to `Sign In`, shows failure feedback, and does not create a partial account or progress into onboarding.
- **Priority:** High

#### TC-ONB-FE-018

- **Related Scenario ID:** `TS-ONB-FE-14`
- **Related User Story:** `US-3.4`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Forgot-password link opens the reset request flow
- **Objective:** Verify the reset-request entry point is reachable from sign-in.
- **Preconditions:** Sign-in screen open.
- **Test Data:** None.
- **Steps:**
  1. Tap `Forgot Password?`.
- **Expected Result:** The password reset request screen opens.
- **Priority:** High

#### TC-ONB-FE-019

- **Related Scenario ID:** `TS-ONB-FE-15`
- **Related User Story:** `US-3.4`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Registered reset request shows success guidance
- **Objective:** Verify the user receives clear next-step feedback after requesting a password reset.
- **Preconditions:** Reset-request screen open.
- **Test Data:** Registered email.
- **Steps:**
  1. Enter a registered email.
  2. Submit the reset request.
- **Expected Result:** A success message tells the user to check email for the reset link; the app does not show a false validation failure.
- **Priority:** Medium

#### TC-ONB-FE-020

- **Related Scenario ID:** `TS-ONB-FE-15`
- **Related User Story:** `US-3.4`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Unknown-email reset request shows error guidance
- **Objective:** Verify unregistered email submissions fail clearly.
- **Preconditions:** Reset-request screen open.
- **Test Data:** Unregistered email.
- **Steps:**
  1. Enter an unregistered email.
  2. Submit the reset request.
- **Expected Result:** The app shows an error stating that no account is associated with the email; the user remains able to retry.
- **Priority:** Medium

#### TC-ONB-FE-021

- **Related Scenario ID:** `TS-ONB-FE-16`
- **Related User Story:** `US-3.4`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Reset-password form blocks weak replacement password
- **Objective:** Verify weak passwords cannot be saved during reset.
- **Preconditions:** Reset-password page is reachable.
- **Test Data:** Invalid replacement passwords that violate `FR-1`, such as fewer than 8 characters, missing uppercase, missing lowercase, or missing numeric character.
- **Steps:**
  1. Open a valid reset-password page.
  2. Enter each invalid replacement password one at a time.
  3. Submit the form for each variant.
- **Expected Result:** Validation feedback is shown for every invalid variant and the password is not updated until the new password satisfies the minimum 8-character, mixed-case, and numeric rule set.
- **Priority:** Medium

#### TC-ONB-FE-021A

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.4`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Valid password reset completion returns the user to sign-in with success confirmation
- **Objective:** Verify the happy path for reset-password completion after the user opens a valid reset link.
- **Preconditions:** Valid reset link available for a registered account.
- **Test Data:** Strong new password that meets policy requirements.
- **Steps:**
  1. Open a valid reset link.
  2. Confirm the secure reset page loads correctly.
  3. Enter a valid new password.
  4. Submit the reset form.
- **Expected Result:** The password is updated successfully; the user is redirected to `Sign In`; a success message confirms the password was reset and the user can log in with the new password.
- **Priority:** High

#### TC-ONB-FE-022

- **Related Scenario ID:** `TS-ONB-FE-16`
- **Related User Story:** `US-3.4`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Expired reset link shows retry guidance
- **Objective:** Verify expired reset links fail safely.
- **Preconditions:** Expired reset link available.
- **Test Data:** Expired reset link.
- **Steps:**
  1. Open the expired link.
- **Expected Result:** The app or reset page shows an expiration message and a clear path to request a new reset link.
- **Priority:** Medium

### 6.3 Intro and Profile Setup

#### TC-ONB-FE-023

- **Related Scenario ID:** `TS-ONB-FE-17`
- **Related User Story:** `US-4.1`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `Approved deviation: intro screens between auth and level selection`
- **Title:** First-time authenticated user sees the intro sequence
- **Objective:** Verify intro screens are shown once for newly authenticated users.
- **Preconditions:** New user has just completed successful sign-up or first social auth.
- **Test Data:** None.
- **Steps:**
  1. Complete first-time authentication.
  2. Observe the next onboarding step.
- **Expected Result:** The app shows the intro sequence before profile setup begins.
- **Priority:** Medium

#### TC-ONB-FE-024

- **Related Scenario ID:** `TS-ONB-FE-18`
- **Related User Story:** `US-4.1`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `Approved deviation: intro screens between auth and level selection`
- **Title:** Intro sequence supports forward navigation into level selection
- **Objective:** Verify users can progress through all intro slides and enter profile setup.
- **Preconditions:** User is on the intro sequence.
- **Test Data:** None.
- **Steps:**
  1. Tap `Next` or swipe through each intro screen.
  2. Tap `Get Started` on the last screen.
- **Expected Result:** The intro sequence is marked complete and the user is routed to `Level Selection`.
- **Priority:** Medium

#### TC-ONB-FE-025

- **Related Scenario ID:** `TS-ONB-FE-19`
- **Related User Story:** `US-4.1`
- **Related FR:** `FR-1`
- **Related Wireframe Screen:** `Approved deviation: intro screens between auth and level selection`
- **Title:** Completed intro sequence is not shown again on later sign-ins
- **Objective:** Verify intro content is one-time only.
- **Preconditions:** User previously completed intro screens.
- **Test Data:** Existing user with completed intro state.
- **Steps:**
  1. Sign out.
  2. Sign back in with the same account.
- **Expected Result:** The app skips the intro sequence and routes the user according to onboarding completion state.
- **Priority:** Medium

#### TC-ONB-FE-026

- **Related Scenario ID:** `TS-ONB-FE-20`
- **Related User Story:** `US-5.1`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.7 Level Selection`
- **Title:** Level selection is required before continuing
- **Objective:** Verify the user cannot proceed without choosing a valid practice level.
- **Preconditions:** User is on `Level Selection`.
- **Test Data:** None.
- **Steps:**
  1. Leave all level options unselected.
  2. Tap `Continue`.
- **Expected Result:** The app shows required-selection validation and keeps the user on `Level Selection`.
- **Priority:** High

#### TC-ONB-FE-027

- **Related Scenario ID:** `TS-ONB-FE-20`
- **Related User Story:** `US-5.1`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.7 Level Selection`
- **Title:** Valid level selection is saved before moving to reminder setup
- **Objective:** Verify selected level is persisted as part of onboarding progression.
- **Preconditions:** User is on `Level Selection`.
- **Test Data:** Valid level such as `Beginner`, `Intermediate`, or `Advanced`.
- **Steps:**
  1. Select a valid level.
  2. Tap `Continue`.
  3. Complete onboarding or inspect the earliest surface that reflects the saved level.
- **Expected Result:** The user advances to `Reminder Setup`; the selected level is retained and later visible in onboarding resume behavior, Home recommendation context, or Settings/Profile.
- **Priority:** High

### 6.4 Reminder Setup and Permission Prompts

#### TC-ONB-FE-028

- **Related Scenario ID:** `TS-ONB-FE-21`
- **Related User Story:** `US-5.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.8 Reminder Setup`
- **Title:** Enabled reminder with valid time is saved and advances to permission prompts
- **Objective:** Verify the standard reminder setup path.
- **Preconditions:** User is on `Reminder Setup`; notification permission status is not yet resolved.
- **Test Data:** Valid reminder time such as `08:00`.
- **Steps:**
  1. Enable reminders.
  2. Choose a valid reminder time using the picker.
  3. Tap `Continue`.
- **Expected Result:** The selected reminder time is retained for the onboarding session and the app advances to `Permission Prompts`.
- **Priority:** Medium

#### TC-ONB-FE-029

- **Related Scenario ID:** `TS-ONB-FE-22`
- **Related User Story:** `US-5.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.8 Reminder Setup`
- **Title:** Reminder setup can be skipped
- **Objective:** Verify reminders are optional in onboarding.
- **Preconditions:** User is on `Reminder Setup`.
- **Test Data:** None.
- **Steps:**
  1. Tap `Skip reminders`.
- **Expected Result:** No reminder is scheduled in the onboarding session and the app advances to `Permission Prompts`.
- **Priority:** Medium

#### TC-ONB-FE-030

- **Related Scenario ID:** `TS-ONB-FE-23`
- **Related User Story:** `US-5.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.8 Reminder Setup`
- **Title:** Reminder setup blocks continuation when reminders are enabled but no time is confirmed
- **Objective:** Verify the screen enforces a valid time-picker outcome when reminder enablement is turned on.
- **Preconditions:** User is on `Reminder Setup`.
- **Test Data:** Reminder toggle enabled; time picker opened but no time confirmed.
- **Steps:**
  1. Enable reminders.
  2. Open the time picker and dismiss it without confirming a time, or clear the selection if the UI allows it.
  3. Tap `Continue`.
- **Expected Result:** The app shows validation requiring a reminder time before progression.
- **Priority:** Medium

#### TC-ONB-FE-031

- **Related Scenario ID:** `TS-ONB-FE-24`
- **Related User Story:** `US-5.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.9 Permission Prompts`
- **Title:** Allowing notification permission preserves the reminder preference
- **Objective:** Verify the positive reminder-permission branch after reminder setup.
- **Preconditions:** Reminder time chosen; notification permission not yet decided; user is on `Permission Prompts`.
- **Test Data:** Reminder time `08:00`.
- **Steps:**
  1. Trigger the notification permission prompt from onboarding.
  2. Allow notification permission.
  3. Continue onboarding.
- **Expected Result:** Reminder permission is granted; the selected reminder time remains enabled; the user can finish onboarding without re-entering the reminder step.
- **Priority:** Medium

#### TC-ONB-FE-032

- **Related Scenario ID:** `TS-ONB-FE-24`
- **Related User Story:** `US-5.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.9 Permission Prompts`
- **Title:** Denying notification permission disables reminders but does not block onboarding
- **Objective:** Verify the degraded reminder path is explicit and non-blocking.
- **Preconditions:** Reminder time chosen; notification permission not yet decided; user is on `Permission Prompts`.
- **Test Data:** Reminder time `08:00`.
- **Steps:**
  1. Trigger the notification permission prompt.
  2. Deny notification permission.
  3. Observe the app state.
  4. Continue onboarding.
- **Expected Result:** The app informs the user that reminders are disabled until notification permission is enabled; onboarding can still continue.
- **Priority:** High

#### TC-ONB-FE-033

- **Related Scenario ID:** `TS-ONB-FE-24`
- **Related User Story:** `US-5.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.9 Permission Prompts`
- **Title:** Previously denied notification permission shows recovery messaging on permission prompts
- **Objective:** Verify the onboarding UI handles already-denied notification status gracefully.
- **Preconditions:** Notification permission was denied previously at OS level; user is on `Permission Prompts`.
- **Test Data:** Any saved reminder preference.
- **Steps:**
  1. Reach `Permission Prompts` with notification permission already denied.
  2. Observe the notification permission card and available actions.
- **Expected Result:** The app does not loop a missing OS prompt; it shows denied-state messaging and a recovery path such as `Open Settings` or continue without reminders.
- **Priority:** Medium

#### TC-ONB-FE-034

- **Related Scenario ID:** `TS-ONB-FE-24`
- **Related User Story:** `US-5.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.9 Permission Prompts`
- **Title:** Open Settings from notification denied state returns to onboarding with updated reminder status
- **Objective:** Verify recovery from denied notification permission.
- **Preconditions:** Notification permission denied; user is on `Permission Prompts`.
- **Test Data:** Saved reminder preference from reminder step.
- **Steps:**
  1. Tap `Open Settings` from the notification denied state.
  2. Enable or keep notification permission disabled in OS settings.
  3. Return to the app.
- **Expected Result:** The onboarding permission screen reflects the current OS permission state and preserves the appropriate reminder state before continuation.
- **Priority:** Medium

#### TC-ONB-FE-034A

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-5.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.8 Reminder Setup`, `1.9 Permission Prompts`
- **Title:** Granted reminder setup results in a local notification at the scheduled time
- **Objective:** Verify reminder setup produces the expected device-level reminder outcome after onboarding.
- **Preconditions:** Reminder enabled with a known time; notification permission granted; onboarding completed successfully.
- **Test Data:** Reminder time set a few minutes ahead of current device time.
- **Steps:**
  1. Complete onboarding with reminders enabled and notification permission granted.
  2. Keep the device idle or background the app until the scheduled reminder time.
  3. Observe device notification behavior.
- **Expected Result:** A local notification is displayed at the scheduled reminder time and matches the expected practice reminder purpose.
- **Priority:** Medium

### 6.5 Microphone Permission

#### TC-ONB-FE-035

- **Related Scenario ID:** `TS-ONB-FE-25`
- **Related User Story:** `US-6.1`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.9 Permission Prompts`
- **Title:** Microphone permission card explains the reason for access
- **Objective:** Verify the user sees clear rationale before the OS microphone prompt.
- **Preconditions:** User is on `Permission Prompts`.
- **Test Data:** None.
- **Steps:**
  1. Review the microphone section on the permission screen.
- **Expected Result:** The UI clearly explains that microphone access is needed for recording shadowing practice.
- **Priority:** High

#### TC-ONB-FE-036

- **Related Scenario ID:** `TS-ONB-FE-26`
- **Related User Story:** `US-6.1`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.9 Permission Prompts`
- **Title:** Allowing microphone permission records the granted state and completes the allow path
- **Objective:** Verify the positive microphone-permission branch.
- **Preconditions:** Microphone permission not yet decided; user is on `Permission Prompts`.
- **Test Data:** None.
- **Steps:**
  1. Trigger microphone permission.
  2. Allow microphone access in the OS dialog.
  3. Continue onboarding to completion.
- **Expected Result:** Microphone permission is granted; onboarding completes successfully; the app records that recording features are available on first Home entry or the next recording-capable surface.
- **Priority:** High

#### TC-ONB-FE-037

- **Related Scenario ID:** `TS-ONB-FE-27`
- **Related User Story:** `US-6.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.9 Permission Prompts`
- **Title:** Denying microphone permission shows recovery guidance and still allows completion
- **Objective:** Verify the denied microphone state is non-blocking but explicit.
- **Preconditions:** Microphone permission not yet decided; user is on `Permission Prompts`.
- **Test Data:** None.
- **Steps:**
  1. Trigger microphone permission.
  2. Deny microphone access in the OS dialog.
  3. Observe the denied state.
  4. Continue onboarding.
- **Expected Result:** The app explains that recording is unavailable until microphone access is enabled, provides a recovery path, and still allows onboarding completion.
- **Priority:** High

#### TC-ONB-FE-038

- **Related Scenario ID:** `TS-ONB-FE-27`
- **Related User Story:** `US-6.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.9 Permission Prompts`
- **Title:** Open Settings from microphone denied state returns to onboarding with updated permission status
- **Objective:** Verify recovery from denied microphone permission.
- **Preconditions:** Microphone permission denied; user is on `Permission Prompts`.
- **Test Data:** None.
- **Steps:**
  1. Tap `Open Settings` from the microphone denied state.
  2. Enable or keep microphone permission disabled in OS settings.
  3. Return to the app.
- **Expected Result:** The app reflects the current microphone permission state on the permission screen and preserves the correct continuation path.
- **Priority:** Medium

### 6.6 Relaunch, Resume, and Completion

#### TC-ONB-FE-039

- **Related Scenario ID:** `TS-ONB-FE-28`
- **Related User Story:** `US-7.2`
- **Related FR:** `FR-9`
- **Related Wireframe Screen:** `1.4 Privacy and Ad Consent`, `1.5 Sign In`
- **Title:** Relaunch after consent but before authentication resumes at sign-in
- **Objective:** Verify pre-auth onboarding progress is preserved across app relaunch.
- **Preconditions:** Age gate and consent completed; user has not authenticated.
- **Test Data:** None.
- **Steps:**
  1. Close the app after completing consent.
  2. Reopen the app.
- **Expected Result:** The app opens at the authentication entry point instead of restarting from `Age Gate`.
- **Priority:** Medium

#### TC-ONB-FE-039A

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.3`
- **Related FR:** `FR-1`, `FR-9`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Signed-out returning user launch routes directly to sign-in
- **Objective:** Verify a returning user without an active session is not forced through age gate or consent again.
- **Preconditions:** Existing onboarded account; user is fully signed out; no active session token remains.
- **Test Data:** Valid returning account.
- **Steps:**
  1. Launch or relaunch the app from a fully signed-out state.
  2. Observe the first actionable screen.
- **Expected Result:** The app routes directly to `Sign In`; `Age Gate` and `Privacy and Ad Consent` are not shown again for the returning user.
- **Priority:** High

#### TC-ONB-FE-040

- **Related Scenario ID:** `TS-ONB-FE-29`
- **Related User Story:** `US-7.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `Approved deviation: intro`, `1.7 Level Selection`, `1.8 Reminder Setup`, `1.9 Permission Prompts`
- **Title:** Authenticated relaunch resumes at the first incomplete onboarding step
- **Objective:** Verify partially onboarded authenticated users return to the correct step.
- **Preconditions:** Authenticated account with incomplete onboarding state.
- **Test Data:** Accounts paused at intro, level selection, reminder setup, notification permission, and microphone permission.
- **Steps:**
  1. Reopen the app for each partial-onboarding test account.
- **Expected Result:** Each user resumes at the correct first incomplete step with previously completed earlier steps preserved.
- **Priority:** High

#### TC-ONB-FE-041

- **Related Scenario ID:** `TS-ONB-FE-30`
- **Related User Story:** `US-7.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `2.1 Home / Daily Practice`
- **Title:** Relaunch after completed onboarding goes directly to Home
- **Objective:** Verify completed users bypass onboarding on later app launches.
- **Preconditions:** Onboarding complete for the test user.
- **Test Data:** Existing onboarded account.
- **Steps:**
  1. Relaunch the app.
- **Expected Result:** The user lands directly on `Home / Daily Practice` with no onboarding screens shown.
- **Priority:** High

#### TC-ONB-FE-042

- **Related Scenario ID:** `TS-ONB-FE-31`
- **Related User Story:** `US-7.2`
- **Related FR:** `FR-1`, `FR-9`
- **Related Wireframe Screen:** `1.5 Sign In`
- **Title:** Expired saved session clears safely and routes the user back into onboarding or sign-in
- **Objective:** Verify invalid saved authentication state does not trap the user.
- **Preconditions:** Expired stored session token.
- **Test Data:** Expired token for an existing account.
- **Steps:**
  1. Launch the app with an expired saved session.
  2. Observe boot and routing behavior.
- **Expected Result:** The invalid session is cleared and the app routes the user to the correct recovery entry point, typically `Sign In` or another allowed pre-auth step.
- **Priority:** Medium

#### TC-ONB-FE-043

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-7.1`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `2.1 Home / Daily Practice`, `4.1 Settings`
- **Title:** Completing onboarding exposes the saved setup state on first app entry
- **Objective:** Verify first-run setup choices are observable after onboarding finishes.
- **Preconditions:** User completes onboarding with a known combination of level, reminder preference, and microphone permission state.
- **Test Data:** Example combination: `Intermediate`, reminder `08:00`, microphone denied.
- **Steps:**
  1. Complete onboarding with the selected test data.
  2. Land on Home.
  3. Open Settings or the nearest visible profile/reminder surface if needed.
- **Expected Result:** The app lands on Home; saved setup choices are reflected in user-visible state, including selected level context, reminder enabled or disabled status, and microphone permission status or recording availability messaging.
- **Priority:** High

#### TC-ONB-FE-043A

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-6.2`
- **Related FR:** `FR-8`
- **Related Wireframe Screen:** `1.9 Permission Prompts`, `2.4 Practice Session`
- **Title:** Attempting a recording-capable practice session after microphone denial shows a block and recovery path
- **Objective:** Verify the post-onboarding safeguard required after the user denied microphone access.
- **Preconditions:** Onboarding completed with microphone permission denied; user is on Home and can reach a recording-capable practice session.
- **Test Data:** Any lesson that supports recording.
- **Steps:**
  1. Start a recording-capable practice session after onboarding.
  2. Attempt to begin recording or enter the recording stage.
  3. Observe the app response.
  4. Tap the recovery action if shown and return from system settings.
- **Expected Result:** The app blocks recording, explains that microphone access is required, and offers an `Open Settings` recovery path; after returning from settings, the app reflects the current permission state correctly.
- **Priority:** High

## 7. Traceability Summary

| Coverage Area | Scenario Coverage | User Story Coverage | FR Coverage |
|---|---|---|---|
| Age gate and underage block | `TS-ONB-FE-01` to `TS-ONB-FE-03` | `US-1.1`, `US-1.2` | `FR-9` |
| Consent UX and failure handling | `TS-ONB-FE-04` to `TS-ONB-FE-08` | `US-2.1` | `FR-9` |
| Authentication and reset UX | `TS-ONB-FE-09` to `TS-ONB-FE-16`, supplementary | `US-3.1` to `US-3.4` | `FR-1` |
| Intro flow | `TS-ONB-FE-17` to `TS-ONB-FE-19` | `US-4.1` | `FR-1` |
| Level selection | `TS-ONB-FE-20` | `US-5.1` | `FR-8` |
| Reminder setup and notification permission | `TS-ONB-FE-21` to `TS-ONB-FE-24`, supplementary | `US-5.2` | `FR-8` |
| Microphone permission | `TS-ONB-FE-25` to `TS-ONB-FE-27` | `US-6.1`, `US-6.2` | `FR-8` |
| Relaunch, resume, and completion | `TS-ONB-FE-28` to `TS-ONB-FE-31`, supplementary | `US-7.1`, `US-7.2` | `FR-1`, `FR-8`, `FR-9` |

## 8. Notes for Automation

Good first candidates for mobile E2E automation:

- `TC-ONB-FE-001`
- `TC-ONB-FE-005`
- `TC-ONB-FE-009`
- `TC-ONB-FE-013`
- `TC-ONB-FE-027`
- `TC-ONB-FE-032`
- `TC-ONB-FE-036`
- `TC-ONB-FE-041`
- `TC-ONB-FE-043`
