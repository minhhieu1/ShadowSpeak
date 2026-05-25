# Backend/API Test Plan — Epic 01 First-Time Onboarding and Access

## Document Metadata

| Field        | Value                                                                         |
| ------------ | ----------------------------------------------------------------------------- |
| Project      | ShadowSpeak                                                                   |
| Epic         | 01 — First-Time Onboarding and Access                                         |
| Phase        | 06 - Testing                                                                  |
| Type         | Backend/API Test Plan                                                         |
| Version      | 1.0                                                                           |
| Date         | 2026-05-24                                                                    |
| Status       | Draft                                                                         |
| Owner        | QA                                                                            |
| Derived From | `specs/06-testing/02-Test-Case-Specification/01-onboarding/01-Backend-API.md` |

## Base Configuration

- **Base URL**: `http://127.0.0.1:8000`
- **Response Envelope**: `JsonEnvelope<T>` with `requestId`, `ok`, `data`, `error`
- **Error Conventions**: `ok=false`, `error.code` populated on failure

---

## Global Precondition: Auth Token

For any test case requiring authentication, obtain a JWT access token first. Use the **keycloak-auth** skill to get a test token for the `shadowspeak` realm, then export it:

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
# (Invoke the skill directly in your test runner/execution environment)
# The skill will return a JWT access token. Export it as:
AUTH_TOKEN="<token-from-keycloak-auth-skill>"
```

**Expected Precondition Result:** `AUTH_TOKEN` is a non-empty JWT string.

---

## Consent API — Pre-auth

### TC-ONB-BE-001: Read existing device-scoped consent state with valid X-Device-Id

### Objective

Verify anonymous onboarding clients can read an already persisted device-scoped consent record.

### Preconditions

No JWT; a device-scoped consent record already exists for the device.

### Precondition Setup

```bash
# Seed a device-scoped consent record first
DEVICE_ID="device-$(uuidgen)"
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en-US" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; consent record is created for `DEVICE_ID`.

### Test Execution

```bash
REQ_ID="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.requestId`: matches `REQ_ID`
  - `body.data.userId`: device-scoped (matches `DEVICE_ID` or device-derived ID)
  - `body.data.ageVerified`: `true`
  - `body.data.privacyAccepted`: `true`
  - `body.data.adConsent`: `"unknown"`
  - `body.error`: `null`
- Response Header: `X-Request-Id` matches `REQ_ID`

### Assertions to Verify

| #   | Check                       | Expected       | Actual | Pass Criteria          |
| --- | --------------------------- | -------------- | ------ | ---------------------- |
| 1   | HTTP Status                 | 200            |        | `actual == 200`        |
| 2   | `body.ok`                   | `true`         |        | `actual === true`      |
| 3   | `body.requestId`            | matches REQ_ID |        | `actual === "$REQ_ID"` |
| 4   | `header.X-Request-Id`       | matches REQ_ID |        | `actual === "$REQ_ID"` |
| 5   | `body.data.ageVerified`     | `true`         |        | `actual === true`      |
| 6   | `body.data.privacyAccepted` | `true`         |        | `actual === true`      |
| 7   | `body.data.adConsent`       | `"unknown"`    |        | `actual === "unknown"` |
| 8   | `body.data.userId`          | device-scoped  |        | `actual !== null`      |
| 9   | `body.error`                | `null`         |        | `actual === null`      |

### Status: WAITING

---

### TC-ONB-BE-001A: Read default device-scoped consent state for a brand-new X-Device-Id

### Objective

Verify anonymous onboarding clients receive a default all-false consent state on first read for a new device.

### Preconditions

No JWT; no consent record exists for the device.

### Precondition Setup

N/A — no seed data needed; the test reads from a brand-new device ID.

### Test Execution

```bash
DEVICE_ID="device-$(uuidgen)"
REQ_ID="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.requestId`: matches `REQ_ID`
  - `body.data.userId`: device-scoped
  - `body.data.ageVerified`: `false`
  - `body.data.privacyAccepted`: `false`
  - `body.data.adConsent`: `"unknown"`
  - `body.error`: `null`

### Assertions to Verify

| #   | Check                       | Expected       | Actual | Pass Criteria          |
| --- | --------------------------- | -------------- | ------ | ---------------------- |
| 1   | HTTP Status                 | 200            |        | `actual == 200`        |
| 2   | `body.ok`                   | `true`         |        | `actual === true`      |
| 3   | `body.requestId`            | matches REQ_ID |        | `actual === "$REQ_ID"` |
| 4   | `body.data.ageVerified`     | `false`        |        | `actual === false`     |
| 5   | `body.data.privacyAccepted` | `false`        |        | `actual === false`     |
| 6   | `body.data.adConsent`       | `"unknown"`    |        | `actual === "unknown"` |
| 7   | `body.data.userId`          | device-scoped  |        | `actual !== null`      |
| 8   | `body.error`                | `null`         |        | `actual === null`      |

### Status: WAITING

---

### TC-ONB-BE-002: Save valid pre-auth consent and persist locale and TTL

### Objective

Verify valid anonymous consent writes persist to the bootstrap device record with required metadata.

### Preconditions

No JWT; valid device ID available.

### Precondition Setup

N/A — consent record will be created by the test itself.

### Test Execution

```bash
DEVICE_ID="device-$(uuidgen)"
REQ_ID="req-$(uuidgen)"
# Step 1: Write consent
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID" \
  -H "Content-Type: application/json" \
  -H "Accept-Language: fr-FR" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 2: Read consent for same device
REQ_ID_2="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_2" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status (Write): `200 OK`
- HTTP Status (Read): `200 OK`
- Response Body (Read):
  - `body.ok`: `true`
  - `body.data.ageVerified`: `true`
  - `body.data.privacyAccepted`: `true`
  - `body.data.adConsent`: `"unknown"`
  - `body.data.locale`: `"fr-FR"`
  - `body.data.consentUpdatedAt`: present (non-null timestamp)
- DB metadata (if inspectable): record stored at `DEVICE#<deviceId>#CONSENT`; `ttlEpoch` persisted

### Assertions to Verify

| #   | Check                        | Expected    | Actual | Pass Criteria          |
| --- | ---------------------------- | ----------- | ------ | ---------------------- |
| 1   | HTTP Status (Write)          | 200         |        | `actual == 200`        |
| 2   | `body.ok` (Write)            | `true`      |        | `actual === true`      |
| 3   | HTTP Status (Read)           | 200         |        | `actual == 200`        |
| 4   | `body.ok` (Read)             | `true`      |        | `actual === true`      |
| 5   | `body.data.ageVerified`      | `true`      |        | `actual === true`      |
| 6   | `body.data.privacyAccepted`  | `true`      |        | `actual === true`      |
| 7   | `body.data.adConsent`        | `"unknown"` |        | `actual === "unknown"` |
| 8   | `body.data.locale`           | `"fr-FR"`   |        | `actual === "fr-FR"`   |
| 9   | `body.data.consentUpdatedAt` | present     |        | `actual !== null`      |
| 10  | `body.error` (Read)          | `null`      |        | `actual === null`      |

### Status: WAITING

---

### TC-ONB-BE-003: Default locale to en-US when Accept-Language is absent

### Objective

Verify anonymous consent writes use `en-US` as locale fallback.

### Preconditions

No JWT; valid device ID available.

### Precondition Setup

N/A

### Test Execution

