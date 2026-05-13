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

## Project Context

- Project: ShadowSpeak — audio-first English shadowing practice app
- MVP goal: Validate retention, habit formation, and demand for audio-first speaking practice
- No real-time AI in MVP. AI used only offline for content generation (TTS, script generation)
- Ad-supported monetization only (no subscriptions in MVP)
- Target: iOS + Android (cross-platform recommended)
- Backend: AWS serverless (or Firebase for MVP simplicity)
