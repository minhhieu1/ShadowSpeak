# Epic 01 — Technical Task Breakdown: Onboarding (Frontend)

## Document Metadata

| Field     | Value                                      |
| --------- | ------------------------------------------ |
| Project   | ShadowSpeak                                |
| Epic      | 01 — First-Time Onboarding and Access      |
| Type      | Technical Task Breakdown (Frontend)        |
| Phase     | 05 - Development                           |
| Date      | 2026-06-07                                 |
| Status    | Draft                                      |
| Owner     | Solo Dev                                   |

## Purpose

Detailed breakdown of each frontend task in Epic 01 linking user stories, UI design specs, LLD components, and API endpoints to implementation files. Each task specifies exactly what to build, where to put it, what TypeScript interfaces and Zustand stores to create, what states to cover, and what to test.

## Prerequisites — Required npm Packages

The following packages must be installed before implementing these tasks (add to `frontend/package.json` via `npx expo install`):

| Package | Used By | Purpose |
|---------|---------|---------|
| `uuid` + `@types/uuid` | 1.1 | Device ID generation (crypto.randomUUID unavailable in React Native) |
| `expo-auth-session` | 1.3 | OAuth social sign-in (Google/Apple) |
| `expo-web-browser` | 1.3 | OAuth redirect handling |
| `expo-notifications` | 1.9, 1.11 | Local notification scheduling and handling |
| `react-native-pager-view` | 1.7 | Swipeable intro carousel |
| `@react-native-community/datetimepicker` | 1.1, 1.9 | Native date/time picker |
| `react-native-google-mobile-ads` | C.5 | AdMob SDK integration |
| `expo-sqlite` | C.8 | Local SQLite database |
| `aws-amplify` or `amazon-cognito-identity-js` | 1.4, 1.5, 1.6 | Cognito authentication |
| `@testing-library/react-native` | T.12–T.16 | Component testing |
| `jest` + `@types/jest` | All tests | Test runner |

## Existing Frontend Structure

All frontend code lives under `frontend/` with the following layout:

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios instance, JsonEnvelope<T>, interceptors, token refresh
│   │   └── http.ts            # AuthManager singleton, apiGet/apiPut/apiPost/apiPatch/apiDelete helpers
│   ├── auth/
│   │   ├── authBootstrap.ts   # BootstrapResult, authBootstrap() — OIDC config cache/fetch
│   │   ├── oidcConfigManager.ts
│   │   ├── oidcConfigService.ts
│   │   ├── oidcConfigStorage.ts
│   │   ├── oidcConfigTypes.ts
│   │   └── oidcConfigValidator.ts
│   ├── state/
│   │   └── useAppStore.ts     # AppState: activeTab + setter (Zustand)
│   ├── storage/
│   │   └── tokenStorage.ts    # saveToken, getToken, clearToken, saveRefreshToken, etc.
│   ├── types/
│   │   └── assets.d.ts
│   ├── theme.ts               # colors, spacing, radii, typography tokens
│   ├── data/
│   │   └── demoData.ts
│   └── assets.ts
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

New code follows the same conventions: **types → stores → services → components → app/routes**.

---

## 1.1 — Age Gate Screen (Date Picker + Underage Block)

### Design References
- **UI Spec**: Section 1.2 (Age Gate) — screens 1.2 and 1.3
- **User Stories**: US-1.1 (Age Eligibility Check), US-1.2 (Underage Block)
- **LLD Mobile**: Section 2 — Zustand state management; Section 5 — error states
- **API Spec**: Section 5.3, 5.4 — `GET /consent`, `PUT /consent` (pre-auth with `X-Device-Id`)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.1.1 | `frontend/src/types/onboarding.ts` | Define `AgeGateState`, `OnboardingStep`, `ConsentState` types. |
| 1.1.2 | `frontend/src/stores/consentStore.ts` | Zustand store for consent/age-gate state: `ageVerified`, `privacyAccepted`, `adConsent`, `deviceId`, actions. |
| 1.1.3 | `frontend/src/stores/onboardingStore.ts` | Zustand store for onboarding progress: `currentStep`, `isComplete`, resume logic. |
| 1.1.4 | `frontend/src/services/deviceIdService.ts` | Generate/retrieve persistent anonymous `deviceId` (UUIDv4 stored in AsyncStorage). Return `X-Device-Id` header value. |
| 1.1.5 | `frontend/src/services/consentService.ts` | API service: `getConsent(deviceId)`, `saveConsent(deviceId, input)`. Uses `apiGet`, `apiPut` with `X-Device-Id` header. |
| 1.1.6 | `frontend/src/components/ui/DatePickerInput.tsx` | Reusable date-picker input component: label, native platform picker, inline error. Props interface with `label`, `value`, `onChange`, `error`, `minDate`, `maxDate`. |
| 1.1.7 | `frontend/src/components/ui/Button.tsx` | Reusable button component: primary, secondary, tertiary variants; loading spinner; disabled state. |
| 1.1.8 | `frontend/src/components/onboarding/AgeGateScreen.tsx` | Age Gate screen: date-of-birth input, helper copy, Continue + Exit buttons. States: default, validation error (under 13), success. |
| 1.1.9 | `frontend/src/components/onboarding/AgePolicyBlockScreen.tsx` | Full-screen underage block: explanation text, Exit button. No navigation into core app. |
| 1.1.10 | `frontend/src/app/(onboarding)/age-gate.tsx` | Expo Router page wrapping `AgeGateScreen`. Handles navigation to consent or policy block. |
| 1.1.11 | `frontend/src/app/(onboarding)/age-policy-block.tsx` | Expo Router page wrapping `AgePolicyBlockScreen`. |

### TypeScript Interfaces

```typescript
// frontend/src/types/onboarding.ts

export type OnboardingStep =
  | null                  // Not started
  | 'age_gate_done'
  | 'consent_done'
  | 'intro_done'
  | 'level_selected'
  | 'reminder_set'
  | 'mic_permission_done'
  | 'complete';

export interface AgeGateState {
  dateOfBirth: string | null;     // ISO date string
  ageVerified: boolean;
  isUnderage: boolean;
}

export interface ConsentState {
  ageVerified: boolean;
  privacyAccepted: boolean;
  adConsent: 'unknown' | 'personalized' | 'non_personalized';
  consentUpdatedAt: string | null;
}

export interface UpdateConsentInput {
  ageVerified: boolean;
  privacyAccepted: boolean;
  adConsent: 'unknown' | 'personalized' | 'non_personalized';
}
```

### Zustand Store Shape

