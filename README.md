# ShadowSpeak

ShadowSpeak is an audio-first English shadowing practice app.

The MVP is designed to help learners build a daily speaking habit by listening to short native-audio lessons, repeating them aloud, and tracking progress over time. The product intentionally avoids real-time AI in the MVP. AI is used only offline for content generation such as script writing and text-to-speech.

## What This Repo Contains

This repository is currently in the analyst and documentation phase for ShadowSpeak. The focus here is requirements gathering, product definition, and keeping the project documentation organized before implementation begins.

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

The spec set lives under `specs/` and is organized by lifecycle phase and numbered document name.

### Structure

- `specs/00-reference/` - reference material and checklists
- `specs/01-initiation-discovery/` - phase 1 documents
- `specs/02-analysis/` - phase 2 documents
- `specs/03-ux-ui-design/` - phase 3 UX/UI design documents

### Current Documents

- `specs/00-reference/00-Development-Lifecycle-Document-Checklist.md`
- `specs/01-initiation-discovery/01-Business-Request-Document.md`
- `specs/01-initiation-discovery/02-Product-Discovery-Document.md`
- `specs/01-initiation-discovery/03-Business-Requirements-Document.md`
- `specs/02-analysis/01-AS-IS-Analysis.md`
- `specs/02-analysis/02-Future-State-Analysis.md`
- `specs/02-analysis/03-Functional-Requirements-Specification.md`
- `specs/02-analysis/04-Non-Functional-Requirements-Document.md`
- `specs/02-analysis/05-Use-Case-Specification.md`
- `specs/02-analysis/06-User-Story-Document.md`
- `specs/03-ux-ui-design/01-User-Flow-Diagram.md`
- `specs/03-ux-ui-design/02-Information-Architecture-Document.md`
- `specs/03-ux-ui-design/03-Wireframe-Document.md`

See [AGENTS.md](AGENTS.md) and [CLAUDE.md](.claude/CLAUDE.md) for the doc-creation rules that follow this layout.

## Recommended Reading Order

If you are getting up to speed on the project, start here:

1. [00-Development-Lifecycle-Document-Checklist.md](specs/00-reference/00-Development-Lifecycle-Document-Checklist.md)
2. [03-Business-Requirements-Document.md](specs/01-initiation-discovery/03-Business-Requirements-Document.md)
3. [01-AS-IS-Analysis.md](specs/02-analysis/01-AS-IS-Analysis.md)
4. [02-Future-State-Analysis.md](specs/02-analysis/02-Future-State-Analysis.md)
5. [03-Functional-Requirements-Specification.md](specs/02-analysis/03-Functional-Requirements-Specification.md)
6. [04-Non-Functional-Requirements-Document.md](specs/02-analysis/04-Non-Functional-Requirements-Document.md)
7. [05-Use-Case-Specification.md](specs/02-analysis/05-Use-Case-Specification.md)
8. [06-User-Story-Document.md](specs/02-analysis/06-User-Story-Document.md)
9. [01-User-Flow-Diagram.md](specs/03-ux-ui-design/01-User-Flow-Diagram.md)
10. [02-Information-Architecture-Document.md](specs/03-ux-ui-design/02-Information-Architecture-Document.md)
11. [03-Wireframe-Document.md](specs/03-ux-ui-design/03-Wireframe-Document.md)

## Current Status

The project is in the analyst / discovery phase. The current work focuses on clarifying scope, MVP behavior, business rules, and implementation constraints so the product can move into design and build with less ambiguity.

## Audience

- Product and business stakeholders
- Designers and mobile engineers
- QA and test planning
- Anyone onboarding to the ShadowSpeak concept
