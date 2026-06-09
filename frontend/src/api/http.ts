/**
 * HTTP layer for ShadowSpeak — typed HTTP helpers and error normalisation.
 *
 * This module is the **bridge between transport** (`client.ts`) and **business
 * logic** (domain-specific service modules).  Domain modules import the typed
 * helpers (`apiGet`, `apiPost`, …) and call them without ever touching Axios
 * directly.
 *
 * ┌──────────────────────────┐
 * │   Domain service modules │  e.g. lessons/service.ts
 * ├──────────────────────────┤
 * │        http.ts           │  apiGet<T> / apiPost<T> / ApiError
 * ├──────────────────────────┤
 * │      client.ts           │  Axios instance + JsonEnvelope<T>
 * └──────────────────────────┘
 *
 * AuthManager lives in `features/auth/store.ts` — import it from there.
 */

import {
  type AxiosError,
} from 'axios';
import { apiClient, __setAuthDelegate, type JsonEnvelope, type TokenRefreshFn } from './client';
import { AuthManager } from '../features/auth/store/AuthManager';

// ═══════════════════════════════════════════════════════════════════════════
//  Wire interceptors — inject AuthManager callbacks into client.ts
// ═══════════════════════════════════════════════════════════════════════════

/**
 * After the AuthManager singleton is defined, inject its methods into the
 * client.ts AuthDelegate so the interceptors registered there can access
 * tokens without a circular import.
 *
 * The auth-callback properties (`onTokenRefresh`, `onAuthExpired`) are NOT
 * snapshotted here — they are read from AuthManager dynamically at call time
 * via getter lambdas.  This way the app layer can set them on the AuthManager
 * instance after module init and the interceptor still picks them up.
 */
__setAuthDelegate({
  getAccessToken: () => AuthManager.getInstance().getAccessToken(),
  getRefreshToken: () => AuthManager.getInstance().getRefreshToken(),
  setAccessToken: (token) => AuthManager.getInstance().setAccessToken(token),
  expire: () => AuthManager.getInstance().expire(),

  // Getters — always read from AuthManager at call time, not captured at init.
  get onTokenRefresh() {
    return AuthManager.getInstance().onTokenRefresh;
  },
  get onAuthExpired() {
    return AuthManager.getInstance().onAuthExpired;
  },
});

// ═══════════════════════════════════════════════════════════════════════════
//  Error normalisation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalised API error that all call sites can switch on.
 */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

/**
 * Convert any thrown value into a consistent `ApiError`.
 *
 * Handles four cases:
 *
 * 1. **ApiClientError** (our own marker) — the request reached the server and
 *    got a successful HTTP status, but the `JsonEnvelope` had `ok: false`.
 *    We already have structured fields ready to go.
 * 2. **AxiosError with a backend response** — extracts the `JsonEnvelope`
 *    error fields and the HTTP status code.
 * 3. **AxiosError without a response** (network error, timeout) — surfaces
 *    the connection failure as a friendly message with status `0`.
 * 4. **Anything else** — a safety net that wraps unexpected errors.
 */
