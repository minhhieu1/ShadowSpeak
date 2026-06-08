/**
 * Shared Axios HTTP client for ShadowSpeak.
 *
 * This module exports a pre-configured Axios instance (`apiClient`) that all
 * API calls go through, plus the canonical `JsonEnvelope<T>` response type
 * every backend endpoint uses as its outer wrapper.
 *
 * Interceptors (auth header, 401 refresh) are registered here so that ANYONE
 * who imports `apiClient` gets a fully-wired instance — not a bare transport.
 * The auth callbacks are injected by `http.ts` via `__setAuthDelegate()`,
 * which avoids a circular dependency:
 *
 *   client.ts  ─(export apiClient)──→  http.ts   ✓
 *   client.ts  ←(injected callback)──  http.ts   ✓ no circular import
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios';

// ═══════════════════════════════════════════════════════════════════════════
//  AuthDelegate — injected by http.ts to break the circular dep
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pluggable refresh function.
 *
 * Set `AuthManager.getInstance().onTokenRefresh` (in http.ts) to override the
 * default `POST /v1/auth/refresh` call with a Cognito SDK call or similar.
 */
export type TokenRefreshFn = () => Promise<{ accessToken: string }>;

/**
 * Minimal auth surface the interceptors need.
 *
 * http.ts injects the real implementation via `__setAuthDelegate()` after
 * defining AuthManager.  The default no-op fallbacks ensure the interceptors
 * are safe to register before the delegate is wired up.
 */
type AuthDelegate = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setAccessToken: (token: string) => void;
  expire: () => void;
  onTokenRefresh: TokenRefreshFn | null;
  onAuthExpired: (() => void) | null;
};

/** @internal Mutable reference — swapped by http.ts at module init. */
let auth: AuthDelegate = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  setAccessToken: () => {},
  expire: () => {},
  onTokenRefresh: null,
  onAuthExpired: null,
};

/**
 * @internal
 * Called once by http.ts (after AuthManager is defined) to wire the
 * real auth callbacks into the interceptors registered below.
 */
export function __setAuthDelegate(d: AuthDelegate): void {
  auth = d;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Envelope type (mirrors backend response shape)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Every ShadowSpeak API response is wrapped in this envelope.
 *
 * Success: `{ ok: true, data: T, requestId: "…" }`
 * Failure: `{ ok: false, error: { code, message, … }, requestId: "…" }`
 */
export type JsonEnvelope<T> = {
  ok: boolean;
  requestId: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

// ═══════════════════════════════════════════════════════════════════════════
//  Axios instance
// ═══════════════════════════════════════════════════════════════════════════

declare const __DEV__: boolean;

const FALLBACK_DEV_URL = 'http://127.0.0.1:8000';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (__DEV__
    ? FALLBACK_DEV_URL
    : (() => {
        throw new Error(
          'EXPO_PUBLIC_API_BASE_URL must be set in production builds. ' +
            'Use an HTTPS URL pointing to the production API server.',
        );
      })());

/**
 * Singleton Axios instance shared by every API call in the app.
 *
 * - `timeout: 15_000` — generous enough for Lambda cold-starts, tight enough
 *   to avoid hanging the UI indefinitely on a lost connection.
 * - Interceptors registered below use the injected AuthDelegate so this
 *   module never imports from `http.ts` directly.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ═══════════════════════════════════════════════════════════════════════════
//  Request interceptor — attach Bearer token
// ═══════════════════════════════════════════════════════════════════════════

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = auth.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ═══════════════════════════════════════════════════════════════════════════
//  _retry flag — prevent infinite refresh loops
// ═══════════════════════════════════════════════════════════════════════════

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Response interceptor — 401 refresh + retry
// ═══════════════════════════════════════════════════════════════════════════

/**
 * On the first 401 we attempt a single token refresh via:
 *
 *   1. The app-registered `auth.onTokenRefresh` callback (Cognito SDK, etc.)
 *      OR
 *   2. A default `POST /v1/auth/refresh` with the stored refresh token.
 *
 * If the refresh succeeds the original request is retried with the new token.
 * If it fails we clear auth state and call `auth.onAuthExpired()` so the app
 * can navigate to the login screen.
 *
 * The refresh POST uses a bare axios instance (not `apiClient`) so it never
 * re-enters this interceptor and avoids an infinite loop.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<JsonEnvelope<unknown>>) => {
    const originalRequest =
      error.config as InternalAxiosRequestConfig | undefined;

    // Only intercept 401 errors; everything else passes through.
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Already retried → give up and signal expired auth.
    if (originalRequest._retry) {
      auth.expire();
      return Promise.reject(error);
    }

    // Mark so that any subsequent 401 skips the refresh attempt.
    originalRequest._retry = true;

    // --- Attempt refresh --------------------------------------------------
    try {
      let newToken: string;

      if (auth.onTokenRefresh) {
        // App-registered custom refresh (e.g. Cognito).
        const result = await auth.onTokenRefresh();
        newToken = result.accessToken;
      } else {
        // Default: POST /v1/auth/refresh with the stored refresh token.
        // We use a bare axios instance (no interceptors) so the refresh
        // call itself never triggers this 401 handler.
        const storedRefresh = auth.getRefreshToken();
        if (!storedRefresh) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post<
          JsonEnvelope<{ accessToken: string }>
        >(
          `${API_BASE_URL}/v1/auth/refresh`,
          { refreshToken: storedRefresh },
        );

        const envelope = response.data;
        if (!envelope.ok || !envelope.data?.accessToken) {
          throw new Error('Refresh endpoint returned failure');
        }

        newToken = envelope.data.accessToken;
      }

      // Update the in-memory + persisted access token.
      auth.setAccessToken(newToken);

      // Retry the original request with the fresh token.
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return apiClient(originalRequest);
    } catch {
      // Refresh failed — auth is irrevocably expired.
      auth.expire();
      return Promise.reject(error);
    }
  },
);
