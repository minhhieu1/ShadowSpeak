> **Execution:** This test plan is designed to be executed by the **backend-test-plan-executor** skill. Do NOT run curl commands manually — use that skill.

# Backend/API Test Plan — Epic 01 First-Time Onboarding and Access

## Document Metadata

| Field        | Value                                                                        |
| ------------ | ---------------------------------------------------------------------------- |
| Project      | ShadowSpeak                                                                  |
| Epic         | 01 — First-Time Onboarding and Access                                        |
| Phase        | 06 - Testing                                                                 |
| Type         | Backend/API Test Plan                                                        |
| Version      | 1.0                                                                          |
| Date         | 2026-05-25                                                                   |
| Status       | Draft                                                                        |
| Derived From | `specs/06-testing/02-Test-Case-Specification/01-onboarding/01-Backend-API.md` |

## Base Configuration

```
BASE_URL=http://127.0.0.1:8000
```

## Auth Token Setup

Endpoints requiring authentication use a JWT obtained via the **keycloak-auth** skill. The token is made available as:

```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"
```

**Expected Precondition Result:** `AUTH_TOKEN` is a non-empty JWT string.

### Test Plan Outline

1. **Consent API — Pre-auth** — TC-ONB-BE-001 to TC-ONB-BE-006
2. **Consent API — Authenticated** — TC-ONB-BE-007 to TC-ONB-BE-008A
3. **Consent Re-key and Audit** — TC-ONB-BE-009 to TC-ONB-BE-012
4. **JWT and Consent Guard** — TC-ONB-BE-013 to TC-ONB-BE-016
5. **Profile API** — TC-ONB-BE-017 to TC-ONB-BE-025
6. **Onboarding Progress API** — TC-ONB-BE-026 to TC-ONB-BE-028
7. **Aggregate, Middleware, and Failure** — TC-ONB-BE-029 to TC-ONB-BE-032

---

## TC-ONB-BE-001: Read existing device-scoped consent state with valid X-Device-Id

### Objective
Verify anonymous onboarding clients can read an already persisted device-scoped consent record using a valid `X-Device-Id`.

### Preconditions
No JWT; a device-scoped consent record already exists for the device.

### Precondition Setup
```bash
DEVICE_ID="device-$(uuidgen)"
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Accept-Language: en-US" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true` in the response body.

### Test Execution
```bash
REQ_ID="req-$(uuidgen)"
# Read the consent record
curl -s "$BASE_URL/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"

# Check response headers
echo "---HEADERS---"
curl -s -D - -o /dev/null "$BASE_URL/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID"
```

### Expected Result
- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.data.userId`: matches device-scoped ID (not a user sub)
  - `body.data.ageVerified`: `true`
  - `body.data.privacyAccepted`: `true`
  - `body.data.adConsent`: `"unknown"`
  - `body.requestId`: non-null
- Response Header: `X-Request-Id` is present

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 200 | `actual == 200` |
| 2 | `body.ok` | `true` | `actual === true` |
| 3 | `body.data.userId` | device-scoped ID | `actual !== null && actual !== undefined` |
| 4 | `body.data.ageVerified` | `true` | `actual === true` |
| 5 | `body.data.privacyAccepted` | `true` | `actual === true` |
| 6 | `body.data.adConsent` | `"unknown"` | `actual === "unknown"` |
| 7 | `body.requestId` | non-null | `actual !== null` |
| 8 | `header.X-Request-Id` | present | `actual !== null` |

---

## TC-ONB-BE-001A: Read default device-scoped consent state for a brand-new X-Device-Id

### Objective
Verify anonymous onboarding clients receive a default all-false consent state on first read for a new device.

### Preconditions
No JWT; no consent record exists for the device.

### Precondition Setup
N/A — brand-new device with no prior consent record.

### Test Execution
```bash
DEVICE_ID="device-$(uuidgen)"
REQ_ID="req-$(uuidgen)"
curl -s "$BASE_URL/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---HEADERS---"
curl -s -D - -o /dev/null "$BASE_URL/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID"
```

### Expected Result
- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.data.ageVerified`: `false`
  - `body.data.privacyAccepted`: `false`
  - `body.data.adConsent`: `"unknown"`
  - `body.requestId`: non-null
- Response Header: `X-Request-Id` is present

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 200 | `actual == 200` |
| 2 | `body.ok` | `true` | `actual === true` |
| 3 | `body.data.ageVerified` | `false` | `actual === false` |
| 4 | `body.data.privacyAccepted` | `false` | `actual === false` |
| 5 | `body.data.adConsent` | `"unknown"` | `actual === "unknown"` |
| 6 | `body.requestId` | non-null | `actual !== null` |
| 7 | `header.X-Request-Id` | present | `actual !== null` |

---

## TC-ONB-BE-002: Save valid pre-auth consent and persist locale and TTL

### Objective
Verify valid anonymous consent writes persist to the bootstrap device record with required metadata including locale and TTL.

### Preconditions
No JWT; valid device ID available.

### Precondition Setup
```bash
DEVICE_ID="device-$(uuidgen)"
```

