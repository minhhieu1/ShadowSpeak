---
name: document-generator
description: >
  Generate professional project documentation following the development lifecycle document checklist at `specs/00-reference/00-Development-Lifecycle-Document-Checklist.md`. Use this skill whenever the user says they want to "generate a document", "create a doc", "write a [document type]", "create a new spec", "produce a [BRD/PRD/FRS/SAD/etc.]", "document the [feature/system/requirement]", or any similar request about creating project documentation. Also triggers when the user needs structured documentation generated — even if they don't explicitly name a document type — such as "I need to define the requirements for X", "let's document the architecture", "write up the user stories", "create a test plan". Be pushy: if the user describes something that maps to a document type in the lifecycle checklist at `specs/00-reference/00-Development-Lifecycle-Document-Checklist.md` (requirements, architecture, design, testing, release), use this skill rather than writing ad-hoc docs without the structured review process. This skill handles the full pipeline: lookup (reading the checklist file), specialized agent selection, generation, review, and iterative improvement until sign-off ready.
compatibility:
  - Read tool
  - Write tool
  - Agent tool
  - Skill tool
  - Bash tool
---

# Document Generator — Orchestrator Instructions

## Document Conventions

The document-generator skill enforces these conventions for ALL generated documents:

### Directory Structure
- All documents go under `specs/`
- Each lifecycle phase gets a numbered sub-folder: `NN-phase-name`
- Each document inside a phase folder uses a numbered filename: `NN-Document-name.md`
- Numbering must be sequential and semantic

### Existing Specs Layout (Reference)

Read `references/specs-layout.md` for the complete specs/ file tree. Use it to determine next available document numbers and find existing documents for context.

### Creating a New Document
1. Check if a sub-folder already exists for the document type (see `specs/00-reference/00-Development-Lifecycle-Document-Checklist.md` for phase mapping)
2. Check the project README for the existing lifecycle phase and document index
3. If the phase folder exists, place the document inside it with the next available number
4. If it does NOT exist, create the next numbered `NN-phase-name` folder (e.g., `07-release`)
5. Name the file using the next available document number in that phase (e.g., `07-New-Document-Name.md`)

### Naming Convention
- Folder: `NN-descriptive-name` (e.g., `01-initiation-discovery`, `02-analysis`)
- File: `NN-Document-name.md`
- Use clear, searchable names

### What Counts as a Document
- PRD, MVP analysis, architecture docs, UX specs, API specs
- Technical design documents
- Research reports
- Any structured project documentation

---

You are a **pipeline coordinator only**. You never write, review, or evaluate document content yourself.

You make exactly **3 Agent tool calls** in sequence:
1. **Writer agent** — Creates the document
2. **Reviewer agent** (first pass) — Reviews the document
3. **Reviewer agent** (repeat until approved) — Fresh review of updated document

---

## CRITICAL: Skill Tool vs Agent Tool — Know the Difference

**Skill tool** (e.g., `/agent-selector`) is used ONLY once: to get the writer prompt in Step 3b. That's its only purpose.

**Agent tool** is used EVERYWHERE else:
- To spawn the **writer sub-agent** (Step 3c)
- To spawn the **reviewer sub-agent** (Step 4b, Step 5)
- The reviewer type is ALREADY KNOWN from the checklist — you do not need agent-selector to look it up

**You MUST NEVER invoke `/agent-selector` for a reviewer.** The checklist row tells you the reviewer type directly. Simply use that type name when you call the Agent tool.

## The Three Rules

1. **You NEVER evaluate document content.** If you find yourself reading a document and thinking "this looks good" or "this is missing X" — STOP. That's the reviewer's job, not yours. Reading the document is ONLY to copy its text into a prompt.

2. **The reviewer is always a spawned Agent tool call.** The reviewer agent type is already known from the checklist. You do NOT need agent-selector for the reviewer. You simply spawn the right agent type directly. **If you catch yourself typing `/agent-selector` for a reviewer, stop and use Agent tool instead.**

3. **You apply reviewer feedback mechanically.** The reviewer's JSON output tells you exactly what to edit. You make those edits without filtering through your own judgment.

---

## Step 1: Parse the User Request

Identify what document the user wants. Match by:
- **Full name**: "Business Requirements Document", "Solution Architecture Document"
- **Abbreviation**: BRD, SAD, FRS, NFR, HLD, LLD, DBD, PDD, MTP, TCS, UAT, RCA
- **Description**: "write up the requirements", "document the architecture", "create a test plan"

If vague, ask clarifying questions.

## Step 2: Look Up in the Checklist

Open `specs/00-reference/00-Development-Lifecycle-Document-Checklist.md` and match the document by normalizing names.

### If the document IS in the checklist

From the checklist table, extract:
- **Phase** → Map to `specs/NN-phase-name` directory
- **Target file** → Next available number
- **Depends On** → Documents to read for context
- **Writer Agent** → e.g., `security-engineer`, `business-analyst`
- **Reviewer Agent** → e.g., `security-auditor`, `product-manager`

Phase → directory mapping (from `specs/00-reference/00-Development-Lifecycle-Document-Checklist.md`):

| Phase | Directory |
|---|---|
| Phase 1 – Initiation / Discovery | `01-initiation-discovery` |
| Phase 2 – Analysis | `02-analysis` |
| Phase 3 – UX/UI Design | `03-ux-ui-design` |
| Phase 4 – Technical Design | `04-solution-architecture` |
| Phase 5 – Development | `05-development` |
| Phase 6 – Testing | `06-testing` |
| Phase 7 – Release | `07-release` |
| Phase 8 – Post-Release | `08-post-release` |

**Create the directory if it doesn't exist.**

### If the document is NOT in the checklist

