/**
 * Storage keys for ShadowSpeak.
 *
 * Centralized constants for all AsyncStorage and SecureStore keys.
 * Import from this file instead of hardcoding keys throughout the app.
 */

/**
 * AsyncStorage keys for Zustand stores.
 * These use dot notation for SecureStore compatibility.
 */
export const STORE_KEYS = {
  /** Onboarding store - tracks onboarding progress state */
  ONBOARDING: "shadowspeak.onboarding",
  /** Consent store - tracks age, privacy, ad consent, and device ID */
  CONSENT: "shadowspeak.consent",
} as const;

/**
 * SecureStore/AsyncStorage keys for auth tokens.
 * Uses @ prefix for namespacing.
 */
export const AUTH_KEYS = {
  /** Access token */
  ACCESS_TOKEN: "@shadowspeak/auth_token",
  /** Refresh token */
  REFRESH_TOKEN: "@shadowspeak/refresh_token",
  /** OIDC configuration */
  OIDC_CONFIG: "@shadowspeak/oidc_config",
} as const;

/**
 * SecureStore/AsyncStorage keys for other data.
 */
export const DATA_KEYS = {
  /** Device ID for pre-auth consent flows */
  DEVICE_ID: "@shadowspeak/deviceId",
} as const;

/**
 * All storage keys combined.
 * Use this for clearing all data on logout or account deletion.
 */
export const ALL_KEYS = [
  ...Object.values(STORE_KEYS),
  ...Object.values(AUTH_KEYS),
  ...Object.values(DATA_KEYS),
] as const;
