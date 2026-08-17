TASKFORM
========

The task shape as a form - the v2 stamp rebuilt on the house
FormWidget. Fields live at the top of the tsx as FORM_FIELDS, data on the StatelessForm
keys; this file is only the table word, the head words, and the save.

- Table word: 'task' (v2's own - the item table, not the group shell).
  Rows land ungrouped: the factory api has no groups door, so the v2
  group ceremony is deliberately absent. Save/edit/head words follow
  the record; caller handleSubmit replaces the save, handleSave is told
  after it lands.
- tags and assigned_to ride type 'check_list' (sources 'tags'/'users' -
  assigned_to stores USER IDS comma-joined, shows names); project rides
  type 'select' with source 'projects' (stores the project id); status
  rides type 'select' with the WORK_STATUS items from FormWidget's
  js\options.ts (stores the id word, shows the display name once the
  kit's items select lands - plain string options until then).
- check_list renders degraded until OTHERSIDE's StatelessInputGroup
  piece is in. Not ported on purpose: tag_group, useHeld wiring,
  placeholders (same reasons as AppointmentForm's README).
- The demo passes handleSubmit so demo submits DO NOT write the db.
- v2 tag words for reference: urgent, blocked, waiting, site, quote,
  paperwork. The live vocabulary comes from rab_tags now.

TodoForm is this same shape on table word 'todo' with its own words -
its README is this file.
