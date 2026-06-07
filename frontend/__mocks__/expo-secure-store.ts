/**
 * Mock for expo-secure-store.
 * In-memory store so tests can verify reads/writes without native device.
 *
 * Uses module.exports (CJS) because moduleNameMapper in Jest bypasses the
 * transform pipeline for resolved paths — export/import syntax would fail.
 */

const store: Record<string, string> = {};
let available = true;
let shouldThrow = false;

function __setAvailable(v: boolean): void {
  available = v;
}

function __setShouldThrow(v: boolean): void {
  shouldThrow = v;
}

function __resetMockStore(): void {
  Object.keys(store).forEach((k) => delete store[k]);
  available = true;
  shouldThrow = false;
}

async function isAvailableAsync(): Promise<boolean> {
  return available;
}

async function setItemAsync(key: string, value: string): Promise<void> {
  if (!available) throw new Error('SecureStore is not available');
  if (shouldThrow) throw new Error('Keychain error');
  store[key] = value;
}

async function getItemAsync(key: string): Promise<string | null> {
  if (!available) throw new Error('SecureStore is not available');
  if (shouldThrow) throw new Error('Keychain error');
  return store[key] ?? null;
}

async function deleteItemAsync(key: string): Promise<void> {
  if (!available) throw new Error('SecureStore is not available');
  delete store[key];
}

export = {
  __setAvailable,
  __setShouldThrow,
  __resetMockStore,
  isAvailableAsync,
  setItemAsync,
  getItemAsync,
  deleteItemAsync,
};
