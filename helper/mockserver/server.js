const http = require("http");
const mockserver = require("mockserver");
const path = require("path");

// Create mock server instance
const mock = mockserver(path.join(__dirname, "mocks"));

// Create HTTP server
const server = http.createServer(mock);

// Define port
const PORT = process.env.PORT || 3001;

// Helper function to create JsonEnvelope response
function createJsonEnvelope(data, ok = true, error = null, requestId = null) {
  return {
    requestId:
      requestId ||
      `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ok,
    data: ok ? data : null,
    error: ok ? null : error,
  };
}

// Helper function to create error response
function createErrorResponse(code, message, details = null, requestId = null) {
  return createJsonEnvelope(
    null,
    false,
    {
      code,
      message,
      details,
    },
    requestId,
  );
}

// Start server
server.listen(PORT, () => {
  console.log(
    `🚀 ShadowSpeak Mock Server is running on http://localhost:${PORT}`,
  );
  console.log(`📁 Mock files are located in: ${path.join(__dirname, "mocks")}`);
  console.log(`🔍 Available endpoints:`);
  console.log(`   GET  /v1/me - Get current user profile`);
  console.log(`   PUT  /v1/me - Update user profile`);
  console.log(`   GET  /v1/consent - Get consent state`);
  console.log(`   PUT  /v1/consent - Update consent state`);
  console.log(`   DELETE /v1/account - Delete account`);
  console.log(`   GET  /v1/lessons - Get lessons (paginated)`);
  console.log(`   GET  /v1/lessons/{id} - Get specific lesson`);
  console.log(`   GET  /v1/home/recommendation - Get daily recommendation`);
  console.log(`   POST /v1/downloads/{lessonId}/url - Get download URL`);
  console.log(`   POST /v1/downloads/{lessonId}/verify - Verify download`);
  console.log(`   GET  /v1/sessions/{id} - Get session`);
  console.log(`   POST /v1/sessions - Start session`);
  console.log(`   PATCH /v1/sessions/{id} - Update session`);
  console.log(`   POST /v1/sessions/{id}/complete - Complete session`);
  console.log(`   GET  /v1/progress - Get current progress`);
  console.log(`   GET  /v1/progress/history - Get progress history`);
  console.log(`   POST /v1/progress/sync - Sync offline progress`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Mock server is shutting down...");
  server.close(() => {
    console.log("✅ Mock server stopped");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
