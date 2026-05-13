# Non-Functional Requirements Document

**Version:** 1.0

**Date:** 2026-05-12

**Owner:** Architect / Tech Lead

---

## 1. Introduction

This Non-Functional Requirements (NFR) document defines the quality attributes, measurable criteria, and constraints that apply to the ShadowSpeak audio‑first English shadowing practice application.  The NFRs complement the functional requirements specified in `specs/02-analysis/03-Functional-Requirements-Specification.md` and are used by architects, developers, QA, and operations to ensure the MVP meets performance, security, scalability, availability, compliance and other quality goals.

---

## 2. Non‑Functional Requirements

| ID | Category | Requirement | Target / Metric | Priority | Assumptions / Constraints |
|----|----------|-------------|----------------|----------|---------------------------|
| NFR-1 | **Performance** | App launch time (cold start) | ≤ 2.5 seconds on iOS 16+ / Android 10+ devices (mid‑range) | High | Measured on first launch after install; subsequent warm starts must be ≤ 1 second.
| NFR-2 | **Performance** | Audio playback latency (time from user tap to audible output) | ≤ 150 ms | High | Uses native audio APIs; network streaming not required for offline assets.
| NFR-3 | **Performance** | Content list pagination response time (API) | 95 % of requests ≤ 300 ms | Medium | Backend hosted on AWS Lambda / Firebase Functions; includes network round‑trip.
| NFR-4 | **Performance** | Download of lesson assets (average 5 MB) | ≥ 5 Mbps effective throughput, completion within 10 seconds on 3G/4G | Medium | Requests use HTTPS with range‑support; retry on failure.
| NFR-5 | **Security** | Authentication mechanism | OAuth‑2.0 with JWT, token expiry ≤ 24 h, refresh flow supported | High | AWS Cognito or Firebase Auth; tokens signed with RSA‑256.
| NFR-6 | **Security** | Data‑in‑transit encryption | TLS 1.2+ with forward secrecy for all API calls and ad SDK requests | High | Backend endpoints must enforce HTTPS; no plain‑text endpoints.
| NFR-7 | **Security** | Data‑at‑rest encryption | All user‑generated content (recordings, metrics) stored encrypted using AES‑256‑GCM | High | Mobile device storage uses iOS Keychain / Android Keystore; backend storage uses AWS KMS or Firestore encryption.
| NFR-8 | **Security** | OWASP Mobile Top‑10 compliance | No critical vulnerabilities in static analysis; remediate medium‑severity findings within 2 weeks | Medium | CI pipeline includes MobSF scan.
| NFR-9 | **Scalability** | Concurrent active users supported | 10 000 simultaneous active sessions without degradation | High | Autoscaling groups for API tier; CDN edge caching for static assets.
| NFR-10 | **Scalability** | Data storage growth | ≤ 100 GB of user metrics and recordings after 12 months, with linear cost scaling | Medium | Use serverless storage (S3 / Firebase Storage) with lifecycle policies.
| NFR-11 | **Availability** | Backend service SLA | 99.9 % monthly uptime (≈ 43 minutes downtime/month) | High | Multi‑AZ deployment; health‑checks and automatic failover.
| NFR-12 | **Availability** | Client‑side offline mode availability | 100 % of downloaded lessons playable when device is offline | High | Assets stored locally with checksum verification.
| NFR-13 | **Compliance** | Privacy regulations | GDPR, CCPA, and Apple/Google privacy policy compliance; ability to delete all personal data on request within 30 days | High | Data controller responsibilities documented; consent recorded at registration.
| NFR-14 | **Compliance** | Accessibility | WCAG 2.1 AA conformance for UI components (contrast, tap targets, screen‑reader labels) | Medium | Needs testing on iOS VoiceOver and Android TalkBack.
| NFR-15 | **Compliance** | App Store / Play Store policies | AdMob integration meets Google policies; no prohibited content; app size ≤ 150 MB | High | Release bundles must pass store review.
| NFR-16 | **Maintainability** | Code coverage | ≥ 80 % unit test coverage, ≥ 70 % integration test coverage | Medium | CI pipeline enforces coverage thresholds.
| NFR-17 | **Maintainability** | Documentation sync | Documentation (functional & non‑functional) updated within 2 sprints of any spec change | Medium | Pull‑request template includes doc update checklist.
| NFR-18 | **Portability** | Cross‑platform support | Single codebase (React Native / Flutter) builds for iOS 16+ and Android 10+ with feature parity | High | Build pipeline must produce both IPA and AAB artifacts.
| NFR-19 | **Usability** | First‑time user onboarding completion | ≥ 70 % of new users finish onboarding flow within 3 minutes | Medium | Onboarding includes brief tutorial and first lesson download.
| NFR-20 | **Reliability** | Crash rate | ≤ 0.5 % of sessions end with an unhandled crash (sessions ≥ 5 min) | High | Crashlytics monitoring and alerting.
| NFR-21 | **Usability** | Returning-user daily practice flow clarity | ≥ 80 % of returning users reach today's lesson or resume state within 2 taps, and the current streak/completion status is visible from the home screen | Medium | Measured on the main return-to-practice path after sign-in or app reopen.

