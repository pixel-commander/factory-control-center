WIDGETS
=======

A widget is a component plugged into the db, so it can be dropped into
place without changing many settings. Components stay dumb and reusable;
widgets know the house data and wire it in. This folder is registered as
WIDGETS in PATHS.txt.

The families:

- forms\ - the form family. FormWidget (the wrapper every domain form
  wears - fields as data on the StatelessForm keys, source words
  resolved to live api items - tags/users/projects/courses/assignments -
  the shared option lists, the save hook) and the nine domain forms
  (AppointmentForm, ProjectForm, TaskForm, TodoForm, AssignmentForm,
  ClassroomForm, ContactForm, CourseForm, UserForm). The family demo
  lives at forms\demo - FormWidget itself has none (owner's call
  2026-08-16, same day AddNewListener was removed).
- lists\ - the list family. ListWidget (the wrapper every list column
  wears - details/summary section, search line, + button, RenderItems
  rows). The domain lists arrive here when their port is called.

New widgets come from the component stamp (STAMP_NEW_COMPONENT in
PATHS.txt) aimed at this folder, then get their db wiring. Every
widget's demo registers in the ComponentDemos manifest WIDGETS array -
one line - and appears in the demos page form widget tab.
