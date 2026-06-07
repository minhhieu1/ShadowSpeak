import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import {
  apiClient,
  JsonEnvelope,
  __setAuthDelegate,
  type TokenRefreshFn,
} from '../../src/api/client';

let mock: MockAdapter;

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Reset the auth delegate to its default no-op state before each test.
  // http.ts usually injects the real one at module-import time, but we
  // want clean isolation in unit tests.
  __setAuthDelegate({
    getAccessToken: () => null,
    getRefreshToken: () => null,
    setAccessToken: () => {},
    expire: () => {},
    onTokenRefresh: null,
    onAuthExpired: null,
  });

  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

// ═══════════════════════════════════════════════════════════════════════════
//  Axios instance config
// ═══════════════════════════════════════════════════════════════════════════

describe('Axios instance (apiClient)', () => {
  it('is created with the default base URL', () => {
    expect(apiClient.defaults.baseURL).toBe('http://127.0.0.1:8000/v1');
  });

  it('has a 15-second timeout', () => {
    expect(apiClient.defaults.timeout).toBe(15000);
  });

  it('has Content-Type set to application/json', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('exposes HTTP method helpers (get, post, put, patch, delete)', () => {
    expect(typeof apiClient.get).toBe('function');
    expect(typeof apiClient.post).toBe('function');
    expect(typeof apiClient.put).toBe('function');
    expect(typeof apiClient.patch).toBe('function');
    expect(typeof apiClient.delete).toBe('function');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  JsonEnvelope<T> type
// ═══════════════════════════════════════════════════════════════════════════

describe('JsonEnvelope<T> type', () => {
  it('supports a success shape', () => {
    const success: JsonEnvelope<{ id: string }> = {
      ok: true,
      requestId: 'req-1',
      data: { id: 'abc' },
    };
    expect(success.ok).toBe(true);
    expect(success.data?.id).toBe('abc');
  });

  it('supports a failure shape with error details', () => {
    const failure: JsonEnvelope<never> = {
      ok: false,
      requestId: 'req-2',
      error: { code: 'AUTH_UNAUTHORIZED', message: 'Invalid token' },
    };
    expect(failure.ok).toBe(false);
    expect(failure.error?.code).toBe('AUTH_UNAUTHORIZED');
  });

  it('allows requestId to be accessed on failure', () => {
    const failure: JsonEnvelope<never> = {
      ok: false,
      requestId: 'req-3',
      error: { code: 'NOT_FOUND', message: 'User not found' },
    };
    expect(failure.requestId).toBe('req-3');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  __setAuthDelegate
// ═══════════════════════════════════════════════════════════════════════════

describe('__setAuthDelegate', () => {
  it('replaces the default no-op delegate', () => {
    const getAccessToken = jest.fn(() => 'custom-token');
    __setAuthDelegate({
      getAccessToken,
      getRefreshToken: () => null,
      setAccessToken: () => {},
      expire: () => {},
      onTokenRefresh: null,
      onAuthExpired: null,
    });

    // Make a request — the interceptor should call our custom getAccessToken.
    let capturedHeaders: any;
    mock.onGet('/v1/me').reply((config) => {
      capturedHeaders = config.headers;
      return [200, { ok: true, requestId: 'r1', data: { id: 'u1' } }];
    });

    return apiClient.get('/v1/me').then(() => {
      expect(getAccessToken).toHaveBeenCalled();
      expect(capturedHeaders?.Authorization).toBe('Bearer custom-token');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  Request interceptor — auth header injection
// ═══════════════════════════════════════════════════════════════════════════

describe('request interceptor', () => {
  it('attaches Authorization header when token is set', async () => {
    __setAuthDelegate({
      getAccessToken: () => 'my-token',
      getRefreshToken: () => null,
      setAccessToken: () => {},
      expire: () => {},
      onTokenRefresh: null,
      onAuthExpired: null,
    });

    let capturedHeaders: any;
    mock.onGet('/v1/me').reply((config) => {
      capturedHeaders = config.headers;
      return [200, { ok: true, requestId: 'r2', data: { id: 'u1' } }];
    });

    await apiClient.get('/v1/me');
    expect(capturedHeaders?.Authorization).toBe('Bearer my-token');
  });

  it('does NOT attach Authorization header when no token', async () => {
    // Delegate returns null by default (set in beforeEach).
    let capturedHeaders: any;
    mock.onGet('/health').reply((config) => {
      capturedHeaders = config.headers;
      return [200, { ok: true, requestId: 'r3', data: { status: 'ok' } }];
    });

    await apiClient.get('/health');
    expect(capturedHeaders?.Authorization).toBeUndefined();
    expect(capturedHeaders?.Authorization).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  Response interceptor — 401 handling
// ═══════════════════════════════════════════════════════════════════════════

describe('response interceptor — 401 handling', () => {
  it('passes through 2xx responses unchanged', async () => {
    mock.onGet('/v1/lessons').reply(200, {
      ok: true,
      requestId: 'r4',
      data: [{ id: 'lesson-1' }],
    });

    const response = await apiClient.get('/v1/lessons');
    expect(response.status).toBe(200);
    expect(response.data.data).toEqual([{ id: 'lesson-1' }]);
  });

  it('passes through non-401 errors unchanged', async () => {
    mock.onGet('/v1/me').reply(500, {
      ok: false,
      requestId: 'r5',
      error: { code: 'SYSTEM_ERROR', message: 'Internal error' },
    });

    await expect(apiClient.get('/v1/me')).rejects.toMatchObject({
      response: { status: 500 },
    });
  });

  it('calls expire() on 401 when no refresh token and no onTokenRefresh', async () => {
    const expire = jest.fn();
    __setAuthDelegate({
      getAccessToken: () => 'expired',
      getRefreshToken: () => null,
      setAccessToken: () => {},
      expire,
      onTokenRefresh: null,
      onAuthExpired: null,
    });

    mock.onGet('/v1/me').reply(401, {
      ok: false,
      requestId: 'r6',
      error: { code: 'AUTH_UNAUTHORIZED', message: 'Token expired' },
    });

    await expect(apiClient.get('/v1/me')).rejects.toThrow();
    expect(expire).toHaveBeenCalledTimes(1);
  });

  it('calls expire() on 401 when onTokenRefresh throws', async () => {
    const expire = jest.fn();
    const onTokenRefresh: TokenRefreshFn = jest.fn().mockRejectedValue(new Error('Refresh failed'));

    __setAuthDelegate({
      getAccessToken: () => 'expired',
      getRefreshToken: () => 'refresh-tok',
      setAccessToken: () => {},
      expire,
      onTokenRefresh,
      onAuthExpired: null,
    });

    mock.onGet('/v1/me').reply(401, {
      ok: false,
      requestId: 'r7',
      error: { code: 'AUTH_UNAUTHORIZED', message: 'expired' },
    });

    await expect(apiClient.get('/v1/me')).rejects.toThrow();
    expect(onTokenRefresh).toHaveBeenCalledTimes(1);
    expect(expire).toHaveBeenCalledTimes(1);
  });

  it('retries original request with new token after onTokenRefresh succeeds', async () => {
    const setAccessToken = jest.fn();
    const expire = jest.fn();

    __setAuthDelegate({
      getAccessToken: () => 'expired',
      getRefreshToken: () => 'refresh-tok',
      setAccessToken,
      expire,
      onTokenRefresh: jest.fn().mockResolvedValue({ accessToken: 'fresh-token' }),
      onAuthExpired: null,
    });

    // First call 401, second call (retry) 200.
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
      return [200, { ok: true, requestId: 'r-retry', data: { id: 'u1' } }];
    });

    const response = await apiClient.get('/v1/me');
    expect(response.data).toEqual({ ok: true, requestId: 'r-retry', data: { id: 'u1' } });
    expect(setAccessToken).toHaveBeenCalledWith('fresh-token');
    expect(expire).not.toHaveBeenCalled();
  });

  it('calls expire() on second 401 after a successful refresh', async () => {
    const setAccessToken = jest.fn();
    const expire = jest.fn();

    __setAuthDelegate({
      getAccessToken: () => 'expired',
      getRefreshToken: () => 'refresh-tok',
      setAccessToken,
      expire,
      onTokenRefresh: jest.fn().mockResolvedValue({ accessToken: 'fresh' }),
      onAuthExpired: null,
    });

    // Both calls return 401.
    mock.onGet('/v1/me').reply(401, {
      ok: false,
      requestId: 'r8',
      error: { code: 'AUTH_UNAUTHORIZED', message: 'still expired' },
    });

    await expect(apiClient.get('/v1/me')).rejects.toThrow();
    // First 401 triggers refresh, second 401 triggers expire.
    expect(expire).toHaveBeenCalledTimes(1);
  });

  it('defaults to POST /auth/refresh when no onTokenRefresh is registered', async () => {
    const setAccessToken = jest.fn();
    const expire = jest.fn();

    __setAuthDelegate({
      getAccessToken: () => 'expired',
      getRefreshToken: () => 'my-refresh',
      setAccessToken,
      expire,
      onTokenRefresh: null,
      onAuthExpired: null,
    });

    // Mock the /auth/refresh endpoint on a bare axios instance (same baseURL).
    const bareMock = new MockAdapter(axios);
    bareMock.onPost('http://127.0.0.1:8000/v1/auth/refresh').reply(200, {
      ok: true,
      requestId: 'r-refresh',
      data: { accessToken: 'refreshed-token' },
    });

    mock.onGet('/v1/me').reply(401, {
      ok: false,
      requestId: 'r9',
      error: { code: 'AUTH_UNAUTHORIZED', message: 'expired' },
    });

    await expect(apiClient.get('/v1/me')).rejects.toThrow();
    // The refresh POST fires but the retry also gets 401 (only one mock reply).
    // The important thing is that setAccessToken got called with the refresh result.
    expect(setAccessToken).toHaveBeenCalledWith('refreshed-token');
    expect(expire).toHaveBeenCalledTimes(1); // because the retry also 401s

    bareMock.restore();
  });

  it('passes through errors without a config object', async () => {
    mock.onGet('/v1/me').networkError();

    await expect(apiClient.get('/v1/me')).rejects.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  TokenRefreshFn type (structural / compilation check)
// ═══════════════════════════════════════════════════════════════════════════

describe('TokenRefreshFn type', () => {
  it('accepts a valid refresh function', async () => {
    const fn: TokenRefreshFn = async () => ({ accessToken: 'abc' });
    const result = await fn();
    expect(result.accessToken).toBe('abc');
  });
});
