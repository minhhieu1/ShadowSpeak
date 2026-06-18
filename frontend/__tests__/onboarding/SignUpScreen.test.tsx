/**
 * Tests for SignUpScreen.
 */

import renderer from "react-test-renderer";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock auth service
jest.mock("@/features/onboarding/services/authService", () => ({
  register: jest.fn().mockResolvedValue({ ok: true, requiresSignUp: false }),
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

import SignUpScreen from "@/features/auth/screens/SignUpScreen";

describe("SignUpScreen", () => {
  it("renders without crashing", () => {
    const tree = renderer.create(<SignUpScreen />).toJSON();
    expect(tree).toBeDefined();
  });
});
