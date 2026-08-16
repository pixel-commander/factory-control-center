== db -- THE DATA. base_db.py owns the schema; base.db holds the rows. ==

START HERE. This file is the RECORD of what the db is, column by column.
The code is base_db.py; this is what it means. Schema below was read off the
live db (PRAGMA table_info), not copied from memory -- if the two ever
disagree, THE DB IS RIGHT and this file is stale.

    python base_db.py           create every table, print a row count
    python ..\api\server.py     open the door on 127.0.0.1:3034

  base.db is SQLite in WAL mode. NEVER file-copy it -- a copy tears
  silently. Use /api/manage/backup (sqlite-native) or base_db.backup().


========================================================================
THE HOUSE KEYS -- every table carries these ten, in this order
========================================================================
  id            INTEGER PRIMARY KEY AUTOINCREMENT
  name          TEXT      the short handle
  title         TEXT      the display line
  description   TEXT      one sentence about it
  date_added    INTEGER   epoch MILLISECONDS, stamped by the layer
  date_edited   INTEGER   epoch MILLISECONDS, stamped by the layer
  added_by      TEXT      who put it there
  deleted       INTEGER   0/1 soft-delete flag, default 0
  created       TEXT      legacy TEXT stamp, dual-written with date_added
  origin        TEXT      WHERE THE WRITE CAME FROM -- OPTIONAL (2026-08-12)

WHY: the keys are what make the generic machinery work. One CRUD handler
(api/tables), one join api (api/combine), one load-by-id box
(api/rab_widget), one client hook (useRABWidget) -- against ANY table,
without knowing what it holds. A new table is routable and loadable the
day it lands in TABLES, with no new code.

  COLUMN NAMES ARE LAW. ui/rab-widgets/rab.types.ts mirrors this file and
  FOLLOWS it -- never rename a column, ever.
  FLAGS ARE INTEGER 0/1, not booleans. DATES ARE EPOCH MS.
  DELETE IS SOFT (deleted=1); the row stays, restore brings it back.
  origin IS OPTIONAL (changed 2026-08-12). A write without it used to raise
  and the api turned that into a 400. It no longer does. The guard cost more
  than it bought -- it blocked callers that simply did not think to name
  themselves, while 195 rows satisfied it with the word 'other', which
  records nothing. Set origin when the answer is real; rab_origins still
  lists the writers that legally exist. It is a trail now, not a gate.
  date_added / date_edited are stamped HERE, never by a caller.
  TABLES IS READ ONCE, AT IMPORT. Add a table -> RESTART THE SERVER.


========================================================================
THE PRIMITIVES -- the only four things that touch sql
========================================================================
  read(table, **where)      -> [rows]   equality filters; deleted hidden.
                                        an unknown column raises (a typo is
                                        a bad ask, not an empty list).
  write(table, **fields)    -> new id   stamps the dates, requires origin.
  edit(table, id, **fields) -> changed  stamps date_edited.
  delete(table, id)         -> 1        SOFT.
  restore(table, id)        -> 1        undo a soft delete.
  trash(table=None)         -> [rows]   the soft-deleted, one table or all.
  stats()                   -> {table: {rows, deleted}}
  columns(table)            -> [names]  read off the db itself.
  backup(path=None)         -> path     WAL-safe, sqlite's own.

  NO SQL ABOVE THIS FILE. An api that writes its own SQL has left the
  trail (api/README.txt says the same).


========================================================================
THE TABLES -- schema, exact, per table
========================================================================
Every table below ALSO has the ten house keys above. Only the extras are
listed, in column order, after them.

------------------------------------------------------------------------
THE WORKING TABLES
------------------------------------------------------------------------
users
  handle              TEXT      the @name
  color               TEXT      their tone
  icon                TEXT      their glyph
  type                TEXT      human | synthetic | ...
  send_buffer         INTEGER   0/1
  date_seen           INTEGER   epoch ms

messages
  sender              TEXT      who wrote it
  chat_id             INTEGER   -> chats.id
  body                TEXT      the message
  tags                TEXT
  user_color          TEXT      denormalised from users, for drawing
  user_icon           TEXT
  user_handle         TEXT
  read                INTEGER   0/1
  NOTE: a messages write REQUIRES origin (see the house keys).

