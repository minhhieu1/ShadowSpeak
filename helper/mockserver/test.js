const http = require("http");

// Test function
function testEndpoint(url, description, options = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: "localhost",
      port: 3001,
      path: url,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`✅ ${description}: ${res.statusCode}`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on("error", (error) => {
      console.log(`❌ ${description}: ${error.message}`);
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`⏰ ${description}: Timeout`);
      reject(new Error("Timeout"));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test all endpoints
async function runTests() {
  console.log("🧪 Starting ShadowSpeak Mock Server Tests...\n");

  const tests = [
    {
      url: "/v1/me",
      desc: "GET /v1/me - User Profile",
      headers: { Authorization: "Bearer jwt-token" },
    },
    {
      url: "/v1/lessons",
      desc: "GET /v1/lessons - Lessons List",
      headers: { Authorization: "Bearer jwt-token" },
    },
    {
      url: "/v1/lessons/lesson-001",
      desc: "GET /v1/lessons/:id - Specific Lesson",
      headers: { Authorization: "Bearer jwt-token" },
    },
    {
      url: "/v1/sessions",
      desc: "POST /v1/sessions - Start Session",
      method: "POST",
      headers: { Authorization: "Bearer jwt-token" },
      body: { lessonId: "lesson-001" },
    },
    {
      url: "/v1/progress",
      desc: "GET /v1/progress - Current Progress",
      headers: { Authorization: "Bearer jwt-token" },
    },
    {
      url: "/v1/home/recommendation",
      desc: "GET /v1/home/recommendation - Daily Recommendation",
      headers: { Authorization: "Bearer jwt-token" },
    },
    {
      url: "/v1/consent",
      desc: "GET /v1/consent - Consent State (no auth)",
      headers: { "X-Device-Id": "device-456" },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await testEndpoint(test.url, test.desc, test);
      // Check if response has the expected structure
      const response = JSON.parse(result.data);
      if (response.ok && response.data) {
        console.log(
          `   📋 Response data: ${Object.keys(response.data).join(", ")}`,
        );
        passed++;
      } else {
        console.log(`   ❌ Invalid response structure`);
        failed++;
      }
    } catch (error) {
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log("🎉 All tests passed!");
    process.exit(0);
  } else {
    console.log("💥 Some tests failed!");
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
