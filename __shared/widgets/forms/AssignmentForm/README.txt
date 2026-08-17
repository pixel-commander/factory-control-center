ASSIGNMENTFORM
==============

The assignment shape as a form - the v2 stamp rebuilt on the house
FormWidget. Fields live at the top of the tsx as FORM_FIELDS, data on the StatelessForm
keys; the .tsx is only the table word, the head words, and the save.

- Table word: 'assignment' (v2's own). Save/edit/head words follow the
  record; caller handleSubmit replaces the save, handleSave is told
  after it lands.
- The task shape plus the three words the classroom world adds: module
  (single pick from the module words, plain string options in
  the tsx), points (native number, default 20), and rubric (its
  own textarea beside the brief on DETAILS).
- tags and assigned_to ride check_list (sources 'tags'/'users' -
  assigned_to stores USER IDS comma-joined, shows names); project rides
  select with source 'projects'; status rides select with the
  WORK_STATUS items from FormWidget's js\options.ts.
- Not ported on purpose: tag_group (returns with the owner's select
  group), useHeld wiring, placeholders.
- The demo passes handleSubmit so demo submits DO NOT write the db.
- v2 tag words for reference: graded, ungraded, quiz, capstone, retake,
  extension. The live vocabulary comes from rab_tags now.
- v2 module words ported as-is: Systems thinking, Model evaluation,
  Failure analysis, Capstone.
