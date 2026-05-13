# ShadowSpeak UI Design Specification

## Document Metadata

| Field | Value |
|-------|-------|
| Project | ShadowSpeak |
| Document Type | UI Design Specification |
| Date | 2026-05-13 |
| Status | Draft |
| Version | 1.1 |
| Owner | UX Design |

## Source Basis

This UI specification is derived from:

- [User Flow Diagram](01-User-Flow-Diagram.md)
- [Information Architecture Document](02-Information-Architecture-Document.md)
- [Wireframe Document](03-Wireframe-Document.md)
- [Use Case Specification](../02-analysis/05-Use-Case-Specification.md)
- [Functional Requirements Specification](../02-analysis/03-Functional-Requirements-Specification.md)
- [User Story Document](../02-analysis/06-User-Story-Document.md)

## Scope

### In Scope

- Production-ready visual system for the ShadowSpeak MVP
- Cross-platform mobile UI guidance for iOS and Android
- Screen-by-screen visual specifications based on the approved wireframes
- Component states, spacing, typography, color, iconography, and hierarchy rules
- Audio-first interaction patterns and ad placement styling
- Accessibility and platform behavior notes
- Traceability to wireframes, IA, and user-flow screens

### Out of Scope

- High-fidelity brand exploration beyond this MVP system
- Marketing site design, web app design, or desktop layouts
- Real-time AI coaching, speech recognition, or pronunciation scoring
- Subscription, premium, or social feature UI
- Motion-heavy or illustration-led visual treatments

## Design System Overview

### Visual Language

ShadowSpeak should feel calm, trustworthy, and high-clarity. The visual system must support an audio-first habit loop, so the UI should reduce friction, avoid visual clutter, and make the next action obvious at a glance.

Design goals:

- Make the primary action on each screen unmistakable
- Favor soft surfaces, strong contrast, and simple hierarchy
- Use warm, motivating accent colors sparingly for progress and audio emphasis
- Keep compliance and recovery states visually distinct from the core practice loop

### Color Palette

| Token | Hex | Use |
|-------|-----|-----|
| `color-bg` | `#F7F5F0` | Default app background |
| `color-surface` | `#FFFFFF` | Cards, sheets, elevated panels |
| `color-surface-alt` | `#EEF2F5` | Secondary surfaces, chips, grouped sections |
| `color-primary` | `#0E5A6A` | Primary CTAs, active states, emphasis |
| `color-primary-pressed` | `#0A4652` | Pressed primary buttons |
| `color-secondary` | `#D97706` | Accent for progress, reminders, and audio cues |
| `color-text` | `#111827` | Main text |
| `color-text-muted` | `#6B7280` | Secondary text and helper copy |
| `color-border` | `#D6D9DE` | Dividers and input borders |
| `color-focus` | `#2563EB` | Keyboard and accessibility focus ring |
| `color-success` | `#1F8A70` | Success and completed states |
| `color-warning` | `#D97706` | Cautions, storage warnings, offline guidance |
| `color-error` | `#C2410C` | Errors and destructive feedback |
| `color-info` | `#2563EB` | Informational notices |
| `color-disabled` | `#A8B0B8` | Disabled text and controls |

Color usage rules:

- Primary CTAs should use `color-primary` with white text.
- Warm accent `color-secondary` should be reserved for reminders, streaks, and audio emphasis, not broad surface fills.
- Error and warning colors must only be used for explicit system feedback.
- Compliance screens should remain neutral and not feel promotional.

### Typography Scale

Use a mobile-first scale that is readable at short distances and supports dynamic type.

| Style | Size / Line Height | Weight | Use |
|-------|--------------------|--------|-----|
| Display | 28 / 34 | Semibold | Major home headlines or onboarding emphasis |
| H1 | 24 / 30 | Semibold | Screen titles |
| H2 | 20 / 26 | Semibold | Section headings |
| H3 | 18 / 24 | Semibold | Card titles and prominent labels |
| Body | 16 / 24 | Regular | Main copy |
| Body Emphasis | 16 / 24 | Medium | Key values, actions, and state labels |
| Body Small | 14 / 20 | Regular | Supporting copy |
| Caption | 12 / 16 | Regular | Metadata, helper text, legal notes |
| Audio Label | 13 / 16 | Medium, slightly tracked | Play, pause, recording, timer labels |

Typeface guidance:

- Use a clean, modern sans-serif family across platforms.
- Prefer one family with platform-native fallback behavior to preserve consistency and rendering quality.
- Use medium weight for audio labels and active controls so the playback state reads clearly.

Typography rules:

- Screen titles should not exceed one line where possible.
- Compliance and legal copy should use Body Small or Caption, not H1/H2.
- Numbers for streaks, timers, and durations should be visually prominent and easy to scan.

### Spacing System

| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 4 | Fine spacing, icon/text gaps |
| `space-2` | 8 | Tight grouping |
| `space-3` | 12 | Default between related controls |
| `space-4` | 16 | Default inner padding and section spacing |
| `space-5` | 20 | Group separation |
| `space-6` | 24 | Screen section spacing |
| `space-8` | 32 | Major vertical separation |

Spacing rules:

- Use an 8pt rhythm for most layout decisions.
- Use 16px minimum horizontal padding on phones.
- Keep card gaps at 12 to 16px depending on density.
- Maintain 48pt minimum touch targets for audio controls and 44pt minimum for all other interactive elements.

### Layout Grid

- Mobile frame: 4-column logical grid with 16px outer padding
- Section rhythm: 24px between major screen sections
- Card internals: 16px default padding
- Dense lists: 12px vertical separation between rows

### Iconography Style

| Token | Standard |
|-------|----------|
| Style | Simple outline icons with filled active states |
| Default size | 24px |
| Small utility icons | 16px |
| Large audio icons | 32px to 48px |
| Stroke | Medium, consistent weight |
| Corner style | Rounded, approachable |

Iconography rules:

- Use outline icons in lists and settings.
- Use filled or high-contrast icons for active audio states, downloads, and recording indicators.
- Avoid decorative icon overload; every icon must communicate state or action.

### Component Library

#### Button System

| Component | Default | Pressed | Disabled | Loading | Focused |
|-----------|---------|---------|----------|---------|---------|
| Primary Button | Filled primary background, white text | Darker primary fill | Muted fill and text | Spinner + disabled label | Blue focus ring |
| Secondary Button | Neutral border, primary text | Light neutral fill | Low-contrast border/text | Spinner where needed | Blue focus ring |
| Tertiary Button | Text-only | Underlined or tinted | Muted text | No spinner by default | Blue focus ring |

#### Inputs and Controls

| Component | Guidance |
|-----------|----------|
| Text input | 16px body text, 48pt minimum height, clear label above field |
| Password field | Show/hide control and helper copy |
| Select / picker | Mobile-native picker when appropriate |
| Toggle | Use for reminders and consent-related switches |
| Segmented control | Use for playback mode and ad choices where a small choice set is needed |
| Checkbox | Use for consent acknowledgements |
| Slider | Use for playback speed only when paired with labeled steps |

#### Navigation Components

| Component | Guidance |
|-----------|----------|
| Bottom tab bar | 5 destinations maximum, always visible on main shell screens |
| Top bar | Back action on secondary screens, title centered or leading depending on platform norms |
| Back button | Always visible on stacked screens unless blocked by a full-screen state |
| Bottom sheet | Use for ad interstitial container or contextual actions, not as a default navigation surface |

#### Content Components

| Component | Guidance |
|-----------|----------|
| Card | Primary content container for lessons, streak summaries, downloads, and settings groups |
| List item | Use for settings and recordings |
| Chip | Use for filters and quick state selection |
| Badge | Use for offline, downloaded, synced, or completed status |
| Empty state block | Use for no history, no results, and no downloads |

#### Audio-Specific Components

| Component | Guidance |
|-----------|----------|
| Play / pause / resume control | Must be the largest actionable element in practice screens |
| Recording state indicator | Show idle, recording, processing, and ready states clearly |
| Progress ring / bar | Use for session progress and download progress |
| Audio cue label | Use for timing, recording, and state prompts |
| Level meter / mic indicator | Minimal, but visible during recording |

#### Feedback Components

| Component | Guidance |
|-----------|----------|
| Inline error text | Use for validation and local input errors |
| Full-screen error state | Use for blocking onboarding, failed loads, and expired auth |
| Toast / banner | Use sparingly for non-blocking status changes |
| Skeleton loaders | Use for home, catalog, and progress hydration |

## Screen-by-Screen Specifications

### 1. Entry, Compliance, and Onboarding

#### 1.1 App Launch

Purpose: Resolve startup state and route the learner into onboarding or Home.

Layout:

- Full-screen neutral loading state with centered brand mark or wordmark
- Short status text beneath the loader
- Optional retry action only if startup fails

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Brand / wordmark | Upper or center | Small and unobtrusive |
| Loading indicator | Center | Circular or linear, subtle |
| Status text | Center below loader | Short, calm copy |
| Retry button | Bottom or center on error | Only visible on failure |

State specs:

| State | Specification |
|-------|---------------|
| Default/loading | Use muted text on `color-bg` with a single active loader |
| Error | Show a short failure message and retry CTA in `color-error` or neutral with error accent |
| Success | Transition directly to the next app state |

Spacing / alignment:

- Center all content vertically.
- Keep content sparse to reduce cognitive load.

Typography:

- Title/brand: H2 or H3
- Status text: Body Small

