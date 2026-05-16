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
├── src/
│   ├── api/              # API client boundary
│   ├── data/             # Local demo data for scaffold screens
│   ├── state/            # Zustand stores
│   ├── types/            # Static asset declarations
│   ├── assets.ts         # Static asset registry
│   └── theme.ts          # Design tokens from UI specs
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

## Run

```bash
cd frontend
npm start
```

Then choose iOS, Android, or Expo Go from the Expo CLI.

Platform shortcuts:

```bash
npm run ios
npm run android
npm run web
```

## Backend URL

The API client reads:

```bash
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/v1
```

For a physical mobile device, replace `127.0.0.1` with the LAN IP of the backend host.

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
