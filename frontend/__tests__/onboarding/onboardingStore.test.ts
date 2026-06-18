/**
 * Tests for onboardingStore.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthManager } from "@/features/auth/store/AuthManager";
import { useOnboardingStore } from "@/features/onboarding/stores/onboardingStore";
import { STORE_KEYS } from "@/shared/constants/storageKeys";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/mock"),
);

// Mock AuthManager
jest.mock("@/features/auth/store/AuthManager");

describe("onboardingStore", () => {
  beforeEach(() => {
    // Reset store state between tests
    useOnboardingStore.setState({
      onboardingStep: null,
      isLoading: true,
      error: null,
      isComplete: false,
    });

    // Clear AsyncStorage
    AsyncStorage.clear();

    // Mock AuthManager
    (AuthManager.getInstance as jest.Mock).mockReturnValue({
      getAccessToken: jest.fn().mockReturnValue(null),
    });
  });

  describe("state initialization", () => {
    it("initializes with default state", () => {
      const state = useOnboardingStore.getState();

      expect(state.onboardingStep).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.isComplete).toBe(false);
    });
  });

  describe("setStep", () => {
    it("sets the onboarding step", () => {
      useOnboardingStore.getState().setStep("age_gate_done");

      const state = useOnboardingStore.getState();
      expect(state.onboardingStep).toBe("age_gate_done");
    });

    it("can set any valid step", () => {
      const steps = [
        "age_gate_done",
        "consent_done",
        "intro_done",
        "level_selected",
        "reminder_set",
        "mic_permission_done",
      ] as const;

      steps.forEach((step) => {
        useOnboardingStore.getState().setStep(step);
        expect(useOnboardingStore.getState().onboardingStep).toBe(step);
      });
    });
  });

  describe("setComplete", () => {
    it("marks onboarding as complete", () => {
      useOnboardingStore.getState().setComplete();

      const state = useOnboardingStore.getState();
      expect(state.onboardingStep).toBe("complete");
      expect(state.isComplete).toBe(true);
    });
  });

  describe("setLoading", () => {
    it("sets loading state", () => {
      useOnboardingStore.getState().setLoading(false);
      expect(useOnboardingStore.getState().isLoading).toBe(false);

      useOnboardingStore.getState().setLoading(true);
      expect(useOnboardingStore.getState().isLoading).toBe(true);
    });
  });

  describe("setError", () => {
    it("sets error state and clears loading", () => {
      useOnboardingStore.getState().setError("Test error");

      const state = useOnboardingStore.getState();
      expect(state.error).toBe("Test error");
      expect(state.isLoading).toBe(false);
    });

    it("clears error when null is passed", () => {
      useOnboardingStore.getState().setError("Test error");
      useOnboardingStore.getState().setError(null);

      expect(useOnboardingStore.getState().error).toBeNull();
    });
  });

  describe("reset", () => {
    it("resets to initial state", () => {
      useOnboardingStore.getState().setStep("level_selected");
      useOnboardingStore.getState().setComplete();
      useOnboardingStore.getState().setError("Test error");

      useOnboardingStore.getState().reset();

      const state = useOnboardingStore.getState();
      expect(state.onboardingStep).toBeNull();
      expect(state.isComplete).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(true);
    });
  });

  describe("resolveStartupState", () => {
    it("routes to home when onboarding is complete", async () => {
      useOnboardingStore.getState().setComplete();

      const route = await useOnboardingStore.getState().resolveStartupState();
      expect(route).toBe("/(tabs)/home");
    });

    it("routes to age-gate when no step exists", async () => {
      useOnboardingStore.getState().reset();

      const route = await useOnboardingStore.getState().resolveStartupState();
      expect(route).toBe("/(onboarding)/age-gate");
    });

    it("routes to correct step based on onboardingStep", async () => {
      useOnboardingStore.getState().setStep("age_gate_done");
      let route = await useOnboardingStore.getState().resolveStartupState();
      expect(route).toBe("/(onboarding)/consent");

      useOnboardingStore.getState().setStep("consent_done");
      route = await useOnboardingStore.getState().resolveStartupState();
      expect(route).toBe("/(onboarding)/sign-in");

      useOnboardingStore.getState().setStep("intro_done");
      route = await useOnboardingStore.getState().resolveStartupState();
      expect(route).toBe("/(onboarding)/level-selection");

      useOnboardingStore.getState().setStep("level_selected");
      route = await useOnboardingStore.getState().resolveStartupState();
      expect(route).toBe("/(onboarding)/reminder-setup");

      useOnboardingStore.getState().setStep("reminder_set");
      route = await useOnboardingStore.getState().resolveStartupState();
      expect(route).toBe("/(onboarding)/permission-prompts");
    });

    it("routes to age-gate as fallback for unknown step", async () => {
      // Set an invalid step (shouldn't happen but test fallback)
      useOnboardingStore.setState({ onboardingStep: "unknown" as any });

      const route = await useOnboardingStore.getState().resolveStartupState();
      expect(route).toBe("/(onboarding)/age-gate");
    });
  });

  describe("persistence", () => {
    it("persists onboardingStep to AsyncStorage", async () => {
      useOnboardingStore.getState().setStep("level_selected");

      // Wait for persist middleware to write
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stored = await AsyncStorage.getItem(STORE_KEYS.ONBOARDING);
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.onboardingStep).toBe("level_selected");
    });

    it("persists isComplete to AsyncStorage", async () => {
      useOnboardingStore.getState().setComplete();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const stored = await AsyncStorage.getItem(STORE_KEYS.ONBOARDING);
      const parsed = JSON.parse(stored!);
      expect(parsed.state.isComplete).toBe(true);
    });
  });
});
