== rab_widget -- the widget's box. load by id, save back by id. ==

WHAT IT IS
A RabWidget is just a box: the page hands it ids (a project, some messages,
some ideas) and the box loads exactly those rows and saves edits back to them.
This api IS that box, server-side -- one round trip instead of a fetch per
table stitched in the browser (combine's rule: the join belongs next to the
data).

THE ROUTES
  GET  /api/rab-widget?projects=3&messages=12,40&ideas=7,9
       -> {"projects": {..row..}, "messages": [rows], "ideas": [rows]}
       every query key is a TABLE NAME, its value the id(s) wanted.
       one id -> the row (or null). a comma list -> a list of rows.
       soft-deleted rows never come back (they're hidden at the base_db layer).

  POST /api/rab-widget   {"messages": [{"id": 12, "read": 1}]}
       -> {"saved": {"messages": [12]}}
       EDITS ONLY. every entry needs its id -- the box writes back to the ids
       it was handed, never invents a row. new rows: POST /api/<table>.

WHY GENERIC: the house keys. every table carries id/name/title/date_* so the
box never needs to know WHAT it is holding -- a new table is loadable and
savable here the day it lands in base_db.TABLES, no new code.

THE LAWS THIS HOLDS
  - NO SQL IN THIS FILE. base_db primitives only.
  - EDITS BUMP. one bump per save call, so screens learn something landed.
  - AN UNKNOWN TABLE IS A 400, out loud, naming the key that missed.
  - date_added / date_edited are stamped by the layer, never by a caller.
