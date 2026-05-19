# Scripts Directory

This directory stores utility scripts that support development, testing, and CI/CD processes for the **ShadowSpeak** project. Scripts include build helpers, deployment automation, test runners, and other convenience tools.

---

## `mock_server`

A small Bash helper that starts and stops the **mockserver** instance used by the front‑end during local development.

### Location

`scripts/mock_server`

### Description

- **start** – Launches the mock server (default port **3001**) in the background. If a server is already listening on that port, the script will kill the existing process and restart it.
- **stop** – Stops the running mock server by reading the PID stored in `/tmp/mock_server.pid` and terminating it.

The script stores the PID of the started process in `/tmp/mock_server.pid` so that the **stop** command can reliably shut it down.

### Usage

```bash
# From the repository root
./scripts/mock_server start   # start (or restart) the mock server
./scripts/mock_server stop    # stop the mock server
```

You can also run the script in the background directly:

```bash
./scripts/mock_server start &
```

The server will continue running after the terminal returns.

### Example workflow

```bash
# Start the server (will restart if already running)
./scripts/mock_server start

# Verify it is up (example request)
curl -s -H "Authorization: Bearer jwt-token" http://localhost:3001/v1/me | python3 -m json.tool

# When finished, stop it
./scripts/mock_server stop
```

### Notes

- The script assumes **Node.js** is installed and that the mock server code lives in `helper/mockserver/server.js`.
- The default port can be overridden by setting the `PORT` environment variable before invoking the script, e.g. `PORT=4000 ./scripts/mock_server start`.
- If the PID file is missing, the `stop` command will warn that the server may not be running.

---

## `dev_services`

Starts the local development infrastructure for the backend rebuild:

- **Keycloak** for dev authentication
- **DynamoDB Local** for dev database storage

### Location

`scripts/dev_services`

### Usage

```bash
# From the repository root
./scripts/dev_services start
./scripts/dev_services status
./scripts/dev_services logs
./scripts/dev_services stop
./scripts/dev_services reset
```

### Local URLs

| Service | URL |
| --- | --- |
| Keycloak Admin Console | `http://localhost:8080/admin` |
| Keycloak realm issuer | `http://localhost:8080/realms/shadowspeak` |
| Keycloak JWKS | `http://localhost:8080/realms/shadowspeak/protocol/openid-connect/certs` |
| DynamoDB Local | `http://localhost:8000` |

### Dev Credentials

| Purpose | Value |
| --- | --- |
| Keycloak admin | `admin` / `admin` |
| Test user | `dev.user@shadowspeak.local` / `DevPass123!` |
| Mobile client | `shadowspeak-mobile` |
| API audience | `shadowspeak-api` |

### Social Login

The local Keycloak realm includes enabled Google and Facebook identity providers. Their credentials are read from environment variables during realm import.

```bash
cp helper/docker/.env.example helper/docker/.env
# Edit helper/docker/.env with real Google/Facebook dev app credentials.
./scripts/dev_services reset
./scripts/dev_services start
```

Configure these redirect URIs in the provider developer consoles:

```text
http://localhost:8080/realms/shadowspeak/broker/google/endpoint
http://localhost:8080/realms/shadowspeak/broker/facebook/endpoint
```

### Backend Dev Config

Use `backend/.env.dev.example` when wiring the new FastAPI backend:

```bash
cp backend/.env.dev.example backend/.env
```

It contains:

```bash
APP_ENV=dev
AUTH_ISSUER=http://localhost:8080/realms/shadowspeak
AUTH_JWKS_URL=http://localhost:8080/realms/shadowspeak/protocol/openid-connect/certs
AUTH_AUDIENCE=shadowspeak-api
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
AWS_DEFAULT_REGION=us-east-1
```

### Notes

- `reset` deletes generated local data under `helper/docker/keycloak/data` and `helper/docker/dynamodb`.
- Keycloak imports the committed realm file only when the realm does not already exist.
- After editing `helper/docker/keycloak/import/shadowspeak-realm.json`, run `./scripts/dev_services reset` before starting again.
- Import `helper/postman/keycloak-local-basic.postman_collection.json` and `helper/postman/keycloak-local.postman_environment.json` into Postman to test local Keycloak.

---

## `backend`

Manages the local backend workspace during the FastAPI rebuild.

### Location

`scripts/backend`

### Usage

```bash
# From the repository root
./scripts/backend setup dev
./scripts/backend status
./scripts/backend run dev
./scripts/backend test
./scripts/backend lint
./scripts/backend reset
```

### Commands

- **setup** - clean-installs the backend by deleting `backend/.venv`, preparing env config, recreating the virtualenv, and installing dependencies.
- **run** - starts `uvicorn app.main:app --reload`; requires the backend app to exist.
- **test** - runs `pytest`; requires `backend/tests/` to exist.
- **lint** - runs `ruff check app tests`; requires the backend app to exist.
- **status** - prints backend env, virtualenv, app, and test availability.
- **reset** - deletes `backend/.venv` and local `backend/.env`.

If env is omitted, the script defaults to `dev`. For any non-dev env, pass `APP_ENV`, `CONFIG_FILE`, and `AWS_DEFAULT_REGION` through environment variables. No non-dev `.env.<env>.example` file should be committed.

Example non-dev setup:

```bash
APP_ENV=prod CONFIG_FILE=config/prod.json AWS_DEFAULT_REGION=ap-southeast-1 ./scripts/backend setup prod
```

---

Feel free to add additional scripts to this directory as the project evolves.