```typescript
// frontend/src/stores/consentStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ConsentState, UpdateConsentInput } from '../types/onboarding';

interface ConsentStore extends ConsentState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;

  loadConsent: (deviceId: string) => Promise<void>;
  saveConsent: (deviceId: string, input: UpdateConsentInput) => Promise<void>;
  setAgeVerified: (verified: boolean) => void;
  reset: () => void;
}
```

```typescript
// frontend/src/stores/onboardingStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingStep } from '../types/onboarding';

interface OnboardingStore {
  currentStep: OnboardingStep;
  isComplete: boolean;

  setStep: (step: OnboardingStep) => void;
  completeOnboarding: () => void;
  getResumeStep: () => OnboardingStep;
  reset: () => void;
}
```

### Device ID Service

```typescript
// frontend/src/services/deviceIdService.ts

import { v4 as uuidv4 } from 'uuid';

export async function getOrCreateDeviceId(): Promise<string> {
  const DEVICE_ID_KEY = '@shadowspeak/device_id';
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4();            // crypto.randomUUID() not available in React Native (JSC engine)
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}
```

> **Package dependency:** Add `uuid` and `@types/uuid` to `package.json`. Install via `npx expo install uuid @types/uuid`.

### Validation Rules

- Date of birth must be a valid real date (no future dates, no dates before 1900)
- Age threshold: 13 years old (user must be 13 or older)
- Show inline validation error: "You must be at least 13 years old to use ShadowSpeak" when underage
- Show "Please enter a valid date of birth" when input is incomplete or invalid
- Continue button disabled until a valid date is entered

### Acceptance Criteria

- Given a first-time user, when the app launches and no age gate has been completed, then the Age Gate screen is shown before any sign-in or consent screen
- Given a user on the Age Gate screen, when they select a date indicating they are 13 or older, then age verification is set to true and they proceed to the Consent screen
- Given a user on the Age Gate screen, when they select a date indicating they are under 13, then the Age Policy Block screen is shown with a clear ineligibility message and an Exit button
- Given a user is underage, when the block screen is shown, then no account is created and no personal data is stored beyond the device-local age-gate decision
- Given network failure, when the user taps Continue, then an inline error message is shown and the user can retry
- Given the user exits the age gate, when they reopen the app, then they are returned to the age gate screen (no progress persisted pre-consent)
- Given the user has already passed the age gate, when they reopen the app, then they skip directly to the next incomplete step per US-7.2 resume logic

---

## 1.2 — Privacy & Ad Consent Screen

### Design References
- **UI Spec**: Section 1.4 (Privacy and Ad Consent) — screen 1.4
- **User Stories**: US-2.1 (Consent and Privacy Acknowledgment)
- **API Spec**: Section 5.3, 5.4 — `GET /consent`, `PUT /consent`
- **LLD Backend**: ConsentState model, UpdateConsentInput

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.2.1 | `frontend/src/components/onboarding/ConsentScreen.tsx` | Consent screen: consent explanation, privacy toggle/checkbox, ad preference selector (personalized/non-personalized), Accept + Decline buttons. |
| 1.2.2 | `frontend/src/components/ui/Checkbox.tsx` | Reusable checkbox component with label and error state. |
| 1.2.3 | `frontend/src/components/ui/Toggle.tsx` | Reusable toggle/switch component. |
| 1.2.4 | `frontend/src/app/(onboarding)/consent.tsx` | Expo Router page wrapping `ConsentScreen`. Navigates to sign-in on accept, exits on decline. |
| 1.2.5 | `frontend/src/services/consentService.ts` | Extend the consent service from task 1.1.5: add authenticated `getConsent()` and `saveConsent()` calling `apiGet('/v1/consent')` and `apiPut('/v1/consent')` with `X-Device-Id` header. |

### Consent Store Actions (add to consentStore.ts)

```typescript
interface ConsentStore extends ConsentState {
  // ... existing fields

  acceptConsent: (ageVerified: boolean, privacyAccepted: boolean, adConsent: 'personalized' | 'non_personalized') => Promise<void>;
  declineConsent: () => void;
}
```

### Validation Rules

- `privacyAccepted` must be true before proceeding
- `adConsent` must be one of: `unknown` (default), `personalized`, `non_personalized`
- Decline of required consent (privacy) blocks progression and shows exit path
- If `X-Device-Id` is absent, the API call must fail gracefully with a retry option

### Acceptance Criteria

- Given a user passed the age gate, when they reach the consent screen, then they are shown a privacy policy explanation, a privacy acceptance checkbox, and an ad preference selector
- Given the user checks privacy acceptance and selects an ad preference, when they tap Accept, then consent is saved via `PUT /consent`, the consent store is updated, and they navigate to sign-in
- Given the user taps Decline, then the app exits the onboarding flow (navigates to exit path)
- Given the user tries to tap Accept without checking privacy acceptance, then the button is disabled or an inline validation message is shown
- Given the network is unreachable when saving consent, then an inline error message is shown with a Retry button
- Given the user already completed consent on this device, when reopening the app pre-sign-in, then the consent step is skipped and they resume at sign-in (per US-7.2)
- Given the consent API returns a `VALIDATION_ERROR`, then the specific field error is displayed inline

---

## 1.3 — Social Sign-In Buttons (Google/Apple)

### Design References
- **UI Spec**: Section 1.5 (Sign In) — social sign-in buttons grouped below credentials
- **User Stories**: US-3.2 (Social Sign-In)
- **LLD Mobile**: Section 2 — Zustand auth store; Section 7 — auth flow
- **API Spec**: Section 2.2 — Cognito JWT authentication

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.3.1 | `frontend/src/stores/authStore.ts` | Zustand store for auth state: `isAuthenticated`, `isLoading`, `user`, `error`, `tokens`, actions for sign-in/sign-out. |
| 1.3.2 | `frontend/src/services/socialAuthService.ts` | Social sign-in service: `signInWithGoogle()`, `signInWithApple()`. Uses `expo-auth-session` / `expo-web-browser` for OAuth flow. Returns Cognito JWT tokens. |
| 1.3.3 | `frontend/src/components/ui/SocialButton.tsx` | Reusable social sign-in button: provider icon (Google/Apple), label, loading state. Props: `provider`, `onPress`, `isLoading`. |
| 1.3.4 | `frontend/src/components/onboarding/SocialSignInSection.tsx` | Grouped social sign-in buttons section placed below credential fields on both Sign In and Sign Up screens. |
| 1.3.5 | `frontend/src/hooks/useSocialAuth.ts` | Custom hook: `useSocialAuth()` — wraps social auth flow, handles token extraction, Cognito token exchange, navigation on success. |

### Auth Store Shape

