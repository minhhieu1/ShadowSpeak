---
name: screen-analysis
description: Analyze a screen's design specs (ux docs + png) before implementing it. Must execute before any frontend planning, task decomposition, component generation, or screen implementation. No frontend code may be written before this skill completes. Use whenever the user says "analyze screen", "analyze [screen name]", "implement [screen name]", "build [screen name]", "create [screen name] screen", "plan [screen name]", or any frontend work for a specific screen — even if they don't mention analysis explicitly.
---

# Screen Analysis Skill

## Purpose

This skill MUST execute before:

- frontend planning
- task decomposition
- component generation
- screen implementation

**No frontend code may be written before this skill completes.**

This skill analyzes one screen at a time. If the user mentions multiple screens, choose the most important one (or ask). The result is a Screen Contract that fully specifies what needs to be built.

---

## Required Inputs

Read ALL of the following before analysis. Do not skip any step.

The paths below are relative to the project root (`/Volumes/Data/Coding/Shadowing/`).

### 1. User Flow
`specs/03-ux-ui-design/01-User-Flow-Diagram.md`
- Purpose: determine navigation path, previous/next screen, entry/exit points

### 2. Information Architecture
`specs/03-ux-ui-design/02-Information-Architecture-Document.md`
- Purpose: determine screen ownership, feature grouping, hierarchy, section structure

### 3. Wireframe
`specs/03-ux-ui-design/03-Wireframe-Document.md`
- Purpose: determine screen layout, content structure, information grouping

### 4. UI Design Specification
`specs/03-ux-ui-design/04-UI-Design-Specification.md`
- Purpose: determine spacing, typography, colors, design tokens, visual hierarchy

### 5. Interactive Prototype
`specs/03-ux-ui-design/05-Interactive-Prototype.md`
- Purpose: determine interactions, gestures, transitions, state changes

### 6. Asset Inventory
`specs/03-ux-ui-design/06-UI-Asset-Inventory.md`
- Purpose: determine icons, illustrations, images, media assets

### 7. Screen PNG
`specs/03-ux-ui-design/generated-screens/<target-screen>.png`
- Purpose: visual source of truth
- **If markdown and PNG disagree:** PNG wins for visuals, markdown wins for behavior.

---

## Analysis Order

Execute each analysis step in this exact order. Each builds on the previous one.

### Step 1: Navigation Analysis
**Source:** User Flow
Determine:
- Previous screen (what comes before this one)
- Next screen (what comes after this one)
- Entry path (how user arrives here)
- Exit path (where user goes from here)
- Is it a modal or a full page?
- Is it a tab or stack screen?

### Step 2: Structure Analysis
**Sources:** Wireframe, Information Architecture
Determine:
- Page sections (top-level regions of the screen)
- Content groups (functional groupings within sections)
- Hierarchy (visual and semantic hierarchy)
- Visual regions (distinct visual zones)

### Step 3: Layout Analysis
**Sources:** Wireframe, PNG
**Important distinction:** UI layout refers to the visual structure of a screen (header region, content area, footer, card grid, list layout, etc.) — NOT Expo Router `_layout.tsx` files (which define navigation stack/tab structure, not visual layout).

Examine existing code under `frontend/src/` for reusable UI layout patterns:
- Check feature-level screen patterns under `frontend/src/features/` for repeatable structures (each feature has `screens/`, `components/`, `hooks/`, etc.)
- Check `frontend/src/app/` for route-level screen structures
- Check for common patterns in existing screens (SafeAreaView wrappers, ScrollView layouts, padding/spacing conventions)

Determine:
- Best matching layout approach (e.g., card list, full-screen scroll, tabbed sections, modal overlay)
- Reason for choice
- Confidence level (High / Medium / Low)
- Reuse strategy — what to reuse vs what to create

**Important:** Do NOT assume a layout registry exists. Read the actual code instead. If no existing UI layout fits, describe what a new layout should do — but always prefer reuse first.

