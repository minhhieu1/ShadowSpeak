# Backend/API Test Scenario Document — Epic 01 First-Time Onboarding and Access

## Document Metadata

| Field | Value |
|---|---|
| Project | ShadowSpeak |
| Epic | 01 — First-Time Onboarding and Access |
| Phase | 06 - Testing |
| Type | Backend/API Test Scenario Document |
| Version | 1.1 |
| Date | 2026-05-23 |
| Status | Draft |
| Owner | QA |

## 1. Objective and Scope

This document defines backend and API test scenarios for Epic 01 onboarding. It is intended to provide sign-off coverage for the onboarding backend contract, including authentication, consent, profile, onboarding-progress, persistence, and audit behavior.

In scope:

- Pre-auth and authenticated consent endpoints: `GET /consent`, `PUT /consent`
- Authenticated profile endpoints: `GET /me`, `PUT /me`
- Authenticated onboarding-progress endpoint: `PUT /me/onboarding-step`
- JWT validation, consent guard, and own-profile semantics from JWT `sub`
- Pre-auth consent bootstrap with `X-Device-Id`
- Consent re-key from `DEVICE#<deviceId>#CONSENT` to `USER#<userId>#CONSENT`
- Validation rules, canonical error codes, `JsonEnvelope<T>` wrapper, and `X-Request-Id` response header
- Persistence validation for `entityType`, `ttlEpoch`, locale, timestamps, and audit side effects

Out of scope:

- Screen layout, UI copy, navigation transitions, and OS permission UX
- Cognito-hosted sign-up, sign-in, reset-password, or provider-specific flows outside JWT contract validation
- Full end-to-end mobile journey orchestration across screens

## 2. References

- `/Volumes/Data/Coding/Shadowing/specs/04-solution-architecture/05-API-Specification-Document.md`
- `/Volumes/Data/Coding/Shadowing/specs/05-development/01-Technical-Task-Breakdown/01-onboarding/01-Backend.md`
- `/Volumes/Data/Coding/Shadowing/specs/02-analysis/03-Functional-Requirements-Specification.md`
- `/Volumes/Data/Coding/Shadowing/specs/02-analysis/06-user-story/01-onboarding.md`

## 3. Assumptions and Environment

- Backend is deployed to QA or staging with request/response logging enabled.
- Testers can inspect API responses, response headers, structured logs, and database records.
- Valid, expired, malformed, and invalid-signature JWT fixtures are available.
- Device IDs can be controlled for pre-auth consent tests.
- Test data can be seeded so a JWT `sub` maps to either an existing or missing user profile.
- Database records expose internal persistence attributes required for sign-off validation, including `entityType` and `ttlEpoch`.

## 4. Contract Assertions Applied to Relevant Scenarios

Unless a scenario explicitly states otherwise, the following assertions apply to every success and error response in scope:

- Response body uses `JsonEnvelope<T>` shape.
- `ok=true` and `data` is present on success.
- `ok=false` and `error.code` is present on failure.
- `requestId` is present in the body.
- `X-Request-Id` is present in the response header.
- Returned HTTP status exactly matches the API specification.
- Returned canonical error code exactly matches the API specification or technical task breakdown.

## 5. Scenario Coverage Matrix

| Area | Coverage Focus | Scenario IDs |
|---|---|---|
| Consent pre-auth | Device-scoped read/write, locale handling, TTL, missing header, validation | `TS-ONB-BE-01` to `TS-ONB-BE-04` |
| Consent authenticated | User-scoped read/write, own-identity semantics, request contract | `TS-ONB-BE-05` to `TS-ONB-BE-06` |
| Consent re-key and audit | Re-key success, re-key no-op, audit logging | `TS-ONB-BE-07` to `TS-ONB-BE-09` |
| Consent guard and JWT | Guard failures, missing JWT, expired JWT, invalid signature | `TS-ONB-BE-10` to `TS-ONB-BE-12` |
| Profile API | Read/update success, trim/max-length validation, `USER_NOT_FOUND`, own-profile semantics | `TS-ONB-BE-13` to `TS-ONB-BE-16` |
| Onboarding progress | Full valid-step set, invalid step, auth enforcement | `TS-ONB-BE-17` to `TS-ONB-BE-18` |
| Persistence | `entityType`, `ttlEpoch`, timestamps, record migration integrity | `TS-ONB-BE-19` |

## 6. Backend/API Test Scenarios

#### TS-ONB-BE-01

