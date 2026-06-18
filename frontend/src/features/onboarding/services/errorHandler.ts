/**
 * Centralized error handler for the ShadowSpeak app.
 *
 * Maps API/JS errors to the appropriate error screen route.
 * Each error category navigates to a full-screen error page from
 * the (error) route group, where the user can retry or take recovery action.
 */

import { router } from "expo-router";
import { ApiError } from "@/api/http";

/**
 * Error categories that map to dedicated error screens.
 */
export type ErrorCategory =
  | "network"
  | "auth_expired"
  | "validation"
  | "permission"
  | "server"
  | "client"
  | "unknown";

/**
 * Determine the error category from an error object.
 */
export function getErrorCategory(error: unknown): ErrorCategory {
  if (!error) return "unknown";

  // ApiError from our HTTP layer
  if (typeof error === "object" && "status" in error && "code" in error) {
    const apiError = error as ApiError;

    if (apiError.code === "NETWORK_ERROR" || apiError.status === 0) {
      return "network";
    }
    if (apiError.status === 401) {
      return "auth_expired";
    }
    if (apiError.status === 403) {
      return "permission";
    }
    if (apiError.status === 422) {
      return "validation";
    }
    if (apiError.status >= 500) {
      return "server";
    }
    if (apiError.status >= 400) {
      return "client";
    }
  }

  // Generic Error object
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("network")) {
      return "network";
    }
  }

  return "unknown";
}

/**
 * Get the error screen route for a given error category.
 */
export function getErrorRoute(category: ErrorCategory): string {
  switch (category) {
    case "network":
      return "/network-loss";
    case "auth_expired":
      return "/session-expired";
    case "permission":
      return "/permission-recovery";
    case "validation":
    case "client":
    case "server":
    case "unknown":
    default:
      return "/retryable-error";
  }
}

/**
 * Get the error screen route from an error object.
 */
export function getErrorRouteFromError(error: unknown): string {
  return getErrorRoute(getErrorCategory(error));
}

/**
 * Navigate to the appropriate error screen for the given error.
 *
 * Use this for non-recoverable errors that require a full-screen recovery flow.
 * For inline errors that the user can retry on the same screen, set local
 * error state instead.
 *
 * @param error - The error that occurred
 * @param errorCode - Optional custom error code to display
 */
export function navigateToErrorScreen(
  error: unknown,
  errorCode?: string
): void {
  const category = getErrorCategory(error);
  const route = getErrorRoute(category);

  // Append error code as query param if provided
  const url = errorCode ? `${route}?code=${errorCode}` : route;
  router.replace(url as any);
}

/**
 * Handle an error during an onboarding flow step.
 *
 * For inline-recoverable errors (validation, network with retry),
 * throws so the calling screen can display the error inline.
 *
 * For blocking errors (auth expired, server errors), navigates to
 * the appropriate error screen.
 */
export function handleOnboardingError(
  error: unknown,
  options: { inlineRetry?: boolean; errorCode?: string } = {}
): void {
  const category = getErrorCategory(error);

  if (
    options.inlineRetry &&
    (category === "network" || category === "server")
  ) {
    // Let the caller handle inline retry
    throw error;
  }

  // Navigate to full-screen error recovery
  navigateToErrorScreen(error, options.errorCode);
}
