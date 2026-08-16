== hexbase -- the db's SHAPE, drawn. /api/hexbase ==

WHAT IT IS
The db as a map instead of a list: one hex per table, its HEIGHT the live row
count, its COLOUR a kind, and a line for every relationship. It exists to feed
one reader -- interactive/db-hex-base/hexbase-LIVE.html, the 3d viewer, which
the app mounts as the RAB.db tab.

THE ROUTE
  GET /api/hexbase        the whole shape, every time (it is small)

WHAT IT SENDS
  tables[] = { table, records, type, columns[] }
      table    the name        -> the hex's label
      records  live row count  -> the hex's HEIGHT
      type     data | lookup | junction | template  -> its COLOUR
      columns  every column    -> the hex's face
  links[]  = { from, to, via }
  counts   = { tables, links }

WHY NOT /api/schema: that one is the raw column list (table -> [columns]) and
other things already read it. This is a DRAWING -- counts, kinds, resolved
links. Two shapes, two endpoints; widening the old one would have broken its
readers.

THE LINKS ARE NAMES, NOT KEYS. The db declares no foreign keys on purpose --
the house convention is that a column called <thing>_id points at <thing>.id
(chat_id -> chats.id). So this api owns ONE mapping table, SINGULAR, from a
plural table name to the singular a column would use. Add a table whose id
column does not follow that pattern and it draws no line until it is listed.

  target_id IS DEFERRED. tasks and notes carry target + target_id -- a
  polymorphic pointer where `target` names the table. It draws no line yet;
  a link needs one destination and this has many.

THE KIND IS A GUESS, and it says so:
  template  the rab_* catalog tables -- they describe the app, not its data
  lookup    the vocabularies (rab_tags, rab_icons, rab_themes, rab_tokens)
            and system
  junction  2+ *_id columns and little of its own -- it exists to join
  data      everything else

THE LAWS THIS HOLDS
  - NO SQL IN THIS FILE. base_db primitives only (db.columns, db.read).
  - IT ONLY READS. Nothing here mutates, so nothing here bumps.
  - IT COUNTS LIVE. `records` is len(db.read(t)) -- soft-deleted rows are
    already hidden by read(), so a hex shrinks when you delete.

COST: one read per table per call. Fine at lab scale; if the db ever grows
past that, swap the count for a SELECT COUNT(*) primitive in base_db --
NOT a raw query here.
