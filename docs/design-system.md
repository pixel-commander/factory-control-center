# Design system skill

Use this when building any UI work in this app. All locations per PATHS.txt
at the project root - the only path authority.

## Required behavior
- Use CSS Grid only.
- Use the canonical grid system from grid.css in HOUSE_CSS.
- ABSOLUTE RULE: review fails if any grid layout/class/pattern is used that is not defined in HOUSE_CSS grid.css.
- Use theme tokens from theme.css in HOUSE_CSS.
- Use atoms from ATOMS before writing new CSS.
- ABSOLUTE RULE: never create or use a class name that is not already in ATOMS.
- ABSOLUTE RULE: never use inline `style={}` for visual design.
- Do not add page-scoped layout classes unless it is truly required.
- Do not add Flexbox wrappers.

## Required naming
- `.tsx` = PascalCase
- `.css` = kebab-case
- functions = camelCase
- the live atom vocabulary: `container-*` (with `--alt` variants), `button-*`, `site-nav`, `tab-nav`

## Required structure
- Components live under HOUSE_COMPONENTS in PascalCase folders; chrome-owned components live in the chrome's own components folder.
- Dashboards live under DASHBOARDS in PascalCase folders.
- Atoms live under ATOMS in kebab-case folders, organized by kind (containers, buttons).
- Pages live under PAGES in kebab-case folders.
- Demo files live under `demo/` and export `Demo`.

## Required checks
- Ensure no new visual design is added with inline `style` props.
- Ensure GLOBAL_TYPES is the only source for prop names.
- Ensure no invented handler keys or custom CSS classes replace house atoms.
- Ensure no grid behavior appears unless it is explicitly in HOUSE_CSS grid.css.
