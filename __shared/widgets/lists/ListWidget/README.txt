LISTWIDGET
==========

STRIPPED BARE, on the owner's word (2026-08-16, "lets see it without"):
ListWidget currently renders ONLY the rows - a pass-through to
RenderItems wearing the list-widget class. No section shell, no search
line, no + button, no well.

- items / Item / item_class / container_class / selected / handleClick
  go straight to RenderItems: one element per item, key from id, the
  house loop law.
- ListWidgetProps still carries the full shell vocabulary (query,
  has_search, can_add, action, is_open, name, handleChange,
  handleToggle, handleClickAddNew) so the nine domain lists compile and
  pass their words unchanged. Those words are INERT while the widget is
  bare - a domain list's search state still filters its rows, but no
  box renders to type in.
- The full shell shape (details/summary browser-owned accordion, the
  search line on StatelessInputGroup, the + on button-glow, the
  container-well) lives in this branch's git history - restore any
  layer from there when the owner calls it.

The domain lists (TasksList and the other eight) are the pattern's
instances; TasksList's README is the reference for that pattern.
