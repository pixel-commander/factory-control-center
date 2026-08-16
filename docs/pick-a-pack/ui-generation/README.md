# UI Generation Pack

Use this when creating or revising UI work.

## Included files
- ../skills/00-core-runtime-skills.md
- ../skills/01-ui-build-skills.md
- ../rules/00-house-core-rules.md
- ../rules/01-layout-grid-rules.md
- ../rules/02-styling-token-rules.md
- ../rules/03-naming-structure-rules.md
- ../rules/08-default-decision-order.md

## Core rules
- CSS Grid only.
- No Flexbox.
- Reuse existing classes before creating new ones.
- If a new class is required, add it only to the relevant component or page stylesheet.
- Use theme tokens from theme.css in HOUSE_CSS (per PATHS.txt).
- Use atoms before custom CSS.
- No inline style props for visual design.
- Guard defs with ?:.
- Ask instead of inventing new patterns.
