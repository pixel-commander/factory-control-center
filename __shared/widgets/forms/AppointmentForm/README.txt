APPOINTMENTFORM
===============

The appointment shape as a form - the v2 stamp rebuilt on the house
FormWidget. Fields live at the top of the tsx as FORM_FIELDS, data on the StatelessForm
keys; this file is only the table word, the head words, and the save.

- Table word: 'appointments' (v2's own). The form saves itself through
  useFormWidget - no record means add, a record means edit, and the
  words on the head and button follow the record. A caller's
  handleSubmit REPLACES the save; handleSave is told AFTER it lands
  (the v2 2026-08-12 distinction, preserved).
- tags rides type 'check_list' with source 'tags' - FormWidget fills
  its items from the rab_tags api, stored as comma-joined slugs. It
  renders degraded (bare input) until OTHERSIDE's kit piece lands in
  StatelessInputGroup.
- Not ported, on purpose: tag_group (the same words as tags in a
  scroll box - returns with the owner's select group); the url-held
  record wiring (useHeld) - the dashboard's call per the research
  contract; placeholders (they do not reach inputs today).
- The demo passes handleSubmit so demo submits DO NOT write the db.
- The v2 tag words for reference: site-visit, handover, inspection,
  consult, install. The live vocabulary comes from rab_tags now.
