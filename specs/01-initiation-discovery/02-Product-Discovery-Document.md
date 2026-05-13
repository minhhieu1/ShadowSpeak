# Product Discovery Document (PDD)

## 1. Version History
| Date | Author | Version | Changes |
|------|--------|---------|---------|
| 2026-05-10 | Product Manager | 1.0 | Initial creation |

This document outlines the product discovery findings, analyses, and assumptions for the ShadowSpeak MVP, tracking its evolution through version updates.

## 2. User Pain Points
- Learners lack audio‑first tools that enable oral production without visual interaction.
- Existing apps require screen taps and visual focus, preventing practice during “dead‑time” (commuting, chores).
- Busy adults have 10‑30 min pockets of time but no hands‑free speaking practice option.
- Shadowing is proven to improve fluency, yet no mainstream mobile product delivers a zero‑screen, audio‑only shadowing experience.

## 3. Research
- **Academic:** Shadowing technique shows significant gains in pronunciation and fluency (interpreter training literature, 2018‑2022).
- **Market:** Vietnam & broader APAC smartphone landscape – >85 % Android devices run OS 10+; iOS penetration ~30 %.
- **Monetisation:** Programmatic audio CPM benchmarks $15‑25 (industry data, 2024). 
- **Acquisition Funnel (APAC EdTech):** 15‑25 % impression‑to‑install; 70‑80 % install‑to‑registration.
- **Ad Networks:** Minimum impression thresholds – Triton 500k+, Spotify 1 M+, AdMob 100k.

## 4. Competitor Analysis
| Dimension | ShadowSpeak (Proposed) | Duolingo | ELSA Speak | Pimsleur | HelloTalk | YouTube Shadowing |
|-----------|------------------------|----------|------------|----------|-----------|-------------------|
| Core modality | Audio‑first, hands‑free, screen‑off | Visual‑first, mixed | Visual‑first, subscription | Audio‑first, subscription | Social chat, visual | Passive video, no interactivity |
| Shadowing technique | Built‑in, zero‑screen | Not offered | Not offered | Not offered | Not offered | Manual, non‑interactive |
| Monetisation | ad-supported, free | Freemium (ads + premium) | Subscription | Subscription | Freemium (ads + premium) | Free (ad‑supported) |
| Target APAC (Vietnam) | High (Android 10+) | Medium (iOS focus) | Low (premium) | Low (price) | Medium (social) | High (content availability) |
| Threat level | **High** – Duolingo could add audio‑only mode |

## 5. Opportunity
- **Zero‑screen audio practice** enables users to keep phones in pockets, fitting seamlessly into commuting, cooking, and walking routines.
- **Hands‑free habit formation** drives daily engagement, targeting a 25 %+ 7‑day retention and ≥5‑day average streak.
- **Large underserved market**: millions of English learners in APAC lacking audio‑only practice tools.
- **Scalable ad‑supported model**: Content generated once, delivered to thousands; low per‑user compute cost.

### Additional Benefits
- **Low barrier to entry**: No subscription removes price friction, accelerating acquisition.

## 6. Assumptions
| # | Assumption | Validation Method | Success Criteria |
|---|------------|-------------------|------------------|
| 1 | Users will practice daily when it fits hands‑free routines | Cohort retention analysis (7‑day, 30‑day) | ≥25 % 7‑day retention; ≥5‑day avg streak |
| 2 | Audio ads at session boundaries are tolerated | A/B test (ad‑exposed vs ad‑free cohort) | ≤10 % retention drop for ad cohort |
| 3 | Background audio playback is reliable on iOS & Android | Crash/bug monitoring during beta | <1 % crash rate related to playback |
| 4 | AI‑generated scripts + TTS provide sufficient quality | Session completion & satisfaction surveys | >80 % session completion; ≥4‑star rating |
| 5 | CPM $15‑25 achievable at MVP scale | Monetisation reporting after 4 weeks | ≥$13 gross revenue per 1k MAU |
| 6 | Minimum OS versions do not exclude target market | Device‑OS distribution analysis (Vietnam) | ≤10 % of potential users excluded |

## 7. Risks & Mitigations
| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|------------|------------|
| R‑1 | Users won’t practice daily | High | High | Short sessions, push reminders, streak badges, monthly milestones |
| R‑2 | Audio ads cause retention loss | High | Medium | Limit to 1‑2 ads per day, monitor cohort retention, reduce frequency if >10 % drop |
| R‑3 | Background playback breaks on iOS/Android | High | Medium | Early prototype testing (Week 1), device‑matrix QA, fallback to foreground playback |
| R‑4 | Hands‑free interaction is cumbersome | Medium | Medium | Autoplay, voice‑command start/stop, minimal on‑screen taps for first/last interaction |
| R‑5 | Content pipeline insufficiently varied | Medium | Medium | Diverse TTS voices, multiple content categories, manual backup library |
| R‑6 | Ad‑network minimum thresholds unmet | High | High | Initial ad‑free launch window, tiered‑entry networks, fallback static ads |
| R‑7 | Safety/regulatory concerns (driving) | Medium | Medium | Disclaimer, limit visual prompts, legal review, optional “safe mode” |
| R‑8 | Android fragmentation in Vietnam | Medium | Medium | Target Android 10+, test on popular devices, collect OS data during onboarding |

## 8. Next Steps
1. Conduct 8‑10 user interviews with target Vietnam learners to validate pain points and daily routine fit.
2. Build a low‑fidelity audio prototype (single script, basic playback) and run usability tests on Android 10+ and iOS 14+ devices.
3. Design and launch a 2‑week internal beta to gather retention, crash, and ad‑tolerance data.
4. Set up ad‑network sandbox accounts (AdMob, Triton) to measure CPM potential.
5. Draft detailed measurement plan for each assumption (KPIs, data sources, analysis windows).
6. Iterate on content pipeline (prompt engineering, voice selection) based on early user feedback.

*Prepared for review by product leadership.*