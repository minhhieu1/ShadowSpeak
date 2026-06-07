> **Execution:** This test plan is designed to be executed by the **frontend-test-plan-executor** and **ios-simulator-skill** tools. Do NOT use raw xcrun commands or coordinate tapping.

> **Review Status:** ✅ Reviewed — Sign-off Ready

# Relaunch, Resume & Completion — Frontend Test Plan

## Document Metadata

| Field | Value |
|---|---|
| Project | ShadowSpeak |
| Epic | 01 — First-Time Onboarding and Access |
| Phase | 06 - Testing |
| Type | Frontend Test Plan (Design Matching & Screen Functioning) |
| Covered Screens | Multiple (Sign In, Level Selection, Reminder Setup, Permission Prompts, Home) |
| Test Cases | TC-ONB-FE-039 to TC-ONB-FE-043A |
| Version | 1.0 |
| Date | 2026-06-07 |

## Base Configuration

**App:** ShadowSpeak  
**Device:** iPhone 15 (iOS 17.x)  
**Launch Method:** Expo Go

### Setup Steps

1. Boot the simulator (if not already booted)
2. Kill any stale Expo/Metro processes
3. Start Expo dev server: `cd frontend && npx expo start --ios`
4. Wait for the bundle to complete and Expo Go to load the app

---

## TC-ONB-FE-039: Relaunch after consent but before authentication resumes at sign-in

### Objective
Verify that pre-auth onboarding progress is preserved across app relaunch.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Age gate and consent completed; user has not authenticated.

### Precondition Setup Steps
1. Launch the app
2. Complete Age Gate (eligible age)
3. Complete Consent (Accept and Continue)

### Test Execution Steps
1. Close the app (swipe up from app switcher or stop the simulator process)
2. Relaunch the app via Expo Go
3. Map the screen using `screen_mapper.py --json`

### Expected Result
The app opens at the authentication entry point (Sign In) instead of restarting from Age Gate.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Resume at sign-in | Sign In screen appears | `screen_mapper.py --json` shows Sign In elements, not Age Gate |

---

## TC-ONB-FE-039A: Signed-out returning user launch routes directly to sign-in

### Objective
Verify a returning user without an active session is not forced through age gate or consent again.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Existing onboarded account; user is fully signed out; no active session token remains.

### Precondition Setup Steps
1. Sign out of an existing onboarded account (or clear session state)

### Test Execution Steps
1. Launch or relaunch the app from a fully signed-out state
2. Observe the first actionable screen
3. Map using `screen_mapper.py --json`

### Expected Result
The app routes directly to Sign In; Age Gate and Privacy and Ad Consent are not shown again for the returning user.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Direct to Sign In | Sign In is the first screen | `screen_mapper.py --json` shows Sign In elements |
| 2 | Onboarding skipped | Age Gate and Consent not shown | No navigation through Age Gate or Consent screens |

---

## TC-ONB-FE-040: Authenticated relaunch resumes at the first incomplete onboarding step

### Objective
Verify that partially onboarded authenticated users return to the correct incomplete step after relaunch.

### Test Type
Screen Functioning

### Related Screens
Level Selection, Reminder Setup, Permission Prompts

### Preconditions
Authenticated account with incomplete onboarding state (various pause points).

### Precondition Setup Steps
Prepare test accounts paused at:
- Intro sequence (after sign-up, before completing intro)
- Level Selection (intro complete, before selecting level)
- Reminder Setup (level selected, before setting reminder)
- Permission Prompts (reminder set, before permissions)
- Notification permission state
- Microphone permission state

### Test Execution Steps
For each partial-onboarding test account:
1. Reopen the app
2. Observe which screen appears

### Expected Result
Each user resumes at the correct first incomplete step with previously completed earlier steps preserved.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Resume at intro | User on intro sequence | `screen_mapper.py --json` shows intro content |
| 2 | Resume at Level Selection | Level Selection screen | `screen_mapper.py --json` shows level choice elements |
| 3 | Resume at Reminder Setup | Reminder Setup screen | `screen_mapper.py --json` shows reminder toggle/picker |
| 4 | Resume at Permission Prompts | Permission Prompts screen | `screen_mapper.py --json` shows permission cards |

---

## TC-ONB-FE-041: Relaunch after completed onboarding goes directly to Home

### Objective
Verify that users who have completed onboarding bypass it on subsequent launches.

