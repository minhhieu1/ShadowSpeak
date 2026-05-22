"""Auth / Profile / Consent domain models."""

from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.models.common import JwtClaims, UserId

AdConsentValue = Literal["unknown", "personalized", "non_personalized"]
LevelValue = Literal["beginner", "intermediate", "advanced"]
DeletionStatusValue = Literal["active", "deletion_requested", "purged"]
DeletionResultStatusValue = Literal["deletion_requested", "purged"]


class AuthContext(BaseModel):
    userId: UserId
    claims: JwtClaims
    groups: list[str]


class OnboardingStep(str, Enum):
    AGE_GATE_DONE = "age_gate_done"
    CONSENT_DONE = "consent_done"
    INTRO_DONE = "intro_done"
    LEVEL_SELECTED = "level_selected"
    REMINDER_SET = "reminder_set"
    MIC_PERMISSION_DONE = "mic_permission_done"
    COMPLETE = "complete"


class ConsentState(BaseModel):
    userId: UserId
    ageVerified: bool
    privacyAccepted: bool
    adConsent: AdConsentValue
    consentUpdatedAt: str
    locale: Optional[str] = None


class UserProfile(BaseModel):
    userId: UserId
    displayName: Optional[str] = None
    email: Optional[str] = None
    level: Optional[LevelValue] = None
    reminderTime: Optional[str] = None
    deletionRequestedAt: Optional[str] = None
    deletionStatus: Optional[DeletionStatusValue] = None
    onboardingStep: Optional[OnboardingStep] = None
    createdAt: str
    updatedAt: str


class UpdateConsentInput(BaseModel):
    ageVerified: bool
    privacyAccepted: bool
    adConsent: AdConsentValue


class UpdateProfileInput(BaseModel):
    displayName: Optional[str] = Field(default=None, max_length=80, min_length=1)
    level: Optional[LevelValue] = None
    reminderTime: Optional[str] = None
    onboardingStep: Optional[OnboardingStep] = None


class UpdateOnboardingStepInput(BaseModel):
    step: OnboardingStep


class DeleteAccountResult(BaseModel):
    userId: UserId
    deletionRequestedAt: str
    purgeAfter: str
    status: DeletionResultStatusValue
