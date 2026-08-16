# Code review skills

Use these when reviewing UI changes.

- Check grid usage against grid.css in HOUSE_CSS (per PATHS.txt).
- Check token usage against theme.css in HOUSE_CSS.
- Check prop names against GLOBAL_TYPES.
- Check for guardless defs and missing ?: usage.
- Check whether existing classes were reused before new ones were added.
- Check whether any new class was placed in the correct owning component/page stylesheet.
- Check for forbidden patterns: Flexbox, inline style, ad hoc classes, invented props.
- Call out only issues that materially break the house system.
