"""Tests for the middleware chain: request ID, logging, CORS.

Note: X-Request-Id is returned as a response header (verified by
test_request_id_*_header tests). The JSON body does not include a
requestId field — that is handled by the JsonEnvelope envelope at
the endpoint level, not by middleware.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.config import Settings
from app.main import create_app


@pytest.fixture
def app():
    settings = Settings(
        _env_file=None,
        app_env="test",
        app_name="ShadowSpeak Test",
        api_version="v1",
        log_level="DEBUG",
        auth_provider="keycloak",
        auth_issuer="http://test-issuer.local",
        auth_jwks_url="http://test-issuer.local/certs",
        auth_audience="test-audience",
        auth_user_id_claim="sub",
        auth_roles_claim="groups",
        dynamodb_table_name="test-table",
        dynamodb_region="us-east-1",
        dynamodb_endpoint="http://localhost:8000",
        aws_access_key_id="dummy",
        aws_secret_access_key="dummy",
        aws_default_region="us-east-1",
    )
    return create_app(settings)


@pytest.fixture
async def client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_request_id_assigned_when_missing(client):
    """When no X-Request-Id is sent, one should be generated."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert "X-Request-Id" in response.headers
    assert len(response.headers["X-Request-Id"]) > 0


@pytest.mark.asyncio
async def test_request_id_echoed_from_client(client):
    """When X-Request-Id is sent, it should be echoed back."""
    request_id = "my-custom-req-id"
    response = await client.get("/health", headers={"X-Request-Id": request_id})
    assert response.status_code == 200
    assert response.headers.get("X-Request-Id") == request_id


@pytest.mark.asyncio
async def test_cors_headers_present_on_get(client):
    """CORS headers should be present in GET responses."""
    response = await client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert response.status_code == 200
    assert "Access-Control-Allow-Origin" in response.headers


@pytest.mark.asyncio
async def test_cors_allow_origin_wildcard(client):
    """CORS should allow any origin (dev mode)."""
    response = await client.get("/health", headers={"Origin": "http://example.com"})
    assert response.status_code == 200
    origin = response.headers.get("Access-Control-Allow-Origin", "")
    assert origin == "*"


@pytest.mark.asyncio
async def test_cors_headers_on_get_method(client):
    """GET response should include CORS headers."""
    response = await client.get("/health", headers={"Origin": "http://example.com"})
    assert "Access-Control-Allow-Origin" in response.headers
    assert "Access-Control-Allow-Methods" in response.headers
    assert "Access-Control-Allow-Headers" in response.headers


@pytest.mark.asyncio
async def test_config_runtime_endpoint(client):
    """Runtime config endpoint should work."""
    response = await client.get("/v1/config/runtime")
    assert response.status_code == 200
    data = response.json()
    assert data.get("issuer") is not None
    assert data.get("clientId") is not None
    assert data.get("scopes") is not None
    assert data.get("provider") == "keycloak"
    assert data.get("redirectUri") is not None


@pytest.mark.asyncio
async def test_cors_options_preflight(client):
    """OPTIONS preflight should return 204 with CORS headers and no route processing."""
    response = await client.options("/health", headers={"Origin": "http://example.com"})
    assert response.status_code == 204
    assert response.headers.get("Access-Control-Allow-Origin") == "*"
    assert "Access-Control-Allow-Methods" in response.headers
    assert "Access-Control-Allow-Headers" in response.headers


@pytest.mark.asyncio
async def test_cors_headers_on_404(client):
    """CORS headers should be present even on error responses."""
    response = await client.get("/nonexistent", headers={"Origin": "http://example.com"})
    assert response.status_code == 404
    assert response.headers.get("Access-Control-Allow-Origin") == "*"


@pytest.mark.asyncio
async def test_request_id_on_error(client):
    """Request ID header should be present even on error responses."""
    response = await client.get("/nonexistent")
    assert response.status_code == 404
    assert "X-Request-Id" in response.headers


@pytest.mark.asyncio
async def test_request_id_truncated_when_too_long(client):
    """Client-supplied X-Request-Id longer than 64 chars should be discarded."""
    long_id = "x" * 100
    response = await client.get("/health", headers={"X-Request-Id": long_id})
    assert response.status_code == 200
    returned = response.headers.get("X-Request-Id", "")
    assert len(returned) == 32  # uuid hex length


@pytest.mark.asyncio
async def test_request_id_whitespace_only(client):
    """Whitespace-only X-Request-Id should be discarded and a new one generated."""
    response = await client.get("/health", headers={"X-Request-Id": "   "})
    assert response.status_code == 200
    returned = response.headers.get("X-Request-Id", "")
    assert len(returned) == 32  # uuid hex length


@pytest.mark.asyncio
async def test_rate_limit_preauth_writes(client):
    """Bursting pre-auth writes should eventually return 429."""
    last_status = None
    for _ in range(12):
        response = await client.put(
            "/consent",
            json={"ageVerified": True, "privacyAccepted": True, "adConsent": "personalized"},
        )
        last_status = response.status_code
    assert last_status == 429


@pytest.mark.asyncio
async def test_rate_limit_authenticated_write_path(client):
    """Bursting authenticated write-shaped requests should eventually return 429."""
    last_status = None
    for _ in range(32):
        response = await client.delete(
            "/account",
            headers={"Authorization": "Bearer test-token"},
        )
        last_status = response.status_code
    assert last_status == 429
