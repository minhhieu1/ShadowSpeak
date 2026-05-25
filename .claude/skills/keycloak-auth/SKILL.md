---
name: keycloak-auth
description: >
  Keycloak authentication & OIDC management for the ShadowSpeak project.
  Use this skill for any Keycloak task: create/manage OIDC clients and their protocol mappers (audience, roles, claims);
  create/search/manage users and roles; get auth tokens for local testing;
  configure identity providers (Google, Facebook) and organizations;
  troubleshoot login, token, audience, or issuer errors.
  The realm is ALWAYS "shadowspeak". Never use any other realm.
---

# Keycloak Auth — ShadowSpeak

## Realm

- **shadowspeak** — hardcoded. Never create, use, or reference any other realm.

## Keycloak Local Setup

- URL: `http://localhost:8080`
- Admin user: config in `.mcp.json` (`KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`)
- Backend `.env`: issuer = `http://localhost:8080/realms/shadowspeak`, audience = `shadowspeak-api`
- MCP server auto-connects using env vars from `.mcp.json`

## Realm Configuration (from import JSON)

### Roles

| Role      | Description                      |
| --------- | -------------------------------- |
| `learner` | Default ShadowSpeak learner role |
| `admin`   | ShadowSpeak administrative role  |

### Existing Clients

| Client               | Type                                 | Flows                                                |
| -------------------- | ------------------------------------ | ---------------------------------------------------- |
| `shadowspeak-api`    | Confidential (`publicClient: false`) | No flows enabled — used only for audience validation |
| `shadowspeak-mobile` | Public (`publicClient: true`)        | Standard flow (PKCE), Direct Access Grants           |

**`shadowspeak-mobile`** has these redirect URIs:

- `shadowspeak://auth/callback`
- `exp://localhost:8081/*`
- `http://localhost:19006/*`

It also has a pre-configured audience mapper (`shadowspeak-api-audience`) that sets `aud: shadowspeak-api` in the access token.

### Existing Test User

| Username                     | Password      | Roles     |
| ---------------------------- | ------------- | --------- |
| `dev.user@shadowspeak.local` | `DevPass123!` | `learner` |

### Identity Providers

| Provider | Config                                                                           |
| -------- | -------------------------------------------------------------------------------- |
| Google   | Reads `KEYCLOAK_GOOGLE_CLIENT_ID` / `KEYCLOAK_GOOGLE_CLIENT_SECRET` env vars     |
| Facebook | Reads `KEYCLOAK_FACEBOOK_CLIENT_ID` / `KEYCLOAK_FACEBOOK_CLIENT_SECRET` env vars |

---

## Working with MCP Tools

All `mcp__keycloak__*` tools are available. **Always pass `realm: "shadowspeak"`** explicitly.

### Create a client

```mcp
mcp__keycloak__create-client
  realm="shadowspeak"
  clientId="new-client-name"
  name="Display Name"
  description="What this client is for"
  enabled=true
  publicClient=false
```

### Add protocol mappers

Always configure mappers after creating a client.

**Audience mapper** — makes tokens valid for the API:

```mcp
mcp__keycloak__create-protocol-mapper
  realm="shadowspeak"
  clientId="<CLIENT_ID>"
  name="shadowspeak-api-audience"
  protocol="openid-connect"
  protocolMapper="oidc-audience-mapper"
  config={"included.client.audience": "shadowspeak-api", "access.token.claim": "true"}
```

**Realm roles mapper** — puts user roles in the JWT:

```mcp
mcp__keycloak__create-protocol-mapper
  realm="shadowspeak"
  clientId="<CLIENT_ID>"
  name="realm-roles"Í
  protocol="openid-connect"
  protocolMapper="oidc-usermodel-realm-role-mapper"
  config={"claim.name": "realm_access.roles", "access.token.claim": "true", "id.token.claim": "true", "jsonType.label": "String", "multivalued": "true"}
```

### Users & roles

**Create a user:**

```mcp
mcp__keycloak__create-user
  realm="shadowspeak"
  username="newuser@shadowspeak.local"
  email="newuser@shadowspeak.local"
  firstName="New"
  lastName="User"
```

**Set password (temporary=false):**

```mcp
mcp__keycloak__reset-user-password
  realm="shadowspeak"
  userId="<USER_ID>"
  newPassword="<PASSWORD>"
  temporary=false
```