```typescript
// frontend/src/stores/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingStep } from '../types/onboarding';

export interface UserProfile {
  userId: string;
  displayName?: string;
  email?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  reminderTime?: string;       // HH:MM format
  onboardingStep?: OnboardingStep;  // import from '../types/onboarding'
  deletionRequestedAt?: string | null;
  deletionStatus?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: UserProfile | null;

  setUser: (user: UserProfile) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => void;
}
```

### Acceptance Criteria

- Given a user on the sign-in screen, when they tap "Sign in with Google" or "Sign in with Apple", then the OAuth provider flow is initiated via `expo-auth-session`
- Given the social authentication succeeds, when the user returns to the app, then the Cognito token exchange completes, `AuthManager` stores the JWT, `authStore` is updated, and the user navigates to the appropriate next step (intro screens if new, home if returning)
- Given the social authentication is cancelled by the user, when they return to the app, then they remain on the sign-in screen with no account created
- Given the social authentication fails (network error, provider error), when the user returns, then an inline error is shown with a retry option
- Given a returning user who previously signed up via a social provider, when they tap that provider's button, then they are authenticated without needing email/password

---

## 1.4 — Email/Password Sign-Up + Validation

### Design References
- **UI Spec**: Section 1.6 (Sign Up) — screen 1.6
- **User Stories**: US-3.1 (Email/Password Sign-Up)
- **LLD Mobile**: Section 2 — state management
- **API Spec**: Cognito sign-up (client-side via `aws-amplify` or Cognito SDK)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.4.1 | `frontend/src/services/emailAuthService.ts` | Email/password auth service: `signUp(email, password)`, `confirmSignUp(code?)`, `signIn(email, password)`. Uses Cognito SDK (`amazon-cognito-identity-js` or `aws-amplify`). |
| 1.4.2 | `frontend/src/utils/validators.ts` | Form validation utilities: `isValidEmail()`, `isStrongPassword()`, `doPasswordsMatch()`, `getPasswordStrength()`. |
| 1.4.3 | `frontend/src/components/ui/PasswordStrengthIndicator.tsx` | Visual password strength bar: weak (red), medium (amber), strong (green). Props: `password: string`. |
| 1.4.4 | `frontend/src/components/onboarding/SignUpScreen.tsx` | Sign Up screen: email, password, confirm password fields; password strength indicator; terms link; Create Account button. States: default, validation, loading, error (email taken), success. |
| 1.4.5 | `frontend/src/app/(onboarding)/sign-up.tsx` | Expo Router page wrapping `SignUpScreen`. Navigates to level selection or intro on success. |
| 1.4.6 | `frontend/src/hooks/useEmailAuth.ts` | Custom hook: `useEmailAuth()` — wraps sign-up/sign-in flows, handles Cognito responses, updates auth store. |

### Password Strength Rules

| Level | Criteria |
|-------|----------|
| Weak | `< 8 characters` or all lowercase |
| Medium | `>= 8 characters`, mixed case |
| Strong | `>= 8 characters`, mixed case, at least 1 number |

### Validation Rules

- Email: must match standard email regex pattern
- Password: minimum 8 characters, must contain uppercase and lowercase letters and at least one number
- Confirm password: must match password exactly
- Email already registered: show "An account with this email already exists. Sign in instead." with link to sign-in screen
- All fields required before Create Account is enabled
- Terms: acceptance implied by tapping Create Account (no separate checkbox for MVP)

### Acceptance Criteria

- Given a user on the Sign Up screen, when they enter a valid email and strong password and tap Create Account, then Cognito sign-up is invoked, the JWT is stored in `AuthManager`, the auth store is updated, and the user navigates to the intro screens (or level selection per flow)
- Given the user enters an email that is already registered, when they submit, then an inline error is shown: "An account with this email already exists" with a link to Sign In
- Given the user enters an invalid email format, when they submit, then inline validation error is shown and the account is not created
- Given the user enters a weak password, when they submit, then the password strength indicator shows "weak" and the Create Account button remains disabled
- Given the passwords do not match, when they submit, then inline error is shown on the confirm field
- Given the network fails during sign-up, when they submit, then an inline error is shown with a Retry button
- Given the user has already completed sign-up, when they reopen the app, then they are authenticated and navigate to the home screen (or resume step)

---

## 1.5 — Returning User Sign-In Screen

### Design References
- **UI Spec**: Section 1.5 (Sign In) — screen 1.5
- **User Stories**: US-3.3 (Returning User Sign-In)
- **API Spec**: Cognito sign-in (client-side via Cognito SDK)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.5.1 | `frontend/src/components/onboarding/SignInScreen.tsx` | Sign In screen: email, password fields; Forgot Password link; social sign-in buttons; Sign In button. States: default, loading, error (bad credentials), success. |
| 1.5.2 | `frontend/src/app/(onboarding)/sign-in.tsx` | Expo Router page wrapping `SignInScreen`. Navigates to home (returning user) or resume step. |
| 1.5.3 | `frontend/src/services/emailAuthService.ts` | Add `signIn(email, password)` method — Cognito `UserPool.authenticateUser()`, stores tokens in `AuthManager`. |

### Resume Logic (US-7.2)

The Sign In screen is the first screen shown to returning users who have completed the age gate + consent but not yet signed in. On successful sign-in:

1. Auth tokens are stored in `AuthManager` + `tokenStorage`
2. `apiGet('/v1/me')` is called to fetch the `UserProfile` including `onboardingStep`
3. If `onboardingStep` is `complete` or not `null`, the user navigates to the appropriate resume step
4. If `onboardingStep` is `null` (fresh sign-up), the user navigates to intro screens
5. Consent re-key happens automatically on the first authenticated API call (backend task 1.16)

### Acceptance Criteria

- Given a returning user with valid credentials, when they enter email/password and tap Sign In, then they are authenticated and navigate to the home screen (if `onboardingStep = complete`) or the appropriate resume step
- Given a returning user enters an incorrect password, when they submit, then an inline error is shown: "Incorrect email or password" with a "Forgot Password?" link
- Given a returning user who previously signed up with a social provider, when they use that provider's button, then they are authenticated without email/password
- Given a user who completed consent but not sign-in (pre-auth state), when they sign in, then consent re-key occurs on the first authenticated API call
- Given network failure during sign-in, when they submit, then inline error is shown with a Retry button
- Given a user who has an expired session token, when they open the app, then the 401 interceptor in `client.ts` triggers token refresh; if refresh fails, the user is sent to the sign-in screen

---

## 1.6 — Forgot Password / Reset Flow

