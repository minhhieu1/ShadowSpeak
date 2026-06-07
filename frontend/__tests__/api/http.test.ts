import MockAdapter from 'axios-mock-adapter';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../../src/api/client';
import {
  AuthManager,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  type ApiError,
} from '../../src/api/http';

let mock: MockAdapter;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Reset AuthManager singleton state for test isolation. */
function resetAuthManager() {
  AuthManager.resetInstance();
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  resetAuthManager();
  (SecureStore as any).__resetMockStore?.();
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

// ═══════════════════════════════════════════════════════════════════════════
//  AuthManager
// ═══════════════════════════════════════════════════════════════════════════

describe('AuthManager', () => {
  describe('singleton', () => {
    it('getInstance() returns the same instance every time', () => {
      const a = AuthManager.getInstance();
      const b = AuthManager.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('getAccessToken / setAccessToken', () => {
    it('returns null when no token has been set', () => {
      expect(AuthManager.getInstance().getAccessToken()).toBeNull();
    });

    it('returns the token after setAccessToken', () => {
      const am = AuthManager.getInstance();
      am.setAccessToken('my-token');
      expect(am.getAccessToken()).toBe('my-token');
    });
  });

  describe('clear()', () => {
    it('resets the in-memory token to null', () => {
      const am = AuthManager.getInstance();
      am.setAccessToken('to-clear');
      am.clear();
      expect(am.getAccessToken()).toBeNull();
    });

    it('also clears the refresh token', () => {
      const am = AuthManager.getInstance();
      am.setAccessToken('tok');
      am.setRefreshToken('ref');
      am.clear();
      expect(am.getAccessToken()).toBeNull();
      expect(am.getRefreshToken()).toBeNull();
    });
  });

  describe('refresh token', () => {
    it('starts as null', () => {
      expect(AuthManager.getInstance().getRefreshToken()).toBeNull();
    });

    it('stores and returns a refresh token', () => {
      const am = AuthManager.getInstance();
      am.setRefreshToken('my-refresh');
      expect(am.getRefreshToken()).toBe('my-refresh');
    });

    it('clearRefreshToken resets it to null', () => {
      const am = AuthManager.getInstance();
      am.setRefreshToken('to-clear');
      am.clearRefreshToken();
      expect(am.getRefreshToken()).toBeNull();
    });
  });

  describe('expire()', () => {
    it('clears both tokens and calls onAuthExpired', () => {
      const onAuthExpired = jest.fn();
      const am = AuthManager.getInstance();
      am.setAccessToken('tok');
      am.setRefreshToken('ref');
      am.onAuthExpired = onAuthExpired;

      am.expire();

      expect(am.getAccessToken()).toBeNull();
      expect(am.getRefreshToken()).toBeNull();
      expect(onAuthExpired).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadFromStorage()', () => {
    it('hydrates token when storage has one and memory is empty', async () => {
      // Write directly to SecureStore mock so getToken() picks it up.
      await (SecureStore as any).setItemAsync('auth_token', 'stored-token');

      const am = AuthManager.getInstance();
      expect(am.getAccessToken()).toBeNull();

      await am.loadFromStorage();
      expect(am.getAccessToken()).toBe('stored-token');
    });

    it('does not overwrite an already-loaded token', async () => {
      const am = AuthManager.getInstance();
      am.setAccessToken('in-memory');

      await am.loadFromStorage();
      expect(am.getAccessToken()).toBe('in-memory');
    });

    it('hydrates both access and refresh tokens from storage', async () => {
      await (SecureStore as any).setItemAsync('auth_token', 'access-123');
      await (SecureStore as any).setItemAsync('refresh_token', 'refresh-456');

      const am = AuthManager.getInstance();
      expect(am.getAccessToken()).toBeNull();
      expect(am.getRefreshToken()).toBeNull();

      await am.loadFromStorage();
      expect(am.getAccessToken()).toBe('access-123');
      expect(am.getRefreshToken()).toBe('refresh-456');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  Request interceptor (auth header injection)
// ═══════════════════════════════════════════════════════════════════════════

describe('request interceptor', () => {
  it('attaches Authorization header when token is set', async () => {
    AuthManager.getInstance().setAccessToken('my-api-token');

    let capturedHeaders: any;
    mock.onGet('/v1/me').reply((config) => {
      capturedHeaders = config.headers;
      return [200, { ok: true, requestId: 'r1', data: { id: 'u1' } }];
    });

    await apiGet<{ id: string }>('/v1/me');
    expect(capturedHeaders?.Authorization).toBe('Bearer my-api-token');
  });

  it('does NOT attach Authorization header when no token is set', async () => {
    // AuthManager has no token by default

    let capturedHeaders: any;
    mock.onGet('/health').reply((config) => {
      capturedHeaders = config.headers;
      return [200, { ok: true, requestId: 'r2', data: { status: 'ok' } }];
    });

    await apiGet<{ status: string }>('/health');
    expect(capturedHeaders?.Authorization).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  Response interceptor (401 handling)
// ═══════════════════════════════════════════════════════════════════════════

describe('response interceptor — 401 handling', () => {
  it('passes through 2xx responses unchanged', async () => {
    mock.onGet('/v1/lessons').reply(200, {
      ok: true,
      requestId: 'r3',
      data: [{ id: 'lesson-1' }],
    });

    const result = await apiGet<Array<{ id: string }>>('/v1/lessons');
    expect(result).toEqual([{ id: 'lesson-1' }]);
  });

  it('passes through non-401 errors unchanged', async () => {
    mock.onGet('/v1/me').reply(500, {
      ok: false,
      requestId: 'r4',
      error: { code: 'SYSTEM_ERROR', message: 'Internal error' },
    });

    await expect(apiGet('/v1/me')).rejects.toMatchObject({
      status: 500,
      code: 'SYSTEM_ERROR',
    });
  });

  it('clears auth and calls onAuthExpired on 401 when no refresh is possible', async () => {
    const onAuthExpired = jest.fn();
    AuthManager.getInstance().setAccessToken('expired-token');
    AuthManager.getInstance().onAuthExpired = onAuthExpired;

    mock.onGet('/v1/me').reply(401, {
      ok: false,
      requestId: 'r5',
      error: { code: 'AUTH_UNAUTHORIZED', message: 'Token expired' },
    });

    await expect(apiGet('/v1/me')).rejects.toMatchObject({
      status: 401,
      code: 'AUTH_UNAUTHORIZED',
    });
    expect(AuthManager.getInstance().getAccessToken()).toBeNull();
    expect(onAuthExpired).toHaveBeenCalledTimes(1);
  });

  it('retries original request after refresh via onTokenRefresh callback', async () => {
    const onAuthExpired = jest.fn();
    const am = AuthManager.getInstance();
    am.setAccessToken('expired');
    am.onTokenRefresh = jest.fn().mockResolvedValue({ accessToken: 'fresh-token' });
    am.onAuthExpired = onAuthExpired;

    // First call: 401. Second call (retry): 200.
    let callCount = 0;
    mock.onGet('/v1/me').reply(() => {
      callCount++;
      if (callCount === 1) {
        return [
          401,
          {
            ok: false,
            requestId: 'r-401',
            error: { code: 'AUTH_UNAUTHORIZED', message: 'expired' },
          },
        ];
      }
      return [
        200,
        { ok: true, requestId: 'r-retry', data: { id: 'u1' } },
      ];
    });

    const result = await apiGet<{ id: string }>('/v1/me');
    expect(result).toEqual({ id: 'u1' });
    expect(am.getAccessToken()).toBe('fresh-token');
    expect(am.onTokenRefresh).toHaveBeenCalledTimes(1);
    expect(onAuthExpired).not.toHaveBeenCalled();
  });

  it('calls onAuthExpired when onTokenRefresh throws', async () => {
    const onAuthExpired = jest.fn();
    const am = AuthManager.getInstance();
    am.setAccessToken('expired');
    am.onTokenRefresh = jest.fn().mockRejectedValue(new Error('Refresh failed'));
    am.onAuthExpired = onAuthExpired;

    mock.onGet('/v1/me').reply(401, {
      ok: false,
      requestId: 'r6',
      error: { code: 'AUTH_UNAUTHORIZED', message: 'expired' },
    });

    await expect(apiGet('/v1/me')).rejects.toMatchObject({
      status: 401,
      code: 'AUTH_UNAUTHORIZED',
    });
    expect(am.getAccessToken()).toBeNull();
    expect(onAuthExpired).toHaveBeenCalledTimes(1);
  });

  it('calls onAuthExpired on second 401 after refresh attempt', async () => {
    const onAuthExpired = jest.fn();
    const am = AuthManager.getInstance();
    am.setAccessToken('expired');
    am.onTokenRefresh = jest.fn().mockResolvedValue({ accessToken: 'fresh' });
    am.onAuthExpired = onAuthExpired;

    // Both calls return 401 (refresh worked but new token also expired).
    mock.onGet('/v1/me').reply(401, {
      ok: false,
      requestId: 'r7',
      error: { code: 'AUTH_UNAUTHORIZED', message: 'still expired' },
    });

    await expect(apiGet('/v1/me')).rejects.toMatchObject({
      status: 401,
      code: 'AUTH_UNAUTHORIZED',
    });
    // onTokenRefresh was called (first 401 triggers it), but the retry
    // also 401s, so now onAuthExpired fires.
    expect(am.onTokenRefresh).toHaveBeenCalledTimes(1);
    expect(am.getAccessToken()).toBeNull();
    expect(onAuthExpired).toHaveBeenCalledTimes(1);
  });

  it('passes through errors without a config object', async () => {
    // Simulate a network-level error that the response interceptor can't
    // associate with any request config (e.g. a setup error).
    mock.onGet('/v1/me').networkError();

    let error: ApiError | undefined;
    try {
      await apiGet('/v1/me');
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error!.status).toBe(0);
    expect(error!.code).toMatch(/^(NETWORK_ERROR|CLIENT_ERROR)$/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  Typed HTTP helpers — success path
// ═══════════════════════════════════════════════════════════════════════════

describe('HTTP helpers — success', () => {
  it('apiGet unwraps envelope.data', async () => {
    mock.onGet('/v1/lessons').reply(200, {
      ok: true,
      requestId: 'r6',
      data: [{ id: 'l1' }],
    });

    const data = await apiGet<Array<{ id: string }>>('/v1/lessons');
    expect(data).toEqual([{ id: 'l1' }]);
  });

  it('apiPost unwraps envelope.data', async () => {
    mock.onPost('/v1/sessions').reply(201, {
      ok: true,
      requestId: 'r7',
      data: { sessionId: 's1' },
    });

    const data = await apiPost<{ sessionId: string }>('/v1/sessions', {
      lessonId: 'l1',
    });
    expect(data).toEqual({ sessionId: 's1' });
  });

  it('apiPut unwraps envelope.data', async () => {
    mock.onPut('/v1/me').reply(200, {
      ok: true,
      requestId: 'r8',
      data: { name: 'Updated' },
    });

    const data = await apiPut<{ name: string }>('/v1/me', { name: 'Updated' });
    expect(data).toEqual({ name: 'Updated' });
  });

  it('apiPatch unwraps envelope.data', async () => {
    mock.onPatch('/v1/me/onboarding-step').reply(200, {
      ok: true,
      requestId: 'r9',
      data: { step: 2 },
    });

    const data = await apiPatch<{ step: number }>(
      '/v1/me/onboarding-step',
      { step: 2 },
    );
    expect(data).toEqual({ step: 2 });
  });

  it('apiDelete unwraps envelope.data', async () => {
    mock.onDelete('/v1/account').reply(200, {
      ok: true,
      requestId: 'r10',
      data: { deleted: true },
    });

    const data = await apiDelete<{ deleted: boolean }>('/v1/account');
    expect(data).toEqual({ deleted: true });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  Typed HTTP helpers — error path
// ═══════════════════════════════════════════════════════════════════════════

describe('HTTP helpers — errors', () => {
  it('throws ApiError when envelope.ok is false', async () => {
    mock.onGet('/v1/lessons').reply(200, {
      ok: false,
      requestId: 'r11',
      error: { code: 'LESSON_NOT_FOUND', message: 'No lessons available' },
    });

    let error: ApiError | undefined;
    try {
      await apiGet('/v1/lessons');
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error!.code).toBe('LESSON_NOT_FOUND');
    expect(error!.message).toBe('No lessons available');
    expect(error!.status).toBe(200);
    expect(error!.requestId).toBe('r11');
  });

  it('throws ApiError with default values when envelope fields are missing', async () => {
    mock.onPost('/v1/sessions').reply(400, {
      ok: false,
      requestId: 'r12',
      error: undefined as any,
    });

    let error: ApiError | undefined;
    try {
      await apiPost('/v1/sessions', {});
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error!.code).toBe('UNKNOWN_ERROR');
    expect(error!.status).toBe(400);
  });

  it('throws ApiError on network failure', async () => {
    mock.onGet('/v1/me').networkError();

    let error: ApiError | undefined;
    try {
      await apiGet('/v1/me');
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error!.status).toBe(0);
    expect(error!.code).toMatch(/^(NETWORK_ERROR|CLIENT_ERROR)$/);
  });
});
