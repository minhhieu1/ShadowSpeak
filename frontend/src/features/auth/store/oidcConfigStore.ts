import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OidcConfig } from '../types/oidcConfig';
import { AUTH_KEYS } from '@/shared/constants/storageKeys';

const SECURE_STORE_KEY = 'oidc_config';
const ASYNC_STORAGE_KEY = AUTH_KEYS.OIDC_CONFIG;

async function withSecureStoreFallback<T>(
  secureAction: () => Promise<T>,
  fallbackAction: () => Promise<T>,
): Promise<T> {
  const isAvailable = await SecureStore.isAvailableAsync();

  if (isAvailable) {
    try {
      return await secureAction();
    } catch {
      console.warn('[oidcConfigStore] SecureStore failed, falling back to AsyncStorage');
    }
  }

  return await fallbackAction();
}

export async function saveOidcConfig(config: OidcConfig): Promise<void> {
  const json = JSON.stringify(config);
  return withSecureStoreFallback(
    () => SecureStore.setItemAsync(SECURE_STORE_KEY, json),
    () => AsyncStorage.setItem(ASYNC_STORAGE_KEY, json),
  );
}

export async function loadOidcConfig(): Promise<OidcConfig | null> {
  return withSecureStoreFallback(
    async () => {
      const raw = await SecureStore.getItemAsync(SECURE_STORE_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as OidcConfig;
      } catch {
        return null;
      }
    },
    async () => {
      const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as OidcConfig;
      } catch {
        return null;
      }
    },
  );
}

export async function clearOidcConfig(): Promise<void> {
  return withSecureStoreFallback(
    () => SecureStore.deleteItemAsync(SECURE_STORE_KEY),
    () => AsyncStorage.removeItem(ASYNC_STORAGE_KEY),
  );
}