Color:

- Background: `color-bg`
- Text: `color-text` / `color-text-muted`

Audio-first:

- Keep startup brief so the learner reaches the practice loop quickly.

#### 1.2 Age Gate

Purpose: Confirm eligibility when no store-provided age signal is available.

Layout:

- Back action in top bar
- Short explanation and age input/attestation in the main body
- Support/legal note below the input
- Continue and support actions at the bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Single-line |
| Age control | Mid screen | Checkbox, date field, or age affirmation depending on implementation |
| Helper copy | Mid or lower | Brief requirement explanation |
| Continue button | Bottom primary | Full-width |
| Exit/Support button | Bottom secondary | Secondary action |

State specs:

| State | Specification |
|-------|---------------|
| Default | Age control active, helper copy visible |
| Validation error | Inline message under the control |
| Success | Route to consent screen |

Spacing / alignment:

- Keep the main input centered in the top half.
- Bottom actions should stack with 12px spacing.

Typography:

- Title: H1
- Body: Body / Body Small

Color:

- Use neutral surfaces and `color-primary` for Continue.

Audio-first:

- Minimize text density and keep input steps simple.

#### 1.3 Age Policy Block

Purpose: Stop underage onboarding and route to support.

Layout:

- Full-screen blocking state
- Strong message in the center
- Exit and support actions at the bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Block title | Center | Direct and plain |
| Explanation text | Center below title | Short, non-judgmental |
| Exit button | Bottom primary or secondary | Safe exit |
| Support link/button | Bottom secondary | Optional |

State specs:

| State | Specification |
|-------|---------------|
| Default | No route into core app |
| Support path | Exit/support flow |

Spacing / alignment:

- Keep visual density low.

Typography:

- Title: H2
- Support copy: Body Small

Color:

- Use `color-error` sparingly for the restriction message.

Audio-first:

- This should feel definitive, not interactive.

#### 1.4 Privacy and Ad Consent

Purpose: Capture privacy and ad consent before sign-in continues.

Layout:

- Top bar with back action
- Consent explanation block
- Consent toggles or checkboxes
- Ad preference choice section
- Bottom action row with Accept and Decline

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Clear, concise |
| Consent explanation | Upper body | Short summary, not legal wall text |
| Privacy checkbox / toggle | Mid body | Required item |
| Ad preference control | Mid body | Personalized vs non-personalized when allowed |
| Accept and Continue | Bottom primary | Full-width |
| Decline and Exit | Bottom secondary | Full-width or text button |

State specs:

| State | Specification |
|-------|---------------|
| Default | Consent choices visible and editable |
| Declined required consent | Block progression |
| Success | Route to Sign In |

Spacing / alignment:

- Group consent controls in a single vertical stack.

Typography:

- Title: H1/H2
- Legal helper copy: Caption

Color:

- Use neutral surfaces with primary action emphasis.

Audio-first:

- Keep legal copy scannable on a small screen.

#### 1.5 Sign In

Purpose: Authenticate through email/password or social sign-in.

Layout:

- Email and password fields stacked vertically
- Social sign-in buttons grouped below
- Forgot password or help link below fields
- Primary Sign In action at the bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | "Sign In" |
| Email input | Upper body | Full-width |
| Password input | Upper body | Full-width, show/hide |
| Social buttons | Mid body | Optional depending on implementation |
| Help link | Lower body | Secondary |
| Sign In button | Bottom primary | Full-width |

State specs:

| State | Specification |
|-------|---------------|
| Loading | Disable controls and show progress |
| Error | Keep inputs in place and show retryable copy |
| Success | Route to Level Selection |

Spacing / alignment:

- Maintain clear separation between credentials and social auth.

Typography:

- Inputs: Body
- Helper copy: Body Small

Color:

- Primary button uses `color-primary`.
- Error text uses `color-error`.

Audio-first:

- Reduce friction with clear focus order and minimal visible text.

#### 1.6 Level Selection

Purpose: Capture proficiency level to seed recommendations.

Layout:

- Short guidance copy at the top
- One selection group of levels in card or chip form
- Continue button at the bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Clear and short |
| Guidance text | Upper body | Short explainer |
| Level cards / picker | Center | Large tap targets |
| Continue button | Bottom primary | Full-width |

State specs:

| State | Specification |
|-------|---------------|
| Default | One level selected |
| Error | Highlight missing or invalid selection |
| Success | Route to Reminder Setup |

Spacing / alignment:

- Use comfortable vertical spacing between level choices.

Typography:

- Title: H1
- Levels: H3 or Body Emphasis

Color:

- Selected card uses `color-primary` tint or border emphasis.

Audio-first:

- Keep the decision simple and fast.

#### 1.7 Reminder Setup

Purpose: Set reminder time and enable state during onboarding.

