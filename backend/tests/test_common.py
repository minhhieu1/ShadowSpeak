"""
Test suite for T1: Shared Types, Error Codes, Response Envelope

This test file validates the common types, auth models, error codes,
and response envelope used throughout the ShadowSpeak backend.
"""

import re
from typing import Literal

import pytest
from pydantic import ValidationError

# =============================================================================
# Type Alias Tests (app/models/common.py)
# =============================================================================


def test_id_is_str():
    """Test that Id type alias is a string."""
    from app.models.common import Id

    value: Id = "abc123"
    assert isinstance(value, str)


def test_user_id_is_str():
    """Test that UserId type alias is a string."""
    from app.models.common import UserId

    value: UserId = "user_123"
    assert isinstance(value, str)


def test_lesson_id_is_str():
    """Test that LessonId type alias is a string."""
    from app.models.common import LessonId

    value: LessonId = "lesson_456"
    assert isinstance(value, str)


def test_session_id_is_str():
    """Test that SessionId type alias is a string."""
    from app.models.common import SessionId

    value: SessionId = "session_789"
    assert isinstance(value, str)


def test_iso_datetime_is_str():
    """Test that IsoDateTime type alias is a string."""
    from app.models.common import IsoDateTime

    value: IsoDateTime = "2024-01-15T10:30:00Z"
    assert isinstance(value, str)


# =============================================================================
# JwtClaims Tests (app/models/common.py)
# =============================================================================


def test_jwt_claims_empty():
    """Test JwtClaims can be created with no fields (all optional)."""
    from app.models.common import JwtClaims

    claims = JwtClaims()
    assert claims == {}


def test_jwt_claims_with_fields():
    """Test JwtClaims with all fields populated."""
    from app.models.common import JwtClaims

    claims = JwtClaims(
        sub="user_123",
        email="test@example.com",
        groups=["admin", "users"],
        exp=1705315200,
        iat=1705230000,
    )
    assert claims["sub"] == "user_123"
    assert claims["email"] == "test@example.com"
    assert claims["groups"] == ["admin", "users"]
    assert claims["exp"] == 1705315200
    assert claims["iat"] == 1705230000


def test_jwt_claims_partial():
    """Test JwtClaims with only some fields."""
    from app.models.common import JwtClaims

    claims = JwtClaims(sub="user_456", groups=["users"])
    assert claims["sub"] == "user_456"
    assert claims["groups"] == ["users"]
    assert "email" not in claims


# =============================================================================
# AuthContext Tests (app/models/auth.py)
# =============================================================================


def test_auth_context_creation():
    """Test AuthContext creation with required fields."""
    from app.models.auth import AuthContext
    from app.models.common import JwtClaims

    context = AuthContext(
        userId="user_123",
        claims=JwtClaims(sub="user_123", email="test@example.com"),
        groups=["users"],
    )
    assert context.userId == "user_123"
    assert context.claims["sub"] == "user_123"
    assert context.groups == ["users"]


def test_auth_context_with_groups():
    """Test AuthContext groups from both claims and explicit."""
    from app.models.auth import AuthContext
    from app.models.common import JwtClaims

    context = AuthContext(
        userId="user_789",
        claims=JwtClaims(sub="user_789", groups=["admin"]),
        groups=["admin", "premium"],
    )
    assert context.groups == ["admin", "premium"]


# =============================================================================
# OnboardingStep Tests (app/models/auth.py)
# =============================================================================


def test_onboarding_step_values():
    """Test all OnboardingStep enum values."""
    from app.models.auth import OnboardingStep

    assert OnboardingStep.AGE_GATE_DONE.value == "age_gate_done"
    assert OnboardingStep.CONSENT_DONE.value == "consent_done"
    assert OnboardingStep.INTRO_DONE.value == "intro_done"
    assert OnboardingStep.LEVEL_SELECTED.value == "level_selected"
    assert OnboardingStep.REMINDER_SET.value == "reminder_set"
    assert OnboardingStep.MIC_PERMISSION_DONE.value == "mic_permission_done"
    assert OnboardingStep.COMPLETE.value == "complete"


def test_onboarding_step_complete_value():
    """Test OnboardingStep.COMPLETE has correct value."""
    from app.models.auth import OnboardingStep

    assert OnboardingStep.COMPLETE.value == "complete"


def test_onboarding_step_from_string():
    """Test creating OnboardingStep from string."""
    from app.models.auth import OnboardingStep

    step = OnboardingStep("level_selected")
    assert step == OnboardingStep.LEVEL_SELECTED


