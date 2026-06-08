// React Native / Metro sets __DEV__ automatically in dev builds.
// Jest does not, so we define it here so guarded code paths (token
// storage fallback, API URL fallback) work correctly in tests.
global.__DEV__ = true;
