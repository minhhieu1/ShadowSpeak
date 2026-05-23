# Epic 01 — Technical Task Breakdown: Onboarding (Frontend)

## Document Metadata

| Field     | Value                                      |
| --------- | ------------------------------------------ |
| Project   | ShadowSpeak                                |
| Epic      | 01 — First-Time Onboarding and Access      |
| Type      | Technical Task Breakdown (Frontend)        |
| Phase     | 05 - Development                           |
| Date      | 2026-05-16                                 |
| Status    | Draft                                      |
| Owner     | Solo Dev                                   |

## Purpose

Detailed breakdown of each frontend task in Epic 01 linking user stories → screens → navigation → Zustand stores → API client → implementation files. Each task specifies exactly what to build, where to put it, and what to test.

## Existing Frontend Structure

All frontend code lives under `frontend/` with a flat single-screen scaffold:

```
frontend/
├── App.tsx                              # Root component — manual tab switching, no navigation library
├── src/
│   ├── api/
│   │   └── client.ts                    # Basic GET-only API client (no auth, no PUT)
│   ├── assets.ts                        # Asset references
│   ├── data/
│   │   └── demoData.ts                  # Demo lesson/progress types
│   ├── state/
│   │   └── useAppStore.ts               # Zustand — activeTab only
│   ├── theme.ts                         # Color, spacing, radii, typography tokens
│   └── types/
│       └── assets.d.ts                  # Asset type declarations
├── package.json                         # Expo SDK 54, RN 0.81.5, Zustand 5.x, no @react-navigation
└── tsconfig.json                        # Strict mode enabled
```

New code follows the directory conventions from the Mobile LLD:

```
frontend/src/
├── screens/onboarding/     # Onboarding screens (one per task)
├── components/             # Reusable UI components
│   ├── ui/                 # Generic UI primitives (Button, Input, etc.)
│   └── onboarding/         # Onboarding-specific components
├── stores/                 # Zustand stores (auth, consent, notification)
├── services/
│   ├── api/                # API client modules (authApi, consentApi, profileApi)
│   ├── auth/               # Auth service (Cognito integration helpers)
│   └── notifications/      # Notification service (reminder scheduling)
├── navigation/             # Navigation configuration (Root, Onboarding, MainTabs)
└── types/                  # TypeScript type definitions (auth, consent, navigation, notification)
```

## Dependencies to Install

Run the following before starting implementation:

```bash
# Navigation core
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
# Peer deps for navigation
npx expo install react-native-screens react-native-safe-area-context
# Auth (social sign-in)
npx expo install expo-auth-session expo-web-browser
# Secure storage for tokens
npx expo install expo-secure-store
# Notifications
npx expo install expo-notifications
# Microphone permission
npx expo install expo-av
# AdMob
npx expo install react-native-google-mobile-ads
# UUID generation for X-Device-Id
npx expo install expo-crypto
# Async storage for device ID persistence
npx expo install @react-native-async-storage/async-storage
```

---

## Cross-cutting: Navigation Architecture (C.Nav)

### Design References
- **IA Doc**: Navigation Architecture (Depth 0-3, Tab/Stack/Modal patterns)
- **UI Spec**: Navigation and Transition Rules section
- **User Flow**: First-Time Onboarding Flow diagram
- **Wireframes**: Shared Shell Pattern

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.Nav.1 | `frontend/src/types/navigation.ts` | Define all navigation param lists: `RootStackParamList`, `OnboardingStackParamList`, `MainTabParamList`. Include `isAuthenticated`, `onboardingStep` as route params where needed. |
| C.Nav.2 | `frontend/src/navigation/MainTabNavigator.tsx` | Bottom tab navigator with 5 tabs: Home, Lessons, Downloads, Progress, Settings. Uses `@react-navigation/bottom-tabs`. Each tab is a placeholder screen initially (migrated from existing App.tsx inline components). |
| C.Nav.3 | `frontend/src/navigation/OnboardingNavigator.tsx` | Stack navigator for the full onboarding flow. Screens in order: AgeGate, Consent, SignIn (with nested SignUp/ForgotPassword push), IntroScreens, LevelSelection, ReminderSetup, PermissionPrompts. Uses `@react-navigation/native-stack` with `headerShown: false` for custom headers. |
| C.Nav.4 | `frontend/src/navigation/RootNavigator.tsx` | Root navigator that switches between OnboardingStack and MainTabs based on auth+onboarding state. Reads from authStore and consentStore to determine initial route. Includes AgeGate and AgePolicyBlock as modal/full-screen blocking states at Depth 0. |
| C.Nav.5 | `frontend/App.tsx` | Replace manual tab switching with `NavigationContainer` wrapping `RootNavigator`. Remove inline screen components (HomeScreen, LessonCatalog, etc.) — they become tab screens inside MainTabNavigator. Keep SafeAreaProvider wrapping. |

### Navigation Param Types

```typescript
// frontend/src/types/navigation.ts

export type RootStackParamList = {
  Loading: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

export type OnboardingStackParamList = {
  AgeGate: undefined;
  AgePolicyBlock: undefined;
  Consent: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  IntroScreens: undefined;
  LevelSelection: undefined;
  ReminderSetup: undefined;
  PermissionPrompts: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Lessons: undefined;
  Downloads: undefined;
  Progress: undefined;
  Settings: undefined;
};
```

### States Table

| State | Behavior |
|-------|----------|
| Loading (boot) | Show AppLaunch screen with brand mark and spinner while resolving auth/consent/onboarding step |
| Unauthenticated, no consent | Show OnboardingStack from AgeGate |
| Unauthenticated, age gate done + consent given | Show OnboardingStack from SignIn |
| Authenticated, onboarding incomplete | Show OnboardingStack from the step indicated by `onboardingStep` |
| Authenticated, onboarding complete | Show MainTabs directly |
| Underage blocked | Show AgePolicyBlock (modal, no escape) |

### Acceptance Criteria

- Onboarding flow uses Stack navigator with push transitions
- After onboarding completion, app switches to MainTabs (Bottom Tab navigator)
- Bottom tab bar shows 5 tabs: Home, Lessons, Downloads, Progress, Settings
- Back button on all onboarding stack screens (except AgePolicyBlock which is blocking)
- Navigation state persists correctly across cold starts (via US-7.2 rehydration)
- Age gate and consent screens presented as full-screen blocking states (Depth 0)

---

## Cross-cutting: API Client Update (C.API)

### Design References
- **API Spec**: Section 2.2 (auth notes), X-Device-Id header
- **Backend TTB**: 1.13.3 (consent endpoints), 1.14 (profile endpoints)
- **Existing**: `frontend/src/api/client.ts` (GET only, no auth)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.API.1 | `frontend/src/services/api/client.ts` | Rewrite API client: add `apiGet<T>()`, `apiPut<T>()`, `apiPost<T>()` methods. Accept optional auth token, X-Device-Id, X-Request-Id headers. Parse `JsonEnvelope<T>` response and throw typed errors. Handle 401 by triggering sign-out. |
| C.API.2 | `frontend/src/services/api/authApi.ts` | Auth API methods: `signUp(email, password)`, `signIn(email, password)`, `signInWithGoogle()`, `signInWithApple()`, `forgotPassword(email)`, `resetPassword(code, newPassword)`. Wraps Cognito SDK calls (or API calls to backend auth proxy). |
| C.API.3 | `frontend/src/services/api/consentApi.ts` | Consent API methods: `getConsent(deviceId?, token?)`, `putConsent(consentData, deviceId?, token?)`. Handles pre-auth (X-Device-Id) and authenticated (Bearer JWT) variants. |
| C.API.4 | `frontend/src/services/api/profileApi.ts` | Profile API methods: `getProfile(token)`, `updateProfile(updates, token)`, `updateOnboardingStep(step, token)`. |
| C.API.5 | `frontend/src/types/api.ts` | TypeScript types for API: `ApiClientConfig`, `ApiError` with code/message/details, `JsonEnvelope<T>` matching backend envelope shape. |

