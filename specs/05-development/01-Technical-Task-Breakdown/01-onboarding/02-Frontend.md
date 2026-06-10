# Epic 01 — Technical Task Breakdown: Onboarding (Frontend)

## Document Metadata

| Field     | Value                                      |
| --------- | ------------------------------------------ |
| Project   | ShadowSpeak                                |
| Epic      | 01 — First-Time Onboarding and Access      |
| Type      | Technical Task Breakdown (Frontend)        |
| Phase     | 05 - Development                           |
| Date      | 2026-06-10                                 |
| Status    | Draft                                      |
| Owner     | Solo Dev                                   |

## Purpose

Detailed breakdown of each frontend task in Epic 01 linking UX specs, screen contracts, and wireframes to concrete implementation files. Each task specifies exactly what to build, where to put it, and how it connects to the backend API.

## Frontend Tech Stack

| Layer              | Technology                                    |
| ------------------ | --------------------------------------------- |
| Framework          | React Native 0.85 + Expo 56                   |
| Navigation         | expo-router (Stack)                           |
| Styling            | nativewind (Tailwind CSS classes)             |
| UI Components      | react-native-paper + custom components        |
| State Management   | Zustand (stores for consent, auth, onboarding) |
| Persistence        | expo-secure-store + AsyncStorage              |
| HTTP Client        | Axios                                         |
| Auth               | Cognito OIDC (PKCE) via existing auth layers  |

## Existing Frontend Structure

```
frontend/src/
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root layout (SafeAreaProvider > PaperProvider > Stack)
│   ├── index.tsx               # Entry redirect → /launch
│   └── (launch)/
│       └── launch.tsx          # Route file → renders LaunchScreen
├── features/
│   ├── auth/                   # Auth layer (OIDC config, token store, AuthManager)
│   │   ├── store/
│   │   │   ├── AuthManager.ts      # Singleton token manager
│   │   │   ├── tokenStore.ts       # SecureStore persistence
│   │   │   └── oidcConfigStore.ts
│   │   ├── services/
│   │   │   ├── authBootstrap.ts
│   │   │   └── oidcConfigService.ts
│   │   ├── lib/
│   │   │   ├── oidcConfigManager.ts
│   │   │   └── oidcConfigValidator.ts
│   │   └── types/
│   │       └── oidcConfig.ts
│   └── launch/
│       └── screens/
│           └── LaunchScreen.tsx  # Current launch/loading screen
├── theme.ts                  # react-native-paper theme (colors, roundness)
├── assets.ts                 # Asset map (logos, badges, onboarding, illustrations)
├── global.css                # Tailwind imports
└── tailwind.config.js        # NativeWind config (colors, font sizes, radii)
```

## New Frontend Structure (Onboarding)

```
frontend/src/
├── app/
│   ├── _layout.tsx               # Updated: add (onboarding) to Stack
│   └── (onboarding)/             # New route group
│       ├── _layout.tsx           # Stack navigator for onboarding
│       ├── age-gate.tsx          # Route → AgeGateScreen
│       ├── age-policy-block.tsx  # Route → AgePolicyBlockScreen
│       ├── consent.tsx           # Route → ConsentScreen
│       ├── sign-in.tsx           # Route → SignInScreen
│       ├── sign-up.tsx           # Route → SignUpScreen
│       ├── level-selection.tsx   # Route → LevelSelectionScreen
│       ├── reminder-setup.tsx    # Route → ReminderSetupScreen
│       └── permission-prompts.tsx# Route → PermissionPromptsScreen
├── features/
│   └── onboarding/
│       ├── screens/
│       │   ├── AgeGateScreen.tsx
│       │   ├── AgePolicyBlockScreen.tsx
│       │   ├── ConsentScreen.tsx
│       │   ├── SignInScreen.tsx
│       │   ├── SignUpScreen.tsx
│       │   ├── LevelSelectionScreen.tsx
│       │   ├── ReminderSetupScreen.tsx
│       │   └── PermissionPromptsScreen.tsx
│       ├── components/
│       │   ├── OnboardingProgressBar.tsx
│       │   ├── OnboardingShell.tsx
│       │   ├── SocialSignInButtons.tsx
│       │   ├── ConsentToggleRow.tsx
│       │   ├── LevelCard.tsx
│       │   └── PermissionCard.tsx
│       ├── stores/
│       │   ├── onboardingStore.ts
│       │   └── consentStore.ts
│       ├── services/
│       │   └── onboardingApi.ts
│       └── types/
│           └── onboarding.ts
```

---

## 1.1 — App Launch (Enhancement)

### Design References
- **UX Spec**: Section 1.1 (App Launch)
- **Wireframe**: 1.1 App Launch
- **Existing file**: `frontend/src/features/launch/screens/LaunchScreen.tsx`

