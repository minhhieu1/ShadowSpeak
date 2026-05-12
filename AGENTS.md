# AGENTS.md — Project Rules

## Document Generation Rules

All generated documents must follow these conventions:

### Directory Structure

- All documents go under `specs/`
- Each document type gets a numbered sub-folder: `NN-name`
- Numbering should be sequential and semantic (e.g., `01-overview`, `02-prd`, `03-architecture`)

### Creating a New Document

1. Check if a sub-folder already exists for the document type
2. If it does, place the document inside the existing folder
3. If it does NOT, create a new numbered sub-folder (e.g., `04-ux-design`)
4. Number should be the next available in sequence

### Naming Convention

- Folder: `NN-descriptive-name` (e.g., `01-mvp-analysis`, `02-prd`)
- File: `PascalCase_or_kebab-case_descriptive_name.md`
- Use clear, searchable names

### Example Structure

```
specs/
├── 01-mvp-analysis/
│   └── ShadowSpeak_MVP_Analysis.md
├── 02-prd/
│   └── Product_Requirements_Document.md
└── 03-architecture/
    └── system-architecture.md
```

### What Counts as a Document

- PRD, MVP analysis, architecture docs, UX specs, API specs
- Technical design documents
- Research reports
- Any structured project documentation

## Project Context

- Project: ShadowSpeak — audio-first English shadowing practice app
- MVP goal: Validate retention, habit formation, and demand for audio-first speaking practice
- No real-time AI in MVP. AI used only offline for content generation (TTS, script generation)
- Ad-supported monetization only (no subscriptions in MVP)
- Target: iOS + Android (cross-platform recommended)
- Backend: AWS serverless (or Firebase for MVP simplicity)
