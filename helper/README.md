# Helper

This directory contains supporting resources for development effort, such as mock servers, sample data, configuration files, local Docker services, and other utilities that aid in building and testing the ShadowSpeak application.

## Contents

- `mockserver/` - file-based mock API server for frontend development.
- `docker/` - local Docker Compose services for backend development, including Keycloak, Google/Facebook social login placeholders, DynamoDB Local, and the seeded DynamoDB Local database file used for first start. The DynamoDB seed should stay schema-only and not include application data.
- `postman/` - Postman collections and environments for local development services.
