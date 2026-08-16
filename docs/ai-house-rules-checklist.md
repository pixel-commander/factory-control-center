# AI House Rules Checklist

Use this before generating or reviewing UI work. All locations per PATHS.txt
at the project root - the only path authority.

## 1. LAYOUT
- Use CSS Grid everywhere.
- No Flexbox.
- Use only the canonical grid patterns from grid.css in HOUSE_CSS.
- Do not invent custom grid templates or page layout classes.
- Prefer `grid` + `data-area` patterns.

## 2. STYLING
- Use the token system from theme.css in HOUSE_CSS.
- Use atoms from ATOMS before creating any new CSS.
- Do not invent visual classes, colors, spacing tokens, or custom styles.
- No inline `style` props for visual design.
- No custom visual CSS unless it is an approved house atom or token.
- If a design is not possible with the current atoms, ask to add a new approved entry.

## 3. NAMING AND STRUCTURE
- `.tsx` = PascalCase
- `.css` = kebab-case
- functions = camelCase
- component and dashboard folders = PascalCase (the stamps enforce this)
- atom folders = kebab-case, by kind (containers, buttons)
- component file names = PascalCase
- Component structure (under HOUSE_COMPONENTS):
  - `<Name>/`
  - `demo/Demo.tsx`
  - `css/<name>.css`
  - `<Name>.tsx`
  - `<Name>.types.ts`
- Pages (under PAGES): kebab-case folder, PascalCase file.

## 4. TYPE SAFETY
- Always guard defs with `?:` when values are not guaranteed.
- Use GLOBAL_TYPES as the source of truth for house vocabulary.
- Do not invent prop names.
- Keep component-specific types in the component `.types.ts` file.
- No ad-hoc prop spreading onto DOM elements (named house settings objects like `cell_settings` are valid).
- Pass explicit props otherwise.

## 5. STATE AND URL RULES
- All state and routing goes through the house useURL hook (HOOKS in PATHS.txt).
- Five closed verbs: `update-path`, `set-path`, `update-var`, `update`, `remove-var`. Vars ride on `#`.
- Demo-local state is okay only for demo-only UI state, not real app state.

## 6. DEMOS AND REGISTRY
- Demo exports must include:
  - `export const Demo`
  - `export default Demo`
- Demo folders should also export `demo/index.ts` when used by the manifest.
- Use the demos manifest instead of hand-writing demo pages.
- Keep demo names and files aligned with the house pattern.

## 7. FORBIDDEN PATTERNS
- Flexbox
- inline `style={}`
- ad hoc custom classes
- any grid layout not defined by HOUSE_CSS grid.css
- invented prop keys
- invented handler names
- custom tokens without approval
- ad-hoc object spread onto DOM nodes
- query-string state, `location.assign`, or raw `pushState` instead of useURL

## 8. DEFAULT DECISION RULE
If unsure, do the following in order:
1. Use an existing atom
2. Use an approved grid utility
3. Use the house type vocabulary
4. Use useURL for state
5. Ask for a new house entry instead of inventing a custom pattern

## 9. QUICK REVIEW CHECK
Before finishing any UI task, confirm:
- No Flexbox used
- No inline styling used
- No custom class names invented
- Only approved grid utilities used
- Props match the house vocabulary
- Definitions are guarded with `?:`
- useURL drives all app-level state
- Component structure follows the template pattern

## 10. SHORT VERSION
Grid only. Atoms and tokens only. No inline style. No invented props. useURL for state. Guard defs with `?:`.

If it isn't approved by the house system, don't invent it - ask for a new house entry.
