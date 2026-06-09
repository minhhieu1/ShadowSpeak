/**
 * AuthManager — single source of truth for the access & refresh tokens.
 *
 * Why a singleton rather than React Context or Zustand?
 * ------------------------------------------------------
 * The token must be readable inside Axios interceptors, which run *outside*
 * the React component tree.  A singleton is the simplest way to make the
 * token available synchronously at that layer.
 */

import {
  saveToken,
  getToken,
  clearToken,
  saveRefreshToken,
  getRefreshToken,
  clearRefreshToken,
} from './tokenStore';

/**
 * Pluggable refresh function signature.
 *
 * Set `onTokenRefresh` to override the default `POST /v1/auth/refresh` call
 * with a Cognito SDK call or similar.
 */
export type TokenRefreshFn = () => Promise<{ accessToken: string }>;

export class AuthManager {
  private static instance: AuthManager | undefined;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  onTokenRefresh: TokenRefreshFn | null = null;
  onAuthExpired: (() => void) | null = null;

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  static resetInstance(): void {
    AuthManager.instance = undefined;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    void saveToken(token).catch((err) =>
      console.warn('[AuthManager] Failed to persist token', err),
    );
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setRefreshToken(token: string): void {
    this.refreshToken = token;
    void saveRefreshToken(token).catch((err) =>
      console.warn('[AuthManager] Failed to persist refresh token', err),
    );
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearRefreshToken(): void {
    this.refreshToken = null;
    void clearRefreshToken().catch((err) =>
      console.warn('[AuthManager] Failed to clear persisted refresh token', err),
    );
  }

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

  expire(): void {
    this.clear();
    this.onAuthExpired?.();
  }

  async loadFromStorage(): Promise<void> {
    if (this.accessToken !== null) return;

    try {
      const [storedToken, storedRefresh] = await Promise.all([
        getToken(),
        getRefreshToken(),
      ]);
      if (storedToken) this.accessToken = storedToken;
      if (storedRefresh) this.refreshToken = storedRefresh;
    } catch (err) {
      console.warn('[AuthManager] Failed to load tokens from storage', err);
    }
  }
}