### API Client Interface

```typescript
export type ApiClientConfig = {
  baseUrl: string;
  token?: string;
  deviceId?: string;
};

export async function apiGet<T>(
  path: string,
  config?: ApiClientConfig,
): Promise<T>;

export async function apiPut<T>(
  path: string,
  body: unknown,
  config?: ApiClientConfig,
): Promise<T>;

export async function apiPost<T>(
  path: string,
  body: unknown,
  config?: ApiClientConfig,
): Promise<T>;
```

### Acceptance Criteria

- Authenticated requests include `Authorization: Bearer <jwt>` header
- Pre-auth requests include `X-Device-Id` header
- All requests include `X-Request-Id` header
- 401 responses trigger auth store sign-out + navigation to SignIn
- Network errors surface as typed `ApiError` with code and message
- `apiPut` and `apiPost` send JSON body with `Content-Type: application/json`

---

## Cross-cutting: Zustand Stores (C.9)

### Design References
- **LLD Mobile**: Section 2 (State Management), Section 3.2 (Notification Store shape)
- **User Stories**: All (stores underpin every screen)
- **Existing**: `frontend/src/state/useAppStore.ts` (minimal — only activeTab)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.9.1 | `frontend/src/stores/authStore.ts` | `AuthStore`: `token` (string | null), `user` (UserProfile | null), `isLoading` (boolean), `error` (string | null). Actions: `signIn()`, `signUp()`, `signOut()`, `restoreSession()` (check SecureStore for cached token on boot), `clearError()`. Persist token to SecureStore. |
| C.9.2 | `frontend/src/stores/consentStore.ts` | `ConsentStore`: `ageVerified` (boolean), `privacyAccepted` (boolean), `adConsent` ('unknown' \| 'personalized' \| 'non_personalized'), `deviceId` (string), `isLoading`, `error`. Actions: `setAgeVerified()`, `acceptPrivacy()`, `declinePrivacy()`, `setAdConsent()`, `submitConsent()`, `restoreConsent()`. Auto-generate deviceId on first launch via `expo-crypto` randomUUID, persist in AsyncStorage. |
| C.9.2a | `frontend/src/services/device/deviceService.ts` | `getOrCreateDeviceId()`: Check AsyncStorage for stored deviceId. If missing, generate via `expo-crypto` randomUUID, persist in AsyncStorage, return it. Used by consentApi for pre-auth X-Device-Id header. |
| C.9.3 | `frontend/src/stores/notificationStore.ts` | `NotificationStore`: `reminderEnabled` (boolean), `reminderTime` (string — HH:MM), `permissionStatus` ('unknown' \| 'granted' \| 'denied' \| 'blocked'), `recoveryState` ('idle' \| 'denied' \| 'recovery_prompt' \| 'settings_redirect'), `scheduledNotificationId` (string | null), `isLoading`. Actions: `setReminderEnabled()`, `setReminderTime()`, `scheduleReminder()`, `cancelReminder()`, `checkPermission()`, `requestPermission()`. |
| C.9.4 | `frontend/src/stores/onboardingStore.ts` | `OnboardingStore`: `currentStep` (string — one of the step values), `hasCompletedIntro` (boolean), `selectedLevel` (string | null), `micPermissionGranted` (boolean), `isLoading`. Actions: `setStep()`, `completeIntro()`, `setLevel()`, `setMicPermission()`, `resetOnboarding()`. |
| C.9.5 | `frontend/src/stores/index.ts` | Re-export all stores for convenient imports. |

### Onboarding Step Values

| Value | Meaning | Resume Action |
|-------|---------|---------------|
| `null` (not set) | Not started | Start from age gate |
| `age_gate_done` | Age verified | Show consent screen |
| `consent_done` | Consent accepted | Show sign-in |
| `intro_done` | Intro screens completed | Show level selection |
| `level_selected` | Level chosen | Show reminder setup |
| `reminder_set` | Reminder configured | Show microphone permission |
| `mic_permission_done` | Mic handled | Show complete → Home |
| `complete` | Onboarding finished | Go directly to Home |

### Zustand Persistence Strategy

- **authStore**: Token in `expo-secure-store` (sensitive). Restore on app launch.
- **consentStore.deviceId**: Persisted in `@react-native-async-storage/async-storage`. Generated once via `expo-crypto` randomUUID.
- **consentStore** (ageVerified, privacyAccepted): Local only during flow. Submitted to backend via PUT /consent on accept.
- **onboardingStore**: Local in-memory only — backend source of truth (`GET /me` returns `onboardingStep`).
- **notificationStore**: Local state only — no backend persistence. Reminder schedule managed by OS.

### Acceptance Criteria

- All stores follow the same Zustand pattern as existing `useAppStore.ts`
- Token persisted securely via expo-secure-store
- Device ID generated once, persisted, survives app reinstalls (AsyncStorage)
- Consent store drives AdMob initialization mode (personalized vs non-personalized)
- Notification store state is restored from local persistence on cold start
- All stores have `isLoading` and `error` fields for UI binding

---

## Task 1.12 — Exit Path Screen (Safe Exit)

### Design References
- **UI Spec**: Section 5.2 (Exit Path)
- **Wireframe**: 5.2 (Exit Path)
- **User Stories**: US-1.2 (underage block), US-2.1 AC3 (consent decline)
- **IA Doc**: Exit Path screen in Recovery and Safe Exit

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.12.1 | `frontend/src/screens/onboarding/ExitPathScreen.tsx` | Full-screen exit path with: final message ("You are leaving ShadowSpeak"), self-service reassurance text, "Exit" primary button. No navigation to any other app screen. Used when: (1) underage user is blocked, (2) user declines consent, (3) user chooses to exit from Age Gate secondary action. |

### States Table

| State | Behavior |
|-------|----------|
| Default | Exit message shown, "Exit" button is the only action |
| Exit tapped | App exits (iOS: `exit(0)` not recommended — instead, present a dead-end state with no navigation forward). For MVP, this is a dead-end screen with no back action and no way to proceed into the app. |

### Edge Cases

- User backgrounds the app and returns → still on ExitPathScreen
- App is killed and restarted → boot sequence runs again, if age gate already done and consent declined, show ExitPathScreen again (no way forward until consent is accepted)

### Acceptance Criteria

- US-1.2 AC2: Underage block does not proceed to account creation
- US-1.2 AC3: No personal data stored for underage user
- US-2.1 AC3: Consent decline exits without creating account
- ExitPathScreen has no navigation path into the app

---

## Cross-cutting: App Launch / Boot Sequence (C.Boot)

### Design References
- **User Story**: US-7.2 (Onboarding Abandonment and Partial Progress)
- **LLD Mobile**: NFR-1 (cold start <=2.5s)
- **IA Doc**: App Launch screen
- **UI Spec**: Section 1.1 (App Launch), Wireframe 1.1

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.Boot.1 | `frontend/src/screens/onboarding/AppLaunchScreen.tsx` | Full-screen neutral loading state with centered brand mark, loading indicator, and "Checking your setup..." status text. Optional retry button if startup fails. Uses AppLaunch screen spec from UI Spec Section 1.1. |
| C.Boot.2 | `frontend/src/navigation/RootNavigator.tsx` | Boot sequence: (1) Read deviceId from AsyncStorage (generate if missing via expo-crypto), (2) Read stored consent from AsyncStorage (ageVerified, privacyAccepted), (3) Try to restore auth token from SecureStore, (4) If token exists, call `GET /me` to get `onboardingStep`, (5) If `onboardingStep === 'complete'` → MainTabs, (6) If `onboardingStep` has a value → resume from that step via OnboardingStack, (7) If no token → check consent state: if age+privacy done → OnboardingStack from SignIn, else → OnboardingStack from AgeGate. |
| C.Boot.3 | `frontend/src/stores/authStore.ts` | Implement `restoreSession()` action: read token from SecureStore, validate it is not expired (decode JWT, check exp), if valid set token+user, if expired clear and return null. |

