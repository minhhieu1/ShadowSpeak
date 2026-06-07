# Production Environment Variables

All runtime configuration comes from environment variables. There is **no provider-specific hard-code** — the same binary works with Keycloak, Cognito, or any OIDC provider.

## Quick Reference

```bash
# ── General ────────────────────────────────────────────────────
APP_ENV=prod
APP_NAME=ShadowSpeak API
API_VERSION=v1
LOG_LEVEL=INFO

# ── OIDC Authentication ────────────────────────────────────────
AUTH_PROVIDER=<keycloak|cognito>

# The OIDC issuer URL and JWKS endpoint.
AUTH_ISSUER=<OIDC issuer URL>
AUTH_JWKS_URL=<JWKS endpoint>

# Expected audience in the JWT's `aud` claim.
AUTH_AUDIENCE=<expected audience>

# OIDC client configuration — returned to the mobile app at boot.
AUTH_CLIENT_ID=<client id>                          # default: shadowspeak-client
AUTH_REDIRECT_URI=<custom scheme>://callback         # default: shadowspeak://callback
AUTH_SCOPES=["openid","profile","email"]             # default

# OIDC endpoint URLs — provider-specific.
# Keycloak format: {issuer}/protocol/openid-connect/{auth,token,revoke,logout}
# Cognito format:  {domain}/oauth2/{authorize,token,...}
AUTH_AUTHORIZATION_ENDPOINT=<URL>
AUTH_TOKEN_ENDPOINT=<URL>
AUTH_REVOCATION_ENDPOINT=<URL>                      # optional
AUTH_END_SESSION_ENDPOINT=<URL>                      # optional

# JWT claim mapping.
AUTH_USER_ID_CLAIM=sub
AUTH_ROLES_CLAIM=<realm_access.roles|cognito:groups>

# ── DynamoDB ───────────────────────────────────────────────────
DYNAMODB_TABLE_NAME=shadowspeak-prod
DYNAMODB_REGION=<aws-region>
# DYNAMODB_ENDPOINT=   ← leave unset in prod (uses AWS default endpoint)

# ── AWS (use default credential chain in prod — do NOT set static keys) ──
AWS_DEFAULT_REGION=<aws-region>
```

## Provider Comparison

| Variable | Keycloak Example | Cognito Example |
|----------|-----------------|-----------------|
| `AUTH_ISSUER` | `https://auth.example.com/realms/shadowspeak` | `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxx` |
| `AUTH_JWKS_URL` | `https://auth.example.com/realms/shadowspeak/protocol/openid-connect/certs` | `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxx/.well-known/jwks.json` |
| `AUTH_AUDIENCE` | `shadowspeak-api` | `<cognito-client-id>` |
| `AUTH_AUTHORIZATION_ENDPOINT` | `{issuer}/protocol/openid-connect/auth` | `https://{domain}.auth.{region}.amazoncognito.com/oauth2/authorize` |
| `AUTH_TOKEN_ENDPOINT` | `{issuer}/protocol/openid-connect/token` | `https://{domain}.auth.{region}.amazoncognito.com/oauth2/token` |
| `AUTH_REVOCATION_ENDPOINT` | `{issuer}/protocol/openid-connect/revoke` | `https://{domain}.auth.{region}.amazoncognito.com/oauth2/revoke` |
| `AUTH_END_SESSION_ENDPOINT` | `{issuer}/protocol/openid-connect/logout` | `https://{domain}.auth.{region}.amazoncognito.com/logout` |
| `AUTH_ROLES_CLAIM` | `realm_access.roles` | `cognito:groups` |

## AWS Credentials

**Do not set `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` in production.** The backend rejects static credentials when `APP_ENV=prod`. Use the default credential chain (IAM roles for Lambda/ECS, instance profiles for EC2).

## Frontend

The only frontend env var is:

```
EXPO_PUBLIC_API_BASE_URL=https://api.shadowspeak.app
```

All OIDC provider details are fetched from `GET /v1/config/runtime` at startup.
