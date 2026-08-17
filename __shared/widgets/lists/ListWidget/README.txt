LISTWIDGET
==========

The wrapper every list column wears - built clean from house parts, no
v2 code carried over (owner's call: the v2 original needed a serious
refactor, so this is the house's own answer to the same job).

The parts, all reused:

- <details name>/<summary> IS the section: open/close is browser-owned,
  and sections sharing a name are a native exclusive accordion - no
  state, no js. is_open seeds the initial open through a ref (seeded
  once, so React never fights the user's toggle); handleToggle reports
  every move with the state it moved TO. To fully own open/close, remount
  with a different is_open.
- container-panel dresses the section, pad-sm the head, container-well +
  scroll-y the rows well. grid with-header / side-r lay out the search
  line: the field in main, the + in side (button-glow atom).
- StatelessInputGroup is the search field. It reports the WORD through
  handleChange (the house contract: the new value, not the event) and
  FILTERS NOTHING - the items are the caller's, so the filtering is too.
  query seeds the box; the box is uncontrolled after.
- RenderItems draws the rows: one element per item, key from id,
  item_class and selected per the house loop law, Item to override the
  row. handleClick reports the item.
- The + fires handleClickAddNew and nothing more - what a + means is
  the caller's decision (the house convention is writing the shape's
  url var as add-new). can_add=false removes the button,
  has_search=false the whole line.

Not built, on purpose:

- Drag to reorder / drag to scroll: the house has no drag js yet;
  can_reorder is the house word waiting for it. Owner calls that build.
- Data loading: this is the dress + search + well. The domain lists
  (ProjectsList and friends, when they port) own their db plug, same
  split as the forms family.

The demo filters demo-local sample items and reports selection and +
presses as JSON - it writes nothing.
