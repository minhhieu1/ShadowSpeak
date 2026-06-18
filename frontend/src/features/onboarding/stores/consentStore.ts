/**
 * Consent Zustand store.
 *
 * Manages the consent state (age, privacy, ad preferences) and device ID.
 * Persists to SecureStore via Zustand persist middleware (falls back to AsyncStorage).
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import type { ConsentState, AdConsentType } from "../types/onboarding";
import { getOrCreateDeviceId } from "../services/deviceIdService";
import { STORE_KEYS } from "@/shared/constants/storageKeys";

/**
 * Consent store state shape.
 */
export interface ConsentStoreState {
  /** User has confirmed they are 13+ years old */
  ageVerified: boolean;
  /** User has accepted the Privacy Policy */
  privacyAccepted: boolean;
  /** User's ad consent preference */
  adConsent: AdConsentType;
  /** Device ID for pre-auth consent flows */
  deviceId: string | null;
  /** Whether consent has been loaded from storage */
  isLoaded: boolean;
}

/**
 * Initial consent state (before any user input).
 */
const INITIAL_STATE: ConsentStoreState = {
  ageVerified: false,
  privacyAccepted: false,
  adConsent: "unknown",
  deviceId: null,
  isLoaded: false,
};

/**
 * Consent store actions.
 */
export interface ConsentStoreActions {
  /** Set age verification status */
  setAgeVerified: (verified: boolean) => void;
  /** Set privacy acceptance status */
  setPrivacyAccepted: (accepted: boolean) => void;
  /** Set ad consent preference */
  setAdConsent: (consent: AdConsentType) => void;
  /** Load device ID from storage */
  loadDeviceId: () => Promise<void>;
  /** Set consent state from API response */
  setConsent: (consent: Partial<ConsentState>) => void;
  /** Mark consent as loaded */
  setLoaded: () => void;
  /** Reset the store to initial state */
  reset: () => void;
}

/**
 * Custom storage that tries SecureStore first, falls back to AsyncStorage in __DEV__ only.
 * In production, throws an error if SecureStore is unavailable to prevent storing
 * sensitive consent data unencrypted.
 */
const consentStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      if (__DEV__) {
        console.warn("[consentStore] SecureStore unavailable, falling back to AsyncStorage (DEV only)", error);
        return await AsyncStorage.getItem(key);
      }
      console.error("[consentStore] SecureStore unavailable in production", error);
      throw error;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      if (__DEV__) {
        console.warn("[consentStore] SecureStore unavailable, falling back to AsyncStorage (DEV only)", error);
        await AsyncStorage.setItem(key, value);
        return;
      }
      console.error("[consentStore] SecureStore unavailable in production", error);
      throw error;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      if (__DEV__) {
        console.warn("[consentStore] SecureStore unavailable, falling back to AsyncStorage (DEV only)", error);
        await AsyncStorage.removeItem(key);
        return;
      }
      console.error("[consentStore] SecureStore unavailable in production", error);
      throw error;
    }
  },
};

/**
 * Create the consent store.
 */
export const useConsentStore = create<ConsentStoreState & ConsentStoreActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setAgeVerified: (verified: boolean) => {
        set({ ageVerified: verified });
      },

      setPrivacyAccepted: (accepted: boolean) => {
        set({ privacyAccepted: accepted });
      },

      setAdConsent: (consent: AdConsentType) => {
        set({ adConsent: consent });
      },

      loadDeviceId: async () => {
        const deviceId = await getOrCreateDeviceId();
        set({ deviceId });
      },

      setConsent: (consent: Partial<ConsentState>) => {
        set((state) => ({
          ...state,
          ageVerified: consent.ageVerified ?? state.ageVerified,
          privacyAccepted: consent.privacyAccepted ?? state.privacyAccepted,
          adConsent: consent.adConsent ?? state.adConsent,
        }));
      },

      setLoaded: () => {
        set({ isLoaded: true });
      },

      reset: () => {
        set(INITIAL_STATE);
      },
    }),
    {
      name: STORE_KEYS.CONSENT,
      storage: createJSONStorage(() => consentStorage),
      // Only persist consent values, not transient state
      // Note: deviceId is managed separately by deviceIdService (SecureStore)
      // and is included here only for backward compatibility
      partialize: (state) => ({
        ageVerified: state.ageVerified,
        privacyAccepted: state.privacyAccepted,
        adConsent: state.adConsent,
        deviceId: state.deviceId,
      }),
    }
  )
);
