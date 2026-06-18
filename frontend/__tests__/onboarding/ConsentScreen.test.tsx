/**
 * Tests for ConsentScreen.
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

// Mock consent store
jest.mock("@/features/onboarding/stores/consentStore", () => ({
  useConsentStore: (selector: any) =>
    selector({
      ageVerified: true,
      privacyAccepted: false,
      adConsent: "unknown",
      deviceId: "test-device-id",
      isLoaded: false,
      setAgeVerified: jest.fn(),
      setPrivacyAccepted: jest.fn(),
      setAdConsent: jest.fn(),
      loadDeviceId: jest.fn(),
      setConsent: jest.fn(),
      setLoaded: jest.fn(),
      reset: jest.fn(),
    }),
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

// Mock onboarding API
jest.mock("@/features/onboarding/services/onboardingApi", () => ({
  submitConsent: jest.fn().mockResolvedValue({
    ageVerified: true,
    privacyAccepted: true,
    adConsent: "unknown",
  }),
}));

import ConsentScreen from "@/features/onboarding/screens/ConsentScreen";

describe("ConsentScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const tree = renderer.create(<ConsentScreen />).toJSON();
    expect(tree).toBeDefined();
  });
});
