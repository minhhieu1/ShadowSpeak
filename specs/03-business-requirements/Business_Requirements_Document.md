# Business Requirements Document

**Project:** ShadowSpeak (Audio‑first English Shadowing Practice)
**Document Type:** Business Requirements Document
**Date:** 2026-05-11
**Status:** Draft
**Version:** 1.0

---

## 1. Business Objectives

| # | Objective | Strategic Rationale |
|---|---|---|
| OBJ‑1 | Validate that users form a daily speaking‑practice habit through audio‑first, hands‑free interaction | Core hypothesis; habit drives retention and ad revenue. |
| OBJ‑2 | Demonstrate ad‑supported monetisation can sustain the content pipeline and infrastructure | Proves the business model is capital‑efficient. |
| OBJ‑3 | Prove shadowing can be delivered effectively without real‑time AI or speech recognition | Keeps per‑user compute cost near‑zero, enabling scale. |
| OBJ‑4 | Establish a repeatable content‑generation pipeline (AI script + TTS) producing 3‑5 fresh sessions per week | Content variety is a primary driver of engagement. |
| OBJ‑5 | Reach 1,000 DAU by month 3 with unit‑economics projecting profitability at ~45 k‑75 k MAU (depending on realised CPM) | Defines the scale gate for further investment. |

## 2. Scope

**In‑Scope**
- User authentication (email/password, Google/OAuth, JWT session)
- On‑boarding flow with level selection and hands‑free permissions
- Practice library with daily recommended session and rotating content
- Audio experience supporting screen‑off playback, lock‑screen controls, Bluetooth handling, and audio ducking
- Progress tracking (streaks, total practice time, session history)
- Settings (playback speed, reminder schedule, account deletion)
- Local daily reminder notifications
- Audio‑ad monetisation at session boundaries (pre‑/post‑session, inter‑session)

**Out of Scope**
- Real‑time AI pronunciation feedback or speech recognition
- Social/community features, leaderboards, user‑generated content
- Subscription or premium tiers
- Push notifications from a server side
- Advanced personalization or content filtering

## 3. Key Performance Indicators (KPIs)

| KPI | Target |
|---|---|
| Daily Active Users (DAU) | 1,000 by end of month 3 |
| 7‑day retention | ≥ 25 % |
| Average streak length | ≥ 5 days |
| Practice minutes per user / month | ≥ 60 min |
| Gross ad revenue per 1k MAU / month | ≥ $13 |

## 4. Stakeholders

| Role | Name / Title | Responsibility |
|---|---|---|
| Product Owner | – | Scope ownership & acceptance |
| Engineering Lead | – | Technical feasibility & delivery |
| Marketing Lead | – | Go‑to‑market & acquisition |
| Finance / Leadership | – | Budget approval & KPI sign‑off |

## 5. Business Process (High‑level Workflow)

1. **Onboarding** – User creates account, selects proficiency level, grants audio‑background permission.
2. **Daily Recommendation** – Home screen shows a single recommended session (5‑15 min).
3. **Audio Playback** – User starts session; playback continues with screen off; lock‑screen controls allow pause/play.
4. **Progress Capture** – Streak and practice time are recorded in real time.
5. **Ad Insertion** – An audio ad is played at the session boundary (pre/post or inter‑session).
6. **Repeat Next Day** – Notification prompts the user for the next day’s session.

## 6. Constraints

- **Technical**: React Native front‑end; AWS serverless back‑end; no real‑time AI; background audio must work on iOS 16+ and Android 10+.
- **Regulatory**: Driving‑safety disclaimer, App Store compliance, COPPA/GDPR‑K age‑gate (13+).
- **Budgetary**: Approx. $1,050 / month infrastructure cost.
- **Timeline**: 4 phases over ~3 months (prototype, beta, soft launch, hard launch).

## 7. Assumptions

- Users will adopt the habit when friction is removed (hands‑free sessions).
- Audio ads at 1‑2 per day are tolerable and do not materially harm retention.
- Background playback works reliably across target OS versions.
- AI‑generated scripts + TTS provide speaker‑native quality sufficient for learning.
- $15‑25 CPM is achievable with selected ad networks.

## 8. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Users do not form a daily habit | High | High | Short sessions, streak mechanics, daily reminders, badge incentives |
| Audio ads reduce retention | High | Medium | Limit to ≤ 2 ads/day, monitor cohort retention, adjust frequency quickly |
| Background playback failures | High | Medium | Early technical spike (week 1), extensive device testing, graceful fallback messaging |
| Content pipeline stalls | Medium | Medium | Robust prompt engineering, multiple TTS voices, manual backup content creation |
| Insufficient ad inventory / CPM | High | High | Ad‑free launch window; use multiple ad networks; fallback to low‑revenue display ads |
| Regulatory issues around driving safety | Medium | Medium | Prominent safety disclaimer, limit visual interaction during playback, legal review |

## 9. Go‑to‑Market Strategy

**Phase 1 – Organic (Months 1‑2)**
- App Store Optimization (keywords in English & Vietnamese)
- Content marketing via short videos demonstrating the shadowing technique
- Community outreach to Vietnamese ESL micro‑influencers

**Phase 2 – Paid Acquisition (Month 3+)**
- Apple Search Ads, Google Ads (Search + YouTube), TikTok ads
- Monthly ad spend $2,000‑$5,000 targeting 13‑35 yr learners in APAC
- Referral programme: streak‑freeze reward for each successful invite

## 10. Glossary

| Term | Definition |
|---|---|
| Shadowing | Listen to a sentence, then immediately repeat it aloud, mimicking intonation and rhythm |
| CPM | Cost per mille – revenue per 1,000 ad impressions |
| MAU | Monthly Active Users |
| DAU | Daily Active Users |
| Streak Freeze | Allows a user to miss one day without breaking a consecutive‑day streak |
| Audio Ducking | Reducing background music volume while voice audio plays |

---

*This document is self‑contained and expands on the Business Request Document, providing a structured set of requirements for the ShadowSpeak MVP.*