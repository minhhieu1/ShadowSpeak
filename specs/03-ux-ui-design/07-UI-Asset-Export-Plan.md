# ShadowSpeak UI Asset Export Plan

## Document Metadata

| Field            | Value                                      |
| ---------------- | ------------------------------------------ |
| Project          | ShadowSpeak                                |
| Document Type    | UI Asset Export Plan                       |
| Date             | 2026-05-15                                 |
| Status           | Draft                                      |
| Version          | 1.0                                        |
| Source           | `specs/03-ux-ui-design/generated-screens/` |
| Related Document | `06-UI-Asset-Inventory.md`                 |

## Purpose

This plan tracks every non-icon visual asset that needs to be exported or prepared for implementation, including the recommended export format. Icon-font replacements are excluded because the app will use `react-native-vector-icons/MaterialCommunityIcons`.

Status values:

- `Not exported`
- `Exported`
- `No export needed`

## Required Design Standards

Before writing any imagegen prompt, check the current asset against these standards from `04-UI-Design-Specification.md`, `06-UI-Asset-Inventory.md`, and the referenced generated screen.

### Color Tokens

Use the UI design tokens exactly unless the referenced screen clearly requires a screen-specific illustration color:

| Token                   | Hex       | Asset usage                                                                      |
| ----------------------- | --------- | -------------------------------------------------------------------------------- |
| `color-bg`              | `#F7F5F0` | App background only; must not be baked into transparent asset exports            |
| `color-surface`         | `#FFFFFF` | Cards, sheets, elevated panels when an illustration contains a surface           |
| `color-surface-alt`     | `#EEF2F5` | Secondary surfaces, chips, grouped sections                                      |
| `color-primary`         | `#0E5A6A` | ShadowSpeak waveform mark, wordmark, primary brand emphasis, active audio states |
| `color-primary-pressed` | `#0A4652` | Pressed primary states only, not default brand assets                            |
| `color-secondary`       | `#D97706` | Warm accent for progress, reminders, and audio cues; use sparingly               |
| `color-text`            | `#111827` | Main UI text when text must be part of an asset                                  |
| `color-text-muted`      | `#6B7280` | Secondary/helper text, status text, and the splash slogan                        |
| `color-border`          | `#D6D9DE` | Dividers/input borders when an illustration contains UI-like surfaces            |
| `color-success`         | `#1F8A70` | Completed/success states                                                         |
| `color-warning`         | `#D97706` | Cautions, storage warnings, offline guidance                                     |
| `color-error`           | `#C2410C` | Error and destructive feedback                                                   |
| `color-info`            | `#2563EB` | Informational notices                                                            |
| `color-disabled`        | `#A8B0B8` | Disabled text and controls                                                       |

### Brand Asset Standards

- ShadowSpeak waveform mark and wordmark must use `color-primary` (`#0E5A6A`) unless a referenced screen explicitly shows a state-specific variant.
- `splash_brand_lockup` must include all three parts from `1.1 App Launch.png`: waveform mark, `ShadowSpeak` wordmark, and the exact slogan `LISTEN. SHADOW. IMPROVE.`.
- The splash slogan must use `color-text-muted` (`#6B7280`), not teal, black, or arbitrary gray.
- Keep the slogan uppercase with dot separators exactly as shown: `LISTEN. SHADOW. IMPROVE.`.
- Do not include launch-only UI such as the status bar, loading spinner, or `Checking your setup...` inside any brand asset.
- Treat waveform mark, wordmark, splash lockup, lesson artwork, level illustrations, hero illustrations, ad creative, and app/avatar imagery as real assets. Do not replace them with icon-font exports.

### Typography And Visual Style Standards

- Follow the referenced screen's visual hierarchy first, then the UI design spec.
- App-wide UI typography uses a clean, modern sans-serif family, but the ShadowSpeak wordmark is a brand asset and may use its approved serif-like wordmark styling from the generated screen.
- Secondary/status/slogan text should read as muted helper copy and align to `color-text-muted`.
- Exported assets should feel calm, trustworthy, high-clarity, and sparse; avoid promotional, noisy, or high-contrast decorative styling unless the referenced screen calls for it.
- Decorative accents should be soft and minimal, with warm accent color used sparingly for audio/progress/reminder emphasis.

## Required Asset Skill Workflow

Use the project Codex skill at `.codex/skills/shadowspeak-ui-assets/` for all asset work governed by this checklist. The skill contains the reusable standards and scripts needed to avoid drift between imagegen outputs, deterministic brand assets, and implementation-ready WebP exports.

