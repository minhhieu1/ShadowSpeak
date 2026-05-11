# ShadowSpeak — Business Request Document (BRD)

**Project:** ShadowSpeak (Audio-first English Shadowing Practice)
**Document Type:** Business Request Document
**Date:** 2026-05-10
**Status:** Draft for review
**Version:** 1.0

---

## 1. Executive Summary

ShadowSpeak is an audio-first mobile application that enables English learners to practice speaking through the shadowing technique -- listening to a sentence and repeating it aloud -- entirely hands-free and screen-off. The core insight is that millions of English learners have 10-30 minutes of hands-free time daily (commuting, exercising, chores) that could be converted into speaking practice, yet no mainstream app delivers a zero-screen, audio-only practice experience that fits into these routines.

The MVP targets validation of three critical hypotheses: (1) users will form a daily speaking practice habit when the friction of screen time is removed, (2) an ad-supported model can sustain content generation and infrastructure costs at scale, and (3) the shadowing technique can be delivered effectively through a mobile audio experience without real-time AI or pronunciation feedback.

Success is defined as 1,000 DAU by month 3 with >= 25% 7-day retention, an average streak of >= 5 days, and >= 60 minutes of practice per user per month. The break-even business model requires approximately 45,000-75,000 MAU depending on realized CPM rates ($15-25 CPM range).

---

## 2. Problem & Opportunity

### 2.1 The Problem

English learners face a fundamental gap in their language acquisition: they can read and listen with reasonable proficiency, but they freeze when required to speak. This gap exists because:

- **Active oral production is neglected** by most digital tools. Learners train their eyes and ears but never their mouth muscles and neural pathways for real-time pronunciation, intonation, and rhythm.
- **Existing solutions demand screen time.** Language apps, online tutors, and classes require focused attention, active tapping, and visual engagement. They do not fit into low-attention moments like driving, cooking, or walking.
- **Busy adults have dead time but no speaking practice option.** Workers, parents, and students have 10-30 minutes daily that could be used for speaking practice, but no current app serves this use case without requiring visual attention.
- **Shadowing is proven but inaccessible.** The shadowing technique is well-documented in interpreter training and academic research, but it remains unavailable as a mainstream mobile product. No app makes shadowing a daily habit.

### 2.2 The Opportunity

| Opportunity | Description |
|---|---|
| Audio-first, zero-screen interaction | The phone stays in the pocket or on the mount. Listen, repeat, continue. That is the entire practice loop. |
| Hands-free habit formation | By fitting into existing routines (commuting, cooking, walking), speaking practice becomes frictionless. The barrier is not motivation -- it is fit. |
| Massive underserved market | Millions of English learners worldwide own smartphones, commute daily, and express frustration with their speaking ability. The market for "better speaking without trying harder" is large and growing. |
| Ad-supported scalability | Content is generated once (AI script + TTS) and served to thousands of users per day. No per-user compute cost during practice. Unit economics work at scale with ad revenue alone. |

---

## 3. Target Market & Personas

### 3.1 Target Market

English learners in Asia-Pacific markets, particularly Vietnam, who:
- Own smartphones and use them during daily commutes or routines
- Have intermediate or higher reading/writing English ability but struggle with speaking
- Are familiar with language learning apps but find them insufficient for speaking practice
- Have 10-30 minutes of hands-free time daily that is currently filled by music or podcasts

### 3.2 Personas

#### Persona A: Minh — The Daily Commuter

| Attribute | Detail |
|---|---|
| Age | 26 |
| Location | Ho Chi Minh City, Vietnam |
| Occupation | Software developer |
| English level | Intermediate (reads/writes well, struggles with speaking fluency and pronunciation) |
| Daily routine | 30-minute motorbike commute through HCMC traffic each way. Listens to music or podcasts. AirPods worn under helmet. |
| Pain point | "I can read English docs fine, but when I speak in client meetings, I freeze. I don't have time to sit with an app." |
| ShadowSpeak use case | Practices shadowing during both commutes. Daily recommended session (5-10 min each way). 10-20 minutes of speaking practice per day without changing routine. |
| Key requirements | Hands-free only. Audio instructions. Automatic playback. Lock-screen controls for skip/pause. Clear audio over wind and traffic noise. |

