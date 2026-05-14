# ShadowSpeak

> **Turn dead time into speaking practice.** An audio-first English shadowing app designed for hands-free, screen-off use — practice while commuting, cooking, or walking.

[![Status](https://img.shields.io/badge/status-prototype--planning-yellow)]()
[![Platform](https://img.shields.io/badge/platform-iOS%2016%2B%20%7C%20Android%2010%2B-blue)]()
[![License](https://img.shields.io/badge/license-proprietary-lightgrey)]()

---

## Overview

ShadowSpeak is a mobile application that helps English learners improve speaking fluency through the **shadowing technique** — listening to a native-speaker sentence and immediately repeating it aloud. Unlike every mainstream language app, ShadowSpeak is designed for **zero-screen, hands-free practice**: the phone stays in your pocket or on its mount while you listen, repeat, and progress through a session.

The product targets the millions of English learners in APAC markets (starting with Vietnam) who have 10–30 minutes of daily "dead time" — commuting, exercising, doing chores — that could be converted into productive speaking practice.

**Current stage:** Prototype / planning. All documentation, UX mockups, and architecture designs are complete. No production code is committed.

---

## Problem Statement

- Learners can read and listen well but **freeze when required to speak**.
- Existing language apps demand visual interaction, preventing use during low-attention moments.
- The shadowing technique is proven in interpreter training but **unavailable as a mainstream mobile product**.
- No app delivers a zero-screen, audio-only speaking practice experience that fits into daily routines.

## Product Vision

Create a **daily speaking habit loop** that fits into existing routines — as habitual as checking your morning playlist, but as effective as a personal pronunciation coach. Deliver it at scale through an ad-supported model, making high-quality speaking practice accessible to everyone.

---

## Core Features (MVP)

| Feature                        | Description                                                                       | Status      |
| ------------------------------ | --------------------------------------------------------------------------------- | ----------- |
| **Hands-free onboarding**      | Age gate, privacy/ad consent, level selection, reminder setup, permission prompts | **Planned** |
| **Daily recommended lesson**   | 5–15 min audio session, refreshed daily                                           | **Planned** |
| **Lesson catalog**             | Filter by level, topic, duration; paginated browsing                              | **Planned** |
| **Audio playback & recording** | Screen-off playback, lock-screen controls, Bluetooth handling, autoplay           | **Planned** |
| **Recording comparison**       | Side-by-side playback of native audio vs. user recording                          | **Planned** |
| **Progress tracking**          | Streaks, total practice time, session history, monthly badges                     | **Planned** |
| **Offline downloads**          | Download lessons for practice without connectivity                                | **Planned** |
| **Local notifications**        | Daily practice reminders, streak alerts                                           | **Planned** |
| **Ad-supported monetization**  | Audio interstitial ads at session boundaries (max 2/day)                          | **Planned** |
| **Error handling**             | Graceful fallback for audio load, permission, network, storage failures           | **Planned** |

**Out of scope for MVP:** Real-time AI pronunciation feedback, social features, subscriptions, push notifications, advanced personalization.

---

## UX/UI Showcase

The complete MVP interaction model has been designed across **40+ screens**, covering onboarding, core practice, offline mode, settings, error states, and ad presentation.

### Onboarding Flow

A compliant, low-friction first-run experience that handles age verification, consent, authentication, and preference setup in under 3 minutes.

|                                                                                                          |                                                                                                                    |                                                                                                                  |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| <img src="specs/03-ux-ui-design/generated-screens/1.1%20App%20Launch.png" width="200" alt="App Launch"/> | <img src="specs/03-ux-ui-design/generated-screens/1.2%20Age%20Gate.png" width="200" alt="Age Gate"/>               | <img src="specs/03-ux-ui-design/generated-screens/1.5%20Sign%20In.png" width="200" alt="Sign In"/>               |
| **App Launch** — Startup state routing to onboarding or home                                             | **Age Gate** — Age verification before account creation                                                            | **Sign In** — Email/password or social OAuth                                                                     |
| <img src="specs/03-ux-ui-design/generated-screens/1.6%20Sign%20Up.png" width="200" alt="Sign Up"/>       | <img src="specs/03-ux-ui-design/generated-screens/1.7%20Level%20Selection.png" width="200" alt="Level Selection"/> | <img src="specs/03-ux-ui-design/generated-screens/1.8%20Reminder%20Setup.png" width="200" alt="Reminder Setup"/> |
| **Sign Up** — Account creation with validation                                                           | **Level Selection** — Beginner / Intermediate / Advanced                                                           | **Reminder Setup** — Daily practice notification scheduling                                                      |

### Core Practice Loop

The heart of the product: a home-centered daily practice flow designed for minimal taps and maximum audio-led interaction.

|                                                                                                                                    |                                                                                                                              |                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| <img src="specs/03-ux-ui-design/generated-screens/2.1%20Home%20-%20Daily%20Practice.png" width="200" alt="Home - Daily Practice"/> | <img src="specs/03-ux-ui-design/generated-screens/2.2%20Lesson%20Catalog.png" width="200" alt="Lesson Catalog"/>             | <img src="specs/03-ux-ui-design/generated-screens/2.3%20Lesson%20Detail.png" width="200" alt="Lesson Detail"/> |
| **Home / Daily Practice** — Streak, recommendation, and quick-start                                                                | **Lesson Catalog** — Filterable lesson library                                                                               | **Lesson Detail** — Metadata, start, and download actions                                                      |
| <img src="specs/03-ux-ui-design/generated-screens/2.4%20Practice%20Session.png" width="200" alt="Practice Session"/>               | <img src="specs/03-ux-ui-design/generated-screens/2.6%20Recording%20Comparison.png" width="200" alt="Recording Comparison"/> | <img src="specs/03-ux-ui-design/generated-screens/2.7%20Progress%20View.png" width="200" alt="Progress View"/> |
| **Practice Session** — Audio-led, screen-off capable                                                                               | **Recording Comparison** — Side-by-side native vs. user playback                                                             | **Progress View** — Streaks, history, and practice minutes                                                     |

### Settings & Account Management

A consolidated settings suite covering reminders, consent, playback preferences, profile, and account lifecycle.

|                                                                                                                      |                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| <img src="specs/03-ux-ui-design/generated-screens/4.1%20Settings.png" width="200" alt="Settings"/>                   | <img src="specs/03-ux-ui-design/generated-screens/4.2%20Reminder%20Settings.png" width="200" alt="Reminder Settings"/>   |
| **Settings Hub** — Central control center                                                                            | **Reminder Settings** — Notification schedule management                                                                 |
| <img src="specs/03-ux-ui-design/generated-screens/4.5%20Profile%20Settings.png" width="200" alt="Profile Settings"/> | <img src="specs/03-ux-ui-design/generated-screens/4.7%20Account%20Management.png" width="200" alt="Account Management"/> |
| **Profile Settings** — Display name, level, preferences                                                              | **Account Management** — Sign-out, deletion with 30-day grace                                                            |

### Error & Recovery States

Every critical failure mode has a dedicated recovery screen — audio load failures, permission issues, network loss, storage full, and authentication expiry.

|                                                                                                                                    |                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| <img src="specs/03-ux-ui-design/generated-screens/5.1%20Retryable%20Error%20States.png" width="200" alt="Retryable Error States"/> | <img src="specs/03-ux-ui-design/generated-screens/5.1%20Network%20Loss%20Error.png" width="200" alt="Network Loss Error"/> |
| **Retryable Error States** — Contextual recovery surfaces                                                                          | **Network Loss** — Graceful offline fallback                                                                               |

### Monetization

|                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="specs/03-ux-ui-design/generated-screens/Full-Screen%20Ad%20Interstitial%20Presentation.png" width="200" alt="Ad Interstitial"/> |
| **Audio Ad Interstitial** — Non-blocking ad at session boundaries                                                                         |

---

## Product Workflow

```
Launch → Age Gate → Consent → Sign-In → Level Selection → Reminder Setup
                                                                    ↓
                              ┌─────────────────────────────────────┘
                              ▼
                    Home / Daily Practice
                              │
                    ┌─────────┼──────────┐
                    ▼         ▼          ▼
            Lesson Catalog  Practice   Progress
                    │         │          │
                    ▼         ▼          ▼
            Lesson Detail  Recording   History &
                           Comparison  Streaks
                    │         │
                    ▼         ▼
              Download /   Session
              Offline      Complete → Ad → Home
```

1. **Compliance** — Age gate, privacy/ad consent, driving safety disclaimer
2. **Authentication** — Email/password or Google/Apple OAuth (JWT session)
3. **Onboarding** — Proficiency level, daily reminder, microphone permission
4. **Daily Practice** — Home screen shows today's recommended lesson
5. **Practice Session** — Audio plays while user shadows; recording captured locally
6. **Session Completion** — Audio ad interstitial → optional recording comparison
7. **Progress Sync** — Metrics synced to cloud; streak and total time updated
8. **Repeat** — Next-day recommendation + local reminder notification

---

## Architecture Direction

| Layer                | Technology (Planned)                    | Rationale                                                                              |
| -------------------- | --------------------------------------- | -------------------------------------------------------------------------------------- |
| **Mobile Client**    | React Native + TypeScript               | Single codebase for iOS 16+ and Android 10+; native audio APIs for background playback |
| **API Edge**         | Amazon API Gateway                      | REST JSON over HTTPS; rate limiting, JWT validation                                    |
| **Backend**          | Python 3.12 + FastAPI on AWS Lambda     | Modular single-deployment backend; Pydantic validation; serverless scaling             |
| **Authentication**   | Amazon Cognito                          | OAuth 2.0 / PKCE; JWT with RSA-256; social provider support                            |
| **Operational Data** | Amazon DynamoDB (single-table + 2 GSIs) | Low-latency, serverless; user-scoped queries and lesson catalog access                 |
| **Content Delivery** | Amazon S3 + CloudFront                  | CDN-backed audio asset delivery; signed URLs for secure access                         |
| **Offline Storage**  | Encrypted SQLite (device-local)         | Local-first queue for progress sync; checksum-verified lesson cache                    |
| **Monetization**     | AdMob SDK (client-side)                 | Audio interstitial ads at session boundaries; consent-aware                            |
| **Observability**    | CloudWatch Logs + Crashlytics/Sentry    | Structured logging, alarms, crash reporting                                            |
| **CI/CD**            | AWS CDK / Terraform + GitHub Actions    | Infrastructure as Code; automated backend deploys; staged mobile releases              |

### Key Architectural Decisions

- **No real-time AI in MVP** — AI is used offline only for content generation (TTS, script writing). Keeps per-user compute cost near-zero.
- **Local-first sync** — Practice sessions and recordings are written locally first, then synced. Supports offline practice and queued retry.
- **Single modular backend** — One deployment with logical domain modules (Auth, Content, Session/Progress) avoids premature microservice fragmentation.
- **Ad-supported only** — No subscriptions in MVP. Audio ads at natural session boundaries (max 2/day) with an ad-free launch window.

---

## Repository Structure

```
├── specs/                          # Complete product & technical documentation
│   ├── 00-reference/               # Development lifecycle checklist
│   ├── 01-initiation-discovery/    # BRD, PDD, Business Requirements
│   ├── 02-analysis/                # AS-IS, TO-BE, FRS, NFR, Use Cases, User Stories
│   ├── 03-ux-ui-design/            # User flows, IA, wireframes, UI spec, prototype
│   │   └── generated-screens/      # 40+ UI mockups (onboarding, practice, settings, errors)
│   ├── 04-solution-architecture/   # SAD, HLD, LLD, API spec, DB design
│   └── 05-planning/                # Effort estimation (730+ adjusted hours)
├── backend/                        # Backend code scaffold (placeholder)
├── front-end/                      # Front-end code scaffold (placeholder)
├── helper/                         # Development utilities & mock server
│   └── mockserver/                 # API mock server for local development
├── scripts/                        # Build & utility scripts
├── AGENTS.md                       # AI agent customization rules
└── README.md                       # This file
```

---

## Current Development Status

| Area                      | Status                                                                   |
| ------------------------- | ------------------------------------------------------------------------ |
| **Product Documentation** | ✅ Complete — BRD, PDD, BRQ, FRS, NFR, Use Cases, User Stories           |
| **UX/UI Design**          | ✅ Complete — User flows, IA, wireframes, UI spec, 40+ generated screens |
| **Solution Architecture** | ✅ Complete — SAD, HLD, LLD, API spec, DB design                         |
| **Planning**              | ✅ Complete — Effort estimation (730.5 adjusted hours / ~91 man-days)    |
| **Backend Code**          | 🔄 Scaffold only — No production implementation                          |
| **Front-end Code**        | 🔄 Scaffold only — No production implementation                          |
| **API Mock Server**       | ✅ Available — `helper/mockserver/` for local development                |
| **Content Pipeline**      | 🔄 Manual / semi-manual — AI script generation + TTS (offline)           |

---

## Roadmap

| Phase           | Timeline   | Focus                                                                           |
| --------------- | ---------- | ------------------------------------------------------------------------------- |
| **Prototype**   | Weeks 1–4  | Audio playback spike, background audio validation, device testing               |
| **Beta**        | Weeks 5–8  | Internal beta with 20+ lessons; retention, crash, and ad-tolerance data         |
| **Soft Launch** | Weeks 9–12 | Limited APAC release (Vietnam); organic acquisition via ASO & content marketing |
| **Hard Launch** | Month 4+   | Paid acquisition (Apple Search Ads, Google Ads, TikTok); scale to 1,000 DAU     |

### Success Gates

- **1,000 DAU** by end of month 3
- **≥25% 7-day retention**
- **≥5 day** average streak length
- **≥60 min** practice per user per month
- **≥$13 gross ad revenue** per 1k MAU

---

## Design Principles

- **Audio-first, screen-last** — Every screen should work with minimal visual attention. The phone should spend most of its time in the user's pocket.
- **Frictionless habit formation** — Sessions are 5–15 minutes. No login required to browse. One tap to start practice.
- **Compliance by design** — Age gate, privacy consent, and driving safety disclaimer are built into the first-run flow, not bolted on later.
- **Offline as a first-class citizen** — Lessons are downloadable. Progress syncs when connectivity returns. The app never breaks without a network.
- **Ad-supported accessibility** — No paywalls. Audio ads at natural session boundaries. Monetization should never interrupt the practice flow.

---

## Notes

- This repository is in **prototype / planning stage**. All documentation and designs are complete, but no production code has been committed.
- The UI screens in `specs/03-ux-ui-design/generated-screens/` are high-fidelity mockups representing the planned MVP interface.
- The API mock server at `helper/mockserver/` can be used for local front-end development against realistic API responses.
- For detailed technical specifications, see the architecture documents in `specs/04-solution-architecture/`.
- For effort estimates and delivery planning, see `specs/05-planning/01-Effort-Estimation-Document.md`.

---

<p align="center">
  <sub>Built with research, design, and planning. Production implementation begins next.</sub>
</p>