Before exporting any asset:

1. Read this plan and `06-UI-Asset-Inventory.md`.
2. Open the referenced generated screen and visually confirm the intended asset, style, and background requirement.
3. Load `.codex/skills/shadowspeak-ui-assets/SKILL.md`.
4. Load `.codex/skills/shadowspeak-ui-assets/references/design-standards.md` when validating colors, typography, app-launch assets, or exact text.
5. Use `tmp/ui-asset-experiment/` for trials.
6. Copy only accepted final assets into `specs/03-ux-ui-design/exported-assets/`.
7. Only after a valid final WebP exists, update the asset status from `Not exported` to `Exported`.

### Workflow Selection

Choose the export method by asset type:

| Asset type                                                                                        | Required workflow                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand marks, wordmarks, splash lockups, exact text, OAuth logos, app/notification icons           | Deterministic render or official/source-accurate asset workflow from `shadowspeak-ui-assets`; do not rely on imagegen for exact text or exact color tokens                                                 |
| Lesson thumbnails, level illustrations, decorative accents, ad creative, hero/error illustrations | Imagegen-based illustration workflow, followed by alpha cleanup, sizing, and palette/visual validation. Lesson thumbnails are uploaded to CDN and referenced via `Lesson.thumbnailUrl` (keyed by `topic`). |
| Functional waveforms, progress rings, buttons, cards, status pills, icon-font replacements        | Render in app code or use `MaterialCommunityIcons`; no bitmap export unless the plan explicitly says otherwise                                                                                             |

### Deterministic Brand/Text Workflow

Use this workflow for `1.1 App Launch` and any future asset that requires exact copy, exact token colors, or pixel-stable brand geometry:

1. Render from SVG/text/vector primitives using exact UI tokens.
2. Export transparent WebP.
3. Generate a preview PNG over `color-bg` (`#F7F5F0`) for visual review.
4. Validate:
   - output file is WebP;
   - file has alpha transparency;
   - four corners are transparent;
   - opaque subject pixels use expected RGB tokens;
   - text copy is exact;
   - launch-only UI such as status bar, loading spinner, and `Checking your setup...` is not included unless explicitly requested.
5. Copy final files into `specs/03-ux-ui-design/exported-assets/` only after validation passes.

For the app launch asset set, run:

```bash
node .codex/skills/shadowspeak-ui-assets/scripts/render-app-launch-assets.mjs \
  --out tmp/ui-asset-experiment/1.1-app-launch
```

The script generates `brand_waveform_mark`, `brand_wordmark_shadowspeak`, and `splash_brand_lockup` as SVG source, transparent WebP, preview PNG, and a validation manifest. It requires Node.js and the `sharp` package. Install `sharp` in the repo with `npm install --save-dev sharp`, or set `SHADOWSPEAK_NODE_MODULES=/absolute/path/to/node_modules` when using a shared runtime.

### Imagegen Illustration Workflow

Use this workflow for non-text illustration assets:

1. Prompt imagegen from the referenced screen and the standards in `.codex/skills/shadowspeak-ui-assets/references/design-standards.md`.
2. Generate on native transparent output if available; otherwise generate on a removable flat chroma-key background.
3. Remove the chroma-key background with the imagegen helper and write WebP alpha:

   ```bash
   "${PYTHON:-python3}" \
     "${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/remove_chroma_key.py" \
     --input <generated-source.png> \
     --out specs/03-ux-ui-design/exported-assets/<asset-name>.webp \
     --auto-key border \
     --soft-matte \
     --transparent-threshold 12 \
     --opaque-threshold 220 \
     --despill
   ```

4. Validate:
   - output file is WebP;
   - file has alpha transparency;
   - corners/background are transparent;
   - subject coverage is plausible;
   - no visible chroma-key fringe remains;
   - visual style fits the referenced screen.
5. If validation fails because of a visible fringe, retry once with `--edge-contract 1`. If the asset still cannot be made cleanly transparent, stop and resolve the export path before continuing.

### Reuse Rules

- For repeated visuals, export once and reuse the same file when the crop, aspect ratio, and target size satisfy all referenced screens.
- Do not overwrite existing final assets unless explicitly replacing them.
- Do not update this plan's status rows until accepted final files exist in `specs/03-ux-ui-design/exported-assets/`.

## Export Plan By Screen

### 1.1 App Launch