chats
  chat_type           TEXT      comms | class | ...
  topic               TEXT
  tags                TEXT
  participants        TEXT
  started_by          TEXT
  private             INTEGER   0/1
  scannable           INTEGER   0/1
  typing              TEXT      who is typing right now
  switch_board        TEXT
  pinned_message_id   INTEGER   -> messages.id
  date_accessed       INTEGER   epoch ms

ideas                 THE GROUP -- a thread of thinking
  chat_id             INTEGER   -> chats.id
  body                TEXT
  tags                TEXT
  status              TEXT
  sources             TEXT
  outcome             TEXT
  date_resolved       INTEGER   epoch ms

idea                  ONE ENTRY inside an ideas group
  ideas_id            INTEGER   -> ideas.id
  body                TEXT
  tags                TEXT

projects
  status              TEXT
  PLANNED: creating a project SPAWNS its children (a chats row, a tasks
  row, a notes row) and writes their ids back onto the project. That
  ceremony belongs BEHIND THE DOOR, never in a caller hook. Where the
  child ids live -- link columns here vs the assignments table -- is
  still an open call.

tasks
  status              TEXT
  target              TEXT      what kind of thing it points at
  target_id           INTEGER   which one
  tags                TEXT
  found_in            TEXT
  created_by          TEXT
  taken_by            TEXT
  completed_by        TEXT
  processed           INTEGER   0/1
  date_taken          INTEGER   epoch ms
  date_completed      INTEGER   epoch ms
  date_approved       INTEGER   epoch ms

assignments
  tags                TEXT

neurons               THE BRAIN. A card is what a thing IS, why, and the laws
                      it holds -- and the cards form a TREE (a RRAABB.txt
                      carries child neurons inside it).
  folder              TEXT      where it lives. Typed in at first; the auto-
                                indexer double-checks it against disk later.
  hint                TEXT      the one-liner: WHEN to load this card
  summary             TEXT      what it is, in a paragraph
  details             TEXT      the laws, the debts, the paid-for lessons
  connections         TEXT      other cards it points at -- the card's own
                                == Connections == line
  ganglion            TEXT      EXTERNAL grouping -- which organ of the body
                                it serves (the dashboard is the skin; the
                                veins feed and protect the brain)
  nucleus             TEXT      INTERNAL grouping -- which cluster of the
                                brain it sits in
  parent              TEXT      the neuron above it. Kept up by automation,
                                a schedule, or a triggered scan -- NOT by hand
  neurons             TEXT      its children, by name. The tree, denormalised
                                so a card reads whole without a join
  private             INTEGER   0/1 -- ours only, or public-access
  skill               TEXT      HOW TO WORK IT -- the card's own == Skill ==
                                section. The doing, not the being.
  memory              TEXT      what we LEARNED here that the code cannot say
  tags                TEXT
  `name` IS THE NEURON NAME (chart-generator, bag-packer) -- the house key
  already carries it, so there is no separate column for it.
  DROPPED 2026-07-30: links, source, kind, body. They were invented, not
  asked for, and redundant -- `neurons` already holds the tree, summary and
  details already hold the words. A column nobody can name is a column that
  fills with junk.

notes
  body                TEXT
  tags                TEXT
  target              TEXT      what it is a note ABOUT
  target_id           INTEGER   which one

attachments           A FILE HUNG ON A ROW -- a receipt on an expense, a pdf
                      on an appointment, an image in a message.
  path                TEXT      folder from __shared, forward slashes
  file                TEXT      the name on disk
  original_name       TEXT      what the USER called it, before the disk name
                                was made safe -- the only copy of that fact
  mime                TEXT      image/png, application/pdf ...
  ext                 TEXT      png | pdf | docx
  bytes               INTEGER   the size
  is_image            INTEGER   0/1, denormalised off mime so a gallery
                                filters without parsing it
  type                TEXT      one id from rab_types (kind='type')
  status              TEXT      rab_status, table_name='attachments'
  tags                TEXT
  target              TEXT      what it is hung ON
  target_id           INTEGER   which one
  notes               TEXT      comma id list -- the attach list

  IT IS THE ATTACH PATTERN, same as notes: target/target_id point HOME, and
  the owner row's own `attachments` list holds the ids back. Both ends stay
  true -- the door keeps them that way (groups_api.write_note does it for
  notes today; an attachment write follows it).
  A POINTER, NEVER THE BYTES. The file stays on disk behind api/files' fence.
  NOT the `file` table -- that is a reviewed COPY of source for the
  code-review board, holding an edit, not hanging a document on a row.