### Design References
- **UI Spec**: Section 1.5 (Sign In) — "Forgot Password?" link below fields
- **User Stories**: US-3.4 (Forgot Password / Password Reset)
- **API Spec**: Cognito forgot-password flow (client-side via Cognito SDK)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.6.1 | `frontend/src/components/onboarding/ForgotPasswordScreen.tsx` | Forgot Password screen: email input, "Send Reset Link" button. States: default, loading, success (email sent), error (email not found). |
| 1.6.2 | `frontend/src/components/onboarding/ResetPasswordScreen.tsx` | Reset Password screen: new password, confirm password fields, password strength indicator, "Reset Password" button. States: default, validation, loading, error (expired link, weak password), success. |
| 1.6.3 | `frontend/src/app/(onboarding)/forgot-password.tsx` | Expo Router page wrapping `ForgotPasswordScreen`. |
| 1.6.4 | `frontend/src/app/(onboarding)/reset-password.tsx` | Expo Router page wrapping `ResetPasswordScreen`. Handles deep-link with confirmation code from email. |
| 1.6.5 | `frontend/src/services/emailAuthService.ts` | Add `forgotPassword(email)`, `confirmPasswordReset(email, code, newPassword)` methods using Cognito SDK. |

### Validation Rules

- Email must be valid format before "Send Reset Link" is enabled
- New password must meet same strength requirements as sign-up (>= 8 chars, mixed case, numeric)
- Confirmation code from email: must be 6-digit numeric
- Expired reset link: show "This reset link has expired. Please request a new one."

### Acceptance Criteria

- Given a user on the sign-in screen, when they tap "Forgot Password?", then they navigate to the forgot password screen
- Given a user enters their registered email, when they tap "Send Reset Link", then a password reset email is sent via Cognito and a success message is shown
- Given a user enters an unregistered email, when they tap "Send Reset Link", then an inline error is shown: "No account found with this email address"
- Given a user receives the reset email and taps the link, when the app opens via deep-link, then they are taken to the reset password screen with the confirmation code pre-filled
- Given a user enters a valid new password matching strength requirements, when they tap "Reset Password", then the password is updated in Cognito and they navigate to the sign-in screen with a success message
- Given a user enters a weak password, when they tap "Reset Password", then inline validation error is shown
- Given the reset link has expired, when the user submits, then they see "This reset link has expired" and are prompted to request a new one
- Given network failure during any step, then inline error is shown with Retry

---

## 1.7 — Intro Screens (Swipe-Through)

### Design References
- **UI Spec**: Referenced as "intro onboarding cards" in UX copy, screen sequence after sign-in
- **User Stories**: US-4.1 (App Introduction Screens)
- **LLD Mobile**: Section 2 — state management; Section 5 — error handling

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.7.1 | `frontend/src/data/introContent.ts` | Static content for intro slides: title, description, illustration reference, image asset key. Array of `IntroSlide` objects. |
| 1.7.2 | `frontend/src/components/onboarding/IntroSlide.tsx` | Single intro slide: illustration, title, body text. Props: `slide: IntroSlide`, `isActive: boolean`. |
| 1.7.3 | `frontend/src/components/onboarding/IntroCarousel.tsx` | Swipeable carousel: horizontal pager (`react-native-pager-view`), dot indicators, Next/Get Started buttons. Manages page index state. |
| 1.7.4 | `frontend/src/app/(onboarding)/intro.tsx` | Expo Router page wrapping `IntroCarousel`. On "Get Started" tap, navigates to level selection. |
| 1.7.5 | `frontend/src/types/onboarding.ts` | Add `IntroSlide` interface. |

### TypeScript Interfaces

```typescript
export interface IntroSlide {
  id: string;
  title: string;
  description: string;
  imageKey: string;       // reference to asset
  illustrationStyle: 'illustration' | 'animation';
}
```

### Acceptance Criteria

- Given a user who has signed in for the first time, when they finish sign-in, then they are shown the intro carousel
- Given a user is on an intro slide, when they swipe right or tap "Next", then they advance to the next slide
- Given a user is on the last slide, when they tap "Get Started", then onboarding step is saved as `intro_done` and they navigate to level selection
- Given a user has completed the intro screens once, when they sign out and sign back in, then they are NOT shown the intro screens again (check `onboardingStep` from `GET /me`)
- Given the carousel is at the first slide, when the user swipes left, then no action occurs (bounce)
- Given the user signs out mid-way through intro screens, when they sign back in, then they resume at the first incomplete step after sign-in (level selection per US-7.2)

---

## 1.8 — Level Selection Screen

### Design References
- **UI Spec**: Section 1.7 (Level Selection) — screen 1.7
- **User Stories**: US-5.1 (Practice Level Selection)
- **API Spec**: Section 5.2 — `PUT /me` with `level` field
- **LLD Backend**: `UpdateProfileInput.level` — one of `beginner`, `intermediate`, `advanced`

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.8.1 | `frontend/src/types/onboarding.ts` | Add `Level` type: `'beginner' | 'intermediate' | 'advanced'`. |
| 1.8.2 | `frontend/src/data/levelContent.ts` | Static level descriptions: title, description, icon for each level. |
| 1.8.3 | `frontend/src/components/onboarding/LevelSelectionScreen.tsx` | Level selection: guidance text, three level cards (beginner, intermediate, advanced), Continue button. States: default (one selected), selection error (none selected), loading, success. |
| 1.8.4 | `frontend/src/components/ui/SelectionCard.tsx` | Reusable selection card: title, description, selected state styling, onPress handler. Props: `title`, `description`, `isSelected`, `onPress`. |
| 1.8.5 | `frontend/src/app/(onboarding)/level-selection.tsx` | Expo Router page wrapping `LevelSelectionScreen`. On Continue: calls `apiPut('/me', { level })` + `apiPut('/v1/me/onboarding-step', { step: 'level_selected' })`, navigates to reminder setup. |
| 1.8.6 | `frontend/src/services/profileService.ts` | API service: `getProfile()`, `updateProfile(input)`, `updateOnboardingStep(step)`. |

### Profile Service

```typescript
// frontend/src/services/profileService.ts

import { apiGet, apiPut } from '../api/http';
import type { UserProfile } from '../stores/authStore';

export interface UpdateProfileInput {
  displayName?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  reminderTime?: string; // HH:MM format
}

export async function getProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>('/me');
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  return apiPut<UserProfile>('/me', input);
}

export async function updateOnboardingStep(step: string): Promise<void> {
  return apiPut<void>('/me/onboarding-step', { step });
}
```

### Validation Rules

- Exactly one level must be selected before Continue is enabled
- Level must be one of: `beginner`, `intermediate`, `advanced`
- If Continue is tapped without a selection, show inline prompt: "Please select your English level to continue"

### Acceptance Criteria