### Test Execution
```bash
REQ_ID_PUT="req-$(uuidgen)"
# Write consent with fr-FR locale
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_PUT" \
  -H "Accept-Language: fr-FR" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---HEADERS---"
curl -s -D - -o /dev/null -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_PUT" \
  -H "Accept-Language: fr-FR" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}'

echo "---READ_BACK---"
REQ_ID_GET="req-$(uuidgen)-readback"
curl -s "$BASE_URL/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_GET" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.data.locale`: `"fr-FR"`
  - `body.data.consentUpdatedAt`: non-null timestamp
  - DB record stored at `DEVICE#<deviceId>#CONSENT` with `entityType="consent"` and `ttlEpoch` set to approximately now + 86400 seconds

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (PUT) | 200 | `actual == 200` |
| 2 | `body.ok` | `true` | `actual === true` |
| 3 | `body.data.locale` | `"fr-FR"` | `actual === "fr-FR"` |
| 4 | `body.data.consentUpdatedAt` | non-null | `actual !== null` |
| 5 | `body.data.ageVerified` | `true` | `actual === true` |
| 6 | `body.data.privacyAccepted` | `true` | `actual === true` |
| 7 | `body.data.adConsent` | `"unknown"` | `actual === "unknown"` |
| 8 | `body.requestId` | non-null | `actual !== null` |
| 9 | `header.X-Request-Id` | present | `actual !== null` |
| 10 | Read-back `locale` | `"fr-FR"` | `actual === "fr-FR"` |

---

## TC-ONB-BE-003: Default locale to en-US when Accept-Language is absent

### Objective
Verify anonymous consent writes use `en-US` as the locale fallback when `Accept-Language` is not provided.

### Preconditions
No JWT; valid device ID available.

### Precondition Setup
```bash
DEVICE_ID="device-$(uuidgen)"
```

### Test Execution
```bash
REQ_ID_PUT="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_PUT" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---READ_BACK---"
REQ_ID_GET="req-$(uuidgen)-readback"
curl -s "$BASE_URL/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_GET" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `200 OK`
- Response Body:
  - `body.data.locale`: `"en-US"`
  - `body.data.consentUpdatedAt`: non-null timestamp
- Persisted `locale` is `"en-US"`

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (PUT) | 200 | `actual == 200` |
| 2 | `body.ok` | `true` | `actual === true` |
| 3 | `body.data.locale` | `"en-US"` | `actual === "en-US"` |
| 4 | `body.data.consentUpdatedAt` | non-null | `actual !== null` |
| 5 | `body.requestId` | non-null | `actual !== null` |
| 6 | Read-back `locale` | `"en-US"` | `actual === "en-US"` |

---

## TC-ONB-BE-004: Reject pre-auth consent requests without X-Device-Id

### Objective
Verify anonymous consent reads and writes fail validation when `X-Device-Id` is missing.

### Preconditions
No JWT.

### Precondition Setup
N/A

### Test Execution
```bash
REQ_ID_GET="req-$(uuidgen)"
echo "---GET_NO_DEVICE_ID---"
curl -s "$BASE_URL/consent" \
  -H "X-Request-Id: $REQ_ID_GET" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---PUT_NO_DEVICE_ID---"
REQ_ID_PUT="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: $REQ_ID_PUT" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `422 Unprocessable Entity`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"VALIDATION_ERROR"`
  - `body.requestId`: non-null
- Response Header: `X-Request-Id` is present
- No consent record is created

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (GET) | 422 | `actual == 422` |
| 2 | `body.ok` (GET) | `false` | `actual === false` |
| 3 | `body.error.code` (GET) | `"VALIDATION_ERROR"` | `actual === "VALIDATION_ERROR"` |
| 4 | HTTP Status (PUT) | 422 | `actual == 422` |
| 5 | `body.ok` (PUT) | `false` | `actual === false` |
| 6 | `body.error.code` (PUT) | `"VALIDATION_ERROR"` | `actual === "VALIDATION_ERROR"` |
| 7 | `body.requestId` | non-null | `actual !== null` |
| 8 | `header.X-Request-Id` | present | `actual !== null` |

---

## TC-ONB-BE-005: Reject invalid adConsent value for pre-auth consent

### Objective
Verify allowed consent enum values are enforced during pre-auth consent writes.

### Preconditions
No JWT; valid device ID available.

### Precondition Setup
```bash
DEVICE_ID="device-$(uuidgen)"
```

### Test Execution
```bash
REQ_ID="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "invalid_value"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---READ_BACK---"
REQ_ID_GET="req-$(uuidgen)-readback"
curl -s "$BASE_URL/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_GET" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `422 Unprocessable Entity`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"VALIDATION_ERROR"`
- Invalid value is not persisted; prior consent state (if any) remains unchanged

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (PUT) | 422 | `actual == 422` |
| 2 | `body.ok` | `false` | `actual === false` |
| 3 | `body.error.code` | `"VALIDATION_ERROR"` | `actual === "VALIDATION_ERROR"` |
| 4 | `body.requestId` | non-null | `actual !== null` |

---

## TC-ONB-BE-006: Reject incomplete or invalid age-gate consent payload

### Objective
Verify invalid onboarding consent payloads fail with `VALIDATION_ERROR` without partial writes.

### Preconditions
No JWT; valid device ID available.

### Precondition Setup
```bash
DEVICE_ID="device-$(uuidgen)"
```

### Test Execution
```bash
# Case 1: Missing required fields (empty body)
REQ_ID_1="req-$(uuidgen)"
echo "---CASE_1_EMPTY_BODY---"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_1" \
  -d '{}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Case 2: ageVerified=false
REQ_ID_2="req-$(uuidgen)"
echo "---CASE_2_AGE_FALSE---"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_2" \
  -d '{"ageVerified": false, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `422 Unprocessable Entity`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"VALIDATION_ERROR"`
- No invalid consent state is persisted

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (empty body) | 422 | `actual == 422` |
| 2 | `body.ok` (empty body) | `false` | `actual === false` |
| 3 | `body.error.code` (empty body) | `"VALIDATION_ERROR"` | `actual === "VALIDATION_ERROR"` |
| 4 | HTTP Status (ageVerified=false) | 422 | `actual == 422` |
| 5 | `body.ok` (ageVerified=false) | `false` | `actual === false` |
| 6 | `body.error.code` (ageVerified=false) | `"VALIDATION_ERROR"` | `actual === "VALIDATION_ERROR"` |