Layout:

- Reminder explanation at the top
- Toggle and time picker in the center
- Continue or skip reminder actions at the bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Short |
| Reminder explainer | Upper body | Mention local device schedule |
| Toggle | Mid body | On/off control |
| Time picker | Mid body | Enabled when reminders are on |
| Continue button | Bottom primary | Full-width |
| Skip reminders button | Bottom secondary | Full-width or text |

State specs:

| State | Specification |
|-------|---------------|
| Enabled | Time picker active and visible |
| Disabled | Time picker inactive / hidden |
| Success | Route to Permission Prompts |

Spacing / alignment:

- Keep toggle and time picker visually grouped.

Typography:

- Explainer: Body Small

Color:

- Active reminder state can use `color-secondary` as a supportive accent.

Audio-first:

- Reminders should feel optional and supportive.

#### 1.8 Permission Prompts

Purpose: Handle notification and microphone permissions before the main shell.

Layout:

- Two permission cards stacked vertically
- Each card contains rationale and recovery note
- Continue and Open Settings at the bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | "Permission Prompts" |
| Notification card | Upper body | Includes rationale and status |
| Microphone card | Lower body | Includes rationale and status |
| Continue button | Bottom primary | Full-width |
| Open Settings button | Bottom secondary | Full-width or text |

State specs:

| State | Specification |
|-------|---------------|
| Granted | Card shows granted badge and continue enabled |
| Notification denied | Reminders disabled note visible |
| Microphone denied | Listening-only note visible |

Spacing / alignment:

- Use card grouping with 12 to 16px spacing.

Typography:

- Card titles: H3
- Explanations: Body Small

Color:

- Use badges for granted/denied states, not large full-screen color blocks.

Audio-first:

- The microcopy should explain why permissions matter without sounding alarming.

## 2. Core Daily Practice

#### 2.1 Home / Daily Practice

Purpose: Orient the learner and push the next action.

Layout:

- Hero recommendation card at top
- Streak/progress summary below
- Resume lesson card if applicable
- Secondary shortcuts and bottom tabs below

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top | Home |
| Recommendation card | Upper body | Largest card, primary tap target |
| Streak card | Mid body | High-visibility stats |
| Resume card | Mid body | Conditional |
| Shortcut row | Lower body | Lessons, Downloads, Progress, Settings |
| Bottom tabs | Bottom | Main navigation |

State specs:

| State | Specification |
|-------|---------------|
| Loading | Skeleton cards while progress hydrates |
| Empty | Starter lesson state with guidance |
| Offline | Cached recommendation and local-state copy |
| Error | Retryable hydration / sync issue |

Spacing / alignment:

- Make the hero card span full width.
- Keep cards vertically spaced at 12 to 16px.

Typography:

- Recommendation: H2/H3
- Streak number: Display or H1
- Secondary labels: Body Small

Color:

- Recommendation card can use a subtle accent strip.
- Streak or progress accents may use `color-secondary`.

Audio-first:

- This screen must answer “What should I do next?” immediately.

#### 2.2 Lesson Catalog

Purpose: Browse and filter lessons quickly.

Layout:

- Recommendation strip at top
- Filter chips row beneath
- Scrollable lesson list
- Bottom tabs fixed

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Lesson Catalog |
| Recommendation strip | Upper body | Optional |
| Filter chips | Below header | Level, topic, duration |
| Lesson cards | Main list | Repeating content blocks |
| Bottom tabs | Bottom | Main navigation |

State specs:

| State | Specification |
|-------|---------------|
| Loading | List skeletons and filter placeholders |
| Empty | “No lessons found” empty state |
| Offline | Cached lessons shown with offline note |
| Error | Retryable catalog error |

Spacing / alignment:

- Chips should be horizontally scrollable if needed.
- Lesson cards should maintain consistent height in a list.

Typography:

- Lesson title: H3
- Metadata: Body Small / Caption

Color:

- Filter chips use neutral fill with primary selected state.

Audio-first:

- Keep scanning fast: lesson cards should present level, topic, and duration first.

#### 2.3 Lesson Detail

Purpose: Let the learner confirm a lesson and start or download it.

Layout:

- Lesson summary at top
- Metadata block beneath
- Action area with Start and Download

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Lesson name or title |
| Lesson summary | Upper body | Level, topic, duration |
| Description | Mid body | Short paragraph |
| Start practice button | Bottom primary | Prominent |
| Download button | Bottom secondary | Visible and secondary |

State specs:

| State | Specification |
|-------|---------------|
| Default | Show lesson metadata and actions |
| Stale lesson | Replace or disable primary action |
| Downloaded | Show downloaded badge |
| Error | Failed asset load state |

Spacing / alignment:

- Keep the lesson title and summary at the top.

Typography:

- Title: H1/H2
- Metadata: Body Small

Color:

- Primary action: `color-primary`
- Downloaded badge: `color-success`

Audio-first:

- The start action must be visually dominant.

#### 2.4 Practice Session

Purpose: Support audio playback, shadowing, and recording with minimal interaction.

Layout:

- Compact header with lesson title, timer, and progress
- Large center play/pause/resume control
- Mic indicator and cue text below
- Bottom action strip for repeat, pause, and finish

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title / timer / progress | Top | Compact |
| Large audio control | Center | Largest touch target |
| Mic indicator | Lower center | Idle / recording / processing |
| Cue text / script snippet | Lower center | Optional, minimal |
| Action strip | Bottom | Repeat, pause, finish |

State specs:

| State | Specification |
|-------|---------------|
| Loading | Show buffering / audio-loading state |
| Playing | Active audio state |
| Paused | Resume CTA visible |
| Recording | Mic active, visual recording state |
| Error | Retryable load or recording error |
| Offline | Local downloaded content indicator |

Spacing / alignment:

- Center the main control.
- Keep the bottom action strip fixed and spaced apart.

Typography:

- Timer: Audio Label or Body Emphasis
- Cue text: Body Small

Color:

- Playing state can use `color-primary`.
- Recording state can use `color-error` or `color-secondary` for clear distinction.

Audio-first:

- The screen should be optimized for glancing, not reading.

#### 2.5 Practice Session State Variants

Loading state:

| Element | Spec |
|---------|------|
| Progress | Skeleton or thin progress line |
| Controls | Disabled, muted |
| Copy | “Loading lesson audio…” |

Error state:

| Element | Spec |
|---------|------|
| Message | “Unable to load lesson” |
| CTA | Retry current lesson |
| Secondary | Return to catalog |

Offline state:

| Element | Spec |
|---------|------|
| Badge | “Offline practice available” |
| CTA | Continue |

#### 2.6 Recording Comparison

Purpose: Let the learner compare their recording with the reference audio and move on quickly.

Layout:

- Recording availability status at top
- Playback mode selector in the middle
- Playback controls beneath
- Continue / skip / repeat actions at bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Recording Comparison |
| Recording status | Upper body | Available / missing |
| Mode selector | Mid body | Reference / recording / side-by-side |
| Playback controls | Lower body | Large and obvious |
| Continue button | Bottom primary | Default exit |
| Skip comparison button | Bottom secondary | Important optional path |
| Repeat session button | Bottom secondary | Optional |

State specs:

| State | Specification |
|-------|---------------|
| Default | Comparison controls visible |
| Recording missing | Retry-oriented error |
| Sync unavailable | Fallback to separate modes |
| Skip | Continue to Home or Progress |

Spacing / alignment:

- Keep the mode selector large enough to tap confidently.

Typography:

- Mode labels: Body Emphasis
- Notes: Body Small

Color:

- Active mode uses `color-primary`.
- Skip action stays neutral.

Audio-first:

- Comparison must be optional and easy to dismiss.

#### 2.7 Progress View

Purpose: Show streak and history without overwhelming the learner.

Layout:

- Streak summary at the top
- Practice minutes and completion metrics below
- Recent sessions list under metrics
- Sync note and action buttons at the bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Progress View |
| Streak summary | Upper body | Largest metric |
| Practice stats | Mid body | Minutes / completions |
| Recent sessions | Lower body | List or cards |
| Start a lesson button | Bottom primary | Returns to practice |
| View downloads button | Bottom secondary | Optional |

State specs:

| State | Specification |
|-------|---------------|
| Loading | Hydrating local and synced data |
| Empty | No-history starter state |
| Sync pending | Queue note / retry label |
| Error | Preserve local progress and retry |

Spacing / alignment:

- Keep streak metrics visually dominant.

Typography:

- Streak number: Display or H1
- Stats: H3 / Body Emphasis

Color:

- Success and progress accents may use `color-success` or `color-secondary`.

Audio-first:

- Keep this screen as support content, not a distraction.

## 3. Offline and Return Paths

#### 3.1 Downloaded Lessons / Offline Library

Purpose: Show downloaded lessons and their offline readiness.

Layout:

- Storage summary at top
- Downloaded lesson cards in the main list
- Manage downloads action at bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Downloaded Lessons / Offline Library |
| Storage summary | Upper body | Remaining space and quota |
| Downloaded cards | Main list | Each with status badge |
| Open lesson button | Per card or bottom | Primary on selection |
| Manage downloads button | Bottom secondary | Optional |

State specs:

| State | Specification |
|-------|---------------|
| Empty | No downloaded lessons |
| Offline | Fully functional locally |
| Invalid | Block playback and suggest another download |
| Error | Storage / verification recovery |

Spacing / alignment:

- Cards should clearly show status and action.

Typography:

- Lesson title: H3
- Status: Caption / Body Small

Color:

- Downloaded status uses `color-success`.
- Stale or invalid uses `color-warning` or `color-error`.

Audio-first:

- Open lesson should be the most obvious interaction.

#### 3.2 Offline Practice Session

Purpose: Keep practice flowing without connectivity.

Layout:

- Offline badge and lesson title at top
- Large audio control in center
- Recording status and minimal cue text below
- Finish/save controls at bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Offline badge | Top | Visible state marker |
| Lesson title | Top | Short and prominent |
| Audio control | Center | Large touch target |
| Recording status | Lower center | Idle / recording |
| Finish button | Bottom primary | Save progress |

State specs:

| State | Specification |
|-------|---------------|
| Offline available | Normal operation |
| Authorization invalid | Block and suggest another download |
| Sync queued | Save locally |

Spacing / alignment:

- Keep layout nearly identical to online practice to reduce mode switching friction.

Typography:

- Badge: Caption / Body Emphasis

Color:

- Offline badge can use `color-warning` or `color-info` depending on state.

Audio-first:

- Offline mode should feel like a natural continuation of practice.

#### 3.3 Local Reminder Notification

Purpose: Return the learner to Home or Daily Practice.

Layout:

- OS-native notification with title, short message, and tap action

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Notification title | OS surface | Direct and short |
| Notification body | OS surface | One sentence |
| Tap action | Entire card | Opens Home |

State specs:

| State | Specification |
|-------|---------------|
| Delivered | Route to Home |
| Dismissed | No navigation |

Audio-first:

- Reminder should minimize friction and return the learner to a practice decision fast.

## 4. Settings and Control

#### 4.1 Settings

Purpose: Control center for app preferences and account actions.

Layout:

- Simple grouped list of settings categories
- Bottom tabs remain visible

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Settings |
| Settings groups | Main list | Tappable rows |
| Bottom tabs | Bottom | Main nav |

State specs:

| State | Specification |
|-------|---------------|
| Default | All categories visible |
| Offline | Local settings available |
| Error | Preserve list and show recovery if needed |

Spacing / alignment:

- Use grouped sections with clear dividers.

Typography:

- Row title: Body Emphasis
- Description: Body Small

Color:

- Use neutral lists with primary accents only for active states.

Audio-first:

- Settings should be accessible but subordinate to practice.

#### 4.2 Reminder Settings

Purpose: Edit reminder time and enable state.

Layout:

- Current status at top
- Time picker and toggle in the center
- Save and disable actions at bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Reminder Settings |
| Status copy | Upper body | Permission and enabled state |
| Toggle | Mid body | Enable / disable reminders |
| Time picker | Mid body | Active when reminders are on |
| Save button | Bottom primary | Full-width |
| Disable button | Bottom secondary | Full-width or text |

State specs:

| State | Specification |
|-------|---------------|
| Permission denied | Recovery note and settings shortcut |
| Disabled | Schedule canceled |
| Success | Return to Settings or Home |

Typography:

- Status copy: Body Small

Color:

- Use `color-secondary` sparingly for reminder emphasis.

#### 4.3 Consent Settings

Purpose: Review or change privacy and ad consent.

Layout:

- Status summary at top
- Privacy and ad consent controls in the middle
- Save button at the bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Consent Settings |
| Status summary | Upper body | Current consent state |
| Privacy control | Mid body | Toggle / checkbox |
| Ad consent control | Mid body | Toggle / radio set |
| Save button | Bottom primary | Full-width |

State specs:

| State | Specification |
|-------|---------------|
| Default | Show current stored choices |
| Withdrawn consent | Prevent personalized ad requests |
| Success | Persist immediately |

Typography:

- Helper copy: Caption / Body Small

Color:

- Neutral layout with primary accent on active controls.

#### 4.4 Playback Settings

Purpose: Adjust audio playback speed and related listening preferences.

Layout:

- Speed selector with labeled steps
- Optional explanatory note
- Save and reset actions

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Playback Settings |
| Speed selector | Main body | Stepper, segmented control, or slider with labels |
| Explanation note | Lower body | Short |
| Save button | Bottom primary | Full-width |
| Reset button | Bottom secondary | Full-width |

State specs:

| State | Specification |
|-------|---------------|
| Default | Current speed selected |
| Invalid value | Reject and retain current speed |
| Success | Apply on future playback |

Typography:

- Speed value: Body Emphasis or H3

Color:

- Active step uses `color-primary`.

#### 4.5 Profile Settings

Purpose: Update profile fields and learner preferences.

Layout:

- Simple editable form
- Account summary near the top
- Save and cancel actions at the bottom

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Profile Settings |
| Profile fields | Main body | Limited to necessary fields |
| Account summary | Upper body | Email / level overview |
| Save button | Bottom primary | Full-width |
| Cancel button | Bottom secondary | Full-width |

State specs:

| State | Specification |
|-------|---------------|
| Default | Fields editable |
| Validation error | Inline field errors |
| Success | Return to Settings |

Typography:

- Field labels: Body Small
- Values: Body

#### 4.6 Recording Library

Purpose: Manage saved recordings.

Layout:

- Recording list with status
- Play and delete actions per item
- Back to settings action

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Recording Library |
| Recording list | Main body | Cards or rows |
| Play button | Per item | Secondary action |
| Delete button | Per item | Destructive |
| Back to settings | Bottom secondary | Optional |

State specs:

| State | Specification |
|-------|---------------|
| Empty | No recordings state |
| Synced delete | Queue remote deletion |
| Error | Retryable delete failure |

Typography:

- Recording metadata: Body Small

Color:

- Delete uses `color-error`.

#### 4.7 Account Management

Purpose: Handle sign out and account deletion.

Layout:

- Account summary and warning copy
- Sign out and delete actions
- Confirmation language prominent

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Top bar | Account Management |
| Account summary | Upper body | Account and status |
| Warning copy | Mid body | Destructive-action caution |
| Sign out button | Bottom secondary | Non-destructive |
| Delete account button | Bottom primary or destructive | Requires confirmation |

State specs:

| State | Specification |
|-------|---------------|
| Confirmed deletion | Remove local data and exit |
| Backend failure | Keep learner signed in and show retryable error |
| Sign out | End session without deleting data |

Typography:

- Warning copy: Body Small

Color:

- Delete action uses `color-error`.

## 5. Recovery and Support

#### 5.1 Retryable Error States

Purpose: Preserve context and offer a clear retry path.

Layout:

- Strong error title
- One-line explanation
- Context-specific action buttons

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Error title | Center | Direct |
| Explanation | Center below | Short |
| Retry button | Bottom primary | Context-specific |
| Recovery link | Bottom secondary | Return / settings / catalog |

State specs:

| State | Specification |
|-------|---------------|
| Audio load failure | Retry current lesson |
| Auth expired | Prompt sign in again |
| Storage full | Free space and retry |
| Network loss | Continue offline where supported |

Typography:

- Error title: H2
- Explanation: Body Small

Color:

- Use `color-error` for the title or accent, not the whole surface.

#### 5.2 Exit / Support Path

Purpose: End a blocked flow safely.

Layout:

- Short closing message
- Support action and exit action

Component inventory:

| Component | Placement | Notes |
|-----------|-----------|-------|
| Title | Center | Exit / Support |
| Message | Center below | Brief and neutral |
| Exit button | Bottom primary | End the flow |
| Support button | Bottom secondary | Optional |

State specs:

| State | Specification |
|-------|---------------|
| Default | End flow without further navigation |

## Ad Placement

### Audio Interstitial Presentation

Ad placement occurs only at session boundaries and should feel like a short overlay, not a separate destination.

Visual treatment:

- Use a compact bottom sheet or centered modal container
- Keep the ad label visible and distinct from the learner controls
- Add a short progress or playback status line
- Only show continue/close after the ad completes or fails

```text
+--------------------------------------------------+
| Audio Interstitial Ad                             |
|--------------------------------------------------|
| Ad label / playback status                        |
| Ad content                                         |
|--------------------------------------------------|
| Continue after completion                          |
+--------------------------------------------------+
```

State specs:

| State | Specification |
|-------|---------------|
| No fill | Skip immediately |
| Offline | Skip immediately |
| Playback failure | Close container and continue |
| Success | Continue to next learner step |

Color:

- Keep ad chrome neutral.
- Do not overpower the learner flow with strong ad branding.

Audio-first:

- Ads must never interrupt practice mid-session.

## Interaction Patterns

### Navigation and Transition Rules

- Use push navigation for stack flows such as Lesson Detail, Practice Session, Comparison, and Settings subsections.
- Use modal or full-screen overlays for onboarding, permission, blocking, and error states.
- Use bottom tabs only on the main shell surfaces.
- Deep-link reminders into Home / Daily Practice.

### Gesture and Control Patterns

- Bottom sheets should dismiss by explicit action, not by accidental swipes, when they contain critical states.
- Practice controls must remain reachable even with one-handed use.
- Destructive actions require confirmation.

### Haptic Feedback

- Use subtle haptics for primary actions such as starting practice, beginning recording, confirming download, and completing a lesson.
- Use stronger feedback for errors, deletion confirmation, and blocked states.

### Loading Patterns

- Home, Catalog, and Progress should use skeletons rather than blank screens.
- Practice should show an audio-loading state instead of a generic spinner wherever possible.
- Downloads should show progress feedback and clear completion states.

