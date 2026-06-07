> **Execution:** This test plan is designed to be executed by the **frontend-test-plan-executor** and **ios-simulator-skill** tools. Do NOT use raw xcrun commands or coordinate tapping.

> **Review Status:** ✅ Reviewed — Sign-off Ready

# Intro, Level Selection & Reminder Setup — Frontend Test Plan

## Document Metadata

| Field | Value |
|---|---|
| Project | ShadowSpeak |
| Epic | 01 — First-Time Onboarding and Access |
| Phase | 06 - Testing |
| Type | Frontend Test Plan (Design Matching & Screen Functioning) |
| Covered Screens | Intro Screens, 1.7 Level Selection, 1.8 Reminder Setup |
| Test Cases | TC-ONB-FE-023 to TC-ONB-FE-030 |
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

## TC-ONB-FE-023: First-time authenticated user sees the intro sequence

### Objective
Verify that a newly authenticated first-time user is shown the intro sequence before profile setup begins.

### Test Type
Both (Design Matching & Screen Functioning)

### Related Screens
Intro screens (between auth and level selection)

### Preconditions
New user has just completed successful sign-up or first social auth.

### Precondition Setup Steps
1. Launch the app
2. Complete Age Gate, Consent, and Sign Up with valid new credentials

### Test Execution Steps
1. Complete first-time authentication
2. Observe the next onboarding step
3. Map the screen using `screen_mapper.py --json`

### Expected Result
The app shows the intro sequence before profile setup begins.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Intro sequence displayed | Intro/carousel screens shown | `screen_mapper.py --json` shows intro/carousel content (e.g., explanatory text, Next/Get Started buttons) and does NOT show Level Selection elements directly |

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | Intro screen layout | Clear copy explaining shadowing concept; Next/Get Started navigation | [Visual — requires screenshot and human review] Content is readable and includes navigation controls | Approved deviation (intro screens per US-4.1 and TCS); UI Spec — Typography for general font sizing |

---

## TC-ONB-FE-024: Intro sequence supports forward navigation into level selection

### Objective
Verify users can progress through all intro slides and reach Level Selection.

### Test Type
Screen Functioning

### Related Screens
Intro screens, 1.7 Level Selection

### Preconditions
User is on the intro sequence (just completed authentication).

### Precondition Setup Steps
1. Complete Age Gate, Consent, and Sign Up

### Test Execution Steps
1. Tap `Next` or swipe through each intro screen
2. On the last screen, tap `Get Started`
3. Map the screen using `screen_mapper.py --json`

### Expected Result
The intro sequence is marked complete and the user is routed to Level Selection.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Intro progression | Each intro screen advances on Next/swipe | Content changes with each tap/swipe |
| 2 | Get Started navigation | Level Selection appears | `screen_mapper.py --json` shows level choice elements |

---

## TC-ONB-FE-025: Completed intro sequence is not shown again on later sign-ins

### Objective
Verify intro content is one-time only and is skipped on later sign-ins.

### Test Type
Screen Functioning

### Related Screens
Intro screens, 2.1 Home / Daily Practice

### Preconditions
User previously completed intro screens.

### Precondition Setup Steps
1. Complete full onboarding (including intro) for a test account
2. Sign out of that account

### Test Execution Steps
1. Sign back in with the same account
2. Observe the onboarding flow

### Expected Result
The app skips the intro sequence and routes the user according to onboarding completion state.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Intro skipped on re-auth | Intro screens not shown | After sign-in, user goes to appropriate next screen (completion state dependent) without showing intro |

---

## TC-ONB-FE-026: Level selection is required before continuing

### Objective
Verify the user cannot proceed without choosing a valid practice level.

### Test Type
Both (Design Matching & Screen Functioning)

### Related Screens
1.7 Level Selection

### Preconditions
User is on Level Selection (intro completed).

### Precondition Setup Steps
1. Complete Age Gate, Consent, Sign Up, and Intro sequence
2. Navigate to Level Selection

### Test Execution Steps
1. Leave all level options unselected
2. Tap `Continue`

