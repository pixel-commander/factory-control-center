# House Rules for this app

All locations per PATHS.txt at the project root - the only path authority.

## 1. Core layout rules
- Use CSS Grid everywhere. No Flexbox.
- Use the canonical grid utilities from grid.css in HOUSE_CSS.
- Prefer `grid` + `data-area` layout patterns instead of ad-hoc layout CSS.
- Container atoms are the layout shell; do not create new page-level layout classes unless absolutely required.
- ABSOLUTE RULE: a review FAILS if any grid pattern/class/area usage is not defined by HOUSE_CSS grid.css.
- ABSOLUTE RULE: do not author custom grid templates or custom grid helper classes outside HOUSE_CSS grid.css.

## 2. Styling rules
- Use the token system in theme.css (HOUSE_CSS).
- Use atom classes from ATOMS for visuals.
- Do not invent new color, spacing, or visual tokens unless the house explicitly approves a new key.
- Button hover/focus/active states are CSS-only, using theme tokens and atom selectors.
- ABSOLUTE RULE: do not create or use any class names that are not already defined in the atom folders under ATOMS.
- ABSOLUTE RULE: do not use inline `style={}` for visual design. If it is not an atom class, it is not allowed.
- If the design cannot be built from atoms and tokens, stop and ask for a new approved atom entry instead of creating a custom class.

## 3. Naming and structure rules
- `.tsx` files are PascalCase.
- `.css` files are kebab-case.
- non-DOM functions are camelCase.
- component and dashboard folders are PascalCase (the stamps enforce this).
- atom folders are kebab-case, organized by kind (containers, buttons).
- page folders are kebab-case with PascalCase file names.
- component structure (under HOUSE_COMPONENTS, or the chrome's own components folder for chrome-owned pieces):
  - `<Name>/`
  - `<Name>/demo/Demo.tsx`
  - `<Name>/css/<name>.css`
  - `<Name>/<Name>.tsx`
  - `<Name>/<Name>.types.ts`

## 4. Type safety and defs
- Always guard defs with `?:` when values are not guaranteed.
- No invented prop names. Only use vocabulary from GLOBAL_TYPES.
- If a component needs a narrower handler signature, redeclare the same house key with the narrower type instead of inventing new names.
- No ad-hoc prop spreading onto DOM elements. A named house settings object built deliberately in the component (e.g. `cell_settings`) and spread onto its element is valid.
- Otherwise pass explicit props.

## 5. House vocabulary rules
- Use GLOBAL_TYPES as the source of truth.
- `items`, `selected`, `handleClick`, `handleSelect`, `View`, `label`, `id`, and other real names come from the house vocabulary.
- Never invent new handler names or new generic prop keys.
- For demo data, keep the fields and names aligned with `HouseKeyProps`.

## 6. View state rules
- All state and routing goes through the house useURL hook (HOOKS in PATHS.txt).
- `useURL()`: pathname segments from the house template (main/page/view/tab/sub-tab), vars ride on `#`. One dispatch handle with five closed verbs: `update-path`, `set-path`, `update-var`, `update`, `remove-var`.
- Never use `location.assign`, raw `pushState`, or query-string state - useURL routes without reloads.
- Demo-local state is allowed only inside a demo preview component when it is not representing a page-level view.

## 7. Demos and component registry rules
- Demo components must export both:
  - `export const Demo`
  - `export default Demo`
- Demo folders must also expose a `demo/index.ts` export.
- Component demos are registered by manifest entry:
  - `{ name, folder, Demo }`
- The demos page loops the manifest and renders each demo as `<item.Demo />`.
- Do not hand-code demo pages when the manifest can drive them.

## 8. Implementation rules for new work
- Keep container and button atoms atomic.
- Use the existing atoms and grid system before creating new layout CSS.
- Use the live atom vocabulary: `container-*` (with `--alt` variants) for shell containers, `button-*` for buttons, `site-nav` / `tab-nav` for navigation.
- Prefer existing atoms over custom classes.
- New components, atoms, and dashboards come from the stamps (STAMP_NEW_COMPONENT, STAMP_NEW_ATOM, STAMP_NEW_DASHBOARD in PATHS.txt); the scaffolds live at COMPONENT_TEMPLATE and its sibling templates.

## 9. Allowed patterns
- `const Name = () => { ... }`
- `const handleThings = () => { ... }`
- `useURL()` for all URL-driven selection.

## 10. Forbidden patterns
- `function Foo() {}`
- `className` strings built from ad hoc custom classes when a house atom exists
- inline styling for visual design
- Flexbox
- any grid layout/class/pattern that is not from HOUSE_CSS grid.css
- ad-hoc object spread onto DOM nodes (named house settings objects are valid)
- invented prop keys
- creating new tokens without approval
- `location.assign` / raw `pushState` / query-string state instead of useURL