---

## TC-ONB-BE-007: Read user-scoped consent with valid JWT

### Objective
Verify authenticated consent reads use the authenticated identity rather than device scope.

### Preconditions
Valid JWT; user-scoped consent exists for the authenticated user.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Seed user-scoped consent for the authenticated user
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true` in the response body.

### Test Execution
```bash
REQ_ID="req-$(uuidgen)"
curl -s "$BASE_URL/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---HEADERS---"
curl -s -D - -o /dev/null "$BASE_URL/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID"
```

### Expected Result
- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.data.userId`: matches JWT `sub` claim
  - `body.data.adConsent`: `"personalized"`
  - `body.requestId`: non-null
- Response Header: `X-Request-Id` is present
- Record is read from `USER#<userId>#CONSENT`

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 200 | `actual == 200` |
| 2 | `body.ok` | `true` | `actual === true` |
| 3 | `body.data.userId` | non-null | `actual !== null` |
| 4 | `body.data.ageVerified` | `true` | `actual === true` |
| 5 | `body.data.privacyAccepted` | `true` | `actual === true` |
| 6 | `body.data.adConsent` | `"personalized"` | `actual === "personalized"` |
| 7 | `body.requestId` | non-null | `actual !== null` |
| 8 | `header.X-Request-Id` | present | `actual !== null` |

---

## TC-ONB-BE-008: Update user-scoped consent with valid JWT

### Objective
Verify authenticated consent writes persist to the canonical user consent record.

### Preconditions
Valid JWT for an existing user.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"
```

### Test Execution
```bash
REQ_ID_PUT="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_PUT" \
  -H "Accept-Language: en-GB" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "non_personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---READ_BACK---"
REQ_ID_GET="req-$(uuidgen)-readback"
curl -s "$BASE_URL/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_GET" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.data.userId`: matches JWT `sub`
  - `body.data.locale`: `"en-GB"`
  - `body.data.consentUpdatedAt`: non-null timestamp
- Persisted at `USER#<userId>#CONSENT` with `entityType="consent"`; `ttlEpoch` is absent for canonical user consent

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (PUT) | 200 | `actual == 200` |
| 2 | `body.ok` (PUT) | `true` | `actual === true` |
| 3 | `body.data.locale` | `"en-GB"` | `actual === "en-GB"` |
| 4 | `body.data.consentUpdatedAt` | non-null | `actual !== null` |
| 5 | `body.data.ageVerified` | `true` | `actual === true` |
| 6 | `body.data.privacyAccepted` | `true` | `actual === true` |
| 7 | `body.data.adConsent` | `"non_personalized"` | `actual === "non_personalized"` |
| 8 | Read-back `adConsent` | `"non_personalized"` | `actual === "non_personalized"` |

---

## TC-ONB-BE-008A: Ignore mismatched X-Device-Id during authenticated consent read

### Objective
Verify authenticated consent lookup remains bound to JWT identity even when a different device ID is supplied.

### Preconditions
Valid JWT for user-scoped consent; mismatched device-scoped consent may exist for another device.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure user-scoped consent exists
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true`.

### Test Execution
```bash
REQ_ID="req-$(uuidgen)"
curl -s "$BASE_URL/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Device-Id: device-mismatch-$(uuidgen)" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.data.userId`: matches JWT `sub` (NOT the mismatched device ID)
- Returned consent is resolved only from `USER#<userId>#CONSENT`; mismatched device header does not alter identity binding

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 200 | `actual == 200` |
| 2 | `body.ok` | `true` | `actual === true` |
| 3 | `body.data.userId` | matches JWT `sub` | `actual !== null` |
| 4 | `body.data.ageVerified` | `true` | `actual === true` |
| 5 | `body.data.privacyAccepted` | `true` | `actual === true` |
| 6 | `body.data.adConsent` | `"personalized"` | `actual === "personalized"` |

---

## TC-ONB-BE-009: Re-key bootstrap device consent to user consent on first authenticated request

### Objective
Verify consent is migrated from device scope to user scope after authentication.

### Preconditions
Existing device-scoped consent; valid JWT; no existing user-scoped consent for the same user.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Save device-scoped consent (simulating pre-auth)
DEVICE_ID="device-$(uuidgen)"
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Accept-Language: en-US" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true`; device-scoped consent saved.

### Test Execution
```bash
# Trigger re-key by calling GET /me with both JWT and the device ID
REQ_ID="req-$(uuidgen)"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `200 OK` (or `404 USER_NOT_FOUND` if no profile yet — re-key still triggers)
- User-scoped consent is created with preserved values from device bootstrap
- Bootstrap `DEVICE#<deviceId>#CONSENT` record is deleted after successful re-key
- Request succeeds normally

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 200 | `actual == 200` |
| 2 | `body.ok` | `true` or `false` (profile may not exist) | `actual !== null` |
| 3 | Re-key executed without error | success | response is not a 5xx |

---

## TC-ONB-BE-010: Re-key remains idempotent when user-scoped consent already exists

### Objective
Verify duplicate re-key attempts do not overwrite or duplicate canonical consent.

### Preconditions
Existing user-scoped consent; valid JWT.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure user-scoped consent exists with known values
REQ_ID_SEED1="req-$(uuidgen)-seed1"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_SEED1" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true`.

