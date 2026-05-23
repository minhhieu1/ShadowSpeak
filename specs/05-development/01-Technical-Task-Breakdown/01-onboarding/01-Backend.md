# Epic 01 — Technical Task Breakdown: Onboarding (Backend)

## Document Metadata

| Field     | Value                                      |
| --------- | ------------------------------------------ |
| Project   | ShadowSpeak                                |
| Epic      | 01 — First-Time Onboarding and Access      |
| Type      | Technical Task Breakdown (Backend)         |
| Phase     | 05 - Development                           |
| Date      | 2026-05-16                                 |
| Status    | Draft                                      |
| Owner     | Solo Dev                                   |

## Purpose

Detailed breakdown of each backend task in Epic 01 linking user stories → API spec → LLD models → implementation files. Each task specifies exactly what to build, where to put it, and what to test.

## Existing Backend Structure

All backend code lives under `backend/app/` with a layer-based layout:

```
backend/app/
├── api/routes/       # FastAPI routers (profile.py, content.py, session.py, health.py)
├── core/             # Auth, config, errors, envelope, middleware
├── models/           # Pydantic models (auth.py, common.py, content.py, session.py)
├── repositories/     # Data access (memory.py for local dev)
├── services/         # Business logic (empty — to be created)
├── main.py           # FastAPI app creation + middleware registration
└── lambda_handler.py # AWS Lambda entry point
```

New code follows the same layer convention: **models → services → repositories → api/routes**.

**Frontend tasks** are tracked separately in `02-Frontend-Technical-Task-Breakdown.md`.

---

## 1.12 — Cognito JWT Verification Middleware

### Design References
- **LLD Backend**: Section 5.1 (JWT Validation Middleware), Section 2.1 (AuthMiddleware)
- **LLD Backend**: `JwtClaims`, `AuthContext` models (Section 2.1)
- **Existing file**: `backend/app/core/auth.py` (dev-auth stub), `backend/app/models/auth.py`

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.12.1 | `backend/app/core/auth.py` | `extract_bearer_token()` — parse `Authorization: Bearer <jwt>` header. Return token string or None. |
| 1.12.2 | `backend/app/core/auth.py` | `verify_cognito_jwt(token) -> JwtClaims` — download and cache Cognito JWKS, validate JWT (iss, aud, exp, signature, token_use=access), decode claims. Cache JWKS with TTL. |
| 1.12.3 | `backend/app/core/auth.py` | Update `get_auth_context()` to call `verify_cognito_jwt()` — replace dev-auth stub with real Cognito verification. Return `AuthContext` with `userId` (from `sub` claim). |
| 1.12.4 | `backend/app/core/auth.py` | `get_optional_auth_context()` — variant that does not reject unauthenticated requests. Returns `AuthContext \| None`. Used for pre-auth consent endpoints. |
| 1.12.5 | `backend/app/core/config.py` | Add Cognito settings: `cognito_user_pool_id`, `cognito_region`, `cognito_client_id`, `cognito_jwks_url`. |

### Existing Scaffold Notes

`backend/app/core/auth.py` currently has a dev-auth stub (`AuthContext`, `get_auth_context`). Tasks 1.12.1–1.12.3 upgrade this to real Cognito JWT verification. Task 1.12.4 adds a new `get_optional_auth_context` dependency.

### Acceptance

- Valid JWT → `AuthContext.userId` matches Cognito `sub` claim
- Expired JWT → 401 `AUTH_UNAUTHORIZED`
- Missing token on protected endpoint → 401
- Invalid signature → 401
- JWKS cached and refreshed on expiry
- `get_optional_auth_context()` returns None (not 401) when no token present

---

## 1.13 — GET/PUT /consent Endpoints

