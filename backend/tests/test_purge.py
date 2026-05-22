"""Tests for the async purge job service."""
import time
from datetime import datetime, timedelta, timezone

import boto3
import pytest

from app.repositories.consent_repository import ConsentRepository
from app.repositories.profile_repository import ProfileRepository
from app.services.purge_service import PurgeService
from app.models.auth import UserProfile


@pytest.fixture
def dynamodb_table():
    from moto import mock_aws
    with mock_aws():
        client = boto3.resource("dynamodb", region_name="us-east-1")
        table = client.create_table(
            TableName="test-table",
            KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}, {"AttributeName": "sk", "KeyType": "RANGE"}],
            AttributeDefinitions=[{"AttributeName": "pk", "AttributeType": "S"}, {"AttributeName": "sk", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        yield table


@pytest.fixture
def consent_repo(dynamodb_table):
    return ConsentRepository(dynamodb_table)


@pytest.fixture
def profile_repo(dynamodb_table):
    return ProfileRepository(dynamodb_table)


@pytest.fixture
def purge_service(consent_repo, profile_repo, dynamodb_table):
    return PurgeService(consent_repo, profile_repo, dynamodb_table)


class TestPurgeService:
    def test_find_expired_deletions(self, purge_service, profile_repo):
        now = datetime.now(timezone.utc)
        past = (now - timedelta(days=31)).isoformat().replace("+00:00", "Z")
        future = (now + timedelta(days=1)).isoformat().replace("+00:00", "Z")

        profile_repo.put_profile(UserProfile(userId="user-expired-1", deletionStatus="deletion_requested", deletionRequestedAt=past, createdAt=past, updatedAt=past))
        profile_repo.put_profile(UserProfile(userId="user-expired-2", deletionStatus="deletion_requested", deletionRequestedAt=past, createdAt=past, updatedAt=past))
        profile_repo.put_profile(UserProfile(userId="user-future", deletionStatus="deletion_requested", deletionRequestedAt=future, createdAt=future, updatedAt=future))
        profile_repo.put_profile(UserProfile(userId="user-active", deletionStatus="active", createdAt=now.isoformat(), updatedAt=now.isoformat()))

        expired = purge_service.find_expired_deletions()
        user_ids = [p.userId for p in expired]
        assert "user-expired-1" in user_ids
        assert "user-expired-2" in user_ids
        assert "user-future" not in user_ids
        assert "user-active" not in user_ids

    def test_purge_account_deletes_consent(self, purge_service, profile_repo, consent_repo):
        now = datetime.now(timezone.utc)
        past = (now - timedelta(days=31)).isoformat().replace("+00:00", "Z")

        profile_repo.put_profile(UserProfile(userId="user-purge", deletionStatus="deletion_requested", deletionRequestedAt=past, createdAt=past, updatedAt=past))
        consent_repo.put_consent(user_id="user-purge", ageVerified=True, privacyAccepted=True, adConsent="personalized", locale="en")

        purge_service.purge_account("user-purge")

        assert consent_repo.get_consent("user-purge") is None

    def test_purge_account_marks_purged(self, purge_service, profile_repo):
        now = datetime.now(timezone.utc)
        past = (now - timedelta(days=31)).isoformat().replace("+00:00", "Z")

        profile_repo.put_profile(UserProfile(userId="user-purge-mark", deletionStatus="deletion_requested", deletionRequestedAt=past, createdAt=past, updatedAt=past))

        purge_service.purge_account("user-purge-mark")

        profile = profile_repo.get_profile("user-purge-mark")
        assert profile is not None
        assert profile.deletionStatus == "purged"

    def test_purge_account_adds_ttl(self, purge_service, profile_repo, dynamodb_table):
        now = datetime.now(timezone.utc)
        past = (now - timedelta(days=31)).isoformat().replace("+00:00", "Z")

        profile_repo.put_profile(UserProfile(userId="user-ttl", deletionStatus="deletion_requested", deletionRequestedAt=past, createdAt=past, updatedAt=past))

        purge_service.purge_account("user-ttl")

        item = dynamodb_table.get_item(Key={"pk": "USER#user-ttl", "sk": "PROFILE"}).get("Item")
        assert item is not None
        assert "ttlEpoch" in item
        assert item["ttlEpoch"] > int(time.time())

    def test_purge_account_idempotent(self, purge_service):
        """Purging a non-existent account should not raise."""
        purge_service.purge_account("non-existent-user")