### Test Execution
```bash
# Trigger re-key (first call)
REQ_ID_1="req-$(uuidgen)-rekey1"
DEVICE_ID="device-$(uuidgen)"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_1" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---REKEY_2---"
# Trigger re-key again (second call)
REQ_ID_2="req-$(uuidgen)-rekey2"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_2" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---READ_CONSENT---"
REQ_ID_GET="req-$(uuidgen)-readback"
curl -s "$BASE_URL/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_GET" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `200 OK`
- User-scoped consent remains correct and stable; no duplicate canonical record or conflicting state is introduced
- Re-key is idempotent

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (rekey 1) | 200 | `actual == 200` |
| 2 | HTTP Status (rekey 2) | 200 | `actual == 200` |
| 3 | `body.data.adConsent` (readback) | `"personalized"` | `actual === "personalized"` |

---

## TC-ONB-BE-011: Re-key is a no-op when no bootstrap device consent exists

### Objective
Verify authenticated flows do not fail when no device-scoped consent bootstrap exists.

### Preconditions
Valid JWT; no `DEVICE#<deviceId>#CONSENT` record exists.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"
```

### Test Execution
```bash
REQ_ID="req-$(uuidgen)"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- Request succeeds (200 or 404 depending on profile existence); no error is raised
- No unexpected device-scoped record is created
- User consent state remains correct

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 200 or 404 | `actual == 200` or `actual == 404` |
| 2 | `body.ok` | present | `actual !== null` |
| 3 | No 5xx error | false | `actual < 500` |

---

## TC-ONB-BE-012: Emit audit log on consent updates and re-key events

### Objective
Verify consent changes and consent migration produce auditable log entries.

### Preconditions
Structured audit logs are accessible.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"
DEVICE_ID="device-$(uuidgen)"
```

### Test Execution
```bash
# Step 1: Direct consent update (authenticated)
REQ_ID_1="req-$(uuidgen)-update"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_1" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---STEP_2---"
# Step 2: Placeholder — trigger a re-key flow (see TC-ONB-BE-009)
REQ_ID_2="req-$(uuidgen)-rekey"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_2" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `200 OK` for both requests
- A structured audit entry exists for each consent update and for the re-key event
- Audit entries contain expected request correlation data and no extra PII

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (update) | 200 | `actual == 200` |
| 2 | `body.ok` (update) | `true` | `actual === true` |
| 3 | HTTP Status (re-key trigger) | 200 or 404 | `actual < 500` |

---

## TC-ONB-BE-013: Reject protected onboarding endpoints without JWT

### Objective
Verify protected profile and onboarding-progress endpoints enforce authentication.

### Preconditions
None.

### Precondition Setup
N/A

### Test Execution
```bash
echo "---GET_ME---"
REQ_ID_1="req-$(uuidgen)"
curl -s "$BASE_URL/me" \
  -H "X-Request-Id: $REQ_ID_1" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---PUT_ME---"
REQ_ID_2="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: $REQ_ID_2" \
  -d '{"displayName": "Test"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---PUT_ONBOARDING_STEP---"
REQ_ID_3="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/me/onboarding-step" \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: $REQ_ID_3" \
  -d '{"step": "intro_done"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- Each request returns `401 Unauthorized`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"AUTH_UNAUTHORIZED"`
  - `body.requestId`: non-null
- Response Header: `X-Request-Id` is present

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (GET /me) | 401 | `actual == 401` |
| 2 | `body.error.code` (GET /me) | `"AUTH_UNAUTHORIZED"` | `actual === "AUTH_UNAUTHORIZED"` |
| 3 | HTTP Status (PUT /me) | 401 | `actual == 401` |
| 4 | `body.error.code` (PUT /me) | `"AUTH_UNAUTHORIZED"` | `actual === "AUTH_UNAUTHORIZED"` |
| 5 | HTTP Status (PUT /me/onboarding-step) | 401 | `actual == 401` |
| 6 | `body.error.code` (PUT /me/onboarding-step) | `"AUTH_UNAUTHORIZED"` | `actual === "AUTH_UNAUTHORIZED"` |
| 7 | `body.requestId` | non-null | `actual !== null` |
| 8 | `header.X-Request-Id` | present | `actual !== null` |

---

## TC-ONB-BE-014: Reject protected onboarding endpoints with expired JWT

### Objective
Verify expired tokens cannot read or write protected onboarding state.

### Preconditions
Expired JWT available.

### Precondition Setup
```bash
EXPIRED_TOKEN="<expired-jwt-token>"
```

### Test Execution
```bash
echo "---GET_ME---"
REQ_ID_1="req-$(uuidgen)"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $EXPIRED_TOKEN" \
  -H "X-Request-Id: $REQ_ID_1" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---PUT_ME---"
REQ_ID_2="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EXPIRED_TOKEN" \
  -H "X-Request-Id: $REQ_ID_2" \
  -d '{"displayName": "Test"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---PUT_ONBOARDING_STEP---"
REQ_ID_3="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/me/onboarding-step" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $EXPIRED_TOKEN" \
  -H "X-Request-Id: $REQ_ID_3" \
  -d '{"step": "intro_done"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- Each request returns `401 Unauthorized`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"AUTH_UNAUTHORIZED"`
- No state mutation occurs

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (GET /me) | 401 | `actual == 401` |
| 2 | `body.error.code` (GET /me) | `"AUTH_UNAUTHORIZED"` | `actual === "AUTH_UNAUTHORIZED"` |
| 3 | HTTP Status (PUT /me) | 401 | `actual == 401` |
| 4 | `body.error.code` (PUT /me) | `"AUTH_UNAUTHORIZED"` | `actual === "AUTH_UNAUTHORIZED"` |
| 5 | HTTP Status (PUT /me/onboarding-step) | 401 | `actual == 401` |
| 6 | `body.error.code` (PUT /me/onboarding-step) | `"AUTH_UNAUTHORIZED"` | `actual === "AUTH_UNAUTHORIZED"` |

