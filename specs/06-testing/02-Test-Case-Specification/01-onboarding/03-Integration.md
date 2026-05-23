# Integration Test Case Specification — Epic 01 First-Time Onboarding and Access

## Document Metadata

| Field | Value |
|---|---|
| Project | ShadowSpeak |
| Epic | 01 — First-Time Onboarding and Access |
| Phase | 06 - Testing |
| Type | Integration Test Case Specification |
| Version | 1.1 |
| Date | 2026-05-23 |
| Status | Draft |
| Owner | QA |
| Derived From | `specs/06-testing/01-Test-Scenario-Document/01-onboarding/03-Integration.md` |

## 1. Objective and Scope

This document defines executable cross-layer integration test cases for the ShadowSpeak onboarding journey. Each case verifies observable behavior across the mobile app, authentication provider, onboarding API surface, local device permission state, and documented persisted state.

In scope:

- End-to-end onboarding across app, provider, API, and documented persisted state
- Pre-auth consent bootstrap and post-auth consent re-key behavior
- Email sign-up and social-auth onboarding journeys
- Hard-stop compliance paths
- Reminder and permission recovery behavior across local state and profile persistence
- Relaunch, resume, signed-out launch, valid session restore, and expired session handling

Out of scope:

- API-only contract validation already covered by backend TCS
- Pure UI-only validation already covered by frontend TCS
- Undocumented internal fields or storage that are not part of approved source contracts

## 2. References

- `specs/02-analysis/06-user-story/01-onboarding.md`
- `specs/02-analysis/03-Functional-Requirements-Specification.md`
- `specs/03-ux-ui-design/03-Wireframe-Document.md`
- `specs/04-solution-architecture/05-API-Specification-Document.md`
- `specs/04-solution-architecture/04-Low-Level-Design-Mobile.md`
- `specs/06-testing/01-Test-Scenario-Document/01-onboarding/03-Integration.md`

## 3. Source Precedence and Approved Test Assumptions

When source documents conflict, this TCS uses the following precedence:

1. User story acceptance criteria
2. Functional Requirements Specification
3. API Specification and Mobile LLD for integration observables
4. Integration Test Scenario Document
5. Wireframe document

Approved assumptions used in this TCS:

- Intro screens are treated as part of the first-time authenticated flow because `US-4.1` and the integration scenario document require them, even though the current wireframe route omits them.
- Integration assertions are limited to documented observables. This TCS does not assert undocumented backend fields such as `onboardingStep` or undocumented profile fields for microphone permission state.
- Reminder cross-layer validation uses documented profile field `reminderTime`, local notification permission state, and observable device notification behavior. It does not assume undocumented backend storage for notification permission flags.
- Microphone permission persistence is verified through durable client permission state and post-onboarding recording behavior, not through a backend `UserProfile` field, because no approved API or storage contract exposes microphone status as a persisted profile attribute in the current source set. For this TCS, that user-story wording is treated as an approved contract gap to be reconciled upstream, not as a blocker to integration execution.
- Consent verification uses documented `GET /consent` and `PUT /consent` behavior with `X-Device-Id` pre-auth and authenticated consent state post-auth.

## 4. Integration Execution Rules

Unless a test case states otherwise, verify:

- UI route destination is deterministic and matches the case setup.
- Authentication side effects are verified through provider/auth existence and documented API access.
- Consent is verified through `GET /consent` using the correct identity mode:
  - Pre-auth: `X-Device-Id`
  - Post-auth: authenticated JWT
- Profile persistence is verified through `GET /me` and documented fields only, especially `level` and `reminderTime`.
- Local permission and notification behavior is verified on-device, not inferred from undocumented backend fields.
- Microphone permission persistence is verified by checking OS permission state and the app's allowed/blocked recording behavior after onboarding and relaunch.

## 5. Environment and Test Data

