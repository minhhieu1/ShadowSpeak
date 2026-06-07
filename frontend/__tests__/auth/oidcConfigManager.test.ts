import { OidcConfigManager } from '../../src/auth/oidcConfigManager';
import type { OidcConfig } from '../../src/auth/oidcConfigTypes';

const sampleConfig: OidcConfig = {
  version: 1,
  provider: 'keycloak',
  issuer: 'https://auth.example.com/realms/test',
  clientId: 'test-client',
  redirectUri: 'shadowspeak://callback',
  scopes: ['openid', 'profile'],
};

// Reset the singleton between tests.
beforeEach(() => {
  OidcConfigManager.resetInstance();
});

describe('OidcConfigManager', () => {
  describe('getInstance', () => {
    it('returns the same instance every time', () => {
      const a = OidcConfigManager.getInstance();
      const b = OidcConfigManager.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('get / set', () => {
    it('returns null when no config has been set', () => {
      expect(OidcConfigManager.getInstance().get()).toBeNull();
    });

    it('returns the config after set', () => {
      const mgr = OidcConfigManager.getInstance();
      mgr.set(sampleConfig);
      expect(mgr.get()).toEqual(sampleConfig);
    });

    it('overwrites an existing config', () => {
      const mgr = OidcConfigManager.getInstance();
      mgr.set(sampleConfig);
      const updated = { ...sampleConfig, version:2 };
      mgr.set(updated);
      expect(mgr.get()?.version).toBe(2);
    });
  });

  describe('clear', () => {
    it('resets config to null', () => {
      const mgr = OidcConfigManager.getInstance();
      mgr.set(sampleConfig);
      mgr.clear();
      expect(mgr.get()).toBeNull();
    });
  });

  describe('isReady', () => {
    it('returns false when no config is set', () => {
      expect(OidcConfigManager.getInstance().isReady()).toBe(false);
    });

    it('returns true after a valid config is set', () => {
      OidcConfigManager.getInstance().set(sampleConfig);
      expect(OidcConfigManager.getInstance().isReady()).toBe(true);
    });
  });
});
