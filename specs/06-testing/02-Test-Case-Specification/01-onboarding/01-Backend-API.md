# Backend/API Test Case Specification — Epic 01 First-Time Onboarding and Access

## Document Metadata

| Field | Value |
|---|---|
| Project | ShadowSpeak |
| Epic | 01 — First-Time Onboarding and Access |
| Phase | 06 - Testing |
| Type | Backend/API Test Case Specification |
| Version | 1.0 |
| Date | 2026-05-23 |
| Status | Draft |
| Owner | QA |
| Derived From | `specs/06-testing/01-Test-Scenario-Document/01-onboarding/01-Backend-API.md` |

## 1. Objective and Scope

This document defines detailed backend/API test cases for Epic 01 onboarding. It covers the onboarding REST surface, consent lifecycle, JWT protection, profile persistence, onboarding progress state, and backend-side validation rules.

In scope:

- `GET /consent`, `PUT /consent`
- `GET /me`, `PUT /me`
- `PUT /me/onboarding-step`
- JWT validation and consent guard behavior
- Consent bootstrap, re-key, audit logging, and persistence details

Out of scope:

- Mobile UI behavior
- Social-provider UI or hosted auth screens
- Full end-to-end app navigation

## 2. References

- `specs/04-solution-architecture/05-API-Specification-Document.md`
- `specs/05-development/01-Technical-Task-Breakdown/01-onboarding/01-Backend.md`
- `specs/06-testing/01-Test-Scenario-Document/01-onboarding/01-Backend-API.md`

Source precedence note:

- For `PUT /me/onboarding-step` and `onboardingStep` persistence, this TCS follows the backend task breakdown and backend testing scope as the implementation source of truth. The API spec is currently behind on this endpoint/field and should be aligned separately.
- For `displayName` values longer than 80 characters, this TCS explicitly treats `422 VALIDATION_ERROR` as the sign-off expectation and supersedes the conflicting truncation wording in the current backend task breakdown until the upstream documents are reconciled. Any persisted value longer than 80 characters is non-compliant for sign-off.

## 3. Contract Rules

Unless a test case states otherwise, verify:

- Response body uses `JsonEnvelope<T>`
- Success responses return `ok=true` and `data`
- Error responses return `ok=false` and `error.code`
- `requestId` is present in the envelope
- `X-Request-Id` is present in the response header

Canonical error expectations used in this document:

- `401 AUTH_UNAUTHORIZED`
- `403 CONSENT_REQUIRED`
- `422 VALIDATION_ERROR`
- `404 USER_NOT_FOUND`

## 4. Test Cases

### Consent API — Pre-auth

#### TC-ONB-BE-001

- **Related Scenario ID:** `TS-ONB-BE-01`
- **Title:** Read existing device-scoped consent state with valid `X-Device-Id`
- **Objective:** Verify anonymous onboarding clients can read an already persisted device-scoped consent record.
- **Preconditions:** No JWT; a device-scoped consent record already exists for the device.
- **Test Data:** `X-Device-Id: device-001`, `X-Request-Id: req-be-001`
- **Steps:**
  1. Send `GET /consent` without `Authorization` and with `X-Device-Id` and `X-Request-Id`.
  2. Capture status, headers, and response body.
- **Expected Result:** `200 OK`; response matches `JsonEnvelope<ConsentState>`; `data.userId` is device-scoped; returned values match the seeded consent record; `X-Request-Id` is echoed in header and envelope.
- **Priority:** High

#### TC-ONB-BE-001A

- **Related Scenario ID:** `Supplementary`
- **Title:** Read default device-scoped consent state for a brand-new `X-Device-Id`
- **Objective:** Verify anonymous onboarding clients receive a default all-false consent state on first read for a new device.
- **Preconditions:** No JWT; no consent record exists for the device.
- **Test Data:** `X-Device-Id: device-new-001`, `X-Request-Id: req-be-001a`
- **Steps:**
  1. Send `GET /consent` without `Authorization` and with `X-Device-Id` and `X-Request-Id`.
  2. Capture status, headers, and response body.
