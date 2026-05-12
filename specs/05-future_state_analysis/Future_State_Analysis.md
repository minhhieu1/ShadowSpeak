# Future State Analysis (TO-BE Process)

**Project:** ShadowSpeak (Audio-first English Shadowing Practice)
**Document Type:** Future State Analysis / TO-BE Process
**Date:** 2026-05-11
**Status:** Draft
**Version:** 1.0

---

## 1. Executive Summary

This document describes the envisioned future state of ShadowSpeak after the MVP phase has validated core business hypotheses and established a sustainable user base. The post-MVP future state transforms ShadowSpeak from a minimal audio practice tool into an intelligent, socially connected speaking practice platform. It addresses the MVP's known limitations (no real-time feedback, no community features, no personalization) by introducing AI-powered pronunciation scoring, adaptive content sequencing, community engagement mechanics, and a premium subscription tier for revenue diversification. The future state retains the core screen-off, hands-free practice loop while layering intelligence and social motivation around it.

---

## 2. Vision & Goals

### 2.1 Vision

ShadowSpeak becomes the default daily speaking practice companion for English learners worldwide — as habitual as checking the morning commute playlist, but as effective as a personal pronunciation coach.

### 2.2 Business Goals

| # | Goal | Rationale |
|---|---|---|
| FG-1 | Increase 7-day retention to >= 40% (from MVP baseline of 25%) | Community features and personalization reduce churn and deepen habit formation. |
| FG-2 | Grow DAU to 10,000+ by month 12 | Expanded features improve word-of-mouth virality and justify higher ad spend. |
| FG-3 | Diversify revenue to 40%+ from premium subscriptions | Reduces dependence on ad CPM fluctuations and supports higher infrastructure costs at scale. |
| FG-4 | Achieve < 20% content exhaustion rate for daily users | Adaptive content engine and user-generated content ensure infinite replayability. |
| FG-5 | Launch in 3+ APAC markets (Vietnam, Indonesia, Thailand) by month 12 | Localized content and region-specific marketing unlock adjacent English-learner populations. |

### 2.3 Product Goals

| # | Goal |
|---|---|
| PG-1 | Deliver real-time pronunciation scoring without requiring screen-on interaction |
| PG-2 | Enable user-generated content creation (topic requests, personal scripts, sharing) |
| PG-3 | Build a lightweight social layer (streak groups, leaderboards, challenges) |
| PG-4 | Implement adaptive session sequencing based on user performance and fatigue |
| PG-5 | Offer tiered premium plans (ad-free, advanced analytics, coach access) |

---

## 3. Future Workflow

The post-MVP workflow extends the MVP loop with intelligence, personalization, and social triggers at key stages.

```
                     ┌──────────────────────────────────────────┐
                     │          ONBOARDING 2.0                   │
                     │  • Level assessment (voice sample)        │
                     │  • Goal setting (fluency / accent / exam) │
                     │  • Interest profiling                     │
                     │  • Social prompts (optional)              │
                     └────────────┬─────────────────────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────────────────────┐
                     │     DAILY RECOMMENDATION ENGINE           │
                     │  • Adaptive difficulty (based on score)   │
                     │  • Interest-aligned topics                │
                     │  • Spaced repetition of weak sentences    │
                     │  • Content freshness prioritization       │
                     └────────────┬─────────────────────────────┘
                                  │
                                  ▼
          ┌─────────────────────────────────────────────────────────┐
          │            PRACTICE SESSION (ENHANCED)                  │
          │                                                         │
          │   ┌─────────┐   ┌──────────┐   ┌──────────────────┐   │
          │   │ LISTEN  │ → │  REPEAT   │ → │ PRONUNCIATION    │   │
          │   │ (audio) │   │ (record)  │   │ SCORING (AI)     │   │
          │   └─────────┘   └──────────┘   └────────┬─────────┘   │
          │                                          │            │
          │            ┌─────────────────────────────┘            │
          │            ▼                                          │
          │   ┌──────────────────────────────────────┐            │
          │   │ ADAPTIVE FEEDBACK                    │            │
          │   │ • Per-sentence score (0-100)         │            │
          │   │ • Error pattern identification       │            │
          │   │ • Optional haptic/vocal cue          │            │
          │   │ • Re-record option for low scores    │            │
          │   └──────────────────────────────────────┘            │
          └─────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────────────────────┐
                     │      POST-SESSION ENGAGEMENT              │
                     │  • Score summary & trend chart            │
                     │  • Corrective practice (weak sentences)   │
                     │  • Social share (streak + score)          │
                     │  • Challenge prompt (friend / group)      │
                     │  • Ad or premium upsell                   │
                     └────────────┬─────────────────────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────────────────────┐
                     │       ENGAGEMENT LOOP                     │
                     │  • Push notification (personalized)       │
                     │  • Social competition (leaderboard)       │
                     │  • Streak group accountability            │
                     │  • Weekly performance report              │
                     │  • Adaptive daily recommendation          │
                     └──────────────────────────────────────────┘
```

