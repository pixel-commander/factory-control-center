TASKSLIST
=========

The task shape as a LIST - the reference implementation of the lists
pattern; the other eight follow this file for file.

- TasksList.tsx loops the db: useApi on 'task' (the same table word
  TaskForm writes), a caller's items prop wins over the db rows. The
  search word lives INSIDE the component (owner's call 2026-08-16) and
  filters rows client-side on name/title/label. Everything lands on
  ListWidget: the section, the search line, the +, the well.
- Row click REPORTS UP ONLY (owner's call): handleClick(item) fires
  and nothing else - the dashboard wires what a click means. Same for
  handleClickAddNew on the +.
- TaskElement.tsx is the row RenderItems mounts: the row's inner grid,
  wearing task-item classes. css\task-item.css is the ELEMENT'S ATOM -
  the owner's licensed home for custom, item-specific grid work
  (owner's word 2026-08-16; READ_THIS_FIRST's ban on grid templates
  outside grid.css predates this license - doc catch-up flagged).
- The demo mounts the list LIVE: rows come from the api when the
  server runs, empty otherwise. Lists only read - demos are db-safe.
  Clicking a row shows the reported item as JSON and holds it
  selected.