#### Persona B: Huy — The Remote Professional

| Attribute | Detail |
|---|---|
| Age | 34 |
| Location | Da Nang, Vietnam |
| Occupation | Senior software developer (remote) |
| English level | Upper-intermediate (writes English daily, struggles with verbal fluency and accent) |
| Daily routine | Wakes up early, goes to the gym, has coffee at a local cafe. 20-30 minutes of hands-free time in the morning. Works with international teams. |
| Pain point | "I write English every day in Slack and GitHub. But when I join a voice call, I stumble. I need to speak more naturally in stand-ups." |
| ShadowSpeak use case | Practices during morning coffee or cool-down after gym. AirPods in, phone in pocket. 2 sessions per morning. |
| Key requirements | Clear audio with ambient background noise. Repeat button via tap on AirPods. Voice instructions for menu navigation. |

#### Persona C: Linh — The Screen-Tired Student

| Attribute | Detail |
|---|---|
| Age | 22 |
| Location | Hanoi, Vietnam |
| Occupation | University student |
| English level | Intermediate (studies for IELTS, almost no speaking practice) |
| Daily routine | 8+ hours on laptop for classes and study. Walks 20 minutes to campus each way. Preparing for IELTS for overseas master's programs. |
| Pain point | "My phone and laptop are already my whole day. I need to practice speaking for IELTS but I cannot stare at another screen." |
| ShadowSpeak use case | Practices during walk to and from campus. Autoplay with short sessions. Checks streak and progress after returning home. |
| Key requirements | Minimal screen checks. Phone in pocket, single earbud. Progress checked later, not during practice. |

---

## 4. Business Objectives

| # | Objective | Strategic Rationale |
|---|---|---|
| OBJ-1 | Validate that users form a daily speaking practice habit through audio-first, hands-free interaction | The core business hypothesis. If users do not practice daily, the product does not deliver value and will not retain. |
| OBJ-2 | Demonstrate that ad-supported monetization sustains the content pipeline and infrastructure | Without this, the business model does not work. Must validate that ad load (1-2 ads/day) does not kill retention while covering costs. |
| OBJ-3 | Prove that shadowing can be delivered effectively without real-time AI or speech recognition | Keeps infrastructure costs near-zero during practice. If valid, enables a capital-efficient scale path. |
| OBJ-4 | Establish a repeatable content generation pipeline (AI script + TTS) producing 3-5 fresh sessions per week | Content variety and quality directly drive retention. The pipeline must be fast, cheap, and produce natural-sounding material. |
| OBJ-5 | Reach 1,000 DAU by month 3 with unit economics that project to profitability at approximately 45,000-75,000 MAU depending on realized CPM | Defines the scale gate for investment in user acquisition and post-MVP features. |

---

## 5. MVP Scope

### 5.1 In Scope

| Category | Features |
|---|---|
| Authentication | Email/password sign-up and login. Google OAuth. Facebook OAuth. JWT session management. Password reset. Token refresh. |
| Onboarding | 4-screen flow (what is shadowing, level selection, practice context, background audio permission). Level selection: Beginner / Intermediate / Advanced. Practice context multi-select (driving, walking, cooking, etc.). Immediate first session after onboarding. Driving safety disclaimer displayed during onboarding. |
| Practice Library | Daily recommended session (1 per day, refreshed daily). 3-5 new sessions per week (rotating). Sessions organized by difficulty. Each session: 8-15 sentences, 5-15 min duration. Content types: news briefs, everyday conversations, short stories. Content generated offline (AI script + TTS). Content expiry: 3-week rotation. **Initial content batch of 20+ sessions to support no-repeat daily recommendations during first month.** |
| Audio Experience | Screen-off playback (hard requirement). Lock-screen media controls. Notification tray controls. Autoplay of next sentence. Flexible pause timing (1.5x audio duration). Audio ducking. Session boundary voice prompts. Bluetooth/headphone pause/resume handling. |
| Progress Tracking | Streak tracking (consecutive days). Total sessions completed (lifetime). Total practice time (lifetime and weekly). Current streak on Home screen. Session history. Streak freeze / grace period (1 missed day). Monthly badges (unique badge per month for completing every day). |
| Settings | Pause timing adjustment (1x, 1.5x, 2x). Session length preference (5/10/15 min). Daily reminder toggle and time. Account deletion. App version/build info. User data deletion workflow (Settings -> Account Deletion). |
| Notifications | Daily practice reminder (local notification, configurable time). Streak reminder if no session by configured threshold. |
| Monetization | Audio ads at session boundaries (post-session, pre-session, inter-session). Ad pre-fetch and local caching. Ad-supported only -- no subscriptions. Ad-free operation during launch window (first 2-3 months) while ad integration is certified and inventory accumulates. |

