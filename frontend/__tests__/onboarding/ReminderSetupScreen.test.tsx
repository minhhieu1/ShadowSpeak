/**
 * Tests for ReminderSetupScreen.
 */

import renderer from "react-test-renderer";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock onboarding API
jest.mock("@/features/onboarding/services/onboardingApi", () => ({
  saveReminder: jest.fn().mockResolvedValue({ userId: "user-123", reminderTime: "07:00" }),
  saveOnboardingStep: jest.fn().mockResolvedValue(undefined),
}));

// Mock onboarding store
jest.mock("@/features/onboarding/stores/onboardingStore", () => ({
  useOnboardingStore: (selector: any) =>
    selector({
      onboardingStep: null,
      isLoading: false,
      error: null,
      isComplete: false,
      setStep: jest.fn(),
      setComplete: jest.fn(),
      setLoading: jest.fn(),
      setError: jest.fn(),
      reset: jest.fn(),
      resolveStartupState: jest.fn(),
    }),
}));

import ReminderSetupScreen from "@/features/onboarding/screens/ReminderSetupScreen";

describe("ReminderSetupScreen", () => {
  it("renders without crashing", () => {
    const tree = renderer.create(<ReminderSetupScreen />).toJSON();
    expect(tree).toBeDefined();
  });
});
