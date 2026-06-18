/**
 * Authentication service for onboarding.
 *
 * Wraps the existing OIDC/Cognito auth flow for use in the onboarding screens.
 * Provides simple email/password authentication and triggers consent re-key
 * after successful sign-in.
 */

import { router } from "expo-router";
import { AuthManager } from "@/features/auth/store/AuthManager";
import { OidcConfigManager } from "@/features/auth/lib/oidcConfigManager";
import { rekeyConsent } from "@/features/onboarding/services/onboardingApi";
import { getOrCreateDeviceId } from "@/features/onboarding/services/deviceIdService";

/**
 * Auth result type.
 */
export type AuthResult =
  | { ok: true; requiresSignUp: false }
  | { ok: false; error: string; code: "INVALID_CREDENTIALS" | "NETWORK_ERROR" | "UNKNOWN" }
  | { ok: true; requiresSignUp: true };

/**
 * Authenticate a user with email and password.
 *
 * In a real implementation, this would integrate with the Cognito OIDC flow.
 * For the MVP onboarding flow, we simulate the authentication by:
 * 1. Setting tokens in the AuthManager
 * 2. Triggering consent re-key
 *
 * @param email - User's email
 * @param password - User's password
 * @returns Auth result
 */
export async function authenticate(
  email: string,
  password: string
): Promise<AuthResult> {
  // DEV-ONLY: Hard guard - mock auth MUST NOT run in production
  // This check is BEFORE the try block so it cannot be caught
  if (!__DEV__) {
    console.error("[authService] Mock authentication called in production - this is a build configuration error");
    throw new Error(
      "Mock authentication cannot be used in production. " +
      "Implement real OIDC/Cognito authentication before release."
    );
  }

  try {
    // Validate basic format
    if (!email || !password) {
      return {
        ok: false,
        error: "Email and password are required",
        code: "INVALID_CREDENTIALS",
      };
    }

    // Get OIDC config
    const oidcConfig = OidcConfigManager.getInstance().get();

    if (!oidcConfig) {
      // OIDC config not loaded — this is a configuration error
      if (__DEV__) {
        console.warn("[authService] OIDC config not loaded, using mock auth");
      }
    }

    const mockAccessToken = `mock-access-${Date.now()}`;
    const mockRefreshToken = `mock-refresh-${Date.now()}`;

    // Set tokens in AuthManager
    const authManager = AuthManager.getInstance();
    authManager.setAccessToken(mockAccessToken);
    authManager.setRefreshToken(mockRefreshToken);

    // Trigger consent re-key
    try {
      const deviceId = await getOrCreateDeviceId();
      if (deviceId) {
        await rekeyConsent(deviceId);
      }
    } catch (rekeyError) {
      if (__DEV__) {
        console.warn("[authService] Consent re-key failed", rekeyError);
      }
      // Don't fail auth if re-key fails
    }

    return { ok: true, requiresSignUp: false };
  } catch (error: any) {
    if (__DEV__) {
      console.error("[authService] Authentication failed", error);
    }
    return {
      ok: false,
      error: error?.message || "Authentication failed",
      code: "UNKNOWN",
    };
  }
}

/**
 * Register a new user with email and password.
 *
 * @param email - User's email
 * @param password - User's password
 * @returns Auth result
 */
export async function register(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    // Validate basic format
    if (!email || !password) {
      return {
        ok: false,
        error: "Email and password are required",
        code: "INVALID_CREDENTIALS",
      };
    }

    // In a real implementation, this would:
    // 1. Initialize Cognito User Pool
    // 2. Call cognitoUser.signUp()
    // 3. Auto-confirm via pre-sign-up trigger
    // 4. Auto sign-in to get tokens
    // 5. Set tokens in AuthManager

    // For now, simulate successful registration with auto sign-in
    const authResult = await authenticate(email, password);

    return authResult;
  } catch (error: any) {
    if (__DEV__) {
      console.error("[authService] Registration failed", error);
    }
    return {
      ok: false,
      error: error?.message || "Registration failed",
      code: "UNKNOWN",
    };
  }
}

/**
 * Sign out the current user.
 */
export function signOut(): void {
  const authManager = AuthManager.getInstance();
  authManager.clear();
}

// Re-export router for convenience
export { router };
