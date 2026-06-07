> **Execution:** This test plan is designed to be executed by the **frontend-test-plan-executor** and **ios-simulator-skill** tools. Do NOT use raw xcrun commands or coordinate tapping.

> **Review Status:** ✅ Reviewed — Sign-off Ready

# Sign In & Sign Up — Frontend Test Plan

## Document Metadata

| Field | Value |
|---|---|
| Project | ShadowSpeak |
| Epic | 01 — First-Time Onboarding and Access |
| Phase | 06 - Testing |
| Type | Frontend Test Plan (Design Matching & Screen Functioning) |
| Covered Screens | 1.5 Sign In, 1.6 Sign Up |
| Test Cases | TC-ONB-FE-009 to TC-ONB-FE-017A (15 test cases) |
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

### Environment Pre-requisites

- Fresh install with no prior app data for new user tests
- Existing test accounts for returning-user/duplicate scenarios
- Network connectivity can be toggled on/off for failure scenarios

---

## TC-ONB-FE-009: New user sign-up with valid email and password enters first-time onboarding

### Objective
Verify that creating a new account with valid credentials routes the user to the first-time post-auth onboarding flow (intro sequence).

### Test Type
Screen Functioning

### Related Screens
1.6 Sign Up

### Preconditions
Consent accepted; sign-up screen open.

### Precondition Setup Steps
1. Launch the app
2. Complete Age Gate (eligible age)
3. Complete Privacy and Ad Consent (Accept and Continue)
4. Navigate past Sign In to reach Sign Up (tap "Create account" or "Sign Up" link)

### Test Execution Steps
1. Open Sign Up
2. Enter a valid new email (use unique value: `test-$(uuidgen | head -c8)@example.com`)
3. Enter a strong password (minimum 8 characters, mixed case, numeric)
4. Enter matching confirmation password
5. Submit the form
6. Wait for the app response
7. Map the screen using `screen_mapper.py --json`

