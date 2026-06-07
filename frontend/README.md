# ShadowSpeak Frontend

Expo + React Native + TypeScript frontend for the ShadowSpeak MVP.

## Stack

- Expo SDK 54
- React Native 0.81
- TypeScript
- Zustand for lightweight app state
- Static WebP assets from `frontend/assets/`

## Structure

```text
frontend/
├── assets/               # Bundled app assets and Expo app icons
├── scripts/              # Build & automation scripts
├── src/
│   ├── api/              # API client boundary
│   ├── data/             # Local demo data for scaffold screens
│   ├── state/            # Zustand stores
│   ├── types/            # Static asset declarations
│   ├── assets.ts         # Static asset registry
│   └── theme.ts          # Design tokens from UI specs
├── .maestro/             # Maestro E2E test flows
│   ├── flows/            # Test flow YAML files
│   └── config/           # Maestro configuration
├── App.tsx               # Current ShadowSpeak app shell
├── app.json              # Expo config
└── thumbnails-caching-guide.md
```

## Local Setup

```bash
cd frontend
npm install
```

Recommended Node version: `20` or `>=22`. Node `21` may show engine warnings from some dependencies.

## Run (Development Build)

The app uses `expo-dev-client` for local development on the iOS simulator.

**Prerequisites:**
- macOS with Xcode 16+ installed
- Xcode Command Line Tools (`xcode-select --install`)
- iOS Simulator runtime (install via Xcode > Settings > Components)
- Watchman (`brew install watchman`)

**First time — install dev client & build:**

```bash
npx expo install expo-dev-client
npx expo run:ios
```

**Subsequent runs** (faster — cached build):

```bash
npx expo run:ios
```

Or use the npm script:

```bash
npm run ios
```

### Production / Release Build

```bash
npx expo run:ios --configuration Release
```

This builds without the dev menu and Metro dependency.

## Backend URL

The API client reads:

```bash
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/v1
```

For a physical mobile device, replace `127.0.0.1` with the LAN IP of the backend host.

## Maestro E2E Testing

The project uses [Maestro](https://maestro.mobile.dev) for automated E2E testing on the iOS simulator.

### Prerequisites

```bash
brew install maestro
```

### Running Tests

```bash
# Run all flows
maestro test .maestro

# Run a specific flow
maestro test .maestro/flows/smoke.yaml

# Via npm with JUnit reporting
npm run maestro:ios
```

### Current Test Flow

The smoke test (`flows/smoke.yaml`) covers:
- App launch
- Home screen elements (header, hero card, practice button)
- Tab navigation (Lessons, Downloads, Progress, Settings)
- Content visibility checks

**Note:** The bottom tab accessibility labels use combined `"Icon, Label"` format (e.g. `"Book, Lessons"`, `"Gear, Settings"`), so Maestro selectors use the full string.

### Writing New Tests

1. Create a new `.yaml` file in `.maestro/flows/`
2. Use `launchApp` with `clearState: false` (dev builds don't support state wipe)
3. Assert visible elements and tap targets
4. Run with Maestro CLI

## Checks

```bash
npm run typecheck
```

## Notes

- This is an Expo project, not React Native CLI bare/native.
- Lesson thumbnails are not bundled; use `Lesson.thumbnailUrl` and the local cache flow in `thumbnails-caching-guide.md`.
- Future native-sensitive features should be added through Expo-compatible modules or Expo dev builds:
  - background audio
  - recording comparison
  - local notifications
  - secure storage
  - offline SQLite/cache
