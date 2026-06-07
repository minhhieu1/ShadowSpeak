> **Execution:** This test plan is designed to be executed by the **frontend-test-plan-executor** and **ios-simulator-skill** tools. Do NOT use raw xcrun commands or coordinate tapping.

> **Review Status:** ✅ Reviewed — Sign-off Ready

# Forgot Password / Password Reset — Frontend Test Plan

## Document Metadata

| Field | Value |
|---|---|
| Project | ShadowSpeak |
| Epic | 01 — First-Time Onboarding and Access |
| Phase | 06 - Testing |
| Type | Frontend Test Plan (Design Matching & Screen Functioning) |
| Covered Screens | 1.5 Sign In (Forgot Password flow) |
| Test Cases | TC-ONB-FE-018 to TC-ONB-FE-022 |
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

## TC-ONB-FE-018: Forgot-password link opens the reset request flow

### Objective
Verify the Forgot Password link on Sign In opens the password reset request screen.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Sign-in screen open.

### Precondition Setup Steps
1. Launch the app
2. Complete Age Gate and Consent
3. Navigate to Sign In
4. Verify Sign In screen is displayed using `screen_mapper.py --json`

### Test Execution Steps
1. Tap `Forgot Password?` link
2. Map the screen using `screen_mapper.py --json`

### Expected Result
The password reset request screen opens.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Forgot Password navigation | Reset request screen opens | `screen_mapper.py --json` shows elements for password reset (email field, Send Reset Link button) |

### Design Matching Assertions

| # | Check | Expected | Pass Criteria | Source Spec |
|---|-------|----------|---------------|-------------|
| 1 | Forgot Password link styling | Text link with `color-primary` (#0E5A6A) or standard link styling | [Visual — requires screenshot and human review] Link is visible and clear below credential fields | UI Spec §1.5 |

---

## TC-ONB-FE-019: Registered reset request shows success guidance

### Objective
Verify the user receives clear next-step feedback after requesting a password reset for a registered email.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In (reset request screen)

### Preconditions
Reset-request screen open.

### Precondition Setup Steps
1. Navigate to Sign In
2. Tap `Forgot Password?` to open the reset request screen

### Test Execution Steps
1. Enter a registered email
2. Submit the reset request

### Expected Result
A success message tells the user to check email for the reset link; the app does not show a false validation failure.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Success message | Check-email guidance shown | [Visual — requires screenshot and human review] Success message appears confirming email was sent |

---

## TC-ONB-FE-020: Unknown-email reset request shows error guidance

### Objective
Verify that submitting a reset request with an unregistered email shows an appropriate error.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In (reset request screen)

### Preconditions
Reset-request screen open.

### Precondition Setup Steps
1. Navigate to Sign In
2. Tap `Forgot Password?` to open the reset request screen

### Test Execution Steps
1. Enter an unregistered email
2. Submit the reset request

### Expected Result
The app shows an error stating that no account is associated with the email; the user remains able to retry.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Error for unknown email | Error message shown | [Visual — requires screenshot and human review] Error indicating no account found for that email |
| 2 | Retry capability | User can retry | Input field remains editable, user can modify and resubmit |

---

## TC-ONB-FE-021: Reset-password form blocks weak replacement password

### Objective
Verify that weak passwords cannot be saved during password reset (via the reset link page).

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In (reset-password form reached via reset link)

### Preconditions
Reset-password page is reachable (valid reset link available or simulated).

### Precondition Setup Steps
1. Obtain a valid reset link for a registered account (or simulate the reset-password page state)
2. Open the reset-password page

### Test Execution Steps
For each invalid password variant, enter it and submit:
- Fewer than 8 characters (e.g., `Ab1`)
- Missing uppercase (e.g., `abcdef12`)
- Missing lowercase (e.g., `ABCDEF12`)
- Missing numeric (e.g., `Abcdefgh`)

### Expected Result
Validation feedback is shown for every invalid variant and the password is not updated until the new password satisfies the minimum 8-character, mixed-case, and numeric rule set.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Validation per variant | Error/feedback shown for each | [Visual — requires screenshot and human review] Each invalid variant shows appropriate validation message |
| 2 | No password update for invalid | Password remains unchanged | User stays on reset-password form; no success confirmation |

---

## TC-ONB-FE-021A: Valid password reset completion returns the user to sign-in with success confirmation

### Objective
Verify the happy path for reset-password completion after the user opens a valid reset link.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Valid reset link available for a registered account.

### Precondition Setup Steps
1. Obtain a valid reset link for a registered account

### Test Execution Steps
1. Open the valid reset link
2. Confirm the secure reset page loads correctly
3. Enter a valid new password (meets policy requirements)
4. Submit the reset form

### Expected Result
The password is updated successfully; the user is redirected to Sign In; a success message confirms the password was reset and the user can log in with the new password.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Successful reset | Success confirmation shown | [Visual — requires screenshot and human review] Success message displayed |
| 2 | Redirect to Sign In | Sign In screen reappears | `screen_mapper.py --json` shows Sign In elements |
| 3 | New password works | User can sign in with new password | Enter new credentials and tap Sign In — authentication succeeds |

---

## TC-ONB-FE-022: Expired reset link shows retry guidance

### Objective
Verify that an expired reset link shows expiration messaging and a path to request a new link.

### Test Type
Screen Functioning

### Related Screens
1.5 Sign In

### Preconditions
Expired reset link available.

### Precondition Setup Steps
1. Obtain an expired reset link for a registered account

### Test Execution Steps
1. Open the expired link

### Expected Result
The app or reset page shows an expiration message and a clear path to request a new reset link.

### Screen Functioning Assertions

| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | Expired link handling | Expiration message shown | [Visual — requires screenshot and human review] Message indicating the link has expired |
| 2 | Recovery path | Option to request new link | UI includes a way to request a new reset link |

---

=== Test Plan Complete ===
Total Test Cases: 6

---
## Review Gate

**Status:** ✅ APPROVED
**Verdict:** All 6 test cases validated. File is sign-off ready.