### Expected Result
The account is created, the user becomes authenticated, and the app routes to the first-time onboarding continuation flow beginning with the intro sequence defined by US-4.1.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Successful sign-up | Account created, user authenticated | Navigation proceeds away from Sign Up; no error message shown |
| 2 | Post-auth routing | Intro sequence screens shown | `screen_mapper.py --json` shows content matching intro/carousel screens or level selection |

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | Sign Up screen layout | Email field, Password field, Confirm password field stacked vertically; Create Account button at bottom; Terms link | [Visual — requires screenshot and human review] Matches Wireframe §1.6 | UI Spec §1.6, Wireframe §1.6 |
| 2 | Create Account button | Filled `color-primary` (#0E5A6A), white text, full-width | [Visual — requires screenshot and human review] Matches Primary Button spec | UI Spec §1.6 — Button System |
| 3 | Password strength indicator | Weak/medium/strong bar using `color-error`, `color-warning`, `color-success` | [Visual — requires screenshot and human review] Present below password field | UI Spec §1.6 — Color |

---

## TC-ONB-FE-010: Sign-up blocks invalid email format

### Objective
Verify that an invalid email input is rejected client-side and submission does not proceed.

### Test Type
Screen Functioning

### Related Screens
1.6 Sign Up

### Preconditions
Sign-up screen open (consent completed).

### Precondition Setup Steps
1. Launch the app, complete Age Gate and Consent
2. Navigate to Sign Up

### Test Execution Steps
1. Enter an invalid email such as `abc`
2. Enter a valid password and matching confirmation
3. Submit the form

### Expected Result
An inline email validation error is shown; submission does not proceed; the user remains on Sign Up.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Email validation error | Inline error shown | [Visual — requires screenshot and human review] Error text visible near email field |
| 2 | No progression | User remains on Sign Up | Screen still shows Sign Up controls; no navigation away |

---

## TC-ONB-FE-011: Sign-up blocks weak password

### Objective
Verify that passwords not meeting minimum strength requirements are rejected with validation feedback.

### Test Type
Screen Functioning

### Related Screens
1.6 Sign Up

### Preconditions
Sign-up screen open.

### Precondition Setup Steps
1. Launch the app, complete Age Gate and Consent
2. Navigate to Sign Up

### Test Execution Steps
1. Enter a valid email
2. For each invalid password variant, enter it and submit:
   - Fewer than 8 characters (e.g., `Ab1`)
   - Missing uppercase (e.g., `abcdef12`)
   - Missing lowercase (e.g., `ABCDEF12`)
   - Missing numeric (e.g., `Abcdefgh`)

### Expected Result
Password validation feedback is shown for every invalid variant; account creation is blocked until the password meets the minimum 8-character, mixed-case, and numeric rule set.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Validation per variant | Error/feedback shown for each | [Visual — requires screenshot and human review] Each variant shows appropriate validation message |
| 2 | No account creation | User remains on Sign Up | No navigation occurs for any invalid variant |

---

## TC-ONB-FE-011A: Sign-up blocks mismatched password confirmation

### Objective
Verify the confirm-password field prevents account creation when values don't match.

### Test Type
Screen Functioning

### Related Screens
1.6 Sign Up

### Preconditions
Sign-up screen open.

### Precondition Setup Steps
1. Launch the app, complete Age Gate and Consent
2. Navigate to Sign Up

### Test Execution Steps
1. Enter a valid email
2. Enter a valid password
3. Enter a non-matching confirm-password value
4. Submit the form

### Expected Result
The app shows a password mismatch validation error and does not create the account.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Mismatch error | Inline error shown | [Visual — requires screenshot and human review] Error indicating passwords do not match |
| 2 | No account creation | User remains on Sign Up | No navigation away from Sign Up |

---

## TC-ONB-FE-012: Duplicate-email sign-up shows recovery guidance

### Objective
Verify that attempting to sign up with an already registered email shows a duplicate-email error and guidance to sign in instead.

### Test Type
Screen Functioning

### Related Screens
1.6 Sign Up

### Preconditions
An account already exists for the test email.

### Precondition Setup Steps
1. An existing account with a known email address must be available in the test environment

### Test Execution Steps
1. Navigate to Sign Up
2. Enter the registered email with a valid password
3. Submit the form

### Expected Result
The user sees a duplicate-email error and is guided to sign in instead; the app remains on an authentication screen.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Duplicate-email error | Error message shown | [Visual — requires screenshot and human review] Error indicating email is already registered |
| 2 | Sign-in guidance | Link/CTA to sign in visible | UI includes a way to navigate to Sign In |

---

## TC-ONB-FE-012A: Sign-up network failure shows retryable error without false progression

### Objective
Verify the app handles backend or connectivity failure during account creation gracefully.

### Test Type
Screen Functioning

### Related Screens
1.6 Sign Up

### Preconditions
Sign-up screen open; consent accepted; network failure can be simulated.

### Precondition Setup Steps
1. Navigate to Sign Up
2. Simulate offline mode or backend unavailability

### Test Execution Steps
1. Enter valid sign-up credentials (new email, strong password)
2. Submit the form

### Expected Result
The app does not create a false success state or advance into onboarding; a retryable network or service error is shown and the user remains on Sign Up.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Error on network failure | Retryable error shown | [Visual — requires screenshot and human review] Error message indicating connectivity/network issue |
| 2 | No false progression | User remains on Sign Up | No navigation away from Sign Up; form fields still visible |

---

## TC-ONB-FE-013: Returning user sign-in with valid credentials goes directly to Home

### Objective
Verify that an existing onboarded user signing in with valid credentials goes directly to Home, bypassing all onboarding steps.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In, 2.1 Home / Daily Practice

### Preconditions
Existing onboarded account; no active session; sign-in screen open.

### Precondition Setup Steps
1. Launch the app
2. Navigate to Sign In (Age Gate and Consent are skipped for returning users when store-provided signal exists, or complete them if needed)
3. Enter valid registered email and correct password

### Test Execution Steps
1. Tap `Sign In`
2. Wait for authentication to complete
3. Map the screen using `screen_mapper.py --json`

### Expected Result
The user is authenticated and taken directly to Home; age gate, consent, intro, and setup screens are not re-shown.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Successful sign-in | Home screen appears | `screen_mapper.py --json` shows elements matching Home / Daily Practice |
| 2 | Onboarding skipped | No age gate, consent, intro, or setup screens shown | Navigation proceeds directly to Home without intermediate onboarding screens |

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | Sign In screen layout | Email field, Password field, Social sign-in buttons, Forgot Password link, Sign In button at bottom | [Visual — requires screenshot and human review] Matches Wireframe §1.5 | UI Spec §1.5, Wireframe §1.5 |

---

## TC-ONB-FE-013A: Sign-in network failure shows retryable error without leaving the sign-in screen

### Objective
Verify the app handles backend or connectivity failure during returning-user authentication.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Existing account; sign-in screen open; network failure can be simulated.

### Precondition Setup Steps
1. Navigate to Sign In
2. Simulate offline mode or backend unavailability

### Test Execution Steps
1. Enter valid registered email and correct password
2. Tap `Sign In`

### Expected Result
The app shows a retryable network or service error; no authenticated state is created; the user remains on Sign In.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Error on failure | Retryable error shown | [Visual — requires screenshot and human review] Error message appears, fields remain editable |
| 2 | No authenticated state | User remains on Sign In | No navigation to Home; no new session created |

---

## TC-ONB-FE-014: Wrong-password sign-in preserves recovery options

### Objective
Verify invalid credential errors are shown without breaking the sign-in form or hiding the Forgot Password link.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Existing account; sign-in screen open.

### Precondition Setup Steps
1. Navigate to Sign In

### Test Execution Steps
1. Enter valid email with wrong password
2. Tap `Sign In`

### Expected Result
An authentication error is shown; the user remains on Sign In; Forgot Password? stays visible and usable.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Auth error displayed | Error message shown | [Visual — requires screenshot and human review] Error indicating wrong password |
| 2 | Forgot Password? visible | Link remains accessible | `screen_mapper.py --json` or [Visual] shows Forgot Password link still present |
| 3 | User remains on Sign In | No navigation away | Sign In screen still displayed with fields |

---

## TC-ONB-FE-015: Google social-auth button launches provider flow

### Objective
Verify the Google sign-in entry point is wired from the Sign In screen.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Sign-in screen visible.

### Precondition Setup Steps
1. Navigate to Sign In

### Test Execution Steps
1. Tap `Sign in with Google`

### Expected Result
The Google provider flow is launched from the app.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Google provider flow | Google auth flow initiates | App transitions to Google authentication (SFSafariViewController or ASWebAuthenticationSession) |

---

## TC-ONB-FE-016: Apple social-auth button launches provider flow

### Objective
Verify the Apple sign-in entry point is wired from the Sign In screen.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Sign-in screen visible.

### Precondition Setup Steps
1. Navigate to Sign In

### Test Execution Steps
1. Tap `Sign in with Apple`

### Expected Result
The Apple provider flow is launched from the app.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Apple provider flow | Apple auth flow initiates | App transitions to Apple ID authentication sheet |

---

## TC-ONB-FE-016A: First-time social-auth success enters the first-time onboarding continuation flow

### Objective
Verify successful social authentication for a new user routes to the first-time onboarding flow.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Consent accepted; social provider test account is new to ShadowSpeak.

### Precondition Setup Steps
1. Launch the app, complete Age Gate and Consent
2. Navigate to Sign In

### Test Execution Steps
1. Start a social-auth flow from Sign In
2. Complete provider authentication successfully with a first-time account
3. Return to the app
4. Map the screen using `screen_mapper.py --json`

### Expected Result
The app authenticates the user and routes them to the first-time onboarding continuation flow beginning with the intro sequence.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Social auth success | User authenticated | App proceeds past Sign In without error |
| 2 | First-time routing | Intro sequence shown | `screen_mapper.py --json` shows content matching intro/carousel screens |

---

## TC-ONB-FE-016B: Returning social-auth success goes directly to Home

### Objective
Verify successful social authentication for an existing onboarded user bypasses onboarding.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In, 2.1 Home / Daily Practice

### Preconditions
Existing onboarded account linked to Google or Apple; no active session.

### Precondition Setup Steps
1. Navigate to Sign In

### Test Execution Steps
1. Start a social-auth flow from Sign In
2. Complete provider authentication successfully with the existing account
3. Return to the app
4. Map the screen using `screen_mapper.py --json`

### Expected Result
The app authenticates the returning user and routes directly to Home without showing onboarding steps again.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Returning social-auth success | Home screen appears | `screen_mapper.py --json` shows Home content |
| 2 | Onboarding skipped | No re-onboarding | Onboarding screens are not shown after authentication |

---

## TC-ONB-FE-017: Cancelled social-auth returns to a usable sign-in screen

### Objective
Verify that cancelling a social-auth flow at the provider level returns the user to a functional Sign In screen.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Social provider flow available.

### Precondition Setup Steps
1. Navigate to Sign In

### Test Execution Steps
1. Start a social-auth flow (Google or Apple)
2. Cancel it at the provider
3. Return to the app

### Expected Result
The app returns to Sign In with working controls and no partial onboarding progression.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Return to Sign In | Sign In screen re-shown | `screen_mapper.py --json` shows Sign In elements |
| 2 | Controls functional | All controls still work | Tapping Sign In or social buttons still triggers expected behavior |

---

## TC-ONB-FE-017A: Provider-side social-auth failure returns the user to sign-in without account creation

### Objective
Verify that a provider-side failure is handled distinctly from a manual cancel.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Social provider flow available; a provider-side failure can be simulated or triggered with a test identity.

### Precondition Setup Steps
1. Navigate to Sign In

### Test Execution Steps
1. Start a social-auth flow
2. Trigger or simulate a provider-side authentication failure
3. Return to the app

### Expected Result
The app returns to Sign In, shows failure feedback, and does not create a partial account or progress into onboarding.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Return on failure | Sign In screen re-shown | App returns to Sign In |
| 2 | Failure feedback | Error message/feedback displayed | [Visual — requires screenshot and human review] Failure feedback visible |
| 3 | No partial account | No onboarding progression | No navigation to intro or setup screens |

---

=== Test Plan Complete ===
Total Test Cases: 15

---
## Review Gate

**Status:** ✅ APPROVED
**Verdict:** All 15 test cases validated. File is sign-off ready.
