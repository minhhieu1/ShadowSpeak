from typing import Literal

from pydantic import BaseModel, EmailStr, Field

AdConsent = Literal["unknown", "personalized", "non_personalized"]
Level = Literal["beginner", "intermediate", "advanced"]


class ConsentState(BaseModel):
    userId: str
    ageVerified: bool
    privacyAccepted: bool
    adConsent: AdConsent
    consentUpdatedAt: str
    locale: str | None = None


class UpdateConsentInput(BaseModel):
    ageVerified: bool
    privacyAccepted: bool
    adConsent: AdConsent


class UserProfile(BaseModel):
    userId: str
    displayName: str | None = Field(default=None, max_length=80)
    email: EmailStr | None = None
    level: Level | None = None
    reminderTime: str | None = None
    onboardingStep: str | None = None
    deletionRequestedAt: str | None = None
    deletionStatus: Literal["active", "deletion_requested", "purged"] | None = "active"
    createdAt: str
    updatedAt: str


class UpdateProfileInput(BaseModel):
    displayName: str | None = Field(default=None, max_length=80)
    level: Level | None = None
    reminderTime: str | None = Field(
        default=None,
        pattern=r"^([01]\d|2[0-3]):[0-5]\d$",
    )


class DeleteAccountResult(BaseModel):
    userId: str
    deletionRequestedAt: str
    purgeAfter: str
    status: Literal["deletion_requested", "purged"]