### Description
Enhance the existing LaunchScreen to resolve session state (age, consent, auth) and route to the correct next screen. The current screen is purely static — it needs routing logic integrated via the `onboardingStore`.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.1.1 | `frontend/src/features/onboarding/stores/onboardingStore.ts` | Create Zustand store with `status: 'loading' \| 'needs_age_gate' \| 'needs_consent' \| 'needs_auth' \| 'needs_onboarding_completion' \| 'complete'`, `resolveStartupState()` action that checks local auth + consent + onboarding progress. |
| 1.1.2 | `frontend/src/features/launch/screens/LaunchScreen.tsx` | Update to call `resolveStartupState()` on mount. Show loading state (already exists). On resolution, `router.replace()` to the appropriate route. |
| 1.1.3 | `frontend/src/app/(launch)/launch.tsx` | Update to handle error state (startup failure) with retry button. Currently renders LaunchScreen directly — add error/retry UI. |

### Startup Resolution Logic

```
1. Check onboardingStore persisted state
   → If onboardingStep === 'complete' → route to /(tabs)/home
   → If onboardingStep exists → route to /(onboarding)/<resume_step>
2. Check AuthManager.getAccessToken()
   → If present → skip auth screens, route based on onboarding step
   → If absent → prepare for sign-in after consent
3. If no stored state at all → route to /(onboarding)/age-gate
```

### Acceptance

- On first launch, resolves to `needs_age_gate` and routes to `/age-gate`
- On return launch with incomplete onboarding, resumes at the correct step
- On return launch with completed onboarding, routes to home
- Error state shows retryable message with retry CTA
- Loading animation visible during startup resolution

---

## 1.2 — Age Gate Screen

### Design References
- **UX Spec**: Section 1.2 (Age Gate)
- **Wireframe**: 1.2 Age Gate
- **Assets**: `badges/brand_waveform_badge_neutral.webp`, `ui/decor_sparkle_leaf_soft_01.webp`
- **Backend**: Task 1.13.1 (ConsentService.validate_age_gate)

### Description
Self-attested age confirmation screen. The user confirms they meet the minimum age requirement before proceeding. Connected to backend consent service for validation and persistence.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.2.1 | `frontend/src/features/onboarding/screens/AgeGateScreen.tsx` | Full screen with back action (disabled on first screen), age confirmation control (checkbox or button-based attestation), helper/legal copy, Continue CTA, Exit CTA. Uses nativewind classes for styling. |
| 1.2.2 | `frontend/src/features/onboarding/services/onboardingApi.ts` | `submitAgeGate(ageVerified: boolean, deviceId: string)` — calls `PUT /consent` with `{ ageVerified }`. Uses `X-Device-Id` header. Returns consent state. |
| 1.2.3 | `frontend/src/app/(onboarding)/age-gate.tsx` | Route file rendering `AgeGateScreen`. |

### Validation Rules

- Age attestation must be explicitly confirmed (no implied consent via continue)
- Cannot proceed without attestation — Continue button disabled until confirmed
- On under-age → route to `/age-policy-block`
- On age confirmed → route to `/consent`
- API failure → show inline error with retry, do not advance

### State Handling

| State | Behavior |
|-------|----------|
| Default | Age checkbox unchecked, Continue disabled |
| Attested | Checkbox checked, Continue enabled |
| Submitting | Show spinner on Continue, disable all controls |
| API Error | Show inline `color-error` message, enable retry |
| Age denied | Navigate to `/age-policy-block` |
| Success | Navigate to `/consent` |

### Acceptance

- User cannot proceed without explicit age attestation
- API submission stores `ageVerified=true` via `PUT /consent`
- Under-age selection routes to Age Policy Block
- Back navigation is disabled (would exit app or return to launch)
- Error state is recoverable without losing attestation state

---

## 1.3 — Age Policy Block Screen

### Design References
- **UX Spec**: Section 1.3 (Age Policy Block)
- **Wireframe**: 1.3 Age Policy Block
- **Assets**: `onboarding/hero_age_policy_block.webp`

### Description
Dead-end screen for underage users. Blocks all navigation into the app and provides a safe exit.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.3.1 | `frontend/src/features/onboarding/screens/AgePolicyBlockScreen.tsx` | Full-screen blocking state with block message, explanation text, hero illustration, and Exit CTA. No back navigation. Minimal visual density. |
| 1.3.2 | `frontend/src/app/(onboarding)/age-policy-block.tsx` | Route file rendering `AgePolicyBlockScreen`. |

### Acceptance

- Full-screen blocking state with no navigation out except Exit
- Hero illustration displayed prominently
- Exit CTA closes the onboarding flow (triggers OS exit via `BackHandler.exitApp()`)
- No back navigation, no skip, no alternative route into the app