- **Expected Result:** `200 OK`; response matches `JsonEnvelope<ConsentState>`; `data.userId` is device-scoped; default values are `ageVerified=false`, `privacyAccepted=false`, and `adConsent="unknown"`; `X-Request-Id` is echoed in header and envelope.
- **Priority:** Medium

#### TC-ONB-BE-002

- **Related Scenario ID:** `TS-ONB-BE-02`
- **Title:** Save valid pre-auth consent and persist locale and TTL
- **Objective:** Verify valid anonymous consent writes persist to the bootstrap device record with required metadata.
- **Preconditions:** No JWT; valid device ID available.
- **Test Data:** `X-Device-Id: device-002`, `Accept-Language: fr-FR`, body `{ "ageVerified": true, "privacyAccepted": true, "adConsent": "unknown" }`
- **Steps:**
  1. Send `PUT /consent` without `Authorization` and with valid device ID, `Accept-Language`, and valid JSON body.
  2. Send pre-auth `GET /consent` for the same device.
  3. Inspect the persisted record.
- **Expected Result:** `200 OK`; consent is readable for the same device; DB record is stored at `DEVICE#<deviceId>#CONSENT`; `consentUpdatedAt`, `locale=fr-FR`, `entityType`, and `ttlEpoch` are persisted.
- **Priority:** High

#### TC-ONB-BE-003

- **Related Scenario ID:** `TS-ONB-BE-03`
- **Title:** Default locale to `en-US` when `Accept-Language` is absent
- **Objective:** Verify anonymous consent writes use `en-US` as locale fallback.
- **Preconditions:** No JWT; valid device ID available.
- **Test Data:** `X-Device-Id: device-003`, valid consent body without `Accept-Language`
- **Steps:**
  1. Send `PUT /consent` without `Accept-Language`.
  2. Read the consent state for the same device.
  3. Inspect the persisted record.
- **Expected Result:** `200 OK`; returned and persisted `locale` is `en-US`.
- **Priority:** High

#### TC-ONB-BE-004

- **Related Scenario ID:** `TS-ONB-BE-04`
- **Title:** Reject pre-auth consent requests without `X-Device-Id`
- **Objective:** Verify anonymous consent reads and writes fail validation without device identification.
- **Preconditions:** No JWT.
- **Test Data:** Missing `X-Device-Id`
- **Steps:**
  1. Send `GET /consent` without `Authorization` and without `X-Device-Id`.
  2. Send `PUT /consent` without `Authorization`, without `X-Device-Id`, and with otherwise valid JSON body.
- **Expected Result:** Both requests return `422 VALIDATION_ERROR`; failure envelope and `X-Request-Id` are present; no consent record is created.
- **Priority:** High

#### TC-ONB-BE-005

- **Related Scenario ID:** `Supplementary`
- **Title:** Reject invalid `adConsent` value for pre-auth consent
- **Objective:** Verify allowed consent enum values are enforced.
- **Preconditions:** No JWT; valid device ID available.
- **Test Data:** `X-Device-Id: device-004`, body with `adConsent: "invalid_value"`
- **Steps:**
  1. Send `PUT /consent` with invalid `adConsent`.
  2. Inspect status and persisted state.
- **Expected Result:** `422 VALIDATION_ERROR`; invalid value is not persisted.
- **Priority:** High

#### TC-ONB-BE-006

- **Related Scenario ID:** `Supplementary`
- **Title:** Reject incomplete or invalid age-gate consent payload
- **Objective:** Verify invalid onboarding consent payloads fail without partial writes.
- **Preconditions:** No JWT; valid device ID available.
- **Test Data:** Body missing required consent fields or violating age-gate rules
- **Steps:**
  1. Send `PUT /consent` with invalid payload.
  2. Inspect status and persisted state.
- **Expected Result:** `422 VALIDATION_ERROR`; no invalid consent state is persisted.
- **Priority:** High

