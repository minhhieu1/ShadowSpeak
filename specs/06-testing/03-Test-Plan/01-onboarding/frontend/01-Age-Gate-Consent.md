> **Execution:** This test plan is designed to be executed by the **frontend-test-plan-executor** and **ios-simulator-skill** tools. Do NOT use raw xcrun commands or coordinate tapping.

> **Review Status:** ✅ Reviewed — Sign-off Ready

# Age Gate & Consent — Frontend Test Plan

## Document Metadata

| Field | Value |
|---|---|
| Project | ShadowSpeak |
| Epic | 01 — First-Time Onboarding and Access |
| Phase | 06 - Testing |
| Type | Frontend Test Plan (Design Matching & Screen Functioning) |
| Covered Screens | 1.1 App Launch, 1.2 Age Gate, 1.3 Age Policy Block, 1.4 Privacy and Ad Consent |
| Test Cases | TC-ONB-FE-001 to TC-ONB-FE-008 (including TC-ONB-FE-001A) |
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
5. The app is ready when `screen_mapper.py` shows ShadowSpeak UI elements (beyond SpringBoard)

### Environment Pre-requisites

- Fresh install with no prior app data
- Delete and reinstall the app between tests to reset state where noted
- No stored auth session present

---

## TC-ONB-FE-001: Show age gate as the first actionable screen on first launch

### Objective
Verify that on a fresh install, the Age Gate screen appears before any sign-in, sign-up, or home content.

### Test Type
Screen Functioning

### Related Screens
1.1 App Launch, 1.2 Age Gate

### Preconditions
Fresh install; no local app data; no authenticated session.

### Precondition Setup Steps
1. Delete and reinstall the app
2. Launch the app via Expo Go
3. Wait for the bundle to load

### Test Execution Steps
1. Wait until the first actionable onboarding screen is shown
2. Map the screen using `screen_mapper.py --json`
3. Verify no authentication controls are visible

