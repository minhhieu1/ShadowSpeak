from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "shadowspeak-api"}


def test_pre_auth_consent_requires_device_id() -> None:
    response = client.get("/v1/consent")
    body = response.json()
    assert response.status_code == 422
    assert body["ok"] is False
    assert body["error"]["code"] == "VALIDATION_ERROR"


def test_pre_auth_consent_round_trip() -> None:
    headers = {"X-Device-Id": "device-test-1", "X-Request-Id": "req-consent"}
    response = client.put(
        "/v1/consent",
        headers=headers,
        json={
            "ageVerified": True,
            "privacyAccepted": True,
            "adConsent": "non_personalized",
        },
    )
    body = response.json()
    assert response.status_code == 200
    assert body["ok"] is True
    assert body["requestId"] == "req-consent"
    assert body["data"]["userId"] == "device-test-1"
    assert body["data"]["privacyAccepted"] is True


def test_home_recommendation_envelope() -> None:
    response = client.get("/v1/home/recommendation", headers={"X-Request-Id": "req-home"})
    body = response.json()
    assert response.status_code == 200
    assert body["ok"] is True
    assert body["requestId"] == "req-home"
    assert body["data"]["lessonId"] == "lesson_cafe_small_talk_001"


def test_session_lifecycle_and_idempotent_completion() -> None:
    started = client.post("/v1/sessions", json={"lessonId": "lesson_cafe_small_talk_001"})
    started_body = started.json()
    session_id = started_body["data"]["sessionId"]

    assert started.status_code == 201
    assert started_body["data"]["status"] == "created"

    patched = client.patch(f"/v1/sessions/{session_id}", json={"status": "active"})
    assert patched.status_code == 200
    assert patched.json()["data"]["status"] == "active"

    complete_payload = {
        "completionPercent": 100,
        "durationSeconds": 480,
        "recordingLocalUri": "file://recording.m4a",
        "clientMutationId": "mutation-test-1",
    }
    completed = client.post(f"/v1/sessions/{session_id}/complete", json=complete_payload)
    retried = client.post(f"/v1/sessions/{session_id}/complete", json=complete_payload)

    assert completed.status_code == 200
    assert completed.json()["data"]["status"] == "completed"
    assert retried.status_code == 200
    assert retried.json()["data"]["sessionId"] == session_id


def test_progress_sync_returns_client_mutation_ids() -> None:
    response = client.post(
        "/v1/progress/sync",
        json={
            "items": [
                {
                    "id": "queue-1",
                    "type": "progress_update",
                    "payload": {"minutesPracticed": 8},
                    "clientMutationId": "mutation-sync-1",
                }
            ]
        },
    )
    body = response.json()
    assert response.status_code == 200
    assert body["data"]["synced"] == ["mutation-sync-1"]
    assert body["data"]["failed"] == []
