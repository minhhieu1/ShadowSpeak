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

The project follows a **Feature-based / Domain-driven** pattern. Every business domain is an independent module under `src/features/`, owning its own types, services, state, and UI. The remaining folders (`app/`, `api/`) are shared infrastructure used by all features.

```text
frontend/
├── assets/                          # Bundled app assets and Expo app icons
├── scripts/                         # Build & automation scripts
├── src/
│   ├── app/                         # [Expo Router] Route files only — thin bridge layer
│   │   ├── _layout.tsx                  # Root layout (PaperProvider + SafeAreaProvider + Stack)
│   │   └── (tabs)/                      # Tab navigator group
│   │       ├── _layout.tsx              # Tab bar layout
│   │       └── index.tsx                # Home route — imports + renders <HomeScreen/>
│   │
│   ├── api/                         # [Shared Infrastructure] HTTP transport layer
│   │   ├── client.ts                    # Axios instance + interceptors (Bearer token, 401 refresh)
│   │   └── http.ts                      # Typed helpers: apiGet, apiPost, apiPut, apiPatch, apiDelete
│   │
│   ├── features/                    # ⬅ Business/domain modules — actual code lives here
│   │   └── <feature-name>/          #    e.g. auth, lessons, practice, progress, profile
│   │       ├── types/               #    Feature-specific types & interfaces
│   │       ├── lib/                 #    Utility functions, helpers, config logic
│   │       ├── services/            #    API calls, business logic orchestration
│   │       ├── store/               #    Zustand stores, class-based managers
│   │       ├── screens/             #    ⬅ Full-page screen components (imported by app/ routes)
│   │       ├── components/          #    Feature-private UI components
│   │       └── hooks/               #    Custom React hooks
│   │
│   ├── types/                       # [Shared] Global type declarations (.d.ts)
│   └── assets.ts                    # [Shared] Static asset registry
│
├── .maestro/                        # Maestro E2E test flows
├── global.css                       # Tailwind directives (@tailwind base/components/utilities)
├── tailwind.config.js               # Tailwind theme with custom colors/borders
├── babel.config.js
├── metro.config.js
├── app.json                         # Expo config (scheme, plugins, typedRoutes)
├── tsconfig.json                    # TypeScript config with @/* path alias
└── thumbnails-caching-guide.md
```

### Adding a new feature

1. **Route file in `src/app/`** — Expo Router maps file paths to routes. Create a `.tsx` file for your route path.
   - The route file is **only a bridge**: it imports the screen component from the feature module and renders it. No business logic, no direct API calls.
2. **Feature module in `src/features/<name>/`** — create the subdirectories you need (`types/`, `services/`, `store/`, `screens/`, `components/`, `hooks/`, `lib/`).
3. **Screen component in `screens/`** — the actual full-page UI lives here, NOT in `app/`. The route file imports from `features/<name>/screens/`.
4. **Truly shared UI components** — if multiple features need the same component, extract it to `src/components/` (project doesn't have this yet).

### Anatomy of a feature

```
src/features/<feature-name>/
├── types/              # Types & interfaces
├── lib/                # Utilities, helpers, config
├── services/           # API calls via typed helpers from src/api/http.ts
├── store/              # Zustand store or class manager
├── screens/            # ⬅ Full-page screens (imported by app/ route files)
├── components/         # Feature-private UI components
└── hooks/              # Custom hooks
```

### Rules

- **`src/app/` is a routing layer only** — route files are thin bridges. They import a screen from the feature and render it. No business logic, no API calls.
- **Actual screens live in `features/<name>/screens/`** — the full-page component exported here is what the route file imports and renders.
- **`src/api/` is shared** — all features call the backend through `apiGet<T>()`, `apiPost<T>()` from `src/api/http.ts`. Never create a separate Axios instance.
- **Features don't import each other** — if feature A needs a type or component from feature B, first consider moving it to a shared layer (`src/types/`, `src/components/`).
- **Subdirectories are optional** — a small feature with 1-2 files doesn't need all 7 folders. Create them only when there's content to put in them.

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