### Consent API — Authenticated

#### TC-ONB-BE-007

- **Related Scenario ID:** `TS-ONB-BE-05`
- **Title:** Read user-scoped consent with valid JWT
- **Objective:** Verify authenticated consent reads use the authenticated identity rather than device scope.
- **Preconditions:** Valid JWT; user-scoped consent exists.
- **Test Data:** `Authorization: Bearer <valid-jwt-user-001>`
- **Steps:**
  1. Send `GET /consent` with valid JWT and no `X-Device-Id`.
  2. Inspect status, envelope, and returned `userId`.
- **Expected Result:** `200 OK`; `data.userId` matches JWT `sub`; record is read from `USER#<userId>#CONSENT`; missing `X-Device-Id` does not fail authenticated request.
- **Priority:** High

#### TC-ONB-BE-008

- **Related Scenario ID:** `TS-ONB-BE-06`
- **Title:** Update user-scoped consent with valid JWT
- **Objective:** Verify authenticated consent writes persist to the canonical user consent record.
- **Preconditions:** Valid JWT for an existing user.
- **Test Data:** `Authorization: Bearer <valid-jwt-user-002>`, `Accept-Language: en-GB`, valid consent body
- **Steps:**
  1. Send `PUT /consent` with valid JWT and valid body.
  2. Send authenticated `GET /consent`.
  3. Inspect the persisted record.
- **Expected Result:** `200 OK`; consent is stored at `USER#<userId>#CONSENT`; `locale=en-GB`, `consentUpdatedAt`, and `entityType` are persisted; `ttlEpoch` is not required for canonical user consent.
- **Priority:** High

#### TC-ONB-BE-008A

- **Related Scenario ID:** `TS-ONB-BE-05`
- **Title:** Ignore mismatched `X-Device-Id` during authenticated consent read
- **Objective:** Verify authenticated consent lookup remains bound to JWT identity even when a different device ID is supplied.
- **Preconditions:** Valid JWT for user-scoped consent; mismatched device-scoped consent may exist for another device.
- **Test Data:** `Authorization: Bearer <valid-jwt-user-002>`, `X-Device-Id: device-mismatch`
- **Steps:**
  1. Send authenticated `GET /consent` with a valid JWT and a mismatched `X-Device-Id`.
  2. Inspect returned `userId`, consent values, and any persistence side effects.
- **Expected Result:** `200 OK`; returned consent is resolved only from `USER#<userId>#CONSENT`; mismatched device header does not alter identity binding, does not return device-scoped consent, and does not create unwanted side effects.
- **Priority:** High

### Consent Re-key and Audit

#### TC-ONB-BE-009

- **Related Scenario ID:** `TS-ONB-BE-07`
- **Title:** Re-key bootstrap device consent to user consent on first authenticated request
- **Objective:** Verify consent is migrated from device scope to user scope after authentication.
- **Preconditions:** Existing device-scoped consent; valid JWT; no existing user-scoped consent for the same user.
- **Test Data:** `X-Device-Id: device-005`, `Authorization: Bearer <valid-jwt-user-005>`
- **Steps:**
  1. Save pre-auth consent for `device-005`.
  2. Authenticate as `user-005`.
  3. Call `GET /me` as the first authenticated request that triggers re-key.
  4. Inspect consent records before and after the call.
- **Expected Result:** User-scoped consent is created with preserved values; bootstrap `DEVICE#<deviceId>#CONSENT` record is deleted after successful re-key; request succeeds normally.
- **Priority:** High

#### TC-ONB-BE-010

- **Related Scenario ID:** `TS-ONB-BE-08`
- **Title:** Re-key remains idempotent when user-scoped consent already exists
- **Objective:** Verify duplicate re-key attempts do not overwrite or duplicate canonical consent.
- **Preconditions:** Existing user-scoped consent; valid JWT; optional stale device-scoped record.
- **Test Data:** `Authorization: Bearer <valid-jwt-user-006>`, optional `X-Device-Id: device-006`
- **Steps:**
  1. Seed `USER#<userId>#CONSENT`.
  2. Trigger the authenticated path that runs re-key logic.
  3. Repeat the request.
  4. Inspect consent records.