### Boot Decision Flow

```
App Launch
  ├─ Read deviceId from AsyncStorage (generate if missing)
  ├─ Read token from SecureStore
  │    ├─ Token exists + valid → GET /me
  │    │    ├─ onboardingStep = 'complete' → MainTabs
  │    │    ├─ onboardingStep = 'mic_permission_done' → PermissionPrompts
  │    │    ├─ onboardingStep = 'reminder_set' → PermissionPrompts
  │    │    ├─ onboardingStep = 'level_selected' → ReminderSetup
  │    │    ├─ onboardingStep = 'intro_done' → LevelSelection
  │    │    ├─ onboardingStep = 'consent_done' → SignIn (with auto-fill)
  │    │    ├─ onboardingStep = 'age_gate_done' → Consent (should not happen with auth)
  │    │    └─ onboardingStep = null → AgeGate (should not happen with auth)
  │    └─ No token → check local consent
  │         ├─ ageVerified + privacyAccepted → SignIn
  │         ├─ ageVerified only → Consent
  │         └─ nothing → AgeGate
  └─ Boot failure → AppLaunch with retry button
```

### Acceptance Criteria

- Cold start shows AppLaunch screen for <2.5s (NFR-1 target)
- Authenticated user with complete onboarding goes directly to Home
- Authenticated user with incomplete onboarding resumes at correct step (US-7.2 AC2)
- Unauthenticated user with consent done goes to SignIn (US-7.2 AC1)
- New user starts at Age Gate
- Token expiry triggers sign-out + redirect to SignIn
- Network failure on boot shows retryable error, not blank screen

---

## Task 1.1 — Age Gate Screen

### Design References
- **User Stories**: US-1.1 (Age Eligibility Check), US-1.2 (Underage Block)
- **UI Spec**: Section 1.2 (Age Gate), Section 1.3 (Age Policy Block)
- **Wireframes**: 1.2 (Age Gate), 1.3 (Age Policy Block)
- **User Flow**: First-Time Onboarding Flow (age gate decision diamond)
- **IA Doc**: Age Gate screen in Entry, Compliance, and Onboarding

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.1.1 | `frontend/src/screens/onboarding/AgeGateScreen.tsx` | Full-screen age gate with: title ("Age Gate"), explanation text ("You must be 13 or older to use ShadowSpeak"), age confirmation control (picker or button-based — e.g. "I am 13 or older" / "I am under 13"), Continue button, Exit button. Back action in top bar. Uses theme colors and typography from UI Spec. |
| 1.1.2 | `frontend/src/screens/onboarding/AgePolicyBlockScreen.tsx` | Full-screen blocking state for underage users. Blocking title, explanation text ("ShadowSpeak is not available to users under 13"), Exit button. No navigation to any other screen. Safe exit only. No back button (blocking state, Depth 0). |
| 1.1.3 | `frontend/src/stores/consentStore.ts` | Add `setAgeVerified(isOfAge: boolean)` action. When `isOfAge = true`, set `ageVerified = true` and persist locally. When `isOfAge = false`, set `ageVerified = false` (or leave null) — handled by redirect to AgePolicyBlock. |

### States Table

| State | Screen | Behavior |
|-------|--------|----------|
| Default | AgeGateScreen | Age confirmation control visible, helper copy shown, Continue/Exit buttons enabled |
| Age confirmed (13+) | AgeGateScreen | On success, set `ageVerified = true` in consentStore, navigate to Consent screen |
| Underage (under 13) | AgePolicyBlockScreen | Navigate to AgePolicyBlock, show blocking message, Exit button only |
| Exit tapped | AgePolicyBlockScreen | Navigate to ExitPathScreen — safe exit |
| Exit tapped from AgeGate "Exit" button | ExitPathScreen | If user exits from Age Gate directly (secondary action), navigate to ExitPathScreen |

### Edge Cases

- Store-provided age signal: if `expo-ads` or platform provides an age signal, use it as shortcut. If signal indicates underage, skip directly to AgePolicyBlock. If signal indicates adult, skip AgeGate entirely and go to Consent. If no signal, show in-app AgeGate. (US-1.1 AC3)
- Back navigation: if user navigates back from Consent to AgeGate, the age selection should persist.
- Re-entry: if `ageVerified = true` already stored, skip AgeGate entirely on subsequent launches.

### Acceptance Criteria

- US-1.1 AC1: New learner presented with age gate before any sign-in screen
- US-1.1 AC2: Age-eligible learner proceeds to consent flow
- US-1.1 AC3: Store-provided age signal may shortcut but in-app check is final
- US-1.2 AC1: Underage selection shows clear ineligibility message
- US-1.2 AC2: Underage block does NOT proceed to account creation or main experience
- US-1.2 AC3: Underage block stores no personal data
- Age gate passed state is persisted so returning users skip this step

---

## Task 1.2 — Privacy and Ad Consent Screen

### Design References
- **User Story**: US-2.1 (Consent and Privacy Acknowledgment)
- **UI Spec**: Section 1.4 (Privacy and Ad Consent)
- **Wireframe**: 1.4 (Privacy and Ad Consent)
- **Backend API**: GET /consent, PUT /consent (pre-auth with X-Device-Id)
- **Backend TTB**: 1.13 (Consent Endpoints), 1.15 (Pre-auth Bootstrap)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.2.1 | `frontend/src/screens/onboarding/ConsentScreen.tsx` | Consent screen with: title ("Privacy and Ad Consent"), consent explanation block (summary of privacy policy + terms), required privacy acknowledgment checkbox/toggle, ad preference section (toggle for personalized ads), "Accept and Continue" primary button, "Decline and Exit" secondary button. Scrollable content for legal copy. |
| 1.2.2 | `frontend/src/services/api/consentApi.ts` | Wire `putConsent()` to backend PUT /consent with pre-auth X-Device-Id header. Send `{ ageVerified, privacyAccepted, adConsent }`. |
| 1.2.3 | `frontend/src/stores/consentStore.ts` | Add `submitConsent()` action: calls `putConsent()` with current consent state and deviceId, persists locally on success. Add `loadConsent()` for GET /consent on re-entry. |

### States Table

| State | Behavior |
|-------|----------|
| Default | Consent choices visible and editable. Privacy checkbox unchecked, ad consent set to "non_personalized" by default. |
| Privacy unchecked, Accept tapped | Inline validation error: "You must accept the privacy policy to continue." |
| Decline tapped | Navigate to ExitPathScreen. No account created. No personal data stored. (US-2.1 AC3) |
| Consenting loading | Disable buttons, show spinner on Accept button. |
| Consenting error | Show error message with retry option. |
| Success (consent persisted) | Navigate to SignIn screen. |
| Re-entry (consent already given) | Skip this screen entirely — go directly to SignIn. |

### Validation Rules

- Privacy acknowledgment checkbox must be checked before Accept is enabled (or show validation on tap)
- Ad consent defaults to `non_personalized` if user does not explicitly choose

### Edge Cases

- Network failure during `PUT /consent`: show retryable error, do not advance
- Re-entry after consent given: check `GET /consent` response or local cache, skip screen
- Consent decline: no account creation, no personal data stored (US-2.1 AC3)
- Backend returns 422 for missing X-Device-Id: show error, regenerate device ID

### Acceptance Criteria

- US-2.1 AC1: Privacy policy and terms shown before acceptance
- US-2.1 AC2: Accept records consent and proceeds to sign-in
- US-2.1 AC3: Decline exits onboarding without creating account
- US-2.1 AC4: Cannot skip consent step
- Consent state persisted to backend via PUT /consent with X-Device-Id
- Returning user who already gave consent skips this screen

---

## Task 1.3 — Social Sign-In Buttons (Google/Apple)