- Given a user on the level selection screen, when they see the screen, then they are presented with 3 clearly described level options as tappable cards
- Given a user selects a level, when they tap Continue, then `PUT /me` saves the level to the profile, onboarding step is updated to `level_selected`, and they navigate to reminder setup
- Given a user does not select any level, when they tap Continue, then an inline prompt is shown: "Please select your English level to continue"
- Given the API call fails, when the user taps Continue, then an inline error is shown with a Retry button
- Given the user already selected a level in a previous session, when they reach this screen, then the previous selection is pre-selected

---

## 1.9 — Reminder Setup + Notification Permission

### Design References
- **UI Spec**: Section 1.8 (Reminder Setup) — screen 1.8, Section 1.9 (Permission Prompts — notification card)
- **User Stories**: US-5.2 (Reminder Preference Setup)
- **LLD Mobile**: Section 3.2 — Notification store shape, sequence diagram; `NotificationPreferencesState`
- **API Spec**: Section 5.2 — `PUT /me` with `reminderTime`

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.9.1 | `frontend/src/stores/notificationStore.ts` | Zustand store for notification/preferences state. Shape per LLD Mobile Section 3.2. |
| 1.9.2 | `frontend/src/services/notificationService.ts` | Notification service: `requestPermission()`, `scheduleReminder(time)`, `cancelReminder()`, `checkPermissionStatus()`. Uses `expo-notifications`. |
| 1.9.3 | `frontend/src/components/onboarding/ReminderSetupScreen.tsx` | Reminder setup: toggle, time picker (active when enabled), Continue + Skip buttons. States: enabled, disabled, success. |
| 1.9.4 | `frontend/src/components/ui/TimePicker.tsx` | Reusable time picker component: wraps `@react-native-community/datetimepicker` or Expo's `DateTimePicker`. |
| 1.9.5 | `frontend/src/app/(onboarding)/reminder-setup.tsx` | Expo Router page wrapping `ReminderSetupScreen`. On Continue: saves reminder to profile via `apiPut`, schedules local notification, navigates to permission prompts. |
| 1.9.6 | `frontend/src/hooks/useNotificationPermission.ts` | Custom hook: `useNotificationPermission()` — wraps `expo-notifications` permission API, tracks `NotificationPermissionStatus` state machine. |

### Notification Store Shape

```typescript
// frontend/src/stores/notificationStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationPermissionStatus =
  | 'unknown'
  | 'granted'
  | 'denied'
  | 'blocked';

export type NotificationRecoveryState =
  | 'idle'
  | 'denied'
  | 'recovery_prompt'
  | 'settings_redirect';

export interface NotificationPreferencesState {
  reminderEnabled: boolean;
  reminderTime: string;       // HH:MM in device local time
  permissionStatus: NotificationPermissionStatus;
  recoveryState: NotificationRecoveryState;
  scheduledNotificationId?: string;
}

interface NotificationStore extends NotificationPreferencesState {
  setReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  setPermissionStatus: (status: NotificationPermissionStatus) => void;
  setRecoveryState: (state: NotificationRecoveryState) => void;
  setScheduledNotificationId: (id: string | undefined) => void;
  reset: () => void;
}
```

### Permission State Machine (per LLD Mobile Section 3.2)

```
denied -> recovery_prompt -> settings_redirect (when user refuses at OS level)
```

### Validation Rules

- Time picker is active and visible only when reminder toggle is enabled
- Time must be in `HH:MM` format (24h)
- Reminder time is saved to profile via `PUT /me` with `reminderTime` field
- If notification permission is denied, the toggle can still be enabled (permission request will trigger on toggle), but a recovery note is shown

### Acceptance Criteria

- Given a user on the reminder setup screen, when they toggle reminders on and select a time, then the time picker is active and visible
- Given a user selects a time and taps Continue, then `reminderTime` is saved to the profile via `PUT /me`, a local notification is scheduled via `expo-notifications`, and the user navigates to the permission prompts screen
- Given a user taps Skip, then no reminder is scheduled and the onboarding step is updated to `reminder_set`, and they navigate to permission prompts
- Given notification permission is denied at the OS level, when the user enables the toggle, then the system permission dialog is shown; if denied again, the recovery path (`recovery_prompt` -> `settings_redirect`) is shown
- Given a user already has a reminder set, when they reach this screen (resume flow), then the previous settings are pre-populated
- Given the API call to save `reminderTime` fails, then an inline error is shown with Retry

---

## 1.10 — Microphone Permission Screen

### Design References
- **UI Spec**: Section 1.9 (Permission Prompts) — screen 1.9, microphone card
- **User Stories**: US-6.1 (Microphone Permission), US-6.2 (Denied Graceful Handling)
- **LLD Mobile**: Section 5 — permission recovery states

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.10.1 | `frontend/src/components/onboarding/PermissionPromptsScreen.tsx` | Permission prompts screen: two stacked cards (notification + microphone), each with rationale, status badge, and action. Continue + Open Settings buttons. States: granted, denied, blocked. |
| 1.10.2 | `frontend/src/services/permissionService.ts` | Permission service: `requestMicrophonePermission()`, `checkMicrophonePermission()`, `openAppSettings()`. Uses `expo-av` or `expo-permissions` for mic, `Linking.openSettings()` for settings redirect. |
| 1.10.3 | `frontend/src/components/ui/PermissionCard.tsx` | Reusable permission status card: title, description, status badge (granted/denied), action button. Props: `title`, `description`, `status: PermissionStatus`, `onAction`, `actionLabel`. |
| 1.10.4 | `frontend/src/app/(onboarding)/permission-prompts.tsx` | Expo Router page wrapping `PermissionPromptsScreen`. On Continue: finalizes onboarding (`onboardingStep = complete`), navigates to Home. |
| 1.10.5 | `frontend/src/hooks/useMicrophonePermission.ts` | Custom hook: `useMicrophonePermission()` — wraps `expo-permissions`/`expo-av`, tracks permission state. |

### Permission State Machine

```
Microphone permission:
  unknown -> request -> granted (proceed)
                     -> denied (show recovery card, continue allowed)
                     -> blocked (show settings redirect card, continue allowed)

Notification permission:
  (handled in task 1.9, display current status here)
```

### Acceptance Criteria

- Given a user near the end of onboarding, when they reach the permission prompts screen, then they see two stacked cards: one for notifications and one for microphone, each with a clear explanation
- Given microphone permission is granted (or user taps "Allow" and grants via OS dialog), then the microphone card shows a "Granted" badge and the user can tap Continue
- Given microphone permission is denied, then the microphone card shows "Microphone access denied" with an "Open Settings" button; Continue is still enabled
- Given the user taps "Open Settings", then the OS settings app is opened via `Linking.openSettings()`
- Given both permissions are handled (granted or acknowledged as denied), when the user taps Continue, then `onboardingStep` is updated to `complete` and the user navigates to the Home screen
- Given the user has already granted/denied permissions in a previous session, when they reach this screen, then the correct status is displayed immediately without re-prompting

