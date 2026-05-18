"""Tests for middleware chain."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestRequestIdMiddleware:
    def test_request_id_generated_if_not_provided(self) -> None:
        response = client.get("/health")
        assert "X-Request-Id" in response.headers
        assert response.headers["X-Request-Id"] != ""

    def test_request_id_echoed_from_client(self) -> None:
        response = client.get("/health", headers={"X-Request-Id": "my-request-id"})
        assert response.headers["X-Request-Id"] == "my-request-id"

    def test_request_id_in_response_body(self) -> None:
        response = client.get(
            "/v1/consent",
            headers={"X-Device-Id": "dev-1", "X-Request-Id": "body-req-1"},
        )
        body = response.json()
        assert body["requestId"] == "body-req-1"


class TestErrorHandling:
    def test_health_returns_200(self) -> None:
        response = client.get("/health")
        assert response.status_code == 200

    def test_not_found_returns_json(self) -> None:
        response = client.get("/nonexistent")
        assert response.status_code == 404

    def test_validation_error_returns_422_envelope(self) -> None:
        response = client.put(
            "/v1/consent",
            headers={"X-Device-Id": "dev-1"},
            json={"ageVerified": "not-a-bool"},  # type: ignore[dict-item]
        )
        assert response.status_code == 422
        body = response.json()
        assert body["ok"] is False
        assert body["error"]["code"] == "VALIDATION_ERROR"

    def test_api_error_returns_envelope(self) -> None:
        response = client.get(
            "/v1/lessons/nonexistent",
            headers={"Authorization": "Bearer test-user"},
        )
        assert response.status_code == 404
        body = response.json()
        assert body["ok"] is False
        assert body["error"]["code"] == "LESSON_NOT_FOUND"


class TestRateLimit:
    def test_rate_limit_blocks_excess_requests(self) -> None:
        """Requests exceeding the limit should get 429."""
        from fastapi import FastAPI
        from fastapi.testclient import TestClient as TC

        from app.core.middleware import RateLimitMiddleware

        test_app = FastAPI()

        @test_app.get("/test")
        async def dummy():
            return {"ok": True}

        test_app.add_middleware(RateLimitMiddleware, max_requests=2, window_seconds=60)
        tc = TC(test_app)

        # First 2 requests should succeed
        r1 = tc.get("/test")
        assert r1.status_code == 200

        r2 = tc.get("/test")
        assert r2.status_code == 200

        # 3rd request should be rate limited
        r3 = tc.get("/test")
        assert r3.status_code == 429
        body = r3.json()
        assert body["ok"] is False
        assert body["error"]["code"] == "RATE_LIMITED"
        assert "Retry-After" in r3.headers
        assert "X-Request-Id" in r3.headers

    def test_rate_limit_per_user(self) -> None:
        """Different users should have independent rate limit counters."""
        from fastapi import FastAPI
        from fastapi.testclient import TestClient as TC

        from app.core.middleware import RateLimitMiddleware

        test_app = FastAPI()

        @test_app.get("/test")
        async def dummy():
            return {"ok": True}

        test_app.add_middleware(RateLimitMiddleware, max_requests=1, window_seconds=60)
        tc = TC(test_app)

        # First user gets limited after 1 request
        r1 = tc.get("/test", headers={"Authorization": "Bearer user-a"})
        assert r1.status_code == 200

        r2 = tc.get("/test", headers={"Authorization": "Bearer user-a"})
        assert r2.status_code == 429

        # Second user can still make requests
        r3 = tc.get("/test", headers={"Authorization": "Bearer user-b"})
        assert r3.status_code == 200

    def test_rate_limit_window_expires(self) -> None:
        """Requests outside the window should not count."""
        import time

        from fastapi import FastAPI
        from fastapi.testclient import TestClient as TC

        from app.core.middleware import RateLimitMiddleware

        test_app = FastAPI()

        @test_app.get("/test")
        async def dummy():
            return {"ok": True}

        test_app.add_middleware(RateLimitMiddleware, max_requests=1, window_seconds=0)
        tc = TC(test_app)

        r1 = tc.get("/test")
        assert r1.status_code == 200

        r2 = tc.get("/test")
        assert r2.status_code == 200