- **Expected Result:** User-scoped consent remains correct and stable; no duplicate canonical record or conflicting state is introduced.
- **Priority:** High

#### TC-ONB-BE-011

- **Related Scenario ID:** `Supplementary`
- **Title:** Re-key is a no-op when no bootstrap device consent exists
- **Objective:** Verify authenticated flows do not fail when the user consented post-sign-in and no device bootstrap exists.
- **Preconditions:** Valid JWT; no `DEVICE#<deviceId>#CONSENT` record exists.
- **Test Data:** `Authorization: Bearer <valid-jwt-user-007>`
- **Steps:**
  1. Call `GET /me` or authenticated `GET /consent`.
  2. Inspect response and resulting records.
- **Expected Result:** Request succeeds; no error is raised; user consent state remains correct; no unexpected device-scoped record is created.
- **Priority:** Medium

#### TC-ONB-BE-012

- **Related Scenario ID:** `TS-ONB-BE-09`
- **Title:** Emit audit log on consent updates and re-key events
- **Objective:** Verify consent changes and consent migration are auditable.
- **Preconditions:** Structured audit logs are accessible.
- **Test Data:** One direct `PUT /consent` and one successful re-key flow
- **Steps:**
  1. Perform a successful consent update.
  2. Perform a successful re-key flow.
  3. Query audit logs using request IDs or timestamps.
- **Expected Result:** A structured audit entry exists for each consent update and for the re-key event; entries contain expected request correlation data and no extra PII.
- **Priority:** Medium

### JWT and Consent Guard

#### TC-ONB-BE-013

- **Related Scenario ID:** `TS-ONB-BE-11`
- **Title:** Reject protected onboarding endpoints without JWT
- **Objective:** Verify protected profile and onboarding-progress endpoints enforce authentication.
- **Preconditions:** None.
- **Test Data:** Missing `Authorization` header
- **Steps:**
  1. Send `GET /me` without JWT.
  2. Send `PUT /me` without JWT.
  3. Send `PUT /me/onboarding-step` without JWT.
- **Expected Result:** Each request returns `401 AUTH_UNAUTHORIZED`; failure envelope and `X-Request-Id` are present.
- **Priority:** High

#### TC-ONB-BE-014

- **Related Scenario ID:** `TS-ONB-BE-11`
- **Title:** Reject protected onboarding endpoints with expired JWT
- **Objective:** Verify expired tokens cannot read or write protected onboarding state.
- **Preconditions:** Expired JWT available.
- **Test Data:** `Authorization: Bearer <expired-jwt>`
- **Steps:**
  1. Send `GET /me` with expired JWT.
  2. Send `PUT /me` with expired JWT.
  3. Send `PUT /me/onboarding-step` with expired JWT.
- **Expected Result:** Each request returns `401 AUTH_UNAUTHORIZED`; no state mutation occurs.
- **Priority:** High

#### TC-ONB-BE-015

- **Related Scenario ID:** `TS-ONB-BE-12`
- **Title:** Reject protected onboarding endpoints with invalid JWT signature
- **Objective:** Verify invalid-signature tokens are rejected.
- **Preconditions:** Invalid-signature JWT available.
- **Test Data:** `Authorization: Bearer <invalid-signature-jwt>`
- **Steps:**
  1. Send `GET /me` with invalid-signature JWT.
  2. Send `PUT /me` with invalid-signature JWT.
  3. Send `PUT /me/onboarding-step` with invalid-signature JWT.
- **Expected Result:** Each request returns `401 AUTH_UNAUTHORIZED`; no protected data is disclosed and no profile or onboarding-progress state changes are persisted.
- **Priority:** High

#### TC-ONB-BE-016