### Design References
- **API Spec**: Section 5.3 (`GET /consent`), Section 5.4 (`PUT /consent`)
- **LLD Backend**: `ConsentState` model (Section 1.2), `UpdateConsentInput` (Section 2.1), `ConsentServiceProtocol`
- **DB Design**: Entity mapping — `USER#<userId>#CONSENT` or `DEVICE#<deviceId>#CONSENT` for pre-auth
- **Existing file**: `backend/app/api/routes/profile.py` (stub with in-memory repo)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.13.1 | `backend/app/services/consent_service.py` | `ConsentService` — `get_consent()`, `save_consent()`, `validate_age_gate()`. Calls repository for DynamoDB reads/writes. |
| 1.13.2 | `backend/app/repositories/consent_repository.py` | `ConsentRepository` — DynamoDB `get_consent(PK, SK)`, `put_consent(item)`. Handles `USER#<userId>#CONSENT` and `DEVICE#<deviceId>#CONSENT` key patterns. **Populates `entityType` attribute on write.** |
| 1.13.3 | `backend/app/api/routes/profile.py` | Update existing `GET /consent` and `PUT /consent` to use `ConsentService`. Use `get_optional_auth_context()` for pre-auth support. Respect `X-Device-Id` header. |
| 1.13.4 | `backend/app/api/routes/profile.py` | Add `require_consent()` dependency — checks that `ageVerified=true` and `privacyAccepted=true` before allowing access. Returns 403 `CONSENT_REQUIRED` if consent is missing. |
| 1.13.5 | `backend/app/services/consent_service.py` | Emit `ConsentAuditLog` entry on every `save_consent()` call (see 1.17). |

### Validation Rules

- `ageVerified` must be true before account completion
- `privacyAccepted` must be true before onboarding can continue
- `adConsent` must be one of: `unknown`, `personalized`, `non_personalized`
- `locale` should be sourced from `Accept-Language` header when present, else default to `en-US`
- If `X-Device-Id` is absent during pre-auth request → 422 `VALIDATION_ERROR`
- Write `consentUpdatedAt` as server timestamp

### Acceptance

- `GET /consent` without auth + valid `X-Device-Id` → returns device-scoped consent state
- `GET /consent` with valid JWT → returns user-scoped consent state
- `PUT /consent` with invalid age gate → 422
- `PUT /consent` when both `ageVerified` and `privacyAccepted` are true → consent saved
- Consent writes persist to DynamoDB  with `entityType` attribute
- Each consent change writes an audit log entry
- `locale` is stored on consent record

---

## 1.14 — GET/PUT /me Profile Endpoints (with Consent Guard)

### Design References
- **API Spec**: Section 5.1 (`GET /me`), Section 5.2 (`PUT /me`) — **both can return `CONSENT_REQUIRED` 403**
- **LLD Backend**: `UserProfile`, `UpdateProfileInput` models (Section 2.1), `ProfileServiceProtocol`
- **DB Design**: `UserProfile` at `USER#<userId>#PROFILE`
- **Existing file**: `backend/app/api/routes/profile.py` (stub without consent check)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.14.1 | `backend/app/services/profile_service.py` | `ProfileService` — `get_profile()`, `update_profile()` with partial update semantics. |
| 1.14.2 | `backend/app/repositories/profile_repository.py` | `ProfileRepository` — DynamoDB `get_profile(userId)`, `put_profile(profile)`. Key: `USER#<userId>#PROFILE`. **Populates `entityType` attribute on write.** |
| 1.14.3 | `backend/app/api/routes/profile.py` | Update existing `GET /me` — add `require_consent()` dependency. Returns 403 `CONSENT_REQUIRED` if consent not given. |
| 1.14.4 | `backend/app/api/routes/profile.py` | Update existing `PUT /me` — add `require_consent()` dependency. |

### Consent Guard Wiring

`require_consent()` (created in 1.13.4) is injected as a FastAPI dependency on `GET /me` and `PUT /me`:

```python
@router.get("/me", response_model=JsonEnvelope[UserProfile])
def get_me(
    request: Request,
    auth: AuthContext = Depends(get_auth_context),
    _: None = Depends(require_consent),  # ← consent guard
) -> JsonEnvelope[UserProfile]:
    ...
```

