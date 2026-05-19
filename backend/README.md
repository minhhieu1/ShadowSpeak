# ShadowSpeak Backend

FastAPI backend workspace for the ShadowSpeak MVP rebuild.

## Stack

- Python 3.12
- FastAPI + Pydantic v2
- Mangum adapter for AWS Lambda
- Local development auth: **Keycloak**
- Production auth: **AWS Cognito**
- Local development database: **DynamoDB Local**
- Production database: **AWS DynamoDB**

## Environment Overview

The backend runs in two distinct environments. Each uses a different auth provider and database backend, selected via environment variables.

| Aspect              | Local (dev)                                  | Production (prod)                    |
| ------------------- | -------------------------------------------- | ------------------------------------ |
| Auth provider       | Keycloak (Docker)                            | AWS Cognito                          |
| Database            | DynamoDB Local (Docker)                      | AWS DynamoDB (managed)               |
| AWS credentials     | Dummy (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) | Real IAM credentials / instance role |

---

## Required Environment Variables

Before running the application, the following environment variables **must** be provided (either via `backend/.env` or as shell environment variables).

### App metadata

| Variable    | Local example         | Production example      |
| ----------- | --------------------- | ----------------------- |
| `APP_ENV`   | `dev`                 | `prod`                  |
| `APP_NAME`  | `ShadowSpeak API`     | `ShadowSpeak API`       |
| `API_VERSION` | `v1`                | `v1`                    |
| `LOG_LEVEL` | `DEBUG`               | `INFO`                  |

### Auth — OIDC / JWT verification

| Variable              | Local (Keycloak)                                                      | Production (Cognito)                                                      |
| --------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `AUTH_PROVIDER`       | `oidc`                                                                | `oidc`                                                                    |
| `AUTH_ISSUER`         | `http://localhost:8080/realms/shadowspeak`                            | `https://cognito-idp.<region>.amazonaws.com/<user-pool-id>`               |
| `AUTH_JWKS_URL`       | `http://localhost:8080/realms/shadowspeak/protocol/openid-certs`      | `https://cognito-idp.<region>.amazonaws.com/<user-pool-id>/.well-known/jwks.json` |
| `AUTH_AUDIENCE`       | `shadowspeak-api`                                                     | `<cognito-app-client-id>`                                                 |
| `AUTH_USER_ID_CLAIM`  | `sub`                                                                 | `sub`                                                                     |
| `AUTH_ROLES_CLAIM`    | `realm_access.roles`                                                  | `cognito:groups` (or custom claim)                                        |

### Database — DynamoDB

| Variable              | Local (DynamoDB Local)        | Production (AWS DynamoDB)              |
| --------------------- | ----------------------------- | -------------------------------------- |
| `DYNAMODB_TABLE_NAME` | `shadowspeak-dev`             | `shadowspeak-prod`                     |
| `DYNAMODB_REGION`     | `us-east-1`                   | `ap-southeast-1` (your deployment region) |
| `DYNAMODB_ENDPOINT`   | `http://localhost:8000`       | _(omit — SDK uses default AWS endpoint)_ |

### AWS credentials

| Variable                | Local (DynamoDB Local ignores these, but SDK requires them) | Production                                  |
| ----------------------- | ----------------------------------------------------------- | ------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | `dummy`                                                     | Real AWS access key / instance role         |
| `AWS_SECRET_ACCESS_KEY` | `dummy`                                                     | Real AWS secret key / instance role         |
| `AWS_DEFAULT_REGION`    | `us-east-1`                                                 | `ap-southeast-1` (your deployment region)   |

> **Local**: These dummy values satisfy the AWS SDK client init. DynamoDB Local does not validate them.
> **Production**: Do **not** hard-code real AWS credentials in `.env`. Use IAM roles (Lambda execution role, ECS task role, etc.) or a secrets manager.

## Environment Files

Non-secret centralized config lives in:

```text
backend/config/dev.json
backend/config/prod.json
```

The local `.env` file selects the config file and provides secrets or machine-specific overrides:

```bash
# Local development: Keycloak + DynamoDB Local
cp backend/.env.dev.example backend/.env
```

Do not commit `backend/.env`. Values in `backend/.env` override values from `backend/config/*.json`.

For non-dev environments, do not create a checked-in `.env.<env>.example`. Pass required values through environment variables:

```bash
APP_ENV=prod \
CONFIG_FILE=config/prod.json \
AWS_DEFAULT_REGION=ap-southeast-1 \
./scripts/backend run prod
```

Local development services are managed by:

```bash
./scripts/dev_services start
```

## Local Setup

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

If `python3.12` is not installed locally, use any Python `>=3.12`.

## Run

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

Useful URLs:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

## Test And Lint

```bash
cd backend
source .venv/bin/activate
pytest
ruff check app tests
```