- **Related User Story:** `US-2.1`
- **Title:** Pre-auth `GET /consent` returns device-scoped consent state
- **Description:** Verify anonymous onboarding clients can read consent state using `X-Device-Id`.
- **Preconditions:** No JWT; seeded device-scoped consent exists for `device-001`.
- **Test Data:** `X-Device-Id: device-001`, `X-Request-Id: req-onb-001`.
- **Steps:**
  1. Send `GET /consent` without `Authorization` and with `X-Device-Id` and `X-Request-Id`.
  2. Inspect the HTTP status, `JsonEnvelope<ConsentState>`, and `X-Request-Id` response header.
- **Expected Result:** API returns `200 OK`; `ok=true`; `data.userId` is the device-scoped anonymous identifier; the response includes the same or server-generated `requestId` and `X-Request-Id`.
- **Priority:** High

#### TS-ONB-BE-02

- **Related User Story:** `US-2.1`
- **Title:** Pre-auth `PUT /consent` persists valid consent, locale, and TTL
- **Description:** Verify valid onboarding consent can be saved before authentication with correct persistence attributes.
- **Preconditions:** No JWT; valid device ID available.
- **Test Data:** `X-Device-Id: device-002`, `Accept-Language: fr-FR`, payload `{ ageVerified: true, privacyAccepted: true, adConsent: "unknown" }`.
- **Steps:**
  1. Send `PUT /consent` without `Authorization` and with `X-Device-Id`, `Accept-Language`, `Content-Type: application/json`, and `X-Request-Id`.
  2. Re-read the same consent with pre-auth `GET /consent`.
  3. Inspect the persisted `DEVICE#<deviceId>#CONSENT` record.
- **Expected Result:** API returns `200 OK`; `JsonEnvelope<ConsentState>` includes `locale="fr-FR"` and server-generated `consentUpdatedAt`; DB record is stored under `DEVICE#device-002#CONSENT` with `entityType="consent"` and `ttlEpoch` set to approximately now + 86400 seconds.
- **Priority:** High

#### TS-ONB-BE-03

- **Related User Story:** `US-2.1`
- **Title:** Pre-auth `PUT /consent` defaults locale to `en-US` when `Accept-Language` is absent
- **Description:** Verify locale fallback behavior for anonymous consent writes.
- **Preconditions:** No JWT; valid device ID available.
- **Test Data:** `X-Device-Id: device-003`, payload `{ ageVerified: true, privacyAccepted: true, adConsent: "personalized" }`.
- **Steps:**
  1. Send `PUT /consent` without `Authorization` and without `Accept-Language`.
  2. Call pre-auth `GET /consent` for the same device.
  3. Inspect the persisted consent record.
- **Expected Result:** API returns `200 OK`; `data.locale="en-US"`; persisted record stores `locale="en-US"` and valid `consentUpdatedAt`.
- **Priority:** High

#### TS-ONB-BE-04

- **Related User Story:** `US-2.1`
- **Title:** Pre-auth consent requests without `X-Device-Id` fail with exact validation contract
- **Description:** Verify the backend rejects anonymous consent requests missing the device identifier.
- **Preconditions:** No JWT.
- **Test Data:** Missing `X-Device-Id`.
- **Steps:**
  1. Send `GET /consent` without `Authorization` and without `X-Device-Id`.
  2. Send `PUT /consent` without `Authorization`, without `X-Device-Id`, and with an otherwise valid body.
  3. Inspect the response contract and persistence layer.
- **Expected Result:** Both requests return `422 Unprocessable Entity` with `ok=false`, `error.code="VALIDATION_ERROR"`, `JsonEnvelope`, and `X-Request-Id`; no consent record is written.
- **Priority:** High

#### TS-ONB-BE-05

- **Related User Story:** `US-2.1`, `US-3.1`
- **Title:** Authenticated `GET /consent` returns user-scoped consent for the JWT subject
- **Description:** Verify authenticated consent reads use the authenticated identity rather than device scope.
- **Preconditions:** Valid JWT for `sub=user-001`; user-scoped consent exists.
- **Test Data:** `Authorization: Bearer <valid-jwt-user-001>`, optional mismatched `X-Device-Id: device-other`.
- **Steps:**
  1. Send `GET /consent` with valid JWT.
  2. Inspect response identity fields and returned consent state.
- **Expected Result:** API returns `200 OK`; `data.userId="user-001"`; returned consent is sourced from `USER#user-001#CONSENT`; optional `X-Device-Id` does not cause another profile's consent to be returned.
- **Priority:** High

#### TS-ONB-BE-06

