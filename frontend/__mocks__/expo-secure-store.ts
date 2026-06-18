/**
 * Mock for expo-secure-store.
 * In-memory store so tests can verify reads/writes without native device.
 *
 * Provides test helpers:
 * - __setAvailable(boolean) - simulate SecureStore availability
 * - __setShouldThrow(boolean) - simulate runtime errors
 * - __resetMockStore() - reset state between tests
 *
 * Uses module.exports format for Jest moduleNameMapper compatibility.
 */

const store: Record<string, string> = {};
let available = true;
let shouldThrow = false;

// Track calls for test assertions
const calls: {
  getItemAsync: any[][];
  setItemAsync: any[][];
  deleteItemAsync: any[][];
  isAvailableAsync: any[][];
} = {
  getItemAsync: [],
  setItemAsync: [],
  deleteItemAsync: [],
  isAvailableAsync: [],
};

const mockSecureStore: any = {
  __setAvailable: (v: boolean): void => {
    available = v;
  },
  __setShouldThrow: (v: boolean): void => {
    shouldThrow = v;
  },
  __resetMockStore: (): void => {
    Object.keys(store).forEach((k) => delete store[k]);
    available = true;
    shouldThrow = false;
    calls.getItemAsync = [];
    calls.setItemAsync = [];
    calls.deleteItemAsync = [];
    calls.isAvailableAsync = [];
  },
  isAvailableAsync: async (): Promise<boolean> => {
    calls.isAvailableAsync.push([]);
    return available;
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    calls.setItemAsync.push([key, value]);
    if (!available) throw new Error('SecureStore is not available');
    if (shouldThrow) throw new Error('Keychain error');
    store[key] = value;
  },
  getItemAsync: async (key: string): Promise<string | null> => {
    calls.getItemAsync.push([key]);
    if (!available) throw new Error('SecureStore is not available');
    if (shouldThrow) throw new Error('Keychain error');
    return store[key] ?? null;
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    calls.deleteItemAsync.push([key]);
    if (!available) throw new Error('SecureStore is not available');
    if (shouldThrow) throw new Error('Keychain error');
    delete store[key];
  },
};

// Add mock property for jest-style assertions
Object.defineProperty(mockSecureStore.isAvailableAsync, 'mock', {
  get: () => ({ calls: calls.isAvailableAsync }),
});

Object.defineProperty(mockSecureStore.setItemAsync, 'mock', {
  get: () => ({ calls: calls.setItemAsync }),
});

Object.defineProperty(mockSecureStore.getItemAsync, 'mock', {
  get: () => ({ calls: calls.getItemAsync }),
});

Object.defineProperty(mockSecureStore.deleteItemAsync, 'mock', {
  get: () => ({ calls: calls.deleteItemAsync }),
});

module.exports = mockSecureStore;