### Expected Result
The app shows required-selection validation and keeps the user on Level Selection.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Validation on empty selection | Error/validation shown | [Visual — requires screenshot and human review] Message prompts user to select a level |
| 2 | No progression | User remains on Level Selection | Screen still shows level choices; not routed to Reminder Setup |

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | Level Selection layout | Short guidance copy at top, level cards/chips in center, Continue button at bottom | [Visual — requires screenshot and human review] Matches Wireframe §1.7 | UI Spec §1.7, Wireframe §1.7 |
| 2 | Selected card styling | `color-primary` tint or border emphasis on selected card | [Visual — requires screenshot and human review] Selected option is visually distinct | UI Spec §1.7 — Color |
| 3 | Continue button | Filled `color-primary` (#0E5A6A), full-width | [Visual — requires screenshot and human review] Matches Primary Button spec | UI Spec §1.7 — Button System |

---

## TC-ONB-FE-027: Valid level selection is saved before moving to reminder setup

### Objective
Verify that selecting a valid level and tapping Continue advances to Reminder Setup with the selection persisted.

### Test Type
Screen Functioning

### Related Screens
1.7 Level Selection, 1.8 Reminder Setup

### Preconditions
User is on Level Selection.

### Precondition Setup Steps
1. Complete Age Gate, Consent, Sign Up, and Intro
2. Navigate to Level Selection

### Test Execution Steps
1. Select a valid level (e.g., Beginner, Intermediate, or Advanced)
2. Tap `Continue`
3. Map the screen using `screen_mapper.py --json`

### Expected Result
The user advances to Reminder Setup; the selected level is retained and later visible in onboarding resume behavior or Home/Settings.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Navigation to Reminder Setup | Reminder Setup screen appears | `screen_mapper.py --json` shows elements matching Reminder Setup (time picker, toggle) |

---

## TC-ONB-FE-028: Enabled reminder with valid time is saved and advances to permission prompts

### Objective
Verify the standard reminder setup path with notifications enabled.

### Test Type
Both (Design Matching & Screen Functioning)

### Related Screens
1.8 Reminder Setup, 1.9 Permission Prompts

### Preconditions
User is on Reminder Setup; notification permission status is not yet resolved.

### Precondition Setup Steps
1. Complete up to Reminder Setup (Age Gate, Consent, Sign Up, Intro, Level Selection)

### Test Execution Steps
1. Enable reminders (tap toggle)
2. Choose a valid reminder time using the picker (e.g., 08:00)
3. Tap `Continue`
4. Map the screen using `screen_mapper.py --json`

### Expected Result
The selected reminder time is retained for the onboarding session and the app advances to Permission Prompts.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Navigation to Permission Prompts | Permission Prompts screen appears | `screen_mapper.py --json` shows permission cards (notifications, microphone) |

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | Reminder Setup layout | Toggle and time picker in center; Continue and Skip reminders at bottom | [Visual — requires screenshot and human review] Matches Wireframe §1.8 | UI Spec §1.8, Wireframe §1.8 |
| 2 | Toggle and time picker grouped | Visually grouped with clear labels | [Visual — requires screenshot and human review] Toggle and picker appear as a related control group | UI Spec §1.8 |
| 3 | Continue button | Full-width, `color-primary` (#0E5A6A) | [Visual — requires screenshot and human review] Matches Primary Button spec | UI Spec §1.8 — Button System |

---

## TC-ONB-FE-029: Reminder setup can be skipped

### Objective
Verify that reminders are optional in onboarding.

### Test Type
Screen Functioning

### Related Screens
1.8 Reminder Setup

### Preconditions
User is on Reminder Setup.

### Precondition Setup Steps
1. Complete up to Reminder Setup

### Test Execution Steps
1. Tap `Skip reminders`
2. Map the screen using `screen_mapper.py --json`

### Expected Result
No reminder is scheduled in the onboarding session and the app advances to Permission Prompts.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Skip behavior | Advances to Permission Prompts | `screen_mapper.py --json` shows permission cards screen (notifications, microphone) |
| 2 | No reminder scheduled | Reminder preference not set | After completing onboarding, navigate to Settings → Reminder Settings and verify reminders are disabled |

---

## TC-ONB-FE-030: Reminder setup blocks continuation when reminders are enabled but no time is confirmed

### Objective
Verify the screen enforces a valid time-picker outcome when reminder enablement is turned on.

### Test Type
Screen Functioning

### Related Screens
1.8 Reminder Setup

### Preconditions
User is on Reminder Setup.

### Precondition Setup Steps
1. Complete up to Reminder Setup

### Test Execution Steps
1. Enable reminders (tap toggle)
2. Open the time picker and dismiss it without confirming a time (or, if the picker auto-confirms, leave it at the default value)
3. Tap `Continue`

### Expected Result
The app shows validation requiring a reminder time before progression.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Validation when time not explicitly confirmed | Validation error shown | [Visual — requires screenshot and human review] Message prompts user to select/confirm a time before progression |
| 2 | No progression | User remains on Reminder Setup | Screen still shows reminder controls; not navigated to Permission Prompts |

---

=== Test Plan Complete ===
Total Test Cases: 8

---
## Review Gate

**Status:** ✅ APPROVED
**Verdict:** All 8 test cases validated. File is sign-off ready.
