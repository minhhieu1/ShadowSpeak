# ShadowSpeak UI Asset Standards

Use these standards before generating or exporting assets.

## Project Sources

- Export plan: `specs/03-ux-ui-design/07-UI-Asset-Export-Plan.md`
- UI design spec: `specs/03-ux-ui-design/04-UI-Design-Specification.md`
- Asset inventory: `specs/03-ux-ui-design/06-UI-Asset-Inventory.md`
- Reference screens: `specs/03-ux-ui-design/generated-screens/`

## Color Tokens

| Token | Hex | RGB | Asset usage |
| --- | --- | --- | --- |
| `color-bg` | `#F7F5F0` | `247,245,240` | Preview background only; do not bake into transparent exports |
| `color-surface` | `#FFFFFF` | `255,255,255` | Cards, sheets, elevated panels |
| `color-surface-alt` | `#EEF2F5` | `238,242,245` | Secondary surfaces and grouped sections |
| `color-primary` | `#0E5A6A` | `14,90,106` | ShadowSpeak waveform mark, wordmark, primary brand emphasis |
| `color-primary-pressed` | `#0A4652` | `10,70,82` | Pressed primary states only |
| `color-secondary` | `#D97706` | `217,119,6` | Warm accent for progress, reminders, audio cues |
| `color-text` | `#111827` | `17,24,39` | Main UI text when text is part of an asset |
| `color-text-muted` | `#6B7280` | `107,114,128` | Helper/status/slogan text |
| `color-border` | `#D6D9DE` | `214,217,222` | Dividers and input borders |
| `color-success` | `#1F8A70` | `31,138,112` | Success/completed states |
| `color-warning` | `#D97706` | `217,119,6` | Warning/offline/storage guidance |
| `color-error` | `#C2410C` | `194,65,12` | Error/destructive feedback |
| `color-info` | `#2563EB` | `37,99,235` | Informational notices |
| `color-disabled` | `#A8B0B8` | `168,176,184` | Disabled text and controls |

## App Launch Assets

For `1.1 App Launch`:

- `brand_waveform_mark`: exact `#0E5A6A`, transparent SVG final, no text.
- `brand_wordmark_shadowspeak`: exact `ShadowSpeak`, exact `#0E5A6A`, transparent SVG final.
- `splash_brand_lockup`: waveform + `ShadowSpeak` + exact slogan `LISTEN. SHADOW. IMPROVE.`
- Slogan color must be `#6B7280`.
- Do not include the status bar, loading spinner, `Checking your setup...`, phone frame, app background, or decorative blobs in brand assets.

## Validation Rules

For deterministic brand/text assets:

- SVG is the final output format.
- WebP/PNG may be generated only as validation and preview artifacts.
- Corners must be fully transparent.
- Opaque subject pixels should use only expected token RGB values.
- Partial-alpha pixels are acceptable only for antialiasing edges.
- Text must be spelled exactly.
- Preview on `#F7F5F0` before accepting.

For imagegen illustration assets:

- Validate transparent background, no chroma-key fringe, and visual consistency with the reference screen.
- Exact token colors are not required unless the asset contains brand/text/system UI elements.
