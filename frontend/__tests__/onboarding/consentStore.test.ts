/**
 * Tests for consentStore.
 */

import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useConsentStore } from "@/features/onboarding/stores/consentStore";
import { getOrCreateDeviceId } from "@/features/onboarding/services/deviceIdService";
import { STORE_KEYS } from "@/shared/constants/storageKeys";

// Mock SecureStore and AsyncStorage
jest.mock("expo-secure-store");
jest.mock("@react-native-async-storage/async-storage", () => require("@react-native-async-storage/async-storage/mock"));

// Mock deviceIdService
jest.mock("@/features/onboarding/services/deviceIdService");

describe("consentStore", () => {
  beforeEach(() => {
    // Reset store state between tests
    useConsentStore.setState({
      ageVerified: false,
      privacyAccepted: false,
      adConsent: "unknown",
      deviceId: null,
      isLoaded: false,
    });

    // Clear mocks
    jest.clearAllMocks();
  });

  describe("state initialization", () => {
    it("initializes with default state", () => {
      const state = useConsentStore.getState();

      expect(state.ageVerified).toBe(false);
      expect(state.privacyAccepted).toBe(false);
      expect(state.adConsent).toBe("unknown");
      expect(state.deviceId).toBeNull();
      expect(state.isLoaded).toBe(false);
    });
  });

  describe("setAgeVerified", () => {
    it("sets age verification status", () => {
      useConsentStore.getState().setAgeVerified(true);
      expect(useConsentStore.getState().ageVerified).toBe(true);

      useConsentStore.getState().setAgeVerified(false);
      expect(useConsentStore.getState().ageVerified).toBe(false);
    });
  });

  describe("setPrivacyAccepted", () => {
    it("sets privacy acceptance status", () => {
      useConsentStore.getState().setPrivacyAccepted(true);
      expect(useConsentStore.getState().privacyAccepted).toBe(true);

      useConsentStore.getState().setPrivacyAccepted(false);
      expect(useConsentStore.getState().privacyAccepted).toBe(false);
    });
  });

  describe("setAdConsent", () => {
    it("sets ad consent preference", () => {
      useConsentStore.getState().setAdConsent("personalized");
      expect(useConsentStore.getState().adConsent).toBe("personalized");

      useConsentStore.getState().setAdConsent("non_personalized");
      expect(useConsentStore.getState().adConsent).toBe("non_personalized");

      useConsentStore.getState().setAdConsent("unknown");
      expect(useConsentStore.getState().adConsent).toBe("unknown");
    });
  });

  describe("loadDeviceId", () => {
    it("loads device ID from deviceIdService", async () => {
      const mockDeviceId = "test-device-id-123";
      (getOrCreateDeviceId as jest.Mock).mockResolvedValue(mockDeviceId);

      await useConsentStore.getState().loadDeviceId();

      expect(useConsentStore.getState().deviceId).toBe(mockDeviceId);
      expect(getOrCreateDeviceId).toHaveBeenCalled();
    });
  });

  describe("setConsent", () => {
    it("updates consent state from partial data", () => {
      useConsentStore.getState().setConsent({ ageVerified: true });
      expect(useConsentStore.getState().ageVerified).toBe(true);
      expect(useConsentStore.getState().privacyAccepted).toBe(false);
      expect(useConsentStore.getState().adConsent).toBe("unknown");

      useConsentStore.getState().setConsent({ privacyAccepted: true, adConsent: "personalized" });
      expect(useConsentStore.getState().privacyAccepted).toBe(true);
      expect(useConsentStore.getState().adConsent).toBe("personalized");
    });

    it("preserves existing values when updating partial data", () => {
      useConsentStore.getState().setAgeVerified(true);
      useConsentStore.getState().setPrivacyAccepted(true);
      useConsentStore.getState().setAdConsent("personalized");

      // Only update adConsent
      useConsentStore.getState().setConsent({ adConsent: "non_personalized" });

      const state = useConsentStore.getState();
      expect(state.ageVerified).toBe(true);
      expect(state.privacyAccepted).toBe(true);
      expect(state.adConsent).toBe("non_personalized");
    });
  });

  describe("setLoaded", () => {
    it("marks consent as loaded", () => {
      useConsentStore.getState().setLoaded();
      expect(useConsentStore.getState().isLoaded).toBe(true);
    });
  });

  describe("reset", () => {
    it("resets to initial state", () => {
      useConsentStore.getState().setAgeVerified(true);
      useConsentStore.getState().setPrivacyAccepted(true);
      useConsentStore.getState().setAdConsent("personalized");
      useConsentStore.getState().setLoaded();

      useConsentStore.getState().reset();

      const state = useConsentStore.getState();
      expect(state.ageVerified).toBe(false);
      expect(state.privacyAccepted).toBe(false);
      expect(state.adConsent).toBe("unknown");
      expect(state.isLoaded).toBe(false);
    });
  });

  describe("persistence", () => {
    beforeEach(() => {
      // Mock SecureStore to actually use AsyncStorage for testing
      (SecureStore.getItemAsync as jest.Mock).mockImplementation((key) =>
        AsyncStorage.getItem(key)
      );
      (SecureStore.setItemAsync as jest.Mock).mockImplementation((key, value) =>
        AsyncStorage.setItem(key, value)
      );
      (SecureStore.deleteItemAsync as jest.Mock).mockImplementation((key) =>
        AsyncStorage.removeItem(key)
      );
    });

    it("persists consent state to storage", async () => {
      useConsentStore.getState().setAgeVerified(true);
      useConsentStore.getState().setPrivacyAccepted(true);
      useConsentStore.getState().setAdConsent("personalized");

      // Wait for persist middleware to write
      await new Promise(resolve => setTimeout(resolve, 100));

      const stored = await AsyncStorage.getItem(STORE_KEYS.CONSENT);
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.ageVerified).toBe(true);
      expect(parsed.state.privacyAccepted).toBe(true);
      expect(parsed.state.adConsent).toBe("personalized");
    });

    it("persists deviceId to storage", async () => {
      const mockDeviceId = "test-device-id-123";
      (getOrCreateDeviceId as jest.Mock).mockResolvedValue(mockDeviceId);

      await useConsentStore.getState().loadDeviceId();

      await new Promise(resolve => setTimeout(resolve, 100));

      const stored = await AsyncStorage.getItem(STORE_KEYS.CONSENT);
      const parsed = JSON.parse(stored!);
      expect(parsed.state.deviceId).toBe(mockDeviceId);
    });
  });
});
