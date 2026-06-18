/**
 * Onboarding Zustand store.
 *
 * Manages the onboarding progress state and startup resolution logic.
 * Persists to AsyncStorage via Zustand persist middleware.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OnboardingStep } from "../types/onboarding";
import { ONBOARDING_STEP_TO_ROUTE } from "../types/onboarding";
import { AuthManager } from "@/features/auth/store/AuthManager";
import { STORE_KEYS } from "@/shared/constants/storageKeys";

/**
 * Onboarding store state shape.
 */
export interface OnboardingState {
  /** Current step in the onboarding flow */
  onboardingStep: OnboardingStep;
  /** Loading state during startup resolution */
  isLoading: boolean;
  /** Error message if startup resolution failed */
  error: string | null;
  /** Whether the user has completed onboarding */
  isComplete: boolean;
}

/**
 * Initial onboarding state (first launch).
 */
const INITIAL_STATE: OnboardingState = {
  onboardingStep: null,
  isLoading: true,
  error: null,
  isComplete: false,
};

/**
 * Onboarding store actions.
 */
export interface OnboardingActions {
  /** Set the current onboarding step */
  setStep: (step: OnboardingStep) => void;
  /** Mark onboarding as complete */
  setComplete: () => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error state */
  setError: (error: string | null) => void;
  /** Reset the store to initial state */
  reset: () => void;
  /** Resolve the startup state and return the route to navigate to */
  resolveStartupState: () => Promise<string>;
}

/**
 * Create the onboarding store.
 */
export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setStep: (step: OnboardingStep) => {
        set({ onboardingStep: step });
      },

      setComplete: () => {
        set({ onboardingStep: "complete", isComplete: true });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      reset: () => {
        set(INITIAL_STATE);
      },

      resolveStartupState: async (): Promise<string> => {
        const state = get();
        console.log("[OnboardingStore] Resolving startup state", state);

        // If already complete, route to home
        if (state.onboardingStep === "complete" || state.isComplete) {
          return "/(tabs)/home";
        }

        // If no onboarding step at all, start from age gate
        if (!state.onboardingStep) {
          return "/(onboarding)/age-gate";
        }

        // Map onboarding step to route
        // Use a type-safe approach by checking the step value
        const step = state.onboardingStep;

        // Handle each step explicitly to avoid TypeScript errors
        switch (step) {
          case "age_gate_done":
            return "/(onboarding)/consent";
          case "consent_done":
            return "/(onboarding)/sign-in";
          case "intro_done":
            return "/(onboarding)/level-selection";
          case "level_selected":
            return "/(onboarding)/reminder-setup";
          case "reminder_set":
          case "mic_permission_done":
            return "/(onboarding)/permission-prompts";
          default:
            return "/(onboarding)/age-gate";
        }
      },
    }),
    {
      name: STORE_KEYS.ONBOARDING,
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist onboardingStep and isComplete, not transient state
      partialize: (state) => ({
        onboardingStep: state.onboardingStep,
        isComplete: state.isComplete,
      }),
    },
  ),
);
