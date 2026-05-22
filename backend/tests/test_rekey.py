"""Tests for the consent re-key service.

Re-key migrates consent from a ``DEVICE#`` record to a ``USER#`` record
when a user signs in after completing consent pre-auth.
"""

import boto3
import pytest

from app.repositories.consent_repository import ConsentRepository
from app.repositories.profile_repository import ProfileRepository
from app.services.consent_service import ConsentService
from app.services.profile_service import ProfileService
from app.services.rekey_service import RekeyService
from app.models.auth import UserProfile


@pytest.fixture
def dynamodb_table():
    from moto import mock_aws

    with mock_aws():
        client = boto3.resource("dynamodb", region_name="us-east-1")
        table = client.create_table(
            TableName="test-table",
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
        yield table


@pytest.fixture
def consent_repo(dynamodb_table):
    return ConsentRepository(dynamodb_table)


@pytest.fixture
def profile_repo(dynamodb_table):
    return ProfileRepository(dynamodb_table)


@pytest.fixture
def consent_service(consent_repo):
    return ConsentService(consent_repo)


@pytest.fixture
def rekey_service(consent_repo):
    return RekeyService(consent_repo)


class TestRekeyService:
    def test_rekey_copies_consent_to_user(self, rekey_service, consent_repo):
        """Rekey copies DEVICE# consent to USER#."""
        # Arrange: device has consent
        consent_repo.put_device_consent(
            device_id="device-1",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en-US",
        )

        # Act
        rekey_service.rekey_consent(device_id="device-1", user_id="user-1")

        # Assert: USER# consent exists with same values
        user_consent = consent_repo.get_consent("user-1")
        assert user_consent is not None
        assert user_consent.ageVerified is True
        assert user_consent.privacyAccepted is True
        assert user_consent.adConsent == "personalized"
        assert user_consent.locale == "en-US"

    def test_rekey_deletes_device_consent(self, rekey_service, consent_repo):
        """Rekey deletes DEVICE# record after copy."""
        consent_repo.put_device_consent(
            device_id="device-2",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="non_personalized",
            locale="en",
        )

        rekey_service.rekey_consent(device_id="device-2", user_id="user-2")

        device_consent = consent_repo.get_device_consent("device-2")
        assert device_consent is None

    def test_rekey_idempotent_user_exists(self, rekey_service, consent_repo):
        """Rekey is a no-op if USER# consent already exists."""
        # Pre-setup: both device and user consent exist
        consent_repo.put_device_consent(
            device_id="device-3",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        consent_repo.put_consent(
            user_id="user-3",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="non_personalized",
            locale="fr",
        )

        rekey_service.rekey_consent(device_id="device-3", user_id="user-3")

        # User consent should still be the original (not overwritten)
        user_consent = consent_repo.get_consent("user-3")
        assert user_consent is not None
        assert user_consent.adConsent == "non_personalized"
        assert user_consent.locale == "fr"

    def test_rekey_idempotent_no_device_consent(self, rekey_service, consent_repo):
        """Rekey is a no-op if no DEVICE# record exists."""
        # Should not raise
        rekey_service.rekey_consent(device_id="non-existent", user_id="user-4")

        user_consent = consent_repo.get_consent("user-4")
        assert user_consent is None

    def test_rekey_device_without_locale(self, rekey_service, consent_repo):
        """Rekey handles device consent without locale."""
        consent_repo.put_device_consent(
            device_id="device-no-locale",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale=None,
        )

        rekey_service.rekey_consent(device_id="device-no-locale", user_id="user-no-locale")

        user_consent = consent_repo.get_consent("user-no-locale")
        assert user_consent is not None
        assert user_consent.locale is None

    def test_rekey_updates_timestamp(self, rekey_service, consent_repo):
        """Rekey sets a new consentUpdatedAt on the user record."""
        consent_repo.put_device_consent(
            device_id="device-ts",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )

        rekey_service.rekey_consent(device_id="device-ts", user_id="user-ts")

        user_consent = consent_repo.get_consent("user-ts")
        assert user_consent is not None
        assert "T" in user_consent.consentUpdatedAt


class TestRekeyTrigger:
    """Rekey should be triggered on first profile request."""

    def test_rekey_triggered_on_first_profile_request(self, dynamodb_table):
        """ProfileService.get_profile triggers rekey if needed."""
        consent_repo = ConsentRepository(dynamodb_table)
        profile_repo = ProfileRepository(dynamodb_table)
        rekey_service = RekeyService(consent_repo)
        consent_service = ConsentService(consent_repo)
        profile_service = ProfileService(profile_repo, consent_service, rekey_service)

        # Device has consent, user has no profile yet
        consent_repo.put_device_consent(
            device_id="device-trigger",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )

        # First profile get — should trigger rekey
        # This user has device consent but no user consent yet
        # The rekey should fire before the consent check
        result = profile_service.get_profile_with_rekey(
            user_id="user-trigger", device_id="device-trigger"
        )
        # No profile exists, so result should be None
        assert result is None

        # But consent should now exist under USER#
        user_consent = consent_repo.get_consent("user-trigger")
        assert user_consent is not None
        assert user_consent.ageVerified is True

    def test_rekey_idempotent_on_subsequent_requests(self, dynamodb_table):
        """Subsequent calls don't fail after rekey."""
        consent_repo = ConsentRepository(dynamodb_table)
        profile_repo = ProfileRepository(dynamodb_table)
        rekey_service = RekeyService(consent_repo)
        consent_service = ConsentService(consent_repo)
        profile_service = ProfileService(profile_repo, consent_service, rekey_service)

        consent_repo.put_device_consent(
            device_id="device-idempotent",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )

        # First call
        profile_service.get_profile_with_rekey(
            user_id="user-idempotent", device_id="device-idempotent"
        )

        # Second call — should not raise
        result = profile_service.get_profile_with_rekey(
            user_id="user-idempotent", device_id="device-idempotent"
        )
        assert result is None  # no profile yet

    def test_rekey_with_device_and_existing_profile(self, dynamodb_table):
        """Rekey + profile retrieval returns the profile if both exist."""
        consent_repo = ConsentRepository(dynamodb_table)
        profile_repo = ProfileRepository(dynamodb_table)
        rekey_service = RekeyService(consent_repo)
        consent_service = ConsentService(consent_repo)
        profile_service = ProfileService(profile_repo, consent_service, rekey_service)

        consent_repo.put_device_consent(
            device_id="device-full",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="personalized",
            locale="en",
        )
        profile_repo.put_profile(
            UserProfile(
                userId="user-full",
                displayName="Full User",
                createdAt="2026-01-01T00:00:00Z",
                updatedAt="2026-01-01T00:00:00Z",
            )
        )

        result = profile_service.get_profile_with_rekey(
            user_id="user-full", device_id="device-full"
        )
        assert result is not None
        assert result.displayName == "Full User"
        # Consent should be rekeyed
        user_consent = consent_repo.get_consent("user-full")
        assert user_consent is not None