---

## TC-ONB-BE-015: Reject protected onboarding endpoints with invalid JWT signature

### Objective
Verify invalid-signature tokens are rejected.

### Preconditions
Invalid-signature JWT available.

### Precondition Setup
```bash
INVALID_SIG_TOKEN="<invalid-signature-jwt-token>"
```

### Test Execution
```bash
echo "---GET_ME---"
REQ_ID_1="req-$(uuidgen)"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $INVALID_SIG_TOKEN" \
  -H "X-Request-Id: $REQ_ID_1" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---PUT_ME---"
REQ_ID_2="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INVALID_SIG_TOKEN" \
  -H "X-Request-Id: $REQ_ID_2" \
  -d '{"displayName": "Test"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---PUT_ONBOARDING_STEP---"
REQ_ID_3="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/me/onboarding-step" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INVALID_SIG_TOKEN" \
  -H "X-Request-Id: $REQ_ID_3" \
  -d '{"step": "intro_done"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- Each request returns `401 Unauthorized`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"AUTH_UNAUTHORIZED"`
- No protected data is disclosed and no profile or onboarding-progress state changes are persisted

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (GET /me) | 401 | `actual == 401` |
| 2 | `body.error.code` (GET /me) | `"AUTH_UNAUTHORIZED"` | `actual === "AUTH_UNAUTHORIZED"` |
| 3 | HTTP Status (PUT /me) | 401 | `actual == 401` |
| 4 | `body.error.code` (PUT /me) | `"AUTH_UNAUTHORIZED"` | `actual === "AUTH_UNAUTHORIZED"` |
| 5 | HTTP Status (PUT /me/onboarding-step) | 401 | `actual == 401` |
| 6 | `body.error.code` (PUT /me/onboarding-step) | `"AUTH_UNAUTHORIZED"` | `actual === "AUTH_UNAUTHORIZED"` |

---

## TC-ONB-BE-016: Block profile endpoints until required consent is complete

### Objective
Verify consent guard blocks profile reads and writes when onboarding consent is incomplete.

### Preconditions
Valid JWT; missing or incomplete consent.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"
```
**Note:** This test expects that the authenticated user does NOT have complete consent (`ageVerified=true` and `privacyAccepted=true`). If the user already has complete consent, skip or reset consent prior to running.

### Test Execution
```bash
echo "---GET_ME---"
REQ_ID_1="req-$(uuidgen)"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_1" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---PUT_ME---"
REQ_ID_2="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_2" \
  -d '{"level": "beginner"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- Both requests return `403 Forbidden`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"CONSENT_REQUIRED"`
  - `body.requestId`: non-null
- Response Header: `X-Request-Id` is present
- Profile remains unchanged

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (GET /me) | 403 | `actual == 403` |
| 2 | `body.error.code` (GET /me) | `"CONSENT_REQUIRED"` | `actual === "CONSENT_REQUIRED"` |
| 3 | HTTP Status (PUT /me) | 403 | `actual == 403` |
| 4 | `body.error.code` (PUT /me) | `"CONSENT_REQUIRED"` | `actual === "CONSENT_REQUIRED"` |
| 5 | `body.requestId` | non-null | `actual !== null` |
| 6 | `header.X-Request-Id` | present | `actual !== null` |

---

## TC-ONB-BE-017: Return authenticated user's profile from GET /me

### Objective
Verify profile reads are bound to the authenticated JWT subject.

### Preconditions
Valid JWT; consent complete; profile exists.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent exists
REQ_ID_CONSENT="req-$(uuidgen)-seed-consent"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_CONSENT" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Ensure profile exists
REQ_ID_PROFILE="req-$(uuidgen)-seed-profile"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_PROFILE" \
  -d '{"displayName": "TestUser", "level": "intermediate", "reminderTime": "08:00"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true` for both.

### Test Execution
```bash
REQ_ID="req-$(uuidgen)"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.data.userId`: matches JWT `sub`
  - `body.data.displayName`: `"TestUser"`
  - `body.data.level`: `"intermediate"`
  - `body.data.reminderTime`: `"08:00"`
  - `body.data.createdAt`: non-null
  - `body.data.updatedAt`: non-null
  - `body.requestId`: non-null

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 200 | `actual == 200` |
| 2 | `body.ok` | `true` | `actual === true` |
| 3 | `body.data.userId` | matches JWT `sub` | `actual !== null` |
| 4 | `body.data.displayName` | `"TestUser"` | `actual === "TestUser"` |
| 5 | `body.data.level` | `"intermediate"` | `actual === "intermediate"` |
| 6 | `body.data.reminderTime` | `"08:00"` | `actual === "08:00"` |
| 7 | `body.requestId` | non-null | `actual !== null` |

---

## TC-ONB-BE-018: Return USER_NOT_FOUND when profile does not exist on GET /me

### Objective
Verify missing profile rows are reported with the canonical error.

### Preconditions
Valid JWT; consent complete; no profile row exists for JWT `sub`.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent exists but do NOT create a profile
REQ_ID_CONSENT="req-$(uuidgen)-seed-consent"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_CONSENT" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true`.

### Test Execution
```bash
REQ_ID="req-$(uuidgen)"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `404 Not Found`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"USER_NOT_FOUND"`
  - `body.requestId`: non-null
