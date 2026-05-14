# ShadowSpeak Mock Server

A file-based mock server for developing and testing the ShadowSpeak application frontend without requiring a real backend API. Built on [namshi/mockserver](https://github.com/namshi/mockserver).

## Features

- 🚀 Zero-code mock setup — just create `.mock` files
- 📁 File-based routing mirrors your API paths
- 🔍 Wildcard routing for dynamic URL parameters (e.g., lesson IDs)
- 📊 All 17 MVP endpoints pre-configured with realistic sample data
- 🔄 Query parameter variants for filtered responses
- ✅ Responses wrapped in `JsonEnvelope<T>` per API spec

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Mock Server

```bash
# Development mode with auto-restart (recommended)
npm run dev

# Or start directly
npm start

# Or use mockserver CLI directly
npm run mock
```

### 3. Test It

```bash
# Get user profile
curl -H "Authorization: Bearer jwt-token" http://localhost:3001/v1/me

# List lessons with filter
curl -H "Authorization: Bearer jwt-token" \
  "http://localhost:3001/v1/lessons?level=beginner&limit=2"

# Start a practice session
curl -X POST -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  http://localhost:3001/v1/sessions \
  -d '{"lessonId": "lesson-001"}'
```

## Available Endpoints

### Auth / Profile / Consent

| Method   | Endpoint      | Auth          | Description              |
| -------- | ------------- | ------------- | ------------------------ |
| `GET`    | `/v1/me`      | JWT           | Get current user profile |
| `PUT`    | `/v1/me`      | JWT           | Update profile fields    |
| `GET`    | `/v1/consent` | `X-Device-Id` | Read consent state       |
| `PUT`    | `/v1/consent` | `X-Device-Id` | Save consent decisions   |
| `DELETE` | `/v1/account` | JWT           | Request account deletion |

### Content / Downloads

| Method | Endpoint                          | Auth | Description               |
| ------ | --------------------------------- | ---- | ------------------------- |
| `GET`  | `/v1/lessons`                     | JWT  | Paginated lesson catalog  |
| `GET`  | `/v1/lessons/{id}`                | JWT  | Single lesson detail      |
| `GET`  | `/v1/home/recommendation`         | JWT  | Daily recommended lesson  |
| `POST` | `/v1/downloads/{lessonId}/url`    | JWT  | Get signed download URL   |
| `POST` | `/v1/downloads/{lessonId}/verify` | JWT  | Verify download integrity |

**Query parameters for `GET /v1/lessons`:**

| Param    | Type   | Example                                  |
| -------- | ------ | ---------------------------------------- |
| `level`  | string | `beginner`, `intermediate`, `advanced`   |
| `topic`  | string | `conversation`, `daily-life`, `business` |
| `limit`  | number | `2`, `10`                                |
| `cursor` | string | Pagination cursor                        |

### Session / Progress

| Method  | Endpoint                     | Auth | Description                 |
| ------- | ---------------------------- | ---- | --------------------------- |
| `GET`   | `/v1/sessions/{id}`          | JWT  | Get session state           |
| `POST`  | `/v1/sessions`               | JWT  | Start a new session         |
| `PATCH` | `/v1/sessions/{id}`          | JWT  | Update active session       |
| `POST`  | `/v1/sessions/{id}/complete` | JWT  | Complete a session          |
| `GET`   | `/v1/progress`               | JWT  | Current progress summary    |
| `GET`   | `/v1/progress/history`       | JWT  | Paginated practice history  |
| `POST`  | `/v1/progress/sync`          | JWT  | Sync offline progress batch |

## Example Requests

### Auth / Profile

```bash
# Get user profile
curl -s -H "Authorization: Bearer jwt-token" \
  http://localhost:3001/v1/me | jq

# Update profile
curl -s -X PUT -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: my-req-id" \
  http://localhost:3001/v1/me \
  -d '{"displayName": "Alex Johnson", "level": "intermediate"}' | jq

# Delete account
curl -s -X DELETE -H "Authorization: Bearer jwt-token" \
  http://localhost:3001/v1/account | jq
```

### Consent (no JWT required)

```bash
# Get consent state
curl -s -H "X-Device-Id: device-abc-123" \
  http://localhost:3001/v1/consent | jq

# Save consent
curl -s -X PUT -H "Content-Type: application/json" \
  -H "X-Device-Id: device-abc-123" \
  http://localhost:3001/v1/consent \
  -d '{"ageVerified": true, "privacyAccepted": true, "adConsent": "non_personalized"}' | jq
```

### Lessons

```bash
# List all lessons
curl -s -H "Authorization: Bearer jwt-token" \
  http://localhost:3001/v1/lessons | jq

# Filter by level
curl -s -H "Authorization: Bearer jwt-token" \
  "http://localhost:3001/v1/lessons?level=beginner" | jq

# Filter by topic
curl -s -H "Authorization: Bearer jwt-token" \
  "http://localhost:3001/v1/lessons?topic=conversation" | jq

# Get specific lesson
curl -s -H "Authorization: Bearer jwt-token" \
  http://localhost:3001/v1/lessons/lesson-001 | jq

# Get daily recommendation
curl -s -H "Authorization: Bearer jwt-token" \
  http://localhost:3001/v1/home/recommendation | jq
```

### Downloads

```bash
# Get download URL
curl -s -X POST -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  http://localhost:3001/v1/downloads/lesson-001/url \
  -d '{"assetType": "audio"}' | jq

# Verify download
curl -s -X POST -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  http://localhost:3001/v1/downloads/lesson-001/verify \
  -d '{"assetType": "audio"}' | jq
```

### Sessions

```bash
# Start a new session
curl -s -X POST -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  http://localhost:3001/v1/sessions \
  -d '{"lessonId": "lesson-001"}' | jq

# Get session state
curl -s -H "Authorization: Bearer jwt-token" \
  http://localhost:3001/v1/sessions/session-001 | jq

# Update session (pause / progress)
curl -s -X PATCH -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  http://localhost:3001/v1/sessions/session-001 \
  -d '{"status": "paused", "completionPercent": 60}' | jq

# Complete session
curl -s -X POST -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  http://localhost:3001/v1/sessions/session-001/complete \
  -d '{"completionPercent": 100, "durationSeconds": 180, "clientMutationId": "mut-001"}' | jq
```

### Progress

```bash
# Get current progress summary
curl -s -H "Authorization: Bearer jwt-token" \
  http://localhost:3001/v1/progress | jq

# Get practice history
curl -s -H "Authorization: Bearer jwt-token" \
  http://localhost:3001/v1/progress/history | jq

# Sync offline progress
curl -s -X POST -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  http://localhost:3001/v1/progress/sync \
  -d '{"items": [{"id": "offline-1", "type": "session_complete", "payload": {}, "clientMutationId": "mut-offline-001"}]}' | jq
```

## Sample Data

The server comes pre-loaded with realistic sample data:

| Resource     | Details                                                |
| ------------ | ------------------------------------------------------ |
| **User**     | Alex Johnson, intermediate level, reminder at 08:00    |
| **Lessons**  | 5 lessons across beginner/intermediate/advanced levels |
| **Topics**   | conversation, daily-life, business                     |
| **Sessions** | session-001 (active, 45% complete)                     |
| **Progress** | 5-day streak, 47 min practiced, 3 completed lessons    |

## Mock File Structure

```
mocks/
└── v1/
    ├── me/
    │   ├── GET.mock                    # GET /v1/me
    │   └── PUT.mock                    # PUT /v1/me
    ├── consent/
    │   ├── GET.mock                    # GET /v1/consent
    │   └── PUT.mock                    # PUT /v1/consent
    ├── account/
    │   └── DELETE.mock                 # DELETE /v1/account
    ├── lessons/
    │   ├── GET.mock                    # GET /v1/lessons
    │   ├── GET--level=beginner&limit=2.mock
    │   ├── GET--level=intermediate.mock
    │   ├── GET--level=advanced.mock
    │   ├── GET--topic=conversation.mock
    │   ├── lesson-001/
    │   │   └── GET.mock                # GET /v1/lessons/lesson-001
    │   ├── lesson-002/
    │   │   └── GET.mock                # GET /v1/lessons/lesson-002
    │   └── __/                         # Wildcard for other IDs
    │       └── GET.mock
    ├── home/
    │   └── recommendation/
    │       └── GET.mock                # GET /v1/home/recommendation
    ├── downloads/
    │   └── __/                         # Wildcard for lessonId
    │       ├── url/
    │       │   └── POST.mock           # POST /v1/downloads/:lessonId/url
    │       └── verify/
    │           └── POST.mock           # POST /v1/downloads/:lessonId/verify
    ├── sessions/
    │   ├── POST.mock                   # POST /v1/sessions
    │   ├── session-001/
    │   │   ├── GET.mock                # GET /v1/sessions/session-001
    │   │   ├── PATCH.mock              # PATCH /v1/sessions/session-001
    │   │   └── complete/
    │   │       └── POST.mock           # POST /v1/sessions/session-001/complete
    │   └── __/                         # Wildcard for other session IDs
    │       ├── GET.mock
    │       ├── PATCH.mock
    │       └── complete/
    │           └── POST.mock
    └── progress/
        ├── GET.mock                    # GET /v1/progress
        ├── history/
        │   └── GET.mock                # GET /v1/progress/history
        └── sync/
            └── POST.mock               # POST /v1/progress/sync
```

## Mock File Format

Each `.mock` file contains an HTTP response with headers followed by the JSON body:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-Request-Id: req-mock-001

{
  "requestId": "req-mock-001",
  "ok": true,
  "data": { ... },
  "error": null
}
```

All responses follow the `JsonEnvelope<T>` contract from the [API Specification Document](../../specs/04-solution-architecture/04-API-Specification-Document.md).

## Adding New Mock Data

1. **Create a directory** matching the URL path under `mocks/v1/`
2. **Add a `.mock` file** named for the HTTP method (e.g., `GET.mock`, `POST.mock`)
3. **Use `__` as a directory name** for wildcard/dynamic path segments (e.g., `:id`)
4. **For query params**, replace `?` with `--` in the filename (e.g., `GET--level=beginner.mock`)
5. **Restart the server** — changes are picked up on restart

```bash
# Example: Add a new GET /v1/custom endpoint
mkdir -p mocks/v1/custom
cat > mocks/v1/custom/GET.mock << 'EOF'
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "requestId": "req-custom",
  "ok": true,
  "data": { "foo": "bar" },
  "error": null
}
EOF
```

## Scripts

| Command        | Description                                  |
| -------------- | -------------------------------------------- |
| `npm start`    | Start with `node server.js`                  |
| `npm run dev`  | Start with nodemon (auto-restart on changes) |
| `npm run mock` | Start using mockserver CLI directly          |
| `npm test`     | Run endpoint test suite                      |

## Environment Variables

| Variable       | Default | Description                                      |
| -------------- | ------- | ------------------------------------------------ |
| `PORT`         | `3001`  | Server port                                      |
| `MOCK_HEADERS` | —       | Comma-separated headers to track in mock routing |

## Troubleshooting

| Problem               | Solution                                                                          |
| --------------------- | --------------------------------------------------------------------------------- |
| Port 3001 in use      | `lsof -ti:3001 \| xargs kill -9`                                                  |
| Mock not updating     | Restart the server (nodemon does this automatically in dev mode)                  |
| Wrong response served | Check query params — `mockserver` uses exact file name matching for query strings |
| CORS errors           | Add `Access-Control-Allow-Origin: *` to the mock file headers                     |

│ │ └── GET.mock # GET /v1/progress/history
│ └── sync/
│ └── POST.mock # POST /v1/progress/sync
│ └── **error**/
│ ├── AUTH_UNAUTHORIZED.mock
│ ├── LESSON_NOT_FOUND.mock
│ └── VALIDATION_ERROR.mock

````

### Mock File Format

Mock files contain HTTP response headers and body:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: *

{
  "message": "Hello from mock server!"
}
````

### Dynamic Features

- **Wildcards**: Use `__` directory for dynamic URL parameters
- **Dynamic Values**: Use JavaScript expressions like `Math.random()`
- **Request Access**: Access request data with `#request.path.1`, `#request.body.property`

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `MOCK_HEADERS`: Custom headers to track (comma-separated)

