# ShadowSpeak UI Asset Inventory

## Document Metadata

| Field | Value |
| --- | --- |
| Project | ShadowSpeak |
| Document Type | UI Asset Inventory |
| Date | 2026-05-15 |
| Status | Draft |
| Source Screens | `specs/03-ux-ui-design/generated-screens/` |
| Implementation Assets | `frontend/assets/` |

## Rules

- Use `MaterialCommunityIcons` for normal UI icons such as navigation, playback, settings, check states, alerts, and tab icons.
- Use exported assets only for brand marks, hero illustrations, badges, decorative art, notification icon, and ad creative.
- Lesson thumbnails are CDN assets returned by `Lesson.thumbnailUrl`; they are not bundled in `frontend/assets`.
- Functional waveforms, progress rings, cards, buttons, chips, and status pills should be rendered in app code.

## Shared Assets

| Asset | Path |
| --- | --- |
| Brand waveform mark | `frontend/assets/logos/brand_waveform_mark.webp` |
| Brand wordmark | `frontend/assets/logos/brand_wordmark_shadowspeak.webp` |
| Splash brand lockup | `frontend/assets/logos/splash_brand_lockup.webp` |
| Neutral waveform badge | `frontend/assets/badges/brand_waveform_badge_neutral.webp` |
| Notification icon | `frontend/assets/icons/app_notification_icon.webp` |

## Screen Assets

| Screen | Bundled assets | Other visual sources |
| --- | --- | --- |
| 1.1 App Launch | `logos/brand_waveform_mark.webp`, `logos/brand_wordmark_shadowspeak.webp`, `logos/splash_brand_lockup.webp` | Loading spinner is native UI |
| 1.2 Age Gate | `badges/brand_waveform_badge_neutral.webp`, `ui/decor_sparkle_leaf_soft_01.webp` | Checkbox and support icons use `MaterialCommunityIcons` |
| 1.3 Age Policy Block | `onboarding/hero_age_policy_block.webp` | Exit/support buttons use `MaterialCommunityIcons` |
| 1.4 Privacy and Ad Consent | `onboarding/hero_privacy_shield_lock.webp` | Consent row icons use `MaterialCommunityIcons` |
| 1.5 Sign In | `badges/brand_waveform_badge_neutral.webp` | OAuth logos should use official Google/Apple assets when implemented |
| 1.6 Sign Up | `badges/brand_waveform_badge_neutral.webp` | Password strength bar is app UI |
| 1.7 Level Selection | `badges/brand_waveform_badge_neutral.webp`, `onboarding/level_beginner_sprout.webp`, `onboarding/level_intermediate_tree.webp`, `onboarding/level_advanced_tree.webp` | Selection controls use app UI/icons |
| 1.8 Reminder Setup | `badges/brand_waveform_badge_neutral.webp` | Time picker is native/custom UI |
| 1.9 Permission Prompts | `badges/brand_waveform_badge_neutral.webp` | Permission status cards and icons use app UI/icons |
| 2.1 Home - Daily Practice | None bundled | Lesson thumbnail from `Lesson.thumbnailUrl`; goal ring rendered in app |
| 2.2 Lesson Catalog | None bundled | Lesson thumbnails from `Lesson.thumbnailUrl` |
| 2.3 Lesson Detail | None bundled | Lesson thumbnail from `Lesson.thumbnailUrl`; preview waveform rendered in app |
| 2.4 Practice Session | None bundled | Practice waveform rendered in app |
| 2.5 Practice Session State Variants | `badges/badge_practice_loading_waveform.webp`, `badges/badge_practice_audio_error.webp`, `badges/badge_practice_offline_cloud.webp` | Player controls and waveform preview rendered in app |
| 2.6 Recording Comparison | `badges/decor_success_star_badge.webp`, `ui/decor_success_sparkles.webp` | Coach/user waveforms rendered in app |
| 2.7 Progress View | None bundled | Charts, rings, streaks, and lesson thumbnails rendered or loaded by app |
| 3.1 Downloaded Lessons - Offline Library | None bundled | Cached lesson thumbnails from `Lesson.thumbnailUrl` |
| 3.2 Offline Practice Session | None bundled | Offline waveform rendered in app |
| 3.3 Local Reminder Notification | `illustrations/hero_reminder_time_to_shadow.webp`, `icons/app_notification_icon.webp` | Notification shell is OS UI |
| 4.1 Settings | None bundled | Row icons use `MaterialCommunityIcons` |
| 4.2 Reminder Settings | None bundled | Time picker and permission rows use app UI/icons |
| 4.3 Consent Settings | None bundled | Consent rows and radio controls use app UI/icons |
| 4.4 Playback Settings | `badges/brand_waveform_badge_audio.webp` | Speed selector and info rows use app UI/icons |
| 4.5 Profile Settings | None bundled | Initials avatar generated in app |
| 4.6 Recording Library | None bundled | Recording waveform previews rendered in app |
| 4.7 Account Management | `badges/brand_waveform_badge_neutral.webp` | Initials avatar and account actions use app UI/icons |
| 5.1 Retryable Error States | `illustrations/hero_retryable_audio_error_badge.webp` | Buttons and status icons use app UI/icons |
| 5.1 Audio Load Failure Error | `illustrations/hero_audio_load_failure.webp` | Lesson thumbnail from `Lesson.thumbnailUrl` when needed |
| 5.1 Auth Expired Error | `illustrations/hero_auth_expired_shield.webp` | Recovery actions use app UI/icons |
| 5.1 Generic Fallback Error | `illustrations/hero_generic_fallback_error.webp` | Error metadata and buttons use app UI/icons |
| 5.1 Network Loss Error | `illustrations/hero_network_loss_offline_cloud.webp` | Offline/download actions use app UI/icons |
| 5.1 Permission Recovery Error | `illustrations/hero_permission_recovery_cards.webp` | Permission rows use app UI/icons |
| 5.1 Recording Unavailable Error | `illustrations/hero_recording_unavailable_mic_off.webp` | Recovery rows use app UI/icons |
| 5.1 Startup Failure Error | `illustrations/hero_startup_failure_broken_waveform.webp` | Retry/help controls use app UI/icons |
| 5.1 Storage Full Error | `illustrations/hero_storage_full_box.webp` | Storage action rows use app UI/icons |
| 5.2 Exit - Support Path | `illustrations/hero_safe_exit_door.webp` | Exit/support actions use app UI/icons |
| Full-Screen Ad Interstitial Presentation | `illustrations/ad_travel_suitcase_creative.webp` | Close, play, countdown, and sponsored label are app UI |

## Frontend Folder Map

| Folder | Purpose |
| --- | --- |
| `frontend/assets/logos/` | Exact ShadowSpeak brand marks and lockups exported as WebP |
| `frontend/assets/icons/` | App or notification icons that are not icon-font glyphs |
| `frontend/assets/badges/` | Reusable badge-sized artwork |
| `frontend/assets/onboarding/` | Onboarding and consent-flow hero/level artwork |
| `frontend/assets/illustrations/` | Screen hero illustrations, error artwork, reminder art, and ad creative |
| `frontend/assets/ui/` | Small decorative UI accents |
| `frontend/assets/thumbnails/` | Reserved for local/static thumbnails; MVP lesson thumbnails use CDN URLs |
| `frontend/assets/waveforms/` | Reserved only if app-rendered waveforms are later replaced by static assets |
