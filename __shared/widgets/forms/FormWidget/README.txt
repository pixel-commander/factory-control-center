FORMWIDGET
==========

The wrapper every domain form wears, ported from the v2 forms folder and
rebuilt on the house StatelessForm. The bargain is the v2 one: fields are
DATA, not markup. A domain form is a fields file plus a title, and this
widget is everything they share.

What it does:

- items: fields shaped to the StatelessForm contract (InputGroupBaseProps
  keys - name, label, type, is_required, options, default_value,
  helper_text). A field may carry a "tab" word; fields with tabs get
  grouped into StatelessForm's form_tabs, fields without ride flat as
  form_fields.
- item: an existing record. Its keys seed matching fields' default_value,
  which turns the add form into the edit form. Nothing else changes.
- THE DB PLUG: a field may carry a "source" word - tags, users, or
  projects - and FormWidget fills that field's items [{id, name}] live
  from the api through useFormWidget (rab_tags / users / projects
  tables). The kit stays db-blind; the widget knows the data. Fields
  with items are drawn by StatelessInputGroup - the check_list /
  radio_list / items-select branches are OTHERSIDE's kit build, and
  those fields render degraded until it lands.
- action / cancel: the words on the buttons, handed to StatelessForm's
  button_text. Defaults SAVE / CANCEL.
- title: drawn above the form (form-widget-title class, unstyled for now
  - styles are deferred by the owner).
- can_scroll: emits the can-scroll class. Its css is deferred with the
  rest of the styling pass.
- handleSubmit / handleCancel pass straight through. StatelessForm owns
  values, validation, and the submit bag (keyed by field name).

The folder:

- hooks\useFormWidget - the api side: tag/user/project items, the
  edit-or-add-new save. Its README has the detail.
- js\options.ts - the shared option lists (WORK_STATUS, PRIORITY) as
  {id, name} rows. Fields import them as items; never retype a list in
  a shape's fields file.

Deliberately NOT passed: the form_class / input_group_class / button
class knobs - StatelessForm's defaults already wear the house atoms, and
the owner called styles a later pass. handleBlur is wired in
StatelessForm but is not in the house handler vocabulary, so this widget
does not plumb it.

Known gaps, tracked in the adding-forms research file (comms):

- placeholder does not reach the input - StatelessInputGroup builds its
  input settings explicitly and placeholder is not among them.
- The scaffold comment block in FormWidget.tsx is the stamp template's
  (comments are the owner's to manage; flagging that it reads as
  template guidance, not as documentation of this widget).
