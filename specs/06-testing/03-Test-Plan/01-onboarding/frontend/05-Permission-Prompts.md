> **Execution:** This test plan is designed to be executed by the **frontend-test-plan-executor** and **ios-simulator-skill** tools. Do NOT use raw xcrun commands or coordinate tapping.

> **Review Status:** ✅ Reviewed — Sign-off Ready

# Permission Prompts — Frontend Test Plan

## Document Metadata

| Field | Value |
|---|---|
| Project | ShadowSpeak |
| Epic | 01 — First-Time Onboarding and Access |
| Phase | 06 - Testing |
| Type | Frontend Test Plan (Design Matching & Screen Functioning) |
| Covered Screens | 1.9 Permission Prompts |
| Test Cases | TC-ONB-FE-031 to TC-ONB-FE-038 |
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

## TC-ONB-FE-031: Allowing notification permission preserves the reminder preference

### Objective
Verify the positive notification permission branch after reminder setup.

### Test Type
Screen Functioning

### Related Screens
1.9 Permission Prompts

### Preconditions
Reminder time chosen (e.g., 08:00); notification permission not yet decided; user is on Permission Prompts.

### Precondition Setup Steps
1. Complete up to Permission Prompts (Age Gate, Consent, Sign Up, Intro, Level Selection, Reminder Setup with time 08:00)

### Test Execution Steps
1. Trigger the notification permission prompt from onboarding (tap the notification card/button)
2. Allow notification permission in the OS dialog
3. Continue onboarding (do not dismiss)

### Expected Result
Notification permission is granted; the selected reminder time remains enabled; the user can finish onboarding without re-entering the reminder step.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Permission prompt triggered | OS notification permission dialog appears | Standard iOS permission dialog is shown |
| 2 | Permission granted state | Card shows granted/positive status | [Visual — requires screenshot and human review] Card updates to reflect granted state |
| 3 | Reminder time preserved | Reminder remains set | Completing onboarding shows reminder was saved |

---

## TC-ONB-FE-032: Denying notification permission disables reminders but does not block onboarding

### Objective
Verify the degraded reminder path is explicit and non-blocking.

### Test Type
Screen Functioning

### Related Screens
1.9 Permission Prompts

### Preconditions
Reminder time chosen; notification permission not yet decided; user is on Permission Prompts.

### Precondition Setup Steps
1. Complete up to Permission Prompts (Reminder Setup with time 08:00)

### Test Execution Steps
1. Trigger the notification permission prompt
2. Deny notification permission
3. Observe the app state
4. Continue onboarding

### Expected Result
The app informs the user that reminders are disabled until notification permission is enabled; onboarding can still continue.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Denied state messaging | Notification denied message shown | [Visual — requires screenshot and human review] Card shows denied state with explanation |
| 2 | Onboarding can continue | User can proceed to next step | Continue button allows progression to Home or microphone step |

---

## TC-ONB-FE-033: Previously denied notification permission shows recovery messaging on permission prompts

### Objective
Verify the onboarding UI handles already-denied notification status gracefully.

### Test Type
Screen Functioning

### Related Screens
1.9 Permission Prompts

### Preconditions
Notification permission was denied previously at OS level; user is on Permission Prompts.

### Precondition Setup Steps
1. Before launching the app, deny notification permission at the OS level for the app
2. Complete onboarding up to Permission Prompts

### Test Execution Steps
1. Reach Permission Prompts with notification permission already denied
2. Observe the notification permission card and available actions

### Expected Result
The app does not loop a missing OS prompt; it shows denied-state messaging and a recovery path such as "Open Settings" or continue without reminders.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | No OS prompt loop | OS permission dialog is not shown again | App shows denied state without re-triggering system prompt |
| 2 | Recovery path shown | "Open Settings" or similar option visible | [Visual — requires screenshot and human review] Button/link to open OS settings is available |

---

## TC-ONB-FE-034: Open Settings from notification denied state returns to onboarding with updated reminder status

### Objective
Verify recovery from denied notification permission via Open Settings.

### Test Type
Screen Functioning

### Related Screens
1.9 Permission Prompts

### Preconditions
Notification permission denied; user is on Permission Prompts.

### Precondition Setup Steps
1. Deny notification permission at the OS level
2. Complete onboarding up to Permission Prompts

### Test Execution Steps
1. Tap `Open Settings` from the notification denied state
2. Enable or keep notification permission disabled in OS settings
3. Return to the app

### Expected Result
The onboarding permission screen reflects the current OS permission state and preserves the appropriate continuation path.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Settings navigation | Opens OS settings for the app | App transitions to iOS Settings app to ShadowSpeak settings page |
| 2 | Updated state on return | Permission card reflects new state | After returning, the card shows updated (granted/denied) status |

---

## TC-ONB-FE-034A: Granted reminder setup results in a local notification at the scheduled time

### Objective
Verify that a reminder set during onboarding produces a local notification at the scheduled time.

### Test Type
Screen Functioning

### Related Screens
1.8 Reminder Setup, 1.9 Permission Prompts

