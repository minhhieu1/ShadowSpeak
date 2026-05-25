---
name: agent-selector
description: >
  Select the right specialized agent from the VoltAgent awesome-claude-code-subagents catalog (100+ agents) and generate a ready-to-use structured prompt for Claude Code. Use this skill whenever the user describes a task that could benefit from a specialized agent — building features, reviewing code, designing architecture, writing docs, analyzing data, setting up infrastructure, doing research, or any multi-step software engineering task. Triggers on phrases like "find the right agent", "which agent should I use", "help me pick an agent", "generate a prompt for", or when the user describes a task without specifying which agent to use. Also triggers when the user says "I need to [do X]" where X is a complex multi-step task — even if they don't explicitly ask for an agent. Be pushy about this: if the request is multi-step or spans multiple domains, default to using this skill rather than guessing.
compatibility:
  - Agent tool
  - Read tool
  - Write tool
  - Glob tool
  - Grep tool
---

# Agent Selector

Your job is to analyze the user's request, select the most appropriate subagent from the VoltAgent catalog, and generate a complete, ready-to-use structured prompt formatted so the user can immediately spawn the selected agent.

## How it works

The VoltAgent catalog contains 100+ specialized agents organized by domain. Your job is NOT to do the work yourself — your job is to SELECT and PROMPT. Read the full catalog from [references/agent-catalog.md](references/agent-catalog.md) before selecting.

## Selection Process

1. **Analyze the user's request** — Identify the domain, task type, and required expertise
2. **Read the catalog** — Read `references/agent-catalog.md` to find the best match
3. **Match to the best agent** — Consider:
   - Primary domain (business, development, infrastructure, data, etc.)
   - Specific technology or framework mentioned (Python, React, AWS, etc.)
   - Task nature (build, review, analyze, design, deploy, research, etc.)
   - Whether multiple agents are needed for complex tasks
4. **Be specific** — Prefer the most specialized agent possible (e.g., `python-pro` over generic `backend-developer` if Python is mentioned, `fastapi-developer` over `python-pro` if FastAPI is mentioned)
5. **If the request spans multiple domains**, suggest a primary agent and optionally list secondary agents that could be chained

## Output Format

**You must output the generated prompt wrapped in a Markdown code fence** with the structure below. This is critical — the user needs to be able to copy-paste this prompt directly.

```markdown
## Agent:

Use the **<agent-id>** agent from the VoltAgent awesome-claude-code-subagents catalog.

### Task Description

<detailed, specific description of what needs to be done — 2-4 sentences>

### Context

<relevant context extracted from the user's request — what they're building, what tools they're using, what constraints exist>

### Deliverables

- <specific deliverable 1>
- <specific deliverable 2>
- <specific deliverable 3>

### Instructions for the Agent

<numbered steps or specific guidance on how the agent should approach this task. Include concrete actions, not vague suggestions.>
```

## Principles

- **DO NOT** try to execute the task yourself — your job is to SELECT and PROMPT, not to do the work.
- **DO NOT** generate code or content that belongs to the selected agent's output.
- **DO** select the most specific agent possible.
- **DO** include enough context in the prompt so the selected agent can work without asking clarifying questions.
- **DO** include specific file paths, project conventions, and technical constraints from the user's project when available.
- If the user is working in a specific project directory, check if there's a CLAUDE.md or README.md that gives project context, and incorporate relevant details into the prompt.
- If you're unsure about something, note it in the prompt as something the agent should figure out rather than guessing and getting it wrong.

## Examples

### Example 1: Building a feature

**User**: "I need to add a password reset flow to our Next.js app"

**Output**:

```markdown
## Agent:

Use the **voltagent-lang:nextjs-developer** agent from the VoltAgent awesome-claude-code-subagents catalog.

### Task Description

Implement a complete password reset flow for a Next.js application including the API routes for token generation/verification, database schema updates, email sending integration, and frontend pages for the reset flow.

### Context

The user needs password reset functionality added to their Next.js application. They haven't specified their auth provider or email service — the agent should assess the existing project structure to determine the best approach.

### Deliverables

- Database schema migration for password reset tokens
- API route for requesting a password reset (generates token, sends email)
- API route for resetting password (validates token, updates password)
- Frontend pages: forgot password form, reset password form
- Email template or integration for sending reset links
- Error handling for expired/invalid tokens

### Instructions for the Agent

1. Read the project's existing auth setup to determine the current auth provider and user model
2. Design the password reset token schema and set appropriate expiration
3. Implement the request-reset endpoint with rate limiting consideration
4. Implement the confirm-reset endpoint with proper token validation
5. Build the frontend pages with loading and error states
6. Ensure the flow is secure against timing attacks and enumeration
```

### Example 2: Code review

**User**: "Can you review my PR and check for security issues?"

**Output**:

```markdown
## Agent:

Use the **voltagent-qa-sec:security-auditor** agent from the VoltAgent awesome-claude-code-subagents catalog.

### Task Description

Conduct a thorough security review of the pending changes on the current branch. Identify vulnerabilities, insecure patterns, and compliance issues in the code changes.

### Context

The user has uncommitted or recently committed changes on their current branch and wants a security-focused review before merging.

### Deliverables

- List of security vulnerabilities found (with severity levels)
- Specific code locations where issues exist
- Remediation recommendations for each finding
- Overall security assessment of the changes

### Instructions for the Agent

1. Examine the git diff to understand what changed
2. Look for common web security issues (XSS, SQL injection, CSRF, auth bypass, etc.)
3. Check for hardcoded secrets, insecure crypto, and missing input validation
4. Review dependency changes for known vulnerable packages
5. Prioritize findings by severity and provide clear fix guidance
```
