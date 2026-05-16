# ShadowSpeak

> **Turn dead time into speaking practice.** An audio-first English shadowing app for hands-free, screen-off use — practice while commuting, cooking, or walking.

<p align="center">
  <img src="specs/03-ux-ui-design/generated-screens/2.1%20Home%20-%20Daily%20Practice.png" width="220" alt="Home - Daily Practice"/>
  <img src="specs/03-ux-ui-design/generated-screens/2.4%20Practice%20Session.png" width="220" alt="Practice Session"/>
  <img src="specs/03-ux-ui-design/generated-screens/2.6%20Recording%20Comparison.png" width="220" alt="Recording Comparison"/>
</p>

<p align="center">
  <sub>Home → Practice → Compare. The entire speaking workout, eyes-closed.</sub>
</p>

[![Status](https://img.shields.io/badge/status-prototype--planning-yellow)]()
[![Platform](https://img.shields.io/badge/platform-iOS%2016%2B%20%7C%20Android%2010%2B-blue)]()
[![Documentation](https://img.shields.io/badge/docs-20%2B%20specs-green)]()

---

## The Problem

Millions of English learners can read and write well, but **freeze when they need to speak**. Existing apps demand screen time — tapping, swiping, reading — ruling out the pockets of time people actually have: commuting, cooking, walking, exercising.

The shadowing technique — listen to a sentence, repeat it aloud — is proven to build fluency. Yet no mainstream product delivers it as a **zero-screen, hands-free habit**.

## What ShadowSpeak Does

ShadowSpeak turns 10–30 minutes of daily "dead time" into effective speaking practice.

- **Phone in pocket.** Listen to native audio. Repeat aloud. That's the entire loop.
- **No taps during a session.** Lock-screen controls, autoplay, Bluetooth-aware.
- **Works offline.** Download at home, practice anywhere.
- **Always free.** Audio ads at session boundaries (max 2/day). No subscriptions.

> **Current stage:** Product design complete. Architecture planned. Implementation begins next.

---

## What's Included (MVP)

| Area              | Features                                                                                                     | Status      |
| ----------------- | ------------------------------------------------------------------------------------------------------------ | ----------- |
| **Onboarding**    | Age gate, privacy/ad consent, level selection, reminder setup, permission prompts, driving safety disclaimer | **Planned** |
| **Content**       | Daily recommended lesson, filterable catalog (level/topic/duration), 20+ initial sessions, 3–5 new/week      | **Planned** |
| **Audio**         | Screen-off playback, lock-screen controls, Bluetooth handling, autoplay, flexible pause timing               | **Planned** |
| **Practice**      | Voice recording, native vs. user recording comparison, session completion tracking                           | **Planned** |
| **Progress**      | Streaks, total practice time, session history, monthly badges, cloud sync                                    | **Planned** |
| **Offline**       | Download with checksum verification, full offline practice, local progress queue                             | **Planned** |
| **Notifications** | Local daily reminders, streak alerts                                                                         | **Planned** |
| **Monetization**  | Audio interstitial ads at session boundaries (max 2/day), ad-free launch window                              | **Planned** |
| **Settings**      | Playback speed, pause timing, reminder schedule, consent management, account deletion                        | **Planned** |
| **Reliability**   | Graceful error screens for audio load, permission, network loss, storage full, auth expiry                   | **Planned** |

**Out of scope:** Real-time AI scoring, speech recognition, social features, subscriptions, push notifications, advanced personalization.

---

## Screens

### The Practice Loop

Three screens power the core habit. Everything else supports these.

<p align="center">
  <img src="specs/03-ux-ui-design/generated-screens/2.1%20Home%20-%20Daily%20Practice.png" width="200" alt="Home"/>
  <img src="specs/03-ux-ui-design/generated-screens/2.4%20Practice%20Session.png" width="200" alt="Practice"/>
  <img src="specs/03-ux-ui-design/generated-screens/2.6%20Recording%20Comparison.png" width="200" alt="Compare"/>
  <br>
  <sub><b>Home</b> — Streak, recommendation, instant start &nbsp;·&nbsp; <b>Practice</b> — Screen-off audio + recording &nbsp;·&nbsp; <b>Compare</b> — Native vs. your voice</sub>
</p>

### Onboarding

<p align="center">
  <img src="specs/03-ux-ui-design/generated-screens/1.2%20Age%20Gate.png" width="190" alt="Age Gate"/>
  <img src="specs/03-ux-ui-design/generated-screens/1.5%20Sign%20In.png" width="190" alt="Sign In"/>
  <img src="specs/03-ux-ui-design/generated-screens/1.7%20Level%20Selection.png" width="190" alt="Level Selection"/>
  <br>
  <sub>Age gate → Sign-in → Level selection. Compliant first-run in under 3 minutes.</sub>
</p>

### Progress & Offline

<p align="center">
  <img src="specs/03-ux-ui-design/generated-screens/2.7%20Progress%20View.png" width="200" alt="Progress View"/>
  <img src="specs/03-ux-ui-design/generated-screens/3.1%20Downloaded%20Lessons%20-%20Offline%20Library.png" width="200" alt="Offline Library"/>
  <img src="specs/03-ux-ui-design/generated-screens/4.1%20Settings.png" width="200" alt="Settings"/>
  <br>
  <sub><b>Progress</b> — Streaks, history, minutes &nbsp;·&nbsp; <b>Offline</b> — Download, practice anywhere &nbsp;·&nbsp; <b>Settings</b> — Reminders, consent, account</sub>
</p>

### Error States

<p align="center">
  <img src="specs/03-ux-ui-design/generated-screens/5.1%20Retryable%20Error%20States.png" width="200" alt="Retryable Error"/>
  <img src="specs/03-ux-ui-design/generated-screens/5.1%20Network%20Loss%20Error.png" width="200" alt="Network Loss"/>
  <img src="specs/03-ux-ui-design/generated-screens/Full-Screen%20Ad%20Interstitial%20Presentation.png" width="200" alt="Ad Interstitial"/>
  <br>
  <sub>Contextual error recovery &nbsp;·&nbsp; Network loss handling &nbsp;·&nbsp; Non-blocking ad at session boundary</sub>
</p>

---

## How It Works

```
Launch → Age Gate → Consent → Sign-In → Onboarding → Home
                                                        │
                                          ┌─────────────┼──────────────┐
                                          ▼             ▼              ▼
                                     Lesson Catalog  Practice      Progress
                                          │             │              │
                                          ▼             ▼              ▼
                                     Lesson Detail  Recording     History &
                                                     Comparison    Streaks
                                          │             │
                                          ▼             ▼
                                     Download /   Session
                                     Offline      Complete → Ad → Home
```

1. **Compliance & auth** — Age gate, consent, sign-in (email or Google/Apple)
2. **One-tap setup** — Choose your level, set a reminder time
3. **Daily practice** — Home screen shows today's recommended lesson
4. **Shadow** — Audio plays, you repeat aloud, recording captures locally, screen stays off
5. **Compare** — Play back your recording alongside the native audio
6. **Track** — Streaks, minutes, history sync to the cloud
7. **Repeat** — Fresh recommendation + reminder notification the next day

---

## Technical Direction

| Layer       | Decision                        | Rationale                                                                        |
| ----------- | ------------------------------- | -------------------------------------------------------------------------------- |
| **Client**  | React Native + TypeScript       | One codebase for iOS & Android. Native audio modules for background playback.    |
| **Backend** | Python FastAPI on AWS Lambda    | Modular single deployment. Serverless scaling. No microservice overhead in MVP.  |
| **Data**    | Amazon DynamoDB (single-table)  | Low-latency, serverless. Two secondary indexes for catalog and session history.  |
| **Auth**    | Amazon Cognito                  | Managed OAuth 2.0 / PKCE. JWT tokens. Social provider support built in.          |
| **Content** | S3 + CloudFront CDN             | Signed URLs for secure audio delivery. Checksum-verified downloads.              |
| **Offline** | Encrypted SQLite (device-local) | Local-first writes. Queued sync on reconnect. No data loss without network.      |
| **Ads**     | AdMob SDK (client-side only)    | Audio interstitials at session boundaries. Consent-aware. No backend ad serving. |

### Key Tradeoffs

- **No real-time AI in MVP.** AI generates scripts and TTS offline. Zero per-user compute cost during practice. Feedback is self-comparison, not automated scoring.
- **Offline-first, not cloud-first.** Sessions write locally, sync when possible. Works in airplane mode and spotty networks.
- **Ad-supported, not freemium.** No subscriptions. No paywalls. Monetization never interrupts the practice flow.
- **One backend, not microservices.** Logical modules (Auth, Content, Sessions) stay in one deployable. Easy to extract later.

---

## Status & Roadmap

| Area                                    | Status                  |
| --------------------------------------- | ----------------------- |
| Product specs, user stories, use cases  | ✅ Complete             |
| UX/UI design (40+ screens, flows, spec) | ✅ Complete             |
| Architecture, API spec, database design | ✅ Complete             |
| Effort estimation (730h / ~91 man-days) | ✅ Complete             |
| Backend implementation                  | 🔄 Scaffold             |
| Mobile client implementation            | 🔄 Scaffold             |
| API mock server                         | ✅ `helper/mockserver/` |
| Content pipeline                        | 🔄 Manual / semi-manual |

| Phase           | Timeline   | Focus                                                                           |
| --------------- | ---------- | ------------------------------------------------------------------------------- |
| **Prototype**   | Weeks 1–4  | Audio playback spike, background audio validation, device matrix testing        |
| **Beta**        | Weeks 5–8  | Internal beta (50–100 users), retention and crash data, ad-tolerance testing    |
| **Soft Launch** | Weeks 9–12 | APAC release (Vietnam), organic acquisition via ASO & content marketing         |
| **Hard Launch** | Month 4+   | Paid acquisition (Apple Search Ads, Google Ads, TikTok), scale toward 1,000 DAU |

### Success Gates

- 1,000 DAU by month 3
- ≥25% 7-day retention
- ≥5 day average streak
- ≥60 min practice/user/month
- ≥$13 gross ad revenue per 1k MAU

---

## Design Principles

- **Audio-first, screen-last.** The phone stays in the pocket. Every feature works with minimal visual attention.
- **Frictionless habit.** 5–15 minute sessions. One tap to practice. No login required to browse.
- **Compliance by design.** Age gate, consent, and driving disclaimer are built into the first-run flow, not bolted on.
- **Offline is first-class.** Lessons download. Progress queues locally. The app never breaks without a network.
- **Ads should not feel like ads.** Audio interstitials at session boundaries. Never mid-sentence. Never interrupting flow.

---

## Repository Map

```
specs/                          # Product & technical documentation
  00-reference/                 Development lifecycle checklist
  01-initiation-discovery/      BRD, PDD, business requirements
  02-analysis/                  AS-IS, TO-BE, FRS, NFR, use cases, user stories
  03-ux-ui-design/              Flows, IA, wireframes, UI spec, 40+ mockups
  04-solution-architecture/     SAD, HLD, LLD (backend + mobile), API spec, DB design, mobile storage
  05-development/               MVP implementation plan (~254h, 5 epics)

backend/                        Backend scaffold (FastAPI)
front-end/                      Mobile client scaffold (React Native)
helper/mockserver/              API mock server for local development
```

<p align="center">
  <sub>Designed, specified, and estimated. Ready to build.</sub>
</p>
