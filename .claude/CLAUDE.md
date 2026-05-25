# CLAUDE.md — Project Rules

## Document Generation Rules

All generated documents must follow these conventions:

### Directory Structure

- All documents go under `specs/`
- Each lifecycle phase gets a numbered sub-folder: `NN-phase-name`
- Each document inside a phase folder uses a numbered filename: `NN-Document-name.md`
- Numbering should be sequential and semantic
- See [README.md](../README.md) for the current project-specific `specs/` structure and document index

### Creating a New Document

1. Check if a sub-folder already exists for the document type
2. Check [README.md](../README.md) for the existing lifecycle phase and document index
3. If the phase folder already exists, place the document inside it
4. If it does NOT exist, create the next numbered `NN-phase-name` folder
5. Name the file using the next available document number in that phase, for example `07-New-Document-Name.md`

### Naming Convention

- Folder: `NN-descriptive-name` (e.g., `01-mvp-analysis`, `02-prd`)
- File: `NN-Document-name.md`
- Use clear, searchable names

### Example Structure

```
specs/
├── 00-reference/
│   └── 00-Development-Lifecycle-Document-Checklist.md
├── 01-initiation-discovery/
│   ├── 01-Business-Request-Document.md
│   ├── 02-Product-Discovery-Document.md
│   └── 03-Business-Requirements-Document.md
└── 02-analysis/
    ├── 01-AS-IS-Analysis.md
    ├── 02-Future-State-Analysis.md
    └── ...
```

### What Counts as a Document

- PRD, MVP analysis, architecture docs, UX specs, API specs
- Technical design documents
- Research reports
- Any structured project documentation

## Agent Selection

Always consult the **agent-selector** skill before starting multi-step or specialized tasks. It selects the right VoltAgent subagent (100+ specialized agents) and generates a ready-to-use structured prompt. Use it for:

- **Building features** (frontend, backend, mobile, API, etc.)
- **Code reviews & security audits**
- **Architecture & design** (microservices, DB schema, system design)
- **Research** (market, competitor, technical)
- **Infrastructure** (deployment, CI/CD, cloud)
- **Documentation** (API docs, technical writing)
- **Any task that spans multiple domains or has specialized requirements**

If the user describes a task without naming an agent, default to using agent-selector rather than guessing the approach. This is your primary routing mechanism for deciding which specialized agent to invoke.

## Project Skills

### keycloak-auth
Use for any Keycloak-related task: creating/managing OIDC clients, protocol mappers (audience, roles, claims), users, roles, identity providers (Google, Facebook), organizations. Also for getting auth tokens for local testing and troubleshooting login/token/audience errors. The realm is ALWAYS `shadowspeak` — never use any other realm.

### backend-test-plan-executor
Use when asked to execute a backend API test plan, run tests, run the test plan, execute test cases, or verify the backend — after a test plan has been generated. This skill reads a test plan document (.md), executes each test case via curl, and writes results to a separate `.result.md` file. It NEVER modifies the test plan document. It is the ONLY skill that should run the curl commands from generated test plans — do NOT run them manually.

### backend-test-plan-generator
Use when asked to generate a backend API test plan, create API test cases, write tests for the backend API, or produce an executable backend API test plan — especially after writing or updating API specs, user stories, or test case specification documents. This skill is specific to backend API testing only. Requires all three inputs (API Design, User Story, Test Case Specification) to be available before proceeding. This skill ONLY reads spec documents (.md) — it does NOT read source code.

Every generated test plan MUST start with a notice directing AI agents to use the **backend-test-plan-executor** skill for execution, not manual curl commands.

## Project Context

- Project: ShadowSpeak — audio-first English shadowing practice app
- MVP goal: Validate retention, habit formation, and demand for audio-first speaking practice
- No real-time AI in MVP. AI used only offline for content generation (TTS, script generation)
- Ad-supported monetization only (no subscriptions in MVP)
- Target: iOS + Android (cross-platform recommended)
- Backend: AWS serverless (or Firebase for MVP simplicity)