### Re-key Integration Point

When an authenticated `GET /me` or `PUT /me` detects that consent exists in a `DEVICE#` bootstrap record but not yet in a `USER#` record, it triggers re-key (see 1.16). This is wired in `require_consent()` or called explicitly before the consent check.

### Validation Rules

- `displayName` must be trimmed and <= **80 chars** (matching existing model at `backend/app/models/auth.py`)
- `reminderTime` must match `HH:MM` format (24h) when present
- `level` must be one of: `beginner`, `intermediate`, `advanced`
- Omitted fields must remain unchanged (partial update via `model_copy` / exclude_none)
- `PUT /me` requires valid JWT

### Acceptance

- `GET /me` returns `UserProfile` for authenticated user
- `GET /me` without consent → 403 `CONSENT_REQUIRED`
- `PUT /me` with partial body updates only specified fields
- `PUT /me` without consent → 403 `CONSENT_REQUIRED`
- Invalid `reminderTime` format → 422
- Authenticated user accesses own profile only
- `displayName` truncated/padded at 80 chars

---

## 1.15 — Pre-auth Consent Bootstrap (X-Device-Id)

### Design References
- **API Spec**: Section 2.2 (auth notes), Section 5.3, 5.4 notes on pre-auth flow and `X-Device-Id`
- **DB Design**: Section 3 — transient `ConsentState` bootstrap at `DEVICE#<deviceId>#CONSENT` with **TTL** (24h)
- **Existing**: `backend/app/repositories/memory.py` (in-memory device_consents dict)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.15.1 | `backend/app/repositories/consent_repository.py` | Pre-auth consent write: store at `DEVICE#<deviceId>#CONSENT` with `ttlEpoch` = now + 24h. |
| 1.15.2 | `backend/app/repositories/consent_repository.py` | Pre-auth consent read: fetch from `DEVICE#<deviceId>#CONSENT`. |
| 1.15.3 | `backend/app/services/consent_service.py` | `get_or_create_device_consent(deviceId)` — read existing or return default (all false). |

### TTL Details

- Pre-auth bootstrap items must include `ttlEpoch` attribute (Unix epoch seconds = now + 86400)
- DynamoDB will auto-delete expired items; no purge code needed
- Post-re-key, the `DEVICE#` record is explicitly deleted (see 1.16)

### Acceptance

- `PUT /consent` without JWT + with `X-Device-Id` → writes to `DEVICE#<deviceId>#CONSENT`
- `GET /consent` without JWT + with `X-Device-Id` → reads from `DEVICE#<deviceId>#CONSENT`
- Bootstrap item gets 24h TTL (`ttlEpoch`)
- Missing `X-Device-Id` → 422
- Expired bootstrap items auto-purged by DynamoDB TTL

---

## 1.16 — Consent Re-key After Cognito Sign-in

### Design References
- **API Spec**: Section 5.4 notes — re-key from `X-Device-Id` to `userId`
- **DB Design**: Section 3 — `DEVICE#<deviceId>#CONSENT` → `USER#<userId>#CONSENT`
- **LLD Backend**: Section 7.1 (Onboarding Flow sequence diagram)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.16.1 | `backend/app/services/rekey_service.py` | `RekeyService.rekey_consent(userId, deviceId)` — copy consent from `DEVICE#<deviceId>#CONSENT` to `USER#<userId>#CONSENT`. Idempotent: if `USER#` consent already exists, skip. |
| 1.16.2 | `backend/app/services/rekey_service.py` | Delete the `DEVICE#<deviceId>#CONSENT` bootstrap record after successful re-key. |
| 1.16.3 | `backend/app/api/routes/profile.py` | Wire re-key trigger: on first authenticated `GET /me` or `PUT /me` after pre-auth consent, call `RekeyService.rekey_consent()`. Trigger is in `require_consent()` or `ProfileService.get_profile()`. |

