"""Tests for the profile repository.

Uses ``moto`` to mock DynamoDB.
"""

import boto3
import pytest

from app.models.auth import UserProfile
from app.repositories.profile_repository import ProfileRepository


@pytest.fixture
def dynamodb_client():
    from moto import mock_aws

    with mock_aws():
        yield boto3.resource("dynamodb", region_name="us-east-1")


@pytest.fixture
def table(dynamodb_client):
    table_name = "test-table"
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
    return ProfileRepository(table)


class TestGetProfile:
    def test_get_profile_not_found(self, repo):
        result = repo.get_profile("nonexistent-user")
        assert result is None

    def test_get_profile_returns_fields(self, repo):
        user_id = "user-123"
        repo.table.put_item(
            Item={
                "pk": f"USER#{user_id}",
                "sk": "PROFILE",
                "entityType": "profile",
                "displayName": "Test User",
                "email": "test@example.com",
                "level": "intermediate",
                "reminderTime": "09:00",
                "onboardingStep": "consent_done",
                "deletionRequestedAt": None,
                "deletionStatus": "active",
                "createdAt": "2026-01-15T10:00:00Z",
                "updatedAt": "2026-01-15T10:00:00Z",
            }
        )
        result = repo.get_profile(user_id)
        assert result is not None
        assert result.userId == user_id
        assert result.displayName == "Test User"
        assert result.email == "test@example.com"
        assert result.level == "intermediate"
        assert result.reminderTime == "09:00"
        assert result.onboardingStep == "consent_done"
        assert result.deletionStatus == "active"
        assert result.createdAt == "2026-01-15T10:00:00Z"
        assert result.updatedAt == "2026-01-15T10:00:00Z"

    def test_get_profile_returns_none_on_wrong_sk(self, repo):
        """Item with consent SK should not match profile query."""
        user_id = "user-123"
        repo.table.put_item(
            Item={
                "pk": f"USER#{user_id}",
                "sk": "CONSENT",
                "entityType": "consent",
            }
        )
        result = repo.get_profile(user_id)
        assert result is None

    def test_get_profile_minimal_fields(self, repo):
        """Profile with only required fields."""
        user_id = "user-minimal"
        repo.table.put_item(
            Item={
                "pk": f"USER#{user_id}",
                "sk": "PROFILE",
                "entityType": "profile",
                "createdAt": "2026-02-01T08:00:00Z",
                "updatedAt": "2026-02-01T08:00:00Z",
            }
        )
        result = repo.get_profile(user_id)
        assert result is not None
        assert result.displayName is None
        assert result.email is None
        assert result.level is None


class TestPutProfile:
    def test_put_profile_stores_entity_type(self, repo):
        user_id = "user-put-test"
        repo.put_profile(
            UserProfile(
                userId=user_id,
                createdAt="2026-03-01T12:00:00Z",
                updatedAt="2026-03-01T12:00:00Z",
            )
        )
        item = repo.table.get_item(Key={"pk": f"USER#{user_id}", "sk": "PROFILE"}).get("Item")
        assert item is not None
        assert item["entityType"] == "profile"
        assert item["createdAt"] == "2026-03-01T12:00:00Z"

    def test_put_profile_with_all_fields(self, repo):
        user_id = "user-all-fields"
        repo.put_profile(
            UserProfile(
                userId=user_id,
                displayName="Full User",
                email="full@example.com",
                level="advanced",
                reminderTime="07:30",
                onboardingStep="complete",
                deletionStatus="active",
                createdAt="2026-04-01T00:00:00Z",
                updatedAt="2026-04-01T00:00:00Z",
            )
        )
        item = repo.table.get_item(Key={"pk": f"USER#{user_id}", "sk": "PROFILE"}).get("Item")
        assert item is not None
        assert item["displayName"] == "Full User"
        assert item["level"] == "advanced"
        assert item["onboardingStep"] == "complete"


class TestUpdateProfile:
    def test_update_profile_partial(self, repo):
        user_id = "user-partial"
        repo.put_profile(
            UserProfile(
                userId=user_id,
                displayName="Original",
                level="beginner",
                createdAt="2026-01-01T00:00:00Z",
                updatedAt="2026-01-01T00:00:00Z",
            )
        )
        repo.update_profile(user_id, displayName="Updated", level=None, reminderTime=None)

        result = repo.get_profile(user_id)
        assert result is not None
        assert result.displayName == "Updated"
        assert result.level == "beginner"  # unchanged
        assert result.updatedAt != "2026-01-01T00:00:00Z"

    def test_update_profile_preserves_other_fields(self, repo):
        user_id = "user-preserve"
        repo.put_profile(
            UserProfile(
                userId=user_id,
                displayName="Keep",
                email="keep@example.com",
                level="intermediate",
                createdAt="2026-01-01T00:00:00Z",
                updatedAt="2026-01-01T00:00:00Z",
            )
        )
        repo.update_profile(user_id, displayName="Changed", level=None, reminderTime=None)

        result = repo.get_profile(user_id)
        assert result is not None
        assert result.displayName == "Changed"
        assert result.email == "keep@example.com"
        assert result.level == "intermediate"

    def test_update_profile_updates_timestamp(self, repo):
        user_id = "user-timestamp"
        repo.put_profile(
            UserProfile(
                userId=user_id,
                createdAt="2026-01-01T00:00:00Z",
                updatedAt="2026-01-01T00:00:00Z",
            )
        )
        repo.update_profile(user_id, displayName="New", level=None, reminderTime=None)

        result = repo.get_profile(user_id)
        assert result is not None
        assert result.updatedAt > "2026-01-01T00:00:00Z"