### Test Type
Screen Functioning

### Related Screens
2.1 Home / Daily Practice

### Preconditions
Onboarding complete for the test user.

### Precondition Setup Steps
1. Complete full onboarding for a test account

### Test Execution Steps
1. Relaunch the app
2. Map the screen using `screen_mapper.py --json`

### Expected Result
The user lands directly on Home / Daily Practice with no onboarding screens shown.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Direct to Home | Home / Daily Practice appears | `screen_mapper.py --json` shows Home content (recommendation card, streak, tabs) |

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | Home screen layout | Recommendation card at top, streak/progress summary, resume lesson card, bottom tabs | [Visual — requires screenshot and human review] Matches Wireframe §2.1 | UI Spec §2.1, Wireframe §2.1 |
| 2 | Home background | `color-bg` (#F7F5F0) | [Visual — requires screenshot and human review] Background color matches spec | UI Spec §2.1 — Color Palette |

---

## TC-ONB-FE-042: Expired saved session clears safely and routes the user back into onboarding or sign-in

### Objective
Verify that an expired/stale saved session token does not trap the user.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Expired stored session token.

### Precondition Setup Steps
1. Simulate an expired session token (e.g., set a known expired token in storage, or use a test account with an expired credential)

### Test Execution Steps
1. Launch the app with an expired saved session
2. Observe boot and routing behavior

### Expected Result
The invalid session is cleared and the app routes the user to the correct recovery entry point, typically Sign In or another allowed pre-auth step.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Expired session cleared | No crash or trap state | App loads without getting stuck on a blank/loading screen |
| 2 | Recovery routing | Routes to Sign In | `screen_mapper.py --json` shows Sign In elements |

---

## TC-ONB-FE-043: Completing onboarding exposes the saved setup state on first app entry

### Objective
Verify that first-run setup choices are observable after onboarding finishes.

### Test Type
Screen Functioning

### Related Screens
2.1 Home / Daily Practice, 4.1 Settings

### Preconditions
User completes onboarding with a known combination of level, reminder preference, and microphone permission state.

### Precondition Setup Steps
1. Complete onboarding with: Level = Intermediate, Reminder = 08:00, Microphone = Denied

### Test Execution Steps
1. Complete onboarding with the selected test data
2. Land on Home
3. Open Settings or the nearest visible profile/reminder surface

### Expected Result
The app lands on Home; saved setup choices are reflected in user-visible state, including selected level context, reminder enabled or disabled status, and microphone permission status or recording availability messaging.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Level selection observable | Level context visible on Home or Settings | [Visual — requires screenshot and human review] Level (Intermediate) is reflected in recommendation or profile |
| 2 | Reminder status observable | Reminder enabled/disabled state visible | Reminder status can be found in Settings → Reminder Settings |
| 3 | Microphone status observable | Recording availability messaging appropriate | [Visual — requires screenshot and human review] Appropriate status shown for denied microphone |

---

## TC-ONB-FE-043A: Attempting a recording-capable practice session after microphone denial shows a block and recovery path

### Objective
Verify the post-onboarding safeguard when microphone access was denied during onboarding.

### Test Type
Screen Functioning

### Related Screens
1.9 Permission Prompts, 2.4 Practice Session

### Preconditions
Onboarding completed with microphone permission denied; user is on Home and can reach a recording-capable practice session.

### Precondition Setup Steps
1. Complete onboarding with microphone permission denied
2. Navigate to a lesson that supports recording
3. Start a practice session

### Test Execution Steps
1. Attempt to begin recording or enter the recording stage
2. Observe the app response
3. Tap the recovery action if shown
4. Return from system settings

### Expected Result
The app blocks recording, explains that microphone access is required, and offers an Open Settings recovery path; after returning from settings, the app reflects the current permission state correctly.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Recording blocked | Recording does not start | App shows block/explanation instead of recording |
| 2 | Explanation shown | Microphone requirement explained | [Visual — requires screenshot and human review] Message explains microphone is needed |
| 3 | Recovery path | Open Settings option available | Button/link to open OS settings is visible |
| 4 | Post-settings state | App reflects current permission state | After returning from settings, the practice screen updates correctly |

---

=== Test Plan Complete ===
Total Test Cases: 7

---
## Review Gate

**Status:** ✅ APPROVED
**Verdict:** All 7 test cases validated. File is sign-off ready.
