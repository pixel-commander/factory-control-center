COURSEFORM
==========

The course shape as a form - the v2 stamp rebuilt on the house
FormWidget. Fields live at the top of the tsx as FORM_FIELDS, data on the StatelessForm
keys; the .tsx is only the table word, the head words, and the save.

- Table word: 'course' (v2's own). Save/edit/head words follow the
  record; caller handleSubmit replaces the save, handleSave is told
  after it lands.
- Three tabs: INFO, ASSIGNMENTS, DETAILS. What it commits is house
  keys plus two comma-joined id lists: assignments and students - the
  course points at the set work rather than owning a copy of it.
- assignments rides check_list with source 'assignments': FormWidget's
  source map serves tags/users/projects today, so this list renders
  EMPTY until the 'assignments' word is added there (posted in comms;
  FormWidget is the forman's territory). students rides source 'users'
  and works now.
- No tag_group on this shape in v2, so there is nothing to skip.
- Not ported on purpose: useHeld wiring, placeholders.
- The demo passes handleSubmit so demo submits DO NOT write the db.
- v2 tag words for reference: cohort, evening, remote, intensive,
  waitlist - one word off the classroom list. The live vocabulary
  comes from rab_tags now.

ClassroomForm is this same three-tab trick pointed the other way - its
README carries its own notes.