```bash
DEVICE_ID="device-$(uuidgen)"
REQ_ID="req-$(uuidgen)"
# Step 1: Write consent without Accept-Language
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 2: Read consent for same device
REQ_ID_2="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_2" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status (Write): `200 OK`
- HTTP Status (Read): `200 OK`
- Response Body (Read): `body.data.locale` is `"en-US"`

### Assertions to Verify

| #   | Check                       | Expected    | Actual | Pass Criteria          |
| --- | --------------------------- | ----------- | ------ | ---------------------- |
| 1   | HTTP Status (Write)         | 200         |        | `actual == 200`        |
| 2   | `body.ok` (Write)           | `true`      |        | `actual === true`      |
| 3   | HTTP Status (Read)          | 200         |        | `actual == 200`        |
| 4   | `body.data.locale`          | `"en-US"`   |        | `actual === "en-US"`   |
| 5   | `body.data.ageVerified`     | `true`      |        | `actual === true`      |
| 6   | `body.data.privacyAccepted` | `true`      |        | `actual === true`      |
| 7   | `body.data.adConsent`       | `"unknown"` |        | `actual === "unknown"` |
| 8   | `body.error` (Read)         | `null`      |        | `actual === null`      |

### Status: WAITING

---

### TC-ONB-BE-004: Reject pre-auth consent requests without X-Device-Id

### Objective

Verify anonymous consent reads and writes fail validation without device identification.

### Preconditions

No JWT.

### Precondition Setup

N/A

### Test Execution

```bash
REQ_ID_GET="req-$(uuidgen)"
# GET without X-Device-Id
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "X-Request-Id: $REQ_ID_GET" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

REQ_ID_PUT="req-$(uuidgen)"
# PUT without X-Device-Id
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "X-Request-Id: $REQ_ID_PUT" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status (GET): `422`
- HTTP Status (PUT): `422`
- Response Body (both):
  - `body.ok`: `false`
  - `body.error.code`: `"VALIDATION_ERROR"`
  - `body.data`: `null`
- No consent record is created for the absent device ID

### Assertions to Verify

| #   | Check                   | Expected             | Actual | Pass Criteria                   |
| --- | ----------------------- | -------------------- | ------ | ------------------------------- |
| 1   | HTTP Status (GET)       | 422                  |        | `actual == 422`                 |
| 2   | `body.ok` (GET)         | `false`              |        | `actual === false`              |
| 3   | `body.error.code` (GET) | `"VALIDATION_ERROR"` |        | `actual === "VALIDATION_ERROR"` |
| 4   | `body.requestId` (GET)  | matches REQ_ID_GET   |        | `actual === "$REQ_ID_GET"`      |
| 5   | HTTP Status (PUT)       | 422                  |        | `actual == 422`                 |
| 6   | `body.ok` (PUT)         | `false`              |        | `actual === false`              |
| 7   | `body.error.code` (PUT) | `"VALIDATION_ERROR"` |        | `actual === "VALIDATION_ERROR"` |
| 8   | `body.requestId` (PUT)  | matches REQ_ID_PUT   |        | `actual === "$REQ_ID_PUT"`      |

### Status: WAITING

---

### TC-ONB-BE-005: Reject invalid adConsent value for pre-auth consent

### Objective

Verify allowed consent enum values are enforced.

### Preconditions

No JWT; valid device ID available.

### Precondition Setup

N/A

### Test Execution

```bash
DEVICE_ID="device-$(uuidgen)"
REQ_ID="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "invalid_value"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Confirm no invalid state was persisted
REQ_ID_READ="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_READ" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status (PUT): `422`
- Response Body (PUT):
  - `body.ok`: `false`
  - `body.error.code`: `"VALIDATION_ERROR"`
- GET returns either default all-false consent or the previously valid state — no `"invalid_value"` is persisted

### Assertions to Verify

| #   | Check                       | Expected              | Actual | Pass Criteria                   |
| --- | --------------------------- | --------------------- | ------ | ------------------------------- |
| 1   | HTTP Status (PUT)           | 422                   |        | `actual == 422`                 |
| 2   | `body.ok` (PUT)             | `false`               |        | `actual === false`              |
| 3   | `body.error.code` (PUT)     | `"VALIDATION_ERROR"`  |        | `actual === "VALIDATION_ERROR"` |
| 4   | `body.requestId` (PUT)      | matches REQ_ID        |        | `actual === "$REQ_ID"`          |
| 5   | `body.data` (PUT)           | `null`                |        | `actual === null`               |
| 6   | `body.data.adConsent` (GET) | NOT `"invalid_value"` |        | `actual !== "invalid_value"`    |

### Status: WAITING

---

### TC-ONB-BE-006: Reject incomplete or invalid age-gate consent payload

### Objective

Verify invalid onboarding consent payloads fail without partial writes.

### Preconditions

No JWT; valid device ID available.

### Precondition Setup

N/A

### Test Execution

```bash
DEVICE_ID="device-$(uuidgen)"
REQ_ID="req-$(uuidgen)"
# Missing required fields (ageVerified, privacyAccepted)
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID" \
  -H "Content-Type: application/json" \
  -d '{"adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Confirm no partial state was persisted
REQ_ID_READ="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_READ" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status (PUT): `422`
- Response Body (PUT):
  - `body.ok`: `false`
  - `body.error.code`: `"VALIDATION_ERROR"`
- GET returns default all-false consent — no partial/invalid state persisted

### Assertions to Verify

| #   | Check                             | Expected             | Actual | Pass Criteria                   |
| --- | --------------------------------- | -------------------- | ------ | ------------------------------- |
| 1   | HTTP Status (PUT)                 | 422                  |        | `actual == 422`                 |
| 2   | `body.ok` (PUT)                   | `false`              |        | `actual === false`              |
| 3   | `body.error.code` (PUT)           | `"VALIDATION_ERROR"` |        | `actual === "VALIDATION_ERROR"` |
| 4   | `body.requestId` (PUT)            | matches REQ_ID       |        | `actual === "$REQ_ID"`          |
| 5   | `body.data` (PUT)                 | `null`               |        | `actual === null`               |
| 6   | HTTP Status (GET)                 | 200                  |        | `actual == 200`                 |
| 7   | `body.data.ageVerified` (GET)     | `false`              |        | `actual === false`              |
| 8   | `body.data.privacyAccepted` (GET) | `false`              |        | `actual === false`              |

### Status: WAITING

---

## Consent API — Authenticated

### TC-ONB-BE-007: Read user-scoped consent with valid JWT

### Objective

Verify authenticated consent reads use the authenticated identity rather than device scope.

### Preconditions

Valid JWT; user-scoped consent exists.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
# Export the returned token as AUTH_TOKEN
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure user-scoped consent exists for this user
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; user-scoped consent is saved.

### Test Execution

```bash
REQ_ID="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status: `200 OK`
- Response Body:
  - `body.ok`: `true`
  - `body.requestId`: matches `REQ_ID`
  - `body.data.userId`: matches JWT `sub`
  - `body.data.ageVerified`: `true`
  - `body.data.privacyAccepted`: `true`
  - `body.data.adConsent`: `"personalized"`
  - `body.error`: `null`
- Missing `X-Device-Id` does not fail authenticated request

### Assertions to Verify

| #   | Check                       | Expected          | Actual | Pass Criteria               |
| --- | --------------------------- | ----------------- | ------ | --------------------------- |
| 1   | HTTP Status                 | 200               |        | `actual == 200`             |
| 2   | `body.ok`                   | `true`            |        | `actual === true`           |
| 3   | `body.requestId`            | matches REQ_ID    |        | `actual === "$REQ_ID"`      |
| 4   | `header.X-Request-Id`       | matches REQ_ID    |        | `actual === "$REQ_ID"`      |
| 5   | `body.data.userId`          | matches JWT `sub` |        | `actual !== null`           |
| 6   | `body.data.ageVerified`     | `true`            |        | `actual === true`           |
| 7   | `body.data.privacyAccepted` | `true`            |        | `actual === true`           |
| 8   | `body.data.adConsent`       | `"personalized"`  |        | `actual === "personalized"` |
| 9   | `body.error`                | `null`            |        | `actual === null`           |

### Status: WAITING

---

### TC-ONB-BE-008: Update user-scoped consent with valid JWT

### Objective

Verify authenticated consent writes persist to the canonical user consent record.

### Preconditions

Valid JWT for an existing user.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"
```

