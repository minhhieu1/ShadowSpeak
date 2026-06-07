/**
 * Token persistence layer.
 *
 * Persists the access token to Expo Secure Store (native devices) with a graceful
 * fallback to AsyncStorage when SecureStore is unavailable (Expo Go on web, or
 * environments without the native SecureStore module).
 *
 * We use module-level functions (not a class) so consumers only import what they
 * need and tree-shaking works naturally.
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECURE_STORE_KEY = 'auth_token';
const ASYNC_STORAGE_KEY = '@shadowspeak/auth_token';

const SECURE_REFRESH_KEY = 'refresh_token';
const ASYNC_REFRESH_KEY = '@shadowspeak/refresh_token';

// -- Helpers ------------------------------------------------------------------

/**
 * Attempt to use SecureStore. Returns true on success, false if the native
 * module is unavailable (e.g. Expo Go web, SSR, or a misconfigured dev client).
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
      // SecureStore can still fail at runtime (keychain locked, device storage full).
      // Fall through to AsyncStorage rather than crash.
      console.warn(
        '[tokenStorage] SecureStore operation failed, falling back to AsyncStorage',
      );
    }
  }

  return await fallbackAction();
}

// -- Public API ---------------------------------------------------------------

/**
 * Persist the access token to secure storage.
 *
 * We save eagerly on every `setAccessToken` call so the token survives app
 * restarts and background kills. The storage key is namespaced with the project
 * name to avoid collisions if other apps share the same keychain.
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