### Design References
- **User Story**: US-3.2 (Social Sign-In)
- **UI Spec**: Section 1.5 (Sign In) — social sign-in buttons
- **Wireframe**: 1.5 (Sign In)
- **LLD Mobile**: Technology Stack (Cognito for auth)
- **Backend TTB**: C.4 (Cognito User Pool with Google/Apple OIDC)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.3.1 | `frontend/src/services/auth/authService.ts` | `signInWithGoogle()`: Use `expo-auth-session` to initiate Google OAuth flow via Cognito hosted UI or direct provider. Exchange authorization code for Cognito tokens. Return JWT token set. Handle cancellation and error. |
| 1.3.2 | `frontend/src/services/auth/authService.ts` | `signInWithApple()`: Same pattern as Google but for Apple Sign-In. Use `expo-apple-authentication` if available, fall back to `expo-auth-session`. |
| 1.3.3 | `frontend/src/components/onboarding/SocialSignInButton.tsx` | Reusable social sign-in button component. Props: `provider: 'google' | 'apple'`, `onPress`, `isLoading`. Renders provider icon + "Sign in with Google" / "Sign in with Apple" label. Uses theme styling. |
| 1.3.4 | `frontend/src/stores/authStore.ts` | Add `socialSignIn(provider: 'google' | 'apple')` action: calls authService, on success stores token in SecureStore + sets user profile, on failure sets error. |

### States Table

| State | Behavior |
|-------|----------|
| Default | Social buttons visible and tappable on SignIn screen |
| Loading (Google) | Google button shows spinner, other controls remain active |
| Loading (Apple) | Apple button shows spinner, other controls remain active |
| Success | Token stored, user profile hydrated, navigate to IntroScreens (new user) or Home (returning user) |
| Auth cancelled by user | Return to SignIn screen, no error, no account created (US-3.2 AC3) |
| Auth failure | Show inline error message, buttons re-enabled |
| Returning social user | Social sign-in authenticates without needing email/password (US-3.3 AC5) |

### Edge Cases

- User cancels the OAuth flow at the provider page → remain on SignIn, no error
- Network loss during OAuth redirect → show retryable error
- Apple Sign-In requires configuration on Apple Developer portal — must be set up before this task
- Google Sign-In requires OAuth client ID for iOS and Android in Google Cloud Console
- If social sign-in fails due to configuration, fall back gracefully to email/password

### Acceptance Criteria

- US-3.2 AC1: Google/Apple buttons redirect to provider auth flow
- US-3.2 AC2: Successful social auth creates account (new) or authenticates (returning), proceeds to intro screens
- US-3.2 AC3: Failed/cancelled social auth returns to SignIn with no account created
- US-3.3 AC5: Returning social user can sign in with social button without email/password

---

## Task 1.4 — Email/Password Sign-Up With Validation

### Design References
- **User Story**: US-3.1 (Email/Password Sign-Up)
- **UI Spec**: Section 1.6 (Sign Up)
- **Wireframe**: 1.6 (Sign Up)
- **Backend TTB**: C.4 (Cognito User Pool)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.4.1 | `frontend/src/screens/onboarding/SignUpScreen.tsx` | Sign-up screen with: email input, password input (with show/hide toggle), confirm password input (with show/hide toggle), password strength indicator, Terms of Service + Privacy Policy link, "Create Account" primary button, "Already have account? Sign In" link. Real-time inline validation on each field. |
| 1.4.2 | `frontend/src/components/ui/PasswordStrengthIndicator.tsx` | Password strength bar with 3 levels: Weak (red), Medium (yellow/orange), Strong (green). Criteria: 8+ chars, mixed case, contains number. |
| 1.4.3 | `frontend/src/components/ui/FormTextInput.tsx` | Reusable text input component with: label, error state display, helper text, show/hide toggle for password fields. Uses theme colors and typography. 48pt minimum height. |
| 1.4.4 | `frontend/src/services/auth/authService.ts` | `signUp(email, password)`: Call Cognito `signUp` (via AWS Amplify or direct Cognito API). For MVP, pre-sign-up Lambda auto-confirms (no email verification needed). Return JWT token set. |
| 1.4.5 | `frontend/src/stores/authStore.ts` | Add `emailSignUp(email, password)` action: calls authService.signUp, stores token, sets user. Handle "User already exists" error with navigation hint to sign-in. |

### States Table

| State | Behavior |
|-------|----------|
| Default | Empty form, all fields editable, Create Account disabled until all fields valid |
| Email validation | Real-time: show error if format invalid (missing @, no domain, etc.) |
| Password validation | Strength indicator updates as user types |
| Password mismatch | Show "Passwords do not match" error below confirm field |
| Loading | All fields disabled, Create Account shows spinner |
| Error (user exists) | Show "An account with this email already exists. Sign in instead." with link to SignIn |
| Error (weak password) | Keep form visible, show "Password is too weak" error |
| Error (network) | Show retryable error toast/banner |
| Success | Token stored, navigate to IntroScreens (this is a new user) |

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Email | Valid email format (RFC 5322 simplified) | "Please enter a valid email address" |
| Password | Minimum 8 characters | "Password must be at least 8 characters" |
| Password | Contains uppercase letter | "Password must contain an uppercase letter" |
| Password | Contains lowercase letter | "Password must contain a lowercase letter" |
| Password | Contains a number | "Password must contain a number" |
| Confirm Password | Must match password exactly | "Passwords do not match" |

### Edge Cases

- User tries to sign up with already-registered email → show specific error with "Sign In" action (US-3.1 AC3)
- Network timeout during sign-up → show retryable error, preserve form state
- Keyboard avoidance: ensure form scrolls properly when keyboard is open
- Password manager autofill: test with iOS Keychain and Android Smart Lock

### Acceptance Criteria

- US-3.1 AC1: Valid email + strong password creates account successfully
- US-3.1 AC2: Successful sign-up authenticates user and redirects to intro screens
- US-3.1 AC3: Existing email shows error and prompts sign-in
- US-3.1 AC4: Invalid email or weak password shows inline validation, account not created
- Password strength indicator shows correct level for all password inputs
- Confirm password field validates match on every change

---

## Task 1.5 — Returning User Sign-In Screen

### Design References
- **User Story**: US-3.3 (Returning User Sign-In)
- **UI Spec**: Section 1.5 (Sign In)
- **Wireframe**: 1.5 (Sign In)
- **Backend TTB**: C.4 (Cognito User Pool)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.5.1 | `frontend/src/screens/onboarding/SignInScreen.tsx` | Sign-in screen with: email input (pre-filled if returning), password input (with show/hide), "Forgot Password?" link, social sign-in buttons (Google/Apple — from Task 1.3), "Sign In" primary button, "Create Account" link at bottom. |
| 1.5.2 | `frontend/src/services/auth/authService.ts` | `signIn(email, password)`: Call Cognito `initiateAuth` with `USER_PASSWORD_AUTH` flow. Return JWT token set (access token, refresh token, id token). |
| 1.5.3 | `frontend/src/stores/authStore.ts` | Add `emailSignIn(email, password)` action: calls authService.signIn, stores token in SecureStore, hydrates user profile from GET /me, checks onboardingStep to determine navigation target. |

### States Table

| State | Behavior |
|-------|----------|
| Default | Email field (pre-filled if email available from previous attempt), password field empty, Sign In disabled until fields populated |
| Loading | Both fields disabled, Sign In shows spinner, social buttons remain active |
| Error (wrong password) | "Incorrect email or password. Please try again." + "Forgot Password?" link emphasized (US-3.3 AC3) |
| Error (user not found) | "No account found with this email. Create one?" with link to SignUp |
| Error (network) | "Unable to connect. Check your internet connection and try again." |
| Success (onboarding incomplete) | Navigate to resume step based on onboardingStep from GET /me |
| Success (onboarding complete) | Navigate to Home (MainTabs) |

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Email | Must not be empty | "Please enter your email" |
| Email | Valid email format | "Please enter a valid email address" |
| Password | Must not be empty | "Please enter your password" |