---

## 1.11 — Deep-Link Handler for Notification Taps

### Design References
- **LLD Mobile**: Section 3.2 — deep-link routing on notification tap, cold-start handling
- **UI Spec**: Section 3.3 (Local Reminder Notification) — screen 3.3
- **User Flow**: Returning-User Daily Practice Flow

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| 1.11.1 | `frontend/src/services/deepLinkService.ts` | Deep-link handler: `handleNotificationTap(data)`, `handleColdStartNotification()`. Parses notification data, determines target route. |
| 1.11.2 | `frontend/src/hooks/useNotificationHandler.ts` | Custom hook: `useNotificationHandler()` — registers notification response listener in `expo-notifications`, routes to target screen. |
| 1.11.3 | `frontend/src/app/_layout.tsx` | Update root layout: register notification handler on mount, initialize deep-link listener, route to Home or appropriate screen based on notification data. |

### Deep-Link Routing Logic

```typescript
// frontend/src/services/deepLinkService.ts

export type DeepLinkTarget = 'home' | 'lesson' | 'progress';

export interface NotificationData {
  target: DeepLinkTarget;
  lessonId?: string;
}

export function resolveNotificationRoute(data: NotificationData): string {
  switch (data.target) {
    case 'home':
      return '/(tabs)/home';
    case 'lesson':
      return `/lesson/${data.lessonId}`;
    case 'progress':
      return '/(tabs)/progress';
    default:
      return '/(tabs)/home';
  }
}
```

### Cold-Start Handling

- On app launch, check if the app was opened from a notification tap (via `expo-notifications` `getLastNotificationResponseAsync()`)
- If yes, resolve the deep-link target and navigate after auth check completes
- If the user is not authenticated, queue the deep-link intent and execute after sign-in
- If the user is mid-onboarding, defer the deep-link until onboarding completes

### Acceptance Criteria

- Given a local reminder notification is delivered and the user taps it, when the app opens, then the user is navigated to the Home screen
- Given the app is cold-started from a notification tap, when the app finishes loading, then the deep-link target is resolved and the user is routed accordingly
- Given the user is not authenticated when a notification tap opens the app, then the deep-link intent is queued and executed after successful sign-in
- Given the user is mid-onboarding when a notification tap opens the app, then the deep-link is deferred until onboarding completes
- Given a notification contains a `lessonId` target, when the user taps it, then they are navigated to that lesson's detail screen (requires Epic 02)

---

## C.5 — AdMob SDK Initialization + Consent-Aware Request

### Design References
- **LLD Mobile**: Section 6.1 — AdMob initialization sequence, `AdConsentMode`, `AdIntegrationController`
- **UI Spec**: Ad Placement section, Section 1.4 (ad consent choice)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.5.1 | `frontend/src/services/adService.ts` | AdMob initialization service: `initializeAdMob(consentMode)`, `preloadInterstitial()`, `canShowAd()`, `showInterstitial()`. Uses `react-native-google-mobile-ads`. |
| C.5.2 | `frontend/src/stores/adStore.ts` | Zustand store for ad state: `adConsentMode`, `adLifecycleState`, `dailyAdCount`, `lastAdDate`. Persists daily counter for frequency capping. |
| C.5.3 | `frontend/src/hooks/useAdInitialization.ts` | Custom hook: `useAdInitialization()` — reads consent state, initializes AdMob with correct mode (personalized vs non-personalized), preloads first interstitial. |

### AdMob Initialization Sequence

Per LLD Mobile Section 6.1:
1. Read consent + ad counters from local store
2. Resolve consent state (from `consentStore`)
3. Initialize AdMob SDK with request config (personalized or non-personalized)
4. Preload next interstitial ad

### Acceptance Criteria

- Given consent allows personalization, when AdMob initializes, then personalized ad requests are configured
- Given consent is denied or unknown, when AdMob initializes, then non-personalized ad requests are configured
- Given AdMob initialization, when it completes, then it does not block the app shell or onboarding flow
- Given the daily ad cap is reached, when a session boundary is eligible for an ad, then `canShowAd()` returns false and the ad is skipped
- Given an ad fails to load or show, when the failure occurs, then the practice flow continues without interruption

---

## C.8 — Encrypted SQLite Local Store Setup

### Design References
- **Mobile Storage Design**: Sections 1-4 — table schemas for practice_sessions, progress_snapshots, sync_queue_items, cached_lessons, recording_references, ad_counter
- **LLD Mobile**: Section 4 — offline storage

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.8.1 | `frontend/src/storage/database.ts` | Encrypted SQLite database initialization: `initializeDatabase()`, `getDatabase()`. Uses `expo-sqlite` or `react-native-quick-sqlite` with SQLCipher for encryption. |
| C.8.2 | `frontend/src/storage/migrations.ts` | Database migration runner: versioned schema migrations, creates all tables from Mobile Storage Design. Initial migration creates `practice_sessions`, `progress_snapshots`, `sync_queue_items`, `cached_lessons`, `thumbnail_cache`, `recording_references`, `ad_counter` tables. |
| C.8.3 | `frontend/src/storage/repositories/sessionRepository.ts` | CRUD for `practice_sessions` table. |
| C.8.4 | `frontend/src/storage/repositories/syncQueueRepository.ts` | CRUD for `sync_queue_items` table. |
| C.8.5 | `frontend/src/storage/repositories/adCounterRepository.ts` | CRUD for `ad_counter` table. |
| C.8.6 | `frontend/src/storage/repositories/cachedLessonRepository.ts` | CRUD for `cached_lessons` table. |
| C.8.7 | `frontend/src/storage/repositories/progressRepository.ts` | CRUD for `progress_snapshots` table. |

### Database Schema (from Mobile Storage Design)

```sql
CREATE TABLE practice_sessions (
    session_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('created','active','paused','completed','synced')),
    started_at TEXT NOT NULL,
    expires_at TEXT,
    completed_at TEXT,
    completion_percent INTEGER,
    recording_local_uri TEXT,
    client_mutation_id TEXT
);

CREATE TABLE sync_queue_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    client_mutation_id TEXT NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    next_retry_at TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending','processing','failed','synced'))
);

CREATE TABLE ad_counter (
    user_id TEXT NOT NULL,
    date_key TEXT NOT NULL,
    shown_count INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (user_id, date_key)
);
```

### Acceptance Criteria