# =============================================================================
# ConsentState Tests (app/models/auth.py)
# =============================================================================


def test_consent_state_creation():
    """Test ConsentState creation with required fields."""
    from app.models.auth import ConsentState

    consent = ConsentState(
        userId="user_123",
        ageVerified=True,
        privacyAccepted=True,
        adConsent="personalized",
        consentUpdatedAt="2024-01-15T10:30:00Z",
    )
    assert consent.userId == "user_123"
    assert consent.ageVerified is True
    assert consent.privacyAccepted is True
    assert consent.adConsent == "personalized"
    assert consent.consentUpdatedAt == "2024-01-15T10:30:00Z"


def test_consent_state_with_locale():
    """Test ConsentState with optional locale."""
    from app.models.auth import ConsentState

    consent = ConsentState(
        userId="user_456",
        ageVerified=True,
        privacyAccepted=False,
        adConsent="non_personalized",
        consentUpdatedAt="2024-01-16T12:00:00Z",
        locale="en-US",
    )
    assert consent.locale == "en-US"


def test_consent_state_locale_default_none():
    """Test ConsentState locale defaults to None."""
    from app.models.auth import ConsentState

    consent = ConsentState(
        userId="user_789",
        ageVerified=True,
        privacyAccepted=True,
        adConsent="unknown",
        consentUpdatedAt="2024-01-17T08:00:00Z",
    )
    assert consent.locale is None


def test_consent_state_ad_consent_values():
    """Test all valid adConsent values."""
    from app.models.auth import ConsentState

    for ad_value in ["unknown", "personalized", "non_personalized"]:
        consent = ConsentState(
            userId="user_test",
            ageVerified=True,
            privacyAccepted=True,
            adConsent=ad_value,
            consentUpdatedAt="2024-01-01T00:00:00Z",
        )
        assert consent.adConsent == ad_value


def test_consent_state_invalid_ad_consent():
    """Test ConsentState rejects invalid adConsent value."""
    from app.models.auth import ConsentState

    with pytest.raises(ValidationError):
        ConsentState(
            userId="user_test",
            ageVerified=True,
            privacyAccepted=True,
            adConsent="invalid_value",
            consentUpdatedAt="2024-01-01T00:00:00Z",
        )


# =============================================================================
# UserProfile Tests (app/models/auth.py)
# =============================================================================


def test_user_profile_required_only():
    """Test UserProfile with only required fields."""
    from app.models.auth import UserProfile

    profile = UserProfile(
        userId="user_123",
        createdAt="2024-01-15T10:30:00Z",
        updatedAt="2024-01-15T10:30:00Z",
    )
    assert profile.userId == "user_123"
    assert profile.createdAt == "2024-01-15T10:30:00Z"
    assert profile.updatedAt == "2024-01-15T10:30:00Z"


def test_user_profile_all_fields():
    """Test UserProfile with all fields populated."""
    from app.models.auth import UserProfile, OnboardingStep

    profile = UserProfile(
        userId="user_456",
        displayName="John Doe",
        email="john@example.com",
        level="intermediate",
        reminderTime="09:00",
        deletionRequestedAt=None,
        deletionStatus="active",
        onboardingStep=OnboardingStep.COMPLETE,
        createdAt="2024-01-10T08:00:00Z",
        updatedAt="2024-01-15T12:00:00Z",
    )
    assert profile.userId == "user_456"
    assert profile.displayName == "John Doe"
    assert profile.email == "john@example.com"
    assert profile.level == "intermediate"
    assert profile.reminderTime == "09:00"
    assert profile.deletionStatus == "active"
    assert profile.onboardingStep == OnboardingStep.COMPLETE


def test_user_profile_default_none():
    """Test UserProfile optional fields default to None."""
    from app.models.auth import UserProfile

    profile = UserProfile(
        userId="user_789",
        createdAt="2024-01-15T10:30:00Z",
        updatedAt="2024-01-15T10:30:00Z",
    )
    assert profile.displayName is None
    assert profile.email is None
    assert profile.level is None
    assert profile.reminderTime is None
    assert profile.deletionRequestedAt is None
    assert profile.deletionStatus is None
    assert profile.onboardingStep is None


def test_user_profile_level_validation():
    """Test UserProfile level field accepts valid values."""
    from app.models.auth import UserProfile

    for level in ["beginner", "intermediate", "advanced"]:
        profile = UserProfile(
            userId="user_test",
            level=level,
            createdAt="2024-01-01T00:00:00Z",
            updatedAt="2024-01-01T00:00:00Z",
        )
        assert profile.level == level


