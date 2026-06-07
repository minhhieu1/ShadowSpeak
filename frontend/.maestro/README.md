# Maestro E2E Testing Framework — ShadowSpeak

Production-ready E2E automation testing framework for the ShadowSpeak React Native app using [Maestro](https://maestro.mobile.dev).

---

## Table of Contents

1. [Installation](#installation)
2. [Running Tests](#running-tests)
3. [Project Structure](#project-structure)
4. [Creating New Tests](#creating-new-tests)
5. [Naming Conventions](#naming-conventions)
6. [Selector Strategy](#selector-strategy)
7. [Test Data](#test-data)
8. [CI Usage](#ci-usage)
9. [Environment Configuration](#environment-configuration)
10. [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites

- **macOS** (required for iOS testing)
- **Java 11+** (Maestro requires the JDK)
- **Node.js 20+**

### Install Maestro

```bash
brew tap mobile-dev-inc/tap
brew install maestro --formula

# Verify installation
maestro --version
```

### Update Maestro

```bash
brew upgrade maestro
```

### Configure Environment

Source the environment setup script before running tests:

```bash
source .maestro/config/.maestro_env.sh
source .maestro/config/.maestro_env.sh staging  # for staging
```

---

## Running Tests

### Via npm (recommended)

Run from the `frontend/` directory:

```bash
# Run all test flows
npm run maestro:test

# Run only smoke tests
npm run maestro:smoke

# Run all tests (with --include-tags=all)
npm run maestro:all

# Run on Simulator with JUnit output
npm run maestro:ios
```

### Via Maestro CLI directly

```bash
# Run all flows
maestro test .maestro/flows

# Run a specific flow
maestro test .maestro/flows/smoke/appLaunch.yaml

# Run with environment variables
EMAIL="test@example.com" PASSWORD="secret" maestro test .maestro/flows/auth/login.yaml

# Run with reporting
maestro test --format junit --output reports/ .maestro/flows
```

### Run Against a Running App

```bash
# Start your app first, then:
maestro test .maestro/flows --env MAESTRO_APP_ID=com.shadowspeak.app
```

---

## Project Structure

```txt
.maestro/
├── flows/
│   ├── smoke/                     # Basic health-check & smoke tests
│   │   └── appLaunch.yaml
│   ├── auth/                      # Authentication flow tests
│   │   └── login.yaml
│   ├── onboarding/                # Onboarding flow tests
│   │   └── onboardingComplete.yaml
│   ├── shared/                    # Reusable subflows (composable)
│   │   ├── launchApp.yaml
│   │   ├── assertVisible.yaml
│   │   └── tapIfVisible.yaml
│   └── template/                  # Reusable flow templates
│       ├── screenTest.yaml
│       ├── formTest.yaml
│       └── navigationTest.yaml
├── data/                          # Test data fixtures
│   ├── users.json
│   ├── oidc.json
│   └── app.json
├── helpers/                       # Helper/utility YAML files
├── config.yaml                    # Maestro-native config (appId, flows glob)
├── config/                        # Environment & CI config (reference docs)
│   ├── config.yaml
│   ├── ci-reference.md
│   └── .maestro_env.sh
└── README.md                      # This file
```

---

## Creating New Tests

### 1. Choose the Right Directory

| Test Type            | Directory           | Tags              |
| -------------------- | ------------------- | ----------------- |
| Health check / smoke | `flows/smoke/`      | `smoke, all`      |
| Authentication       | `flows/auth/`       | `auth, all`       |
| Onboarding           | `flows/onboarding/` | `onboarding, all` |
| Feature-specific     | `flows/`            | feature-specific  |
| Reusable steps       | `flows/shared/`     | (none — subflows) |

### 2. Use a Template

Copy the nearest matching template from `flows/template/`:

```bash
cp .maestro/flows/template/screenTest.yaml .maestro/flows/smoke/myNewTest.yaml
```

### 3. Write the Test

```yaml
# .maestro/flows/smoke/myNewTest.yaml
appId: ${MAESTRO_APP_ID}

---
# Use shared subflows
- runFlow:
    file: ../shared/launchApp.yaml

# Assert elements by testID
- assertVisible:
    id: "screen-my-feature"
    timeout: 10000

# Interact with elements
- tapOn:
    id: "btn-my-action"

# Input text
- tapOn:
    id: "input-my-field"
- inputText: "Sample value"

# Take screenshots
- takeScreenshot: "my-feature-result"
```

### 4. Reuse Shared Flows

Always use `runFlow` for shared steps:

```yaml
- runFlow:
    file: ../shared/assertVisible.yaml
    env:
      ELEMENT_ID: "screen-home"
      TIMEOUT_MS: 10000
```

### 5. Tag Your Tests

```yaml
# Tags: smoke, all
```

Tags enable targeted execution:

```bash
maestro test .maestro/flows --include-tags=smoke
```

---

## Naming Conventions

### File Names

- **Snake case only**: `appLaunch.yaml`, `login.yaml`, `onboardingComplete.yaml`
- **No spaces or hyphens** in file names
- **Descriptive, action-oriented names**: `login.yaml`, not `authTest.yaml`
- **Directory reflects test category**: `auth/`, `onboarding/`, `smoke/`

### Flow Names

- Each flow file should test a single logical scenario
- Use YAML comments to describe the scenario at the top of each file

### Tags

| Tag          | When to Use                                     |
| ------------ | ----------------------------------------------- |
| `smoke`      | Critical path: app launch, login, home screen   |
| `auth`       | Any authentication-related flow                 |
| `onboarding` | Onboarding experience                           |
| `all`        | Every test that should run in a full suite      |
| `regression` | Tests for bug fixes (post-implementation)       |
| `template`   | Template files (always excluded from execution) |

### testID Naming (React Native Components)

All testIDs use the format: `{type}-{purpose}`

| Prefix             | Type                     | Example                                  |
| ------------------ | ------------------------ | ---------------------------------------- |
| `screen-`          | Screen root view         | `screen-login`, `screen-home`            |
| `btn-`             | Button/action            | `btn-login`, `btn-submit`                |
| `input-`           | Text input               | `input-email`, `input-password`          |
| `text-`            | Static/label text        | `text-error`, `text-title`               |
| `header-`          | Header/nav bar           | `header-main`, `header-profile`          |
| `footer-`          | Footer area              | `footer-links`                           |
| `tab-`             | Tab bar item             | `tab-home`, `tab-practice`               |
| `list-`            | FlatList or list view    | `list-sessions`, `list-results`          |
| `img-`             | Image                    | `img-avatar`, `img-logo`                 |
| `icon-`            | Icon                     | `icon-settings`, `icon-back`             |
| `modal-`           | Modal/overlay            | `modal-confirm`, `modal-edit`            |
| `card-`            | Card component           | `card-lesson`, `card-result`             |
| `toggle-`          | Switch/toggle            | `toggle-notifications`                   |
| `onboarding-page-` | Onboarding carousel page | `onboarding-page-1`, `onboarding-page-2` |
| `picker-`          | Picker/dropdown          | `picker-language`                        |
| `content-`         | Content/scroll area      | `content-dashboard`                      |

---

## Selector Strategy

### Primary: testID (required for all interactive elements)

```tsx
// ✅ Preferred - stable, fast, unambiguous
<View testID="screen-login">
<TextInput testID="input-email" />
<TouchableOpacity testID="btn-login" />
```

Maestro selectors:

```yaml
- assertVisible:
    id: "screen-login"
- tapOn:
    id: "btn-login"
```

### Secondary: Text (for content verification only)

```tsx
// ✅ Acceptable for content display verification
<Text testID="text-welcome-message">Welcome back!</Text>
```

```yaml
- assertVisible:
    text: "Welcome back!"
```

**⚠️ Never use text-based selectors for navigation or form submission.** Text can change due to localization, A/B testing, or copy updates, which would break tests.

### Tertiary: Combined selectors (use sparingly)

```yaml
- tapOn:
    id: "btn-profile"
    index: 0 # For duplicated elements in lists
```

### What to Avoid

| ❌ Bad                                         | ✅ Good                                  | Reason                   |
| ---------------------------------------------- | ---------------------------------------- | ------------------------ |
| `- tapOn: "Login"`                             | `- tapOn: { id: "btn-login" }`           | Text changes break tests |
| `- assertVisible: "screen-home".toUpperCase()` | `- assertVisible: { id: "screen-home" }` | testID is case-stable    |
| Dynamic testIDs like `item_${index}`           | Stable testIDs like `list-item-last`     | Indexes shift with data  |
| Accessibility labels as selectors alone        | testID + accessibilityLabel              | Different concerns       |

---

## Test Data

### Fixture Files

Test data lives in `.maestro/data/` as JSON files:

- **`users.json`**: Test user accounts (email, password, name, type)
- **`oidc.json`**: OIDC configuration for auth flows
- **`app.json`**: App metadata (screen IDs, navigation structure)

### Using Test Data

Data is consumed via environment variables in CI or passed inline:

```bash
EMAIL="testuser@shadowspeak.test" PASSWORD="TestPass123!" \
  maestro test .maestro/flows/auth/login.yaml
```

### Environment Overrides

| Variable                    | Default                 | Description           |
| --------------------------- | ----------------------- | --------------------- |
| `MAESTRO_APP_ID`            | `com.shadowspeak.app`   | App bundle/package ID |
| `MAESTRO_PLATFORM`          | `ios`                   | Target platform       |
| `MAESTRO_BASE_URL`          | `http://localhost:3000` | App base URL          |
| `MAESTRO_API_URL`           | `http://localhost:8080` | API base URL          |
| `MAESTRO_LAUNCH_TIMEOUT_MS` | `30000`                 | App launch timeout    |
| `MAESTRO_CLI_NO_ANALYTICS`  | `true`                  | Disable analytics     |

---

## CI Usage

### EAS Workflows (recommended)

EAS Workflows orchestrate building the app on EAS servers and running Maestro tests against the build artifact. Workflow definitions are at `frontend/.eas/workflows/`.

**iOS:**

```bash
cd frontend
npx eas-cli@latest workflow:run .eas/workflows/e2e-test-ios.yml
```

**Android:**

```bash
cd frontend
npx eas-cli@latest workflow:run .eas/workflows/e2e-test-android.yml
```

Each workflow:

1. Builds the app using the `e2e-test-*` profile (simulator/APK, no credentials needed)
2. Installs Maestro on the runner automatically
3. Runs the configured Maestro flows against the built app
4. Reports results in the EAS dashboard

### GitHub Actions (local-only alternative)

For local CI testing without EAS:

```yaml
steps:
  - run: brew tap mobile-dev-inc/tap && brew install maestro --formula
  - run: npx expo prebuild --platform ios
  - run: xcodebuild -workspace ios/*.xcworkspace -scheme ShadowSpeak -sdk iphonesimulator -derivedDataPath build build
  - run: maestro test .maestro
```

---

## Environment Configuration

### Local Development

```bash
# Default (dev environment)
source .maestro/config/.maestro_env.sh
maestro test .maestro/flows/smoke
```

### Staging

```bash
source .maestro/config/.maestro_env.sh staging
maestro test .maestro/flows
```

### Production

```bash
source .maestro/config/.maestro_env.sh production
maestro test .maestro/flows/smoke
```

### Mock Environment

For offline/isolated testing:

1. Start the mock server: `helper/mockserver/`
2. Set environment to dev
3. Run tests against the mock API

---

## Troubleshooting

### "Maestro command not found"

```bash
# Ensure Homebrew bin is in PATH
export PATH="/opt/homebrew/bin:$PATH"

# Or use full path
/opt/homebrew/bin/maestro --version

# Re-link if needed
brew unlink maestro && brew link maestro
```

### "Could not find element"

1. **Check the testID** — ensure it matches the component's `testID` exactly
2. **Increase timeout** — the element may load slowly
3. **Wait for animations** — add `waitForAnimationToEnd` before assertion
4. **Check visibility** — element may exist but be off-screen or behind a modal

### "App not launched"

1. Ensure the app is built for the simulator
2. Verify `MAESTRO_APP_ID` matches the app's bundle ID
3. Try launching the app manually first, then attach Maestro

### "Simulator not booted"

```bash
# Boot iOS simulator manually
xcrun simctl boot "iPhone 16 Pro"
open -a Simulator
```

### Screen captures not saving

```bash
# Ensure screenshots directory exists
mkdir -p ~/.maestro/screenshots

# Check disk space
df -h ~/
```

### JUnit output not generated

```bash
# Run with explicit format and output
maestro test --format junit --output ./reports/maestro .maestro/flows
mkdir -p reports/maestro
```

### Flaky tests

If a test is flaky:

1. Add `waitForAnimationToEnd` before assertions
2. Increase timeouts in `.maestro/config/config.yaml`
3. Use `optional: true` for elements that may not appear in all runs
4. Ensure testIDs are truly stable (no index-based or dynamic IDs)
5. Check for race conditions with async data loading

---

## Best Practices

1. **One scenario per flow file** — keeps tests focused and debuggable
2. **Use testID exclusively for interactions** — never text-based selectors for taps
3. **Prefer shared subflows** — compose tests from reusable pieces
4. **Tag appropriately** — `smoke`, `auth`, `all`, etc.
5. **Take screenshots** — always at the end of a test, and on critical state changes
6. **Keep tests independent** — each test should clean up after itself
7. **No test-to-test dependencies** — don't rely on execution order
8. **Environment-agnostic** — tests should work in dev, staging, and production
9. **Clean test data** — use dedicated test accounts, never real user data

---

## React Native Testability Standards

See `specs/06-testing/01-maestro-testability-standards.md` for the project-wide guidelines on making React Native components testable with Maestro.
