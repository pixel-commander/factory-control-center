# Layout and grid rules

- Use CSS Grid everywhere.
- Use only the canonical patterns from grid.css in HOUSE_CSS (per PATHS.txt).
- Prefer grid + data-area patterns.
- Reuse existing layout classes before creating a new one.
- If a new layout class is truly needed, create it in the page or component CSS file that owns it.
- Do not add ad hoc layout grids.
- Keep the app shell constrained to the real viewport and avoid content-driven height issues.
- Do not use Flexbox wrappers for layout.