**Assign existing role (learner or admin):**

```mcp
mcp__keycloak__create-role realm="shadowspeak" roleName="learner"
mcp__keycloak__assign-role-to-user realm="shadowspeak" userId="<USER_ID>" roleName="learner"
```

**Search users:**

```mcp
mcp__keycloak__search-users realm="shadowspeak" search="dev.user"
```

---

## Using curl for Token & API Operations

Use `curl` + Bash for operations the MCP server doesn't cover.

### Admin access token (from `master` realm, for Admin REST API)

```bash
KC_ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=admin-cli" \
  -d "username=admin" \
  -d "password=admin" \
  -d "grant_type=password" | jq -r '.access_token')
```

### Get a token as the dev user (public client — no secret needed)

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/realms/shadowspeak/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=shadowspeak-mobile" \
  -d "username=dev.user@shadowspeak.local" \
  -d "password=DevPass123!" \
  -d "grant_type=password" | jq -r '.access_token')
```

### Get a token as a user for a confidential client (with secret)

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/realms/shadowspeak/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=<CLIENT_ID>" \
  -d "client_secret=<SECRET>" \
  -d "username=<USERNAME>" \
  -d "password=<PASSWORD>" \
  -d "grant_type=password" | jq -r '.access_token')
```

### Call the Keycloak Admin REST API directly

```bash
curl -s http://localhost:8080/admin/realms/shadowspeak/clients \
  -H "Authorization: Bearer $KC_ADMIN_TOKEN" | jq .
```

### Decode a JWT locally

```bash
echo "$TOKEN" | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .
```

### Verify with backend

```bash
curl -s http://localhost:8000/v1/me -H "Authorization: Bearer $TOKEN" | jq .
```

### Check OIDC configuration

```bash
curl -s http://localhost:8080/realms/shadowspeak/.well-known/openid-configuration | jq .
```

---

## Troubleshooting Common Issues

### "Invalid audience" or "Invalid issuer"

The token's `aud` claim doesn't match `AUTH_AUDIENCE=shadowspeak-api` in `.env`. Fix:

1. Check the client's mappers: `mcp__keycloak__list-protocol-mappers realm="shadowspeak" clientId="<CLIENT_ID>"`
2. If the audience mapper is missing, add one targeting `shadowspeak-api`
3. Always get a **fresh token** after changing mappers

### Token missing roles

1. Check user has a role: `mcp__keycloak__get-user-roles realm="shadowspeak" userId="<USER_ID>"`
2. The `shadowspeak-mobile` client has no realm roles mapper by default. Add one if you need roles in the token (see "Realm roles mapper" above).

### MCP server not responding

- Check `.mcp.json` config (it should point to `http://localhost:8080`)
- Verify Keycloak is running: `curl -s http://localhost:8080/realms/shadowspeak/.well-known/openid-configuration`

### `shadowspeak-api` client has no flows enabled

This is intentional. `shadowspeak-api` exists only for audience validation — it defines the expected `aud` claim. Clients authenticate through `shadowspeak-mobile`. Never enable flows on `shadowspeak-api` unless you're adding a new backend-to-backend integration.

---

## Client Types

| Client               | publicClient | Has secret | Flows               | Token aquisition                                |
| -------------------- | ------------ | ---------- | ------------------- | ----------------------------------------------- |
| `shadowspeak-api`    | false        | Yes        | None                | Not for direct login — audience validation only |
| `shadowspeak-mobile` | true         | No         | PKCE + Direct Grant | Mobile app or curl (dev only)                   |

---

## Guardrails

1. **Realm is always `shadowspeak`.** If asked to create/use another realm, refuse.
2. **Never delete the `shadowspeak` realm.**
3. **Never delete the `admin-cli` client** (built-in, needed for admin operations).
4. **Never delete `shadowspeak-api` or `shadowspeak-mobile` ** — they're pre-configured.
5. **Password grant is local dev only** — never for production.
6. **Prefer MCP tools for admin ops.** Use curl only when MCP doesn't support the operation.
7. **After creating a client, always add protocol mappers** — especially the audience mapper targeting `shadowspeak-api`.
8. **realm_access.roles in the JWT requires a protocol mapper** — `shadowspeak-mobile` doesn't have one by default. Add it explicitly if you need roles in tokens.