- **Related Scenario ID:** `TS-ONB-BE-10`
- **Title:** Block profile endpoints until required consent is complete
- **Objective:** Verify consent guard blocks profile reads and writes when onboarding consent is incomplete.
- **Preconditions:** Valid JWT; missing or incomplete consent.
- **Test Data:** `Authorization: Bearer <valid-jwt-user-008>`, valid profile update body
- **Steps:**
  1. Send `GET /me`.
  2. Send `PUT /me` with valid body.
- **Expected Result:** Both requests return `403 CONSENT_REQUIRED`; failure envelope and `X-Request-Id` are present; profile remains unchanged.
- **Priority:** High

### Profile API

#### TC-ONB-BE-017

- **Related Scenario ID:** `TS-ONB-BE-13`
- **Title:** Return authenticated user's profile from `GET /me`
- **Objective:** Verify profile reads are bound to the authenticated JWT subject.
- **Preconditions:** Valid JWT; consent complete; profile exists.
- **Test Data:** `Authorization: Bearer <valid-jwt-user-009>`
- **Steps:**
  1. Send `GET /me`.
  2. Compare returned `data.userId` to the JWT `sub`.
- **Expected Result:** `200 OK`; `data.userId` matches JWT `sub`; returned profile belongs only to the authenticated user.
- **Priority:** High

#### TC-ONB-BE-018

- **Related Scenario ID:** `TS-ONB-BE-14`
- **Title:** Return `USER_NOT_FOUND` when profile does not exist on `GET /me`
- **Objective:** Verify missing profile rows are reported with the canonical error.
- **Preconditions:** Valid JWT; consent complete; no profile row exists for JWT `sub`.
- **Test Data:** `Authorization: Bearer <valid-jwt-user-missing>`
- **Steps:**
  1. Send `GET /me`.
- **Expected Result:** `404 USER_NOT_FOUND`; failure envelope and `X-Request-Id` are present.
- **Priority:** High

#### TC-ONB-BE-019

- **Related Scenario ID:** `TS-ONB-BE-15`
- **Title:** Apply partial `PUT /me` update without clearing omitted fields
- **Objective:** Verify partial update semantics for the profile endpoint.
- **Preconditions:** Valid JWT; consent complete; profile exists with `level` and `reminderTime` already populated.
- **Test Data:** Body `{ "level": "advanced" }`
- **Steps:**
  1. Read the current profile.
  2. Send `PUT /me` with only `level`.
  3. Read the profile again.
  4. Inspect the persisted profile record.
- **Expected Result:** `200 OK`; `level` is updated; omitted fields remain unchanged; persisted record retains `entityType`.
- **Priority:** High

#### TC-ONB-BE-020

- **Related Scenario ID:** `TS-ONB-BE-14`
- **Title:** Return `USER_NOT_FOUND` when profile does not exist on `PUT /me`
- **Objective:** Verify missing profile rows are reported consistently during updates.
- **Preconditions:** Valid JWT; consent complete; no profile row exists for JWT `sub`.
- **Test Data:** Valid profile update body
- **Steps:**
  1. Send `PUT /me` with valid body.
- **Expected Result:** `404 USER_NOT_FOUND`; no profile row is created implicitly.
- **Priority:** High

#### TC-ONB-BE-021

- **Related Scenario ID:** `TS-ONB-BE-16`
- **Title:** Trim leading and trailing whitespace from `displayName`
- **Objective:** Verify `displayName` normalization during profile updates.
- **Preconditions:** Valid JWT; consent complete; profile exists.
- **Test Data:** Body `{ "displayName": "  Alex  " }`
- **Steps:**
  1. Send `PUT /me` with whitespace-padded `displayName`.
  2. Read the profile.
- **Expected Result:** `200 OK`; persisted `displayName` is trimmed to `Alex`.
- **Priority:** Medium

#### TC-ONB-BE-022