### 3.1 Step-by-Step Flow

| Step | Actor | Action | System Response | Improvement over AS-IS |
|---|---|---|---|---|
| 1 | User | Onboards with voice sample + goals | AI assesses level; generates personalized learning path | MVP had static level selection; now adaptive from day 1 |
| 2 | System | Generates daily recommendation | Selects session matching user's level, interests, and weak areas | MVP was one-size-fits-all daily pick |
| 3 | User | Starts session (hands-free) | Begins audio playback with screen-off | Same core flow, unchanged |
| 4 | User | Repeats sentence aloud | AI scores pronunciation per-sentence in near-real-time | MVP had no scoring; user self-assessed |
| 5 | System | Identifies weak sentences | Queues them for spaced repetition in future sessions | MVP had no error tracking |
| 6 | System | Presents post-session summary | Shows score trend, weak areas, and share option | MVP only showed time/streak |
| 7 | User | Optionally shares score or challenges friend | Social notification sent to friend's app | MVP had no social features |
| 8 | System | Sends next-day personalized reminder | Includes weak-area focus and streak-group standing | MVP was a generic reminder |

---

## 4. New Features & Capabilities

### 4.1 Feature Overview

| Category | Feature | Priority | Description |
|---|---|---|---|
| AI & Personalization | Real-time pronunciation scoring | P0 | On-device ASR model scores each sentence (0-100) with per-phoneme breakdown. Feedback delivered via voice prompt or haptic after user's repetition. |
| AI & Personalization | Adaptive difficulty engine | P0 | Tracks user accuracy per phoneme and adjusts future session difficulty. Automatically mixes warm-up (known) and challenge (weak) sentences. |
| AI & Personalization | Spaced repetition of weak areas | P1 | Weak sentences resurface at increasing intervals following Ebbinghaus curve. Users see "Practice weak spots" option post-session. |
| AI & Personalization | Goal-based learning paths | P1 | Three tracks: General Fluency, Accent Reduction, and Exam Prep (IELTS/TOEIC). Each track adjusts content mix and scoring rubric. |
| Social & Community | Streak groups | P0 | Users create or join private groups (2-10 members). Group streak = all members practice that day. Peer accountability drives retention. |
| Social & Community | Weekly challenges | P1 | System-generated challenges: most sessions, highest score, most improved. 1-3 day duration. In-app leaderboard + badge reward. |
| Social & Community | Friend referral with leaderboard | P1 | Referral link creates a 1-week comparison leaderboard between referrer and referee. Both earn streak freezes. |
| Social & Community | User-generated content requests | P2 | Users can request specific topics. Popular requests bubble up to the content team. Power users can submit scripts for review. |
| Content | Content category filters | P0 | Users select preferred categories (News, Business, Daily Life, Entertainment, Exam Prep). Recommendation engine weights selection. |
| Content | Topic-based browser | P1 | Browseable library with topic tags. Filterable by level and duration. "Add to playlist" for multi-session practice. |
| Monetization | Premium tier (ad-free) | P0 | Remove all ads. Monthly subscription. Includes advanced scoring analytics and streak freeze gifting. |
| Monetization | Premium tier (Pro) | P1 | Ad-free + personalized coaching tips + pronunciation heatmap + downloadable transcripts + priority content requests. |
| Progress | Weekly performance report | P1 | Automated report: score trend, accuracy by phoneme, practice time, streak standing. Push notification + in-app view. |
| Progress | Pronunciation heatmap | P2 | Visual map of phonemes showing accuracy per sound. Identifies systematic errors (e.g., /θ/ vs /t/ confusion). |
| Accessibility | Voice navigation | P2 | Full voice-driven menu navigation for users who want zero-tap sessions start-to-finish. |
| Technical | On-device ML for scoring | P0 | CoreML (iOS) / TensorFlow Lite (Android) for latency-free pronunciation scoring. Privacy-preserving (audio never leaves device during scoring). |