**Expected Precondition Result:** `AUTH_TOKEN` is a non-empty JWT string.

### Test Execution

```bash
REQ_ID="req-$(uuidgen)"
# Step 1: Write authenticated consent
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en-GB" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "non_personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 2: Read authenticated consent
REQ_ID_2="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_2" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status (Write): `200 OK`
- HTTP Status (Read): `200 OK`
- Response Body (Read):
  - `body.ok`: `true`
  - `body.data.userId`: matches JWT `sub`
  - `body.data.locale`: `"en-GB"`
  - `body.data.consentUpdatedAt`: present (non-null timestamp)
- DB: record stored at `USER#<userId>#CONSENT`; `entityType` present

### Assertions to Verify

| #   | Check                        | Expected             | Actual | Pass Criteria                   |
| --- | ---------------------------- | -------------------- | ------ | ------------------------------- |
| 1   | HTTP Status (Write)          | 200                  |        | `actual == 200`                 |
| 2   | `body.ok` (Write)            | `true`               |        | `actual === true`               |
| 3   | `body.requestId` (Write)     | matches REQ_ID       |        | `actual === "$REQ_ID"`          |
| 4   | HTTP Status (Read)           | 200                  |        | `actual == 200`                 |
| 5   | `body.data.userId`           | matches JWT `sub`    |        | `actual !== null`               |
| 6   | `body.data.locale`           | `"en-GB"`            |        | `actual === "en-GB"`            |
| 7   | `body.data.consentUpdatedAt` | present              |        | `actual !== null`               |
| 8   | `body.data.ageVerified`      | `true`               |        | `actual === true`               |
| 9   | `body.data.privacyAccepted`  | `true`               |        | `actual === true`               |
| 10  | `body.data.adConsent`        | `"non_personalized"` |        | `actual === "non_personalized"` |
| 11  | `body.error` (Read)          | `null`               |        | `actual === null`               |

### Status: WAITING

---

### TC-ONB-BE-008A: Ignore mismatched X-Device-Id during authenticated consent read

### Objective

Verify authenticated consent lookup remains bound to JWT identity even when a different device ID is supplied.

### Preconditions

Valid JWT for user-scoped consent; mismatched device-scoped consent may exist for another device.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure user-scoped consent exists
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; user-scoped consent is saved.

### Test Execution

```bash
REQ_ID="req-$(uuidgen)"
MISMATCH_DEVICE="device-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Device-Id: $MISMATCH_DEVICE" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status: `200 OK`
- `body.data.userId` matches JWT `sub` (not the mismatched device ID)
- Consent values returned are from `USER#<userId>#CONSENT`
- No new device-scoped record is created as a side effect

### Assertions to Verify

| #   | Check              | Expected               | Actual | Pass Criteria                   |
| --- | ------------------ | ---------------------- | ------ | ------------------------------- |
| 1   | HTTP Status        | 200                    |        | `actual == 200`                 |
| 2   | `body.ok`          | `true`                 |        | `actual === true`               |
| 3   | `body.data.userId` | matches JWT `sub`      |        | `actual === <jwt-sub>`          |
| 4   | `body.data.userId` | NOT `$MISMATCH_DEVICE` |        | `actual !== "$MISMATCH_DEVICE"` |
| 5   | `body.error`       | `null`                 |        | `actual === null`               |

### Status: WAITING

---

## Consent Re-key and Audit

### TC-ONB-BE-009: Re-key bootstrap device consent to user consent on first authenticated request

### Objective

Verify consent is migrated from device scope to user scope after authentication.

### Preconditions

Existing device-scoped consent; valid JWT; no existing user-scoped consent for the same user.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Save pre-auth consent for a device
DEVICE_ID="device-$(uuidgen)"
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Content-Type: application/json" \
  -H "Accept-Language: fr-FR" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; device-scoped consent saved.

### Test Execution

```bash
# Step 1: Call GET /me with JWT + device ID to trigger re-key
REQ_ID="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 2: Read authenticated consent — should return re-keyed user-scoped consent
REQ_ID_2="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_2" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 3: Read device-scoped consent — should return default (device record was deleted)
REQ_ID_3="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_3" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status (GET /me): `200 OK`
- HTTP Status (authenticated GET /consent): `200 OK`
  - `body.data.userId` matches JWT `sub`
  - Consent values preserved from bootstrap: `ageVerified=true`, `privacyAccepted=true`, `adConsent="personalized"`, `locale="fr-FR"`, `consentUpdatedAt` present
- HTTP Status (device-scoped GET /consent): `200 OK`
  - Device returns default all-false consent (bootstrap record deleted)

### Assertions to Verify

| #   | Check                                  | Expected         | Actual | Pass Criteria               |
| --- | -------------------------------------- | ---------------- | ------ | --------------------------- |
| 1   | HTTP Status (GET /me)                  | 200              |        | `actual == 200`             |
| 2   | HTTP Status (Auth GET /consent)        | 200              |        | `actual == 200`             |
| 3   | `body.data.userId` (Auth GET /consent) | matches JWT sub  |        | `actual === <jwt-sub>`      |
| 4   | `body.data.ageVerified` (Auth)         | `true`           |        | `actual === true`           |
| 5   | `body.data.privacyAccepted` (Auth)     | `true`           |        | `actual === true`           |
| 6   | `body.data.adConsent` (Auth)           | `"personalized"` |        | `actual === "personalized"` |
| 7   | `body.data.locale` (Auth)              | `"fr-FR"`        |        | `actual === "fr-FR"`        |
| 8   | HTTP Status (Device GET /consent)      | 200              |        | `actual == 200`             |
| 9   | `body.data.ageVerified` (Device)       | `false`          |        | `actual === false`          |

### Status: WAITING

---

### TC-ONB-BE-010: Re-key remains idempotent when user-scoped consent already exists

### Objective

Verify duplicate re-key attempts do not overwrite or duplicate canonical consent.

### Preconditions

Existing user-scoped consent; valid JWT; optional stale device-scoped record.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Seed user-scoped consent
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "non_personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; user-scoped consent exists.

### Test Execution

```bash
DEVICE_ID="device-$(uuidgen)"

# First call triggering re-key
REQ_ID_1="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_1" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Second call — should be idempotent
REQ_ID_2="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_2" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Verify user-scoped consent is stable
REQ_ID_3="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_3" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- Both `GET /me` calls return `200 OK`
- Authenticated `GET /consent` returns user-scoped consent with original values unchanged (`adConsent="non_personalized"`)
- No duplicate canonical record or conflicting state

### Assertions to Verify

| #   | Check                      | Expected                        | Actual | Pass Criteria                   |
| --- | -------------------------- | ------------------------------- | ------ | ------------------------------- |
| 1   | HTTP Status (1st call)     | 200                             |        | `actual == 200`                 |
| 2   | HTTP Status (2nd call)     | 200                             |        | `actual == 200`                 |
| 3   | HTTP Status (GET /consent) | 200                             |        | `actual == 200`                 |
| 4   | `body.data.adConsent`      | `"non_personalized"`            |        | `actual === "non_personalized"` |
| 5   | `body.data.userId`         | matches JWT sub                 |        | `actual === <jwt-sub>`          |
| 6   | `body.data.locale`         | `"en-US"` (or whatever default) |        | `actual !== null`               |

### Status: WAITING

---

### TC-ONB-BE-011: Re-key is a no-op when no bootstrap device consent exists

### Objective

Verify authenticated flows do not fail when the user consented post-sign-in and no device bootstrap exists.

### Preconditions