- **Related Scenario ID:** `TS-ONB-BE-16`
- **Title:** Enforce 80-character boundary for `displayName`
- **Objective:** Verify profile updates never persist a `displayName` longer than 80 characters.
- **Preconditions:** Valid JWT; consent complete; profile exists.
- **Test Data:** Body with `displayName` longer than 80 characters
- **Steps:**
  1. Send `PUT /me` with over-length `displayName`.
  2. Inspect response and persisted profile.
- **Expected Result:** `422 VALIDATION_ERROR`; no persisted `displayName` longer than 80 characters exists after the request.
- **Priority:** High

#### TC-ONB-BE-023

- **Related Scenario ID:** `TS-ONB-BE-16`
- **Title:** Reject invalid `level` value on `PUT /me`
- **Objective:** Verify `level` enum validation.
- **Preconditions:** Valid JWT; consent complete; profile exists.
- **Test Data:** Body `{ "level": "expert" }`
- **Steps:**
  1. Send `PUT /me` with invalid `level`.
  2. Read the profile.
- **Expected Result:** `422 VALIDATION_ERROR`; invalid value is not persisted.
- **Priority:** High

#### TC-ONB-BE-024

- **Related Scenario ID:** `TS-ONB-BE-16`
- **Title:** Reject invalid `reminderTime` format on `PUT /me`
- **Objective:** Verify `HH:MM` validation.
- **Preconditions:** Valid JWT; consent complete; profile exists.
- **Test Data:** Body `{ "reminderTime": "25:99" }`
- **Steps:**
  1. Send `PUT /me` with invalid `reminderTime`.
  2. Read the profile.
- **Expected Result:** `422 VALIDATION_ERROR`; invalid value is not persisted.
- **Priority:** High

#### TC-ONB-BE-025

- **Related Scenario ID:** `TS-ONB-BE-13`
- **Title:** Confirm own-profile semantics are derived from JWT `sub`
- **Objective:** Verify the caller cannot use any client-supplied identifier to access another user's profile.
- **Preconditions:** Separate profiles exist for two users.
- **Test Data:** JWT for user A; persisted profile for user B
- **Steps:**
  1. Send `GET /me` as user A.
  2. Inspect returned profile.
  3. Confirm the endpoint has no request shape that allows selecting another user's profile.
- **Expected Result:** Only user A's profile is returned; user B's profile is never exposed through this endpoint.
- **Priority:** High

### Onboarding Progress API

#### TC-ONB-BE-026

- **Related Scenario ID:** `TS-ONB-BE-17`
- **Title:** Persist all valid onboarding-step enum values
- **Objective:** Verify every allowed onboarding-step value is accepted.
- **Preconditions:** Valid JWT; consent complete; profile exists.
- **Test Data:** `age_gate_done`, `consent_done`, `intro_done`, `level_selected`, `reminder_set`, `mic_permission_done`, `complete`
- **Steps:**
  1. Send `PUT /me/onboarding-step` for each valid value one by one.
  2. After each write, call `GET /me`.
- **Expected Result:** Each allowed step is accepted and returned as the current `onboardingStep`.
- **Priority:** High

#### TC-ONB-BE-027

- **Related Scenario ID:** `TS-ONB-BE-18`
- **Title:** Reject invalid onboarding-step value
- **Objective:** Verify only allowed onboarding-step values are accepted.
- **Preconditions:** Valid JWT; consent complete; profile exists.
- **Test Data:** Body `{ "step": "foobar" }`
- **Steps:**
  1. Send `PUT /me/onboarding-step` with invalid step.
  2. Read profile state afterward.
- **Expected Result:** `422 VALIDATION_ERROR`; previously stored `onboardingStep` remains unchanged.
- **Priority:** High

#### TC-ONB-BE-028

- **Related Scenario ID:** `TS-ONB-BE-18`
- **Title:** Reject onboarding-step updates without JWT
- **Objective:** Verify onboarding-progress endpoint requires authentication.
- **Preconditions:** None.
- **Test Data:** Body `{ "step": "intro_done" }`
- **Steps:**
  1. Send `PUT /me/onboarding-step` without JWT.