- **Related User Story:** `US-2.1`, `US-3.1`
- **Title:** Authenticated `PUT /consent` persists user-scoped consent without bootstrap TTL
- **Description:** Verify authenticated consent writes persist to the canonical user record and follow the response contract.
- **Preconditions:** Valid JWT for `sub=user-002`.
- **Test Data:** `Authorization: Bearer <valid-jwt-user-002>`, payload `{ ageVerified: true, privacyAccepted: true, adConsent: "non_personalized" }`.
- **Steps:**
  1. Send `PUT /consent` with valid JWT and valid body.
  2. Call authenticated `GET /consent`.
  3. Inspect the persisted `USER#<userId>#CONSENT` record.
- **Expected Result:** API returns `200 OK`; `data.userId="user-002"`; DB record is stored under `USER#user-002#CONSENT` with `entityType="consent"`; `ttlEpoch` is absent for the canonical user consent record; response envelope and `X-Request-Id` are present.
- **Priority:** High

#### TS-ONB-BE-07

- **Related User Story:** `US-2.1`, `US-3.1`
- **Title:** First authenticated access re-keys consent from device scope to user scope
- **Description:** Verify bootstrap consent is migrated to the canonical authenticated user record on the first authenticated request.
- **Preconditions:** Existing `DEVICE#device-004#CONSENT`; valid JWT for `sub=user-004`; no existing `USER#user-004#CONSENT`.
- **Test Data:** `X-Device-Id: device-004`, valid JWT, bootstrap consent with locale and timestamp already set.
- **Steps:**
  1. Save consent pre-auth for `device-004`.
  2. Authenticate as `user-004`.
  3. Call the first authenticated endpoint that should trigger re-key, such as `GET /me` or `GET /consent`.
  4. Inspect consent records and audit logs before and after the call.
- **Expected Result:** Canonical `USER#user-004#CONSENT` is created with preserved `ageVerified`, `privacyAccepted`, `adConsent`, `locale`, and `consentUpdatedAt`; bootstrap `DEVICE#device-004#CONSENT` is deleted; an audit entry exists for the re-key event.
- **Priority:** High

#### TS-ONB-BE-08

- **Related User Story:** `US-2.1`, `US-3.1`
- **Title:** Re-key duplicate attempt is a no-op and remains idempotent
- **Description:** Verify re-key does not overwrite existing user consent or create duplicate side effects.
- **Preconditions:** Existing `USER#user-005#CONSENT`; valid JWT for `sub=user-005`; optional stale `DEVICE#device-005#CONSENT` may still exist.
- **Test Data:** `X-Device-Id: device-005`, valid JWT.
- **Steps:**
  1. Seed `USER#user-005#CONSENT` with known values.
  2. Call the authenticated endpoint that performs re-key logic.
  3. Repeat the same request.
  4. Inspect user consent, device consent, and audit logs.
- **Expected Result:** Existing user consent remains authoritative and unchanged; repeated re-key attempts succeed without duplicate user records or value drift; behavior is observably idempotent.
- **Priority:** High

#### TS-ONB-BE-09

- **Related User Story:** `US-2.1`
- **Title:** Consent updates and re-key events produce expected audit logging
- **Description:** Verify audit logging coverage for both direct consent changes and migration events.
- **Preconditions:** Audit logs are accessible.
- **Test Data:** One pre-auth consent write, one authenticated consent update, one re-key flow.
- **Steps:**
  1. Submit a `PUT /consent` write pre-auth.
  2. Submit a `PUT /consent` write authenticated.
  3. Execute a re-key flow.
  4. Inspect logs using `requestId`, timestamp, and subject identifiers.
- **Expected Result:** Every consent change produces one structured audit entry; re-key also produces an audit entry; entries contain allowed identifiers, request correlation, and no unexpected PII.
- **Priority:** Medium

#### TS-ONB-BE-10

- **Related User Story:** `US-2.1`, `US-5.1`, `US-5.2`
- **Title:** Consent guard blocks `GET /me` and `PUT /me` until required consent is complete
- **Description:** Verify authenticated users cannot access protected profile routes before required consent is present.
- **Preconditions:** Valid JWT; consent missing or incomplete.
- **Test Data:** Authenticated user with either no consent record or `privacyAccepted=false`.
- **Steps:**
  1. Call `GET /me`.
  2. Call `PUT /me` with a valid profile body.
  3. Inspect status, error code, envelope, and headers.