| Asset name                   | Refer screen to export | Export format                                                  | Background requirement | Status       |
| ---------------------------- | ---------------------- | -------------------------------------------------------------- | ---------------------- | ------------ |
| `brand_waveform_mark`        | `1.1 App Launch.png`   | WebP                                                           | Transparent background | Not exported |
| `brand_wordmark_shadowspeak` | `1.1 App Launch.png`   | WebP                                                           | Transparent background | Not exported |
| `splash_brand_lockup`        | `1.1 App Launch.png`   | WebP; full logo + wordmark + `LISTEN. SHADOW. IMPROVE.` slogan | Transparent background | Not exported |

### 1.2 Age Gate

| Asset name                     | Refer screen to export | Export format | Background requirement | Status       |
| ------------------------------ | ---------------------- | ------------- | ---------------------- | ------------ |
| `brand_waveform_badge_neutral` | `1.2 Age Gate.png`     | WebP          | Transparent background | Not exported |
| `decor_sparkle_leaf_soft_01`   | `1.2 Age Gate.png`     | WebP          | Transparent background | Not exported |

### 1.3 Age Policy Block

| Asset name              | Refer screen to export     | Export format                                                               | Background requirement | Status       |
| ----------------------- | -------------------------- | --------------------------------------------------------------------------- | ---------------------- | ------------ |
| `hero_age_policy_block` | `1.3 Age Policy Block.png` | WebP; hero illustration includes the "13+" age badge as part of the artwork | Transparent background | Not exported |

### 1.4 Privacy and Ad Consent

| Asset name                 | Refer screen to export           | Export format                                                                              | Background requirement | Status       |
| -------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------- | ------------ |
| `hero_privacy_shield_lock` | `1.4 Privacy and Ad Consent.png` | WebP; hero illustration includes shield lock and decorative leaves/sparkles as one artwork | Transparent background | Not exported |

### 1.5 Sign In

| Asset name                     | Refer screen to export | Export format | Background requirement | Status       |
| ------------------------------ | ---------------------- | ------------- | ---------------------- | ------------ |
| `brand_waveform_badge_neutral` | `1.5 Sign In.png`      | WebP          | Transparent background | Not exported |

### 1.6 Sign Up

| Asset name                     | Refer screen to export | Export format | Background requirement | Status       |
| ------------------------------ | ---------------------- | ------------- | ---------------------- | ------------ |
| `brand_waveform_badge_neutral` | `1.6 Sign Up.png`      | WebP          | Transparent background | Not exported |

### 1.7 Level Selection

| Asset name                     | Refer screen to export    | Export format | Background requirement | Status       |
| ------------------------------ | ------------------------- | ------------- | ---------------------- | ------------ |
| `brand_waveform_badge_neutral` | `1.7 Level Selection.png` | WebP          | Transparent background | Not exported |
| `level_beginner_sprout`        | `1.7 Level Selection.png` | WebP          | Transparent background | Not exported |
| `level_intermediate_tree`      | `1.7 Level Selection.png` | WebP          | Transparent background | Not exported |
| `level_advanced_tree`          | `1.7 Level Selection.png` | WebP          | Transparent background | Not exported |

### 1.8 Reminder Setup

| Asset name                     | Refer screen to export   | Export format | Background requirement | Status       |
| ------------------------------ | ------------------------ | ------------- | ---------------------- | ------------ |
| `brand_waveform_badge_neutral` | `1.8 Reminder Setup.png` | WebP          | Transparent background | Not exported |

### 1.9 Permission Prompts

| Asset name                     | Refer screen to export       | Export format | Background requirement | Status       |
| ------------------------------ | ---------------------------- | ------------- | ---------------------- | ------------ |
| `brand_waveform_badge_neutral` | `1.9 Permission Prompts.png` | WebP          | Transparent background | Not exported |

### 2.1 Home - Daily Practice

| Asset name | Refer screen to export | Export format | Background requirement | Status |
| ---------- | ---------------------- | ------------- | ---------------------- | ------ |

### 2.2 Lesson Catalog

| Asset name | Refer screen to export | Export format | Background requirement | Status |
| ---------- | ---------------------- | ------------- | ---------------------- | ------ |

### 2.3 Lesson Detail

| Asset name | Refer screen to export | Export format | Background requirement | Status |
| ---------- | ---------------------- | ------------- | ---------------------- | ------ |

### 2.4 Practice Session

| Asset name                | Refer screen to export     | Export format                       | Background requirement | Status       |
| ------------------------- | -------------------------- | ----------------------------------- | ---------------------- | ------------ |
| `waveform_practice_large` | `2.4 Practice Session.png` | Render in code; no export preferred | Transparent background | Not exported |