Valid JWT; no `DEVICE#<deviceId>#CONSENT` record exists.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"
```

**Expected Precondition Result:** `AUTH_TOKEN` is a non-empty JWT string.

### Test Execution

```bash
REQ_ID="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status: `200 OK` (or `404 USER_NOT_FOUND` if profile does not exist — either is acceptable as long as re-key doesn't cause failure)
- No error related to re-key
- User consent state remains correct
- No unexpected device-scoped record is created

### Assertions to Verify

| #   | Check             | Expected                             | Actual | Pass Criteria               |
| --- | ----------------- | ------------------------------------ | ------ | --------------------------- |
| 1   | HTTP Status       | not 500                              |        | `actual != 500`             |
| 2   | `body.ok`         | `true` or `false` with expected code |        | `actual !== null`           |
| 3   | No `SYSTEM_ERROR` | not `SYSTEM_ERROR`                   |        | `actual !== "SYSTEM_ERROR"` |

### Status: WAITING

---

### TC-ONB-BE-012: Emit audit log on consent updates and re-key events

### Objective

Verify consent changes and consent migration are auditable.

### Preconditions

Structured audit logs are accessible.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Seed pre-auth device consent
DEVICE_ID="device-$(uuidgen)"
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; device-scoped consent saved.

### Test Execution

```bash
# Step 1: Direct consent update
REQ_ID_1="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_1" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 2: Trigger re-key by calling GET /me with JWT + device ID
REQ_ID_2="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_2" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- Both requests succeed (`200 OK`)
- A structured audit entry exists for the consent update (request `REQ_ID_1`) and for the re-key event (request `REQ_ID_2`)
- Audit entries contain request correlation data and no extra PII

### Assertions to Verify

| #   | Check                           | Expected | Actual | Pass Criteria     |
| --- | ------------------------------- | -------- | ------ | ----------------- |
| 1   | HTTP Status (Consent Update)    | 200      |        | `actual == 200`   |
| 2   | HTTP Status (Re-key GET /me)    | 200      |        | `actual == 200`   |
| 3   | Audit entry exists for REQ_ID_1 | exists   |        | `actual !== null` |
| 4   | Audit entry exists for REQ_ID_2 | exists   |        | `actual !== null` |

### Status: WAITING

---

## JWT and Consent Guard

### TC-ONB-BE-013: Reject protected onboarding endpoints without JWT

### Objective

Verify protected profile and onboarding-progress endpoints enforce authentication.

### Preconditions

None.

### Precondition Setup

N/A

### Test Execution

```bash
REQ_ID_1="req-$(uuidgen)"
# GET /me without JWT
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "X-Request-Id: $REQ_ID_1" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

REQ_ID_2="req-$(uuidgen)"
# PUT /me without JWT
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "X-Request-Id: $REQ_ID_2" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Test User"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

REQ_ID_3="req-$(uuidgen)"
# PUT /me/onboarding-step without JWT
curl -s -X PUT "http://127.0.0.1:8000/me/onboarding-step" \
  -H "X-Request-Id: $REQ_ID_3" \
  -H "Content-Type: application/json" \
  -d '{"step": "intro_done"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- Each request returns `401 AUTH_UNAUTHORIZED`
- Failure envelope and `X-Request-Id` are present
- No state mutation occurs

### Assertions to Verify

| #   | Check                                       | Expected              | Actual | Pass Criteria                    |
| --- | ------------------------------------------- | --------------------- | ------ | -------------------------------- |
| 1   | HTTP Status (GET /me)                       | 401                   |        | `actual == 401`                  |
| 2   | `body.error.code` (GET /me)                 | `"AUTH_UNAUTHORIZED"` |        | `actual === "AUTH_UNAUTHORIZED"` |
| 3   | `body.requestId` (GET /me)                  | matches REQ_ID_1      |        | `actual === "$REQ_ID_1"`         |
| 4   | HTTP Status (PUT /me)                       | 401                   |        | `actual == 401`                  |
| 5   | `body.error.code` (PUT /me)                 | `"AUTH_UNAUTHORIZED"` |        | `actual === "AUTH_UNAUTHORIZED"` |
| 6   | `body.requestId` (PUT /me)                  | matches REQ_ID_2      |        | `actual === "$REQ_ID_2"`         |
| 7   | HTTP Status (PUT /me/onboarding-step)       | 401                   |        | `actual == 401`                  |
| 8   | `body.error.code` (PUT /me/onboarding-step) | `"AUTH_UNAUTHORIZED"` |        | `actual === "AUTH_UNAUTHORIZED"` |
| 9   | `body.requestId` (onboarding-step)          | matches REQ_ID_3      |        | `actual === "$REQ_ID_3"`         |

### Status: WAITING

---

### TC-ONB-BE-014: Reject protected onboarding endpoints with expired JWT

### Objective

Verify expired tokens cannot read or write protected onboarding state.

### Preconditions

Expired JWT available.

### Precondition Setup

```bash
# Obtain an access token first, then use a known-expired token for the test
# Replace EXPIRED_JWT with a token that is past its expiry
EXPIRED_JWT="<insert-expired-jwt-here>"
```

**Expected Precondition Result:** `EXPIRED_JWT` is set to a token whose `exp` claim is in the past.

### Test Execution

```bash
REQ_ID_1="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $EXPIRED_JWT" \
  -H "X-Request-Id: $REQ_ID_1" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

REQ_ID_2="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $EXPIRED_JWT" \
  -H "X-Request-Id: $REQ_ID_2" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Test User"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

REQ_ID_3="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me/onboarding-step" \
  -H "Authorization: Bearer $EXPIRED_JWT" \
  -H "X-Request-Id: $REQ_ID_3" \
  -H "Content-Type: application/json" \
  -d '{"step": "intro_done"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- Each request returns `401 AUTH_UNAUTHORIZED`
- No state mutation occurs

### Assertions to Verify

| #   | Check                                 | Expected              | Actual | Pass Criteria                    |
| --- | ------------------------------------- | --------------------- | ------ | -------------------------------- |
| 1   | HTTP Status (GET /me)                 | 401                   |        | `actual == 401`                  |
| 2   | `body.error.code` (GET /me)           | `"AUTH_UNAUTHORIZED"` |        | `actual === "AUTH_UNAUTHORIZED"` |
| 3   | `body.requestId` (GET /me)            | matches REQ_ID_1      |        | `actual === "$REQ_ID_1"`         |
| 4   | HTTP Status (PUT /me)                 | 401                   |        | `actual == 401`                  |
| 5   | `body.error.code` (PUT /me)           | `"AUTH_UNAUTHORIZED"` |        | `actual === "AUTH_UNAUTHORIZED"` |
| 6   | HTTP Status (PUT /me/onboarding-step) | 401                   |        | `actual == 401`                  |
| 7   | `body.error.code` (onboarding-step)   | `"AUTH_UNAUTHORIZED"` |        | `actual === "AUTH_UNAUTHORIZED"` |

### Status: WAITING

---

### TC-ONB-BE-015: Reject protected onboarding endpoints with invalid JWT signature

### Objective

Verify invalid-signature tokens are rejected.

### Preconditions

Invalid-signature JWT available.

### Precondition Setup

```bash
# Generate or obtain a JWT with an invalid signature
INVALID_SIG_JWT="<insert-invalid-signature-jwt-here>"
```

**Expected Precondition Result:** `INVALID_SIG_JWT` is set to a JWT with a signature that does not match the server's expected signing key.

### Test Execution

```bash
REQ_ID_1="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $INVALID_SIG_JWT" \
  -H "X-Request-Id: $REQ_ID_1" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

REQ_ID_2="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $INVALID_SIG_JWT" \
  -H "X-Request-Id: $REQ_ID_2" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Test User"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

REQ_ID_3="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me/onboarding-step" \
  -H "Authorization: Bearer $INVALID_SIG_JWT" \
  -H "X-Request-Id: $REQ_ID_3" \
  -H "Content-Type: application/json" \
  -d '{"step": "intro_done"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- Each request returns `401 AUTH_UNAUTHORIZED`