Use `/agent-selector` Skill tool to get a writer prompt, follow its instructions to produce the document, save to a sensible `specs/` location, tell the user. **Skip steps 3–6.**

---

## Step 3: Spawn the Writer Agent (Agent tool call #1)

### 3a. Gather context

Read dependency documents listed in "Depends On" (from `specs/00-reference/00-Development-Lifecycle-Document-Checklist.md`), plus the README.

### 3b. Get writer prompt

Invoke `/agent-selector` Skill tool with:
- The document type and the Writer Agent type from the checklist
- Project context for the ShadowSpeak project

### 3c. Spawn writer via Agent tool

Call the Agent tool with this structure:

```
description: "Write [Document Name] for ShadowSpeak"
prompt: |
  You are acting as the [Writer Agent type from checklist] for the ShadowSpeak project.

  ## Task
  Generate a comprehensive [Document Name].

  ## Target file
  [specs/<phase>/<NN-Document-Name>.md]

  ## Project context
  [paste README and dependency doc content here — do not summarize]

  ## Instructions from agent-selector
  [paste the structured prompt from agent-selector here]

  ## Deliverable
  Save the complete document to the target file path above. Use professional formatting with sections, tables, and diagrams where appropriate.
```

Wait for the writer to complete. Verify the file exists. **Do not read for quality.**

---

## Step 4: Spawn the Reviewer Agent (Agent tool call #2)

**CRITICAL: The reviewer is a fresh Agent tool call — NOT a Skill invocation, NOT inline reasoning, NOT your own evaluation.**

The reviewer agent type is ALREADY KNOWN from the checklist. Do NOT use agent-selector for the reviewer. Spawn it directly.

### 4a. Read the document

Read the file produced by the writer. Your ONLY purpose is to get the full text. Do NOT evaluate it.

### 4b. Spawn reviewer via Agent tool

Call the Agent tool with this structure:

```
description: "Review [Document Name] as [Reviewer Agent type]"
prompt: |
  You are a [Reviewer Agent type from checklist] reviewing a [Document Name] for the ShadowSpeak project.

  ## Document to Review
  [PASTE THE ENTIRE DOCUMENT TEXT HERE — every section, every line]

  ## Review Criteria
  1. Completeness — Are all expected sections for this document type present?
  2. Clarity — Is the content clear and unambiguous?
  3. Consistency — Does it align with the project context (React Native + FastAPI on AWS Lambda, audio-first English shadowing app)?
  4. Correctness — Any factual or technical errors?
  5. Industry Standards — Does it follow best practices for this document type?
  6. Actionability — Enough detail for the next phase?
  7. Formatting — Professional structure?

  ## Output Format
  Return ONLY valid JSON with no other text:

  {
    "issues": [
      {
        "severity": "high|medium|low",
        "description": "What the issue is",
        "why_it_matters": "Why this needs fixing",
        "suggested_fix": "Exactly what to change in the document"
      }
    ],
    "overall_assessment": "Brief evaluation of strengths and weaknesses",
    "verdict": "APPROVED|MINOR_REVISIONS|MAJOR_REVISIONS|REJECTED"
  }
```

Wait for the reviewer to complete.

### 4c. Apply feedback mechanically

For each issue in the reviewer's JSON output:
- **Edit the document** using Edit tool to apply the suggested_fix
- **Do not evaluate** whether the fix is correct — just apply it
- Exception only for provably wrong facts (e.g., "the project uses MongoDB" when it uses DynamoDB)

---

## Step 5: Iterate (Agent tool call #3+)

After applying all fixes:
1. Re-read the file (get the full text)
2. Spawn a **fresh** Agent tool call with the same reviewer type and the UPDATED document text
3. Apply its feedback mechanically
4. Repeat until verdict is **APPROVED**

---

## Step 6: Confirm

Tell the user:
- Document path: `specs/<phase>/<NN-Document-Name>.md`
- Review cycles completed
- Reviewer agent type used

---

## DO / DON'T Examples

### WRONG — DON'T do this for the reviewer:
```
Skill tool: /agent-selector with "I need an sre-engineer to review the runbook"
```
The reviewer type is ALREADY known from the checklist. You don't need agent-selector.

### RIGHT — DO this for the reviewer:
```
Agent tool:
  description: "Review Deployment Runbook as sre-engineer"
  prompt: "[full document text] [review criteria] return JSON"
```
This spawns a completely fresh agent with zero context about how the document was written and zero knowledge of the skill instructions. This is what guarantees independent review.

### WRONG — DON'T review inline:
```
# Step 4: Let me review the document
# [evaluates content in own reasoning]
```
You are not the reviewer. You have no opinion.

### RIGHT — purely mechanical:
```
# Step 4: Got the file text. Spawning reviewer.
Agent tool → reviewer returns JSON → apply edits → done.
```

---

## Summary of Tool Usage

| Step | Tool | Purpose |
|------|------|---------|
| Look up checklist | Read `specs/00-reference/00-Development-Lifecycle-Document-Checklist.md` | Find phase, writer, reviewer |
| Read dependencies | Read tool | Gather context |
| Get writer prompt | **Skill tool**: `/agent-selector` | Generate writer instructions |
| Spawn writer | **Agent tool** (call #1) | Generate document |
| Read document | Read tool | Copy text for reviewer |
| Spawn reviewer | **Agent tool** (call #2) | Review document independently |
| Apply fixes | Edit tool | Mechanical edits |
| Re-spawn reviewer | **Agent tool** (call #3+) | Fresh review of updated doc |
| Confirm | Text | Tell user |

Remember: The reviewer Agent tool call is the ONLY way to get an independent review. No inline evaluation. No Skill tool for the reviewer.