### 4.2 Feature Priority Justification

**P0 features** are included in the first post-MVP release. They directly address the three highest-risk gaps identified in the AS-IS analysis:
1. No pronunciation feedback (core learning gap)
2. No personalization (engagement plateau)
3. No social retention hooks (churn risk)

**P1 features** follow in a second post-MVP release, driven by user feedback and retention data.

**P2 features** are validated through user research before implementation.

---

## 5. Process Improvements

### 5.1 Pain Points vs. Solutions

| MVP Pain Point (AS-IS) | Impact | Future State Solution | Expected Improvement |
|---|---|---|---|
| No pronunciation feedback | Users cannot assess their accuracy; may reinforce bad habits | Per-sentence AI scoring with error pattern identification | Higher perceived learning value; improved speaking outcomes |
| One-size-fits-all content | Content may not match user's level or interests; engagement drops after week 3 | Adaptive difficulty engine + interest profiling | Higher session completion rate; lower content exhaustion rate |
| No social accountability | Streak is purely personal; no external motivation to continue | Streak groups + challenges + leaderboards | Higher 7-day and 30-day retention; organic re-engagement |
| Generic daily recommendation | User has no choice; may not align with mood or context | Category filters + topic browser + playlist | Higher sessions-per-user; lower abandonment |
| No revenue diversification | 100% dependent on ad CPM; high financial risk | Premium subscription tiers | 40%+ of revenue from subscriptions; lower break-even MAU |
| Limited retention hooks | After session, no reason to stay in app | Post-session summary + challenges + weekly report | Increased time-in-app; higher daily revisit rate |

### 5.2 Process Efficiency Gains

| Metric | MVP Baseline (Target) | Future State Target | Improvement |
|---|---|---|---|
| 7-day retention | 25% | 40%+ | 60% improvement |
| Avg streak length | 5 days | 12+ days | 140% improvement |
| Sessions per user/week | 4-5 | 7-10 | 75% increase |
| Content exhaustion rate (monthly) | 30-40% | < 10% | 75% reduction |
| Ad revenue per 1k MAU | $13 (gross) | $18 (gross at premium mix) | 38% uplift |
| Revenue per user (blended) | $0.013/month (ad-only) | $0.80/month (blended) | ~60x uplift |

---

## 6. Stakeholder Impact

### 6.1 Stakeholder Role Changes