def test_user_profile_invalid_level():
    """Test UserProfile rejects invalid level value."""
    from app.models.auth import UserProfile

    with pytest.raises(ValidationError):
        UserProfile(
            userId="user_test",
            level="expert",  # invalid
            createdAt="2024-01-01T00:00:00Z",
            updatedAt="2024-01-01T00:00:00Z",
        )


def test_user_profile_deletion_status_values():
    """Test UserProfile deletionStatus accepts valid values."""
    from app.models.auth import UserProfile

    for status in ["active", "deletion_requested", "purged"]:
        profile = UserProfile(
            userId="user_test",
            deletionStatus=status,
            createdAt="2024-01-01T00:00:00Z",
            updatedAt="2024-01-01T00:00:00Z",
        )
        assert profile.deletionStatus == status


def test_user_profile_invalid_deletion_status():
    """Test UserProfile rejects invalid deletionStatus value."""
    from app.models.auth import UserProfile

    with pytest.raises(ValidationError):
        UserProfile(
            userId="user_test",
            deletionStatus="deleted",  # invalid
            createdAt="2024-01-01T00:00:00Z",
            updatedAt="2024-01-01T00:00:00Z",
        )


# =============================================================================
# UpdateConsentInput Tests (app/models/auth.py)
# =============================================================================


def test_update_consent_input():
    """Test UpdateConsentInput creation."""
    from app.models.auth import UpdateConsentInput

    input_data = UpdateConsentInput(
        ageVerified=True,
        privacyAccepted=True,
        adConsent="personalized",
    )
    assert input_data.ageVerified is True
    assert input_data.privacyAccepted is True
    assert input_data.adConsent == "personalized"


def test_update_consent_input_ad_consent_validation():
    """Test UpdateConsentInput validates adConsent values."""
    from app.models.auth import UpdateConsentInput

    for ad_value in ["unknown", "personalized", "non_personalized"]:
        input_data = UpdateConsentInput(
            ageVerified=True,
            privacyAccepted=True,
            adConsent=ad_value,
        )
        assert input_data.adConsent == ad_value


def test_update_consent_input_invalid_ad_consent():
    """Test UpdateConsentInput rejects invalid adConsent."""
    from app.models.auth import UpdateConsentInput

    with pytest.raises(ValidationError):
        UpdateConsentInput(
            ageVerified=True,
            privacyAccepted=True,
            adConsent="invalid",
        )


# =============================================================================
# UpdateProfileInput Tests (app/models/auth.py)
# =============================================================================


def test_update_profile_input_empty():
    """Test UpdateProfileInput with no fields (all optional)."""
    from app.models.auth import UpdateProfileInput

    input_data = UpdateProfileInput()
    assert input_data.displayName is None
    assert input_data.level is None
    assert input_data.reminderTime is None


def test_update_profile_input_partial():
    """Test UpdateProfileInput with partial fields."""
    from app.models.auth import UpdateProfileInput

    input_data = UpdateProfileInput(
        displayName="Jane Doe",
        level="advanced",
    )
    assert input_data.displayName == "Jane Doe"
    assert input_data.level == "advanced"
    assert input_data.reminderTime is None


def test_update_profile_input_all_fields():
    """Test UpdateProfileInput with all fields."""
    from app.models.auth import UpdateProfileInput

    input_data = UpdateProfileInput(
        displayName="Test User",
        level="intermediate",
        reminderTime="14:30",
    )
    assert input_data.displayName == "Test User"
    assert input_data.level == "intermediate"
    assert input_data.reminderTime == "14:30"


def test_update_profile_input_level_validation():
    """Test UpdateProfileInput validates level values."""
    from app.models.auth import UpdateProfileInput

    with pytest.raises(ValidationError):
        UpdateProfileInput(level="invalid_level")


# =============================================================================
# DeleteAccountResult Tests (app/models/auth.py)
# =============================================================================


def test_delete_account_result():
    """Test DeleteAccountResult creation."""
    from app.models.auth import DeleteAccountResult

    result = DeleteAccountResult(
        userId="user_123",
        deletionRequestedAt="2024-01-15T10:30:00Z",
        purgeAfter="2024-01-22T10:30:00Z",
        status="deletion_requested",
    )
    assert result.userId == "user_123"
    assert result.deletionRequestedAt == "2024-01-15T10:30:00Z"
    assert result.purgeAfter == "2024-01-22T10:30:00Z"
    assert result.status == "deletion_requested"