### Edge Cases

- Returning user who previously signed up with social provider → social button sign-in works without email/password (US-3.3 AC5)
- Account locked after too many attempts → show account lock message with recovery instructions
- Session token still valid from last launch → skip sign-in entirely, go to Home
- User navigates from SignUp to SignIn (already has email filled from SignUp form)

### Acceptance Criteria

- US-3.3 AC1: Returning user sees sign-in screen (skips age gate and consent)
- US-3.3 AC2: Correct credentials → authenticated. If onboarding complete → taken to Home. If onboarding incomplete → taken to resume step (per US-7.2).
- US-3.3 AC3: Incorrect password → error message with "Forgot Password?" link
- US-3.3 AC4: "Forgot Password?" link navigates to password reset flow
- US-3.3 AC5: Returning social user can sign in with social button

---

## Task 1.6 — Forgot Password / Reset Flow

### Design References
- **User Story**: US-3.4 (Forgot Password / Password Reset)
- **UI Spec**: Not explicitly specified — inferred from Sign In screen "Forgot Password?" link
- **Backend TTB**: C.4 (Cognito User Pool — Cognito handles password reset via email)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.6.1 | `frontend/src/screens/onboarding/ForgotPasswordScreen.tsx` | Forgot password screen: email input, "Send Reset Link" primary button, "Back to Sign In" link. After sending: confirmation message with instructions to check email. |
| 1.6.2 | `frontend/src/services/auth/authService.ts` | `forgotPassword(email)`: Call Cognito `forgotPassword` API. Returns success if email is registered. |
| 1.6.3 | Add reset password confirmation to ForgotPasswordScreen | After user receives reset code via email, show code input + new password fields + confirm password. "Reset Password" button submits. On success, navigate to SignIn with success message. |
| 1.6.4 | `frontend/src/services/auth/authService.ts` | `confirmResetPassword(email, code, newPassword)`: Call Cognito `confirmForgotPassword` API. |
| 1.6.5 | `frontend/src/screens/onboarding/ForgotPasswordScreen.tsx` | Handle deep-link from reset email: when the app opens via the password reset URL, parse the verification code from the URL/link. Pre-fill the code input field. User enters new password + confirm. Submit reset. On success, navigate to SignIn with success banner. |

### States Table

| State | Behavior |
|-------|----------|
| Default (email step) | Email input visible, "Send Reset Link" button |
| Email sent | Confirmation message: "Check your email for the reset link." Link back to Sign In. |
| Loading (send) | Button shows spinner, email field disabled |
| Error (unregistered email) | "No account found with this email address" (US-3.4 AC3) |
| Error (network) | Retryable error |
| Default (reset step) | Code input, new password input, confirm password, strength indicator |
| Loading (reset) | Button shows spinner, all fields disabled |
| Success (reset) | "Password updated successfully. Please sign in." Navigate to SignIn |
| Error (expired code) | "This reset link has expired. Request a new one." (US-3.4 AC7) |
| Error (weak password) | Same validation as sign-up (US-3.4 AC6) |
| Deep-link from reset email | App opens with verification code pre-filled (parsed from URL/deep-link). User completes new password + confirm. Submits reset. |

### Validation Rules

Same password rules as Task 1.4:
- Minimum 8 characters, mixed case, contains number
- Confirm password must match

### Edge Cases

- User requests multiple reset emails → only last code is valid
- Reset code expires (Cognito default: 1 hour) → show expiration message
- User navigates back from reset screen → return to Sign In
- User closes app during reset flow → restart from Sign In

### Acceptance Criteria

- US-3.4 AC1: "Forgot Password?" from SignIn goes to password reset screen
- US-3.4 AC2: Registered email receives reset email
- US-3.4 AC3: Unregistered email shows error
- US-3.4 AC4: Reset link opens secure password reset page
- US-3.4 AC5: Valid new password updates and redirects to SignIn with success message
- US-3.4 AC6: Weak password shows validation error, not updated
- US-3.4 AC7: Expired reset link shows expiration message with prompt to request new one

---

## Task 1.7 — Intro Screens (Swipe-Through)

### Design References
- **User Story**: US-4.1 (App Introduction Screens)
- **UI Spec**: Inferred from onboarding flow (not explicitly detailed but referenced)
- **Wireframes**: Follow-on from Sign In / Sign Up in the flow
- **User Flow**: Intro screens appear after first-time authentication

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.7.1 | `frontend/src/screens/onboarding/IntroScreens.tsx` | Swipeable intro screen carousel. 3-4 screens explaining: (1) What is ShadowSpeak, (2) How shadowing works, (3) Audio-first practice concept, (4) Get started. Pagination dots indicator. "Next" button on each screen, "Get Started" on last screen. Uses `react-native` `FlatList` with `pagingEnabled` or `react-native-pager-view`. |
| 1.7.2 | `frontend/src/components/onboarding/IntroSlide.tsx` | Individual intro slide component: illustration/image placeholder, title (H1), description text (Body). Clean layout with minimal text density. |
| 1.7.3 | `frontend/src/stores/onboardingStore.ts` | Add `completeIntro()` action: sets `hasCompletedIntro = true`. When onboarding completes, this flag + `onboardingStep = 'intro_done'` ensures intro screens are never shown again. |

### States Table

| State | Behavior |
|-------|----------|
| Default | First intro slide visible, "Next" button active, pagination dot 1/3 or 1/4 highlighted |
| Middle slides | User swipes or taps Next to advance. "Next" button on each. |
| Last slide | "Get Started" button replaces "Next". Tap navigates to Level Selection. |
| Re-entry (already seen) | If `onboardingStep > 'intro_done'` or `hasCompletedIntro === true`, skip entirely (US-4.1 AC4) |

### Edge Cases

- User swipes back to previous slides → allowed, no data loss
- Accessibility: VoiceOver/TalkBack should announce slide content and current position
- Dynamic type: text should scale without breaking layout
- Rapid tapping on "Next" → debounce to prevent multiple navigation calls

### Acceptance Criteria

- US-4.1 AC1: First-time authenticated user sees introduction screen sequence
- US-4.1 AC2: Swipe or "Next" advances to next screen
- US-4.1 AC3: Last screen "Get Started" proceeds to profile setup (Level Selection)
- US-4.1 AC4: Completing intro screens once means they are never shown again (even after sign-out/sign-in)
- Pagination dots accurately reflect current position

---

## Task 1.8 — Level Selection Screen

### Design References
- **User Story**: US-5.1 (Practice Level Selection)
- **UI Spec**: Section 1.7 (Level Selection)
- **Wireframe**: 1.7 (Level Selection)
- **Backend API**: PUT /me (saves level to profile)
- **Backend TTB**: 1.14 (Profile Endpoints)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.8.1 | `frontend/src/screens/onboarding/LevelSelectionScreen.tsx` | Level selection screen with: guidance text ("What is your current English level?"), 3-4 level cards (Beginner, Intermediate, Advanced), "Continue" primary button. One level must be selected to continue. Each card shows level name and short description. |
| 1.8.2 | `frontend/src/components/onboarding/LevelCard.tsx` | Level card component: selected state (primary border/tint), unselected state (neutral border), level name (H3), description (Body Small). Tap to select. Large tap target (minimum 48pt height per card). |
| 1.8.3 | `frontend/src/stores/onboardingStore.ts` | Add `setLevel(level)` action. `PUT /me` with `{ level }` via profileApi on save. On success, set `onboardingStep = 'level_selected'` and navigate to ReminderSetup. |

### States Table