- QA or staging mobile build connected to QA or staging backend
- Ability to inspect:
  - App UI behavior
  - Provider/account existence
  - `GET /consent`
  - `GET /me`
  - Device notification and OS permission state
- Local app storage can be reset between runs
- Test data sets available for:
  - New email sign-up
  - Existing returning email/password user
  - Google and Apple social-auth test identities
  - Expired-session user
  - Valid-session user
  - Distinct reminder times for notification testing

## 6. Test Cases

### 6.1 Full Journeys and Compliance Hard Stops

#### TC-ONB-INT-001

- **Related Scenario ID:** `TS-ONB-INT-01`
- **Related User Story:** `US-1.1` to `US-7.1`
- **Related FR:** `FR-1`, `FR-8`, `FR-9`
- **Related Endpoints:** `PUT /consent`, `GET /consent`, `GET /me`
- **Related UX Sources:** `1.2 Age Gate`, `1.4 Privacy and Ad Consent`, `1.6 Sign Up`, `Approved deviation: intro before level`, `1.7 Level Selection`, `1.8 Reminder Setup`, `1.9 Permission Prompts`, `2.1 Home / Daily Practice`
- **Title:** Complete first-time onboarding with email sign-up, reminder enabled, notification granted, and microphone granted
- **Objective:** Validate the complete happy path across app UI, pre-auth consent bootstrap, account creation, post-auth consent re-key, profile persistence, local permission grants, and first Home entry.
- **Preconditions:** Fresh install; unused email; clean auth/backend state; known `X-Device-Id`.
- **Test Data:** Eligible age, consent accepted, valid new email/password, `level=Beginner`, `reminderTime=08:00`.
- **Steps:**
  1. Launch the app and complete the age gate as eligible.
  2. Accept consent.
  3. Call or inspect `GET /consent` pre-auth with the same `X-Device-Id`.
  4. Sign up with valid email/password.
  5. Complete the intro sequence.
  6. Select level `Beginner`.
  7. Enable reminders and choose `08:00`.
  8. Grant notification permission when prompted.
  9. Grant microphone permission when prompted.
  10. Finish onboarding and land on Home.
  11. Call authenticated `GET /consent`.
  12. Call authenticated `GET /me`.
  13. Relaunch the app and verify OS permission state for microphone remains granted.
- **Expected Result:** Pre-auth `GET /consent` shows persisted consent for the device; onboarding completes successfully; Home is displayed; authenticated `GET /consent` returns the same accepted consent values under the authenticated user; authenticated `GET /me` returns `level=Beginner` and `reminderTime=08:00`; notification and microphone permissions are granted at OS level and microphone permission remains granted after relaunch.
- **Priority:** High

#### TC-ONB-INT-002

- **Related Scenario ID:** `TS-ONB-INT-02`
- **Related User Story:** `US-1.2`
- **Related FR:** `FR-9`
- **Related Endpoints:** `GET /consent`
- **Related UX Sources:** `1.2 Age Gate`, `1.3 Age Policy Block`
- **Title:** Underage selection is blocked end to end with no account creation
- **Objective:** Validate the underage hard-stop path across app and auth/account state.
- **Preconditions:** Fresh install; no existing account for the test identity.
- **Test Data:** Underage age selection.
- **Steps:**
  1. Launch the app.
  2. Select an underage age option.
  3. Confirm the selection.
  4. Attempt to proceed or reach authentication.
  5. Inspect auth/account state.
- **Expected Result:** The app shows the underage blocked state; the user cannot reach authentication or Home; no account is created.
- **Priority:** High

#### TC-ONB-INT-003

- **Related Scenario ID:** `TS-ONB-INT-02`
- **Related User Story:** `US-2.1`
- **Related FR:** `FR-9`
- **Related Endpoints:** `GET /consent`
- **Related UX Sources:** `1.4 Privacy and Ad Consent`
- **Title:** Consent decline stops onboarding before authentication and account creation
- **Objective:** Validate the declined-consent hard-stop path across client and backend entry conditions.
- **Preconditions:** Fresh install; eligible age completed; known `X-Device-Id`.
- **Test Data:** Consent decline action.
- **Steps:**
  1. Complete age gate with an eligible age.
  2. Reach `Privacy and Ad Consent`.
  3. Decline consent.
  4. Attempt to reach authentication or Home.
  5. Inspect auth/account state.