---

## 1.4 — Privacy and Ad Consent Screen

### Design References
- **UX Spec**: Section 1.4 (Privacy and Ad Consent)
- **Wireframe**: 1.4 Privacy and Ad Consent
- **Assets**: `onboarding/hero_privacy_shield_lock.webp`
- **Backend**: Task 1.13 (`GET/PUT /consent`), Task 1.15 (Pre-auth Bootstrap)

### Description
Captures required privacy consent and ad preference before account creation. Persists via the backend consent API with `X-Device-Id` for pre-auth bootstrap.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.4.1 | `frontend/src/features/onboarding/screens/ConsentScreen.tsx` | Full screen with back action, consent explanation block, privacy acceptance toggle/checkbox, ad preference control (personalized vs non-personalized), Accept and Continue CTA, Decline and Exit CTA. Uses nativewind + react-native-paper components. |
| 1.4.2 | `frontend/src/features/onboarding/components/ConsentToggleRow.tsx` | Reusable row component: icon + label + toggle/radio for consent options. Accepts `title`, `description`, `checked`, `onToggle`, `required` props. |
| 1.4.3 | `frontend/src/features/onboarding/services/onboardingApi.ts` | `submitConsent(consent: { privacyAccepted: boolean, adConsent: 'personalized' \| 'non_personalized' \| 'unknown' }, deviceId: string)` — calls `PUT /consent`. |
| 1.4.4 | `frontend/src/features/onboarding/stores/consentStore.ts` | Zustand store: `consentState` (ageVerified, privacyAccepted, adConsent), `deviceId` (generated UUID on first install, persisted to AsyncStorage), actions: `setConsent()`, `loadDeviceId()`. |
| 1.4.5 | `frontend/src/app/(onboarding)/consent.tsx` | Route file rendering `ConsentScreen`. |

### Validation Rules

- `privacyAccepted` must be true to proceed — required consent
- `adConsent` defaults to `unknown`, can be `personalized` or `non_personalized`
- If privacy consent declined → route to `/age-policy-block` (required consent not given)
- `deviceId` sourced from persisted UUID in consentStore
- All consent changes go through `PUT /consent`

### State Handling

| State | Behavior |
|-------|----------|
| Default | Privacy not accepted, ad consent = unknown, Continue disabled |
| Privacy accepted | Continue enabled |
| Submitting | Show spinner on Continue, disable all controls |
| API Error | Show inline error, enable retry |
| Declined required consent | Navigate to `/age-policy-block` |
| Success | Navigate to `/sign-in` |

### Acceptance

- Privacy consent is required; ad consent is optional but defaulted
- Decline of required consent routes to Age Policy Block
- `PUT /consent` called with device-scoped consent state
- Consent state persisted in consentStore for re-key after sign-in
- Back navigation returns to Age Gate

---

## 1.5 — Sign In Screen

### Design References
- **UX Spec**: Section 1.5 (Sign In)
- **Wireframe**: 1.5 Sign In
- **Assets**: `badges/brand_waveform_badge_neutral.webp`
- **Backend**: Task 1.12 (Cognito JWT), Task C.4 (Cognito User Pool)

### Description
Email/password authentication screen with optional social sign-in (Google, Apple). Integrates with existing AuthManager and Cognito OIDC flow.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.5.1 | `frontend/src/features/onboarding/screens/SignInScreen.tsx` | Full screen with back action, email input, password input (show/hide), social sign-in buttons (Google, Apple — prepared for future OIDC provider rollout), "Forgot password?" link, Sign In CTA, "Create account" secondary CTA. |
| 1.5.2 | `frontend/src/features/onboarding/components/SocialSignInButtons.tsx` | Reusable component rendering social sign-in buttons (Google, Apple). Each button shows provider icon + "Continue with {Provider}". Prepared as visual placeholder — actual OIDC provider integration is wired in Task 1.5.4. |
| 1.5.3 | `frontend/src/features/onboarding/services/onboardingApi.ts` | `authenticate(email: string, password: string)` — calls Cognito sign-in via existing OIDC flow (AuthManager, oidcConfigManager). Returns tokens on success. |
| 1.5.4 | `frontend/src/features/onboarding/screens/SignInScreen.tsx` | Wire Cognito PKCE auth flow using existing `oidcConfigManager` and `AuthManager`. On success, set tokens in AuthManager, trigger consent re-key (see 1.5.5). |
| 1.5.5 | `frontend/src/features/onboarding/services/onboardingApi.ts` | `rekeyConsent()` — after successful sign-in, call `PUT /consent` with JWT + `X-Device-Id` to trigger backend re-key (see Backend 1.16). |
| 1.5.6 | `frontend/src/app/(onboarding)/sign-in.tsx` | Route file rendering `SignInScreen`. |

