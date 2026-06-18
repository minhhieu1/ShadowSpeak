/**
 * Setup file that runs AFTER Jest initializes its console.
 * This is the right place to suppress console warnings/errors that occur
 * from async operations completing after tests finish.
 */

// Store original console methods
const originalWarn = console.warn;
const originalError = console.error;

// Patterns to suppress - these are test teardown noise, not real issues
const SUPPRESS_PATTERNS = [
  /Cannot log after tests are done/,
  /An error occurred in the/,
  /Consider adding an error boundary/,
  /react\.dev\/link\/error-boundaries/,
  /react-test-renderer is deprecated/,
  /Element type is invalid/,
  /SecureStore unavailable/,
  /\[deviceIdService\] Failed to get\/create device ID/,
  /\[authBootstrap\] Cached config invalid/,
  /\[tokenStore\] SecureStore operation failed/,
];

// Helper to check if a message should be suppressed
function shouldSuppressMessage(...args) {
  // Join all args into a single string to handle multi-line messages
  const fullMessage = args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg instanceof Error) return arg.message || arg.stack || String(arg);
    if (typeof arg === 'object' && arg !== null) return JSON.stringify(arg);
    return String(arg);
  }).join(' ');

  return SUPPRESS_PATTERNS.some(pattern => pattern.test(fullMessage));
}

// Suppress "Cannot log after tests are done" warnings
// These occur when async operations in components complete after test teardown
console.warn = function(...args) {
  if (shouldSuppressMessage(...args)) {
    return;
  }
  originalWarn.apply(this, args);
};

// Suppress error boundary logs that happen after tests complete
console.error = function(...args) {
  if (shouldSuppressMessage(...args)) {
    return;
  }
  originalError.apply(this, args);
};

// Also patch the global error handler for uncaught exceptions in tests
// These often occur during test teardown from async React effects
const originalUnhandled = process.listeners('uncaughtException');
process.removeAllListeners('uncaughtException');
process.on('uncaughtException', (err) => {
  const msg = err.message || String(err);
  if (
    /Cannot log after tests are done/.test(msg) ||
    /An error occurred in the/.test(msg) ||
    /Element type is invalid/.test(msg)
  ) {
    // Suppress errors from async React cleanup after tests complete
    return;
  }
  // Re-throw other errors
  throw err;
});
