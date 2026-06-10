# CLAUDE.md — Project Rules

## Directory Structure

```
/
├── README.md                               # Project overview, tech stack, setup
├── AGENTS.md                               # Agent reference
├── backend/                                # FastAPI backend
│   ├── app/                                # Application source code
│   ├── tests/                              # Backend tests
│   └── shadowspeak_backend.egg-info/
├── frontend/                               # React Native mobile app
│   ├── src/                                # Frontend source code
│   └── assets/                             # Images, fonts, etc.
├── helper/                                 # Development utilities
│   ├── docker/                             # Docker configs
│   ├── mockserver/                         # Mock server for testing
│   └── postman/                            # Postman collections
├── scripts/                                # Build and automation scripts
├── specs/                                  # Project documentation (lifecycle phases)
│   ├── 00-reference/                       # Lifecycle checklist, templates
│   ├── 01-initiation-discovery/            # BRD, PDD, BRD
│   ├── 02-analysis/                        # AS-IS, Future-State, FRS, NFR, Use Cases
│   ├── 03-ux-ui-design/                    # User flows, wireframes, UI specs
│   ├── 04-solution-architecture/           # SAD, HLD, LLD, API spec, DB design
│   ├── 05-development/                     # MVP plan, task breakdowns
│   ├── 06-testing/                         # Test scenarios, cases, plans
│   └── 07-release/                         # Deployment runbook, release notes
└── .claude/                                # Claude AI config
    ├── CLAUDE.md                           # This file — project rules
    └── skills/                             # Custom skills
        ├── document-generator/             # Document generation workflow
        └── ...                             # Other project skills
```

## Skills Reference

When the user describes a task, scan this table to pick the right skill. **If no skill matches, default to `agent-selector`.**

| Skill | Use When User Says... | Key Notes |
|-------|----------------------|-----------|
| **agent-selector** | Any multi-step or specialized task: building features, code review, architecture, research, infrastructure, documentation. Default when no other skill matches. | Primary routing mechanism — selects from 100+ VoltAgent subagents and generates a structured prompt. |
| **document-generator** | "generate a document", "create a doc", "write a [BRD/PRD/FRS/SAD/etc.]", "document the [feature/system]", or any structured documentation request (requirements, architecture, design, test plan, release notes). | Orchestrates writer + independent reviewer sub-agents per the lifecycle checklist at `specs/00-reference/00-Development-Lifecycle-Document-Checklist.md`. Saves to `specs/`. |
| **keycloak-auth** | Any Keycloak task: OIDC clients, protocol mappers (audience, roles, claims), users, roles, identity providers (Google, Facebook), organizations, auth tokens, login/token/audience errors. | Realm is ALWAYS `shadowspeak` — never use any other realm. |
| **backend-test-plan-executor** | "execute the test plan", "run tests", "run the test plan", "execute test cases", "verify the backend" — after a test plan has been generated. | Reads `.md` test plan, runs curl commands, writes to `.result.md`. NEVER modifies the test plan. This is the ONLY skill that executes tests — do NOT run curl manually. |
| **frontend-test-plan-executor** | "test frontend", "execute frontend test plan", "run frontend tests", "check UI", "launch the app", "verify the frontend", "test the app", or any simulator/testing request. | Reads `.md` test plan, runs ios-simulator-skill scripts, writes to `.result/` directory. NEVER modifies the test plan. This is the ONLY skill that executes frontend tests — do NOT run ios-simulator-skill scripts manually. |
| **backend-test-plan-generator** | "generate a test plan", "create API test cases", "write tests for the backend API", "produce an executable test plan" — after writing API specs, user stories, or test case specs. | Requires all 3 inputs: API Design, User Story, Test Case Specification. Reads spec docs only (.md), never source code. Generated test plans MUST include a notice directing execution to `backend-test-plan-executor`. **Has a RED/GREEN review gate** — after generation, an independent reviewer agent validates the plan; only APPROVED plans are shown to the user. |
| **frontend-test-plan-generator** | "generate a frontend test plan", "create UI test cases", "write tests for the screens", "produce an executable test plan for the frontend", "test the app screens", "verify the UI" — after writing UX specs, generated screen designs, user stories, or frontend test case documents. | Requires User Story + Frontend Test Case Specification. Reads UX design docs (.md) and generated screen images (.png) only — never source code. Generated test plans MUST include both Design Matching and Screen Functioning tests, and direct execution to `frontend-test-executor`. **Has a RED/GREEN review gate** — after generation, an independent reviewer agent validates the plan; only APPROVED plans are shown to the user. |
| **ios-simulator-skill** | Interact with the iOS simulator: launch apps, map screens, tap/type/swipe, compare current screen with designs, take screenshots, run accessibility audits, check app state, manage device lifecycle. Use when saying "see my simulator", "compare screen with design", "test on simulator", "launch the app", "navigate the app", or any simulator interaction request. | Plugin: `ios-simulator-skill@conorluddy`. Scripts located in plugin cache under `skills/ios-simulator-skill/`. Key scripts: `screen_mapper.py` (map UI elements), `navigator.py` (tap/type), `app_launcher.py` (launch/manage apps), `app_state_capture.py` (screenshot + app state), `accessibility_audit.py` (WCAG checks). **Load this skill BEFORE any simulator interaction.** |

## Project Context

- Project: ShadowSpeak — audio-first English shadowing practice app
- MVP goal: Validate retention, habit formation, and demand for audio-first speaking practice
- No real-time AI in MVP. AI used only offline for content generation (TTS, script generation)
- Ad-supported monetization only (no subscriptions in MVP)
- Target: iOS + Android (cross-platform recommended)
- Backend: AWS serverless (or Firebase for MVP simplicity)
