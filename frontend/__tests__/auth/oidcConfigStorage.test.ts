import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveOidcConfig,
  loadOidcConfig,
  clearOidcConfig,
} from '../../src/auth/oidcConfigStorage';
import type { OidcConfig } from '../../src/auth/oidcConfigTypes';

const sampleConfig: OidcConfig = {
  version: 1,
  provider: 'cognito',
  issuer: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_xxx',
  clientId: 'cognito-client',
  redirectUri: 'shadowspeak://callback',
  scopes: ['openid', 'email'],
};

beforeEach(async () => {
  (SecureStore as any).__resetMockStore?.();
  (AsyncStorage as any).__resetMockStore?.();
});

describe('oidcConfigStorage', () => {
  describe('saveOidcConfig / loadOidcConfig', () => {
    it('saves and loads a valid config', async () => {
      await saveOidcConfig(sampleConfig);
      const loaded = await loadOidcConfig();
      expect(loaded).toEqual(sampleConfig);
    });

    it('returns null when no config is stored', async () => {
      const loaded = await loadOidcConfig();
      expect(loaded).toBeNull();
    });

    it('overwrites previously saved config', async () => {
      const updated: OidcConfig = { ...sampleConfig, version:2 };
      await saveOidcConfig(sampleConfig);
      await saveOidcConfig(updated);
      const loaded = await loadOidcConfig();
      expect(loaded?.version).toBe(2);
    });
  });

  describe('clearOidcConfig', () => {
    it('removes the stored config', async () => {
      await saveOidcConfig(sampleConfig);
      await clearOidcConfig();
      const loaded = await loadOidcConfig();
      expect(loaded).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('returns null on invalid JSON in storage', async () => {
      await (SecureStore as any).__setAvailable(true);
      await SecureStore.setItemAsync('oidc_config', 'not-json');
      const loaded = await loadOidcConfig();
      expect(loaded).toBeNull();
    });

    it('falls back to AsyncStorage when SecureStore is unavailable', async () => {
      (SecureStore as any).__setAvailable(false);
      await saveOidcConfig(sampleConfig);
      const stored = await AsyncStorage.getItem('@shadowspeak/oidc_config');
      expect(stored).toBeTruthy();
      const loaded = await loadOidcConfig();
      expect(loaded).toEqual(sampleConfig);
    });
  });
});
