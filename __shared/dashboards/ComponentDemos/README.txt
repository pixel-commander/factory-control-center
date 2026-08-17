COMPONENT DEMOS
===============

The demos dashboard: a side tab-nav (writes the "page" segment through
useURL set-path) and a main cell that routes the selected demo. TABS and
DEMOS stay in step by sharing ids - the id is the url segment.

The forms tab (added 2026-08-16 as "form widget", renamed same day):

- FormWidgetDemos.tsx is the tab's view: side-l grid, the side listing
  every widget in the WIDGETS manifest array, the main cell showing the
  selected widget's demo.
- With NO selection, the main cell shows the forms FAMILY demo
  (widgets\forms\demo) - it is deliberately NOT a list entry; the side
  nav lists only the individual widgets (owner's call).
- Selection rides the "view" PATH SEGMENT, not a url var - the owner's
  call. view sits under page in the house template, so clicking to any
  other demos tab truncates it away and the tab falls back to the
  family demo.
- New widget demos register in manifest.ts WIDGETS (name, id, Demo) -
  one line, same bargain as the other manifest arrays.

The lists tab (added 2026-08-16) is the forms tab's twin: ListsDemos.tsx
consumes the manifest's LISTS array, opens on the lists FAMILY demo
(widgets\lists\demo - ListWidget scenarios plus the live domain lists as
a one-open-at-a-time accordion), and the side nav lists ListWidget and
each domain list individually on the same view segment.
