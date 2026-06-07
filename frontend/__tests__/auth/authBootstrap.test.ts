import MockAdapter from 'axios-mock-adapter';
import * as SecureStore from 'expo-secure-store';
import { apiClient, __setAuthDelegate } from '../../src/api/client';
import { authBootstrap } from '../../src/auth/authBootstrap';
import { OidcConfigManager } from '../../src/auth/oidcConfigManager';
import { saveOidcConfig } from '../../src/auth/oidcConfigStorage';
import type { OidcConfig } from '../../src/auth/oidcConfigTypes';

let mock: MockAdapter;

const backendConfig: OidcConfig = {
  version: 1,
  provider: 'cognito',
  issuer: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_test',
  clientId: 'cognito-client',
  redirectUri: 'shadowspeak://callback',
  scopes: ['openid', 'email'],
  authorizationEndpoint: 'https://test.auth.us-east-1.amazoncognito.com/oauth2/authorize',
  tokenEndpoint: 'https://test.auth.us-east-1.amazoncognito.com/oauth2/token',
};

beforeEach(() => {
  __setAuthDelegate({
    getAccessToken: () => null,
    getRefreshToken: () => null,
    setAccessToken: () => {},
    expire: () => {},
    onTokenRefresh: null,
    onAuthExpired: null,
  });
  OidcConfigManager.resetInstance();
  (SecureStore as any).__resetMockStore?.();
  mock = new MockAdapter(apiClient);
});

afterEach(() => {
  mock.restore();
});

describe('authBootstrap', () => {
  it('returns cached config when cache exists (no backend call)', async () => {
    await saveOidcConfig(backendConfig);
    // Even if backend is available, cache takes priority.
    mock.onGet('/v1/config/runtime').reply(200, { version: 2, provider: 'keycloak' } as any);

    const result = await authBootstrap();

    expect(result.ok).toBe(true);
    expect(result.source).toBe('cache');
    expect(OidcConfigManager.getInstance().get()).toEqual(backendConfig);
    // Backend should NOT have been called. If mock was hit it would reply with version 2.
    expect(OidcConfigManager.getInstance().get()?.version).toBe(1);
  });

  it('fetches config from backend when cache is empty', async () => {
    mock.onGet('/v1/config/runtime').reply(200, backendConfig);

    const result = await authBootstrap();

    expect(result.ok).toBe(true);
    expect(result.source).toBe('backend');
    expect(OidcConfigManager.getInstance().get()).toEqual(backendConfig);
  });

  it('saves fetched config to storage for next startup', async () => {
    mock.onGet('/v1/config/runtime').reply(200, backendConfig);

    await authBootstrap();

    const { loadOidcConfig } = await import('../../src/auth/oidcConfigStorage');
    const stored = await loadOidcConfig();
    expect(stored).toEqual(backendConfig);
  });

  it('falls through to backend when cached config is invalid (missing openid scope)', async () => {
    // Save an invalid config to cache (no "openid" in scopes).
    const invalidConfig: OidcConfig = {
      ...backendConfig,
      scopes: ['email'],
    };
    await saveOidcConfig(invalidConfig);
    // Backend returns valid config.
    mock.onGet('/v1/config/runtime').reply(200, backendConfig);

    const result = await authBootstrap();

    expect(result.ok).toBe(true);
    expect(result.source).toBe('backend');
    expect(OidcConfigManager.getInstance().get()).toEqual(backendConfig);
  });

  it('fails gracefully when both cache and backend are unavailable', async () => {
    mock.onGet('/v1/config/runtime').networkError();

    const result = await authBootstrap();

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(OidcConfigManager.getInstance().get()).toBeNull();
  });

  it('fails when cache is empty and backend returns invalid data', async () => {
    mock.onGet('/v1/config/runtime').reply(200, {
      version: 1,
      issuer: '',
      clientId: '',
      redirectUri: '',
      scopes: [],
      provider: 'keycloak',
    });

    const result = await authBootstrap();

    expect(result.ok).toBe(false);
    expect(result.source).toBe('none');
    expect(OidcConfigManager.getInstance().get()).toBeNull();
  });

  it('fails when cache is empty and backend returns missing fields', async () => {
    mock.onGet('/v1/config/runtime').reply(200, { badField: 'nope' } as any);

    const result = await authBootstrap();

    expect(result.ok).toBe(false);
    expect(result.source).toBe('none');
  });
});