### 2.5 Practice Session State Variants

| Asset name                        | Refer screen to export                    | Export format | Background requirement | Status       |
| --------------------------------- | ----------------------------------------- | ------------- | ---------------------- | ------------ |
| `badge_practice_loading_waveform` | `2.5 Practice Session State Variants.png` | WebP          | Transparent background | Not exported |
| `badge_practice_audio_error`      | `2.5 Practice Session State Variants.png` | WebP          | Transparent background | Not exported |
| `badge_practice_offline_cloud`    | `2.5 Practice Session State Variants.png` | WebP          | Transparent background | Not exported |

### 2.6 Recording Comparison

| Asset name                      | Refer screen to export         | Export format                       | Background requirement | Status       |
| ------------------------------- | ------------------------------ | ----------------------------------- | ---------------------- | ------------ |
| `decor_success_star_badge`      | `2.6 Recording Comparison.png` | WebP                                | Transparent background | Not exported |
| `decor_success_sparkles`        | `2.6 Recording Comparison.png` | WebP                                | Transparent background | Not exported |
| `waveform_comparison_reference` | `2.6 Recording Comparison.png` | Render in code; no export preferred | Transparent background | Not exported |
| `waveform_comparison_recording` | `2.6 Recording Comparison.png` | Render in code; no export preferred | Transparent background | Not exported |

### 2.7 Progress View

| Asset name | Refer screen to export | Export format | Background requirement | Status |
| ---------- | ---------------------- | ------------- | ---------------------- | ------ |

### 3.1 Downloaded Lessons - Offline Library

| Asset name | Refer screen to export | Export format | Background requirement | Status |
| ---------- | ---------------------- | ------------- | ---------------------- | ------ |

### 3.2 Offline Practice Session

| Asset name                        | Refer screen to export             | Export format                       | Background requirement | Status       |
| --------------------------------- | ---------------------------------- | ----------------------------------- | ---------------------- | ------------ |
| `waveform_offline_practice_large` | `3.2 Offline Practice Session.png` | Render in code; no export preferred | Transparent background | Not exported |

### 3.3 Local Reminder Notification

| Asset name                     | Refer screen to export                | Export format                                        | Background requirement | Status       |
| ------------------------------ | ------------------------------------- | ---------------------------------------------------- | ---------------------- | ------------ |
| `hero_reminder_time_to_shadow` | `3.3 Local Reminder Notification.png` | WebP                                                 | Transparent background | Not exported |
| `app_notification_icon`        | `3.3 Local Reminder Notification.png` | Platform-specific icon asset; WebP preview if needed | Transparent background | Not exported |

### 4.1 Settings

| Asset name                | Refer screen to export | Export format | Background requirement | Status           |
| ------------------------- | ---------------------- | ------------- | ---------------------- | ---------------- |
| No non-icon export needed | `4.1 Settings.png`     | N/A           | N/A                    | No export needed |

### 4.2 Reminder Settings

| Asset name                | Refer screen to export      | Export format | Background requirement | Status           |
| ------------------------- | --------------------------- | ------------- | ---------------------- | ---------------- |
| No non-icon export needed | `4.2 Reminder Settings.png` | N/A           | N/A                    | No export needed |

### 4.3 Consent Settings

| Asset name                | Refer screen to export     | Export format | Background requirement | Status           |
| ------------------------- | -------------------------- | ------------- | ---------------------- | ---------------- |
| No non-icon export needed | `4.3 Consent Settings.png` | N/A           | N/A                    | No export needed |

### 4.4 Playback Settings

| Asset name                   | Refer screen to export      | Export format | Background requirement | Status       |
| ---------------------------- | --------------------------- | ------------- | ---------------------- | ------------ |
| `brand_waveform_badge_audio` | `4.4 Playback Settings.png` | WebP          | Transparent background | Not exported |

### 4.5 Profile Settings

| Asset name                | Refer screen to export     | Export format | Background requirement | Status           |
| ------------------------- | -------------------------- | ------------- | ---------------------- | ---------------- |
| No non-icon export needed | `4.5 Profile Settings.png` | N/A           | N/A                    | No export needed |

### 4.6 Recording Library

| Asset name                   | Refer screen to export      | Export format                       | Background requirement | Status       |
| ---------------------------- | --------------------------- | ----------------------------------- | ---------------------- | ------------ |
| `waveform_recording_preview` | `4.6 Recording Library.png` | Render in code; no export preferred | Transparent background | Not exported |

