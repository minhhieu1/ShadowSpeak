/**
 * Device ID service for ShadowSpeak onboarding.
 *
 * Generates a unique device identifier on first install and persists it
 * to SecureStore (with AsyncStorage fallback in __DEV__ only). This ID is
 * used for pre-auth consent flows via the X-Device-Id header.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { DATA_KEYS } from "@/shared/constants/storageKeys";

const DEVICE_ID_KEY = DATA_KEYS.DEVICE_ID;

/**
 * Generates a simple UUID v4-like string.
 * Uses crypto.getRandomValues if available, otherwise Math.random.
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    buf[6] = (buf[6] & 0x0f) | 0x40; // version 4
    buf[8] = (buf[8] & 0x3f) | 0x80; // variant 10
    const hex = Array.from(buf, (b) => b.toString(16).padStart(2, "0"));
    return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
  }
  // Fallback for environments without crypto - should not happen in production
  // Math.random is NOT cryptographically secure; this is only for __DEV__
  if (__DEV__) {
    console.warn("[deviceIdService] Using Math.random fallback - not secure, DEV only");
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets the existing device ID or creates a new one if none exists.
 *
 * The device ID is:
 * - Generated once on first app install
 * - Persisted to SecureStore (AsyncStorage fallback in __DEV__ only)
 * - Used in X-Device-Id header for pre-auth consent flows
 *
 * @returns The device ID as a UUID string
 */
export async function getOrCreateDeviceId(): Promise<string> {
  try {
    // Try SecureStore first (encrypted storage)
    try {
      const existingId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      if (existingId) {
        return existingId;
      }
    } catch (secureStoreError) {
      // SecureStore unavailable - fall through to AsyncStorage in __DEV__
      if (!__DEV__) {
        console.error("[deviceIdService] SecureStore unavailable in production", secureStoreError);
        throw new Error("SecureStore unavailable");
      }
    }

    // Fallback to AsyncStorage in __DEV__ only
    if (__DEV__) {
      const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (existingId) {
        return existingId;
      }
    }

    // Generate new UUID
    const newId = generateUUID();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
    return newId;
  } catch (error) {
    console.error("[deviceIdService] Failed to get/create device ID", error);
    // In __DEV__, fall back to AsyncStorage
    if (__DEV__) {
      try {
        const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (existingId) {
          return existingId;
        }
        const newId = generateUUID();
        await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
        return newId;
      } catch (asyncError) {
        console.error("[deviceIdService] AsyncStorage fallback also failed", asyncError);
      }
    }
    throw error;
  }
}

/**
 * Resets the device ID (for testing or logout scenarios).
 *
 * @returns Promise that resolves when the ID is cleared
 */
export async function resetDeviceId(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
  } catch {
    // Ignore SecureStore errors
  }
  if (__DEV__) {
    await AsyncStorage.removeItem(DEVICE_ID_KEY);
  }
}