### Trigger Strategy

Re-key is triggered implicitly on the first authenticated profile or consent request after pre-auth. The flow:

1. User completes age gate + consent pre-auth (stored at `DEVICE#<deviceId>#CONSENT`)
2. User signs in via Cognito (gets JWT)
3. First API call with JWT hits `GET /me` or `PUT /me`
4. `require_consent()` or `ProfileService` checks: does `USER#<userId>#CONSENT` exist?
5. If no: look up `DEVICE#<deviceId>#CONSENT` using device ID (stored client-side, sent as header)
6. Copy consent record, delete bootstrap, proceed

### Trigger Location Decision

For MVP, wire re-key in `ProfileService.get_profile()` — this keeps the trigger invisible to callers and ensures re-key happens on the first authenticated request regardless of which endpoint is hit.

### Acceptance

- Consent state preserved after re-key (same `ageVerified`, `privacyAccepted`, `adConsent`)
- `DEVICE#` bootstrap record removed after successful re-key
- Duplicate re-key is idempotent (re-checks `USER#` existence first)
- If no `DEVICE#` bootstrap exists, re-key is a no-op (user consented post-sign-in)
- Audit log entry written for re-key event

---

## 1.17 — Consent Audit Logging

### Design References
- **LLD Backend**: Section 5.4 — `ConsentAuditLog` model, Section 6.2 — structured logging format

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.17.1 | `backend/app/services/consent_service.py` | Write structured JSON audit log entry on every consent change (inline in `save_consent()`). |
| 1.17.2 | `backend/app/logging/audit.py` | `write_audit_log(entry)` helper — logs to CloudWatch via structured JSON. Uses `LogEntry` model from LLD Section 6.2. |

### Log Entry Shape

```json
{
  "eventType": "consent_update",
  "userId": "user-123",
  "ageVerified": true,
  "privacyAccepted": true,
  "adConsent": "personalized",
  "locale": "en-US",
  "timestamp": "2026-05-16T10:00:00Z",
  "requestId": "req-abc"
}
```

### Acceptance

- Every `PUT /consent` produces one audit log entry
- Audit logs contain no PII beyond userId
- Written to CloudWatch Logs via structured logging (JSON)
- Re-key events (1.16) also produce audit log entries

---

## 1.18 — DELETE /account (Soft-Delete)

### Design References
- **API Spec**: Section 5.5 — `DELETE /account`
- **LLD Backend**: Section 2.1 — Account Deletion Design, `DeleteAccountResult`
- **DB Design**: Section 8 — Account Deletion Design (tombstone with 30-day grace)
- **Existing**: `backend/app/api/routes/profile.py` (stub), `backend/app/repositories/memory.py` (stub)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.18.1 | `backend/app/services/profile_service.py` | `delete_account(userId) -> DeleteAccountResult` — set `deletionRequestedAt` + `deletionStatus = deletion_requested` on profile. |
| 1.18.2 | `backend/app/repositories/profile_repository.py` | `mark_deletion_requested(userId, requestedAt)` — update profile with tombstone fields, preserve profile data (no immediate delete). |
| 1.18.3 | `backend/app/api/routes/profile.py` | Update existing `DELETE /account` to return 202 Accepted + `DeleteAccountResult`. |

### Cascade Order (Async Purge — see 1.19)

The purge is NOT executed inline in 1.18. The endpoint only marks the account. Purge is a separate async job:

1. `DELETE /account` → sets `deletionRequestedAt` + `deletionStatus = deletion_requested` on profile
2. `GET /me` still returns profile during 30-day grace period (unless `deletionStatus = purged`)
3. Async purge job (1.19) handles cascade after grace period

### Acceptance

- `DELETE /account` → 202 + `DeleteAccountResult` with `purgeAfter`
- Profile shows `deletionStatus: deletion_requested` + `deletionRequestedAt`
- Subsequent `GET /me` returns profile during grace period (shows `deletionStatus: deletion_requested`)
- `GET /me` after `purgeAfter` → returns 404 or empty profile

