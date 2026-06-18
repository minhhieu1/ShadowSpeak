/**
 * Onboarding type definitions.
 *
 * These types define the shape of onboarding state, consent state, and API
 * requests/responses for the first-time user onboarding flow.
 */

// ═══════════════════════════════════════════════════════════════════════════
//  Onboarding Step Enum
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tracks the user's progress through the onboarding flow.
 *
 * Each step corresponds to a screen that can be resumed on return visits.
 * The `complete` step indicates the user has finished onboarding and should
 * be routed to the main app (/(tabs)/home).
 */
export type OnboardingStep =
  | null
  | "age_gate_done"
  | "consent_done"
  | "intro_done"
  | "level_selected"
  | "reminder_set"
  | "mic_permission_done"
  | "complete";

/**
 * Maps an onboarding step to the route where the user should resume.
 *
 * @example
 * ```ts
 * const route = ONBOARDING_STEP_TO_ROUTE['consent_done']; // '/onboarding/consent'
 * ```
 */
export const ONBOARDING_STEP_TO_ROUTE: Record<
  Exclude<OnboardingStep, null | "complete">,
  string
> = {
  age_gate_done: "/(onboarding)/consent",
  consent_done: "/(onboarding)/sign-in",
  intro_done: "/(onboarding)/level-selection",
  level_selected: "/(onboarding)/reminder-setup",
  reminder_set: "/(onboarding)/permission-prompts",
  mic_permission_done: "/(onboarding)/permission-prompts",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
//  Ad Consent Type
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ad consent preference.
 *
 * - `unknown`: Not yet specified (default on first launch)
 * - `personalized`: User consents to personalized ads
 * - `non_personalized`: User opts for non-personalized ads only
 */
export type AdConsentType = "unknown" | "personalized" | "non_personalized";

// ═══════════════════════════════════════════════════════════════════════════
//  Consent State
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Consent state stored after the age gate and privacy consent screens.
 *
 * This is persisted via the backend consent API with device-scoped storage
 * for pre-auth bootstrap, then re-keyed to the user account after sign-in.
 */
export interface ConsentState {
  /** User has confirmed they are 13+ years old */
  ageVerified: boolean;
  /** User has accepted the Privacy Policy */
  privacyAccepted: boolean;
  /** User's ad consent preference */
  adConsent: AdConsentType;
}

/**
 * Initial consent state (before any user input).
 */
export const INITIAL_CONSENT_STATE: ConsentState = {
  ageVerified: false,
  privacyAccepted: false,
  adConsent: "unknown",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
//  Onboarding State
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Onboarding progress state persisted to AsyncStorage.
 */
export interface OnboardingState {
  /** Current step in the onboarding flow */
  onboardingStep: OnboardingStep;
  /** Loading state during startup resolution */
  isLoading: boolean;
  /** Error message if startup resolution failed */
  error: string | null;
}

/**
 * Initial onboarding state (first launch).
 */
export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  onboardingStep: null,
  isLoading: true,
  error: null,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
//  API Request/Response Types
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Request body for age gate submission.
 */
export interface AgeGateRequest {
  ageVerified: boolean;
}

/**
 * Request body for consent submission.
 */
export interface ConsentRequest {
  ageVerified?: boolean;
  privacyAccepted?: boolean;
  adConsent?: AdConsentType;
}

/**
 * User profile update request.
 */
export interface UserProfileUpdate {
  level?: "beginner" | "intermediate" | "advanced";
  reminderTime?: string | null;
}

/**
 * Onboarding step update request.
 */
export interface OnboardingStepRequest {
  step: OnboardingStep;
}

/**
 * User profile response from the API.
 */
export interface UserProfile {
  userId: string;
  displayName?: string;
  email?: string;
  level?: "beginner" | "intermediate" | "advanced";
  reminderTime?: string | null;
  deletionRequestedAt?: string;
  deletionStatus?: string;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Validation Helpers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Email validation regex.
 *
 * Matches standard email format: local-part@domain.tld
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address format.
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Password strength levels.
 */
export type PasswordStrength = "weak" | "medium" | "strong";

/**
 * Password validation result.
 */
export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrength;
  errors: string[];
}

/**
 * Validates a password against ShadowSpeak requirements.
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUppercase) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!hasLowercase) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!hasNumber) {
    errors.push("Password must contain at least one number");
  }

  // Calculate strength
  const criteriaMet = [hasUppercase, hasLowercase, hasNumber].filter(
    Boolean,
  ).length;
  let strength: PasswordStrength;

  if (password.length < 8 || criteriaMet < 2) {
    strength = "weak";
  } else if (criteriaMet < 3) {
    strength = "medium";
  } else {
    strength = "strong";
  }

  return {
    isValid: errors.length === 0,
    strength,
    errors,
  };
}
