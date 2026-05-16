---
name: shadowspeak-ui-assets
description: Generate, export, and validate ShadowSpeak UI assets from specs/03-ux-ui-design, especially when assets must match project color tokens, transparent SVG/WebP requirements, app launch brand lockups, lesson artwork, hero illustrations, or the UI Asset Export Plan. Use this skill for deterministic brand/text/logo assets, imagegen-based illustration assets, alpha validation, and updating export outputs safely.
---

# ShadowSpeak UI Assets

Use this skill when preparing UI assets for the ShadowSpeak mobile app.

## Core Rule

Choose the workflow by asset type:

- **Deterministic render required:** brand marks, wordmarks, splash lockups, exact text, OAuth logos, app/notification icons, and any asset requiring exact hex colors or exact copy.
- **Imagegen allowed:** lesson thumbnails, level illustrations, decorative accents, ad creative, and hero/error illustrations where style matters more than pixel-perfect text/color.
- **Render in code / no export:** functional waveforms, progress rings, buttons, cards, status pills, and icon-font replacements.

Never use image generation as the only source for brand/text assets that must be exact.

## Required Sources

Before exporting:

1. Read `specs/03-ux-ui-design/07-UI-Asset-Export-Plan.md`.
2. Open the relevant generated screen from `specs/03-ux-ui-design/generated-screens/`.
3. Load `references/design-standards.md` in this skill for project tokens and validation rules.
4. For app launch brand assets, use `scripts/render-app-launch-assets.mjs`.

## Deterministic Brand/Text Workflow

Use for `1.1 App Launch` and future exact brand/text assets:

1. Render from SVG/text/vector primitives with exact tokens.
2. Export SVG as the final implementation asset.
3. Generate WebP/PNG preview artifacts over `color-bg` for validation and visual review.
4. Validate:
   - SVG has no baked app background;
   - rasterized validation artifact has alpha;
   - four corners are transparent;
   - opaque subject pixels use expected RGB tokens;
   - text copy is exact;
   - no loading/status UI is included unless explicitly requested.
5. Only copy final SVG outputs into `specs/03-ux-ui-design/exported-assets/` after validation and user acceptance.

For app launch assets:

```bash
node .codex/skills/shadowspeak-ui-assets/scripts/render-app-launch-assets.mjs \
  --out tmp/ui-asset-experiment/1.1-app-launch
```

The script writes final SVG files plus WebP/PNG validation artifacts. It requires Node.js and the `sharp` package. Install `sharp` in the repo with `npm install --save-dev sharp`, or set `SHADOWSPEAK_NODE_MODULES=/absolute/path/to/node_modules` when using a shared runtime.

## Imagegen Illustration Workflow

Use for non-text illustrations:

1. Open the referenced screen.
2. Prompt imagegen with the project palette and style.
3. Use transparent/native output if available, otherwise chroma-key and remove background.
4. Post-process only for alpha cleanup, sizing, and palette alignment.
5. Validate visual fit against the screen before export.

## Output Discipline

- Use `tmp/ui-asset-experiment/` for trials.
- Use `specs/03-ux-ui-design/exported-assets/` only for accepted final assets.
- Do not update the export plan until final files exist and pass validation.
- Do not overwrite existing final assets unless the user explicitly asks for replacement.
