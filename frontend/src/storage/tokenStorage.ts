/**
 * Token persistence layer.
 *
 * Persists the access token to Expo Secure Store (native devices) with a graceful
 * fallback to AsyncStorage when SecureStore is unavailable — BUT ONLY in dev
 * builds. In production, SecureStore unavailability throws so tokens are never
 * persisted unencrypted.
 *
 * We use module-level functions (not a class) so consumers only import what they
 * need and tree-shaking works naturally.
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

declare const __DEV__: boolean;

const SECURE_STORE_KEY = 'auth_token';
const ASYNC_STORAGE_KEY = '@shadowspeak/auth_token';

const SECURE_REFRESH_KEY = 'refresh_token';
const ASYNC_REFRESH_KEY = '@shadowspeak/refresh_token';

// -- Helpers ------------------------------------------------------------------

/**
 * Attempt to use SecureStore. Falls back to AsyncStorage in dev builds only.
 * In production, SecureStore unavailability throws so tokens are never stored
 * unencrypted on disk.
 */
async function withSecureStoreFallback<T>(
  secureAction: () => Promise<T>,
  fallbackAction: () => Promise<T>,
): Promise<T> {
  const isAvailable = await SecureStore.isAvailableAsync();

  if (isAvailable) {
    try {
      return await secureAction();
    } catch {
      if (__DEV__) {
        console.warn(
          '[tokenStorage] SecureStore operation failed, falling back to AsyncStorage',
        );
      }
    }
  }

  // In dev, fall back to AsyncStorage for Expo Go compatibility.
  // In production, fail hard — unencrypted token storage is not acceptable.
  if (__DEV__) {
    return await fallbackAction();
  }
  throw new Error(
    'SecureStore unavailable — cannot store auth token securely in production. ' +
      'Ensure the expo-secure-store native module is available.',
  );
}

// -- Public API ---------------------------------------------------------------

/**
 * Persist the access token to secure storage.
 */
export async function saveToken(token: string): Promise<void> {
  return withSecureStoreFallback(
    () => SecureStore.setItemAsync(SECURE_STORE_KEY, token),
    () => AsyncStorage.setItem(ASYNC_STORAGE_KEY, token),
  );
}

/**
 * Retrieve the persisted access token, or `null` if none was saved.
 */
export async function getToken(): Promise<string | null> {
  return withSecureStoreFallback(
    () => SecureStore.getItemAsync(SECURE_STORE_KEY),
    () => AsyncStorage.getItem(ASYNC_STORAGE_KEY),
  );
}

/**
 * Remove the persisted access token (logout, token expiry, etc.).
 */
export async function clearToken(): Promise<void> {
  return withSecureStoreFallback(
    () => SecureStore.deleteItemAsync(SECURE_STORE_KEY),
    () => AsyncStorage.removeItem(ASYNC_STORAGE_KEY),
  );
}

/**
 * Persist the refresh token to secure storage.
 */
export async function saveRefreshToken(token: string): Promise<void> {
  return withSecureStoreFallback(
    () => SecureStore.setItemAsync(SECURE_REFRESH_KEY, token),
    () => AsyncStorage.setItem(ASYNC_REFRESH_KEY, token),
  );
}

/**
 * Retrieve the persisted refresh token, or `null` if none was saved.
 */
export async function getRefreshToken(): Promise<string | null> {
  return withSecureStoreFallback(
    () => SecureStore.getItemAsync(SECURE_REFRESH_KEY),
    () => AsyncStorage.getItem(ASYNC_REFRESH_KEY),
  );
}

/**
 * Remove the persisted refresh token (logout, failed refresh, etc.).
 */
export async function clearRefreshToken(): Promise<void> {
  return withSecureStoreFallback(
    () => SecureStore.deleteItemAsync(SECURE_REFRESH_KEY),
    () => AsyncStorage.removeItem(ASYNC_REFRESH_KEY),
  );
}
