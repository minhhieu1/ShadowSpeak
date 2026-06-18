/**
 * Tests for LaunchScreen startup routing behavior.
 */

import renderer from "react-test-renderer";
import { router } from "expo-router";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock onboarding store
const mockResolveStartupState = jest.fn().mockResolvedValue("/onboarding/age-gate");
jest.mock("@/features/onboarding/stores/onboardingStore", () => ({
  useOnboardingStore: (selector: any) =>
    selector({
      onboardingStep: null,
      isLoading: false,
      error: null,
      isComplete: false,
      resolveStartupState: mockResolveStartupState,
    }),
}));

import LaunchScreen from "@/features/launch/screens/LaunchScreen";

describe("LaunchScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const tree = renderer.create(<LaunchScreen />).toJSON();
    expect(tree).toBeDefined();
  });
});