def test_delete_account_result_purged_status():
    """Test DeleteAccountResult with purged status."""
    from app.models.auth import DeleteAccountResult

    result = DeleteAccountResult(
        userId="user_456",
        deletionRequestedAt="2024-01-01T00:00:00Z",
        purgeAfter="2024-01-08T00:00:00Z",
        status="purged",
    )
    assert result.status == "purged"


def test_delete_account_result_invalid_status():
    """Test DeleteAccountResult rejects invalid status."""
    from app.models.auth import DeleteAccountResult

    with pytest.raises(ValidationError):
        DeleteAccountResult(
            userId="user_test",
            deletionRequestedAt="2024-01-01T00:00:00Z",
            purgeAfter="2024-01-08T00:00:00Z",
            status="pending",
        )


# =============================================================================
# Error Codes Tests (app/core/errors.py)
# =============================================================================


def test_app_error_code_values():
    """Test AppErrorCode has correct string values."""
    from app.core.errors import AppErrorCode

    assert AppErrorCode.AUTH_UNAUTHORIZED == "AUTH_UNAUTHORIZED"
    assert AppErrorCode.CONSENT_REQUIRED == "CONSENT_REQUIRED"
    assert AppErrorCode.VALIDATION_ERROR == "VALIDATION_ERROR"
    assert AppErrorCode.USER_NOT_FOUND == "USER_NOT_FOUND"
    assert AppErrorCode.SYSTEM_ERROR == "SYSTEM_ERROR"


def test_app_error_code_is_string():
    """Test AppErrorCode values are strings."""
    from app.core.errors import AppErrorCode

    assert isinstance(AppErrorCode.AUTH_UNAUTHORIZED, str)
    assert isinstance(AppErrorCode.CONSENT_REQUIRED, str)
    assert isinstance(AppErrorCode.VALIDATION_ERROR, str)
    assert isinstance(AppErrorCode.USER_NOT_FOUND, str)
    assert isinstance(AppErrorCode.SYSTEM_ERROR, str)


# =============================================================================
# Response Envelope Tests (app/core/envelope.py)
# =============================================================================


def test_api_error_payload():
    """Test ApiErrorPayload creation."""
    from app.core.envelope import ApiErrorPayload

    error = ApiErrorPayload(
        code="VALIDATION_ERROR",
        message="Invalid input",
    )
    assert error.code == "VALIDATION_ERROR"
    assert error.message == "Invalid input"
    assert error.details is None


def test_api_error_payload_with_details():
    """Test ApiErrorPayload with details."""
    from app.core.envelope import ApiErrorPayload

    error = ApiErrorPayload(
        code="VALIDATION_ERROR",
        message="Invalid input",
        details={"field": "email", "reason": "invalid format"},
    )
    assert error.code == "VALIDATION_ERROR"
    assert error.details == {"field": "email", "reason": "invalid format"}


def test_json_envelope_success():
    """Test JsonEnvelope for successful response."""
    from app.core.envelope import JsonEnvelope

    envelope = JsonEnvelope(
        ok=True,
        requestId="req_123",
        data={"userId": "user_456"},
        error=None,
    )
    assert envelope.ok is True
    assert envelope.requestId == "req_123"
    assert envelope.data == {"userId": "user_456"}
    assert envelope.error is None


def test_json_envelope_failure():
    """Test JsonEnvelope for failure response."""
    from app.core.envelope import ApiErrorPayload, JsonEnvelope

    envelope = JsonEnvelope(
        ok=False,
        requestId="req_789",
        data=None,
        error=ApiErrorPayload(
            code="USER_NOT_FOUND",
            message="User not found",
        ),
    )
    assert envelope.ok is False
    assert envelope.requestId == "req_789"
    assert envelope.data is None
    assert envelope.error is not None
    assert envelope.error.code == "USER_NOT_FOUND"


def test_success_helper():
    """Test success() helper function."""
    from app.core.envelope import success

    envelope = success({"userId": "user_123"}, "req_abc")
    assert envelope.ok is True
    assert envelope.requestId == "req_abc"
    assert envelope.data == {"userId": "user_123"}
    assert envelope.error is None


def test_failure_helper():
    """Test failure() helper function."""
    from app.core.envelope import failure, ApiErrorPayload

    envelope = failure(
        ApiErrorPayload(code="SYSTEM_ERROR", message="Internal error"),
        "req_xyz",
    )
    assert envelope.ok is False
    assert envelope.requestId == "req_xyz"
    assert envelope.data is None
    assert envelope.error is not None
    assert envelope.error.code == "SYSTEM_ERROR"