- **Expected Result:** Both requests return `403 Forbidden` with `ok=false`, `error.code="CONSENT_REQUIRED"`, `JsonEnvelope`, and `X-Request-Id`.
- **Priority:** High

#### TS-ONB-BE-11

- **Related User Story:** `US-5.1`, `US-5.2`, `US-7.2`
- **Title:** Missing or expired JWT is rejected on protected onboarding endpoints
- **Description:** Verify protected profile and onboarding-progress routes enforce authentication.
- **Preconditions:** One unauthenticated context and one expired-JWT fixture.
- **Test Data:** Missing JWT; expired JWT.
- **Steps:**
  1. Call `GET /me`, `PUT /me`, and `PUT /me/onboarding-step` without JWT.
  2. Repeat the same requests with an expired JWT.
- **Expected Result:** Each request returns `401 Unauthorized` with `ok=false`, `error.code="AUTH_UNAUTHORIZED"`, `JsonEnvelope`, and `X-Request-Id`.
- **Priority:** High

#### TS-ONB-BE-12

- **Related User Story:** `US-5.1`, `US-5.2`, `US-7.2`
- **Title:** Invalid JWT signature is rejected on protected endpoints
- **Description:** Verify signature validation failures map to the canonical unauthorized contract.
- **Preconditions:** Invalid-signature JWT fixture available.
- **Test Data:** JWT with valid shape but invalid signature.
- **Steps:**
  1. Call `GET /me` with invalid-signature JWT.
  2. Call `PUT /me` with invalid-signature JWT.
  3. Call `PUT /me/onboarding-step` with invalid-signature JWT.
- **Expected Result:** Each request returns `401 Unauthorized` with `error.code="AUTH_UNAUTHORIZED"`; no profile or onboarding data changes are persisted.
- **Priority:** High

#### TS-ONB-BE-13

- **Related User Story:** `US-5.1`
- **Title:** `GET /me` returns only the profile belonging to JWT `sub`
- **Description:** Verify own-profile semantics are derived from the authenticated JWT subject and not from client-supplied identifiers.
- **Preconditions:** Distinct profiles exist for `user-010` and `user-011`; valid JWT for `sub=user-010`; required consent exists for `user-010`.
- **Test Data:** `Authorization: Bearer <valid-jwt-user-010>`, optional unrelated `X-Device-Id`.
- **Steps:**
  1. Call `GET /me` as `user-010`.
  2. Inspect returned `UserProfile.userId`.
  3. Confirm no mechanism exists to switch target identity through request body, query, or header data.
- **Expected Result:** API returns `200 OK`; `data.userId="user-010"`; profile data for `user-011` is never returned.
- **Priority:** High

#### TS-ONB-BE-14

- **Related User Story:** `US-5.1`, `US-5.2`
- **Title:** `GET /me` and `PUT /me` return `USER_NOT_FOUND` when the JWT subject has no profile
- **Description:** Verify missing-profile cases match the documented profile contract.
- **Preconditions:** Valid JWT for `sub=user-missing`; consent state is sufficient to pass consent checks; no `USER#user-missing#PROFILE` record exists.
- **Test Data:** Valid JWT for a user with no profile.
- **Steps:**
  1. Call `GET /me` with the JWT.
  2. Call `PUT /me` with a valid profile body and the same JWT.
  3. Inspect HTTP status, canonical error code, envelope, and response header.
- **Expected Result:** Both requests return `404 Not Found` with `ok=false`, `error.code="USER_NOT_FOUND"`, `JsonEnvelope`, and `X-Request-Id`.
- **Priority:** High

#### TS-ONB-BE-15

- **Related User Story:** `US-5.2`
- **Title:** `PUT /me` applies partial-update semantics and persists profile under the JWT subject
- **Description:** Verify omitted fields remain unchanged and the write is bound to the authenticated user only.
- **Preconditions:** Valid JWT for `sub=user-012`; required consent exists; seeded profile has `displayName`, `level`, `reminderTime`, and `onboardingStep`.
- **Test Data:** Partial body updating only `level`.
- **Steps:**
  1. Read the current profile with `GET /me`.
  2. Send `PUT /me` with a body containing only `level`.
  3. Re-read the profile and inspect the DB record.
- **Expected Result:** API returns `200 OK`; only `level` changes; omitted fields remain unchanged; persisted record remains under `USER#user-012#PROFILE` with `entityType="profile"`.
- **Priority:** High

#### TS-ONB-BE-16

