/**
 * Tests for PermissionPromptsScreen.
 */

import renderer from "react-test-renderer";

// Mock expo-router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock permission service
jest.mock("@/features/onboarding/services/permissionService", () => ({
  getNotificationPermissionStatus: jest.fn().mockResolvedValue("undetermined"),
  getMicrophonePermissionStatus: jest.fn().mockResolvedValue("undetermined"),
  requestNotificationPermission: jest.fn().mockResolvedValue("granted"),
  requestMicrophonePermission: jest.fn().mockResolvedValue("granted"),
  openAppSettings: jest.fn(),
}));

// Mock onboarding API
jest.mock("@/features/onboarding/services/onboardingApi", () => ({
  completeOnboarding: jest.fn().mockResolvedValue(undefined),
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

import PermissionPromptsScreen from "@/features/onboarding/screens/PermissionPromptsScreen";

describe("PermissionPromptsScreen", () => {
  it("renders without crashing", () => {
    const tree = renderer.create(<PermissionPromptsScreen />).toJSON();
    expect(tree).toBeDefined();
  });
});