### 5.2 Out of Scope (MVP)

- Phone number / SMS authentication
- Biometric authentication
- Adaptive onboarding
- Grammar or vocabulary quizzes for leveling
- Personalized content recommendations
- User-generated content
- Topic/category filters
- Grammar explanations or vocabulary lists
- Real-time AI pronunciation feedback
- Speech recognition or voice activity detection
- Speed adjustment controls
- Leaderboards or social features
- Push notifications from server
- Video ads or banner ads
- Subscription plans or premium tiers
- Noise cancellation or audio processing

---

## 6. Success Metrics

### 6.1 Primary Metrics

| Metric | Definition | Success Threshold |
|---|---|---|
| DAU | Average number of unique users who complete at least one full session during a calendar day (user's local time zone) over a rolling 7-day window | 1,000 DAU by end of month 3 |
| 7-day retention | Classic day-7 retention: users who install on day X and complete at least 1 full session on day X+7 (user local time). Day 0 = install date. | >= 25% |
| Average streak length | For each user active for at least 7 days, compute their average streak length (total days practiced / number of streak segments). Report median and mean across the user base weekly. | >= 5 days |
| Total practice minutes per user | Total minutes of pure session audio playback time (excluding ad time and pauses) in the trailing 30-day period, averaged across users who completed at least one session in that period. | >= 60 min / user / month |
| Ad revenue per 1k MAU | Net revenue (post-ad-network cut of ~30-50%). Monthly: total net ad revenue / (MAU / 1000). Note: the $13 target is gross; net break-even is higher after ad-network fees. | >= $13 / month (gross) to cover infra cost |

### 6.2 Secondary Metrics

| Metric | Definition | Rationale |
|---|---|---|
| Sessions per user per week | Total sessions completed in trailing 7-day window / number of unique active users in same window. Reported as mean. | Measures engagement depth beyond daily check-in |
| % of sessions completed | Sessions completed to the final sentence / total sessions started (first sentence played). Started but not completed = abandoned. | Measures session quality and appropriate length |
| DAU at 8-10am and 5-7pm | Average DAU during those time windows (unique users with any session activity starting in that window, UTC+7). | Validates the commuting use case |
| Background playback adoption rate | % of sessions where screen was locked/off for >= 80% of session duration. | Validates core assumption of hands-free usage |
| Notification tap-through rate | Notification opens / notifications delivered (unique user per notification, not per send). | Measures effectiveness of daily reminder |

### 6.3 Quality Bar / Non-Functional Requirements

| Category | Target | Measurement | Severity |
|---|---|---|---|
| Crash-free session rate | >= 99% | Sessions without crash / total sessions | Critical |
| Audio playback start latency | < 500ms (local), < 2s (streamed) | Time from play command to first audible output | High |
| Session load time | < 3s from tap to first sentence playback | P95 over trailing 7-day window | High |
| Content playback reliability | >= 99.5% | Sentences that play without error / total sentences served | Critical |
| App launch time | < 2s cold start | P95 over trailing 7-day window | Medium |

---

## 7. Risks & Mitigations

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-1 | Users will not practice daily | High -- if habit does not form, the entire MVP fails | High | Keep sessions short (5-min minimum). Daily reminder notification. Streak mechanic with grace period. Monthly badges for gamification. Core hook: hands-free practice during existing routines. |
| R-2 | Audio ads kill retention | High -- ad revenue is the only monetization model, but ads may drive users away | Medium | Limit ad frequency to 1-2/day. Place ads only at natural session boundaries. Monitor retention cohorts split by ad exposure. If retention drops >= 10% for ad-exposed users, reduce frequency or test pre-roll only. |
| R-3 | Background playback breaks on iOS or Android | High -- screen-off playback is a hard requirement; failure here breaks the core value proposition | Medium | Prototype audio playback as first technical spike (week 1). Test on real devices across iOS 16/17/18 and Android 10/11/12/13/14/15. Implement robust error handling with automatic retry and fallback messaging. |
| R-4 | Users cannot or will not interact hands-free | Medium -- friction at session boundaries may break the hands-free flow | Medium | Design sessions to be long enough (8-15 min) that switching sessions mid-activity is uncommon. Autoplay next session after configurable delay. Accept that first and last interaction requires a screen tap. Validate in user testing. |
| R-5 | Content generation pipeline is not fast or varied enough | Medium -- limited content variety reduces retention and daily recommendation value | Medium | Invest in strong prompt engineering. Use 2-3 different TTS voices. Include 3 content categories from day 1. Monitor session completion rates per content type. Prepare manual content creation path as backup. |
| R-6 | Ad network minimum impression thresholds not met at MVP scale | High -- ad revenue cannot be generated during early months | High | Plan for ad-free launch window (first 2-3 months). Identify 2-3 ad networks with tiered entry thresholds. Prepare fallback: lower-revenue display/banner ads. |
| R-7 | Driving safety regulations create legal or App Store compliance issues | Medium -- app rejected from App Store or legal liability from driving use case | Medium | Add driving safety disclaimer during onboarding. Research target-market laws on phone usage while driving. Limit feature set while driving (no visual interaction). Consult legal counsel for terms of service. |
| R-8 | Android OS version fragmentation in Vietnamese market | Medium -- significant portion of target users on older Android versions | Medium | Set minimum OS version to Android 10 (not 12) for initial target market. Validate against Vietnamese smartphone OS distribution data. |

---

## 8. Financial Overview

### 8.1 Revenue Model

- **Model:** Ad-supported only. No subscriptions, no premium tiers, no paywalls.
- **Ad format:** Audio ads (15-30 seconds) at natural session boundaries.
- **Ad network:** Programmatic audio ad exchange (e.g., Triton Digital, Spotify ad tech, or equivalent). See Section 8.5 for feasibility analysis.

### 8.2 Ad Placement & Frequency

| Placement | Format | Frequency | Max per user per day |
|---|---|---|---|
| Post-session | 15-30 second audio ad | 1 per completed session | 2 |
| Pre-session | 15-30 second audio ad | 1 per day maximum | 1 |
| Inter-session (between 2nd+ session) | 15-30 second audio ad | 1 per 2nd+ session | 1 |

**Session frequency distribution model:** Assumes 60% of users complete 1 session/day (1 ad post-session), 25% complete 2 sessions (2 ads: post-session + inter-session), 15% complete 3 sessions (3 ads). Weighted average: 1.35 ads/user/day.

### 8.3 Unit Economics

| Metric | Estimate | Notes |
|---|---|---|
| Audio ad CPM | $15 - $25 | Industry average for programmatic audio |
| Ad load per user per day | 1.35 | Based on session frequency distribution: 60% x1 session, 25% x2, 15% x3 |
| Sessions per MAU per month | 20 | Target engagement level |
| Revenue per 1k MAU per day | $0.41 - $0.68 | Derived from CPM and ad load |
| Revenue per 1k MAU per month | $12.15 - $20.25 | Monthly extrapolation (gross, pre-network cut) |
| Estimated monthly cost | ~$1,000 | Infrastructure: ~$700, Content generation: ~$150, CDN/bandwidth: ~$150 |
| Break-even MAU | ~45,000-75,000 | Range depends on realized CPM (see sensitivity table below) |

**Break-even Sensitivity Analysis:**

| CPM Rate | Revenue per 1k MAU (gross) | Break-even MAU (gross) |
|---|---|---|
| $15 CPM (low) | $13.50 | ~74,000 |
| $20 CPM (mid) | $18.00 | ~55,500 |
| $25 CPM (high) | $22.50 | ~44,500 |

Note: Above revenue estimates are gross (pre-ad-network cut). Net revenue at 30-50% network fees would increase break-even MAU proportionally. For example, at $20 CPM with a 40% network fee, net revenue per 1k MAU drops to $10.80, raising break-even MAU to ~92,500.

### 8.4 Cost Structure (MVP)

| Cost Category | Monthly Estimate (MVP scale) | Notes |
|---|---|---|
| Infrastructure (AWS serverless) | ~$700 | API Gateway, Lambda, DynamoDB, S3, CloudFront |
| TTS generation (batch) | ~$150 | Amazon Polly or Google TTS for weekly batch pipeline |
| AI script generation | ~$50 | GPT-4 or equivalent for weekly content scripts |
| CDN bandwidth | ~$150 | Audio file serving at MVP traffic levels |
| **Total estimated monthly cost** | **~$1,050** | At approximately 50,000 MAU |

### 8.5 Ad Network Feasibility

| Ad Network | Min. Monthly Impressions | Fill Rate Estimate | MVP Readiness |
|---|---|---|---|
| Triton Digital | 500,000+ | 60-80% | Not viable until month 6+ |
| Spotify Audience Network | 1,000,000+ | 70-85% | Not viable until month 8+ |
| Google AdMob (audio) | 100,000+ | 50-70% | Potentially viable by month 4-5 |

**Contingency Plan:** During months 1-3 at 500-1,000 MAU, the app will operate ad-free while accumulating content library. Ad integration (SDK certification, testing) will proceed in parallel. If minimum thresholds are not met by month 4, evaluate programmatic display ads as a lower-revenue bridge while audio inventory accumulates.

---

## 9. Implementation Timeline

### Phase 1: Immediate (Weeks 1-2)

| Activity | Deliverable |
|---|---|
| Audio prototype spike | Minimal React Native app with sequential background audio playback and lock-screen controls. Tested on iOS + Android physical devices, including Bluetooth earphones. |
| Backend scaffolding | FastAPI project, API Gateway, Lambda deployment (via Mangum adapter), DynamoDB tables deployed. Health-check endpoint live. |
| Content generation pipeline | Script generation prompts written. TTS batch job operational. 20+ pilot sessions generated across 3 levels and 3 categories. |
| User flow wireframes | All screens finalized in Figma (onboarding, home, library, settings) with audio-first alternative descriptions. |

### Phase 2: Short-term (Weeks 3-4)

| Activity | Deliverable |
|---|---|
| Beta build | Full MVP features implemented. TestFlight + Play Console Internal Testing build distributed to 50-100 test users. |
| Analytics instrumentation | Amplitude/Mixpanel events implemented for all key user actions. Verification dashboard live. |
| User testing | 5-10 users matching target personas recruited across Vietnam. Real-context observation sessions completed. Pain points documented. |
| Audio experience iteration | Pause timings, session lengths, voice prompt frequency, and ad placement adjusted based on user testing feedback. |

### Phase 3: Medium-term (Month 2)

| Activity | Deliverable |
|---|---|
| Soft launch (organic only) | App released to public on iOS App Store and Google Play Store. Target 500-1,000 MAU organically. App operates ad-free during this window. |
| Ad network integration | Audio ad SDK implemented (parallel track). A/B test of ad placement (post-session only vs pre + post) when thresholds are met. |
| Retention check gate | 7-day retention evaluated. Decision: proceed to hard launch (if >= 25%) or iterate (if below threshold). |
| Performance optimization | Lambda cold starts, DynamoDB latency, CDN cache hit rates, and crash rates monitored and optimized. |

### Phase 4: Month 3+

| Activity | Deliverable |
|---|---|
| Hard launch (if validated) | Paid user acquisition scaled (App Store Search Ads, Google Ads, TikTok). Budget: $2,000-5,000/month. |
| Content library expansion | 10+ new sessions per week. ESL content creator partnerships explored. |
| Post-MVP feature planning | Next features prioritized based on retention data (speech recognition scoring, user-created content, community streaks, speed control, topic filters). |

---

## 10. Content Operations Plan

### 10.1 Production Pipeline

Content generation is an offline batch process. The weekly production target is 3-5 new sessions, yielding 12-20 sessions per month. This ensures the active content library (3-week rotation, approximately 9-15 sessions active at any time) is refreshed before any session expires.

Pipeline steps:
1. **Script generation:** AI (GPT-4 or equivalent) produces session scripts based on curated topic prompts and difficulty templates. Each script targets 8-15 sentences, 5-15 minutes of practice time.
2. **Review and approval:** Each script is reviewed before TTS processing (see Section 10.2).
3. **TTS batch processing:** Approved scripts are batched and processed via Amazon Polly or Google TTS. Multiple voices are used across sessions to provide variety.
4. **Audio asset packaging:** TTS output files are normalized for volume, trimmed for silence, and packaged with metadata (sentence timestamps, transcript text) into the content delivery format.
5. **Deployment:** Processed sessions are uploaded to S3 and indexed in DynamoDB for the content API.

### 10.2 Quality Assurance

Every session is reviewed before publication:

| QA Check | Description | Reviewer |
|---|---|---|
| Script accuracy and natural language flow | Grammar, vocabulary level, and natural phrasing verified against target difficulty. Scripts must sound like native speech, not AI-generated text. | Bilingual reviewer |
| Pronunciation and intonation of TTS output | Each sentence spot-checked for mispronunciations, odd emphasis, or robotic cadence. | Bilingual reviewer |
| Cultural appropriateness | Content checked for cultural sensitivity, references that may not translate, and appropriateness for the target market (APAC / Vietnam). | Bilingual reviewer / native speaker |

No session is published without passing all three QA checks. If a session requires re-generation, the corrected script is re-processed through TTS and re-reviewed. The QA cycle targets a maximum 48-hour turnaround time from script generation to published session.

### 10.3 Content Exhaustion Fallback

If a user completes all available sessions in their assigned difficulty level:

- The daily recommendation screen displays a "New content coming soon" message with an estimated availability date.
- The user's streak is preserved: each content exhaustion event grants a 1-day streak freeze.
- Previously completed sessions remain available for re-practice (the session library is never empty).
- A notification is sent when new content is published and available for that user's level.

This fallback is expected to be rare during the first several months, as the initial 20+ session batch combined with 3-5 weekly additions provides approximately 6-8 weeks of unique daily content before repeats or exhaustion occur for a daily user.

---

## 11. Strategic Assumptions

The following assumptions must hold for the business case to be valid. Each will be tested during the MVP phase.

| Assumption | Test Method | Validation Criteria |
|---|---|---|
| Users will practice shadowing daily when it fits into existing hands-free routines | Measure DAU, streak length, and 7-day retention | >= 25% 7-day retention and >= 5 day avg streak |
| Audio ads at session boundaries will be tolerated | Compare retention cohorts of ad-exposed vs non-exposed users | No more than 10% retention drop for ad-exposed cohort |
| Background audio playback is reliable across iOS and Android devices | Technical spike in week 1; ongoing crash rate monitoring | < 1% crash rate in audio sessions |
| AI-generated scripts + TTS provide sufficient content quality and variety | Session completion rates per content type | > 80% session completion rate across all content types |
| Ad CPM rates of $15-25 are achievable at MVP traffic levels | Ad network revenue reporting | Monthly revenue per 1k MAU >= $13 (gross) |
| Minimum OS versions do not exclude target market | Check Vietnamese smartphone OS distribution data | <= 10% of target users excluded by min OS requirement |

---

## 12. Regulatory & Compliance Considerations

### 12.1 Driving Safety

ShadowSpeak's primary use case involves users practicing while commuting, including while operating vehicles. The app will include:
- An onboarding warning screen: "ShadowSpeak is designed for hands-free use. Do not interact with the screen while operating a vehicle. Obey all traffic laws."
- No visual interaction during practice mode (screen-off by default).
- Legal review of target-market regulations (Vietnam, APAC) regarding cognitive tasks while driving.

### 12.2 App Store Compliance

- Apple App Store Review Guidelines 1.2 (User Safety): Apps should not encourage unsafe use of devices. Warning screen and screen-off defaults address this.
- Google Play Store: Similar device-safety policies apply.

### 12.3 Age Restrictions & COPPA/GDPR-K

- The app is designed for users 13+ (intermediate+ English learners are typically older).
- No targeted advertising to users under 18.
- Age gate during onboarding.

### 12.4 Data Privacy

- Data stored in AWS AP-Southeast-1 (Singapore) for Vietnamese user data residency.
- GDPR compliance pathway: data export/deletion API, privacy policy, cookie/analytics consent.
- User data deletion workflow available via Settings -> Account Deletion.
- Analytics data collection (Amplitude/Mixpanel) disclosed during onboarding.
- Breach notification plan: 72-hour notification to affected users via email + in-app alert.

---

## 13. Competitive Landscape

The following analysis covers direct and adjacent competitors in the English speaking practice market.

### 13.1 Competitive Matrix

| Feature | ShadowSpeak | Duolingo | ELSA Speak | Pimsleur | HelloTalk | YouTube Shadowing |
|---|---|---|---|---|---|---|
| Audio-first / hands-free | Yes (core) | No | No | Yes | No | Partial |
| Shadowing technique | Yes (core) | No | No | Yes | No | Yes (user-created) |
| Screen-off playback | Yes | No | No | Yes | No | No |
| Ad-supported model | Yes | Yes (free tier) | No (subscription) | No (subscription) | Yes | Yes |
| AI-generated content | Yes | Yes | Yes | No | No | No |
| Real-time pronunciation feedback | No (MVP) | No | Yes | No | No | No |
| Social/community features | No (MVP) | Yes | No | No | Yes | No |
| Content library size (MVP) | 20+ sessions | Thousands | Hundreds | Hundreds | N/A | Millions |

### 13.2 Competitive Threat Assessment

| Threat | Scenario | Impact | Mitigation |
|---|---|---|---|
| Duolingo adds audio-only mode | Duolingo already has audio exercises but requires screen interaction. A dedicated audio-only mode would be a direct competitive threat. | High | First-mover advantage in niche. Build habit and content library before Duolingo pivots. Target users specifically frustrated with Duolingo's screen demands. |
| ELSA Speak adds shadowing | ELSA is subscription-based and focused on pronunciation scoring. Adding shadowing would broaden their offering. | Medium | ShadowSpeak's free (ad-supported) model is a pricing advantage over ELSA's subscription. |
| Pimsleur expands to APAC | Pimsleur is already audio-first with shadowing-like repetition, but targets a different market (serious learners, higher price point). | Low-Medium | Pimsleur is subscription-based ($15-20/month) and not APAC-focused. ShadowSpeak targets price-sensitive APAC users. |
| Existing ESL YouTubers launch apps | YouTube shadowing content is popular but non-interactive (no progress tracking, no daily recommendation). | Low | YouTube lacks streak mechanics, progress tracking, and personalized daily recommendations. Habit formation is ShadowSpeak's moat. |

---

## 14. Go-to-Market Strategy

### 14.1 Phase 1: Organic (Months 1-2)

- Channel: App Store Optimization (ASO) for keywords: "English speaking practice," "shadowing English," "luy?n n�i ti?ng Anh," "h?c n�i ti?ng Anh"
- Content marketing: YouTube short-form videos demonstrating shadowing technique. Vietnamese ESL Facebook groups.
- Estimated CPI: $0.30-0.50 (Vietnam iOS/Android)

### 14.2 Phase 2: Paid Acquisition (Month 3+)

- Channels: Apple Search Ads, Google Ads (Search + YouTube), TikTok Ads
- Monthly budget: $2,000-5,000 (to be confirmed with leadership)
- Target CPI: < $0.50

### 14.3 Community Strategy

- Vietnamese ESL content creators: sponsored review/demo videos (micro-influencers, 10k-50k followers)
- ShadowSpeak user referral: streak-based referral incentive (1 streak freeze per referred friend who completes 3 sessions)

### 14.4 Acquisition Funnel Model

For planning purposes, the following funnel model applies at 1,000 DAU target:

| Stage | Conversion Rate | Implied Users at Stage |
|---|---|---|
| App Store impressions | -- | 90,000 - 140,000 |
| Impressions to installs | 15-25% | 20,000 - 25,000 |
| Installs to registration (account creation) | 70-80% | 15,000 - 18,000 |
| Registration to first session completed | 85-90% | 13,000 - 15,000 |
| First session to 7-day retained | 25%+ (primary metric) | 3,500 - 4,000 |
| 7-day retained to MAU | ~60-70% | 2,100 - 2,800 |
| MAU to DAU (at target engagement) | ~35-50% | 1,000 DAU |

**Implied weekly installs needed for 1,000 DAU steady state:** approximately 2,500-3,500.

Note: This funnel is based on industry benchmarks for edtech/free apps in APAC markets and will be refined with real data during the soft launch phase (Month 2).

---

## 15. Technology Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Cross-platform framework | React Native | Largest talent pool for cross-platform development. Good audio library support (react-native-track-player). Code sharing between iOS and Android. |
| Backend framework | FastAPI (via Mangum on Lambda) | FastAPI provides modern Python async support, automatic OpenAPI docs, and Pydantic validation. Mangum adapter enables Lambda deployment for serverless cost model. Note: Mangum adapter adds ~200-500ms cold start latency. This is acceptable for MVP because (a) the content pipeline is batch/offline, not synchronous user requests, (b) API response latency is not critical for the audio-first use case, and (c) Lambda's pay-per-use pricing aligns with MVP traffic variability. If latency becomes a concern post-MVP, container-based deployment (ECS Fargate) is the natural migration path. |
| Cloud provider | AWS serverless (Lambda, DynamoDB, S3, CloudFront) | Low operational overhead at MVP scale. Pay-per-use pricing aligns with early-stage traffic. AP-Southeast-1 region supports Vietnamese data residency. |
| TTS engine | Amazon Polly / Google TTS | Both support Vietnamese-accented English and multiple voice options. Batch generation keeps costs low. |
| Analytics | Amplitude / Mixpanel | Event-based tracking aligns with product-led growth metrics. Free tiers cover MVP traffic levels. |
| Audio playback | react-native-track-player | Proven background playback support. Lock-screen controls. Queue management for sequential sentences. |

---

## 16. Next Steps & Approvals

### Required Approvals

| Stakeholder | Approval Required | Status |
|---|---|---|
| Product Owner | MVP scope and success metrics | Pending |
| Engineering Lead | Timeline and technical feasibility | Pending |
| Marketing Lead | Target market, personas, and launch plan | Pending |
| Finance / Leadership | Budget and break-even model | Pending |

### Stakeholder RACI Matrix

| Activity | Product Owner | Engineering Lead | Marketing Lead | Finance / Leadership |
|---|---|---|---|---|
| MVP scope definition | A | C | C | I |
| Feature prioritization | A | C | C | I |
| Technical architecture | I | A | I | C |
| Infrastructure cost estimation | I | R | I | A |
| Content pipeline operations | A | R | C | I |
| User acquisition strategy | C | I | A | C |
| Ad network selection | A | R | I | C |
| Success metrics definition | A | C | C | R |
| Compliance & legal review | C | I | I | A |
| Budget approval | C | C | I | A |

R = Responsible (doer), A = Accountable (approver), C = Consulted (input before decision), I = Informed (notified after decision)

### Immediate Actions

1. Approve BRD and proceed to technical architecture and specification
3. Initiate audio prototype spike (highest-risk technical area)
4. Begin backend scaffolding and content pipeline setup
5. Recruit alpha test users matching target personas
6. Finalize ad network selection and integration approach
7. Research Vietnamese driving safety regulations and consult legal counsel for terms of service

---

## 17. Glossary

| Term | Definition |
|---|---|
| Shadowing | Language learning technique: listen to a sentence, repeat it aloud immediately, mimicking intonation and rhythm |
| CPM | Cost per mille -- cost per 1,000 ad impressions |
| MAU | Monthly Active Users |
| DAU | Daily Active Users |
| Streak Freeze | A mechanism allowing a user to miss one day without breaking their consecutive-day streak |
| Audio Ducking | Reducing background music volume when voice audio is playing |