---

## 1.19 — Async Purge Job (30-Day Grace)

### Design References
- **LLD Backend**: Section 2.1 — Account Deletion Design (cascade order)
- **DB Design**: Section 8 — Deletion lifecycle, profile tombstone TTL

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.19.1 | `backend/app/services/purge_service.py` | `PurgeService.purge_account(userId)` — cascade delete: consent → sessions (via GSI1) → sync queue → download grants → profile tombstone. |
| 1.19.2 | `backend/app/services/purge_service.py` | `PurgeService.find_expired_deletions()` — query profiles with `deletionStatus = deletion_requested` and `deletionRequestedAt + 30 days < now`. |
| 1.19.3 | `backend/app/services/purge_service.py` | `PurgeService.complete_purge(userId)` — set `deletionStatus = purged`, write final profile tombstone with TTL. |
| 1.19.4 | `backend/app/repositories/purge_repository.py` | DynamoDB batch delete operations for cascade. |
| 1.19.5 | `infra/purge_job.yml` or `infra/purge_job.ts` | Scheduled AWS EventBridge rule + Lambda invocation (daily trigger). |

### Cascade Delete Order

1. Query consent record → delete
2. Query session records via GSI1 (`gsi1pk = USER#<userId>`, `gsi1sk` starts with `SESSION#`) → batch delete
3. Query sync queue items (SK starts with `MUTATION#`) → batch delete
4. Query download grants (SK starts with `DOWNLOAD#`) → batch delete
5. Write profile tombstone: set `deletionStatus = purged`, update `updatedAt`, add `ttlEpoch` for eventual auto-cleanup

### Reactivation

If the user signs in during the 30-day grace period and has `deletionStatus = deletion_requested`, the app can offer to cancel deletion. If the user cancels, set `deletionStatus = active` and clear `deletionRequestedAt`. **Out of scope for MVP** — the purge proceeds regardless.

### Acceptance

- Scheduled purge job runs daily
- Accounts past 30-day grace period are fully cascaded
- Sessions, consent, sync queue, and download grants are deleted
- Profile is marked `purged` with TTL for eventual cleanup
- In-progress purge failure does not block other accounts (per-item error handling)

---

## 1.20 — Onboarding Progress State (US-7.2)

### Design References
- **User Story**: US-7.2 — Onboarding Abandonment and Partial Progress
- **API Spec**: Section 5.2 (`PUT /me`) — profile can store onboarding completion state

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.20.1 | `backend/app/models/auth.py` | Add `onboardingStep` field to `UserProfile`: `onboardingStep: str \| None`. Values: `null` (not started), `age_gate_done`, `consent_done`, `intro_done`, `level_selected`, `reminder_set`, `mic_permission_done`, `complete`. |
| 1.20.2 | `backend/app/services/profile_service.py` | `update_onboarding_step(userId, step)` — updates `onboardingStep` on profile. Called by client after each onboarding step completes. |
| 1.20.3 | `backend/app/api/routes/profile.py` | Add `PUT /me/onboarding-step` endpoint (authenticated): accepts `{ "step": "..." }`, updates `onboardingStep` on profile. |

### Step Values and Resume Logic (Client-Side)

| `onboardingStep` | Resume Action |
|---|---|
| `null` | Start from age gate |
| `age_gate_done` | Show consent screen |
| `consent_done` | Show sign-in |
| `intro_done` | Show level selection |
| `level_selected` | Show reminder setup |
| `reminder_set` | Show microphone permission |
| `mic_permission_done` | Show complete → Home |
| `complete` | Go directly to Home |

The client checks `GET /me` at launch. If the profile has `onboardingStep = complete` or the user has a valid JWT and profile fields are populated, the client skips onboarding.

### Acceptance

- `PUT /me/onboarding-step` saves step to profile
- `GET /me` returns current `onboardingStep`
- Invalid step value → 422
- Missing auth → 401

