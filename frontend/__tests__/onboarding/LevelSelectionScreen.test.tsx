/**
 * Tests for LevelSelectionScreen.
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
  saveLevel: jest.fn().mockResolvedValue({ userId: "user-123", level: "beginner" }),
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

import LevelSelectionScreen from "@/features/onboarding/screens/LevelSelectionScreen";

describe("LevelSelectionScreen", () => {
  it("renders without crashing", () => {
    const tree = renderer.create(<LevelSelectionScreen />).toJSON();
    expect(tree).toBeDefined();
  });
});