| Stakeholder | MVP Role | Future State Role | Change |
|---|---|---|---|
| User | Passive consumer of daily session | Active learner receiving adaptive feedback + engaging socially | More feedback, more motivation, more control |
| Content Team | Script generation + QA + TTS pipeline | Same + adaptive content tagging + user-request triage + premium content curation | Expanded workload; need for content analytics skills |
| Engineering Team | Frontend + backend + audio pipeline | Same + on-device ML integration + real-time scoring infra + recommendation engine | New skills required: ML inference, ASR model optimization |
| Data / ML Team | Not present in MVP | Dedicated ML engineer for pronunciation scoring model + recommendation system | New role; model training pipeline + performance monitoring |
| Product Manager | Feature prioritization + user research | Same + adaptive scoring benchmarks + social feature iteration | Need to understand ML model behavior and its impact on user experience |
| Marketing Team | ASO + content marketing | Same + social features as viral acquisition channel + premium tier positioning | Social loops become a primary growth channel; premium messaging added |
| Ad Operations | Ad network integration + fill rate monitoring | Same + premium subscription lifecycle management + ad/premium revenue reconciliation | Subscription billing added to responsibilities |
| Customer Support | Basic email support | Same + social moderation (streak groups, leaderboards) + premium subscriber support | Social features introduce new moderation workload |
| Finance / Leadership | Budget approval + break-even monitoring | Same + subscription revenue forecasting + ML infrastructure budgeting | Subscription economics added to financial model |

### 6.2 New Stakeholders

| Stakeholder | Role | Responsibility |
|---|---|---|
| ML Engineer | Pronunciation scoring model | Train, deploy, and monitor on-device ASR models for pronunciation scoring |
| Community Manager | Social feature health | Moderate streak groups, manage challenges, handle user reports |
| Content Curator | Premium content pipeline | Curate and tag content for adaptive engine; manage user-request pipeline |

---

## 7. Risks & Mitigations

### 7.1 Transition Risks

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| TR-1 | On-device ML model accuracy is insufficient for reliable scoring | High — users lose trust in feedback | Medium | Set conservative launch threshold (80%+ correlation with human raters). Use offline A/B testing vs. human-annotated dataset before release. Display confidence intervals on scores. |
| TR-2 | Premium subscription conversion cannibalizes ad revenue | Medium — existing ad revenue may drop as users convert to ad-free | Medium | Price premium at 3-5x ad-only revenue per user to ensure net positive revenue per converting user. Monitor blended revenue per user. |
| TR-3 | Social features introduce moderation and safety risks | Medium — toxic behavior, spam, inappropriate content | Medium | Implement automated moderation (user reports + keyword filters + age-gated group creation). Dedicated community manager role. Clear terms of service for groups. |
| TR-4 | Adaptive engine creates filter bubbles | Low-Medium — users only see narrow content they're good at | Low | Engine must include 30% "exploration" content outside the user's comfort zone. Random topic injection. User can override recommendation at any time. |
| TR-5 | Scoring feedback discourages low-performing users | Medium — users with consistently low scores may churn | Medium | Score framing: celebrate improvement over absolute score. "You improved 5 points this week" > "Your score is 60." Streak freeze grant for users who show 3+ consecutive days of zero improvement. |

### 7.2 Feature-Level Risks

| # | Risk | Feature | Mitigation |
|---|---|---|---|
| FR-1 | Voice recording permission rejected by user | Pronunciation scoring | Fallback: user can still practice without scoring. Scoring is opt-in, not required. |
| FR-2 | Streak groups create negative peer pressure | Streak groups | Group max size (10). Users can leave anytime. No public shaming. Optional anonymous participation. |
| FR-3 | Subscription pricing mismatches APAC willingness to pay | Premium tiers | Research APAC pricing benchmarks before launch. Offer annual discount (40%+ discount vs. monthly). Localized pricing in VND/IDR/THB. |
| FR-4 | On-device ML model size exceeds app size budget | Pronunciation scoring | Model download on first open (optional). Progressive download in background. Target < 50MB model size. |

---

## 8. Success Metrics & KPIs

### 8.1 Primary Future State KPIs