---

## Cross-cutting: FastAPI Project Scaffold + Middleware Chain (C.1)

### Design References
- **LLD Backend**: Section 3.1 — Middleware Chain (8 steps)
- **Existing**: `backend/app/main.py`, `backend/app/core/` (envelope, errors, config)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.1.1 | `backend/app/main.py` | FastAPI app creation, middleware registration (already scaffolded — verify middleware chain matches LLD Section 3.1) |
| C.1.2 | `backend/app/core/middleware.py` | Request ID middleware — move from inline middleware in main.py to dedicated module. Assign `X-Request-Id` (generate if missing). |
| C.1.3 | `backend/app/core/middleware.py` | Structured request logging middleware — log method, path, status, duration for each request. |
| C.1.4 | `backend/app/core/middleware.py` | Rate limiting middleware — per-user rate for writes, per-IP for pre-auth endpoints. |
| C.1.5 | `backend/app/core/deps.py` | FastAPI dependency injection module: `get_auth_context()`, `get_optional_auth_context()`, `require_consent()`. |
| C.1.6 | `backend/app/responses.py` | `success()`, `failure()` response helpers (already in `backend/app/core/envelope.py` — verify). |

### Middleware Chain Order

1. Request ID assignment (C.1.2)
2. Structured request logging (C.1.3)
3. JWT verification (via dependency injection)
4. Consent check (via dependency injection)
5. Input validation (FastAPI built-in via Pydantic)
6. Rate limiting (C.1.4)
7. Handler execution
8. Response formatting (via envelope)

---

## Cross-cutting: Cognito User Pool Setup (C.4)

### Design References
- **LLD Backend**: Technology Stack table

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.4.1 | `infra/cognito.py` or `infra/cognito.yml` | Cognito user pool: email/password auth, Google OIDC provider, Apple OIDC provider. |
| C.4.2 | `infra/cognito.py` | App client config: OAuth2/PKCE, no client secret (public client), callback URLs for mobile. |
| C.4.3 | `infra/cognito.py` | Pre-sign-up Lambda trigger — auto-confirm users for MVP (skip email verification). |

### Pre-Sign-Up Trigger Note

For MVP, configure a Cognito pre-sign-up trigger Lambda that auto-confirms new users. This avoids requiring email verification during onboarding while still allowing Cognito to manage the user lifecycle. If stronger email validation is needed later, this trigger can be removed.

### Acceptance

- User pool created with email/password and Google/Apple providers
- App client configured with PKCE, no client secret
- Users can sign up and receive tokens immediately (auto-confirmed)
- JWKS endpoint accessible at `https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json`

---

## Cross-cutting: DynamoDB GSI Attribute Population

### Design Reference
- **DB Design**: Section 3 — Entity-to-DynamoDB mapping (GSI attributes per entity)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| DB.1 | `backend/app/repositories/consent_repository.py` | Populate `entityType` on every consent write. |
| DB.2 | `backend/app/repositories/profile_repository.py` | Populate `entityType` on every profile write. |
| DB.3 | `backend/app/repositories/session_repository.py` | Populate `gsi1pk = USER#<userId>`, `gsi1sk = SESSION#<startedAt>`, `entityType`, `ttlEpoch` on every session write. |
| DB.4 | Content module (Epic 02) | Populate `gsi2pk = LESSONCAT#<level>#PUBLISHED`, `gsi2sk = <topic>#<updatedAt>`, `entityType` on every lesson write. |

### GSI Attribute Summary

| Entity | `entityType` | GSI Attributes |
|--------|-------------|----------------|
| `ConsentState` | `consent` | — |
| `UserProfile` | `profile` | — |
| `PracticeSession` | `session` | `gsi1pk = USER#<userId>`, `gsi1sk = SESSION#<startedAt>`, `ttlEpoch` |
| `Lesson` | `lesson` | `gsi2pk = LESSONCAT#<level>#PUBLISHED`, `gsi2sk = <topic>#<updatedAt>` |
| `SyncQueueItem` | `sync_queue` | `ttlEpoch?` |
| `DownloadGrant` | `download_grant` | `ttlEpoch` |

