# AS‑IS Analysis

**Purpose:** Document the current state of the ShadowSpeak system based on the Business Requirements Document (BRD).

**Prepared by:** Business Analyst – [Name]

**Reference:** [Business Requirements Document](../01-initiation-discovery/03-Business-Requirements-Document.md)

---

## Existing workflow

1. **Onboarding** – User creates an account, selects proficiency level, and grants audio‑background permission.
2. **Daily recommendation** – Home screen displays a single recommended session (5‑15 min).
3. **Audio playback** – Session plays with screen‑off support and lock‑screen controls; background audio continues.
4. **Progress capture** – Streaks and practice time are recorded in real time.
5. **Ad insertion** – Audio ad is played at session boundaries (pre/post or inter‑session).
6. **Repeat next day** – Notification prompts the user for the next day’s session.

## Existing issue

- The MVP does not include real‑time AI pronunciation feedback or speech‑recognition, limiting the ability to provide instant corrective guidance to users.
- No social or community features (leaderboards, user‑generated content) are in scope, which may affect long‑term engagement and retention.

## Current system limitation

- **Technical constraint:** The architecture relies on React Native front‑end and AWS serverless back‑end with no real‑time AI, restricting the product to offline content generation (script + TTS) only.
- **Regulatory / safety constraint:** Must include driving‑safety disclaimer and comply with COPPA/GDPR‑K (age‑gate 13+), limiting certain in‑app interactions.
- **Budgetary limitation:** Approx. $1,050 / month infrastructure cost, constraining scalability and feature expansion.