### Success Feedback

- Use inline confirmation or brief toast messages for non-blocking completions.
- Keep completion feedback short so the learner can move on.

## Accessibility Considerations

| Area | Requirement |
|------|-------------|
| Contrast | Maintain at least WCAG AA contrast for text and controls |
| Touch targets | Minimum 44pt, with 48pt preferred for audio controls |
| Dynamic type | Support larger text sizes without breaking layout |
| VoiceOver / TalkBack | All controls need clear labels, hints, and states |
| Focus order | Logical top-to-bottom order with primary CTA first |
| Motion reduction | Respect reduced motion preferences |
| Error messaging | Clear, concise, and non-technical |
| Audio controls | Distinct labels for play, pause, resume, finish, and recording |

Accessibility rules:

- Ensure the primary audio control has a descriptive label such as “Play lesson” or “Pause recording.”
- Do not rely on color alone to communicate recording or completion states.
- Preserve the ability to navigate and complete key flows with screen readers.
- Maintain readable line lengths and avoid dense legal paragraphs in onboarding.

## Platform Notes

### iOS

- Use iOS-safe area insets and respect the home indicator.
- Follow iOS conventions for back navigation in stacked screens.
- Bottom sheets may use native sheet presentation where appropriate.
- Keep top bar titles concise and aligned with standard iOS navigation patterns.

### Android

- Respect system gesture areas and back behavior.
- Use Material-style bottom sheets and tabs where appropriate.
- Ensure status bar handling remains clear on dark and light surfaces.
- Keep the bottom tab bar persistent on main shell screens.

### Cross-Platform Guidance

- Keep the shell consistent across platforms even if the top bar or tab styling differs slightly.
- Avoid platform-specific visual divergence that changes the information hierarchy.
- Maintain shared spacing, color, and typography tokens across both platforms.

## Traceability Matrix

| Screen | Wireframe Reference | IA Section | User Flow Reference |
|--------|---------------------|------------|---------------------|
| App Launch | 1.1 | Entry, Compliance, and Onboarding | Onboarding Flow |
| Age Gate | 1.2 | Entry, Compliance, and Onboarding | Onboarding Flow |
| Age Policy Block | 1.3 | Recovery and Support | Cross-Cutting Error and Edge-Case Flows |
| Privacy and Ad Consent | 1.4 | Entry, Compliance, and Onboarding | Onboarding Flow |
| Sign In | 1.5 | Entry, Compliance, and Onboarding | Onboarding Flow |
| Level Selection | 1.6 | Entry, Compliance, and Onboarding | Onboarding Flow |
| Reminder Setup | 1.7 | Entry, Compliance, and Onboarding | Onboarding Flow |
| Permission Prompts | 1.8 | Entry, Compliance, and Onboarding | Onboarding Flow |
| Home / Daily Practice | 2.1 | Core Daily Practice | Returning-User Daily Practice Flow |
| Lesson Catalog | 2.2 | Core Daily Practice | Browse and Select a Lesson Flow |
| Lesson Detail | 2.3 | Core Daily Practice | Browse and Select a Lesson Flow |
| Practice Session | 2.4 / 2.5 | Core Daily Practice | Shadowing Practice Session Flow |
| Recording Comparison | 2.6 | Core Daily Practice | Recording Playback Comparison Flow |
| Progress View | 2.7 | Core Daily Practice | Returning-User Daily Practice Flow |
| Downloaded Lessons / Offline Library | 3.1 | Offline and Return Paths | Offline Lesson Download and Practice Flow |
| Offline Practice Session | 3.2 | Offline and Return Paths | Offline Lesson Download and Practice Flow |
| Local Reminder Notification | 3.3 | Offline and Return Paths | Manage Reminder Notifications Flow |
| Settings | 4.1 | Settings and Control | Settings and Account Management Path |
| Reminder Settings | 4.2 | Settings and Control | Manage Reminder Notifications Flow |
| Consent Settings | 4.3 | Settings and Control | Handle Age Gate and Consent |
| Playback Settings | 4.4 | Settings and Control | Settings and Account Management Path |
| Profile Settings | 4.5 | Settings and Control | Settings and Account Management Path |
| Recording Library | 4.6 | Settings and Control | Settings and Account Management Path |
| Account Management | 4.7 | Settings and Control | Settings and Account Management Path |
| Retryable Error States | 5.1 | Recovery and Support | Cross-Cutting Error and Edge-Case Flows |
| Exit / Support Path | 5.2 | Recovery and Support | Cross-Cutting Error and Edge-Case Flows |
| Audio Interstitial Ad | Ad Placement | Ad Placement | Ad Interstitial Flow |

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-05-13 | UX Design | Initial UI design specification for ShadowSpeak MVP |
