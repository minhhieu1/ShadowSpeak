# Thumbnail Caching — Frontend Implementation Guide

## Overview

Lesson thumbnails are **CDN assets referenced by `Lesson.thumbnailUrl`**, keyed by `topic`. All lessons sharing the same `topic` use the same thumbnail image. The frontend caches thumbnails in app data to avoid repeated downloads and to support offline display.

## Key Rules

- **Do not** bundle thumbnail images in the app binary.
- **Do not** hardcode a URL-to-topic mapping in the app.

## Data Flow

```
Lesson API returns { ..., topic: "conversation", thumbnailUrl: "https://cdn.shadowspeak.app/thumbnails/conversation.webp" }
  ↓
  Check app data: thumbnails/conversation.webp
  ├── EXISTS → display from local file
  └── MISSING → download from thumbnailUrl → save to app data → display
```

## Cache Strategy

| Aspect               | Detail                                                                        |
| -------------------- | ----------------------------------------------------------------------------- |
| **Cache key**        | `topic` (e.g. `"conversation"`)                                               |
| **Local path**       | `thumbnails/<topic>.webp`                                                     |
| **Source URL**       | `Lesson.thumbnailUrl` (from API response)                                     |
| **When to download** | First time a lesson with that `topic` is encountered and no local file exists |
| **When to reuse**    | Every subsequent lesson with the same `topic` — read from local cache only    |
| **Fallback**         | Show a placeholder/skeleton image when download fails or is pending           |

## Pseudo-implementation

```typescript
function getThumbnailPath(topic: string): string {
  return `thumbnails/${topic}.webp`;
}

async function ensureThumbnail(lesson: Lesson): Promise<string> {
  const localPath = getThumbnailPath(lesson.topic);
  const exists = await FileSystem.fileExists(localPath);

  if (exists) {
    return localPath;
  }

  // Download from CDN and cache
  await FileSystem.downloadAsync(lesson.thumbnailUrl, localPath);
  return localPath;
}
```

## Important Notes

- The `thumbnailUrl` is **not** a per-lesson URL. Multiple lessons will share the same URL if they share the same `topic`.
- When a new topic is added on the backend (e.g. `"idioms"`), the frontend simply sees a new `topic` + `thumbnailUrl` pair. No app update is required.
- Thumbnail cache lives in app data directory, not in the bundle. It persists across app restarts and survives app updates.