| State | Behavior |
|-------|----------|
| Default | Level cards displayed, none selected, Continue disabled |
| Level selected | Card shows selected state, Continue enabled |
| Continue without selection | Error: "Please select a level to continue" (US-5.1 AC3) |
| Loading (saving) | Continue button shows spinner, cards disabled |
| Error (save failed) | Show retryable error, keep selection |
| Success | Navigate to ReminderSetup |

### Validation Rules

- User must select exactly one level before Continue is enabled (or validate on tap)
- Level values: `beginner`, `intermediate`, `advanced`

### Edge Cases

- User taps Skip (if available) — level defaults to `beginner` (or the app shows a default recommendation)
- Backend save fails → retry, do not advance until confirmed
- User re-enters this screen (e.g., from Settings later) → pre-select their saved level

### Acceptance Criteria

- US-5.1 AC1: 3-4 clearly described level options presented
- US-5.1 AC2: Selected level saved to profile on Continue
- US-5.1 AC3: No selection shows prompt to choose before proceeding

---

## Task 1.9 — Reminder Setup and Notification Permission

### Design References
- **User Stories**: US-5.2 (Reminder Preference Setup), US-4.6 (local reminder notification)
- **UI Spec**: Section 1.8 (Reminder Setup)
- **Wireframe**: 1.8 (Reminder Setup)
- **LLD Mobile**: Section 3.2 (Local Reminder Notifications), Notification Store shape
- **User Flow**: Reminder Setup → Permission Prompts sequence

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.9.1 | `frontend/src/screens/onboarding/ReminderSetupScreen.tsx` | Reminder setup screen with: explanation text, toggle switch (Enable/Disable), time picker (enabled when toggle is on), "Continue" primary button, "Skip reminders" secondary button. |
| 1.9.2 | `frontend/src/services/notifications/notificationService.ts` | `scheduleReminder(time: string)`: Use `expo-notifications` to schedule daily local notification at the specified time. Cancel existing schedule first. `cancelReminder()`: Cancel all scheduled notifications. `checkPermission()`: Check current notification permission status. `requestPermission()`: Request notification permission from OS. |
| 1.9.3 | `frontend/src/stores/notificationStore.ts` | Add `enableReminder(time)`, `disableReminder()`, `skipReminder()` actions. On enable: request permission, schedule notification, persist preference to local store. On disable: cancel schedule. On skip: move to next step without scheduling. |
| 1.9.4 | `frontend/src/services/api/profileApi.ts` | Wire `updateProfile({ reminderEnabled, reminderTime })` to `PUT /me`. |

### States Table

| State | Behavior |
|-------|----------|
| Default (off) | Toggle off, time picker hidden/disabled, Continue enabled |
| Toggle on | Time picker appears, default time 08:00 (or configurable default) |
| Permission prompt | OS dialog appears when toggle is first enabled |
| Permission granted | Reminder scheduled, Continue navigates to PermissionPrompts |
| Permission denied | Inline note: "Reminders need notification permission. You can enable this later in Settings." Toggle stays on, no schedule created, Continue advances |
| Loading (saving) | Spinner on Continue |
| Error | Show toast/banner with retry |
| Skip tapped | Navigate to PermissionPrompts without scheduling |

### Validation Rules

- Time must be valid HH:MM format (24h)
- Default to 08:00 if time not explicitly set

### Edge Cases

- Permission denied at OS level → show recovery path, never prompt again (user must go to Settings)
- Time zone change → notification service should revalidate on app foreground
- Duplicate reminder scheduling → cancel existing before creating new (idempotent)
- User skips reminder → `reminderEnabled = false`, no notification scheduled
- App reinstalled → no stored preferences, default to off

### Acceptance Criteria

- US-5.2 AC1: Time picker offered for daily reminder time
- US-5.2 AC2: Time selected + enabled → reminder scheduled and saved to profile
- US-5.2 AC3: Skip tapped → no reminder, proceeds to next step
- US-5.2 AC4: Scheduled time triggers local push notification
- Notification permission denial does not block onboarding progression
- Reminder preference persisted locally and saved to backend profile via PUT /me

---

## Task 1.10 — Microphone Permission Screen

### Design References
- **User Stories**: US-6.1 (Microphone Permission Request), US-6.2 (Graceful Handling)
- **UI Spec**: Section 1.9 (Permission Prompts)
- **Wireframe**: 1.9 (Permission Prompts)
- **LLD Mobile**: Section 3.2 (Permission recovery states)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.10.1 | `frontend/src/screens/onboarding/PermissionPromptsScreen.tsx` | Permission prompt screen with two permission cards stacked: (1) Notification card — shows current status (granted badge / denied note), (2) Microphone card — shows rationale and status. "Continue" primary button. "Open Settings" secondary button (visible when any permission is denied). |
| 1.10.2 | `frontend/src/components/onboarding/PermissionCard.tsx` | Permission card component: permission icon, title, description, status badge (granted/denied), action button ("Allow" / "Open Settings"). |
| 1.10.3 | `frontend/src/services/notifications/notificationService.ts` | Add `requestMicrophonePermission()`: Uses `expo-av` or `expo-permissions` to request `MICROPHONE` permission. Returns status. |
| 1.10.4 | `frontend/src/stores/notificationStore.ts` | Add `requestMicPermission()` action: calls service, stores result. When granted, mark step complete. When denied, allow continue with mic unavailable. |
| 1.10.5 | Update `frontend/src/navigation/OnboardingNavigator.tsx` | On finish of PermissionPrompts: call `PUT /me/onboarding-step` with `complete`, then `PUT /me` with all profile fields (level, reminderTime, reminderEnabled), then navigate to MainTabs. |

### States Table

| State | Behavior |
|-------|----------|
| Default | Both permission cards visible. Notification shows current status (previously determined in ReminderSetup). Microphone shows "not requested" or "not determined". |
| Mic "Allow" tapped | OS microphone permission dialog appears |
| Mic granted | Card shows "Granted" badge. Permission status recorded (US-6.1 AC3) |
| Mic denied | Card shows "Denied" with explanation: "You can enable microphone access in Settings to record your shadowing." Continue is still enabled. "Open Settings" button appears. (US-6.2 AC1) |
| Both permissions resolved | "Continue" navigates to Home (MainTabs) |
| "Open Settings" tapped | Opens system Settings for ShadowSpeak (US-6.2 AC3) |

### Cross-Epic Note (US-6.2 AC2, AC4)

The practice-time handling of microphone permission denial is out of scope for Epic 01. Specifically:
- **US-6.2 AC2**: Showing permission explanation + settings button when user tries to start a practice session → **Epic 02 (Practice Session)**
- **US-6.2 AC4**: Blocking recording when mic permission is not granted → **Epic 02 (Practice Session)**

Epic 01 delivers: (1) the microphone permission request UI, (2) persistence of the permission status in `onboardingStore.micPermissionGranted`, (3) the "Open Settings" button component. Epic 02 reads the stored permission status to enforce recording rules.

### Edge Cases

- Both notifications and microphone denied → continue anyway, app works in listening-only mode (US-6.2 AC1)
- Microphone already granted from previous app use → show as granted, no prompt needed
- Microphone permission later revoked via Settings → handle gracefully at practice time (US-6.2 AC2, AC4)
- "Don't ask again" on iOS → show Settings redirect, never prompt again
- Permission prompts accumulate → request one at a time (notification first from ReminderSetup, microphone here)

### Acceptance Criteria

- US-6.1 AC1: Clear explanation of why microphone access is needed for shadowing
- US-6.1 AC2: "Allow" triggers OS permission dialog
- US-6.1 AC3: Granting permission records status and proceeds to Home
- US-6.2 AC1: Denied permission → proceeds to Home without recording capability
- US-6.2 AC2: Later practice attempt shows explanation + settings button
- US-6.2 AC3: Settings button opens system Settings
- US-6.2 AC4: Recording blocked without microphone permission
- Onboarding completion calls PUT /me/onboarding-step with `complete`
- Onboarding completion calls PUT /me with all profile fields

---