- **Expected Result:** The app prevents progression into authentication or Home; no account is created; no authenticated profile can be retrieved.
- **Priority:** High

### 6.2 Social Auth and Consent Re-Key

#### TC-ONB-INT-004

- **Related Scenario ID:** `TS-ONB-INT-03`
- **Related User Story:** `US-3.2`
- **Related FR:** `FR-1`
- **Related Endpoints:** `GET /consent`
- **Related UX Sources:** `1.5 Sign In`
- **Title:** Social-auth cancellation returns safely with no account creation
- **Objective:** Validate provider cancel behavior across app and auth state.
- **Preconditions:** Eligible age and consent completed; provider sandbox account available; known `X-Device-Id`.
- **Test Data:** Cancelled Google or Apple auth run.
- **Steps:**
  1. Complete age gate and consent.
  2. Start a social-auth flow.
  3. Cancel the provider flow.
  4. Return to the app.
  5. Inspect auth/account state.
- **Expected Result:** The app returns to `Sign In`; no authenticated session is created; onboarding does not progress to intro, level, or Home.
- **Priority:** High

#### TC-ONB-INT-005

- **Related Scenario ID:** `TS-ONB-INT-03`
- **Related User Story:** `US-3.2`, `US-4.1`, `US-7.1`
- **Related FR:** `FR-1`, `FR-8`, `FR-9`
- **Related Endpoints:** `PUT /consent`, `GET /consent`, `GET /me`
- **Related UX Sources:** `1.4 Privacy and Ad Consent`, `1.5 Sign In`, `Approved deviation: intro before level`, `1.7 Level Selection`, `1.8 Reminder Setup`, `1.9 Permission Prompts`, `2.1 Home / Daily Practice`
- **Title:** First-time social-auth success completes onboarding and exposes user-scoped consent and profile
- **Objective:** Validate provider success, first-time onboarding continuation, and post-auth persistence for a social-auth user.
- **Preconditions:** Fresh install; no existing ShadowSpeak account linked to the provider identity; known `X-Device-Id`.
- **Test Data:** Successful first-time Google or Apple auth; `level=Intermediate`; reminder skipped.
- **Steps:**
  1. Complete age gate and accept consent.
  2. Verify pre-auth `GET /consent` with `X-Device-Id`.
  3. Start and complete social-auth successfully.
  4. Complete intro screens.
  5. Select `Intermediate` level.
  6. Skip reminders.
  7. Resolve notification and microphone permission prompts as allowed by the build.
  8. Finish onboarding and land on Home.
  9. Call authenticated `GET /consent`.
  10. Call authenticated `GET /me`.
- **Expected Result:** The app creates/authenticates the provider-linked account, completes onboarding successfully, and lands on Home; authenticated `GET /consent` reflects the accepted consent state; authenticated `GET /me` returns `level=Intermediate` and no reminder time.
- **Priority:** High

#### TC-ONB-INT-006

- **Related Scenario ID:** `TS-ONB-INT-04`
- **Related User Story:** `US-7.2`
- **Related FR:** `FR-9`
- **Related Endpoints:** `PUT /consent`, `GET /consent`
- **Related UX Sources:** `1.4 Privacy and Ad Consent`, `1.5 Sign In`
- **Title:** Pre-auth consent bootstrap survives relaunch and resumes at sign-in
- **Objective:** Validate pre-auth consent persistence across relaunch before authentication.
- **Preconditions:** Fresh install; known `X-Device-Id`.
- **Test Data:** Eligible age; consent accepted.
- **Steps:**
  1. Complete age gate and accept consent.
  2. Call `GET /consent` with the same `X-Device-Id`.
  3. Close the app before authentication.
  4. Relaunch the app.
  5. Call `GET /consent` again with the same `X-Device-Id`.
