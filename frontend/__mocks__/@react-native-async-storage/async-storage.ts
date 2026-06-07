/**
 * Mock for @react-native-async-storage/async-storage.
 * In-memory map so tests verify reads/writes without React Native runtime.
 *
 * Uses module.exports (CJS) because moduleNameMapper in Jest bypasses the
 * transform pipeline for resolved paths — export/import syntax would fail.
 */

const store: Record<string, string> = {};

function __resetMockStore(): void {
  Object.keys(store).forEach((k) => delete store[k]);
}

async function setItem(key: string, value: string): Promise<void> {
  store[key] = value;
}

async function getItem(key: string): Promise<string | null> {
  return store[key] ?? null;
}

async function removeItem(key: string): Promise<void> {
  delete store[key];
}

async function clear(): Promise<void> {
  Object.keys(store).forEach((k) => delete store[k]);
}

async function getAllKeys(): Promise<string[]> {
  return Object.keys(store);
}

// Default export for `import X from '…'` usage in tokenStorage.ts
const defaultExport = { setItem, getItem, removeItem, clear, getAllKeys };

export = { __resetMockStore, setItem, getItem, removeItem, clear, getAllKeys, default: defaultExport };
