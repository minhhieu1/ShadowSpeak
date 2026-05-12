# ShadowSpeak

ShadowSpeak is an audio-first English shadowing practice app.

The MVP is designed to help learners build a daily speaking habit by listening to short native-audio lessons, repeating them aloud, and tracking progress over time. The product intentionally avoids real-time AI in the MVP. AI is used only offline for content generation such as script writing and text-to-speech.

## What This Repo Contains

This repository is currently in the analyst phase for ShadowSpeak. The focus here is requirements gathering, product definition, and validating the MVP scope before implementation begins.

## MVP Summary

- Audio-first, hands-free shadowing practice
- Daily recommended lessons
- Local recording and playback for self-comparison
- Progress tracking and streaks
- Offline lesson download and practice
- Local reminder notifications
- Ad-supported monetization only
- Cross-platform target: iOS and Android
- Backend direction: AWS serverless or Firebase for MVP simplicity

## Product Goals

- Validate whether users form a daily practice habit when screen time is removed
- Validate ad-supported monetization without subscriptions in the MVP
- Deliver shadowing effectively without real-time AI coaching or speech recognition
- Build a repeatable offline content pipeline using script generation and TTS

## Key Constraints

- No live AI pronunciation scoring in the MVP
- No subscriptions or premium tiers in the MVP
- No social features, leaderboards, or user-generated content in the MVP
- Must support an audio-first, screen-off practice flow
- Must respect age-gate, privacy, and reminder/consent requirements

## Documentation

The spec set lives under `specs/` and is organized by document type.

- `specs/01-business-request/ShadowSpeak_Business_Request_Document.md`
- `specs/02-product_discovery/Product_Discovery_Document.md`
- `specs/03-business-requirements/Business_Requirements_Document.md`
- `specs/04-current_state_analysis/AS-IS_Analysis.md`
- `specs/05-future_state_analysis/Future_State_Analysis.md`
- `specs/06-functional_requirements/Functional_Requirements_Specification.md`
- `specs/07-non-functional-requirements/Non-Functional_Requirements_Document.md`
- `specs/08-use-case-specification/Use_Case_Specification.md`
- `specs/09-user-story/User_Story_Document.md`

## Recommended Reading Order

If you are getting up to speed on the project, start here:

1. Business Requirements Document
2. Functional Requirements Specification
3. Non-Functional Requirements Document
4. Use Case Specification
5. User Story Document

## Current Status

The project is in the analyst / discovery phase. The current work focuses on clarifying scope, MVP behavior, business rules, and implementation constraints so the product can move into design and build with less ambiguity.

## Audience

- Product and business stakeholders
- Designers and mobile engineers
- QA and test planning
- Anyone onboarding to the ShadowSpeak concept