### Validation Rules

- Email: valid email format required (client-side regex validation)
- Password: non-empty, minimum 1 character (authentication handled server-side)
- Both fields required before Sign In enabled
- Social sign-in buttons do not require form validation

### State Handling

| State | Behavior |
|-------|----------|
| Default | Empty form, Sign In disabled |
| Loading | Disable controls, show spinner on Sign In |
| Error (invalid credentials) | Inline `color-error` message above fields |
| Error (network) | "Could not connect" inline error with retry |
| Error (auth expired during re-key) | Retry sign-in |
| Success | Navigate to `/level-selection` |

### Acceptance

- Email and password fields with show/hide for password
- Form validation prevents submission with empty/badly formatted fields
- Cognito authentication returns valid JWT
- AuthManager populated with access + refresh tokens
- Consent re-key triggered after successful auth
- Social sign-in buttons visible and tappable (placeholder behavior until OIDC providers configured)
- "Forgot password?" shown as tertiary action
- Success routes to Level Selection

---

## 1.6 — Sign Up Screen

### Design References
- **UX Spec**: Section 1.6 (Sign Up)
- **Wireframe**: 1.6 Sign Up
- **Assets**: `badges/brand_waveform_badge_neutral.webp`
- **Backend**: Task C.4 (Cognito Pre-Sign-Up Trigger)