- **Expected Result:** `401 AUTH_UNAUTHORIZED`; failure envelope and `X-Request-Id` are present.
- **Priority:** High

### Aggregate Persistence Verification

#### TC-ONB-BE-029

- **Related Scenario ID:** `TS-ONB-BE-19`
- **Title:** Verify aggregate onboarding persistence across consent, profile, and progress writes
- **Objective:** Verify all major onboarding backend writes create the expected persisted state and metadata.
- **Preconditions:** DB inspection access; new onboarding test user journey.
- **Test Data:** Pre-auth consent, authenticated profile updates, onboarding-step updates
- **Steps:**
  1. Save pre-auth consent.
  2. Verify `locale`, `entityType`, `ttlEpoch`, and `consentUpdatedAt`.
  3. Authenticate and trigger re-key.
  4. Save `displayName`, `level`, and `reminderTime`.
  5. Save `onboardingStep`.
  6. Inspect canonical consent and profile records.
- **Expected Result:** Consent and profile records match documented key patterns and persistence rules; `entityType` is present where required; `onboardingStep` is stored correctly.
- **Priority:** High

### Middleware and Failure Contract

#### TC-ONB-BE-030

- **Related Scenario ID:** `Supplementary`
- **Title:** Generate and return `X-Request-Id` when the client omits it
- **Objective:** Verify request-correlation behavior for onboarding endpoints when the client does not provide a request ID.
- **Preconditions:** Endpoint available in normal health state.
- **Test Data:** Valid onboarding request without `X-Request-Id`
- **Steps:**
  1. Send a valid onboarding request such as pre-auth `GET /consent` without `X-Request-Id`.
  2. Inspect response headers and envelope body.
- **Expected Result:** Backend returns a generated `X-Request-Id` response header and matching `requestId` in the envelope.
- **Priority:** Medium

#### TC-ONB-BE-031

- **Related Scenario ID:** `Supplementary`
- **Title:** Return a retryable transport contract on rate-limited onboarding requests
- **Objective:** Verify the onboarding API surfaces HTTP-level rate limiting consistently.
- **Preconditions:** Rate limiting can be triggered in QA or simulated.
- **Test Data:** Burst of repeated writes to a rate-limited onboarding endpoint
- **Steps:**
  1. Repeatedly call a write endpoint such as `PUT /consent` until the limit is exceeded.
  2. Inspect the failing response.
- **Expected Result:** Backend returns `429 Too Many Requests`; the response is clearly retryable from a transport perspective and does not corrupt persisted state.
- **Priority:** Medium

#### TC-ONB-BE-032

- **Related Scenario ID:** `Supplementary`
- **Title:** Return `SYSTEM_ERROR` contract on representative backend failure
- **Objective:** Verify onboarding endpoints surface backend/runtime failures using the canonical server-error contract.
- **Preconditions:** Controlled backend dependency failure can be simulated.
- **Test Data:** Valid request to an onboarding endpoint during simulated repository or service failure
- **Steps:**
  1. Simulate a backend dependency failure for an onboarding endpoint such as `PUT /consent` or `GET /me`.
  2. Send the valid request.
  3. Inspect the failing response.
- **Expected Result:** Backend returns `500 SYSTEM_ERROR` using failure envelope conventions and without leaking internal exception details.
- **Priority:** Medium

## 5. Notes for Automation

- Highest-value API automation starters:
  - `TC-ONB-BE-002`
  - `TC-ONB-BE-007`
  - `TC-ONB-BE-009`
  - `TC-ONB-BE-016`
  - `TC-ONB-BE-019`
  - `TC-ONB-BE-026`
  - `TC-ONB-BE-029`
  - `TC-ONB-BE-030`

- Best parameterized suites:
  - locale handling
  - JWT failure variants
  - valid onboarding-step enum values
  - consent scope (`DEVICE#` vs `USER#`)