- **Expected Result:** The app resumes at `Sign In` without requiring age gate or consent again; both pre- and post-relaunch `GET /consent` calls return the same persisted consent state for the device.
- **Priority:** High

#### TC-ONB-INT-007

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-2.1`, `US-7.2`
- **Related FR:** `FR-9`
- **Related Endpoints:** `GET /consent`
- **Related UX Sources:** `1.4 Privacy and Ad Consent`, `1.5 Sign In`
- **Title:** Completing authentication re-keys consent from device-scoped onboarding state to user-scoped consent state
- **Objective:** Validate the core integration between pre-auth consent bootstrap and post-auth consent retrieval.
- **Preconditions:** Pre-auth consent already saved for a known `X-Device-Id`; no existing authenticated user consent for the target account.
- **Test Data:** Valid sign-up or first-time social-auth run.
- **Steps:**
  1. Save consent in the pre-auth flow.
  2. Verify `GET /consent` with `X-Device-Id` returns the expected device-scoped consent state.
  3. Authenticate successfully and complete the minimum required onboarding continuation to establish the session.
  4. Call authenticated `GET /consent`.
- **Expected Result:** Authenticated `GET /consent` returns the same accepted consent values under the authenticated user identity, demonstrating successful consent continuity from pre-auth to post-auth.
- **Priority:** High

### 6.3 Partial Resume and Profile Persistence

#### TC-ONB-INT-008

- **Related Scenario ID:** `TS-ONB-INT-04`
- **Related User Story:** `US-7.2`
- **Related FR:** `FR-1`, `FR-8`
- **Related Endpoints:** `GET /me`
- **Related UX Sources:** `Approved deviation: intro before level`, `1.7 Level Selection`
- **Title:** Relaunch after intro completion resumes at level selection
- **Objective:** Validate the earliest authenticated resume point after the intro sequence.
- **Preconditions:** New authenticated user reaches and completes intro screens, but stops before selecting a level.
- **Test Data:** None.
- **Steps:**
  1. Sign up or authenticate for the first time.
  2. Complete the intro sequence.
  3. Close the app before selecting a level.
  4. Relaunch the app.
  5. Call authenticated `GET /me`.
- **Expected Result:** The app resumes at `Level Selection`; authenticated `GET /me` does not yet contain a saved `level` or `reminderTime`.
- **Priority:** Medium

#### TC-ONB-INT-009

- **Related Scenario ID:** `TS-ONB-INT-04`
- **Related User Story:** `US-5.1`, `US-7.2`
- **Related FR:** `FR-8`
- **Related Endpoints:** `GET /me`
- **Related UX Sources:** `1.7 Level Selection`, `1.8 Reminder Setup`
- **Title:** Relaunch after level selection resumes at reminder setup with persisted level
- **Objective:** Validate level persistence and next-step restore after interruption.
- **Preconditions:** Authenticated user selected a valid level but has not completed reminder setup.
- **Test Data:** `level=Advanced`.
- **Steps:**
  1. Select `Advanced` level.
  2. Close the app before completing reminder setup.
  3. Relaunch the app.
  4. Call authenticated `GET /me`.
- **Expected Result:** The app resumes at `Reminder Setup`; authenticated `GET /me` returns `level=Advanced`; no incorrect reset to an earlier step occurs.
- **Priority:** High

#### TC-ONB-INT-010

- **Related Scenario ID:** `TS-ONB-INT-04`
- **Related User Story:** `US-5.2`, `US-7.2`
- **Related FR:** `FR-8`
- **Related Endpoints:** `GET /me`
- **Related UX Sources:** `1.8 Reminder Setup`, `1.9 Permission Prompts`
- **Title:** Relaunch after reminder setup resumes at permission prompts with persisted reminder time
- **Objective:** Validate reminder profile persistence and next-step restore after interruption.
- **Preconditions:** Authenticated user completed reminder setup but has not finished permission prompts.
- **Test Data:** `reminderTime=07:30`.
- **Steps:**
  1. Enable reminders and choose `07:30`.
  2. Close the app before finishing permission prompts.
  3. Relaunch the app.
  4. Call authenticated `GET /me`.
- **Expected Result:** The app resumes at `Permission Prompts`; authenticated `GET /me` returns `reminderTime=07:30`.
- **Priority:** High

### 6.4 Reminder and Permission Branches

#### TC-ONB-INT-011

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-5.2`
- **Related FR:** `FR-8`
- **Related Endpoints:** `GET /me`
- **Related UX Sources:** `1.8 Reminder Setup`, `1.9 Permission Prompts`
- **Title:** Skipping reminders completes onboarding without saving a reminder time
- **Objective:** Validate the optional reminder branch across profile persistence and device behavior.
- **Preconditions:** First-time authenticated user reaches `Reminder Setup`.
- **Test Data:** Reminder skipped.
- **Steps:**
  1. Reach `Reminder Setup`.
  2. Tap `Skip reminders`.
  3. Finish the remaining onboarding flow.
  4. Call authenticated `GET /me`.
