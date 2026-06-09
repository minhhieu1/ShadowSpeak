import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveToken,
  getToken,
  clearToken,
  saveRefreshToken,
  getRefreshToken,
  clearRefreshToken,
} from '../../src/features/auth/store/tokenStore';

// ---------------------------------------------------------------------------
// Helpers to reset mock state between tests
// ---------------------------------------------------------------------------

beforeEach(async () => {
  (SecureStore as any).__resetMockStore?.();
  (AsyncStorage as any).__resetMockStore?.();
});

// ===========================================================================
//  SecureStore available path
// ===========================================================================

describe('when SecureStore is available', () => {
  beforeEach(() => {
    (SecureStore as any).__setAvailable(true);
  });

  it('saveToken writes to SecureStore', async () => {
    await saveToken('my-jwt');
    const stored = await SecureStore.getItemAsync('auth_token');
    expect(stored).toBe('my-jwt');
  });

  it('getToken returns the saved token', async () => {
    await SecureStore.setItemAsync('auth_token', 'saved-jwt');
    const token = await getToken();
    expect(token).toBe('saved-jwt');
  });

  it('getToken returns null when no token was saved', async () => {
    const token = await getToken();
    expect(token).toBeNull();
  });

  it('clearToken removes the token from SecureStore', async () => {
    await SecureStore.setItemAsync('auth_token', 'to-clear');
    await clearToken();
    const stored = await SecureStore.getItemAsync('auth_token');
    expect(stored).toBeNull();
  });
});

// ===========================================================================
//  SecureStore unavailable path (e.g. Expo Go on web)
// ===========================================================================

describe('when SecureStore is unavailable', () => {
  beforeEach(() => {
    (SecureStore as any).__setAvailable(false);
  });

  it('saveToken falls back to AsyncStorage', async () => {
    await saveToken('fallback-jwt');
    const stored = await AsyncStorage.getItem('@shadowspeak/auth_token');
    expect(stored).toBe('fallback-jwt');
  });

  it('getToken reads from AsyncStorage', async () => {
    await AsyncStorage.setItem('@shadowspeak/auth_token', 'stored-via-async');
    const token = await getToken();
    expect(token).toBe('stored-via-async');
  });

  it('getToken returns null when AsyncStorage is empty', async () => {
    const token = await getToken();
    expect(token).toBeNull();
  });

  it('clearToken removes from AsyncStorage', async () => {
    await AsyncStorage.setItem('@shadowspeak/auth_token', 'to-clear-async');
    await clearToken();
    const stored = await AsyncStorage.getItem('@shadowspeak/auth_token');
    expect(stored).toBeNull();
  });
});

// ===========================================================================
//  SecureStore runtime error path (module available but operation throws)
// ===========================================================================

describe('when SecureStore throws at runtime', () => {
  beforeEach(() => {
    (SecureStore as any).__setAvailable(true);
    (SecureStore as any).__setShouldThrow(true);
  });

  it('saveToken falls through to AsyncStorage on SecureStore failure', async () => {
    await saveToken('error-recovery');

    const stored = await AsyncStorage.getItem('@shadowspeak/auth_token');
    expect(stored).toBe('error-recovery');
  });

  it('getToken falls through to AsyncStorage on SecureStore failure', async () => {
    await AsyncStorage.setItem('@shadowspeak/auth_token', 'async-token');

    const token = await getToken();
    expect(token).toBe('async-token');
  });
});

// ===========================================================================
//  Refresh token persistence
// ===========================================================================

describe('refresh token', () => {
  describe('when SecureStore is available', () => {
    beforeEach(() => {
      (SecureStore as any).__setAvailable(true);
    });

    it('saveRefreshToken writes to SecureStore', async () => {
      await saveRefreshToken('my-refresh');
      const stored = await SecureStore.getItemAsync('refresh_token');
      expect(stored).toBe('my-refresh');
    });

    it('getRefreshToken returns the saved refresh token', async () => {
      await SecureStore.setItemAsync('refresh_token', 'saved-refresh');
      const token = await getRefreshToken();
      expect(token).toBe('saved-refresh');
    });

    it('getRefreshToken returns null when none was saved', async () => {
      const token = await getRefreshToken();
      expect(token).toBeNull();
    });

    it('clearRefreshToken removes from SecureStore', async () => {
      await SecureStore.setItemAsync('refresh_token', 'to-clear');
      await clearRefreshToken();
      const stored = await SecureStore.getItemAsync('refresh_token');
      expect(stored).toBeNull();
    });
  });

  describe('when SecureStore is unavailable', () => {
    beforeEach(() => {
      (SecureStore as any).__setAvailable(false);
    });

    it('saveRefreshToken falls back to AsyncStorage', async () => {
      await saveRefreshToken('rt-fallback');
      const stored = await AsyncStorage.getItem('@shadowspeak/refresh_token');
      expect(stored).toBe('rt-fallback');
    });

    it('getRefreshToken reads from AsyncStorage', async () => {
      await AsyncStorage.setItem('@shadowspeak/refresh_token', 'rt-async');
      const token = await getRefreshToken();
      expect(token).toBe('rt-async');
    });

    it('clearRefreshToken removes from AsyncStorage', async () => {
      await AsyncStorage.setItem('@shadowspeak/refresh_token', 'rt-clear');
      await clearRefreshToken();
      const stored = await AsyncStorage.getItem('@shadowspeak/refresh_token');
      expect(stored).toBeNull();
    });
  });
});