function toApiError(error: unknown): ApiError {
  // -- Case 1: our own marker (envelope returned ok: false) ------------------
  if (error instanceof ApiClientError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details,
      requestId: error.requestId,
    };
  }

  const axiosError = error as AxiosError<JsonEnvelope<unknown>>;

  // -- Case 2: the server responded with a non-2xx status code ---------------
  if (axiosError.response) {
    const envelope = axiosError.response.data;
    return {
      status: axiosError.response.status,
      code: envelope?.error?.code ?? 'UNKNOWN_ERROR',
      message: envelope?.error?.message ?? 'An unexpected error occurred',
      details: envelope?.error?.details,
      requestId: envelope?.requestId,
    };
  }

  // -- Case 3: the request was made but no response was received -------------
  if (axiosError.request) {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message:
        axiosError.message ??
        'Unable to reach the server. Please check your connection.',
    };
  }

  // -- Case 4: unexpected error (coding mistake, config error, etc.) ---------
  return {
    status: 0,
    code: 'CLIENT_ERROR',
    message:
      error instanceof Error
        ? error.message
        : 'An unexpected client error occurred',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  Typed HTTP helpers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Each helper:
 *
 * 1. Calls the corresponding `apiClient` method with the path and optional body.
 * 2. Expects the response data to conform to `JsonEnvelope<T>`.
 * 3. Unwraps the envelope and returns `envelope.data` on success.
 * 4. On failure, normalises the error and throws `ApiError`.
 *
 * Why `response.data` (Axios parses JSON automatically)?
 * -------------------------------------------------------
 * By default Axios parses the response body as JSON when the content-type
 * suggests it.  `response.data` is the parsed JSON, which for our backend is
 * always the `JsonEnvelope<T>` shape.  We never need to call `.json()`
 * ourselves.
 *
 * Why return `T` instead of `AxiosResponse<JsonEnvelope<T>>`?
 * ------------------------------------------------------------
 * Consumers care about the business data, not the transport details (status
 * code, headers, raw envelope).  Unwrapping here saves every call site from
 * having to write `response.data.data`.
 */

/**
 * Perform a GET request.
 *
 * @example
 * ```ts
 * const lessons = await apiGet<Lesson[]>('/v1/lessons');
 * ```
 */
export async function apiGet<T>(path: string): Promise<T> {
  try {
    const response = await apiClient.get<JsonEnvelope<T>>(path);
    const envelope = response.data;

    if (!envelope.ok || envelope.data === undefined) {
      throw new ApiClientError(
        envelope.error?.code ?? 'UNKNOWN_ERROR',
        envelope.error?.message ?? 'Request failed',
        response.status,
        envelope.error?.details,
        envelope.requestId,
      );
    }

    return envelope.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Perform a POST request.
 *
 * @example
 * ```ts
 * const session = await apiPost<Session>('/v1/sessions', { lessonId });
 * ```
 */
export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  try {
    const response = await apiClient.post<JsonEnvelope<T>>(path, body);
    const envelope = response.data;

    if (!envelope.ok || envelope.data === undefined) {
      throw new ApiClientError(
        envelope.error?.code ?? 'UNKNOWN_ERROR',
        envelope.error?.message ?? 'Request failed',
        response.status,
        envelope.error?.details,
        envelope.requestId,
      );
    }

    return envelope.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Perform a PUT request.
 *
 * @example
 * ```ts
 * const profile = await apiPut<UserProfile>('/v1/me', { name });
 * ```
 */
export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  try {
    const response = await apiClient.put<JsonEnvelope<T>>(path, body);
    const envelope = response.data;

    if (!envelope.ok || envelope.data === undefined) {
      throw new ApiClientError(
        envelope.error?.code ?? 'UNKNOWN_ERROR',
        envelope.error?.message ?? 'Request failed',
        response.status,
        envelope.error?.details,
        envelope.requestId,
      );
    }

    return envelope.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Perform a PATCH request.
 *
 * @example
 * ```ts
 * await apiPatch<void>('/v1/me/onboarding-step', { step: 2 });
 * ```
 */
export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  try {
    const response = await apiClient.patch<JsonEnvelope<T>>(path, body);
    const envelope = response.data;

    if (!envelope.ok || envelope.data === undefined) {
      throw new ApiClientError(
        envelope.error?.code ?? 'UNKNOWN_ERROR',
        envelope.error?.message ?? 'Request failed',
        response.status,
        envelope.error?.details,
        envelope.requestId,
      );
    }

    return envelope.data;
  } catch (error) {
    throw toApiError(error);
  }
}

/**
 * Perform a DELETE request.
 *
 * @example
 * ```ts
 * await apiDelete<void>('/v1/account');
 * ```
 */
export async function apiDelete<T>(path: string): Promise<T> {
  try {
    const response = await apiClient.delete<JsonEnvelope<T>>(path);
    const envelope = response.data;

    if (!envelope.ok || envelope.data === undefined) {
      throw new ApiClientError(
        envelope.error?.code ?? 'UNKNOWN_ERROR',
        envelope.error?.message ?? 'Request failed',
        response.status,
        envelope.error?.details,
        envelope.requestId,
      );
    }

    return envelope.data;
  } catch (error) {
    throw toApiError(error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Internal error helper
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Thin marker class used by the HTTP helpers to distinguish a "business
 * logic rejection" (the envelope said `ok: false`) from a transport error
 * (network failure, 5xx, etc.).
 *
 * The `toApiError` function converts both into a unified `ApiError`, so
 * consumers never deal with this class directly.  We keep it separate only
 * to avoid double-wrapping inside the try/catch of each helper.
 */
class ApiClientError {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
    public readonly requestId?: string,
  ) {}
}