---

## Testing Tasks

### Design Reference
- **LLD Backend**: Section 8 — Testing Strategy

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| T.1 | `tests/test_auth.py` | Unit tests: `extract_bearer_token()`, JWT validation with mock JWKS, expired/ invalid/missing token scenarios. |
| T.2 | `tests/test_consent.py` | Unit tests: consent validation, age gate rules, partial updates, pre-auth vs. authenticated flows. |
| T.3 | `tests/test_consent.py` | Integration test: consent write → read round-trip with DynamoDB (local emulator). |
| T.4 | `tests/test_profile.py` | Unit tests: profile CRUD, partial update semantics, `displayName` trimming/length, `reminderTime` format validation. |
| T.5 | `tests/test_profile.py` | Integration test: `require_consent()` returns 403 when consent missing, returns 200 when consent present. |
| T.6 | `tests/test_rekey.py` | Unit tests: re-key copies consent, deletes bootstrap, idempotent on duplicate call. |
| T.7 | `tests/test_account_deletion.py` | Unit tests: soft-delete sets tombstone fields, `GET /me` during grace period. |
| T.8 | `tests/test_purge.py` | Integration test: purge cascade removes all user data, partial failure handling. |
| T.9 | `tests/test_onboarding_progress.py` | Unit tests: `onboardingStep` valid values, `PUT /me/onboarding-step` state transitions. |
| T.10 | `tests/test_middleware.py` | Integration tests: request ID assignment, rate limiting, structured logging output. |

### Mock Strategy

- Mock Cognito JWKS endpoint for unit tests (use `moto` or manual JWK generation)
- Use `dynamodb-local` or `moto` for DynamoDB repository tests
- Freeze time with `freezegun` for TTL and timestamp assertions
- Each test file should use `pytest-asyncio` where async is needed

---

## Task Dependency Graph

```
C.1 (FastAPI Scaffold)
├── 1.12 (JWT Middleware) ◄── C.4 (Cognito Pool)
│     ├── 1.13 (Consent Endpoints)
│     │     ├── 1.15 (Pre-auth Bootstrap)
│     │     │     └── 1.16 (Consent Re-key) ◄── 1.14
│     │     └── 1.17 (Audit Logging)
│     ├── 1.14 (Profile Endpoints)
│     │     ├── 1.18 (Delete Account)
│     │     │     └── 1.19 (Async Purge Job)
│     │     └── 1.20 (Onboarding Progress)
│     └── DB.1–DB.4 (GSI Attributes) ◄── all repo tasks
└── T.1–T.10 (Testing) ◄── all implementation tasks
```

### Suggested Build Order

| Step | Tasks | Result |
|------|-------|--------|
| 1 | C.1 (scaffold) + C.4 (Cognito) | Deployable backend with auth |
| 2 | 1.12 (JWT middleware) + DB.1–DB.2 | Auth context working |
| 3 | 1.13 + 1.15 + 1.17 (consent) | Pre-auth and authenticated consent |
| 4 | 1.14 + 1.16 (profile + re-key) | Full profile with consent guard + re-key |
| 5 | 1.18 + 1.19 (account deletion) | Account lifecycle complete |
| 6 | 1.20 (onboarding progress) | US-7.2 support |
| 7 | T.1–T.10 (testing) | All tests passing |

---

## Revision History

| Version | Date       | Author   | Description |
|---------|-----------|----------|-------------|
| 1.0     | 2026-05-16 | Solo Dev | Initial technical task breakdown for Epic 01 backend |
| 1.1     | 2026-05-16 | Solo Dev | Audit fix: align file paths with layer-based structure, add consent guard, re-key trigger, onboarding progress state, async purge job, GSI attributes, testing tasks, TTL/locale handling, document renamed to backend-only |
