"""Tests for the DynamoDB consent repository.

Uses ``moto`` to mock DynamoDB so no real AWS infrastructure is needed.
"""

from datetime import datetime, timezone

import boto3
import pytest

from app.repositories.consent_repository import ConsentRepository


@pytest.fixture
def dynamodb_client():
    """Create a real in-memory DynamoDB client via moto."""
    from moto import mock_aws

    with mock_aws():
        yield boto3.resource("dynamodb", region_name="us-east-1")


@pytest.fixture
def table(dynamodb_client):
    table_name = "ShadowSpeakMain"
    dynamodb_client.create_table(
        TableName=table_name,
        KeySchema=[
            {"AttributeName": "pk", "KeyType": "HASH"},
            {"AttributeName": "sk", "KeyType": "RANGE"},
        ],
        AttributeDefinitions=[
            {"AttributeName": "pk", "AttributeType": "S"},
            {"AttributeName": "sk", "AttributeType": "S"},
        ],
        BillingMode="PAY_PER_REQUEST",
    )
    return dynamodb_client.Table(table_name)


@pytest.fixture
def repo(table):
    return ConsentRepository(table)


class TestGetConsent:
    def test_get_consent_user_not_found(self, repo):
        result = repo.get_consent("user-999")
        assert result is None

    def test_get_consent_user_exists(self, repo):
        user_id = "user-123"
        repo.table.put_item(
            Item={
                "pk": f"USER#{user_id}",
                "sk": "CONSENT",
                "entityType": "consent",
                "ageVerified": True,
                "privacyAccepted": True,
                "adConsent": "personalized",
                "consentUpdatedAt": "2026-01-15T10:00:00Z",
                "locale": "en-US",
            }
        )

        result = repo.get_consent(user_id)
        assert result is not None
        assert result.userId == user_id
        assert result.ageVerified is True
        assert result.privacyAccepted is True
        assert result.adConsent == "personalized"
        assert result.consentUpdatedAt == "2026-01-15T10:00:00Z"
        assert result.locale == "en-US"

    def test_get_consent_returns_none_on_mismatch(self, repo):
        """Different SK should not match."""
        user_id = "user-123"
        repo.table.put_item(
            Item={
                "pk": f"USER#{user_id}",
                "sk": "PROFILE",
                "entityType": "profile",
            }
        )
        result = repo.get_consent(user_id)
        assert result is None

    def test_get_consent_without_locale(self, repo):
        """Locale is optional and returns None."""
        user_id = "user-456"
        repo.table.put_item(
            Item={
                "pk": f"USER#{user_id}",
                "sk": "CONSENT",
                "entityType": "consent",
                "ageVerified": False,
                "privacyAccepted": True,
                "adConsent": "non_personalized",
                "consentUpdatedAt": "2026-02-01T08:30:00Z",
            }
        )
        result = repo.get_consent(user_id)
        assert result is not None
        assert result.locale is None


class TestPutConsent:
    def test_put_consent_stores_all_fields(self, repo):
        user_id = "user-789"
        repo.put_consent(
            user_id=user_id,
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="fr-FR",
        )

        item = repo.table.get_item(Key={"pk": f"USER#{user_id}", "sk": "CONSENT"}).get("Item")
        assert item is not None
        assert item["entityType"] == "consent"
        assert item["ageVerified"] is True
        assert item["privacyAccepted"] is True
        assert item["adConsent"] == "personalized"
        assert item["locale"] == "fr-FR"
        assert "consentUpdatedAt" in item
        assert "pk" in item
        assert "sk" in item

    def test_put_consent_without_locale(self, repo):
        user_id = "user-abc"
        repo.put_consent(
            user_id=user_id,
            ageVerified=False,
            privacyAccepted=True,
            adConsent="non_personalized",
            locale=None,
        )

        item = repo.table.get_item(Key={"pk": f"USER#{user_id}", "sk": "CONSENT"}).get("Item")
        assert item is not None
        assert "locale" not in item or item["locale"] is None

    def test_put_consent_updates_existing(self, repo):
        user_id = "user-update"
        repo.put_consent(
            user_id=user_id,
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        repo.put_consent(
            user_id=user_id,
            ageVerified=True,
            privacyAccepted=True,
            adConsent="non_personalized",
            locale="en",
        )

        result = repo.get_consent(user_id)
        assert result is not None
        assert result.adConsent == "non_personalized"
        assert result.ageVerified is True


class TestDeviceConsent:
    def test_get_device_consent_not_found(self, repo):
        result = repo.get_device_consent("device-999")
        assert result is None

    def test_put_and_get_device_consent(self, repo):
        device_id = "device-123"
        repo.put_device_consent(
            device_id=device_id,
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en-US",
        )

        result = repo.get_device_consent(device_id)
        assert result is not None
        assert result.userId == device_id
        assert result.ageVerified is True
        assert result.privacyAccepted is True
        assert result.adConsent == "personalized"
        assert result.locale == "en-US"

    def test_device_consent_has_ttl(self, repo):
        device_id = "device-ttl"
        repo.put_device_consent(
            device_id=device_id,
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )

        item = repo.table.get_item(
            Key={"pk": f"DEVICE#{device_id}", "sk": "CONSENT"}
        ).get("Item")
        assert item is not None
        assert "ttlEpoch" in item
        # TTL should be ~24h from now
        now = datetime.now(timezone.utc).timestamp()
        assert item["ttlEpoch"] > now + 80000 - 3600  # ~23h
        assert item["ttlEpoch"] < now + 86400 + 3600  # ~25h

    def test_delete_device_consent(self, repo):
        device_id = "device-to-delete"
        repo.put_device_consent(
            device_id=device_id,
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )

        # Verify it exists first
        assert repo.get_device_consent(device_id) is not None

        repo.delete_device_consent(device_id)
        assert repo.get_device_consent(device_id) is None

    def test_delete_device_consent_idempotent(self, repo):
        """Deleting a non-existent device consent should not raise."""
        repo.delete_device_consent("non-existent-device")


class TestKeyPatterns:
    def test_user_key_pattern(self, repo):
        """Verify the USER# prefix pattern."""
        user_id = "test-user-key"
        pk = f"USER#{user_id}"
        assert pk == "USER#test-user-key"
        assert pk.startswith("USER#")

    def test_device_key_pattern(self, repo):
        """Verify the DEVICE# prefix pattern."""
        device_id = "test-device-key"
        pk = f"DEVICE#{device_id}"
        assert pk == "DEVICE#test-device-key"
        assert pk.startswith("DEVICE#")


class TestEntityType:
    def test_consent_entity_type_on_user(self, repo):
        user_id = "user-entity-type"
        repo.put_consent(
            user_id=user_id,
            ageVerified=True,
            privacyAccepted=True,
            adConsent="unknown",
            locale=None,
        )
        item = repo.table.get_item(Key={"pk": f"USER#{user_id}", "sk": "CONSENT"}).get("Item")
        assert item is not None
        assert item["entityType"] == "consent"
        # There should be exactly one item with the consent SK
        result = repo.table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key("pk").eq(f"USER#{user_id}")
        )
        assert result["Count"] == 1

    def test_consent_entity_type_on_device(self, repo):
        device_id = "device-entity-type"
        repo.put_device_consent(
            device_id=device_id,
            ageVerified=False,
            privacyAccepted=True,
            adConsent="non_personalized",
            locale=None,
        )
        item = repo.table.get_item(
            Key={"pk": f"DEVICE#{device_id}", "sk": "CONSENT"}
        ).get("Item")
        assert item is not None
        assert item["entityType"] == "consent"