docs                  THE GROUP -- a shelf of written things
  tags                TEXT
  status              TEXT
  target              TEXT
  target_id           INTEGER
  docs                TEXT      comma id list -- its members

doc                   ONE WRITTEN THING WE KEEP -- a README, a spec, a handoff
  docs_id             INTEGER   -> docs.id
  body                TEXT      its words, like note and idea carry
  path                TEXT      folder from __shared, when it lives on disk
  file                TEXT      the file name, when it lives on disk
  tags                TEXT
  status              TEXT
  type                TEXT      one id from rab_types (kind='type')
  version             TEXT
  target              TEXT      what it documents
  target_id           INTEGER   which one
  attachments         TEXT      comma id list
  notes               TEXT      comma id list
  messages            TEXT      comma id list

  THE GROUP PATTERN, same as tasks/task -- read the ONE group row by id, then
  its members by docs_id. Never pull the whole shelf.
  body AND path/file can BOTH be set: a doc that started as a file and got
  edited here has both, and they are not the same fact.
  THE THREE FILE-ISH TABLES, told apart: `doc` is what we WROTE,
  `attachments` is what is PINNED to a row, `file` is what is being REVIEWED.

interactive           A STANDALONE THING ON DISK -- the html/app under
                      __shared/interactive that opens with no build.
  path                TEXT      the folder from __shared, forward slashes
  file                TEXT      the entry point inside it
  tags                TEXT
  type                TEXT      what it IS -- one id from rab_types (kind='type')
  status              TEXT      its state -- rab_status, table_name='interactive'
  messages            TEXT      comma id list
  notes               TEXT      comma id list -- the attach list
  projects            TEXT      comma id list
  expenses            TEXT      comma id list. NO expenses TABLE YET -- the
                                column is declared ahead of the shelf; the ids
                                written here keep meaning when it lands.
  contacts            TEXT      comma id list

  NOT rab_interactive. That is the CATALOG shelf below (location/kind/tags,
  swept out of interactive/AUDIT.txt). THIS is the working row. The catalog
  says what EXISTS; this says what we are DOING with it.
  path + file glue back together into the catalog's `location`, so a row here
  reconciles against a rab_interactive row without splitting a string.

system                THE MACHINE'S OWN TABLE -- settings / admin
  type                TEXT      setting | flag | migration | api | ...
  value               TEXT      the value; json when it needs shape

------------------------------------------------------------------------
THE CATALOG -- one table per shelf, fed by that folder's AUDIT.txt
------------------------------------------------------------------------
Six tables, IDENTICAL shape. Each mirrors an AUDIT.txt whose every record
is three fields:  name | description | location

  name        -> name          (house key)
  description -> description   (house key)
  location    -> location      the only column these add

So an indexer is a split and a write -- nothing to translate. Set
origin='audit-sweep' (or whatever ran it) so a row says where it came from.

rab_atoms          <- ui/atoms/AUDIT.txt
rab_elements       <- ui/elements/AUDIT.txt
rab_components     <- ui/components/AUDIT.txt
rab_pages          <- ui/pages/AUDIT.txt
rab_dashboards     <- dashboards/AUDIT.txt
rab_interactive    <- interactive/AUDIT.txt

  location            TEXT      path from __shared, forward slashes,
                                including the file
  kind                TEXT      what the row REALLY is. An AUDIT file
                                carries commented sections, and this is
                                where they land so the catalog does not
                                lie: css-only atoms, python commanders,
                                vanilla-only pages, staging apps.
  tags                TEXT