- Given the app launches for the first time, when the database initializes, then all tables are created with the correct schema
- Given the app already has a database from a previous version, when a migration is needed, then the migration runner executes pending migrations
- Given sensitive data is written to the database, when it is stored, then the SQLite file is encrypted
- Given a database operation fails, when it occurs, then the error is caught and logged without crashing the app
- Given the database initialization is complete, when the app accesses any repository, then the queries execute against the correct table schema

---

## C.9 — Zustand Stores (Auth, Consent, Lessons, Session, Sync)

### Design References
- **LLD Mobile**: Section 2 — Zustand for lightweight global state
- **Existing**: `frontend/src/state/useAppStore.ts` (AppState template)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.9.1 | `frontend/src/stores/authStore.ts` | Auth store (defined in 1.3.1): JWT token state, user profile, authentication status, sign-in/sign-out actions. Persisted to AsyncStorage. |
| C.9.2 | `frontend/src/stores/consentStore.ts` | Consent store (defined in 1.1.2): age verification, privacy acceptance, ad consent preference. |
| C.9.3 | `frontend/src/stores/onboardingStore.ts` | Onboarding progress store (defined in 1.1.3): current step, resume logic. Persisted for cold-start resume. |
| C.9.4 | `frontend/src/stores/notificationStore.ts` | Notification store (defined in 1.9.1): reminder enabled/disabled, time, permission status, recovery state. |
| C.9.5 | `frontend/src/stores/lessonStore.ts` | Lesson store (placeholder for Epic 02): lesson catalog cache, selected lesson, download progress. |
| C.9.6 | `frontend/src/stores/sessionStore.ts` | Session store (placeholder for Epic 03): active practice session state, recording status, playback progress. |
| C.9.7 | `frontend/src/stores/syncStore.ts` | Sync store (placeholder for Epic 04): offline sync queue status, pending mutations count, last sync timestamp. |

### Store Design Rules

1. Use Zustand `persist` middleware with `createJSONStorage(() => AsyncStorage)` for stores that must survive app restarts (auth, consent, onboarding, notification, ad counter)
2. Use ephemeral Zustand stores (no `persist`) for transient UI state (lesson, session)
3. Each store should expose a `reset()` action for logout
4. Store actions should be async where they call services/APIs
5. Stores should not import from other stores directly — use service layer for inter-store coordination

### Acceptance Criteria

- Given the app launches, when each persisted store initializes, then it hydrates from AsyncStorage automatically
- Given a user performs an action that updates a store, when the state changes, then all subscribed components re-render with the new state
- Given the user clears app data or signs out, when `reset()` is called on each store, then the store returns to its initial state
- Given a store action that calls an API fails, when the error occurs, then the store's `error` field is populated and the action is not committed
- Given the app is in development, when Zustand devtools are enabled, then state changes are visible in React DevTools/Redux DevTools

---

## C.10 — Global Error Boundary + Unhandled Promise Handler

### Design References
- **LLD Mobile**: Section 5 (Client Error Handling), Section 8 (NFR-20 — crash rate <= 0.5%)
- **UI Spec**: Section 5.1 (Retryable Error States)

### Implementation Tasks

| Sub-task | File | Description |
|----------|------|-------------|
| C.10.1 | `frontend/src/components/ErrorBoundary.tsx` | React class-based error boundary: catches render errors, shows fallback UI with retry button. Props: `fallback?: ReactNode`, `onError?: (error, info) => void`. |
| C.10.2 | `frontend/src/components/ErrorFallbackScreen.tsx` | Full-screen error fallback: error icon, "Something went wrong" message, "Try Again" button. States: retryable error, fatal error. Per UI Spec Section 5.1. |
| C.10.3 | `frontend/src/services/globalErrorHandler.ts` | Global unhandled promise rejection handler: `setupGlobalErrorHandler()` — registers `ErrorUtils.setGlobalHandler` (React Native) and `unhandledrejection` listener. Sends to crash reporting (Sentry/Crashlytics in production). |
| C.10.4 | `frontend/src/app/_layout.tsx` | Update root layout: wrap with `ErrorBoundary`, call `setupGlobalErrorHandler()` at app bootstrap. Also call `initializeDatabase()` (from C.8.1) before any store hydration to ensure the local DB is ready for persistent data. |

### Error Boundary Design

```typescript
// frontend/src/components/ErrorBoundary.tsx

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
```

### Acceptance Criteria

- Given a rendering error occurs in any component within the boundary, when the error is caught, then the fallback UI is displayed instead of a white screen or crash
- Given the fallback UI is displayed, when the user taps "Try Again", then the boundary resets and the component tree re-renders
- Given a render error occurs outside the boundary (root level), when caught, then the root error boundary shows the fatal fallback
- Given an unhandled promise rejection occurs, when caught by the global handler, then the error is logged to the crash reporting service
- Given a development build, when an error occurs, then the error message and stack trace are visible in the console
- Given a production build, when an error occurs, then the error is reported silently and the user sees only the fallback UI

---

## Testing Tasks

### Design Reference
- **LLD Mobile**: Section 5 — client error handling; Section 8 — NFR coverage
- **UI Spec**: Screen-by-screen state coverage (default, loading, error, success)

### Unit Testing

| Sub-task | File | Description |
|----------|------|-------------|
| T.1 | `frontend/src/__tests__/validators.test.ts` | Unit tests: `isValidEmail()`, `isStrongPassword()`, `getPasswordStrength()`, `doPasswordsMatch()`. Test boundary cases, edge cases, and all strength levels. |
| T.2 | `frontend/src/__tests__/deviceIdService.test.ts` | Unit tests: `getOrCreateDeviceId()` returns consistent ID, persists and retrieves from AsyncStorage. |
| T.3 | `frontend/src/__tests__/stores/consentStore.test.ts` | Unit tests: consent store actions, state transitions, persist/restore. |
| T.4 | `frontend/src/__tests__/stores/onboardingStore.test.ts` | Unit tests: onboarding step transitions, resume logic, reset. |
| T.5 | `frontend/src/__tests__/stores/authStore.test.ts` | Unit tests: auth store sign-in/sign-out, token management, persist/restore. |
| T.6 | `frontend/src/__tests__/stores/notificationStore.test.ts` | Unit tests: notification preferences persistence, state transitions. |
| T.7 | `frontend/src/__tests__/deepLinkService.test.ts` | Unit tests: `resolveNotificationRoute()` returns correct routes for each target type. |
| T.8 | `frontend/src/__tests__/services/consentService.test.ts` | Unit tests: consent API calls with mocked HTTP layer (mock `apiGet`, `apiPut`). |

### Integration Testing