| KPI | Definition | Future State Target | MVP Baseline Target |
|---|---|---|---|
| 7-day retention | Users who install on day X and complete >= 1 full session on day X+7 | >= 40% | >= 25% |
| 30-day retention | Users who install on day X and complete >= 1 session in day X+28 to X+30 window | >= 20% | Not measured in MVP |
| Average streak length | Mean consecutive active days among users active for >= 14 days | >= 12 days | >= 5 days |
| Sessions per user per week | Mean sessions completed in trailing 7-day window | >= 7 | >= 4 |
| Pronunciation score adoption | % of eligible sessions where user opts into scoring | >= 60% within 30 days of launch | N/A |
| Premium conversion rate | % of MAU on paid subscription | >= 5% within 90 days of launch | N/A |
| Premium revenue per MAU | Monthly subscription revenue / MAU | >= $0.50 | N/A |
| Ad + premium blended RPM | (Ad revenue + subscription revenue) / (MAU / 1000) | >= $25 | >= $13 (ad only) |
| Organic installs from social features | % of new installs where referral source = streak group invite or challenge share | >= 20% of total installs by month 12 | N/A |
| Content exhaustion rate | % of daily active users who have completed all available sessions at their level | < 10% | ~30-40% |

### 8.2 Secondary KPIs

| KPI | Definition | Target | Rationale |
|---|---|---|---|
| Weekly challenge participation rate | % of MAU who opt into >= 1 challenge per week | >= 25% | Measures social feature stickiness |
| Streak group retention | 30-day retention of users who join a streak group vs. solo users | >= 15pp higher | Validates social accountability hypothesis |
| Pronunciation score trend | Average score improvement per 30 days of active use | >= 5 points | Measures learning effectiveness |
| ASR scoring latency | Time from end of user speech to score display | <= 1 second (P95) | Ensures feedback feels real-time |
| Premium churn rate | % of premium subscribers who cancel per month | <= 8% | Measures premium satisfaction and value |

### 8.3 Leading Indicators

| Leading Indicator | What It Predicts | Warning Signal |
|---|---|---|
| Week 1 pronunciation score adoption rate | Long-term scoring feature engagement | < 40% adoption = need for better onboarding / value communication |
| Streak group opt-in rate in first 14 days | Social feature stickiness | < 15% opt-in = feature discoverability issue |
| Premium trial conversion rate | Subscription viability | < 3% trial-to-paid = pricing or value problem |
| Adaptive recommendation tap-through rate | Content personalization quality | < 50% tap-through = recommendation tuning needed |

---

## 9. Architecture Changes (Post-MVP)

The future state introduces several architectural changes compared to the MVP:

| Component | MVP | Future State |
|---|---|---|
| Pronunciation scoring | Not present | On-device CoreML / TensorFlow Lite model. Audio never leaves device. Score reported as structured data. |
| Recommendation engine | Static daily pick by difficulty | Rule-based engine scoring sessions by: user level, interest weight, weak-sentence overlap, freshness, exploration bucket |
| Social layer | Not present | Lightweight API for groups, leaderboards, challenges. Server-side streak group computation. |
| Content pipeline | Flat tagging (level + category) | Multi-dimensional tagging (difficulty, topic, target phonemes, sentence length, speaking speed). Enables adaptive filtering. |
| Monetization | Ad-only | Ad + subscription (StoreKit / Play Billing). Revenue reconciliation pipeline. Entitlement management. |
| Analytics | Event tracking only | Event tracking + scoring analytics + recommendation performance + social graph analysis |

---

## 10. Implementation Phasing

| Phase | Focus | Timeline | Key Deliverables |
|---|---|---|---|
| Phase 1 | Foundation | Month 4-5 | Pronunciation scoring (P0), category filters, premium tier (ad-free) |
| Phase 2 | Social | Month 6-7 | Streak groups, weekly challenges, friend referral, social leaderboard |
| Phase 3 | Intelligence | Month 8-9 | Adaptive difficulty engine, spaced repetition, goal-based learning paths |
| Phase 4 | Expansion | Month 10-12 | Premium Pro tier, topic browser, voice navigation, pronunciation heatmap, Indonesia + Thailand market launch |

---

**References**
- [Business Requirements Document](../03-business-requirements/Business_Requirements_Document.md)
- [AS-IS Analysis](../04-current_state_analysis/AS-IS_Analysis.md)
- [Product Discovery Document](../02-product_discovery/Product_Discovery_Document.md)
- [Business Request Document](../01-business-request/ShadowSpeak_Business_Request_Document.md)
