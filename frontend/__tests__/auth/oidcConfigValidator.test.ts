import { validateOidcConfig } from '../../src/auth/oidcConfigValidator';
import type { OidcConfig } from '../../src/auth/oidcConfigTypes';

const validConfig: OidcConfig = {
  version: 1,
  provider: 'keycloak',
  issuer: 'https://auth.example.com/realms/test',
  clientId: 'test-client',
  redirectUri: 'shadowspeak://callback',
  scopes: ['openid', 'profile'],
  authorizationEndpoint: 'https://auth.example.com/auth',
  tokenEndpoint: 'https://auth.example.com/token',
};

describe('validateOidcConfig', () => {
  it('passes a fully valid config', () => {
    const result = validateOidcConfig(validConfig);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('passes a valid config without optional endpoints', () => {
    const { authorizationEndpoint, tokenEndpoint, ...minimal } = validConfig;
    const result = validateOidcConfig(minimal);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when issuer is missing', () => {
    const { issuer, ...rest } = validConfig;
    const result = validateOidcConfig(rest as OidcConfig);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('issuer');
  });

  it('fails when clientId is missing', () => {
    const { clientId, ...rest } = validConfig;
    const result = validateOidcConfig(rest as OidcConfig);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('clientId');
  });

  it('fails when redirectUri is missing', () => {
    const { redirectUri, ...rest } = validConfig;
    const result = validateOidcConfig(rest as OidcConfig);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('redirectUri');
  });

  it('fails when provider is invalid', () => {
    const result = validateOidcConfig({ ...validConfig, provider: 'github' as any });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('provider');
  });

  it('fails when scopes is empty', () => {
    const result = validateOidcConfig({ ...validConfig, scopes:[] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('scopes');
  });

  it('fails when scopes lacks openid', () => {
    const result = validateOidcConfig({ ...validConfig, scopes:['email'] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('scopes (missing openid)');
  });

  it('fails when version is negative', () => {
    const result = validateOidcConfig({ ...validConfig, version: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('version');
  });

  it('returns multiple errors for multiple missing fields', () => {
    const result = validateOidcConfig({} as OidcConfig);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