- **Expected Result:** Onboarding completes successfully; authenticated `GET /me` returns no reminder time; no reminder is scheduled on the device.
- **Priority:** Medium

#### TC-ONB-INT-012

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-5.2`
- **Related FR:** `FR-8`
- **Related Endpoints:** None required
- **Related UX Sources:** `1.8 Reminder Setup`, `1.9 Permission Prompts`
- **Title:** Notification permission denial preserves onboarding completion and shows reminder recovery behavior
- **Objective:** Validate the reminder-permission degraded path across UI, local permission state, and profile persistence.
- **Preconditions:** First-time authenticated user enabled reminders and selected a valid reminder time; notification permission undecided.
- **Test Data:** `reminderTime=09:00`; notification denied.
- **Steps:**
  1. Enable reminders and choose `09:00`.
  2. Reach notification permission prompt.
  3. Deny notification permission.
  4. Complete the rest of onboarding.
  5. Inspect device notification permission state.
- **Expected Result:** Onboarding still completes successfully; the app shows reminder recovery guidance and continues with reminders disabled; notification permission remains denied at OS level and no reminder fires.
- **Priority:** Medium

#### TC-ONB-INT-013

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-5.2`
- **Related FR:** `FR-8`
- **Related Endpoints:** `GET /me`
- **Related UX Sources:** `1.8 Reminder Setup`, `1.9 Permission Prompts`
- **Title:** Granted reminder setup produces a local notification at the scheduled time
- **Objective:** Validate full reminder integration from onboarding setup to device notification outcome.
- **Preconditions:** First-time authenticated user enabled reminders; notification permission granted; onboarding completed.
- **Test Data:** Reminder scheduled a few minutes ahead of current device time.
- **Steps:**
  1. Complete onboarding with reminders enabled and notification permission granted.
  2. Call authenticated `GET /me`.
  3. Wait until the scheduled reminder time.
  4. Observe device notification behavior.
- **Expected Result:** Authenticated `GET /me` returns the saved reminder time; the device displays the expected local reminder notification at the scheduled time.
- **Priority:** Medium

#### TC-ONB-INT-014

- **Related Scenario ID:** `TS-ONB-INT-05`
- **Related User Story:** `US-6.2`, `US-7.1`
- **Related FR:** `FR-8`
- **Related Endpoints:** `GET /me`
- **Related UX Sources:** `1.9 Permission Prompts`, `2.1 Home / Daily Practice`, `2.4 Practice Session`
- **Title:** Microphone denial still allows onboarding completion and blocks later recording with recovery guidance
- **Objective:** Validate the listening-only onboarding path and later protection of recording-capable flows.
- **Preconditions:** First-time authenticated user reaches microphone permission prompt with OS microphone permission undecided.
- **Test Data:** Microphone denied.
- **Steps:**
  1. Deny microphone permission during onboarding.
  2. Finish onboarding and land on Home.
  3. Start a recording-capable practice flow.
  4. Attempt to begin recording.
  5. Use the recovery path to open OS settings if shown and return to the app.
  6. Relaunch the app without changing the OS microphone permission.