### 4.7 Account Management

| Asset name                     | Refer screen to export       | Export format | Background requirement | Status       |
| ------------------------------ | ---------------------------- | ------------- | ---------------------- | ------------ |
| `brand_waveform_badge_neutral` | `4.7 Account Management.png` | WebP          | Transparent background | Not exported |

### 5.1 Retryable Error States

| Asset name                         | Refer screen to export           | Export format | Background requirement | Status       |
| ---------------------------------- | -------------------------------- | ------------- | ---------------------- | ------------ |
| `hero_retryable_audio_error_badge` | `5.1 Retryable Error States.png` | WebP          | Transparent background | Not exported |

### 5.1 Audio Load Failure Error

| Asset name                | Refer screen to export             | Export format | Background requirement | Status       |
| ------------------------- | ---------------------------------- | ------------- | ---------------------- | ------------ |
| `hero_audio_load_failure` | `5.1 Audio Load Failure Error.png` | WebP          | Transparent background | Not exported |

### 5.1 Auth Expired Error

| Asset name                 | Refer screen to export       | Export format | Background requirement | Status       |
| -------------------------- | ---------------------------- | ------------- | ---------------------- | ------------ |
| `hero_auth_expired_shield` | `5.1 Auth Expired Error.png` | WebP          | Transparent background | Not exported |

### 5.1 Generic Fallback Error

| Asset name                    | Refer screen to export           | Export format | Background requirement | Status       |
| ----------------------------- | -------------------------------- | ------------- | ---------------------- | ------------ |
| `hero_generic_fallback_error` | `5.1 Generic Fallback Error.png` | WebP          | Transparent background | Not exported |

### 5.1 Network Loss Error

| Asset name                        | Refer screen to export       | Export format | Background requirement | Status       |
| --------------------------------- | ---------------------------- | ------------- | ---------------------- | ------------ |
| `hero_network_loss_offline_cloud` | `5.1 Network Loss Error.png` | WebP          | Transparent background | Not exported |

### 5.1 Permission Recovery Error

| Asset name                       | Refer screen to export              | Export format | Background requirement | Status       |
| -------------------------------- | ----------------------------------- | ------------- | ---------------------- | ------------ |
| `hero_permission_recovery_cards` | `5.1 Permission Recovery Error.png` | WebP          | Transparent background | Not exported |

### 5.1 Recording Unavailable Error

| Asset name                           | Refer screen to export                | Export format | Background requirement | Status       |
| ------------------------------------ | ------------------------------------- | ------------- | ---------------------- | ------------ |
| `hero_recording_unavailable_mic_off` | `5.1 Recording Unavailable Error.png` | WebP          | Transparent background | Not exported |

### 5.1 Startup Failure Error

| Asset name                             | Refer screen to export          | Export format | Background requirement | Status       |
| -------------------------------------- | ------------------------------- | ------------- | ---------------------- | ------------ |
| `hero_startup_failure_broken_waveform` | `5.1 Startup Failure Error.png` | WebP          | Transparent background | Not exported |

### 5.1 Storage Full Error

| Asset name              | Refer screen to export       | Export format | Background requirement | Status       |
| ----------------------- | ---------------------------- | ------------- | ---------------------- | ------------ |
| `hero_storage_full_box` | `5.1 Storage Full Error.png` | WebP          | Transparent background | Not exported |

### 5.2 Exit - Support Path

| Asset name            | Refer screen to export        | Export format | Background requirement | Status       |
| --------------------- | ----------------------------- | ------------- | ---------------------- | ------------ |
| `hero_safe_exit_door` | `5.2 Exit - Support Path.png` | WebP          | Transparent background | Not exported |

### Full-Screen Ad Interstitial Presentation

| Asset name                    | Refer screen to export                         | Export format | Background requirement | Status       |
| ----------------------------- | ---------------------------------------------- | ------------- | ---------------------- | ------------ |
| `ad_travel_suitcase_creative` | `Full-Screen Ad Interstitial Presentation.png` | WebP          | Transparent background | Not exported |

## Reuse Notes

- Assets with the same visual but different screen-specific names can be consolidated during export if they share the same crop, aspect ratio, and target size.
- Lesson thumbnails are uploaded to CDN per topic and referenced via `Lesson.thumbnailUrl`. The client caches by topic key in app data.
- Waveforms used as functional player UI can be changed to `No export needed` if the implementation renders waveform bars in React Native.
- Brand assets should be exported once and reused across onboarding, settings, and error screens.