- No protected data is disclosed
- No profile or onboarding-progress state changes are persisted

### Assertions to Verify

| #   | Check                                 | Expected              | Actual | Pass Criteria                    |
| --- | ------------------------------------- | --------------------- | ------ | -------------------------------- |
| 1   | HTTP Status (GET /me)                 | 401                   |        | `actual == 401`                  |
| 2   | `body.error.code` (GET /me)           | `"AUTH_UNAUTHORIZED"` |        | `actual === "AUTH_UNAUTHORIZED"` |
| 3   | `body.requestId` (GET /me)            | matches REQ_ID_1      |        | `actual === "$REQ_ID_1"`         |
| 4   | HTTP Status (PUT /me)                 | 401                   |        | `actual == 401`                  |
| 5   | `body.error.code` (PUT /me)           | `"AUTH_UNAUTHORIZED"` |        | `actual === "AUTH_UNAUTHORIZED"` |
| 6   | HTTP Status (PUT /me/onboarding-step) | 401                   |        | `actual == 401`                  |
| 7   | `body.error.code` (onboarding-step)   | `"AUTH_UNAUTHORIZED"` |        | `actual === "AUTH_UNAUTHORIZED"` |

### Status: WAITING

---

### TC-ONB-BE-016: Block profile endpoints until required consent is complete

### Objective

Verify consent guard blocks profile reads and writes when onboarding consent is incomplete.

### Preconditions

Valid JWT; missing or incomplete consent.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for a user with INCOMPLETE consent
# The skill should provide a token for a user whose ageVerified/privacyAccepted is not set
AUTH_TOKEN="<token-from-keycloak-auth-skill-for-user-with-incomplete-consent>"
```

**Expected Precondition Result:** `AUTH_TOKEN` is a non-empty JWT string for a user whose consent is not yet complete.

### Test Execution

```bash
REQ_ID_1="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_1" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

REQ_ID_2="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_2" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Test User"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- Both requests return `403 CONSENT_REQUIRED`
- Failure envelope and `X-Request-Id` are present
- Profile remains unchanged

### Assertions to Verify

| #   | Check                       | Expected             | Actual | Pass Criteria                   |
| --- | --------------------------- | -------------------- | ------ | ------------------------------- |
| 1   | HTTP Status (GET /me)       | 403                  |        | `actual == 403`                 |
| 2   | `body.error.code` (GET /me) | `"CONSENT_REQUIRED"` |        | `actual === "CONSENT_REQUIRED"` |
| 3   | `body.requestId` (GET /me)  | matches REQ_ID_1     |        | `actual === "$REQ_ID_1"`        |
| 4   | HTTP Status (PUT /me)       | 403                  |        | `actual == 403`                 |
| 5   | `body.error.code` (PUT /me) | `"CONSENT_REQUIRED"` |        | `actual === "CONSENT_REQUIRED"` |
| 6   | `body.requestId` (PUT /me)  | matches REQ_ID_2     |        | `actual === "$REQ_ID_2"`        |

### Status: WAITING

---

## Profile API

### TC-ONB-BE-017: Return authenticated user's profile from GET /me

### Objective

Verify profile reads are bound to the authenticated JWT subject.

### Preconditions

Valid JWT; consent complete; profile exists.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure user-scoped consent is complete
REQ_ID_CONSENT="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_CONSENT" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Ensure profile exists
REQ_ID_PROFILE="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_PROFILE" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Test-User-'"$(uuidgen | head -c8)"'", "level": "intermediate"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** Both requests return `200 OK`; profile exists for the user.

### Test Execution

```bash
REQ_ID="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status: `200 OK`
- `body.ok`: `true`
- `body.data.userId` matches JWT `sub`
- Returned profile belongs only to the authenticated user
- `body.error`: `null`

### Assertions to Verify

| #   | Check                   | Expected          | Actual | Pass Criteria          |
| --- | ----------------------- | ----------------- | ------ | ---------------------- |
| 1   | HTTP Status             | 200               |        | `actual == 200`        |
| 2   | `body.ok`               | `true`            |        | `actual === true`      |
| 3   | `body.requestId`        | matches REQ_ID    |        | `actual === "$REQ_ID"` |
| 4   | `header.X-Request-Id`   | matches REQ_ID    |        | `actual === "$REQ_ID"` |
| 5   | `body.data.userId`      | matches JWT `sub` |        | `actual === <jwt-sub>` |
| 6   | `body.data.displayName` | present           |        | `actual !== null`      |
| 7   | `body.error`            | `null`            |        | `actual === null`      |

### Status: WAITING

---

### TC-ONB-BE-018: Return USER_NOT_FOUND when profile does not exist on GET /me

### Objective

Verify missing profile rows are reported with the canonical error.

### Preconditions

Valid JWT; consent complete; no profile row exists for JWT `sub`.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for a user WITHOUT a profile
AUTH_TOKEN="<token-from-keycloak-auth-skill-for-user-without-profile>"

# Ensure consent is complete
REQ_ID_CONSENT="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_CONSENT" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; consent is set but no profile exists.

### Test Execution

```bash
REQ_ID="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status: `404`
- `body.ok`: `false`
- `body.error.code`: `"USER_NOT_FOUND"`
- Failure envelope and `X-Request-Id` are present

### Assertions to Verify

| #   | Check             | Expected           | Actual | Pass Criteria                 |
| --- | ----------------- | ------------------ | ------ | ----------------------------- |
| 1   | HTTP Status       | 404                |        | `actual == 404`               |
| 2   | `body.ok`         | `false`            |        | `actual === false`            |
| 3   | `body.error.code` | `"USER_NOT_FOUND"` |        | `actual === "USER_NOT_FOUND"` |
| 4   | `body.requestId`  | matches REQ_ID     |        | `actual === "$REQ_ID"`        |
| 5   | `body.data`       | `null`             |        | `actual === null`             |

### Status: WAITING

---

### TC-ONB-BE-019: Apply partial PUT /me update without clearing omitted fields

### Objective

Verify partial update semantics for the profile endpoint.

### Preconditions

Valid JWT; consent complete; profile exists with `level` and `reminderTime` already populated.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent is complete
REQ_ID_CONSENT="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_CONSENT" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Seed profile with initial values
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Initial-'"$(uuidgen | head -c8)"'", "level": "beginner", "reminderTime": "08:00"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; profile exists with `level=beginner` and `reminderTime="08:00"`.

### Test Execution

```bash
# Step 1: Read current profile
REQ_ID_READ="req-$(uuidgen)-read"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_READ" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 2: Update only level
REQ_ID_UPDATE="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_UPDATE" \
  -H "Content-Type: application/json" \
  -d '{"level": "advanced"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 3: Read profile again
REQ_ID_READ2="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_READ2" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status (Read): `200 OK`
- HTTP Status (Update): `200 OK`
- After update:
  - `body.data.level` is `"advanced"`
  - `body.data.displayName` remains unchanged (same as initial read)
  - `body.data.reminderTime` remains `"08:00"` (unchanged)
  - Omitted fields are not cleared

### Assertions to Verify

| #   | Check                            | Expected        | Actual | Pass Criteria                      |
| --- | -------------------------------- | --------------- | ------ | ---------------------------------- |
| 1   | HTTP Status (Update)             | 200             |        | `actual == 200`                    |
| 2   | `body.ok` (Update)               | `true`          |        | `actual === true`                  |
| 3   | `body.data.level` (After)        | `"advanced"`    |        | `actual === "advanced"`            |
| 4   | `body.data.reminderTime` (After) | `"08:00"`       |        | `actual === "08:00"`               |
| 5   | `body.data.displayName` (After)  | same as initial |        | `actual === <initial-displayName>` |
| 6   | `body.error` (After)             | `null`          |        | `actual === null`                  |

### Status: WAITING

---

### TC-ONB-BE-020: Return USER_NOT_FOUND when profile does not exist on PUT /me

### Objective

Verify missing profile rows are reported consistently during updates.

### Preconditions

Valid JWT; consent complete; no profile row exists for JWT `sub`.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for a user WITHOUT a profile
AUTH_TOKEN="<token-from-keycloak-auth-skill-for-user-without-profile>"

# Ensure consent is complete
REQ_ID_CONSENT="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_CONSENT" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; consent set, no profile exists.

### Test Execution

```bash
REQ_ID="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "New-User-'"$(uuidgen | head -c8)"'", "level": "beginner"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status: `404`
- `body.ok`: `false`
- `body.error.code`: `"USER_NOT_FOUND"`
- No profile row is created implicitly