- **Expected Result:** Onboarding completes successfully and Home is displayed; recording-capable practice is blocked until microphone access is granted; the app explains the reason and offers recovery guidance through OS settings; after relaunch, microphone denial still persists at OS level and the recording block remains in effect until permission is changed.
- **Priority:** High

### 6.5 Session and Launch Routing

#### TC-ONB-INT-015

- **Related Scenario ID:** `TS-ONB-INT-06`
- **Related User Story:** `US-7.1`, `US-7.2`
- **Related FR:** `FR-1`, `FR-8`
- **Related Endpoints:** `GET /consent`, `GET /me`
- **Related UX Sources:** `2.1 Home / Daily Practice`
- **Title:** Valid completed-user session restores directly to Home
- **Objective:** Validate boot-time restoration for a fully onboarded authenticated user.
- **Preconditions:** Existing onboarded account with valid saved session.
- **Test Data:** Valid persisted session token.
- **Steps:**
  1. Launch the app with a valid saved session.
  2. Observe the first routed screen.
  3. Call authenticated `GET /consent`.
  4. Call authenticated `GET /me`.
- **Expected Result:** The user bypasses onboarding and lands directly on Home; authenticated consent and profile remain retrievable.
- **Priority:** Medium

#### TC-ONB-INT-016

- **Related Scenario ID:** `TS-ONB-INT-06`
- **Related User Story:** `US-7.2`
- **Related FR:** `FR-1`, `FR-9`
- **Related Endpoints:** `GET /consent`
- **Related UX Sources:** `1.5 Sign In`
- **Title:** Expired saved session clears safely and routes the user to sign-in
- **Objective:** Validate boot-time handling of expired authenticated state.
- **Preconditions:** Existing account with expired saved session.
- **Test Data:** Expired token.
- **Steps:**
  1. Launch the app with an expired saved session.
  2. Observe the boot sequence and destination route.
- **Expected Result:** The expired session is cleared and the app routes the user to `Sign In` without leaving the user stuck in an invalid authenticated state.
- **Priority:** Medium

#### TC-ONB-INT-017

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.3`
- **Related FR:** `FR-1`, `FR-9`
- **Related Endpoints:** None required
- **Related UX Sources:** `1.5 Sign In`
- **Title:** Signed-out returning user launch routes directly to sign-in and skips age/consent screens
- **Objective:** Validate launch routing for returning users without an active session.
- **Preconditions:** Existing onboarded account; user has explicitly signed out; no active session remains.
- **Test Data:** Valid returning user.
- **Steps:**
  1. Launch the app from a signed-out state.
  2. Observe the first actionable screen.
- **Expected Result:** The app routes directly to `Sign In`; age gate and consent are not shown again for the returning user.
- **Priority:** Medium

#### TC-ONB-INT-018

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.3`
- **Related FR:** `FR-1`
- **Related Endpoints:** `GET /me`
- **Related UX Sources:** `1.5 Sign In`, `2.1 Home / Daily Practice`
- **Title:** Returning email/password sign-in succeeds and restores direct access to Home
- **Objective:** Validate the full returning-user sign-in submission path across app, auth, and profile retrieval.
- **Preconditions:** Existing onboarded email/password account; user is signed out.
- **Test Data:** Valid registered email and correct password.
- **Steps:**
  1. Launch the app to `Sign In`.
  2. Enter valid returning-user credentials.
  3. Submit the sign-in form.
  4. Observe the routed destination.
  5. Call authenticated `GET /me`.