---

## 3. Detailed Requirements

### 3.1 Performance
- **App Launch:** Measured from icon tap to first render of home screen. Must meet NFR‑1 on supported devices.
- **Audio Playback:** Leveraging native playback APIs (AVAudioPlayer / ExoPlayer) to guarantee NFR‑2 latency.
- **API Response:** Backend endpoints must complete within 300 ms for 95 % of calls (NFR‑3). Use CDN edge caching for static lesson metadata.
- **Download Throughput:** Provide resumable download with checksum verification; fallback to slower networks gracefully (NFR‑4).

### 3.2 Security
- **Authentication/Authorization:** JWT signed with RSA‑256; token introspection performed on each protected call.
- **Transport Security:** Enforce HSTS, disable weak cipher suites, and require forward secrecy.
- **Data Protection:** Use platform‑provided secure storage for keys; encrypt all recordings before upload.
- **Threat Modeling:** Conduct STRIDE analysis; mitigate injection, insecure storage, and data leakage.

### 3.3 Scalability
- **Backend Autoscaling:** Configure Lambda concurrency limits and Firestore read/write scaling to handle peak load of 10 k concurrent users (NFR‑9).
- **Content Delivery:** Host static audio files in S3 with CloudFront distribution; enable HTTP/2 and range requests.
- **Growth Planning:** Storage lifecycle policies archive recordings older than 12 months to Glacier‑compatible storage.

### 3.4 Availability
- **Service Redundancy:** Deploy API in at least two Availability Zones; use health‑check‑driven load balancer.
- **Failover:** In case of regional outage, DNS failover redirects to secondary region within 60 seconds.
- **Offline Mode:** All lesson assets must be locally cached; UI must indicate offline status without error dialogs.

### 3.5 Compliance
- **Privacy:** Collect only email, optional profile data, and usage metrics. Provide clear consent UI and data‑deletion endpoint.
- **Accessibility:** Follow WCAG 2.1 AA; provide scalable text, sufficient contrast, and accessible tappable elements.
- **Store Policies:** Integrate AdMob banner ads per Google Mobile Ads SDK guidelines; ensure no ad content is shown to minors without parental consent.

### 3.6 Other NFRs
- **Maintainability:** Enforce code linting, PR review checklist, and automated documentation generation from code comments.
- **Portability:** Application built with React Native (or Flutter) to share UI logic; native modules isolated.
- **Usability:** Onboarding flow limited to three screens; progress indicators for downloads.
- **Reliability:** Implement global exception handler; upload crash reports anonymously.

---

## 4. Assumptions & Constraints
- Backend services are server‑less (AWS Lambda / Firebase Functions) with maximum cold‑start of 500 ms.
- All third‑party SDKs (AdMob, Auth provider) are up‑to‑date and support the target OS versions.
- Users have devices with at least 2 GB RAM and 1 GHz CPU; performance targets are based on these baseline specs.
- Network conditions vary; NFR‑4 assumes average 3G/4G throughput of 5 Mbps.

---

## 5. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-05-12 | Architect / Tech Lead | Initial creation of Non‑Functional Requirements Document |

---