## Task 1.11 — Deep-Link Handler for Notification Taps

### Design References
- **User Story**: US-4.5 (Notification tap deep-link)
- **LLD Mobile**: Section 3.2 (Deeplink routing — preserve navigation intent even on cold start)
- **Wireframe**: 3.3 (Local Reminder Notification)
- **IA Doc**: Deep link navigation from reminder notifications into Home / Daily Practice

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.11.1 | `frontend/src/services/notifications/notificationService.ts` | `registerNotificationHandler()`: Register `expo-notifications` foreground handler (show notification silently) and background/click handler. On notification tap, extract notification data (`lessonId`, `screen`). |
| 1.11.2 | `frontend/src/services/notifications/notificationService.ts` | `getInitialNotification()`: On cold start, check if app was opened from a notification tap. Extract navigation intent. |
| 1.11.3 | `frontend/src/navigation/RootNavigator.tsx` | Wire deep-link handling: after boot sequence resolves, if initial notification contains a `screen` target, navigate to that screen (e.g., Home, or a specific lesson). Fall back to normal boot flow if no notification. |
| 1.11.4 | `frontend/src/navigation/deepLinks.ts` | Deep link configuration: define linking config for `@react-navigation/native` `linking` prop. Map notification tap data to navigation state. Include password reset deep-link handling: parse `/reset-password?code=...&email=...` and navigate to ForgotPasswordScreen with code+email pre-filled. |

### Notification Data Shape

```typescript
// Data attached to scheduled reminder notification
type ReminderNotificationData = {
  type: 'daily_reminder';
  screen: 'Home';
};
```

### States Table

| State | Behavior |
|-------|----------|
| Cold start from notification | Boot sequence runs, then navigates to Home (or specified screen). Notification data processed after auth/onboarding check. |
| Warm start (app in background) from notification | Navigate to Home (or specified screen) without re-running boot sequence |
| App in foreground when notification delivered | Show in-app banner (optional), no navigation |
| Notification dismissed | No navigation, no state change |
| No notification | Normal boot flow |

### Edge Cases

- User taps notification but is mid-onboarding → complete onboarding first, then navigate to Home
- User taps notification but is not signed in → navigate to SignIn
- Notification tapped on lock screen → app must handle authentication (biometric/passcode)
- Multiple notifications queued → only the last tapped notification triggers navigation
- Notification data is malformed → fall back to Home, do not crash

### Acceptance Criteria

- US-4.5: Notification tap routes to Home / Daily Practice
- Cold start from notification preserves navigation intent (LLD Mobile 3.2)
- Warm start from notification navigates correctly
- Malformed notification data does not crash the app
- Notification tap during onboarding does not interrupt the flow

---

## Task C.5 — AdMob SDK Initialization and Consent-Aware Request

### Design References
- **LLD Mobile**: Section 6 (Ad Integration Design), Section 6.1 (Initialization Sequence)
- **User Story**: US-2.1 (ad consent choice)
- **Consent Store**: Stores `adConsent` value (personalized / non_personalized / unknown)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.5.1 | `frontend/src/services/ads/AdMobService.ts` | `initializeAdMob()`: Initialize react-native-google-mobile-ads SDK. Read `adConsent` from consentStore. If `personalized`, initialize with `CONSENT_PERSONALIZED`. If `non_personalized` or `unknown`, use `CONSENT_NON_PERSONALIZED`. Must be non-blocking — catch and log errors without throwing. |
| C.5.2 | `frontend/src/services/ads/AdMobService.ts` | `preloadInterstitial()`: Preload an interstitial ad unit. Called after initialization. Non-blocking — catches failures silently. |
| C.5.3 | `frontend/src/stores/consentStore.ts` | Wire consent changes: when `adConsent` changes, call `AdMobService.initializeAdMob()` with new consent mode. |
| C.5.4 | `frontend/src/navigation/RootNavigator.tsx` | Trigger AdMob initialization in boot sequence: after consent state is resolved (either age gate passed + consent given, or restored from storage), call `AdMobService.initializeAdMob()` asynchronously and non-blocking. |

### Initialization Sequence

```
Boot sequence resolves consent state
  ├─ consent state available
  │    ├─ adConsent === 'personalized' → init AdMob with personalized
  │    ├─ adConsent === 'non_personalized' → init AdMob with non-personalized
  │    └─ adConsent === 'unknown' → init AdMob with non-personalized (safe default)
  ├─ init success → preload interstitial
  └─ init failure → log error, continue without ads
```

### States Table

| State | Behavior |
|-------|----------|
| Consent not yet resolved | AdMob not initialized. Defer until consent screen is completed or restored. |
| Consent resolved, initializing | Async init in background. No UI impact. |
| Initialized successfully | Ads ready for future session boundaries. |
| Initialization failed | Log error, continue without ads. Do not retry on every screen change — retry on next app launch. |
| Consent changes after initialization | Re-initialize AdMob with new consent mode if the SDK supports it; otherwise queue for next app launch. |

### Edge Cases

- User declines consent → `adConsent` stays `non_personalized`, AdMob initialized with non-personalized
- User has not yet reached consent screen → AdMob not initialized yet
- AdMob SDK fails to load → non-blocking, app continues normally
- User withdraws ad consent in Settings later → update AdMob consent mode
- AdMob initialization is slow → do not block the onboarding flow or navigation
- Device is offline → AdMob init fails silently, retry on next app launch

### Acceptance Criteria

- AdMob initialized after consent is resolved
- Consent mode (personalized vs non-personalized) matches user's ad consent choice
- AdMob initialization does NOT block onboarding flow at any point
- If AdMob fails, the app continues normally without ads
- Consent-aware initialization works for both pre-auth (device-based) and authenticated consent

---

## Cross-cutting: Reusable UI Components

### Design References
- **UI Spec**: Component Library (Button System, Inputs and Controls)
- **Existing**: `frontend/App.tsx` has inline PrimaryButton component

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| UI.1 | `frontend/src/components/ui/PrimaryButton.tsx` | Primary button: filled background (`color-primary`), white text, pressed state (`color-primary-pressed`), disabled state (muted), loading state (spinner), 52pt min height, borderRadius 12. Props: `label`, `onPress`, `disabled`, `isLoading`. |
| UI.2 | `frontend/src/components/ui/SecondaryButton.tsx` | Secondary button: neutral border, primary text, pressed state (light fill). Props: same as PrimaryButton. |
| UI.3 | `frontend/src/components/ui/TertiaryButton.tsx` | Tertiary button: text-only, primary color, underlined or tinted on press. Props: same as PrimaryButton. |
| UI.4 | `frontend/src/components/ui/FormTextInput.tsx` | Text input: 16px body text, 48pt min height, label above, error state (border + error text in `color-error`), helper text below, show/hide toggle for password type. Props: `label`, `value`, `onChangeText`, `error`, `helperText`, `secureTextEntry`, `isPassword`. |
| UI.5 | `frontend/src/components/ui/Toggle.tsx` | Toggle switch: uses platform-native Switch component. Props: `value`, `onValueChange`, `disabled`, `label`. |
| UI.6 | `frontend/src/components/ui/LoadingOverlay.tsx` | Full-screen loading overlay with centered spinner and optional message. Used for full-screen loading states during auth operations. |
| UI.7 | `frontend/src/components/ui/ErrorBanner.tsx` | Inline error banner: red/orange background, error icon, message text, optional dismiss button. Props: `message`, `onDismiss`, `type` (error | warning). |

### Acceptance Criteria

- All components accept `accessibilityLabel` and `accessibilityRole` props
- Minimum 44pt touch targets on all interactive elements (48pt for audio controls where applicable)
- Components render correctly on both iOS and Android
- Loading state shows spinner and disables interaction
- Error state shows clear error text in `color-error`

---

## Testing Tasks

