/**
 * Onboarding API service layer.
 *
 * All API calls related to the onboarding flow: consent, profile, onboarding steps.
 * Uses the shared HTTP layer (apiPut, apiGet) and handles both pre-auth (device-scoped)
 * and authenticated (JWT-scoped) requests.
 */

import { apiPut, apiGet } from "@/api/http";
import { apiClient, type JsonEnvelope } from "@/api/client";
import { AuthManager } from "@/features/auth/store/AuthManager";
import type {
  ConsentState,
  ConsentRequest,
  UserProfileUpdate,
  OnboardingStep,
  UserProfile,
} from "../types/onboarding";

/**
 * Fetch the current consent state.
 *
 * Works in two modes:
 * - Pre-auth: Uses X-Device-Id header for device-scoped consent
 * - Authenticated: Uses JWT from AuthManager for user-scoped consent
 *
 * @param deviceId - Optional device ID for pre-auth flows
 * @returns The current consent state
 */
export async function getConsent(deviceId?: string): Promise<ConsentState> {
  const headers: Record<string, string> = {};

  // Add device ID for pre-auth flows
  if (deviceId) {
    headers["X-Device-Id"] = deviceId;
  }

  // AuthManager injects JWT automatically via axios interceptor if available
  return apiGet<ConsentState>("/v1/consent");
}

/**
 * Submit consent preferences (age gate, privacy, ad consent).
 *
 * Works in two modes:
 * - Pre-auth: Uses X-Device-Id header for device-scoped consent
 * - Authenticated: Uses JWT from AuthManager for user-scoped consent
 *
 * @param consent - The consent data to submit
 * @param deviceId - Optional device ID for pre-auth flows
 * @returns The updated consent state
 */
export async function submitConsent(
  consent: ConsentRequest,
  deviceId?: string
): Promise<ConsentState> {
  const headers: Record<string, string> = {};

  if (deviceId) {
    // Validate UUID format before sending
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(deviceId)) {
      throw new Error("Invalid device ID format");
    }
    headers["X-Device-Id"] = deviceId;
  }

  // Use apiClient directly to include custom headers for pre-auth flows
  const response = await apiClient.put<JsonEnvelope<ConsentState>>(
    "/v1/consent",
    consent,
    { headers }
  );
  const envelope = response.data;
  if (!envelope.ok || !envelope.data) {
    throw new Error(envelope.error?.message || "Consent submission failed");
  }
  return envelope.data;
}

/**
 * Re-key consent from device-scoped to user-scoped after authentication.
 *
 * This is called after successful sign-in to transfer the consent state
 * that was stored with X-Device-Id to the authenticated user account.
 *
 * @param deviceId - The device ID that was used for pre-auth consent
 * @returns The re-keyed consent state
 */
export async function rekeyConsent(deviceId: string): Promise<ConsentState> {
  // The backend handles re-keying automatically when a JWT is present
  // along with the X-Device-Id header
  return apiPut<ConsentState>("/v1/consent", {
    rekeyFromDeviceId: deviceId,
  });
}

/**
 * Fetch the current user profile.
 *
 * Requires authentication (JWT).
 *
 * @returns The user profile
 */
export async function getProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>("/v1/me");
}

/**
 * Update the user profile.
 *
 * Used for saving level, reminder time, and other profile fields.
 * Partial updates are supported - only provided fields are changed.
 *
 * @param profile - The profile fields to update
 * @returns The updated user profile
 */
export async function saveProfile(
  profile: UserProfileUpdate
): Promise<UserProfile> {
  return apiPut<UserProfile>("/v1/me", profile);
}

/**
 * Save the user's proficiency level.
 *
 * Convenience wrapper around saveProfile for the level field.
 *
 * @param level - The proficiency level (beginner, intermediate, advanced)
 * @returns The updated user profile
 */
export async function saveLevel(
  level: "beginner" | "intermediate" | "advanced"
): Promise<UserProfile> {
  return saveProfile({ level });
}

/**
 * Save the user's reminder time preference.
 *
 * Convenience wrapper around saveProfile for the reminderTime field.
 *
 * @param reminderTime - The reminder time in HH:MM 24-hour format, or null to disable
 * @returns The updated user profile
 */
export async function saveReminder(
  reminderTime: string | null
): Promise<UserProfile> {
  return saveProfile({ reminderTime });
}

/**
 * Save the current onboarding step.
 *
 * Called after each onboarding screen completes to track progress
 * and enable resume functionality.
 *
 * @param step - The current onboarding step
 */
export async function saveOnboardingStep(step: OnboardingStep): Promise<void> {
  try {
    await apiClient.put("/v1/me/onboarding-step", { step });
  } catch (error) {
    console.error("[onboardingApi] Failed to save onboarding step", error);
    throw error;
  }
}

/**
 * Mark onboarding as complete.
 *
 * Called after the final onboarding step (permission prompts) to
 * indicate the user has finished onboarding and should be routed
 * to the home screen.
 */
export async function completeOnboarding(): Promise<void> {
  await saveOnboardingStep("complete");
}