| Sub-task | File | Description |
|----------|------|-------------|
| T.9 | `frontend/src/__tests__/services/socialAuthService.test.ts` | Integration tests: social auth flow with mocked Cognito/Google/Apple responses. |
| T.10 | `frontend/src/__tests__/services/emailAuthService.test.ts` | Integration tests: sign-up, sign-in, forgot-password flows with mocked Cognito SDK. |
| T.11 | `frontend/src/__tests__/services/profileService.test.ts` | Integration tests: `getProfile()`, `updateProfile()`, `updateOnboardingStep()` with mocked HTTP layer. |

### Component/IUT Tests

| Sub-task | File | Description |
|----------|------|-------------|
| T.12 | `frontend/src/__tests__/components/AgeGateScreen.test.tsx` | Component tests: AgeGateScreen renders correctly, validation shows/hides, navigation fires on valid input. Test with React Native Testing Library. |
| T.13 | `frontend/src/__tests__/components/ConsentScreen.test.tsx` | Component tests: ConsentScreen renders checkboxes, Accept/Decline buttons, validation. |
| T.14 | `frontend/src/__tests__/components/SignUpScreen.test.tsx` | Component tests: SignUpScreen form fields, password strength indicator, validation errors. |
| T.15 | `frontend/src/__tests__/components/LevelSelectionScreen.test.tsx` | Component tests: level selection cards, selection state, validation on empty selection. |
| T.16 | `frontend/src/__tests__/components/ReminderSetupScreen.test.tsx` | Component tests: toggle, time picker visibility, Continue/Skip actions. |

### Mock Strategy

- Use `jest.mock()` for all native modules: `expo-secure-store`, `expo-notifications`, `expo-auth-session`, `expo-sqlite`, `react-native-google-mobile-ads`
- Mock the HTTP layer by mocking `frontend/src/api/http.ts` functions (`apiGet`, `apiPut`, etc.)
- Mock Cognito SDK (`amazon-cognito-identity-js` or `aws-amplify`) for auth service tests
- Use `@react-native-async-storage/async-storage/jest/async-storage-mock` for AsyncStorage
- Use Zustand store test utilities: create fresh stores per test via `create()` factory pattern
- For component tests, use `@testing-library/react-native` with mocked stores
- Test cold-start resume by populating AsyncStorage with serialized Zustand state before creating stores

---

## Task Dependency Graph

```
C.8 (SQLite Setup)
├── C.9 (Zustand Stores)
│     ├── 1.1 (Age Gate)
│     │     ├── 1.2 (Consent Screen)
│     │     │     ├── 1.3 (Social Sign-In)
│     │     │     │     └── 1.7 (Intro Screens)
│     │     │     │           └── 1.8 (Level Selection)
│     │     │     │                 └── 1.9 (Reminder Setup)
│     │     │     │                       ├── 1.10 (Mic Permission)
│     │     │     │                       └── 1.11 (Deep-Link Handler)
│     │     │     └── 1.4 (Email Sign-Up)
│     │     │           └── 1.5 (Returning Sign-In)
│     │     │                 └── 1.6 (Forgot Password)
│     │     ├── C.5 (AdMob Init) ◄── consentStore
│     │     └── C.10 (Error Boundary)
│     └── T.1–T.16 (Testing) ◄── all implementation tasks
```

---

## Suggested Build Order

| Step | Tasks | Result |
|------|-------|--------|
| 1 | C.8 (SQLite) + C.9 (Stores) | Data layer ready |
| 2 | 1.1 (Age Gate) + C.10 (Error Boundary) | First onboarding screen functional |
| 3 | 1.2 (Consent) + 1.1 | Consent flow connected to API |
| 4 | 1.3 (Social Sign-In) + 1.4 (Email Sign-Up) + 1.5 (Returning Sign-In) | Auth flow complete |
| 5 | 1.6 (Forgot Password) | Password recovery complete |
| 6 | 1.7 (Intro Screens) | Post-auth intro complete |
| 7 | 1.8 (Level Selection) + 1.9 (Reminder Setup) | Profile setup screens complete |
| 8 | 1.10 (Mic Permission) + 1.11 (Deep-Link Handler) | Onboarding completion + notification handling |
| 9 | C.5 (AdMob Init) | Ad initialization wired to consent |
| 10 | T.1–T.16 (Testing) | All tests passing |

---

## Navigation Design

### Onboarding Route Group

All onboarding screens live under `frontend/src/app/(onboarding)/` as an Expo Router group. The root layout (`frontend/src/app/_layout.tsx`) checks auth state and onboarding progress:

```typescript
// Routing logic in _layout.tsx

if (!isAuthenticated && !hasConsent) {
  // Redirect to (onboarding)/age-gate
} else if (!isAuthenticated && hasConsent) {
  // Redirect to (onboarding)/sign-in
} else if (isAuthenticated && onboardingStep !== 'complete') {
  // Resume at onboardingStep
} else if (isAuthenticated && onboardingStep === 'complete') {
  // Redirect to (tabs)/home
}
```

### Screen Stack vs Modal

| Screen | Type | Notes |
|--------|------|-------|
| Age Gate | Stack | Push navigation, back action |
| Age Policy Block | Full-screen modal | No back, only exit |
| Consent | Stack | Push from age gate |
| Sign In | Stack | Push from consent; back to consent |
| Sign Up | Stack | Push from sign-in header link |
| Forgot Password | Stack | Push from sign-in |
| Reset Password | Stack | Deep-link entry or push |
| Intro Carousel | Stack | Push after sign-in |
| Level Selection | Stack | Push from intro |
| Reminder Setup | Stack | Push from level selection |
| Permission Prompts | Stack | Push from reminder setup |

### Resume Logic (per US-7.2)

The `onboardingStore` persists `currentStep` to AsyncStorage. On app cold-start:

1. Check if JWT exists in `AuthManager` (via `loadFromStorage()`)
2. If no JWT: check `consentStore.ageVerified` — if true, resume at sign-in; if false, resume at age gate
3. If JWT exists: call `GET /me` to fetch `onboardingStep` from backend
4. Map `onboardingStep` to the correct screen per the resume table in backend task 1.20:

| `onboardingStep` | Resume Screen |
|---|---|
| `null` | Age Gate (should not happen with JWT, but fallback safe) |
| `age_gate_done` | Consent |
| `consent_done` | Sign In (or skip if JWT exists) |
| `intro_done` | Level Selection |
| `level_selected` | Reminder Setup |
| `reminder_set` | Permission Prompts |
| `mic_permission_done` | Complete -> Home |
| `complete` | Home |

---

## Revision History

| Version | Date       | Author   | Description |
|---------|-----------|----------|-------------|
| 1.0     | 2026-06-07 | Solo Dev | Initial frontend technical task breakdown for Epic 01 onboarding |
