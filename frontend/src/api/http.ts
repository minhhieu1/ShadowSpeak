/**
 * HTTP layer for ShadowSpeak — AuthManager, typed HTTP helpers, and error
 * normalisation.
 *
 * This module is the **bridge between transport** (`client.ts`) and **business
 * logic** (service modules such as `authService.ts`).  Service modules import
 * the typed helpers (`apiGet`, `apiPost`, …) and call them without ever
 * touching Axios or the AuthManager directly for reads.
 *
 * ┌──────────────────────┐
 * │    Service modules   │  e.g. api/authService.ts
 * ├──────────────────────┤
 * │      http.ts         │  AuthManager + apiGet<T> / apiPost<T> / …
 * ├──────────────────────┤
 * │     client.ts        │  Axios instance + JsonEnvelope<T>
 * └──────────────────────┘
 */

import {
  type AxiosError,
} from 'axios';
import { apiClient, __setAuthDelegate, type JsonEnvelope, type TokenRefreshFn } from './client';
import {
  saveToken,
  getToken,
  clearToken,
  saveRefreshToken,
  getRefreshToken,
  clearRefreshToken,
} from '../storage/tokenStorage';

// ═══════════════════════════════════════════════════════════════════════════
//  ApiError — consistent error shape for every API consumer
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalised API error.
 *
 * Every rejected API call throws an `ApiError` instead of a raw `Error` or
 * `AxiosError`.  This gives consumers a single shape to catch regardless of
 * whether the failure comes from the backend (4xx/5xx), the network (timeout,
 * DNS failure), or a client-side mishap.
 */
export type ApiError = {
  /** HTTP status code (0 if the request never reached the server). */
  status: number;
  /** Machine-readable error code from the backend, e.g. `"AUTH_UNAUTHORIZED"`. */
  code: string;
  /** Human-readable error description. */
  message: string;
  /** Optional structured metadata returned by the backend. */
  details?: Record<string, unknown>;
  /** Request identifier for debugging / support. */
  requestId?: string;
};

// ═══════════════════════════════════════════════════════════════════════════
//  AuthManager — single source of truth for the access token
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Singleton that holds the Bearer access token in memory.
 *
 * Why a singleton rather than React Context or Zustand?
 * ------------------------------------------------------
 * The token must be readable inside Axios interceptors, which run *outside*
 * the React component tree.  A singleton is the simplest way to make the
 * token available synchronously at that layer.
 *
 * The token is loaded from persistent storage once at app startup
 * (`loadFromStorage`) and written back on every `setAccessToken` call so it
 * survives app background-kills and reboots.
 */
export class AuthManager {
  private static instance: AuthManager | undefined;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  /**
   * Pluggable refresh function, set by the app layer.
   *
   * When non-null, the 401 interceptor calls this instead of the default
   * `POST /auth/refresh` endpoint.  This is how the app wires in Cognito
   * or any other auth provider without the HTTP layer knowing about it.
   *
   * @example
   * ```ts
   * AuthManager.getInstance().onTokenRefresh = async () => {
   *   const result = await cognito.refreshSession(…);
   *   return { accessToken: result.accessToken };
   * };
   * ```
   */
  onTokenRefresh: TokenRefreshFn | null = null;

  /**
   * Callback invoked when token refresh fails irrevocably.
   *
   * The app layer should set this to a function that navigates the user
   * to the login screen or shows a "session expired" dialog.
   */
  onAuthExpired: (() => void) | null = null;

  // Private constructor enforces the singleton pattern.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /** Get (or create) the singleton instance. */
  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /** Reset singleton (for test isolation). */
  static resetInstance(): void {
    AuthManager.instance = undefined;
  }

  /**
   * Store the access token in memory AND persist it to SecureStore.
   *
   * The eager persistence means we never have to worry about flushing memory
   * to storage — the token is durable as soon as the promise settles.
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
    void saveToken(token).catch((err) =>
      console.warn('[AuthManager] Failed to persist token', err),
    );
  }

  /** Retrieve the current in-memory token, or `null` if none is set. */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Store the refresh token in memory AND persist it to SecureStore.
   */
  setRefreshToken(token: string): void {
    this.refreshToken = token;
    void saveRefreshToken(token).catch((err) =>
      console.warn('[AuthManager] Failed to persist refresh token', err),
    );
  }

  /** Retrieve the current in-memory refresh token, or `null` if none is set. */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Clear the in-memory refresh token AND delete it from SecureStore.
   */
  clearRefreshToken(): void {
    this.refreshToken = null;
    void clearRefreshToken().catch((err) =>
      console.warn('[AuthManager] Failed to clear persisted refresh token', err),
    );
  }

  /**
   * Clear the in-memory token AND delete it from SecureStore.
   *
   * Called on logout, token expiry, or failed refresh.
   */
  clear(): void {
    this.accessToken = null;
    this.refreshToken = null;
    void clearToken().catch((err) =>
      console.warn('[AuthManager] Failed to clear persisted token', err),
    );
    void clearRefreshToken().catch((err) =>
      console.warn('[AuthManager] Failed to clear persisted refresh token', err),
    );
  }

  /**
   * Clear both tokens AND notify the app that auth has expired.
   *
   * Call this when all refresh attempts have failed and the user must
   * re-authenticate.  Calling `clear()` then `onAuthExpired?.()` ensures
   * the app navigates to the login screen with a clean slate.
   */
  expire(): void {
    this.clear();
    this.onAuthExpired?.();
  }

  /**
   * Hydrate the in-memory token from persistent storage.
   *
   * Call once during app bootstrap (e.g. in `App.tsx` or an initialisation
   * module) so that any token saved during a prior session is available for
   * the first API call.  Safe to call multiple times — subsequent calls are
   * idempotent.
   */
  async loadFromStorage(): Promise<void> {
    if (this.accessToken !== null) {
      // Already have a token in memory — don't overwrite.
      return;
    }

    try {
      const [storedToken, storedRefresh] = await Promise.all([
        getToken(),
        getRefreshToken(),
      ]);
      if (storedToken) {
        this.accessToken = storedToken;
      }
      if (storedRefresh) {
        this.refreshToken = storedRefresh;
      }
    } catch (err) {
      console.warn('[AuthManager] Failed to load tokens from storage', err);
    }
  }
}

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
