/**
 * Tests for SignInScreen.
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
  authenticate: jest.fn().mockResolvedValue({ ok: true, requiresSignUp: false }),
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

import SignInScreen from "@/features/auth/screens/SignInScreen";

describe("SignInScreen", () => {
  it("renders without crashing", () => {
    const tree = renderer.create(<SignInScreen />).toJSON();
    expect(tree).toBeDefined();
  });
});