### Step 4: Component Analysis
**Sources:** Wireframe, PNG, UI Design Spec
Examine existing component code under `frontend/src/` for reusable components. **Do not assume paths exist — inspect the directory at analysis time:**
- Check `frontend/src/features/*/components/` for feature-level components
- Check `frontend/src/features/*/screens/` for existing screen patterns
- Check `frontend/src/shared/` — may be empty or may contain shared components
- Scan all directories for any existing UI primitives or base components

Determine:
- Which components can be reused (with exact file paths)
- Which components need to be created (describe their interface)
- Composition structure (how components nest within each other)

**Always prefer:** existing component → new component → new layout — in that order.

### Step 5: Visual Analysis
**Sources:** UI Design Specification, PNG, `frontend/src/theme.ts`
Determine:
- Spacing system (padding, margins, gaps — reference the theme)
- Typography hierarchy (headings, body, labels)
- Color usage (from theme: primary, secondary, background, surface, error, etc.)
- Elevation (shadows, card depth)
- Borders and border radius (reference `roundness: 8` from theme)
- Any visual patterns not in the theme (note them)

### Step 6: Interaction Analysis
**Sources:** Interactive Prototype, Wireframe
Determine:
- Click/tap actions
- Form actions (input, validation, submission)
- State transitions (what changes on interaction)
- Animations and transitions

### Step 7: Asset Analysis
**Sources:** Asset Inventory
Determine:
- Icons needed (name, purpose)
- Illustrations needed
- Images needed
- Audio/media assets needed
- Asset file paths from the inventory

### Step 8: State Analysis
**Sources:** Prototype, User Flow, PNG
Determine **required states** (always needed):
- Loading state
- Success state
- Error state
- Empty/null state
- Offline state

Determine **screen-specific states** (unique to this screen):
- Recording state
- Permission denied state
- Completed state
- Locked/expired state
- Any other screen-specific state

### Step 9: Responsive Analysis
**Sources:** PNG, Wireframe
Determine:
- Phone layout (default)
- Tablet layout (adaptations)

Record changes between phone and tablet:
- Spacing adjustments
- Typography adjustments
- Section rearrangement

**Principle:** Prefer layout reuse. Avoid breakpoint-specific hacks.

---

## Screen Contract

Output the Screen Contract using exactly this format. It becomes the specification document that drives frontend implementation.

### Screen
- **Name:** [screen name from spec]
- **PNG:** `[path to screen png]`
- **Feature:** [feature this screen belongs to]

### Navigation
- **Previous:** [screen name]
- **Next:** [screen name]

### Layout
- **Selected Layout:** [existing layout name, or "New layout needed"]
- **Reason:** [why this layout was chosen]
- **Confidence:** High / Medium / Low

### Components
- **Reuse:**
  - `[filepath:component-name]` — [purpose]
  - ...
- **Create:**
  - `[component-name]` — [purpose + interface description]
  - ...

### Assets
- **Required Assets:**
  - [asset type]: [asset name] — [purpose]
  - ...

### States
- **State Matrix:**
  | State | Visible When | Key Behavior |
  |-------|-------------|--------------|
  | Loading | [condition] | [behavior] |
  | Success/Default | [condition] | [behavior] |
  | Error | [condition] | [behavior] |
  | Empty | [condition] | [behavior] |
  | [screen-specific] | [condition] | [behavior] |

### Responsive Rules
- **Phone:** [layout description]
- **Tablet:** [layout changes from phone]

### Constraints
- **Visual Constraints:** [pixel-perfect notes, specific alignment rules]
- **Behavior Constraints:** [specific interaction rules, edge cases]

### Ready For Frontend
- **YES / NO**
- **Reason:** ...

---

## Hard Rules

1. **DO NOT write code.**
2. **DO NOT write JSX.**
3. **DO NOT generate components.**
4. **DO NOT modify files.**
5. DO NOT create layouts without justification.
6. Always prefer: existing layout → existing component → new component → new layout — in that order.

The Screen Contract must exist before any implementation begins. Do not proceed to code generation until the contract is reviewed and approved.
