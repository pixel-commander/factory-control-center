STATELESSFORM - FOLDER NOTES
============================

[2026-08-16] Three field types added to StatelessInputGroup on the
owner's word (relayed by the forman on the adding-forms job; the full
order is in comms\adding-forms COMMS.txt). Native default-styled
elements only - no css was added, the styles pass is deferred.

check_list - checkbox group, multi-pick, reports ONE value.
Every checkbox is UNNAMED; one hidden input carries the field's name.
collectChecks gathers the checked boxes' values on any change and
writes them to the hidden input joined with commas (the house
comma-id-list shape). defaultValue arrives as a comma list and
pre-checks the matching boxes. This shape is deliberate:
- getFormData's fromEntries never sees repeated names, so it stays
  untouched - switching it to getAll would change every existing
  form's bag shape.
- Seeding rides defaultValue like every other field.
- validateField never judges a bare checkbox, whose value reads "on"
  whether ticked or not.

radio_list - radio group, single pick. One radio per entry, all
sharing the field's name; FormData handles a shared-name radio set
natively. value is the entry's id, the label text is its name.
defaultValue checks the matching radio.

select - extended, not changed: a field carrying items [{id, name}]
renders option value=id with the name as the shown word, so the form
stores the id a record needs while showing the word a person reads.
A field carrying only options string[] behaves exactly as before.

Both list types take items [{id, name}] or options string[]; a plain
option string stands as both its own id and name (list_items does the
fold). The data side is FormWidget's business: it resolves a field's
source word to items fed from the api and hands the field down.
