/**
 * Tests for the error handler service.
 */

import { ApiError } from "@/api/http";
import {
  getErrorCategory,
  getErrorRoute,
  getErrorRouteFromError,
  ErrorCategory,
} from "@/features/onboarding/services/errorHandler";

describe("errorHandler", () => {
  describe("getErrorCategory", () => {
    it("classifies network errors", () => {
      const error: ApiError = {
        status: 0,
        code: "NETWORK_ERROR",
        message: "Network error",
      };
      expect(getErrorCategory(error)).toBe("network");
    });

    it("classifies auth errors (401)", () => {
      const error: ApiError = {
        status: 401,
        code: "AUTH_UNAUTHORIZED",
        message: "Unauthorized",
      };
      expect(getErrorCategory(error)).toBe("auth_expired");
    });

    it("classifies permission errors (403)", () => {
      const error: ApiError = {
        status: 403,
        code: "CONSENT_REQUIRED",
        message: "Forbidden",
      };
      expect(getErrorCategory(error)).toBe("permission");
    });

    it("classifies validation errors (422)", () => {
      const error: ApiError = {
        status: 422,
        code: "VALIDATION_ERROR",
        message: "Invalid input",
      };
      expect(getErrorCategory(error)).toBe("validation");
    });

    it("classifies server errors (5xx)", () => {
      const error: ApiError = {
        status: 500,
        code: "SYSTEM_ERROR",
        message: "Server error",
      };
      expect(getErrorCategory(error)).toBe("server");
    });

    it("classifies client errors (4xx other than auth/permission/validation)", () => {
      const error: ApiError = {
        status: 404,
        code: "NOT_FOUND",
        message: "Not found",
      };
      expect(getErrorCategory(error)).toBe("client");
    });

    it("classifies generic Error with 'network' in message", () => {
      const error = new Error("Network connection lost");
      expect(getErrorCategory(error)).toBe("network");
    });

    it("classifies unknown errors", () => {
      const error = new Error("Something weird happened");
      expect(getErrorCategory(error)).toBe("unknown");
    });

    it("classifies null/undefined as unknown", () => {
      expect(getErrorCategory(null)).toBe("unknown");
      expect(getErrorCategory(undefined)).toBe("unknown");
    });
  });

  describe("getErrorRoute", () => {
    const cases: Array<[ErrorCategory, string]> = [
      ["network", "/network-loss"],
      ["auth_expired", "/session-expired"],
      ["permission", "/permission-recovery"],
      ["validation", "/retryable-error"],
      ["server", "/retryable-error"],
      ["client", "/retryable-error"],
      ["unknown", "/retryable-error"],
    ];

    it.each(cases)("maps %s to %s", (category, expected) => {
      expect(getErrorRoute(category)).toBe(expected);
    });
  });

  describe("getErrorRouteFromError", () => {
    it("maps network ApiError to network-loss route", () => {
      const error: ApiError = {
        status: 0,
        code: "NETWORK_ERROR",
        message: "Network error",
      };
      expect(getErrorRouteFromError(error)).toBe("/network-loss");
    });

    it("maps auth error to session-expired route", () => {
      const error: ApiError = {
        status: 401,
        code: "AUTH_UNAUTHORIZED",
        message: "Unauthorized",
      };
      expect(getErrorRouteFromError(error)).toBe("/session-expired");
    });

    it("falls back to retryable-error for unknown errors", () => {
      const error = new Error("Unknown error");
      expect(getErrorRouteFromError(error)).toBe("/retryable-error");
    });
  });
});