### Custom Headers

```bash
# Track specific headers
MOCK_HEADERS=authorization,x-api-key npm start
```

## Development

### Adding New Endpoints

1. Create the directory structure in `mocks/`
2. Add `.mock` files with HTTP responses
3. Restart the server

### Example: Adding a New Endpoint

```bash
# Create directory for new endpoint
mkdir -p mocks/api/sessions

# Add mock file
echo "HTTP/1.1 200 OK
Content-Type: application/json

{ 'message': 'Sessions endpoint' }" > mocks/api/sessions/GET.mock
```

### Testing

```bash
# Run tests
npm test

# Run with debug output
DEBUG=true npm test
```

## Scripts

- `npm start` - Start the mock server
- `npm run dev` - Start with nodemon for development
- `npm run mock` - Start using mockserver CLI directly
- `npm test` - Run tests

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Mock Files Not Loading

- Check file permissions
- Verify file naming conventions
- Ensure proper directory structure
- Check for syntax errors in mock files

### CORS Issues

All mock responses include `Access-Control-Allow-Origin: *` header. If you need specific origins, modify the mock files accordingly.

## Contributing

1. Follow the existing mock file structure
2. Use descriptive names for endpoints
3. Include proper HTTP status codes
4. Add CORS headers for frontend development
5. Test your changes before committing

## License

MIT - see LICENSE file for details