### Expected Result
The Age Gate screen is displayed before any sign-in, sign-up, or home content; no authentication controls are visible.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | First actionable screen | Age Gate | `screen_mapper.py --json` shows accessibility labels containing "Age Gate" or age confirmation elements |
| 2 | Absence of auth controls | No sign-in/sign-up UI | `screen_mapper.py --json` shows no elements with label containing "Sign In" or "Sign Up" |

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | App Launch brand display | Brand/wordmark centered | [Visual — requires screenshot and human review] Layout shows brand element centered on `color-bg` | Wireframe §1.1, UI Spec §1.1 |
| 2 | App Launch loading indicator | Circular or linear spinner | [Visual — requires screenshot and human review] Subtle loader present on launch | UI Spec §1.1 |
| 3 | Age Gate layout | Back action in top bar, age input mid-screen, Continue/Exit at bottom | [Visual — requires screenshot and human review] Layout matches wireframe §1.2 | UI Spec §1.2, Wireframe §1.2 |
| 4 | Age Gate title | H1, semibold | [Visual — requires screenshot and human review] Title uses H1 style per typography scale | UI Spec §1.2 — Typography |
| 5 | Continue button styling | Filled `color-primary` (#0E5A6A) background, white text, full-width | [Visual — requires screenshot and human review] Button matches Primary Button spec | UI Spec §1.2 — Button System |

---

## TC-ONB-FE-001A: Launch with store-provided age signal still honors the in-app age decision path

### Objective
Verify that a platform-provided age signal serves as an input/shortcut but does not bypass the in-app age eligibility decision.

### Test Type
Screen Functioning

### Related Screens
1.1 App Launch, 1.2 Age Gate

### Preconditions
Fresh install; platform test setup can simulate store-provided age signal availability for an eligible user.

### Precondition Setup Steps
1. Configure platform/environment to simulate a store-provided age signal indicating an eligible user
2. Launch the app via Expo Go

### Test Execution Steps
1. Launch the app with the simulated store signal indicating an eligible user
2. Map the screen using `screen_mapper.py --json`
3. If Age Gate appears with a pre-filled eligible option, tap `Continue`
4. Map the screen again using `screen_mapper.py --json`

### Expected Result
The app uses the store-provided age signal as an input or shortcut if supported, but still preserves the in-app age eligibility decision path and routes only eligible users forward to consent.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Eligible age routing | Routes to consent screen or shows Age Gate with pre-filled eligible option | `screen_mapper.py --json` shows either Privacy and Ad Consent elements or Age Gate with age input already selected |

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | Screen shown after store signal | Matches relevant wireframe layout for the routed screen | [Visual — requires screenshot and human review] The displayed screen (either Age Gate or Privacy and Ad Consent) follows the expected wireframe layout | Wireframe §1.2 or §1.4 |

---

## TC-ONB-FE-002: Eligible age selection continues to consent

### Objective
Verify that selecting an eligible age option and tapping Continue navigates to the Privacy and Ad Consent screen.

### Test Type
Screen Functioning

### Related Screens
1.2 Age Gate, 1.4 Privacy and Ad Consent

### Preconditions
User is on Age Gate.

### Precondition Setup Steps
1. Launch the app via Expo Go
2. Wait for Age Gate screen to appear (verify using `screen_mapper.py --json`)

### Test Execution Steps
1. Select an eligible age option by tapping it
2. Tap `Continue`
3. Map the screen using `screen_mapper.py --json`

### Expected Result
The app records the age-eligible decision for the current onboarding session and navigates to Privacy and Ad Consent.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Age selection interaction | Eligible option becomes selected | [Visual — requires screenshot and human review] Choice highlights on tap |
| 2 | Navigation after Continue | Privacy and Ad Consent screen appears | `screen_mapper.py --json` shows elements with labels matching "Privacy and Ad Consent" or consent-related controls |

---

## TC-ONB-FE-003: Underage selection shows a blocked state with no forward navigation

### Objective
Verify that selecting an underage option results in the Age Policy Block screen with no way to proceed into the app.

### Test Type
Both (Design Matching & Screen Functioning)

### Related Screens
1.2 Age Gate, 1.3 Age Policy Block

### Preconditions
User is on Age Gate.

### Precondition Setup Steps
1. Launch the app via Expo Go
2. Wait for Age Gate screen to appear

### Test Execution Steps
1. Select an underage age option
2. Confirm the selection (tap Continue or equivalent)
3. Attempt to navigate forward, back into onboarding, or into the app shell

### Expected Result
Age Policy Block is shown with a dead-end exit path only; the user cannot reach consent, authentication, or Home.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Block screen appears | Age Policy Block shown | `screen_mapper.py --json` shows elements with labels matching "Age Policy Block" or block/restriction messaging |
| 2 | No forward navigation | Consent, sign-in, and Home are unreachable | Tapping UI elements does not navigate to any onboarding or home screen |

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | Block screen visual | Full-screen blocking state with strong message centered; `color-error` sparingly | [Visual — requires screenshot and human review] Matches Wireframe §1.3 layout | UI Spec §1.3, Wireframe §1.3 |

---

## TC-ONB-FE-004: Consent screen exposes privacy policy and terms

### Objective
Verify legal content (privacy policy and terms of service) is visible or directly accessible before the user can continue.

### Test Type
Design Matching & Screen Functioning

### Related Screens
1.4 Privacy and Ad Consent

### Preconditions
Eligible age-gate path completed.

### Precondition Setup Steps
1. Launch the app
2. Complete Age Gate with an eligible age option
3. Navigate to Privacy and Ad Consent screen

### Test Execution Steps
1. Reach Privacy and Ad Consent
2. Review visible legal copy and any document links
3. Map the screen using `screen_mapper.py --json`

### Expected Result
Privacy policy and terms of service are visible or reachable from the screen before consent acceptance.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Privacy policy link/text present | Privacy policy visible or reachable | `screen_mapper.py --json` or [Visual] shows link/text referencing privacy policy |
| 2 | Terms of service link/text present | Terms of service visible or reachable | `screen_mapper.py --json` or [Visual] shows link/text referencing terms of service |

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | Consent screen layout | Top bar with title, consent explanation block, toggle/checkbox section, Accept/Decline actions at bottom | [Visual — requires screenshot and human review] Matches Wireframe §1.4 | UI Spec §1.4, Wireframe §1.4 |
| 2 | Legal copy styling | Uses Body Small or Caption style | [Visual — requires screenshot and human review] Legal text is smaller than main copy | UI Spec §1.4 — Typography |
| 3 | Accept and Continue button | Filled `color-primary` (#0E5A6A), full-width | [Visual — requires screenshot and human review] Matches Primary Button spec | UI Spec §1.4 — Component Library, Color Palette |

---

## TC-ONB-FE-005: Accept consent and move to authentication entry

### Objective
Verify that tapping Accept and Continue advances to the authentication entry screen after consent is accepted.

### Test Type
Screen Functioning

### Related Screens
1.4 Privacy and Ad Consent, 1.5 Sign In

### Preconditions
User is on Privacy and Ad Consent (eligible age-gate path completed).

### Precondition Setup Steps
1. Launch the app
2. Complete Age Gate with eligible age
3. Navigate to Privacy and Ad Consent

### Test Execution Steps
1. Tap `Accept and Continue`
2. Wait for the app response
3. Map the screen using `screen_mapper.py --json`

### Expected Result
Consent is accepted for the onboarding session and the user is navigated to the authentication entry screen (Sign In).

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Navigation after consent | Sign In screen appears | `screen_mapper.py --json` shows elements with labels matching "Sign In", email/password fields, or social sign-in buttons |

---

## TC-ONB-FE-006: Decline consent prevents entry into onboarding and the app shell

### Objective
Verify that declining required consent blocks onboarding continuation.

### Test Type
Screen Functioning

### Related Screens
1.4 Privacy and Ad Consent

### Preconditions
User is on Privacy and Ad Consent.

### Precondition Setup Steps
1. Launch the app
2. Complete Age Gate with eligible age
3. Navigate to Privacy and Ad Consent

### Test Execution Steps
1. Tap `Decline and Exit`
2. Observe the resulting app state
3. Map the screen using `screen_mapper.py --json`

### Expected Result
The app exits onboarding or shows a dead-end state; the user cannot proceed to authentication or Home without restarting and accepting consent.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Decline behavior | Exit path or dead-end state shown | `screen_mapper.py --json` shows elements matching a dead-end/exit state; app does not navigate to Sign In or Home. User cannot reach Sign In by any available UI action |

---

## TC-ONB-FE-007: Block bypass attempts while consent is still pending

### Objective
Verify that required consent cannot be skipped via back, dismiss, or deep-link style navigation.

### Test Type
Screen Functioning

### Related Screens
1.4 Privacy and Ad Consent

### Preconditions
User is on Privacy and Ad Consent; consent not yet accepted.

### Precondition Setup Steps
1. Launch the app
2. Complete Age Gate
3. Navigate to Privacy and Ad Consent (do not accept)

### Test Execution Steps
1. Attempt to dismiss the screen, use the back action, or reach sign-in without acceptance
2. Relaunch the app if needed and retry progression

### Expected Result
The user remains blocked from authentication until consent is accepted.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Back/dismiss blocked | User remains on consent screen | After attempting back/dismiss, `screen_mapper.py --json` still shows Privacy and Ad Consent elements; user cannot navigate to Sign In or Home |
| 2 | Relaunch with pending consent | User returns to consent screen | After relaunch, `screen_mapper.py --json` shows Privacy and Ad Consent (not Sign In or Home) |

---

## TC-ONB-FE-008: Consent submission failure keeps the user on the consent step with retry guidance

### Objective
Verify the UI handles consent-save failures without false progression.

### Test Type
Screen Functioning

### Related Screens
1.4 Privacy and Ad Consent

### Preconditions
Network or backend failure can be simulated.

### Precondition Setup Steps
1. Launch the app
2. Complete Age Gate
3. Navigate to Privacy and Ad Consent
4. Simulate a consent-save failure (e.g., enable airplane mode or use network conditioning tool)

### Test Execution Steps
1. Tap `Accept and Continue` while failure is active
2. Observe the error state
3. Restore connectivity and retry

### Expected Result
The user remains on the consent screen with a retryable error message; after retry succeeds, the app proceeds to authentication.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Error state on failure | Retryable error message visible | [Visual — requires screenshot and human review] Error text and retry option shown |
| 2 | No false progression | User remains on consent screen | Screen content after failure still shows consent controls |
| 3 | Retry after connectivity restored | Advances to Sign In | After restoring connectivity and retrying, navigation proceeds to Sign In |

---

=== Test Plan Complete ===
Total Test Cases: 9

---
## Review Gate

**Status:** ✅ APPROVED
**Verdict:** All 9 test cases validated. File is sign-off ready.