------------------------------------------------------------------------
THEMES AND TOKENS -- no folder to sweep, hand-kept
------------------------------------------------------------------------
These have NO AUDIT.txt on purpose: they are loose css sheets
(ui/themes/*.css, ui/tokens/base.css), not folders of components.

rab_themes
  location            TEXT      the sheet: ui/themes/tacmap.css
  class_name          TEXT      what you put on an ancestor: theme-tacmap
  tags                TEXT
  THE FIVE: base, tacmap, atelier, clean, float.

rab_tokens
  type                TEXT      surface | ink | accent | category |
                                geometry | type
  value               TEXT      the resolved value
  theme               TEXT      which theme this value belongs to (a token
                                has one row PER THEME -- that is the point)
  tags                TEXT
  NO HEX ABOVE THIS TABLE. A colour that is not a token is a colour no
  theme can move (see LOSSES.txt).

------------------------------------------------------------------------
THE TWO HALVES A NEURON POINTS AT
------------------------------------------------------------------------
    A SKILL is HOW TO DO A THING -- the recipe, the order, the gesture.
    A MEMORY is WHAT WE LEARNED -- the scar, the call, the why.

THE SAME SHAPE AS A NEURON, on purpose -- a card is a card, so one reader,
one writer and one form handle all three, and nothing has to know which kind
it is holding. Same fields MINUS THE TREE (parent / neurons): these hang off
a neuron, they do not carry children of their own.

rab_skills
rab_memory
  neuron              TEXT      which card it hangs off, by name
  folder              TEXT      where it lives
  hint                TEXT      the one-liner: WHEN to load it
  summary             TEXT      what it is, in a paragraph
  details             TEXT      the whole of it
  connections         TEXT      other cards it points at
  ganglion            TEXT      EXTERNAL grouping -- which organ it serves
  nucleus             TEXT      INTERNAL grouping -- which cluster
  private             INTEGER   0/1 -- ours only, or public-access
  tags                TEXT

  name (what it is called), title (the display line) and description (the
  thing itself) are HOUSE KEYS -- already there, along with the dates,
  added_by, deleted and origin. A neuron's own `skill` and `memory` fields
  carry a name, and the real row is one read away.

------------------------------------------------------------------------
WHERE EVERYTHING IS -- one row per folder
------------------------------------------------------------------------
paths / path          THE MAP -- where the db tells a page to load files from,
                      and where everything is kept. THE GROUP PATTERN: `paths`
                      is a NAMED BAG of locations, `path` is ONE location in it.

paths                 THE GROUP -- root | rab | user | brain
  slug                TEXT      what code asks for
  kind                TEXT      shelf | app | data | doc
  tags                TEXT
  paths               TEXT      comma id list -- its members

path                  ONE LOCATION
  paths_id            INTEGER   -> paths.id
  slug                TEXT      THE SLOT: images | components | icons | ...
  path                TEXT      ABSOLUTE for root, relative for everyone else.
                                EMPTY means the slug is reserved and the
                                location is not decided yet -- that is honest.
  kind                TEXT      shelf | app | data | doc
  tags                TEXT
  is_root             INTEGER   0/1 -- marks the ONE absolute row the resolver
                                anchors on. A flag, not a name lookup, because
                                'root' is a slug another group could reuse.
  on_disk             INTEGER   0/1 -- did the folder answer last sweep. A
                                CACHE, never the truth. NOT named `exists`:
                                that is a reserved SQLite keyword and CREATE
                                TABLE refuses it.
  notes               TEXT      comma id list

  THE SLOT IS THE POINT. The SAME SLUG MEANS A DIFFERENT FOLDER PER GROUP:

      db.read('path', paths_id=<user>, slug='components')  -> /user/components
      db.read('path', paths_id=<rab>,  slug='components')  -> /__shared/ui/components

  ROOT IS THE ONLY ABSOLUTE ROW.  full path = root.path + row.path
  So the whole project moves by editing ONE row.

  SEEDED BY db/seed_path_map.py -- re-runnable, matches on (group, slot) and
  only writes a real difference. It NEVER CREATES A FOLDER: a row whose folder
  is missing is reported (NOT ON DISK) and left alone, and a reserved slug with
  no path is reported separately (NO PATH YET). Those are different findings.

  rab_paths BELOW IS THE OLD ONE. It still holds its rows; nothing reads it.
  This pair is the record now -- retire that one when this carries everything.

rab_paths             SUPERSEDED by paths/path above. Left in place on purpose.
  slug                TEXT      what code asks for: root | ui | icons | ...
  path                TEXT      ABSOLUTE for root, relative for everyone else
  parent              TEXT      the slug it hangs off ('' for root)
  kind                TEXT      shelf | app | data | doc
  tags                TEXT

  ROOT IS THE ONLY ABSOLUTE ROW. It holds the real machine path
  (C:\rab-dashboard here, something else on the server). Every other row is
  RELATIVE to it -- /__shared/ui/atoms, /__shared/icons -- so the whole
  project moves by editing ONE row, and nothing else in the db knows or
  cares what drive it lives on.

    full path = root.path + row.path

  `parent` makes the tree walkable: atoms -> ui -> shared -> root.
  SEEDED BY db/seed_paths.py, which is re-runnable: it matches on slug and
  only writes a real difference. `--root D:\somewhere` seeds a different
  machine without touching the relative rows.

------------------------------------------------------------------------
THE VOCABULARIES -- what a `tags` or an icon name is ALLOWED to be
------------------------------------------------------------------------
rab_tags
  slug                TEXT      the tag as written in a tags column
  color               TEXT      a token name, never a hex
  kind                TEXT      what it groups: status | area | level | ...
  count               INTEGER   how many rows wear it -- a CACHE the sweep
                                refreshes, not the truth
  WHY: every other table carries a `tags` TEXT column holding a comma
  list. That column stays the truth. THIS table is the list of tags that
  legally exist -- so a picker has something to offer, and a typo'd tag is
  findable instead of silently becoming a new one.

rab_icons             WHERE the glyph is -- never the glyph itself.
  location            TEXT      icons/<name>.svg -- THE MATCH KEY the indexer
                                reconciles on. It was missing at first and
                                every run inserted a second copy of all 293
                                rows: an indexer without a stable key is a
                                duplicator.
  slug                TEXT      the name a caller asks for: chart, layers
  icon_set            TEXT      which family it belongs to
  tags                TEXT

  DROPPED 2026-08-12 (his call): svg, view_box. `svg` held the full markup of
  all 294 icons inline -- 260kb of it -- which is the exact thing flows_api
  already refuses: "an svg is a beautiful OUTPUT and a terrible record". THE
  FILE ON DISK IS THE TRUTH; a row points AT it. Nothing read the column (no
  api, no ui) and the indexer that wrote it never came over from v1, so it was
  dead markup making every read heavier. view_box went with it: it was only
  ever parsed off that markup, and a renderer reading the file already has it.
  The db went 700kb -> 356kb on the drop.

  WHY THE TABLE STILL EARNS ITS KEEP: the glyph vocabulary otherwise lives in
  code (Glyph's set, TabsNav's NAV_ICONS). Rows mean a widget can name an icon
  the code has never heard of -- which is what the db-driven views need. It is
  a CATALOG of what exists and where, which is all it should ever have been.


========================================================================
THE AUTO-INDEXERS -- planned, not built
========================================================================
The reason the AUDIT files are machine-readable at all: a sweep should be
able to walk each shelf, read its AUDIT.txt, and record what CHANGED --
new rows, edited descriptions, files that moved, records whose file no
longer exists.

WHEN IT IS BUILT, IT HOLDS THESE:
  - The AUDIT file is the INTENT; the folder is the FACT. A record with no
    file, and a file with no record, are both findings -- report them,
    never auto-fix.
  - NEVER hard-delete. A record whose file is gone gets deleted=1, so
    trash/restore still work and history survives.
  - Match on `location`, not on name. A rename is one row edited; a name
    match would make it a delete plus an insert and lose the id.
  - Stamp origin with the sweep's own name so a row always says how it
    got there.
  - It MUTATES, so it bumps: any writer must call events bump() or no
    screen learns anything landed (api/events/README.txt).
  - It is a SWEEP, not a scanner-of-record. The AUDIT.txt stays hand-kept:
    a scan indexes what EXISTS, the file records what we MEAN to ship, and
    those are not the same thing.


  NEXT BREADCRUMB -> ..\api\README.txt   (the door, api by api)