### Assertions to Verify

| #   | Check             | Expected           | Actual | Pass Criteria                 |
| --- | ----------------- | ------------------ | ------ | ----------------------------- |
| 1   | HTTP Status       | 404                |        | `actual == 404`               |
| 2   | `body.ok`         | `false`            |        | `actual === false`            |
| 3   | `body.error.code` | `"USER_NOT_FOUND"` |        | `actual === "USER_NOT_FOUND"` |
| 4   | `body.requestId`  | matches REQ_ID     |        | `actual === "$REQ_ID"`        |
| 5   | `body.data`       | `null`             |        | `actual === null`             |

### Status: WAITING

---

### TC-ONB-BE-021: Trim leading and trailing whitespace from displayName

### Objective

Verify `displayName` normalization during profile updates.

### Preconditions

Valid JWT; consent complete; profile exists.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent is complete
REQ_ID_CONSENT="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_CONSENT" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Seed profile
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Seed-'"$(uuidgen | head -c8)"'", "level": "beginner"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; consent and profile exist.

### Test Execution

```bash
# Update with whitespace-padded displayName
REQ_ID_UPDATE="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_UPDATE" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "  Alex  "}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Read profile to verify trimming
REQ_ID_READ="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_READ" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status (Update): `200 OK`
- HTTP Status (Read): `200 OK`
- Persisted `displayName` is `"Alex"` (trimmed, no leading/trailing spaces)

### Assertions to Verify

| #   | Check                          | Expected         | Actual | Pass Criteria           |
| --- | ------------------------------ | ---------------- | ------ | ----------------------- |
| 1   | HTTP Status (Update)           | 200              |        | `actual == 200`         |
| 2   | `body.ok` (Update)             | `true`           |        | `actual === true`       |
| 3   | `body.data.displayName` (Read) | `"Alex"`         |        | `actual === "Alex"`     |
| 4   | `body.data.displayName`        | NOT `"  Alex  "` |        | `actual !== "  Alex  "` |

### Status: WAITING

---

### TC-ONB-BE-022: Enforce 80-character boundary for displayName

### Objective

Verify profile updates never persist a `displayName` longer than 80 characters.

### Preconditions

Valid JWT; consent complete; profile exists.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent is complete
REQ_ID_CONSENT="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_CONSENT" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Seed profile
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Seed-'"$(uuidgen | head -c8)"'", "level": "beginner"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; consent and profile exist.

### Test Execution

```bash
# displayName exactly 81 characters
OVER_LONG_NAME="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
REQ_ID_UPDATE="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_UPDATE" \
  -H "Content-Type: application/json" \
  -d "{\"displayName\": \"$OVER_LONG_NAME\"}" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Verify no over-length displayName was persisted
REQ_ID_READ="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_READ" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status (Update): `422`
- `body.ok`: `false`
- `body.error.code`: `"VALIDATION_ERROR"`
- Persisted `displayName` is not longer than 80 characters

### Assertions to Verify

| #   | Check                          | Expected              | Actual | Pass Criteria                   |
| --- | ------------------------------ | --------------------- | ------ | ------------------------------- |
| 1   | HTTP Status (Update)           | 422                   |        | `actual == 422`                 |
| 2   | `body.ok` (Update)             | `false`               |        | `actual === false`              |
| 3   | `body.error.code` (Update)     | `"VALIDATION_ERROR"`  |        | `actual === "VALIDATION_ERROR"` |
| 4   | `body.requestId` (Update)      | matches REQ_ID_UPDATE |        | `actual === "$REQ_ID_UPDATE"`   |
| 5   | `body.data.displayName` (Read) | length <= 80          |        | `actual.length <= 80`           |

### Status: WAITING

---

### TC-ONB-BE-023: Reject invalid level value on PUT /me

### Objective

Verify `level` enum validation.

### Preconditions

