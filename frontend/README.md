# ShadowSpeak Frontend

Expo + React Native + TypeScript mobile app for the ShadowSpeak MVP.

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Expo SDK | **56** |
| Core | React Native | **0.85.3** |
| Language | TypeScript | **~6.0** |
| Navigation | **Expo Router** (file-based routing) | ~56.2 |
| UI Styling | **NativeWind v4** (Tailwind CSS v3 `className`) | 4.2.5 |
| UI Components | **React Native Paper v5** (Material Design 3) | 5.15.3 |
| State | Zustand | 5.x |
| Animation | react-native-reanimated | 4.3.1 |
| Icons | Built-in Expo vector icons | — |
| Assets | Static WebP assets from `frontend/assets/` | — |

## Architecture Highlights

- **File-based routing** via Expo Router — each screen is a file under `src/app/`
- **Tailwind utility classes** via NativeWind — no more `StyleSheet.create()`
- **React Native Paper** for Material Design 3 themed components (`PaperProvider` wraps the root)
- **Safe area** handled by `react-native-safe-area-context` via `useSafeAreaInsets()` hook in headers
- **Reanimated v4** with `react-native-worklets` plugin for animations
- **Dev builds** via `expo-dev-client` (not Expo Go)

## Structure

```text
frontend/
├── assets/                 # Bundled app assets and Expo app icons
├── scripts/                # Build & automation scripts
├── src/
│   ├── app/                # Expo Router route files
│   │   ├── _layout.tsx         # Root layout (PaperProvider + SafeAreaProvider + Stack)
│   │   └── (tabs)/             # Tab navigator group
│   │       ├── _layout.tsx         # Tab bar layout (5 tabs)
│   │       ├── index.tsx           # Home screen
│   │       ├── lessons.tsx         # Lessons catalog
│   │       ├── downloads.tsx       # Offline library
│   │       ├── progress.tsx        # Progress tracking
│   │       └── settings.tsx        # Settings
│   ├── components/         # Reusable UI components
│   │   ├── AppHeader.tsx
│   │   ├── InfoCard.tsx
│   │   ├── LessonCard.tsx
│   │   ├── MetricCard.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── SectionTitle.tsx
│   │   └── WaveformPreview.tsx
│   ├── api/                # API client boundary (axios)
│   ├── auth/               # OIDC config & bootstrap
│   ├── data/               # Local demo data
│   ├── state/              # Zustand stores
│   ├── storage/            # Token storage (SecureStore + AsyncStorage)
│   ├── assets.ts           # Static asset registry
│   └── theme.ts            # Design tokens (legacy, replaced by Tailwind config)
├── .maestro/               # Maestro E2E test flows
├── global.css              # Tailwind directives (@tailwind base/components/utilities)
├── tailwind.config.js      # Tailwind theme with custom colors/borders
├── babel.config.js         # Babel with nativewind + babel-preset-expo + react-native-paper production plugin
├── metro.config.js         # Metro with withNativeWind plugin
├── nativewind-env.d.ts     # NativeWind + CSS module TypeScript declarations
├── App.tsx.old             # Legacy single-file app (preserved for reference)
├── index.ts.old            # Legacy entry point (preserved for reference)
├── app.json                # Expo config (scheme, plugins, typedRoutes)
├── tsconfig.json           # TypeScript config with @/* path alias
└── thumbnails-caching-guide.md
```

## Local Setup

```bash
cd frontend
npm install
```

Recommended Node version: `20` or `>=22`.

## Run (Development Build)

The app uses `expo-dev-client` for local development on the iOS simulator.

**Prerequisites:**
- macOS with Xcode 16+ installed
- Xcode Command Line Tools (`xcode-select --install`)
- iOS Simulator runtime (install via Xcode > Settings > Components)
- Watchman (`brew install watchman`)

**First time — regenerate native code & build:**

```bash
npx expo prebuild --clean
npx expo run:ios
```

**Subsequent runs** (faster):

```bash
npm run ios
```

### Production / Release Build

```bash
npx expo run:ios --configuration Release
```

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
npm run maestro
```

### Current Test Flow

The smoke test (`flows/smoke.yaml`) covers:
- App launch
- Home screen elements (header, hero card, practice button)
- Tab navigation (Lessons, Downloads, Progress, Settings)
- Content visibility checks

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

- **This is an Expo project**, not React Native CLI bare/native.
- **Routing is file-based** via Expo Router. Add new screens by creating files under `src/app/`.
- **Styling uses Tailwind classes** (`className=""`), not `StyleSheet.create()`. Custom theme values (colors, border radii) are in `tailwind.config.js`.
- **Material Design 3** components come from `react-native-paper`. Wrap new providers inside `PaperProvider` in `src/app/_layout.tsx`.
- **Safe area** is handled per-screen via `useSafeAreaInsets()` — screens render under the tab bar and dynamic island correctly.
- **Theme tokens** from `src/theme.ts` have been ported to `tailwind.config.js`. The old file remains as a reference.
- Lesson thumbnails are not bundled; use `Lesson.thumbnailUrl` and the local cache flow in `thumbnails-caching-guide.md`.
- Future native-sensitive features should be added through Expo-compatible modules or Expo dev builds:
  - background audio
  - recording comparison
  - local notifications
  - secure storage
  - offline SQLite/cache