### Preconditions
Reminder enabled with a known time; notification permission granted; onboarding completed successfully.

### Precondition Setup Steps
1. Complete full onboarding including Reminder Setup with a time set a few minutes ahead of current device time
2. Grant notification permission when prompted

### Test Execution Steps
1. Complete onboarding successfully (reach Home)
2. Keep the device idle or background the app until the scheduled reminder time
3. Observe device notification behavior

### Expected Result
A local notification is displayed at the scheduled reminder time and matches the expected practice reminder purpose.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Notification delivered | Local notification appears at scheduled time | iOS notification banner/banner appears at the correct time |
| 2 | Notification content | Matches practice reminder purpose | Notification title/message indicate it's a practice reminder |

---

## TC-ONB-FE-035: Microphone permission card explains the reason for access

### Objective
Verify the user sees clear rationale before the OS microphone prompt.

### Test Type
Design Matching

### Related Screens
1.9 Permission Prompts

### Preconditions
User is on Permission Prompts.

### Precondition Setup Steps
1. Complete onboarding up to Permission Prompts

### Test Execution Steps
1. Review the microphone section on the permission screen

### Expected Result
The UI clearly explains that microphone access is needed for recording shadowing practice.

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | Microphone card explanation | Explains microphone is needed for recording shadowing practice | [Visual — requires screenshot and human review] Copy clearly states the purpose of microphone access | UI Spec §1.9 |

---

## TC-ONB-FE-036: Allowing microphone permission records the granted state and completes the allow path

### Objective
Verify the positive microphone-permission branch.

### Test Type
Screen Functioning

### Related Screens
1.9 Permission Prompts

### Preconditions
Microphone permission not yet decided; user is on Permission Prompts.

### Precondition Setup Steps
1. Complete onboarding up to Permission Prompts

### Test Execution Steps
1. Trigger microphone permission (tap the microphone card/button)
2. Allow microphone access in the OS dialog
3. Continue onboarding to completion
4. Map the Home screen using `screen_mapper.py --json`

### Expected Result
Microphone permission is granted; onboarding completes successfully; the app records that recording features are available on first Home entry.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Permission prompt triggered | OS microphone permission dialog appears | Standard iOS microphone permission dialog is shown |
| 2 | Onboarding completes | Home screen appears | `screen_mapper.py --json` shows Home / Daily Practice elements |

---

## TC-ONB-FE-037: Denying microphone permission shows recovery guidance and still allows completion

### Objective
Verify the denied microphone state is non-blocking but explicit.

### Test Type
Screen Functioning

### Related Screens
1.9 Permission Prompts

### Preconditions
Microphone permission not yet decided; user is on Permission Prompts.

### Precondition Setup Steps
1. Complete onboarding up to Permission Prompts

### Test Execution Steps
1. Trigger microphone permission (tap the microphone card/button)
2. Deny microphone access in the OS dialog
3. Observe the denied state
4. Continue onboarding

### Expected Result
The app explains that recording is unavailable until microphone access is enabled, provides a recovery path, and still allows onboarding completion.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Denied state messaging | Recording unavailable explanation shown | [Visual — requires screenshot and human review] Card shows denied state with explanation |
| 2 | Recovery path | "Open Settings" option visible | Button/link to open OS settings is shown in microphone card |
| 3 | Onboarding can continue | User can proceed to Home | Continue button or flow allows completion of onboarding |

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | Permission cards layout | Two stacked cards: Notifications and Microphone; each with explanation and status | [Visual — requires screenshot and human review] Matches Wireframe §1.9 | UI Spec §1.9, Wireframe §1.9 |
| 2 | Card title styling | H3 (18/24, semibold) | [Visual — requires screenshot and human review] Card titles use H3 style | UI Spec §1.9 — Typography |
| 3 | Card body text | Body Small (14/20, regular) | [Visual — requires screenshot and human review] Explanations use Body Small | UI Spec §1.9 — Typography |

---

## TC-ONB-FE-038: Open Settings from microphone denied state returns to onboarding with updated permission status

### Objective
Verify recovery from denied microphone permission via Open Settings.

### Test Type
Screen Functioning

### Related Screens
1.9 Permission Prompts

### Preconditions
Microphone permission denied; user is on Permission Prompts.

### Precondition Setup Steps
1. Deny microphone permission at the OS level
2. Complete onboarding up to Permission Prompts

### Test Execution Steps
1. Tap `Open Settings` from the microphone denied state
2. Enable or keep microphone permission disabled in OS settings
3. Return to the app

### Expected Result
The app reflects the current microphone permission state on the permission screen and preserves the correct continuation path.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Settings navigation | Opens OS settings for the app | App transitions to iOS Settings app |
| 2 | Updated state on return | Card reflects current permission state | After returning, the permission card shows the updated (granted/denied) state |

---

=== Test Plan Complete ===
Total Test Cases: 8

---
## Review Gate

**Status:** ✅ APPROVED
**Verdict:** All 8 test cases validated. File is sign-off ready.
