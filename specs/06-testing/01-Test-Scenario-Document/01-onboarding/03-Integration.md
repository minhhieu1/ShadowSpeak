# Integration Test Scenario Document — Epic 01 First-Time Onboarding and Access

## Document Metadata

| Field | Value |
|---|---|
| Project | ShadowSpeak |
| Epic | 01 — First-Time Onboarding and Access |
| Phase | 07 - Testing |
| Type | Integration Test Scenario Document |
| Version | 1.0 |
| Date | 2026-05-23 |
| Status | Draft |
| Owner | QA |

## 1. Objective and Scope

This document defines cross-layer integration scenarios for Epic 01. It validates that the mobile app, authentication provider, API layer, and persistence work together correctly across real onboarding journeys.

In scope:

- End-to-end first-time onboarding
- Underage and consent-decline hard-stop paths
- Social-auth journey across provider and app
- Resume and relaunch flows using stored consent, session, and onboarding-step state
- Permission-denied onboarding completion and later recovery
- Cross-layer verification of visible outcome plus persisted backend state

Out of scope:

- Isolated API-only validation
- Isolated screen-only UI checks

## 2. References

- `specs/02-analysis/03-Functional-Requirements-Specification.md`
- `specs/02-analysis/06-user-story/01-onboarding.md`
- `specs/04-solution-architecture/05-API-Specification-Document.md`
- `specs/05-development/01-epic-01-onboarding/01-Backend-Technical-Task-Breakdown.md`
- `specs/05-development/01-epic-01-onboarding/02-Frontend-Technical-Task-Breakdown.md`

## 3. Assumptions and Environment

- Real or staging mobile app build is connected to QA or staging backend.
- Social auth and email flows are functional in the test environment.
- Testers can inspect both app behavior and resulting server-side state.
- Local app storage can be reset between runs.

## 4. Scenario Coverage Matrix

| Journey | Coverage Focus | Scenario IDs |
|---|---|---|
| Happy path | Full first-time onboarding to home | `TS-ONB-INT-01` |
| Hard-stop paths | Underage block and consent decline | `TS-ONB-INT-02` |
| Social auth | Cancel and success behaviors across provider and app | `TS-ONB-INT-03` |
| Resume flows | Sign-in, level, reminder, microphone resume points | `TS-ONB-INT-04` |
| Permission recovery | Mic denied during onboarding, blocked recording later | `TS-ONB-INT-05` |
| Session restore | Completed user, expired token, persisted state | `TS-ONB-INT-06` |

## 5. Integration Test Scenarios

#### TS-ONB-INT-01

- **Related User Story:** `US-1.1` to `US-7.1`
- **Title:** Happy-path onboarding from first launch to home using email sign-up
- **Description:** Validate the complete onboarding journey across app UI, API, auth, and persistence.
- **Preconditions:** Fresh install; unused email; clean backend state.
- **Test Data:** Eligible age, accepted consent, valid new email/password, selected level, valid reminder time, microphone granted.
- **Steps:**
  1. Launch the app and complete the age gate.
  2. Accept consent.
  3. Sign up with email/password.
  4. Complete the intro sequence.
  5. Select a level.
  6. Configure a reminder.
  7. Grant microphone permission.
  8. Finish onboarding and land on home.
  9. Inspect backend state for consent, profile, and `onboardingStep`.
- **Expected Result:** User reaches home successfully; backend contains the expected account, consent record, saved profile, and completed onboarding state.
- **Priority:** High

#### TS-ONB-INT-02

- **Related User Story:** `US-1.2`, `US-2.1`
- **Title:** Underage and consent-decline journeys prevent access end to end
- **Description:** Validate that hard-stop compliance paths block account creation and app entry across both client and backend.
- **Preconditions:** Fresh install.
- **Test Data:** Underage age selection; eligible age plus declined consent.
- **Steps:**
  1. Run onboarding with an underage selection.
  2. Confirm blocked state and verify no account exists.
  3. Reset the app state.
  4. Run onboarding with eligible age but decline consent.
  5. Confirm exit/dead-end path and verify no account exists.
- **Expected Result:** Neither flow creates an account or permits entry into sign-in or home.
- **Priority:** High

#### TS-ONB-INT-03

- **Related User Story:** `US-3.2`, `US-4.1`, `US-7.1`
- **Title:** Social-auth onboarding handles cancellation first and success second
- **Description:** Validate the app-provider-app round trip for social sign-in.
- **Preconditions:** Consent accepted; provider sandbox account available.
- **Test Data:** One cancelled provider attempt; one successful provider authentication.
- **Steps:**
  1. Complete age gate and consent.
  2. Start social auth and cancel it.
  3. Confirm the app returns safely to sign-in and no account is created.
  4. Start social auth again and complete it successfully.
  5. Finish the remaining onboarding flow.
- **Expected Result:** Cancellation is non-destructive; successful auth creates or restores the account and allows onboarding completion.
- **Priority:** High

#### TS-ONB-INT-04

- **Related User Story:** `US-7.2`
- **Title:** Partial onboarding resume works across sign-in, level, reminder, and microphone states
- **Description:** Validate that the app and backend coordinate correctly to restore onboarding progress after interruption.
- **Preconditions:** Ability to stop the flow at multiple points.
- **Test Data:** One run stopped after consent; one after intro; one after level; one after reminder.
- **Steps:**
  1. Stop after consent and relaunch.
  2. Stop after intro and relaunch.
  3. Stop after level selection and relaunch.
  4. Stop after reminder setup and relaunch.
  5. Verify the visible resume point and the corresponding backend/local state.
- **Expected Result:** Each relaunch returns the user to the correct first incomplete step with no progress loss.
- **Priority:** High

#### TS-ONB-INT-05

- **Related User Story:** `US-6.2`, `US-7.1`
- **Title:** User can complete onboarding with microphone denied and recover later during practice
- **Description:** Validate onboarding completion and later recording restriction for denied microphone permission.
- **Preconditions:** User reaches microphone step with OS permission undecided.
- **Test Data:** Denied microphone permission.
- **Steps:**
  1. Deny microphone permission during onboarding.
  2. Complete onboarding and reach home.
  3. Attempt a recording-based action later.
  4. Use the open-settings path if available.
- **Expected Result:** Onboarding still completes; recording is blocked later with clear recovery guidance.
- **Priority:** Medium

#### TS-ONB-INT-06

- **Related User Story:** `US-7.1`, `US-7.2`
- **Title:** Session restore behaves correctly for completed and expired-session users
- **Description:** Validate boot-time session restoration against stored auth and onboarding state.
- **Preconditions:** One fully onboarded account; one account with expired token.
- **Test Data:** Valid stored session; expired stored session.
- **Steps:**
  1. Launch the app with a valid completed-user session.
  2. Verify the user goes directly to home.
  3. Launch the app with an expired stored session.
  4. Verify the session is cleared and the user is routed safely.
- **Expected Result:** Completed user bypasses onboarding; expired-session user is redirected cleanly to sign-in or the correct pre-auth entry point.
- **Priority:** Medium

## 6. Traceability Summary

| Coverage Area | Scenarios |
|---|---|
| Full onboarding happy path | `TS-ONB-INT-01` |
| Compliance hard-stop paths | `TS-ONB-INT-02` |
| Social provider integration | `TS-ONB-INT-03` |
| Resume-state integration | `TS-ONB-INT-04` |
| Permission-denied integration | `TS-ONB-INT-05` |
| Session-restore integration | `TS-ONB-INT-06` |