### Description
New account creation form with email/password validation, password strength indicator, terms acceptance, and Cognito registration.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.6.1 | `frontend/src/features/onboarding/screens/SignUpScreen.tsx` | Full screen with back action, email input, password input, confirm password input, Terms of Service & Privacy Policy link, "Create Account" CTA, "Already have account? Sign In" link. Includes real-time validation feedback. |
| 1.6.2 | `frontend/src/features/onboarding/services/onboardingApi.ts` | `register(email: string, password: string)` — calls Cognito sign-up via existing OIDC flow. On auto-confirm (MVP pre-sign-up trigger), immediately sign in and obtain tokens. |
| 1.6.3 | `frontend/src/app/(onboarding)/sign-up.tsx` | Route file rendering `SignUpScreen`. |

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Email | Valid email format (regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`) | "Please enter a valid email address" |
| Password | Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number | "Password must be at least 8 characters with mixed case and a number" |
| Confirm Password | Must exactly match Password | "Passwords do not match" |
| Terms | Required acceptance (checkbox or tap-through via link) | "You must accept the Terms of Service to continue" |

### Password Strength Indicator

| Strength | Criteria | Color |
|----------|----------|-------|
| Weak | < 8 chars or only one character type | `color-error` |
| Medium | 8+ chars, 2 of 3 types (upper, lower, number) | `color-warning` |
| Strong | 8+ chars, all 3 types | `color-success` |

### State Handling

| State | Behavior |
|-------|----------|
| Default | Empty form, Create Account disabled |
| Real-time validation | Inline feedback per field as user types |
| Submitting | Disable all controls, show spinner |
| Error (email taken) | Inline error: "An account with this email already exists" |
| Error (weak password rejected) | Show server validation error inline |
| Error (network) | "Could not connect" inline error with retry |
| Success | Navigate to `/level-selection` |

### Acceptance

- All four validation rules enforced client-side in real-time
- Password strength indicator visually rendered (weak/medium/strong)
- Terms of Service & Privacy Policy link opens external browser
- Cognito sign-up triggered with auto-confirm (pre-sign-up Lambda)
- On success, automatic sign-in and token storage in AuthManager
- Consent re-key triggered after successful registration
- "Already have account? Sign In" navigates to `/sign-in`
- Success routes to Level Selection

---

## 1.7 — Level Selection Screen

### Design References
- **UX Spec**: Section 1.7 (Level Selection)
- **Wireframe**: 1.7 Level Selection
- **Assets**: `onboarding/level_beginner_sprout.webp`, `onboarding/level_intermediate_tree.webp`, `onboarding/level_advanced_tree.webp`

### Description
Proficiency level picker that seeds the first lesson recommendation. Three levels (beginner, intermediate, advanced) presented as cards.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.7.1 | `frontend/src/features/onboarding/screens/LevelSelectionScreen.tsx` | Screen with guidance text, three level cards (beginner, intermediate, advanced), selection state indicator, "Continue" CTA. Single-select behavior. |
| 1.7.2 | `frontend/src/features/onboarding/components/LevelCard.tsx` | Reusable card component: image (asset or icon), title, short description, selected/unselected states. Highlights on selection with `color-primary` border/tint. Large tap target. |
| 1.7.3 | `frontend/src/features/onboarding/services/onboardingApi.ts` | `saveLevel(userId: string, level: string)` — calls `PUT /me` with `{ level }` (authenticated). Also calls `PUT /me/onboarding-step` with `{ step: 'level_selected' }`. |
| 1.7.4 | `frontend/src/app/(onboarding)/level-selection.tsx` | Route file rendering `LevelSelectionScreen`. |

### Validation Rules

- Exactly one level must be selected to enable Continue
- `level` must be one of: `beginner`, `intermediate`, `advanced`

### State Handling

| State | Behavior |
|-------|----------|
| Default | No level selected, Continue disabled |
| Selected | One card highlighted with border/tint, Continue enabled |
| Submitting | Show spinner on Continue |
| API Error | Inline error, retry enabled, selection preserved |
| Success | Navigate to `/reminder-setup` |

### Acceptance

- Three level cards with distinct images per UX spec
- Single-select with visual highlight on chosen card
- Continue disabled until a level is chosen
- Selection saved via `PUT /me`
- Onboarding step advanced via `PUT /me/onboarding-step`
- Back navigation returns to Sign In / Sign Up

---

## 1.8 — Reminder Setup Screen

### Design References
- **UX Spec**: Section 1.8 (Reminder Setup)
- **Wireframe**: 1.8 Reminder Setup
- **Assets**: `badges/brand_waveform_badge_neutral.webp`
- **Backend**: `reminderTime` field on `PUT /me`

### Description
Optional reminder time picker shown during onboarding. User can enable/disable and pick a time for daily practice reminders.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.8.1 | `frontend/src/features/onboarding/screens/ReminderSetupScreen.tsx` | Screen with reminder explanation, enable/disable toggle, time picker (enabled only when toggle is on), "Continue" CTA, "Skip reminders" secondary CTA. |
| 1.8.2 | `frontend/src/features/onboarding/services/onboardingApi.ts` | `saveReminder(userId: string, reminderTime: string \| null)` — calls `PUT /me` with `{ reminderTime }` in `HH:MM` 24h format (or null to disable). Also calls `PUT /me/onboarding-step` with `{ step: 'reminder_set' }`. |
| 1.8.3 | `frontend/src/app/(onboarding)/reminder-setup.tsx` | Route file rendering `ReminderSetupScreen`. |

### Validation Rules

- `reminderTime` format: `HH:MM` (24-hour), validated when toggle is enabled
- Time picker default: 07:00 (7 AM)
- Reminders are optional — skipping continues to Permission Prompts

### State Handling

| State | Behavior |
|-------|----------|
| Default (disabled) | Toggle off, time picker inactive/greyed out, Continue enabled |
| Enabled | Toggle on, time picker active showing default time, Continue enabled |
| Submitting | Spinner on Continue |
| API Error | Inline error, retry, preserve settings |
| Success | Navigate to `/permission-prompts` |
| Skip tapped | Navigate to `/permission-prompts` without saving |

### Acceptance

- Toggle enables/disables time picker
- Time picker selects hour and minute
- Default time 07:00
- Continue saves reminderTime to `PUT /me`
- "Skip reminders" proceeds without saving time
- Onboarding step advanced via `PUT /me/onboarding-step`
- Back navigation returns to Level Selection

---

## 1.9 — Permission Prompts Screen

### Design References
- **UX Spec**: Section 1.9 (Permission Prompts)
- **Wireframe**: 1.9 Permission Prompts
- **Assets**: `badges/brand_waveform_badge_neutral.webp`

### Description
Final onboarding screen handling notification and microphone permissions. Shows status per permission, rationale, and recovery guidance.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.9.1 | `frontend/src/features/onboarding/screens/PermissionPromptsScreen.tsx` | Screen with title, two permission cards (notifications, microphone), each showing current status (granted/denied/not-requested), rationale, Continue CTA. |
| 1.9.2 | `frontend/src/features/onboarding/components/PermissionCard.tsx` | Reusable card: icon, title, description, status badge (granted/denied/not-requested), request permission action button. |
| 1.9.3 | `frontend/src/features/onboarding/services/onboardingApi.ts` | `completeOnboarding(userId: string)` — calls `PUT /me/onboarding-step` with `{ step: 'complete' }`. |
| 1.9.4 | `frontend/src/features/onboarding/services/permissionService.ts` | `requestNotificationPermission()` — wraps `expo-notifications` request API, returns granted/denied. `requestMicrophonePermission()` — wraps `expo-av` or `expo-audio` request API, returns granted/denied. |
| 1.9.5 | `frontend/src/app/(onboarding)/permission-prompts.tsx` | Route file rendering `PermissionPromptsScreen`. |

### Permission Handling Logic

```
1. On mount: Check current permission status (notifications, microphone)
2. Show status for each permission in PermissionCard
3. User taps "Allow" on a card → triggers OS permission dialog
4. On result → update card status (granted/denied)
5. Continue always works, regardless of permission outcomes:
   - Notification denied → reminders disabled (saved locally), recovery path in Settings
   - Microphone denied → listening-only mode (recording blocked until recovery)
   - Both granted → full experience
6. After Continue: call completeOnboarding(), navigate to /(tabs)/home
```

### State Handling

| State | Behavior |
|-------|----------|
| Not requested | Card shows "Allow" action, permission prompt not yet shown |
| Granted | Card shows green "Granted" badge |
| Denied | Card shows "Denied" badge with recovery note (Settings path) |
| Continue pressed | Call completeOnboarding(), navigate to Home |
| "Open Settings" tapped | Open OS system settings for this app |

### Acceptance

- Two permission cards: notifications and microphone
- Each card shows current permission status
- Tapping card action triggers respective OS permission dialog
- Continue works regardless of permission outcomes
- Permission denied cards show recovery guidance
- "Open Settings" button navigates to OS app settings
- Onboarding completion saved via `PUT /me/onboarding-step`
- Success navigates to Home screen

---

## Cross-cutting: Onboarding Route Group (C.1)

### Description
Create the Expo Router route group for all onboarding screens with Stack navigator configuration.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.1.1 | `frontend/src/app/(onboarding)/_layout.tsx` | Stack navigator for `(onboarding)` group. Configure `headerShown: false` (all onboarding screens manage their own headers). Import and initialize onboardingStore and consentStore. |
| C.1.2 | `frontend/src/app/_layout.tsx` | Update root layout to not handle redirects specifically for launch — let the index.tsx redirect to `/launch`, and let LaunchScreen route to `/onboarding/` or `/tabs/`. |

### Route Registration

Each onboarding screen gets a route file (`frontend/src/app/(onboarding)/<screen-name>.tsx`) that exports the screen component as default:

```tsx
// Example: frontend/src/app/(onboarding)/age-gate.tsx
export { default } from "@/features/onboarding/screens/AgeGateScreen";
```

### Acceptance

- All 9 onboarding screens accessible via `/onboarding/<screen-name>` routes
- Stack navigator manages push/pop transitions between screens
- `_layout.tsx` initializes Zustand stores at the group level
- Back navigation works per screen rules
- Routes not exposed outside the onboarding group

---

## Cross-cutting: Zustand Stores (C.2)

### Description
Centralized state management for onboarding progress, consent, and device identity.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.2.1 | `frontend/src/features/onboarding/stores/onboardingStore.ts` | Zustand store with `onboardingStep: OnboardingStep \| null` (see types), `status` (loading, ready, error), `isLoading`, `error`. Actions: `resolveStartupState()`, `setStep(step)`, `reset()`. Persist step to AsyncStorage via Zustand `persist` middleware. |
| C.2.2 | `frontend/src/features/onboarding/stores/consentStore.ts` | Zustand store with `ageVerified: boolean`, `privacyAccepted: boolean`, `adConsent: AdConsentType`, `deviceId: string`. Actions: `setAgeVerified()`, `setConsent()`, `loadDeviceId()`, `reset()`. Persist to SecureStore/AsyncStorage. |
| C.2.3 | `frontend/src/features/onboarding/types/onboarding.ts` | Type definitions: `OnboardingStep` enum (`null \| 'age_gate_done' \| 'consent_done' \| 'intro_done' \| 'level_selected' \| 'reminder_set' \| 'mic_permission_done' \| 'complete'`), `AdConsentType` (`'unknown' \| 'personalized' \| 'non_personalized'`), `OnboardingState`, `ConsentState`. |

### Store Persistence Strategy

- `onboardingStore`: persist via Zustand `persist` middleware with AsyncStorage
- `consentStore`: persist via Zustand `persist` middleware with SecureStore (falls back to AsyncStorage in dev)
- `deviceId`: generated once via `uuid.v4()`, persisted in AsyncStorage, loaded on app start

### Onboarding Step Resume Logic

| `onboardingStep` | Resume Route |
|---|---|
| `null` | `/onboarding/age-gate` |
| `age_gate_done` | `/onboarding/consent` |
| `consent_done` | `/onboarding/sign-in` |
| `intro_done` | `/onboarding/level-selection` |
| `level_selected` | `/onboarding/reminder-setup` |
| `reminder_set` | `/onboarding/permission-prompts` |
| `mic_permission_done` | `/onboarding/permission-prompts` |
| `complete` | `/(tabs)/home` |

---

## Cross-cutting: Shared Components (C.3)

### Description
Reusable shared components used across onboarding screens.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.3.1 | `frontend/src/features/onboarding/components/OnboardingShell.tsx` | Shared wrapper component for all onboarding screens. Provides consistent vertical layout, default horizontal padding (16px), SafeAreaView handling, and keyboard-avoiding behavior for form screens. Accepts `children`, `showBack` (boolean), `onBack` callback, `footer` (ReactNode for bottom CTAs). |
| C.3.2 | `frontend/src/features/onboarding/components/OnboardingProgressBar.tsx` | Optional step indicator at the top of each screen. Shows dots or segments representing progress through the 8 onboarding steps. Accepts `currentStep` and `totalSteps` props. |
| C.3.3 | `frontend/src/features/onboarding/components/ConsentToggleRow.tsx` | Reusable row for consent choices: icon, label, description, toggle/checkbox. Props: `icon` (MaterialCommunityIcons name), `title`, `description`, `checked`, `onToggle`, `required`. |
| C.3.4 | `frontend/src/features/onboarding/components/SocialSignInButtons.tsx` | Provider button component. Props: `provider: 'google' \| 'apple'`, `onPress`, `loading`. Renders provider icon + "Continue with {provider}". |
| C.3.5 | `frontend/src/features/onboarding/components/LevelCard.tsx` | Level selection card. Props: `level: 'beginner' \| 'intermediate' \| 'advanced'`, `image` (asset), `title`, `description`, `selected`, `onPress`. |
| C.3.6 | `frontend/src/features/onboarding/components/PermissionCard.tsx` | Permission status card. Props: `title`, `description`, `icon`, `status: 'not_requested' \| 'granted' \| 'denied'`, `onRequest`, `onOpenSettings`. |

---

## Cross-cutting: API Service Layer (C.4)

### Description
Backend API integration layer for all onboarding endpoints.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.4.1 | `frontend/src/features/onboarding/services/onboardingApi.ts` | All onboarding API functions: `submitAgeGate()`, `getConsent()`, `submitConsent()`, `rekeyConsent()`, `getProfile()`, `saveProfile()`, `saveLevel()`, `saveReminder()`, `saveOnboardingStep()`, `completeOnboarding()`. Each function handles JWT injection via AuthManager and `X-Device-Id` header injection. |
| C.4.2 | `frontend/src/features/onboarding/services/permissionService.ts` | Platform-specific permission check/request functions: `requestNotificationPermission()`, `requestMicrophonePermission()`, `getNotificationPermissionStatus()`, `getMicrophonePermissionStatus()`. |
| C.4.3 | `frontend/src/features/onboarding/services/deviceIdService.ts` | `getOrCreateDeviceId()` — generates UUID on first install, persists to AsyncStorage, returns cached value on subsequent calls. Used for `X-Device-Id` header. |

### API Function Signatures

```typescript
// GET /consent (pre-auth with X-Device-Id or authenticated with JWT)
getConsent(deviceId?: string): Promise<ConsentState>

// PUT /consent
submitConsent(consent: {
  ageVerified?: boolean;
  privacyAccepted?: boolean;
  adConsent?: 'unknown' | 'personalized' | 'non_personalized';
}, deviceId?: string): Promise<ConsentState>

// PUT /me (authenticated)
saveProfile(profile: Partial<UserProfile>): Promise<UserProfile>

// PUT /me/onboarding-step (authenticated)
saveOnboardingStep(step: OnboardingStep): Promise<void>
```

---

## Cross-cutting: Platform-Specific Handling (C.5)

### Description
iOS and Android-specific behaviors for onboarding screens.

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.5.1 | `frontend/src/features/onboarding/screens/PermissionPromptsScreen.tsx` | iOS: notification permission uses `expo-notifications` getPermissionsAsync/requestPermissionsAsync. Microphone uses `expo-av` Audio.requestPermissionsAsync. Android: same APIs but different system dialog behavior. Add Platform.OS checks where API differs. |
| C.5.2 | `frontend/src/features/onboarding/screens/AgeGateScreen.tsx` | iOS: safe area insets respected via SafeAreaView. Android: status bar handling. |
| C.5.3 | All onboarding screens | Handle hardware back button (Android): close app on Age Gate (no back), navigate to previous step otherwise. Use `BackHandler` from react-native. |
| C.5.4 | `frontend/src/features/onboarding/screens/SignInScreen.tsx` | iOS: Apple Sign-In button uses Apple's SF Symbol styling guidelines. Android: Google Sign-In button uses Material Design guidelines. |

### Platform Notes

- Android hardware back: on Age Gate, exit app. On all other screens, navigate to previous onboarding step.
- iOS gesture back: controlled via Stack navigator configuration (some screens disable it).
- Keyboard avoidance: use `KeyboardAvoidingView` with `behavior="padding"` on iOS, `behavior="height"` on Android for Sign In / Sign Up screens.
- Permission prompts: On iOS, a permission can only be requested once (subsequent requests ignored by OS). On Android, permission can be re-requested.

---

## Cross-cutting: Testing (C.6)

### Design References
- **UX Spec**: All screens in Section 1
- **Backend**: Testing tasks T.1–T.10

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| T.1 | `frontend/__tests__/onboarding/AgeGateScreen.test.tsx` | Test render states, attestation toggle, validation, navigation on confirm/deny. |
| T.2 | `frontend/__tests__/onboarding/ConsentScreen.test.tsx` | Test toggle states, required consent enforcement, ad consent options, navigation on accept/decline. |
| T.3 | `frontend/__tests__/onboarding/SignInScreen.test.tsx` | Test form validation, email format, password field show/hide, loading state, error display, social buttons visibility. |
| T.4 | `frontend/__tests__/onboarding/SignUpScreen.test.tsx` | Test all 4 validation rules (email, password, confirm password, terms), password strength indicator states, form submission. |
| T.5 | `frontend/__tests__/onboarding/LevelSelectionScreen.test.tsx` | Test single-selection, card highlight states, Continue disabled/enabled, API save. |
| T.6 | `frontend/__tests__/onboarding/ReminderSetupScreen.test.tsx` | Test toggle on/off states, time picker active/inactive, skip navigation, save behavior. |
| T.7 | `frontend/__tests__/onboarding/PermissionPromptsScreen.test.tsx` | Test permission card states, status badges, Continue always enabled, onboarding completion call. |
| T.8 | `frontend/__tests__/onboarding/onboardingStore.test.ts` | Test step transitions, progress persistence, resume logic, reset. |
| T.9 | `frontend/__tests__/onboarding/consentStore.test.ts` | Test consent state persistence, device ID generation, reset. |
| T.10 | `frontend/__tests__/onboarding/navigation.test.tsx` | Test full navigation flow: launch → age gate → consent → sign in → level → reminder → permissions → home. |
| T.11 | `frontend/__tests__/onboarding/onboardingApi.test.ts` | Test API functions with mocked Axios, verify headers (JWT, X-Device-Id). |

### Mock Strategy

- Mock `expo-router` `router` for navigation assertions
- Mock `AuthManager` for token-dependent tasks
- Mock `expo-secure-store` and `AsyncStorage` for persistence tests
- Mock `expo-notifications` and `expo-av` for permission tests
- Mock Axios with `axios-mock-adapter` for API tests
- Use `renderWithProviders` helper that wraps components in PaperProvider + SafeAreaProvider

---

## Task Dependency Graph

```
C.1 (Onboarding Route Group)
├── C.2 (Zustand Stores) ◄── C.3 (Shared Components)
│     ├── 1.1 (App Launch Enhancement)
│     │     ├── 1.2 (Age Gate Screen)
│     │     │     ├── 1.3 (Age Policy Block Screen)
│     │     │     └── 1.4 (Consent Screen)
│     │     │           ├── 1.5 (Sign In Screen)
│     │     │           │     └── 1.6 (Sign Up Screen)
│     │     │           └── (1.5 or 1.6) → 1.7 (Level Selection)
│     │     │                 └── 1.8 (Reminder Setup)
│     │     │                       └── 1.9 (Permission Prompts)
│     │     └── C.4 (API Service Layer) ◄── all API-consuming screens
│     └── C.5 (Platform-Specific) ◄── all screens
└── T.1–T.11 (Testing) ◄── all implementation tasks
```

### Suggested Build Order

| Step | Tasks | Result |
|------|-------|--------|
| 1 | C.1 + C.2 + C.3 (stubs) | Onboarding route group with empty screens and working navigation |
| 2 | 1.1 (Launch enhancement) + C.2.1 (onboardingStore) | App resolves startup state and routes correctly |
| 3 | 1.2 (Age Gate) + 1.3 (Policy Block) | Age verification flow complete |
| 4 | 1.4 (Consent) + C.4 (API layer) | Consent capture and persistence complete |
| 5 | 1.5 (Sign In) + 1.6 (Sign Up) + auth wiring | Authentication flow complete with consent re-key |
| 6 | 1.7 (Level Selection) + 1.8 (Reminder Setup) + 1.9 (Permission Prompts) | Full onboarding flow connected to Home |
| 7 | C.5 (Platform-specific polish) | iOS/Android specific behaviors |
| 8 | T.1–T.11 (Testing) | All tests passing |

---

## Revision History

| Version | Date       | Author   | Description |
|---------|-----------|----------|-------------|
| 1.0     | 2026-06-10 | Solo Dev | Initial technical task breakdown for Epic 01 frontend onboarding |