- Response Header: `X-Request-Id` is present

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 404 | `actual == 404` |
| 2 | `body.ok` | `false` | `actual === false` |
| 3 | `body.error.code` | `"USER_NOT_FOUND"` | `actual === "USER_NOT_FOUND"` |
| 4 | `body.requestId` | non-null | `actual !== null` |
| 5 | `header.X-Request-Id` | present | `actual !== null` |

---

## TC-ONB-BE-019: Apply partial PUT /me update without clearing omitted fields

### Objective
Verify partial update semantics for the profile endpoint.

### Preconditions
Valid JWT; consent complete; profile exists with `level` and `reminderTime` already populated.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent exists
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-consent" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Seed a profile with known values
DISPLAY_NAME="User-$(uuidgen | head -c8)"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-profile" \
  -d "{\"displayName\": \"$DISPLAY_NAME\", \"level\": \"beginner\", \"reminderTime\": \"07:30\"}" \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true` for both.

### Test Execution
```bash
# Read current profile first
REQ_ID_READ="req-$(uuidgen)-read"
echo "---BEFORE---"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_READ" \
  -w "\nHTTP_STATUS:%{http_code}"

# Update only level
echo "---UPDATE---"
REQ_ID_UPDATE="req-$(uuidgen)-update"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_UPDATE" \
  -d '{"level": "advanced"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Read again to verify partial update
echo "---AFTER---"
REQ_ID_READ2="req-$(uuidgen)-read2"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_READ2" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.data.level`: `"advanced"` (updated)
  - `body.data.displayName`: remains unchanged from seeded value
  - `body.data.reminderTime`: `"07:30"` (remains unchanged, was omitted from update)
- Persisted record retains `entityType`

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (update) | 200 | `actual == 200` |
| 2 | `body.ok` (update) | `true` | `actual === true` |
| 3 | `body.data.level` | `"advanced"` | `actual === "advanced"` |
| 4 | `body.data.displayName` | unchanged from seed | `actual !== null` |
| 5 | `body.data.reminderTime` | `"07:30"` | `actual === "07:30"` |

---

## TC-ONB-BE-020: Return USER_NOT_FOUND when profile does not exist on PUT /me

### Objective
Verify missing profile rows are reported consistently during updates.

### Preconditions
Valid JWT; consent complete; no profile row exists for JWT `sub`.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent exists but do NOT create a profile
REQ_ID_CONSENT="req-$(uuidgen)-seed-consent"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_CONSENT" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true`.

### Test Execution
```bash
REQ_ID="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -d '{"level": "beginner"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `404 Not Found`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"USER_NOT_FOUND"`
- No profile row is created implicitly

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 404 | `actual == 404` |
| 2 | `body.ok` | `false` | `actual === false` |
| 3 | `body.error.code` | `"USER_NOT_FOUND"` | `actual === "USER_NOT_FOUND"` |

---

## TC-ONB-BE-021: Trim leading and trailing whitespace from displayName

### Objective
Verify `displayName` normalization during profile updates.

### Preconditions
Valid JWT; consent complete; profile exists.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent exists
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-consent" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Seed initial profile
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-profile" \
  -d '{"displayName": "InitialName", "level": "beginner"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true` for both.

### Test Execution
```bash
# Update with whitespace-padded displayName
REQ_ID_UPDATE="req-$(uuidgen)-update"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_UPDATE" \
  -d '{"displayName": "  Alex  "}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---READ---"
REQ_ID_READ="req-$(uuidgen)-read"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_READ" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.data.displayName`: `"Alex"` (trimmed)

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 200 | `actual == 200` |
| 2 | `body.ok` | `true` | `actual === true` |
| 3 | `body.data.displayName` | `"Alex"` | `actual === "Alex"` |

---

## TC-ONB-BE-022: Enforce 80-character boundary for displayName

### Objective
Verify profile updates never persist a `displayName` longer than 80 characters.

### Preconditions
Valid JWT; consent complete; profile exists.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent and profile exist
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-consent" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-profile" \
  -d '{"displayName": "InitialName", "level": "beginner"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true` for both.

### Test Execution
```bash
# displayName longer than 80 characters (81 chars)
LONG_NAME="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
REQ_ID="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -d "{\"displayName\": \"${LONG_NAME}\"}" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `422 Unprocessable Entity`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"VALIDATION_ERROR"`
- No persisted `displayName` longer than 80 characters exists after the request

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 422 | `actual == 422` |
| 2 | `body.ok` | `false` | `actual === false` |
| 3 | `body.error.code` | `"VALIDATION_ERROR"` | `actual === "VALIDATION_ERROR"` |

---

## TC-ONB-BE-023: Reject invalid level value on PUT /me

### Objective
Verify `level` enum validation.

### Preconditions
Valid JWT; consent complete; profile exists.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent and profile exist
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-consent" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-profile" \
  -d '{"displayName": "TestUser", "level": "beginner"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true` for both.

### Test Execution
```bash
REQ_ID="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -d '{"level": "expert"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---READ---"
REQ_ID_READ="req-$(uuidgen)-read"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_READ" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `422 Unprocessable Entity`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"VALIDATION_ERROR"`
- Invalid value is not persisted; existing `level` remains `"beginner"`

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 422 | `actual == 422` |
| 2 | `body.ok` | `false` | `actual === false` |
| 3 | `body.error.code` | `"VALIDATION_ERROR"` | `actual === "VALIDATION_ERROR"` |

---

## TC-ONB-BE-024: Reject invalid reminderTime format on PUT /me

### Objective
Verify `HH:MM` validation for `reminderTime`.

### Preconditions
Valid JWT; consent complete; profile exists.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent and profile exist
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-consent" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-profile" \
  -d '{"displayName": "TestUser", "level": "beginner", "reminderTime": "08:00"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true` for both.

### Test Execution
```bash
REQ_ID="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -d '{"reminderTime": "25:99"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `422 Unprocessable Entity`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"VALIDATION_ERROR"`
- Invalid value is not persisted

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 422 | `actual == 422` |
| 2 | `body.ok` | `false` | `actual === false` |
| 3 | `body.error.code` | `"VALIDATION_ERROR"` | `actual === "VALIDATION_ERROR"` |

---

## TC-ONB-BE-025: Confirm own-profile semantics are derived from JWT sub

### Objective
Verify the caller cannot use any client-supplied identifier to access another user's profile.

### Preconditions
Separate profiles exist for two users.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent and profile for the primary user
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-consent" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-profile" \
  -d '{"displayName": "PrimaryUser", "level": "beginner"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true` for both.

### Test Execution
```bash
REQ_ID="req-$(uuidgen)"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.data.userId`: matches the JWT `sub` of the authenticated user
  - `body.data.displayName`: `"PrimaryUser"`
- The endpoint has no request shape that allows selecting another user's profile

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 200 | `actual == 200` |
| 2 | `body.ok` | `true` | `actual === true` |
| 3 | `body.data.userId` | matches JWT `sub` | `actual !== null` |
| 4 | `body.data.displayName` | `"PrimaryUser"` | `actual === "PrimaryUser"` |

---

## TC-ONB-BE-026: Persist all valid onboarding-step enum values

### Objective
Verify every allowed onboarding-step value is accepted and persisted.

### Preconditions
Valid JWT; consent complete; profile exists.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent and profile exist
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-consent" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-profile" \
  -d '{"displayName": "StepTestUser", "level": "beginner"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true` for both.

### Test Execution
```bash
# Test each valid step value sequentially
STEPS=("age_gate_done" "consent_done" "intro_done" "level_selected" "reminder_set" "mic_permission_done" "complete")
for step in "${STEPS[@]}"; do
  echo "---STEP: $step---"
  REQ_ID="req-$(uuidgen)-$step"
  curl -s -X PUT "$BASE_URL/me/onboarding-step" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "X-Request-Id: $REQ_ID" \
    -d "{\"step\": \"$step\"}" \
    -w "\nHTTP_STATUS:%{http_code}"
  echo ""
done

echo "---READ_FINAL---"
REQ_ID_READ="req-$(uuidgen)-readback"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_READ" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- Each step returns `200 OK` with `ok=true`
- Final `GET /me` returns `onboardingStep: "complete"`

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (age_gate_done) | 200 | `actual == 200` |
| 2 | HTTP Status (consent_done) | 200 | `actual == 200` |
| 3 | HTTP Status (intro_done) | 200 | `actual == 200` |
| 4 | HTTP Status (level_selected) | 200 | `actual == 200` |
| 5 | HTTP Status (reminder_set) | 200 | `actual == 200` |
| 6 | HTTP Status (mic_permission_done) | 200 | `actual == 200` |
| 7 | HTTP Status (complete) | 200 | `actual == 200` |
| 8 | `body.data.onboardingStep` (final read) | `"complete"` | `actual === "complete"` |

---

## TC-ONB-BE-027: Reject invalid onboarding-step value

### Objective
Verify only allowed onboarding-step values are accepted.

### Preconditions
Valid JWT; consent complete; profile exists.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent and profile exist
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-consent" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: req-$(uuidgen)-seed-profile" \
  -d '{"displayName": "StepTestUser", "level": "beginner"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```
**Expected Precondition Result:** HTTP 200 with `ok=true` for both.

### Test Execution
```bash
# Save a known step first
REQ_ID_BEFORE="req-$(uuidgen)-before"
curl -s -X PUT "$BASE_URL/me/onboarding-step" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_BEFORE" \
  -d '{"step": "intro_done"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---INVALID_STEP---"
REQ_ID_INVALID="req-$(uuidgen)-invalid"
curl -s -X PUT "$BASE_URL/me/onboarding-step" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_INVALID" \
  -d '{"step": "foobar"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---READ_AFTER---"
REQ_ID_READ="req-$(uuidgen)-readafter"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_READ" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status for invalid step: `422 Unprocessable Entity`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"VALIDATION_ERROR"`
- Previously stored `onboardingStep` remains `"intro_done"`

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (invalid step) | 422 | `actual == 422` |
| 2 | `body.ok` (invalid step) | `false` | `actual === false` |
| 3 | `body.error.code` (invalid step) | `"VALIDATION_ERROR"` | `actual === "VALIDATION_ERROR"` |
| 4 | `body.data.onboardingStep` (read after) | `"intro_done"` | `actual === "intro_done"` |

---

## TC-ONB-BE-028: Reject onboarding-step updates without JWT

### Objective
Verify onboarding-progress endpoint requires authentication.

### Preconditions
None.

### Precondition Setup
N/A

### Test Execution
```bash
REQ_ID="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/me/onboarding-step" \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: $REQ_ID" \
  -d '{"step": "intro_done"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `401 Unauthorized`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"AUTH_UNAUTHORIZED"`
  - `body.requestId`: non-null
- Response Header: `X-Request-Id` is present

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 401 | `actual == 401` |
| 2 | `body.ok` | `false` | `actual === false` |
| 3 | `body.error.code` | `"AUTH_UNAUTHORIZED"` | `actual === "AUTH_UNAUTHORIZED"` |
| 4 | `body.requestId` | non-null | `actual !== null` |
| 5 | `header.X-Request-Id` | present | `actual !== null` |

---

## TC-ONB-BE-029: Verify aggregate onboarding persistence across consent, profile, and progress writes

### Objective
Verify all major onboarding backend writes create the expected persisted state and metadata.

### Preconditions
DB inspection access; new onboarding test user journey.

### Precondition Setup
```bash
AUTH_TOKEN="<token-from-keycloak-auth-skill>"
DEVICE_ID="device-$(uuidgen)"
```

### Test Execution
```bash
# Step 1: Save pre-auth consent
echo "---STEP_1_PREAUTH_CONSENT---"
REQ_ID_1="req-$(uuidgen)-step1"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_1" \
  -H "Accept-Language: fr-FR" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Step 2: Authenticate and trigger re-key
echo "---STEP_2_REKEY---"
REQ_ID_2="req-$(uuidgen)-step2"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_2" \
  -w "\nHTTP_STATUS:%{http_code}"

# Step 3: Update profile
echo "---STEP_3_PROFILE---"
REQ_ID_3="req-$(uuidgen)-step3"
curl -s -X PUT "$BASE_URL/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_3" \
  -d '{"displayName": "AggregateTestUser", "level": "intermediate", "reminderTime": "09:00"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Step 4: Save onboarding step
echo "---STEP_4_ONBOARDING_STEP---"
REQ_ID_4="req-$(uuidgen)-step4"
curl -s -X PUT "$BASE_URL/me/onboarding-step" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_4" \
  -d '{"step": "complete"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Step 5: Read final state
echo "---STEP_5_READ---"
REQ_ID_5="req-$(uuidgen)-step5"
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_5" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- All steps return `200 OK`
- Consent and profile records match documented key patterns and persistence rules
- `entityType` is present where required
- `onboardingStep` is stored correctly

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status (pre-auth consent) | 200 | `actual == 200` |
| 2 | HTTP Status (profile update) | 200 | `actual == 200` |
| 3 | HTTP Status (onboarding step) | 200 | `actual == 200` |
| 4 | `body.data.onboardingStep` (final read) | `"complete"` | `actual === "complete"` |
| 5 | `body.data.displayName` | `"AggregateTestUser"` | `actual === "AggregateTestUser"` |

---

## TC-ONB-BE-030: Generate and return X-Request-Id when the client omits it

### Objective
Verify request-correlation behavior for onboarding endpoints when the client does not provide a request ID.

### Preconditions
Endpoint available in normal health state.

### Precondition Setup
```bash
DEVICE_ID="device-$(uuidgen)"
```

### Test Execution
```bash
# Send GET /consent without X-Request-Id
curl -s -D - "$BASE_URL/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -w "\nBODY_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `200 OK`
- Response Header: `X-Request-Id` is present with a generated (non-null, non-empty) value
- Response Body: `body.requestId` matches the generated `X-Request-Id` header value

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 200 | `actual == 200` |
| 2 | `body.ok` | `true` | `actual === true` |
| 3 | `body.requestId` | non-null, non-empty | `actual !== null && actual !== ""` |
| 4 | `header.X-Request-Id` | present and non-empty | `actual !== null && actual !== ""` |

---

## TC-ONB-BE-031: Return a retryable transport contract on rate-limited onboarding requests

### Objective
Verify the onboarding API surfaces HTTP-level rate limiting consistently.

### Preconditions
Rate limiting can be triggered in QA or simulated.

### Precondition Setup
```bash
DEVICE_ID="device-$(uuidgen)"
```

### Test Execution
```bash
# Send a burst of write requests to trigger rate limiting
for i in $(seq 1 20); do
  REQ_ID="req-$(uuidgen)-burst-$i"
  curl -s -X PUT "$BASE_URL/consent" \
    -H "Content-Type: application/json" \
    -H "X-Device-Id: $DEVICE_ID" \
    -H "X-Request-Id: $REQ_ID" \
    -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
    -w "\nHTTP_STATUS:%{http_code}" &
done
wait
```

### Expected Result
- If rate limit is exceeded: `429 Too Many Requests`
- The response is clearly retryable from a transport perspective and does not corrupt persisted state
- Some requests may still succeed with `200 OK` if the limit has not been exceeded

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | All response statuses | 200 or 429 | `actual == 200` or `actual == 429` |
| 2 | Burst requests | no 5xx errors | `actual < 500` |

---

## TC-ONB-BE-032: Return SYSTEM_ERROR contract on representative backend failure

### Objective
Verify onboarding endpoints surface backend/runtime failures using the canonical server-error contract.

### Preconditions
Controlled backend dependency failure can be simulated.

### Precondition Setup
N/A — simulated backend dependency failure (requires test infrastructure to inject a failure).

### Test Execution
```bash
DEVICE_ID="device-$(uuidgen)"
REQ_ID="req-$(uuidgen)"
curl -s -X PUT "$BASE_URL/consent" \
  -H "Content-Type: application/json" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result
- HTTP Status: `500 Internal Server Error`
- Response Body:
  - `body.ok`: `false`
  - `body.error.code`: `"SYSTEM_ERROR"`
  - `body.error.message`: present but does not leak internal exception details
  - `body.requestId`: non-null
- Response Header: `X-Request-Id` is present

### Assertions to Verify
| # | Check | Expected | Pass Criteria |
|---|-------|----------|---------------|
| 1 | HTTP Status | 500 | `actual == 500` |
| 2 | `body.ok` | `false` | `actual === false` |
| 3 | `body.error.code` | `"SYSTEM_ERROR"` | `actual === "SYSTEM_ERROR"` |
| 4 | `body.requestId` | non-null | `actual !== null` |
| 5 | `header.X-Request-Id` | present | `actual !== null` |

---

=== Test Plan Complete ===
Total Test Cases: 32
