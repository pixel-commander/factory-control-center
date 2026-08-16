# Type safety and guards

- Guard defs with ?: when values are not guaranteed.
- Use GLOBAL_TYPES (per PATHS.txt) as the source of truth for house vocabulary.
- Do not invent prop names or custom handler names.
- Keep component-specific types in the component local type file.
- No ad-hoc prop spreading onto DOM elements. A named house settings object built deliberately in the component (e.g. cell_settings) and spread onto its element is valid.
- Pass explicit props otherwise.