- **Expected Result:** Sign-in succeeds; the user is routed directly to Home; authenticated `GET /me` returns the existing profile for the returning user.
- **Priority:** High

#### TC-ONB-INT-019

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.3`, `US-3.4`
- **Related FR:** `FR-1`
- **Related Endpoints:** None required
- **Related UX Sources:** `1.5 Sign In`
- **Title:** Wrong-password sign-in hands off to forgot-password flow and reset completion restores access
- **Objective:** Validate the integrated recovery path from incorrect credentials through password reset and successful re-entry.
- **Preconditions:** Existing onboarded email/password account; user is signed out; valid reset-delivery setup available.
- **Test Data:** Registered email; wrong password; valid replacement password.
- **Steps:**
  1. Launch the app to `Sign In`.
  2. Enter the correct email with an incorrect password.
  3. Submit the sign-in form.
  4. Verify the error state exposes `Forgot Password?`.
  5. Enter the registered email in the reset flow and submit.
  6. Open the delivered reset link and set a valid new password.
  7. Return to `Sign In` and authenticate with the new password.
- **Expected Result:** The wrong-password attempt fails safely; the reset flow completes successfully; the user can sign in with the new password and reach Home.
- **Priority:** High

#### TC-ONB-INT-020

- **Related Scenario ID:** `Supplementary`
- **Related User Story:** `US-3.2`, `US-3.3`
- **Related FR:** `FR-1`
- **Related Endpoints:** `GET /me`
- **Related UX Sources:** `1.5 Sign In`, `2.1 Home / Daily Practice`
- **Title:** Returning social-auth sign-in restores direct access to Home
- **Objective:** Validate the returning-user social-auth path across provider, app, and authenticated profile access.
- **Preconditions:** Existing onboarded account linked to Google or Apple; user is signed out.
- **Test Data:** Valid returning social-auth identity.
- **Steps:**
  1. Launch the app to `Sign In`.
  2. Start the linked provider auth flow.
  3. Complete provider authentication successfully.
  4. Return to the app.
  5. Call authenticated `GET /me`.
- **Expected Result:** The returning social-auth user is authenticated and routed directly to Home; authenticated `GET /me` returns the existing profile.
- **Priority:** High

## 7. Traceability Summary

| Coverage Area | Scenario Coverage | User Story Coverage | FR Coverage |
|---|---|---|---|
| Full happy path onboarding | `TS-ONB-INT-01` | `US-1.1` to `US-7.1` | `FR-1`, `FR-8`, `FR-9` |
| Hard-stop compliance paths | `TS-ONB-INT-02` | `US-1.2`, `US-2.1` | `FR-9` |
| Social-auth and consent continuity | `TS-ONB-INT-03`, supplementary | `US-2.1`, `US-3.2`, `US-4.1`, `US-7.1` | `FR-1`, `FR-8`, `FR-9` |
| Resume-state integration | `TS-ONB-INT-04`, supplementary | `US-5.1`, `US-5.2`, `US-7.2` | `FR-1`, `FR-8`, `FR-9` |
| Reminder and permission branches | `TS-ONB-INT-05`, supplementary | `US-5.2`, `US-6.2`, `US-7.1` | `FR-8` |
| Returning access, session, and launch routing | `TS-ONB-INT-06`, supplementary | `US-3.2`, `US-3.3`, `US-3.4`, `US-7.1`, `US-7.2` | `FR-1`, `FR-8`, `FR-9` |

## 8. Notes for Automation

Strong first candidates for end-to-end automation:

- `TC-ONB-INT-001`
- `TC-ONB-INT-005`
- `TC-ONB-INT-006`
- `TC-ONB-INT-009`
- `TC-ONB-INT-013`
- `TC-ONB-INT-014`
- `TC-ONB-INT-015`
- `TC-ONB-INT-016`
- `TC-ONB-INT-018`
- `TC-ONB-INT-020`
