/**
 * Tests for onboardingApi service layer.
 *
 * Uses axios-mock-adapter to mock HTTP requests.
 */

import MockAdapter from "axios-mock-adapter";
import { apiClient } from "@/api/client";
import {
  getConsent,
  submitConsent,
  rekeyConsent,
  getProfile,
  saveProfile,
  saveLevel,
  saveReminder,
  saveOnboardingStep,
  completeOnboarding,
} from "@/features/onboarding/services/onboardingApi";
import { AuthManager } from "@/features/auth/store/AuthManager";

const mock = new MockAdapter(apiClient);

// Mock AuthManager
jest.mock("@/features/auth/store/AuthManager");

describe("onboardingApi", () => {
  const mockDeviceId = "test-device-id-123";
  const mockJwt = "mock-jwt-token";

  beforeEach(() => {
    mock.reset();
    mock.resetHandlers();

    // Mock AuthManager
    (AuthManager.getInstance as jest.Mock).mockReturnValue({
      getAccessToken: jest.fn().mockReturnValue(mockJwt),
      getRefreshToken: jest.fn().mockReturnValue("refresh-token"),
    });
  });

  describe("getConsent", () => {
    it("fetches consent state successfully", async () => {
      const mockConsent = {
        ageVerified: true,
        privacyAccepted: true,
        adConsent: "personalized" as const,
      };

      mock.onGet("/v1/consent").reply(200, {
        ok: true,
        requestId: "test-request-id",
        data: mockConsent,
      });

      const result = await getConsent();

      expect(result).toEqual(mockConsent);
      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].url).toBe("/v1/consent");
    });
  });

  describe("submitConsent", () => {
    it("submits consent data successfully", async () => {
      const consentData = {
        ageVerified: true,
        privacyAccepted: true,
        adConsent: "personalized" as const,
      };

      const mockResponse = {
        ageVerified: true,
        privacyAccepted: true,
        adConsent: "personalized",
      };

      mock.onPut("/v1/consent").reply(200, {
        ok: true,
        requestId: "test-request-id",
        data: mockResponse,
      });

      const result = await submitConsent(consentData);

      expect(result).toEqual(mockResponse);
      expect(mock.history.put.length).toBe(1);
      expect(JSON.parse(mock.history.put[0].data)).toEqual(consentData);
    });

    it("handles partial consent updates", async () => {
      const consentData = { privacyAccepted: true };

      mock.onPut("/v1/consent").reply(200, {
        ok: true,
        requestId: "test-request-id",
        data: { ageVerified: false, privacyAccepted: true, adConsent: "unknown" },
      });

      await submitConsent(consentData);

      expect(JSON.parse(mock.history.put[0].data)).toEqual(consentData);
    });
  });

  describe("rekeyConsent", () => {
    it("calls rekey endpoint with device ID", async () => {
      mock.onPut("/v1/consent").reply(200, {
        ok: true,
        requestId: "test-request-id",
        data: { ageVerified: true, privacyAccepted: true, adConsent: "unknown" },
      });

      await rekeyConsent(mockDeviceId);

      expect(mock.history.put.length).toBe(1);
      expect(JSON.parse(mock.history.put[0].data)).toEqual({
        rekeyFromDeviceId: mockDeviceId,
      });
    });
  });

  describe("getProfile", () => {
    it("fetches user profile successfully", async () => {
      const mockProfile = {
        userId: "user-123",
        email: "user@example.com",
        level: "beginner",
        reminderTime: "08:00",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };

      mock.onGet("/v1/me").reply(200, {
        ok: true,
        requestId: "test-request-id",
        data: mockProfile,
      });

      const result = await getProfile();

      expect(result).toEqual(mockProfile);
      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].url).toBe("/v1/me");
      // Verify JWT was attached
      expect(mock.history.get[0].headers?.Authorization).toBe(`Bearer ${mockJwt}`);
    });
  });

  describe("saveProfile", () => {
    it("updates profile fields successfully", async () => {
      const profileUpdate = {
        level: "intermediate" as const,
        reminderTime: "09:00",
      };

      const mockProfile = {
        userId: "user-123",
        email: "user@example.com",
        level: "intermediate",
        reminderTime: "09:00",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      };

      mock.onPut("/v1/me").reply(200, {
        ok: true,
        requestId: "test-request-id",
        data: mockProfile,
      });

      const result = await saveProfile(profileUpdate);

      expect(result).toEqual(mockProfile);
      expect(mock.history.put.length).toBe(1);
      expect(JSON.parse(mock.history.put[0].data)).toEqual(profileUpdate);
    });
  });

  describe("saveLevel", () => {
    it("saves level to profile", async () => {
      mock.onPut("/v1/me").reply(200, {
        ok: true,
        requestId: "test-request-id",
        data: { userId: "user-123", level: "advanced" },
      });

      await saveLevel("advanced");

      expect(mock.history.put.length).toBe(1);
      expect(JSON.parse(mock.history.put[0].data)).toEqual({ level: "advanced" });
    });
  });

  describe("saveReminder", () => {
    it("saves reminder time to profile", async () => {
      mock.onPut("/v1/me").reply(200, {
        ok: true,
        requestId: "test-request-id",
        data: { userId: "user-123", reminderTime: "07:00" },
      });

      await saveReminder("07:00");

      expect(mock.history.put.length).toBe(1);
      expect(JSON.parse(mock.history.put[0].data)).toEqual({ reminderTime: "07:00" });
    });

    it("can disable reminder by passing null", async () => {
      mock.onPut("/v1/me").reply(200, {
        ok: true,
        requestId: "test-request-id",
        data: { userId: "user-123", reminderTime: null },
      });

      await saveReminder(null);

      expect(JSON.parse(mock.history.put[0].data)).toEqual({ reminderTime: null });
    });
  });

  describe("saveOnboardingStep", () => {
    it("saves onboarding step successfully", async () => {
      mock.onPut("/v1/me/onboarding-step").reply(200, {
        ok: true,
        requestId: "test-request-id",
      });

      await saveOnboardingStep("level_selected");

      expect(mock.history.put.length).toBe(1);
      expect(mock.history.put[0].url).toBe("/v1/me/onboarding-step");
      expect(JSON.parse(mock.history.put[0].data)).toEqual({ step: "level_selected" });
    });
  });

  describe("completeOnboarding", () => {
    it("marks onboarding as complete", async () => {
      mock.onPut("/v1/me/onboarding-step").reply(200, {
        ok: true,
        requestId: "test-request-id",
      });

      await completeOnboarding();

      expect(mock.history.put.length).toBe(1);
      expect(JSON.parse(mock.history.put[0].data)).toEqual({ step: "complete" });
    });
  });

  describe("error handling", () => {
    it("handles API errors for getConsent", async () => {
      mock.onGet("/v1/consent").reply(400, {
        ok: false,
        requestId: "test-request-id",
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request",
        },
      });

      try {
        await getConsent();
        fail("Expected getConsent to throw");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("handles API errors for submitConsent", async () => {
      mock.onPut("/v1/consent").reply(500, {
        ok: false,
        requestId: "test-request-id",
        error: {
          code: "SYSTEM_ERROR",
          message: "Internal server error",
        },
      });

      try {
        await submitConsent({ ageVerified: true });
        fail("Expected submitConsent to throw");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });

    it("handles network errors", async () => {
      mock.onGet("/v1/consent").networkError();

      try {
        await getConsent();
        fail("Expected getConsent to throw on network error");
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });
});