- **Related User Story:** `US-5.2`
- **Title:** `PUT /me` trims `displayName` and enforces max length 80
- **Description:** Verify profile display-name normalization and validation rules.
- **Preconditions:** Valid JWT and consent.
- **Test Data:** Case A: `displayName="  Taylor  "`; Case B: `displayName` length `81`; Case C: invalid `reminderTime="25:99"` or invalid `level`.
- **Steps:**
  1. Send `PUT /me` with Case A body and re-read the profile.
  2. Send `PUT /me` with Case B body.
  3. Send `PUT /me` with Case C body.
- **Expected Result:** Case A returns `200 OK` and stores `displayName="Taylor"`; Cases B and C return `422 Unprocessable Entity` with `error.code="VALIDATION_ERROR"`; invalid values are not persisted.
- **Priority:** High

#### TS-ONB-BE-17

- **Related User Story:** `US-7.2`
- **Title:** `PUT /me/onboarding-step` accepts and persists the full valid step set
- **Description:** Verify the endpoint supports every documented onboarding step value.
- **Preconditions:** Valid JWT, consent, and an existing profile.
- **Test Data:** `age_gate_done`, `consent_done`, `intro_done`, `level_selected`, `reminder_set`, `mic_permission_done`, `complete`.
- **Steps:**
  1. For each valid step value, call `PUT /me/onboarding-step` with `{ "step": "<value>" }`.
  2. After each update, call `GET /me`.
  3. Inspect the persisted profile after the final update.
- **Expected Result:** Every listed step returns `200 OK`; `GET /me` returns the latest persisted `onboardingStep`; final profile record stores the last submitted valid step.
- **Priority:** High

#### TS-ONB-BE-18

- **Related User Story:** `US-7.2`
- **Title:** `PUT /me/onboarding-step` rejects invalid step values and missing auth
- **Description:** Verify onboarding-progress endpoint enforces both validation and authentication.
- **Preconditions:** Authenticated and unauthenticated request contexts available.
- **Test Data:** Invalid step such as `foobar`; missing JWT.
- **Steps:**
  1. Send `PUT /me/onboarding-step` without JWT.
  2. Send `PUT /me/onboarding-step` with invalid step and valid JWT.
  3. Re-read the profile for the authenticated user.
- **Expected Result:** Missing JWT returns `401 Unauthorized` with `error.code="AUTH_UNAUTHORIZED"`; invalid step returns `422 Unprocessable Entity` with `error.code="VALIDATION_ERROR"`; no invalid onboarding step is persisted.
- **Priority:** High

#### TS-ONB-BE-19

- **Related User Story:** `US-2.1`, `US-3.1`, `US-5.1`, `US-5.2`, `US-7.2`
- **Title:** Database state reflects onboarding lifecycle updates correctly
- **Description:** Verify consent, profile, and onboarding-progress persistence attributes remain correct across the onboarding lifecycle.
- **Preconditions:** Database inspection access; one clean test user and one clean test device.
- **Test Data:** One full flow containing pre-auth consent, authenticated re-key, profile update, and onboarding-step progression.
- **Steps:**
  1. Save consent pre-auth with `X-Device-Id`.
  2. Inspect the bootstrap consent record for `entityType`, `ttlEpoch`, `locale`, and `consentUpdatedAt`.
  3. Authenticate and trigger re-key.
  4. Inspect that the canonical `USER#<userId>#CONSENT` record exists and the `DEVICE#` record is removed.
  5. Update profile fields and onboarding step.
  6. Inspect final profile and consent records.
- **Expected Result:** Bootstrap consent contains `entityType="consent"` and valid `ttlEpoch`; canonical user consent contains `entityType="consent"` and no bootstrap TTL requirement; profile contains `entityType="profile"`; timestamps and migrated values remain intact across the lifecycle.
- **Priority:** High

## 7. Traceability Summary

| Coverage Area | Scenarios |
|---|---|
| Pre-auth consent contract | `TS-ONB-BE-01` to `TS-ONB-BE-04` |
| Authenticated consent contract | `TS-ONB-BE-05`, `TS-ONB-BE-06` |
| Re-key and consent audit | `TS-ONB-BE-07` to `TS-ONB-BE-09` |
| Consent guard and JWT validation | `TS-ONB-BE-10` to `TS-ONB-BE-12` |
| Profile read/update and missing-profile handling | `TS-ONB-BE-13` to `TS-ONB-BE-16` |
| Onboarding-progress validation | `TS-ONB-BE-17`, `TS-ONB-BE-18` |
| Persistence attributes and lifecycle integrity | `TS-ONB-BE-19` |