### Design Reference
- **LLD Mobile**: Section 8 (NFR coverage — crash rate, accessibility)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| T.1 | `tests/stores/authStore.test.ts` | Unit tests: sign-in, sign-up, sign-out, restoreSession, token expiry, error states. |
| T.2 | `tests/stores/consentStore.test.ts` | Unit tests: setAgeVerified, acceptPrivacy, declinePrivacy, submitConsent, restoreConsent, deviceId generation. |
| T.3 | `tests/stores/notificationStore.test.ts` | Unit tests: enableReminder, disableReminder, permission states, schedule/cancel. |
| T.4 | `tests/stores/onboardingStore.test.ts` | Unit tests: setStep, completeIntro, setLevel, setMicPermission, step values. |
| T.5 | `tests/screens/AgeGateScreen.test.tsx` | Component test: age confirmation, underage block, exit flow, re-entry skip. |
| T.6 | `tests/screens/ConsentScreen.test.tsx` | Component test: accept flow, decline flow, validation, error handling. |
| T.7 | `tests/screens/SignInScreen.test.tsx` | Component test: email/password sign-in, social sign-in buttons, forgot password link, error states. |
| T.8 | `tests/screens/SignUpScreen.test.tsx` | Component test: form validation, password strength, existing email error, success flow. |
| T.9 | `tests/screens/LevelSelectionScreen.test.tsx` | Component test: level selection, validation, save to profile. |
| T.10 | `tests/screens/ReminderSetupScreen.test.tsx` | Component test: toggle, time picker, skip, permission request. |
| T.11 | `tests/screens/PermissionPromptsScreen.test.tsx` | Component test: permission cards, granted/denied states, settings redirect. |
| T.12 | `tests/screens/ForgotPasswordScreen.test.tsx` | Component test: send reset link, reset password, expiration handling. |
| T.13 | `tests/navigation/RootNavigator.test.tsx` | Integration test: boot sequence routing for all auth/onboarding state combinations. |
| T.13a | `tests/screens/AppLaunchScreen.test.tsx` | Component test: loading state, error state with retry, success transition. |
| T.13b | `tests/screens/ExitPathScreen.test.tsx` | Component test: exit message rendered, no navigation into app, safe exit. |
| T.14 | `tests/services/api/client.test.ts` | Unit tests: apiGet, apiPut, apiPost, auth headers, deviceId headers, error handling, 401 handling. |
| T.15 | `tests/services/auth/authService.test.ts` | Unit tests (mocked): signIn, signUp, forgotPassword, social sign-in flows. |
| T.16 | `tests/services/notifications/notificationService.test.ts` | Unit tests (mocked): scheduleReminder, cancelReminder, permission request, deep-link handling. |
| T.17 | `tests/services/ads/AdMobService.test.ts` | Unit tests (mocked): initialization with consent modes, failure handling, non-blocking behavior. |

### Mock Strategy

- Mock `expo-secure-store` for auth token persistence tests
- Mock `@react-native-async-storage/async-storage` for device ID and consent persistence tests
- Mock `expo-notifications` for notification scheduling and permission tests
- Mock `react-native-google-mobile-ads` for AdMob tests
- Mock `expo-auth-session` for social sign-in tests
- Use `@testing-library/react-native` for component tests
- Use `jest.fn()` for navigation mocks

---

## Task Dependency Graph

```
C.Nav (Navigation Architecture)
├── C.API (API Client Update) ◄── all API tasks
├── C.9 (Zustand Stores)
│    ├── C.9.2a (Device Service) ── ConsentStore
│    ├── ConsentStore ──── 1.2 (ConsentScreen) ──── C.5 (AdMob)
│    ├── AuthStore ──────── 1.3 (SocialSignIn) ───┐
│    │                     ├── 1.4 (SignUp) ──────┤
│    │                     ├── 1.5 (SignIn) ──────┤
│    │                     └── 1.6 (ForgotPwd) ───┘
│    ├── OnboardingStore ── 1.7 (Intro) ── 1.8 (Level) ── 1.9 (Reminder) ── 1.10 (Permission)
│    └── NotificationStore ── 1.9 (Reminder) ── 1.11 (DeepLink)
├── UI.1-UI.7 (Shared Components) ◄── all screen tasks
├── C.Boot (Boot Sequence) ◄── all stores + C.9.2a
├── C.5 (AdMob) ◄── ConsentStore
└── T.1-T.17 (Testing) ◄── all implementation tasks
```

### Suggested Build Order

| Phase | Tasks | Result |
|-------|-------|--------|
| 1 | C.Nav (1-5) + install deps | Navigation shell working with placeholder screens |
| 2 | C.API (1-5) + UI.1-UI.7 | API client ready + UI kit ready |
| 3 | C.9 (1-5) + C.Boot (1-3) | All Zustand stores + boot sequence |
| 4 | 1.1 (AgeGate + AgePolicyBlock) | Age gate flow complete |
| 5 | 1.2 (ConsentScreen) + C.5 (AdMob) | Consent flow + ad initialization |
| 6 | 1.3 (SocialSignIn) + 1.4 (SignUp) + 1.5 (SignIn) + 1.6 (ForgotPwd) | Full auth flow |
| 7 | 1.7 (Intro) + 1.8 (LevelSelection) | Intro + profile setup |
| 8 | 1.9 (ReminderSetup) + 1.10 (Permission) + 1.11 (DeepLink) | Remaining onboarding + deep links |
| 9 | T.1-T.17 (All tests) | Full test coverage |

---

## User Story-to-Task Traceability Matrix

| User Story | Primary Task(s) | Supporting Tasks | Key Acceptance Criteria Covered |
|------------|----------------|------------------|-------------------------------|
| US-1.1 | 1.1 | C.9.2 (consentStore), C.Boot | Age gate presented first, age-eligible proceeds, store signal shortcut |
| US-1.2 | 1.1, 1.12 | — | Underage block message, no account creation, no personal data stored, safe exit path |
| US-2.1 | 1.2 | C.9.2, C.API.3, C.5, 1.12 | Privacy/terms shown, Accept proceeds, Decline navigates to ExitPath, cannot skip |
| US-3.1 | 1.4 | C.9.1, C.API.2, UI.4, UI.5 | Valid email+password creates account, invalid shows errors, existing email shown |
| US-3.2 | 1.3 | C.9.1, C.API.2 | Google/Apple redirect, success creates/authenticates, failure returns to sign-in |
| US-3.3 | 1.5 | C.9.1, C.API.2 | Returning skips age+consent, correct creds go to Home, wrong password shows error |
| US-3.4 | 1.6 | C.9.1, C.API.2 | Forgot password link, reset email sent, unregistered email error, weak password rejected |
| US-4.1 | 1.7 | C.9.4 | Intro screens shown after first auth, swipe/Next advances, Get Started proceeds, never shown again |
| US-5.1 | 1.8 | C.9.4, C.API.4 | 3-4 level options, selection saved, no-selection validation |
| US-5.2 | 1.9 | C.9.3, C.API.4, notificationService | Time picker, toggle, skip, reminder scheduled, notification delivered |
| US-6.1 | 1.10 | C.9.4, notificationService | Mic explanation, OS dialog, granted proceeds to Home |
| US-6.2 | 1.10 | C.9.4, notificationService | Denied proceeds to Home, blocked recording later, settings redirect |
| US-7.1 | C.Nav, C.Boot | All tasks | Full onboarding completes to Home, preferences persisted |
| US-7.2 | C.Boot | C.9.1, C.9.4, C.API.4 | Age+consent done → resume at sign-in, signed in → resume at step, complete → Home |

---

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-05-16 | Solo Dev | Initial technical task breakdown for Epic 01 frontend |
| 1.1 | 2026-05-16 | Solo Dev | Audit fix: add ExitPathScreen (1.12), AppLaunchScreen task, deviceId service (C.9.2a), US-6.2 cross-epic note, US-3.4 deep-link handling, US-3.3 AC2 routing precision, update traceability matrix and dependency graph |