Valid JWT; consent complete; profile exists.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent is complete
REQ_ID_CONSENT="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_CONSENT" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Seed profile with known level
REQ_ID_SEED="req-$(uuidgen)-seed"
SEED_NAME="Seed-$(uuidgen | head -c8)"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Content-Type: application/json" \
  -d "{\"displayName\": \"$SEED_NAME\", \"level\": \"beginner\"}" \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; consent and profile exist with `level=beginner`.

### Test Execution

```bash
REQ_ID_UPDATE="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_UPDATE" \
  -H "Content-Type: application/json" \
  -d '{"level": "expert"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Read profile to verify level was NOT updated
REQ_ID_READ="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_READ" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status (Update): `422`
- `body.ok`: `false`
- `body.error.code`: `"VALIDATION_ERROR"`
- Profile `level` remains `"beginner"` (unchanged)

### Assertions to Verify

| #   | Check                      | Expected             | Actual | Pass Criteria                   |
| --- | -------------------------- | -------------------- | ------ | ------------------------------- |
| 1   | HTTP Status (Update)       | 422                  |        | `actual == 422`                 |
| 2   | `body.ok` (Update)         | `false`              |        | `actual === false`              |
| 3   | `body.error.code` (Update) | `"VALIDATION_ERROR"` |        | `actual === "VALIDATION_ERROR"` |
| 4   | `body.data.level` (Read)   | `"beginner"`         |        | `actual === "beginner"`         |
| 5   | `body.data.level` (Read)   | NOT `"expert"`       |        | `actual !== "expert"`           |

### Status: WAITING

---

### TC-ONB-BE-024: Reject invalid reminderTime format on PUT /me

### Objective

Verify `HH:MM` validation.

### Preconditions

Valid JWT; consent complete; profile exists.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent is complete
REQ_ID_CONSENT="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_CONSENT" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Seed profile
REQ_ID_SEED="req-$(uuidgen)-seed"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_SEED" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Seed-'"$(uuidgen | head -c8)"'", "level": "beginner", "reminderTime": "08:00"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; consent and profile exist with `reminderTime="08:00"`.

### Test Execution

```bash
REQ_ID_UPDATE="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_UPDATE" \
  -H "Content-Type: application/json" \
  -d '{"reminderTime": "25:99"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status: `422`
- `body.ok`: `false`
- `body.error.code`: `"VALIDATION_ERROR"`
- `reminderTime` remains `"08:00"` (unchanged)

### Assertions to Verify

| #   | Check                         | Expected               | Actual | Pass Criteria                   |
| --- | ----------------------------- | ---------------------- | ------ | ------------------------------- |
| 1   | HTTP Status                   | 422                    |        | `actual == 422`                 |
| 2   | `body.ok`                     | `false`                |        | `actual === false`              |
| 3   | `body.error.code`             | `"VALIDATION_ERROR"`   |        | `actual === "VALIDATION_ERROR"` |
| 4   | `body.requestId`              | matches REQ_ID_UPDATE  |        | `actual === "$REQ_ID_UPDATE"`   |
| 5   | Invalid `25:99` not persisted | original value remains |        | `actual !== "25:99"`            |

### Status: WAITING

---

### TC-ONB-BE-025: Confirm own-profile semantics are derived from JWT sub

### Objective

Verify the caller cannot use any client-supplied identifier to access another user's profile.

### Preconditions

Separate profiles exist for two users.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get test tokens for TWO different users
# User A
AUTH_TOKEN_USER_A="<token-for-user-A-from-keycloak-auth-skill>"
# User B
AUTH_TOKEN_USER_B="<token-for-user-B-from-keycloak-auth-skill>"

# Ensure user A has consent and profile
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN_USER_A" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN_USER_A" \
  -H "Content-Type: application/json" \
  -d "{\"displayName\": \"User-A-$(uuidgen | head -c8)\", \"level\": \"intermediate\"}" \
  -w "\nHTTP_STATUS:%{http_code}"

# Ensure user B has consent and profile
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN_USER_B" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN_USER_B" \
  -H "Content-Type: application/json" \
  -d "{\"displayName\": \"User-B-$(uuidgen | head -c8)\", \"level\": \"advanced\"}" \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** Two distinct users with profiles exist.

### Test Execution

```bash
REQ_ID="req-$(uuidgen)"
# Only user A's profile should be returned — there is no way to request user B's profile
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN_USER_A" \
  -H "X-Request-Id: $REQ_ID" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status: `200 OK`
- `body.data.userId` matches user A's JWT `sub`
- User B's profile is never exposed through this endpoint

### Assertions to Verify

| #   | Check                   | Expected                 | Actual | Pass Criteria               |
| --- | ----------------------- | ------------------------ | ------ | --------------------------- |
| 1   | HTTP Status             | 200                      |        | `actual == 200`             |
| 2   | `body.ok`               | `true`                   |        | `actual === true`           |
| 3   | `body.data.userId`      | matches user A's JWT sub |        | `actual === <user-A-sub>`   |
| 4   | `body.data.userId`      | NOT user B's sub         |        | `actual !== <user-B-sub>`   |
| 5   | `body.data.displayName` | starts with "User-A-"    |        | `actual matches /^User-A-/` |

### Status: WAITING

---

## Onboarding Progress API

### TC-ONB-BE-026: Persist all valid onboarding-step enum values

### Objective

Verify every allowed onboarding-step value is accepted.

### Preconditions

Valid JWT; consent complete; profile exists.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent is complete
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Ensure profile exists
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"displayName\": \"Seed-$(uuidgen | head -c8)\", \"level\": \"beginner\"}" \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; consent and profile exist.

### Test Execution

```bash
STEPS=("age_gate_done" "consent_done" "intro_done" "level_selected" "reminder_set" "mic_permission_done" "complete")

for STEP in "${STEPS[@]}"; do
  echo "--- Testing step: $STEP ---"
  REQ_ID="req-$(uuidgen)"
  curl -s -X PUT "http://127.0.0.1:8000/me/onboarding-step" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "X-Request-Id: $REQ_ID" \
    -H "Content-Type: application/json" \
    -d "{\"step\": \"$STEP\"}" \
    -w "\nHTTP_STATUS:%{http_code}"

  echo ""

  # Verify after each write
  REQ_ID_READ="req-$(uuidgen)"
  curl -s -X GET "http://127.0.0.1:8000/me" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "X-Request-Id: $REQ_ID_READ" \
    -w "\nHTTP_STATUS:%{http_code}"
  echo ""
done
```

### Expected Result

- Each `PUT /me/onboarding-step` returns `200 OK`
- After each write, `GET /me` returns the matching `onboardingStep`
- All 7 enum values are accepted and persisted

### Assertions to Verify

| #   | Check                                                    | Expected                | Actual | Pass Criteria                      |
| --- | -------------------------------------------------------- | ----------------------- | ------ | ---------------------------------- |
| 1   | HTTP Status (each PUT)                                   | 200                     |        | `actual == 200`                    |
| 2   | `body.ok` (each PUT)                                     | `true`                  |        | `actual === true`                  |
| 3   | `body.data.onboardingStep` (after `age_gate_done`)       | `"age_gate_done"`       |        | `actual === "age_gate_done"`       |
| 4   | `body.data.onboardingStep` (after `consent_done`)        | `"consent_done"`        |        | `actual === "consent_done"`        |
| 5   | `body.data.onboardingStep` (after `intro_done`)          | `"intro_done"`          |        | `actual === "intro_done"`          |
| 6   | `body.data.onboardingStep` (after `level_selected`)      | `"level_selected"`      |        | `actual === "level_selected"`      |
| 7   | `body.data.onboardingStep` (after `reminder_set`)        | `"reminder_set"`        |        | `actual === "reminder_set"`        |
| 8   | `body.data.onboardingStep` (after `mic_permission_done`) | `"mic_permission_done"` |        | `actual === "mic_permission_done"` |
| 9   | `body.data.onboardingStep` (after `complete`)            | `"complete"`            |        | `actual === "complete"`            |

### Status: WAITING

---

### TC-ONB-BE-027: Reject invalid onboarding-step value

### Objective

Verify only allowed onboarding-step values are accepted.

### Preconditions

Valid JWT; consent complete; profile exists.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"

# Ensure consent is complete
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "personalized"}' \
  -w "\nHTTP_STATUS:%{http_code}"

# Ensure profile exists with an initial onboarding step
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"displayName\": \"Seed-$(uuidgen | head -c8)\", \"level\": \"beginner\"}" \
  -w "\nHTTP_STATUS:%{http_code}"

# Set a known safe initial step
curl -s -X PUT "http://127.0.0.1:8000/me/onboarding-step" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"step": "age_gate_done"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

**Expected Precondition Result:** HTTP status `200 OK`; profile exists with `onboardingStep="age_gate_done"`.

### Test Execution

```bash
REQ_ID="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me/onboarding-step" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID" \
  -H "Content-Type: application/json" \
  -d '{"step": "foobar"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Verify previous step value is unchanged
REQ_ID_READ="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_READ" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status (PUT): `422`
- `body.ok`: `false`
- `body.error.code`: `"VALIDATION_ERROR"`
- Previously stored `onboardingStep` remains `"age_gate_done"`

### Assertions to Verify

| #   | Check                             | Expected             | Actual | Pass Criteria                   |
| --- | --------------------------------- | -------------------- | ------ | ------------------------------- |
| 1   | HTTP Status (PUT)                 | 422                  |        | `actual == 422`                 |
| 2   | `body.ok` (PUT)                   | `false`              |        | `actual === false`              |
| 3   | `body.error.code` (PUT)           | `"VALIDATION_ERROR"` |        | `actual === "VALIDATION_ERROR"` |
| 4   | `body.requestId` (PUT)            | matches REQ_ID       |        | `actual === "$REQ_ID"`          |
| 5   | `body.data.onboardingStep` (Read) | `"age_gate_done"`    |        | `actual === "age_gate_done"`    |
| 6   | `body.data.onboardingStep` (Read) | NOT `"foobar"`       |        | `actual !== "foobar"`           |

### Status: WAITING

---

### TC-ONB-BE-028: Reject onboarding-step updates without JWT

### Objective

Verify onboarding-progress endpoint requires authentication.

### Preconditions

None.

### Precondition Setup

N/A

### Test Execution

```bash
REQ_ID="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me/onboarding-step" \
  -H "X-Request-Id: $REQ_ID" \
  -H "Content-Type: application/json" \
  -d '{"step": "intro_done"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status: `401`
- `body.ok`: `false`
- `body.error.code`: `"AUTH_UNAUTHORIZED"`
- Failure envelope and `X-Request-Id` are present

### Assertions to Verify

| #   | Check             | Expected              | Actual | Pass Criteria                    |
| --- | ----------------- | --------------------- | ------ | -------------------------------- |
| 1   | HTTP Status       | 401                   |        | `actual == 401`                  |
| 2   | `body.ok`         | `false`               |        | `actual === false`               |
| 3   | `body.error.code` | `"AUTH_UNAUTHORIZED"` |        | `actual === "AUTH_UNAUTHORIZED"` |
| 4   | `body.requestId`  | matches REQ_ID        |        | `actual === "$REQ_ID"`           |
| 5   | `body.data`       | `null`                |        | `actual === null`                |

### Status: WAITING

---

## Aggregate Persistence Verification

### TC-ONB-BE-029: Verify aggregate onboarding persistence across consent, profile, and progress writes

### Objective

Verify all major onboarding backend writes create the expected persisted state and metadata.

### Preconditions

DB inspection access; new onboarding test user journey.

### Precondition Setup

```bash
# Use the keycloak-auth skill to get a test token for the shadowspeak realm
AUTH_TOKEN="<token-from-keycloak-auth-skill>"
```

**Expected Precondition Result:** `AUTH_TOKEN` is a non-empty JWT string.

### Test Execution

```bash
# Step 1: Save pre-auth consent with locale
DEVICE_ID="device-$(uuidgen)"
REQ_ID_1="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_1" \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en-US" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 2: Authenticate and trigger re-key (via GET /me)
REQ_ID_2="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Device-Id: $DEVICE_ID" \
  -H "X-Request-Id: $REQ_ID_2" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 3: Save displayName, level, reminderTime
REQ_ID_3="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_3" \
  -H "Content-Type: application/json" \
  -d "{\"displayName\": \"Aggr-$(uuidgen | head -c8)\", \"level\": \"advanced\", \"reminderTime\": \"19:30\"}" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 4: Save onboardingStep
REQ_ID_4="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/me/onboarding-step" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_4" \
  -H "Content-Type: application/json" \
  -d '{"step": "complete"}' \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 5: Read full profile to verify aggregate state
REQ_ID_5="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/me" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_5" \
  -w "\nHTTP_STATUS:%{http_code}"

echo "---"

# Step 6: Read consent state
REQ_ID_6="req-$(uuidgen)"
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "X-Request-Id: $REQ_ID_6" \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- All requests return `200 OK`
- Consent record: `entityType` present, `locale="en-US"`, `consentUpdatedAt` present
- Profile record: `displayName`, `level`, `reminderTime`, `onboardingStep` all persisted correctly
- `entityType` is present where required
- `onboardingStep` is `"complete"`

### Assertions to Verify

| #   | Check                                  | Expected     | Actual | Pass Criteria           |
| --- | -------------------------------------- | ------------ | ------ | ----------------------- |
| 1   | HTTP Status (all requests)             | 200          |        | `actual == 200`         |
| 2   | `body.data.level` (Profile)            | `"advanced"` |        | `actual === "advanced"` |
| 3   | `body.data.reminderTime` (Profile)     | `"19:30"`    |        | `actual === "19:30"`    |
| 4   | `body.data.onboardingStep` (Profile)   | `"complete"` |        | `actual === "complete"` |
| 5   | `body.data.ageVerified` (Consent)      | `true`       |        | `actual === true`       |
| 6   | `body.data.privacyAccepted` (Consent)  | `true`       |        | `actual === true`       |
| 7   | `body.data.locale` (Consent)           | `"en-US"`    |        | `actual === "en-US"`    |
| 8   | `body.data.consentUpdatedAt` (Consent) | present      |        | `actual !== null`       |

### Status: WAITING

---

## Middleware and Failure Contract

### TC-ONB-BE-030: Generate and return X-Request-Id when the client omits it

### Objective

Verify request-correlation behavior for onboarding endpoints when the client does not provide a request ID.

### Preconditions

Endpoint available in normal health state.

### Precondition Setup

N/A

### Test Execution

```bash
curl -s -X GET "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: device-$(uuidgen)" \
  -D - \
  -o /dev/null
```

### Expected Result

- HTTP Status: `200 OK`
- Response header `X-Request-Id` is present and non-empty
- Envelope `requestId` matches the response header value

### Assertions to Verify

| #   | Check                 | Expected                      | Actual | Pass Criteria                          |
| --- | --------------------- | ----------------------------- | ------ | -------------------------------------- |
| 1   | HTTP Status           | 200                           |        | `actual == 200`                        |
| 2   | `body.ok`             | `true`                        |        | `actual === true`                      |
| 3   | `header.X-Request-Id` | present and non-empty         |        | `actual !== null && actual.length > 0` |
| 4   | `body.requestId`      | matches `header.X-Request-Id` |        | `actual === <header-value>`            |

### Status: WAITING

---

### TC-ONB-BE-031: Return a retryable transport contract on rate-limited onboarding requests

### Objective

Verify the onboarding API surfaces HTTP-level rate limiting consistently.

### Preconditions

Rate limiting can be triggered in QA or simulated.

### Precondition Setup

```bash
DEVICE_ID="device-$(uuidgen)"
```

**Expected Precondition Result:** Device ID generated.

### Test Execution

```bash
# Burst of repeated writes to trigger rate limiting
for i in $(seq 1 50); do
  REQ_ID="req-$(uuidgen)"
  HTTP_STATUS=$(curl -s -X PUT "http://127.0.0.1:8000/consent" \
    -H "X-Device-Id: $DEVICE_ID" \
    -H "X-Request-Id: $REQ_ID" \
    -H "Content-Type: application/json" \
    -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
    -w "%{http_code}" \
    -o /dev/null)
  if [ "$HTTP_STATUS" = "429" ]; then
    echo "Rate limited after $i requests"
    break
  fi
done
```

### Expected Result

- After exceeding the threshold, endpoint returns `429 Too Many Requests`
- The response is retryable from a transport perspective
- No persisted state corruption

### Assertions to Verify

| #   | Check                    | Expected  | Actual | Pass Criteria     |
| --- | ------------------------ | --------- | ------ | ----------------- |
| 1   | Rate-limited HTTP Status | 429       |        | `actual == 429`   |
| 2   | Response is retryable    | non-empty |        | `actual !== null` |

### Status: WAITING

---

### TC-ONB-BE-032: Return SYSTEM_ERROR contract on representative backend failure

### Objective

Verify onboarding endpoints surface backend/runtime failures using the canonical server-error contract.

### Preconditions

Controlled backend dependency failure can be simulated.

### Precondition Setup

N/A — requires a controlled test environment where backend dependencies can be made to fail.

### Test Execution

```bash
# Simulate a backend dependency failure (e.g., database unavailable)
# Then send a valid request
REQ_ID="req-$(uuidgen)"
curl -s -X PUT "http://127.0.0.1:8000/consent" \
  -H "X-Device-Id: device-$(uuidgen)" \
  -H "X-Request-Id: $REQ_ID" \
  -H "Content-Type: application/json" \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "unknown"}' \
  -w "\nHTTP_STATUS:%{http_code}"
```

### Expected Result

- HTTP Status: `500`
- `body.ok`: `false`
- `body.error.code`: `"SYSTEM_ERROR"`
- Failure envelope conventions are followed
- Error does not leak internal exception details

### Assertions to Verify

| #   | Check                | Expected                | Actual | Pass Criteria               |
| --- | -------------------- | ----------------------- | ------ | --------------------------- |
| 1   | HTTP Status          | 500                     |        | `actual == 500`             |
| 2   | `body.ok`            | `false`                 |        | `actual === false`          |
| 3   | `body.error.code`    | `"SYSTEM_ERROR"`        |        | `actual === "SYSTEM_ERROR"` |
| 4   | `body.error.message` | present, no stack trace |        | `actual !== null`           |
| 5   | `body.error.message` | does not leak internals |        | check manually              |
| 6   | `body.requestId`     | matches REQ_ID          |        | `actual === "$REQ_ID"`      |

### Status: WAITING

---

=== Test Plan Complete ===
Total Test Cases: 32