def test_success_data_type():
    """Test JsonEnvelope Generic[T] works with different data types."""
    from app.core.envelope import success

    # Test with dict
    envelope_dict = success({"key": "value"}, "req_1")
    assert envelope_dict.data == {"key": "value"}

    # Test with list
    envelope_list = success([1, 2, 3], "req_2")
    assert envelope_list.data == [1, 2, 3]

    # Test with string
    envelope_str = success("hello", "req_3")
    assert envelope_str.data == "hello"

    # Test with None (for failure case)
    envelope_none = success(None, "req_4")
    assert envelope_none.data is None


def test_json_envelope_with_user_profile_data():
    """Test JsonEnvelope with UserProfile as data."""
    from app.core.envelope import JsonEnvelope
    from app.models.auth import UserProfile

    profile = UserProfile(
        userId="user_123",
        displayName="Test User",
        createdAt="2024-01-01T00:00:00Z",
        updatedAt="2024-01-01T00:00:00Z",
    )
    envelope = JsonEnvelope(
        ok=True,
        requestId="req_profile",
        data=profile,
        error=None,
    )
    assert envelope.ok is True
    assert envelope.data.userId == "user_123"
    assert envelope.data.displayName == "Test User"


# =============================================================================
# ISO Datetime Format Tests
# =============================================================================


def test_iso_datetime_pattern():
    """Test ISO datetime string matches expected pattern."""
    from app.models.common import IsoDateTime

    # Valid ISO datetime patterns
    valid_patterns = [
        "2024-01-15T10:30:00Z",
        "2024-12-31T23:59:59Z",
        "2024-06-15T00:00:00+00:00",
        "2024-01-01T00:00:00.123456Z",
    ]

    iso_pattern = r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$"

    for dt_str in valid_patterns:
        value: IsoDateTime = dt_str
        assert re.match(iso_pattern, value), f"Failed to match: {dt_str}"


def test_iso_datetime_in_user_profile():
    """Test IsoDateTime works in UserProfile datetime fields."""
    from app.models.auth import UserProfile

    profile = UserProfile(
        userId="user_123",
        createdAt="2024-01-15T10:30:00Z",
        updatedAt="2024-01-16T14:45:00Z",
    )
    assert profile.createdAt == "2024-01-15T10:30:00Z"
    assert profile.updatedAt == "2024-01-16T14:45:00Z"


# =============================================================================
# Integration Tests - Full Flow
# =============================================================================


def test_auth_context_with_user_profile():
    """Test AuthContext and UserProfile work together."""
    from app.models.auth import AuthContext, UserProfile
    from app.models.common import JwtClaims

    # Create auth context
    auth_context = AuthContext(
        userId="user_123",
        claims=JwtClaims(sub="user_123", email="test@example.com"),
        groups=["users"],
    )

    # Create user profile
    profile = UserProfile(
        userId="user_123",
        displayName="Test User",
        email="test@example.com",
        level="beginner",
        createdAt="2024-01-01T00:00:00Z",
        updatedAt="2024-01-15T00:00:00Z",
    )

    # Verify they share userId
    assert auth_context.userId == profile.userId
    assert profile.email == auth_context.claims["email"]


def test_consent_state_with_user_profile():
    """Test ConsentState and UserProfile relationship."""
    from app.models.auth import ConsentState, UserProfile

    consent = ConsentState(
        userId="user_123",
        ageVerified=True,
        privacyAccepted=True,
        adConsent="personalized",
        consentUpdatedAt="2024-01-15T10:30:00Z",
        locale="en-US",
    )

    profile = UserProfile(
        userId="user_123",
        createdAt="2024-01-01T00:00:00Z",
        updatedAt="2024-01-15T10:30:00Z",
    )

    assert consent.userId == profile.userId


def test_envelope_with_error_code():
    """Test response envelope uses error codes correctly."""
    from app.core.envelope import ApiErrorPayload, failure
    from app.core.errors import AppErrorCode

    envelope = failure(
        ApiErrorPayload(
            code=AppErrorCode.USER_NOT_FOUND,
            message="The requested user does not exist",
        ),
        "req_123",
    )

    assert envelope.error.code == AppErrorCode.USER_NOT_FOUND
    assert envelope.error.code == "USER_NOT_FOUND"