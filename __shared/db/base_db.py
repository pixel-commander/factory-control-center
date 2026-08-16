r"""
base_db.py -- THE DB. The schema and the only four primitives that touch it.

    from db import base_db as db      (server.py puts this folder on the path)
    db.init_db()                      create everything, WAL on
    db.read('messages', chat_id=1)    -> [rows]   soft-deleted hidden
    db.write('messages', **fields)    -> new id   origin optional
    db.edit('messages', 7, read=1)    -> changed count
    db.delete('messages', 7)          -> 1        SOFT: deleted=1

THE HOUSE KEYS. Every table carries the same base columns:

    id  name  title  description  date_added  date_edited  added_by
    deleted  created  origin

That is what makes the generic machinery upstairs work -- one CRUD handler
(api/tables), one join api, one load-by-id box (api/rab_widget), one client
hook (useRABWidget) -- against ANY table, without knowing what it holds. A new
table is routable and loadable the day it lands in TABLES, with no new code.

THE LAWS THIS FILE HOLDS
  - COLUMN NAMES ARE LAW. ui/rab-widgets/rab.types.ts mirrors this file
    verbatim and FOLLOWS it -- never rename a column, ever.
  - FLAGS ARE INTEGER 0/1, not booleans. Dates are epoch MILLISECONDS
    (INTEGER); `created` is the legacy TEXT stamp, dual-written.
  - DELETE IS SOFT. deleted=1; the row stays and /api/manage/restore
    brings it back.
  - `origin` IS OPTIONAL (changed 2026-08-12). It used to raise on a write
    without it; it no longer does. Set it when you can honestly say where the
    row came from -- it is still the trail, and rab_origins still lists the
    writers that legally exist. It is just not a gate any more.
  - date_added / date_edited are stamped HERE, never by a caller.
  - WAL mode: never file-copy a live base.db, it tears silently. Use
    /api/manage/backup (sqlite-native).
  - TABLES IS READ ONCE, AT IMPORT. Add a table -> RESTART THE SERVER.
"""
import os as _os
import sqlite3
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
DB_PATH = HERE / "base.db"

# the house keys -- every table starts with these, in this order
BASE_COLUMNS = (
    "id TEXT PRIMARY KEY, "                # a ULID -- see new_id()
    
    "name TEXT, "
    "title TEXT, "
    "description TEXT, "
    "date_added INTEGER, "
    "date_edited INTEGER, "
    "added_by TEXT, "
    "deleted INTEGER DEFAULT 0, "
    "created TEXT, "
    "origin TEXT"          # where the row came from -- OPTIONAL, see write()
)

# table -> the columns AFTER the house keys. Mirrored by rab.types.ts.
EXTRA_COLUMNS = {
    "users": (
        "handle TEXT, color TEXT, icon TEXT, type TEXT, "
        "send_buffer INTEGER DEFAULT 0, date_seen INTEGER, notes TEXT"
    ),
    # THE GROUP PATTERN (his call, 2026-08-06): the PLURAL table is the group
    # -- house keys + a list column NAMED LIKE THE TABLE holding member ids
    # (messages[id].messages). The SINGULAR table is the item, pointing home
    # via <plural>_id. ideas/idea walked this road first; messages/message,
    # tasks/task and notes/note follow it. You never pull the whole shelf --
    # read the ONE group row by id, then its members by <plural>_id.
    "messages": (
        "sender TEXT, chat_id INTEGER, body TEXT, tags TEXT, "
        "user_color TEXT, user_icon TEXT, user_handle TEXT, "
        "read INTEGER DEFAULT 0, messages TEXT, users TEXT"
    ),
    "message": (
        "messages_id INTEGER, sender TEXT, body TEXT, tags TEXT, "
        "user_color TEXT, user_icon TEXT, user_handle TEXT, "
        "read INTEGER DEFAULT 0, status TEXT"
    ),
    "chats": (
        "chat_type TEXT, topic TEXT, tags TEXT, participants TEXT, "
        "started_by TEXT, private INTEGER DEFAULT 0, "
        "scannable INTEGER DEFAULT 0, typing TEXT, switch_board TEXT, "
        "pinned_message_id INTEGER, date_accessed INTEGER"
    ),
    # `ideas` is the GROUP (a thread of thinking); `idea` is one entry in it
    "ideas": (
        "chat_id INTEGER, body TEXT, tags TEXT, status TEXT, "
        "sources TEXT, outcome TEXT, date_resolved INTEGER"
    ),
    # EVERY ROW TABLE CARRIES notes (his call 2026-08-06, message excepted):
    # `notes` is a comma list of note ids -- attached notes, the note itself
    # pointing back via target/target_id. The door keeps both ends true.
    "idea": "ideas_id INTEGER, body TEXT, tags TEXT, notes TEXT",
    # a project's group ids ride ON the row: chats (legacy), and the spawned
    # groups -- messages, tasks, todos -- comma lists, tags-style. `notes` is
    # NOT a group id: it is the ATTACH list (note ids pinned to the project),
    # same as notes on any other row.
    #
    # THE BOARD IS DATA (his call, 2026-08-06): ready / in_progress /
    # complete are ORDERED lists of board card ids (task-19,todo-8,...) --
    # the lane AND the sort order of the drag board, saved on the project.
    # THE BOARD IS THE ROW (his call, 2026-08-13). Five lanes, five columns, each an
    # ORDERED list of ids -- and they align with DragLanes one for one, so a drop writes
    # the lane it landed in and the order it landed at, and nothing translates between a
    # board and a schema.
    #
    #   hold  ready  started  review  ship
    #
    # ready / in_progress / complete WERE the three lanes before this; they are gone.
    "projects": (
        "status TEXT, tags TEXT, chats TEXT, messages TEXT, tasks TEXT, "
        "notes TEXT, todos TEXT, research TEXT, "
        "hold TEXT, ready TEXT, started TEXT, review TEXT, ship TEXT"
    ),
    "tasks": (
        "status TEXT, tags TEXT, "
        "found_in TEXT, created_by TEXT, taken_by TEXT, completed_by TEXT, "
        "processed INTEGER DEFAULT 0, date_taken INTEGER, "
        "date_completed INTEGER, date_approved INTEGER, tasks TEXT"
    ),
    "task": (
        "tasks_id INTEGER, status TEXT, "
        "tags TEXT, found_in TEXT, created_by TEXT, taken_by TEXT, "
        "completed_by TEXT, processed INTEGER DEFAULT 0, date_taken INTEGER, "
        "date_completed INTEGER, date_approved INTEGER, date_due INTEGER, "
        "notes TEXT, messages TEXT"
    ),
    # todos/todo -- its own pair now (2026-08-06). A todo used to be "a task
    # nobody took" inside tasks; the group pattern gives it its own shelf.
    # Taking a todo PROMOTES it: the row moves to task, never a flag flip.
    "todos": "tags TEXT, todos TEXT",
    "todo": (
        "todos_id INTEGER, status TEXT, "
        "tags TEXT, date_completed INTEGER, date_due INTEGER, notes TEXT, messages TEXT"
    ),
    # THE CLASSROOM SHELVES (2026-08-12) -- three more group/item pairs, declared
    # exactly like tasks/task above so nothing new has to be learned to read them:
    # the PLURAL is the group (house keys + a list column named like the table),
    # the SINGULAR is the item, pointing home through <plural>_id.
    #
    # They nest by ID, never by copy: a classroom holds course ids, a course holds
    # assignment ids, and the same assignment can sit in two courses without being
    # written twice. -> ui/README.md, "Nesting is by id, never by copy"
    #
    # assignments was ALREADY HERE as a lone "tags TEXT" shelf with no item table
    # and no list column, so it could hold rows but never say which course they
    # belonged to. It becomes a proper group here; the columns it had are kept.
    "assignments": "tags TEXT, assignments TEXT",
    # HOMEWORK IS ONE STUDENT DOING ONE ASSIGNMENT (his call, 2026-08-13). The assignment is
    # the WORK, the same for everyone; this row is what happened when one person did it --
    # so `student` and `assignment` together are what makes a homework row a homework row.
    #
    #   student     ONE id -> student[id]        who did it
    #   assignment  ONE id -> assignment[id]     what they did
    #   status / grade                            how it went
    #   date_started / date_completed             when
    #
    # notes and messages are SINGLE GROUP IDS, not lists: one notes group and one chat per
    # student per assignment, so a conversation about this person's work stays with THIS row
    # rather than the assignment everyone shares. The components that use them write these
    # themselves on first use -- nothing is born here.
    #
    #   files       MANY ids -> file[id]         what was handed in
    #   neurons     MANY ids -> neuron[id]       the cards this work touched
    "homework": (
        "student INTEGER, assignment INTEGER, status TEXT, grade TEXT, "
        "date_started INTEGER, date_completed INTEGER, "
        "notes INTEGER, messages INTEGER, files TEXT, neurons TEXT"
    ),
    # HOUSE KEYS + TWO POINTERS (his call, 2026-08-13), and they are not the same kind:
    #
    # assignments_id IS GONE (2026-08-13). course.assignments already holds the ids, so a
    # pointer back was a second copy of one fact -- the same reason the group's list column
    # stopped being appended to. ONE DIRECTION IS ENOUGH: the course says what it holds.
    #
    #   messages  ONE id -- the assignment's own chat, a single messages group
    #   tasks     MANY ids -- the task rows that make the work up
    #   skill     TEXT -- what this work is meant to build. A WORD on the row, not an id:
    #             the skill/skills tables are the BRAIN's (neuron, hint, summary), which is
    #             a different thing wearing the same name, and pointing at them would tie a
    #             piece of schoolwork to a card about how we code.
    #
    # date_due / points / grade / submitted / of ARE GONE. They were guessed off
    # AssignmentRow's props when this pair was first declared and were never asked for;
    # an assignment is the WORK, and what it is worth is not on this row.
    "assignment": "messages INTEGER, tasks TEXT, skill TEXT",
    "courses": "tags TEXT, status TEXT, courses TEXT",
    # courses_id / status / target / target_id / term / room / teacher ARE GONE (2026-08-13).
    # Every one was guessed when this pair was first declared, not asked for.
    "course": "tags TEXT, assignments TEXT, notes TEXT",
    # A STUDENT IS A USER (his call, 2026-08-13). House keys + `user`, and nothing else:
    # who the person is lives in `users`, and this row points at them. The column is `user`,
    # NOT user_id -- the word is the shape it points at. -> hold-names-exact
    "student": "user INTEGER",
    "classrooms": "tags TEXT, status TEXT, classrooms TEXT",
    "classroom": (
        "classrooms_id INTEGER, status TEXT, "
        "tags TEXT, term TEXT, room TEXT, teacher TEXT, "
        "courses TEXT, users TEXT, notes TEXT"
    ),
    # named while building the dashboard (2026-07-30), spec'd here first:
    # neurons: THE BRAIN. A neuron is a card -- what a thing IS, why, and the
    # laws it holds -- and the cards form a TREE (a RRAABB.txt carries child
    # neurons inside it, see ChartGenerator/neuron/RRAABB.txt).
    #
    # The house keys already cover id/description/dates/origin. `name` is the
    # NEURON NAME (chart-generator, bag-packer). The rest:
    #
    #   folder    where it lives. Typed in at first; the auto-indexer
    #             double-checks it against disk once that runs.
    #   hint      the one-liner: WHEN to load this card
    #   summary   what it is, in a paragraph
    #   details   the laws, the debts, the paid-for lessons
    #   ganglion  EXTERNAL grouping -- which organ of the body it serves.
    #             (the dashboard is the skin; the veins feed and protect
    #             the brain)
    #   nucleus   INTERNAL grouping -- which cluster of the brain it sits in
    #   parent    the neuron above it. Kept up by automation, a schedule, or
    #             a triggered scan -- NOT by hand.
    #   neurons   its children, by name. The tree, denormalised so a card
    #             can be read whole without a join.
    #   private   0/1 -- is this public-access, or ours only
    #   skill     HOW TO WORK IT -- the card's own `== Skill ==` section: read
    #             this, then that, never rename a key. The doing, not the being.
    #   memory    what we LEARNED here that the code cannot say: the scars,
    #             the calls made, why it is shaped this way.
    #
    # DROPPED 2026-07-30 (his call): links, source, kind, body. `links` and
    # `body` were mine, not his -- and redundant: `neurons` already holds the
    # tree and summary/details already hold the words. A column nobody can
    # name is a column that fills with junk.
    #   connections  other cards it points at -- the card's own
    #                `== Connections ==` line
    "neurons": (
        "folder TEXT, hint TEXT, summary TEXT, details TEXT, tags TEXT, "
        "connections TEXT, ganglion TEXT, nucleus TEXT, parent TEXT, "
        "neurons TEXT, private INTEGER DEFAULT 0, skill TEXT, memory TEXT"
    ),
    # ---- THE GANGLIONS (2026-08-12) --------------------------------------
    # A GANGLION IS A CRAFT -- a lobe of laws for one kind of work. `web` is one,
    # `dashboard` is one. NOT a brain: rraabbiitt loads who we are, a ganglion
    # loads WHAT WE KNOW HOW TO DO. -> .claude/skills/ganglion
    #
    # Its NEURONS are that craft's laws and skills -- always-grid-never-flex,
    # grid-template-areas, house-keys, guard-everything. One neuron, one law.
    #
    # THE CARD IS THE RRAABB.txt TEMPLATE, seven fields:
    #     ID / FOLDER / PARENT FOLDER / NEURON / HINT / SUMMARY
    #     == Connections ==  [neuron-name][neuron-name]
    #     == Neurons ==      [child-neurons]
    # NEURON is the house key `name`, ID is `id`, and the prose under the header
    # block is `description`. Nothing else, because nothing else is stamped.
    # NO _id COLUMNS (his law). The key is PLURAL and holds a list:
    # ganglion.neurons = "2,3,4", neurons.neurons = "7,8". A row belongs by
    # being named in its parent's list, not by carrying a pointer back.
    "ganglion": "slug TEXT, folder TEXT, hint TEXT, summary TEXT, tags TEXT, neurons TEXT",
    "neurons": "ganglion TEXT, folder TEXT, hint TEXT, summary TEXT, tags TEXT, neurons TEXT",
    "neuron": (
        "ganglion TEXT, path TEXT, folder TEXT, parent_folder TEXT, "
        "hint TEXT, summary TEXT, tags TEXT, status TEXT, connections TEXT, neurons TEXT, "
        "skills TEXT, memories TEXT, losses TEXT, wins TEXT"
    ),
    # A SKILL is HOW TO DO A THING -- the recipe, the order, the gesture.
    # A MEMORY is WHAT WE LEARNED -- the scar, the call, the why.
    # Group + item, like everything else: the neuron names its skills and its
    # memories in a list, and each entry names the neuron it hangs off.
    # THE GROUP: house keys + the list of skill ids it holds, named like the table --
    # the same shape every other group in this file wears.
    "skills": "skills TEXT",
    # THE ITEM: house keys + the word itself (his call, 2026-08-13). neuron/hint/summary/
    # tags/file came in with the brain work and are gone -- a skill is a WORD, and everything
    # else about it was a guess at what one might carry.
    "skill": "skill TEXT",
    "memories": "neuron TEXT, folder TEXT, hint TEXT, summary TEXT, tags TEXT, memories TEXT",
    "memory": "memories TEXT, neuron TEXT, hint TEXT, summary TEXT, tags TEXT",
    # A LOSS is WHAT IT COST -- the bug, the wrong call, the hours. A WIN is what
    # paid off. Same pair shape as skills and memories, because they are the same
    # kind of card: a neuron names its losses and its wins, each entry names the
    # neuron it came from. LOSSES.txt on disk is this table in file form.
    "losses": "neuron TEXT, folder TEXT, hint TEXT, summary TEXT, tags TEXT, losses TEXT",
    "loss": "losses TEXT, neuron TEXT, hint TEXT, summary TEXT, tags TEXT",
    "wins": "neuron TEXT, folder TEXT, hint TEXT, summary TEXT, tags TEXT, wins TEXT",
    "win": "wins TEXT, neuron TEXT, hint TEXT, summary TEXT, tags TEXT",
    "notes": "body TEXT, tags TEXT, notes TEXT",
    # a REVIEWED FILE COPY (the code-review dashboard, 2026-08-07): `name`
    # is the file's path, `body` the UPDATED text -- the ORIGINAL stays on
    # disk untouched; the review lives HERE. target points at the session.
    "file": "body TEXT, tags TEXT, notes TEXT",
    "note": "notes_id INTEGER, body TEXT, tags TEXT",

    # rab_types: WHAT A THING IS, as a vocabulary. Distinct from rab_origins
    # (where a row CAME FROM) -- a research row can originate from a project
    # and still BE research. `table_name` scopes a type to one table when it
    # only makes sense there; blank fits anything.
    #
    # IT IS HOUSE KEYS PLUS A SLOT FOR ICON AND COLOR (his call, 2026-08-08).
    # name/title/description come from the house columns every table gets, so
    # the only additions are how a type PRESENTS -- `icon` (a Glyph name) and
    # `color` -- and where it belongs (slug/kind/table_name/rank).
    #
    # TWO AXES LIVE HERE, told apart by `kind`:
    #   kind='type'    what a ROW is        -- task, appointment, neuron
    #   kind='subject' what it is ABOUT     -- dental, school, birthday
    # An appointment IS an appointment (type) and is ABOUT the dentist
    # (subject). Same table because both answer "what is this", and a picker
    # filters on kind rather than reading a second table.
    "rab_types": "slug TEXT, kind TEXT, table_name TEXT, rank INTEGER, color TEXT, icon TEXT",

    # research: a question being chased, with what was found. It is
    # ASSIGNABLE like a task -- taken_by/completed_by and the dates -- because
    # research is work somebody does, not a note that sits there.
    #
    # target/target_id point it at whatever it is research ABOUT: a contact,
    # a project, an appointment. findings holds what came back; sources holds
    # where it came from, one per line.
    "research": (
        "question TEXT, findings TEXT, sources TEXT, status TEXT, "
        "tags TEXT, "
        "created_by TEXT, taken_by TEXT, completed_by TEXT, "
        "date_taken INTEGER, date_completed INTEGER, notes TEXT, messages TEXT"
    ),

    # ---- THE ORGANIZER (2026-07-30) --------------------------------------
    # His personal organizer: thoughts, notes, appointments, todos, tasks,
    # and messages from me when I need something. NOT a demo -- this is the
    # one he uses.
    #
    # contacts: a person. The house keys carry name/title/description, so
    # this only adds how to REACH them and who they are to him.
    # `type` is the SUBJECT vocabulary (rab_types, kind='subject') -- what the
    # contact is about: dental, school, work. It holds the type's ID, one
    # only. Distinct from `kind`, which is the older free-text field for what
    # the contact IS (person, doctor); both are kept because they answer
    # different questions and dropping a column is never additive.
    # `expenses` and `attachments` added 2026-08-12: what this contact has cost,
    # and the files hung on them. Same comma id lists every other row table
    # carries -- a contact holds its expenses GROUP id, the charges hang off that.
    "contacts": (
        # `website` added 2026-08-12: ViewContact's REACH list has always drawn a
        # WEBSITE line (components/Contacts/ViewContact.tsx) and the column did
        # not exist, so it could never show one -- the write was refused outright.
        "handle TEXT, email TEXT, phone TEXT, address TEXT, website TEXT, "
        "kind TEXT, type TEXT, org TEXT, tags TEXT, notes TEXT, "
        "user_id INTEGER, date_last_contact INTEGER, "
        "expenses TEXT, attachments TEXT"
    ),
    # appointments: house keys + start_date/end_date (his call), plus the
    # links. An appointment gathers contacts, a chat, tasks, users and a
    # project -- the same shape a project has, where starting one spawns its
    # chat and task rows and keeps their ids.
    #
    # THE LINKS ARE ID LISTS, not join tables. NOTE: id-list vs join table
    # was not asked about -- taking the id list because it matches what the
    # house already does ("it saves those ids to the new project") and one
    # read gets the whole appointment. A join table buys reverse lookups
    # ("every appointment for this contact") and can be added later without
    # moving these columns.
    #
    # contacts/tasks/users/messages hold "3,7,12". chat_id and project_id
    # are single because an appointment has ONE chat and belongs to ONE
    # project. `todos` is NOT a column -- a todo is a task nobody assigned,
    # so it lives in `tasks` with the rest. -> dashboards/organizer/README.txt
    # date_due joins start_date/end_date (his call, 2026-08-08): the same key
    # `task` already carries, so "when is this due" is ONE column name across
    # every table that has a deadline -- a timeline or a list can read it
    # without learning each table's own spelling. start_date is when it BEGINS;
    # date_due is when it has to be done by, and they are not always the same.
    "appointments": (
        "start_date INTEGER, end_date INTEGER, date_due INTEGER, "
        "all_day INTEGER DEFAULT 0, "
        # what it is ABOUT -- one id out of rab_types where kind='subject'
        "location TEXT, status TEXT, type TEXT, tags TEXT, "
        "contacts TEXT, tasks TEXT, users TEXT, messages TEXT, "
        "chat_id INTEGER, project_id INTEGER, notes TEXT"
    ),
    # paths/path (2026-08-12, his call) -- THE MAP OF WHERE EVERYTHING IS.
    # The group pattern one more time: `paths` is a NAMED BAG of locations
    # (root, user, rab), `path` is ONE location inside it, pointing home
    # through paths_id. Read the ONE group by id, then its members by paths_id.
    #
    # WHAT IT IS FOR, in his words: "a map of where the db can give the page to
    # load files, and for me to keep track where all my shit is". So it is read
    # by the APP at load time, not just by a human -- which is why a slot is a
    # queryable column and not a json blob.
    #
    # THE SLOT IS THE POINT. A `path` row carries `slug` -- images, components,
    # elements, icons -- and the SAME SLUG MEANS A DIFFERENT FOLDER IN EACH
    # GROUP. user/images and rab/images are both 'images'; the group is what
    # tells them apart:
    #
    #     db.read('path', paths_id=<user>, slug='images')   -> his images
    #     db.read('path', paths_id=<rab>,   slug='images')   -> the kit's
    #
    # ROOT IS THE ONLY ABSOLUTE ROW -- it holds the real machine path
    # (c:\rab-dashboard-v2 here, something else on the server). Every other row
    # is RELATIVE to it, so the whole project moves by editing ONE row and
    # nothing else in the db knows what drive it lives on:
    #
    #     full path = root.path + row.path
    #
    #   is_root   0/1 -- marks the one absolute row. A FLAG, not a lookup by
    #             name, because 'root' is a name someone could reuse in another
    #             group; the flag says which row the resolver anchors on.
    #   on_disk   0/1 -- did the folder answer last time we looked. A CACHE the
    #             sweep refreshes, never the truth (rab_tags.count says the same
    #             about itself). A row with on_disk=0 is a FINDING, not a bug --
    #             never create a folder to make a row true (seed_paths' law).
    #             NOT NAMED `exists`: that is a reserved SQLite keyword and
    #             CREATE TABLE refuses it outright.
    #   kind      shelf | app | data | doc -- what lives there, kept from
    #             rab_paths so the vocabulary does not fork
    #
    # An EMPTY path is honest and deliberate: the slug is reserved, the location
    # is not decided yet. seed_paths already draws this line (NO PATH YET vs NOT
    # ON DISK) and it is worth keeping -- inventing a folder name is a row that
    # lies until someone happens to make it match.
    #
    # rab_paths IS LEFT ALONE (his call): it still holds its 27 rows and nothing
    # reads it. This pair is the new record; retire that one when this carries
    # what you need.
    "paths": "slug TEXT, kind TEXT, tags TEXT, paths TEXT",
    "path": (
        "paths_id INTEGER, slug TEXT, path TEXT, kind TEXT, tags TEXT, "
        "is_root INTEGER DEFAULT 0, on_disk INTEGER DEFAULT 0, notes TEXT"
    ),
    # expenses/expense (2026-08-12, his shape) -- WHAT SOMETHING COST. The group
    # pattern again: `expenses` is the group, `expense` the item pointing home
    # through expenses_id, so a project or a contact holds ONE group id and the
    # charges hang off it. Read the ONE group row, then its members.
    #
    # HIS COLUMNS, TAKEN AS GIVEN. The demo rows in the styleguide carried a
    # single `when` and loose `value`/`tax`; this is the corrected shape:
    #
    #   purchase_date  when the thing was BOUGHT        -- epoch ms
    #   billing_date   when the charge was RAISED       -- epoch ms
    #   payment_date   when it was actually PAID        -- epoch ms, blank until
    #                  it is.
    #   date_added     already a house key -- not repeated here
    #
    # THREE DATES, THREE DIFFERENT QUESTIONS, and they are genuinely not the same
    # day: bought on the 2nd, billed on the 30th, paid on the 15th of next month.
    # Collapsing them into one `when` (which the styleguide demo did) is what
    # makes "what is outstanding" unanswerable -- the gap between billing_date
    # and payment_date IS that state, and purchase_date is what a person
    # actually remembers when they go looking for a charge.
    #   paid_by        who settled it
    #   total_amount   TEXT, not a float. SQLite has no decimal type and a float
    #                  loses cents on the way in and out; every other value column
    #                  in this db is TEXT for the same reason. Negative = credit.
    #   total_tax      TEXT, same reason
    #   type           one id from rab_types (kind='type')
    #   status         one id from rab_status, table_name='expense'
    #
    # THE LISTS ARE COMMA ID LISTS, tags-style -- the house pattern from
    # appointments, NOT json. notes/projects/contacts/messages hold "3,7,12".
    #
    # HIS LIST IS THE WHOLE LIST (his call, 2026-08-12). The styleguide demo row
    # also carried account, method, reference, is_billable and has_receipt, and
    # those were NOT asked for -- they are gone. A column nobody named is a column
    # that fills with junk, which is the same call that dropped links/source/kind
    # /body off `neurons`.
    #
    # `attachments` IS THE RECEIPT, and it is the ATTACH LIST -- the same both-ends
    # shape `notes` has everywhere: the attachment points home through
    # target='expense'/target_id, and the expense lists the ids back. Either end
    # reads without scanning the other table.
    # NO has_receipt FLAG. With a real list, a flag is a second copy of a fact the
    # list already answers -- the duplication that got `svg` dropped from rab_icons.
    # NO attachments ON THE GROUP (his call, 2026-08-12). A receipt is filed on
    # the EXPENSE it documents, not on the shelf the expenses sit in. When one
    # receipt covers several lines, each line carries the same attachment id --
    # which is what the two Micro Center rows do.
    # THE INVENTORY OF OUR AUTOMATED STUFF (2026-08-13) -- another group/item pair,
    # declared exactly like the ones above so nothing new has to be learned to read it.
    #
    # The GROUP is a family of scripts that do one job together: "adding components"
    # holds new-component, new-atom, new-element; "code reviews" holds its own set.
    # The ITEM is one script -- where it lives, what it is called, when it last ran.
    #
    # WHY IT IS A TABLE AT ALL: automation/ has grown to three stamps, four audits, an
    # svg normaliser, an icon indexer and a dozen code scans, and the only record of
    # what exists is the folder tree. A row per script is what lets a screen ask the
    # questions a folder cannot -- what has never been run, what ran today, what a
    # family is made of.
    "automations": "tags TEXT, status TEXT, automations TEXT",
    "automation": (
        # WHERE IT IS, split in two on purpose: `path` is the folder (automation/add/
        # components/new-component) and `file_name` is the file inside it
        # (stampComponent.mjs). Two columns rather than one full path, because the
        # folder IS the unit here -- a family's scripts share a parent, a README sits
        # beside its script, and a screen listing "everything under add/" asks about
        # the folder alone. Joining them is a string add; splitting one is a guess.
        "automations_id INTEGER, path TEXT, file_name TEXT, last_ran INTEGER, "
        # WHAT IT STAMPS FROM. A stamp is a COPIER -- it reads a folder of placeholder
        # files and writes them out renamed, so the template is the half of the script
        # you actually edit: change the template and every future stamp changes with it,
        # change the .mjs and you have changed how copying works.
        #
        # It is a THIRD path rather than something derived, because the two do not line
        # up: add/components/new-component stamps templates/component/template, and
        # add/react-wrapper holds three scripts pointing at three different templates.
        # A rule that turned one into the other would be a guess with exceptions.
        #
        # IT IS REPO-ROOT-RELATIVE and so starts with __shared/, which `path` above does NOT.
        # The two are read by different doors: `path` is where a runner cd's to, and this is
        # handed straight to /api/files/tree, whose fence resolves against the REPO root. Stored
        # without the prefix it 400s -- "not a folder" -- and the tree renders empty with no
        # error on screen. Found exactly that way.
        #
        # Empty is a real answer -- a script that scans or audits copies nothing.
        "template_path TEXT, "
        # WHAT THE SCRIPT ASKS FOR, as the form that asks it. A JSON array of field rows in the
        # shape Form already reads -- id / name / type / default_value / is_required / options --
        # so a screen hands this straight to <Form items={...}> and never knows about any one
        # script. It is TEXT holding json rather than a column per option because no two scripts
        # take the same options: the stampers want a name and house|user, indexIcons wants four
        # flags and no positionals, and an audit wants nothing at all.
        #
        # Each row also carries `arg`, which is the one thing a form cannot guess -- whether the
        # value is written bare and in order (positional), as --name when true (flag), or as one
        # of two flags (pair). The scripts read "no flag" as "stop and ask a human", so a pair
        # always writes one side or the other.
        "settings TEXT, "
        # the house group-pattern words every item carries, same as task/todo/expense
        "status TEXT, tags TEXT, notes TEXT"
    ),
    "expenses": "tags TEXT, status TEXT, expenses TEXT",
    "expense": (
        # `label` is the BIG WORD the ledger draws -- "Render farm - August block".
        # name is the CATEGORY beside it (COMPUTE, PARTS), which is why both exist:
        # Expenses.tsx reads label for the title and name for the filter chips.
        "expenses_id INTEGER, label TEXT, "
        "purchase_date INTEGER, billing_date INTEGER, payment_date INTEGER, "
        "paid_by TEXT, total_amount TEXT, total_tax TEXT, "
        "type TEXT, status TEXT, tags TEXT, "
        ""
        "notes TEXT, projects TEXT, contacts TEXT, messages TEXT, attachments TEXT"
    ),
    # attachments: A FILE HUNG ON A ROW -- a receipt on an expense, a pdf on an
    # appointment, an image in a message. House keys carry name/title/description
    # and the dates, so the only additions are WHERE THE BYTES ARE and WHAT IT
    # IS HUNG ON.
    #
    # IT IS THE ATTACH PATTERN, not a new idea (the `note` shape, groups_api's
    # write_note): target/target_id point HOME at the owner row, and the owner's
    # own `attachments` list holds the ids back. Both ends stay true -- the door
    # keeps them that way, exactly as it already does for notes.
    #
    # NOT the `file` table. That one is a REVIEWED FILE COPY (2026-08-07) whose
    # `body` holds the UPDATED TEXT of a source file for the code-review board --
    # it exists to hold an edit, not to hang a document on a row. This holds a
    # POINTER to bytes on disk and never the bytes themselves.
    #
    # path/file are SPLIT the same way `interactive` splits them: `path` is the
    # folder from __shared with forward slashes, `file` is the name inside it.
    # api/files' fence ("resolve inside the repo or refuse") is what a reader
    # hands them to, so an attachment can never point out of the house.
    #
    #   mime / ext / bytes   what it IS to a browser -- enough to pick an icon,
    #                        show a size and decide inline-or-download WITHOUT
    #                        touching the disk. bytes is INTEGER (a size), the
    #                        one non-TEXT extra here.
    #   type                 one id out of rab_types (kind='type'), same as
    #                        contacts / appointments / interactive already do
    #   status               rab_status scoped table_name='attachments'
    #   is_image             0/1 -- flags are INTEGER, the house law. Denormalised
    #                        off mime so a gallery filters without parsing it.
    #   original_name        WHAT THE USER CALLED IT before the disk name was
    #                        made safe. Kept because it is the only copy of that
    #                        fact and a download should offer it back.
    "attachments": (
        "path TEXT, file TEXT, original_name TEXT, "
        "mime TEXT, ext TEXT, bytes INTEGER, is_image INTEGER DEFAULT 0, "
        "type TEXT, status TEXT, tags TEXT, "
        "notes TEXT"
    ),
    # docs/doc -- THE GROUP PATTERN AGAIN, declared exactly like tasks/task and
    # the classroom shelves so nothing new has to be learned to read it: the
    # PLURAL is the group (house keys + a list column named like the table), the
    # SINGULAR is the item, pointing home through `docs_id`. You never pull the
    # whole shelf -- read the ONE group row by id, then its members by docs_id.
    #
    # A doc is A WRITTEN THING WE KEEP: a README, a spec, a handoff, a page of
    # prose. It carries its own words in `body` (like note and idea do) AND may
    # point at a file on disk through path/file -- one, the other, or both, since
    # a doc that started as a file and got edited here has both and they are not
    # the same fact.
    #
    # NOT attachments (a file HUNG on a row -- a pointer to bytes, no words of
    # its own) and NOT `file` (a reviewed COPY of source for the code-review
    # board). The three answer different questions: what we WROTE, what is
    # PINNED to a row, what is being REVIEWED.
    "docs": "tags TEXT, status TEXT, docs TEXT",
    "doc": (
        "docs_id INTEGER, body TEXT, path TEXT, file TEXT, "
        "tags TEXT, status TEXT, type TEXT, version TEXT, "
        ""
        "attachments TEXT, notes TEXT, messages TEXT"
    ),
    # interactive: A STANDALONE THING ON DISK -- the html/app under
    # __shared/interactive that opens with no build (seed_paths calls that shelf
    # "standalone html that opens with no build").
    #
    # NOT rab_interactive. That one is the CATALOG shelf -- location/kind/tags
    # swept out of interactive/AUDIT.txt, three fields, machine-fed. THIS is the
    # working row: where the thing lives, what it is, what state it is in, and
    # what has been attached to it. Two tables because they answer different
    # questions; the catalog says what exists, this says what we are doing with it.
    #
    # path/file are SPLIT on purpose: `path` is the folder from __shared with
    # forward slashes, `file` is the entry point inside it. The catalog's
    # `location` glues them back together, so a row here can be reconciled
    # against a rab_interactive row without parsing a string apart.
    #
    # type   -> what it IS, one id out of rab_types (kind='type'), same as
    #           contacts/appointments already do
    # status -> what state it is in, the rab_status vocabulary scoped by
    #           table_name='interactive'
    #
    # THE LISTS ARE COMMA ID LISTS, tags-style -- the house pattern from
    # appointments ("contacts/tasks/users/messages hold 3,7,12"), NOT json and
    # NOT join tables. `notes` is the attach list every row table carries (his
    # call 2026-08-06). `expenses` has NO TABLE YET: the column is declared
    # because it was asked for, and an id list costs nothing until the shelf
    # lands -- when it does, the ids already written here still mean what they say.
    "interactive": (
        "path TEXT, file TEXT, tags TEXT, type TEXT, status TEXT, "
        "messages TEXT, notes TEXT, projects TEXT, expenses TEXT, contacts TEXT"
    ),
    # the machine's own table: settings / admin / flags / migrations. type
    # says what kind of fact a row is, value holds it (json when it needs shape)
    "system": "type TEXT, value TEXT",

    # ---- THE CATALOG (2026-07-30) ----------------------------------------
    # One table per shelf. Each mirrors that folder's AUDIT.txt, whose format
    # is exactly three fields: name | description | location. name and
    # description are HOUSE KEYS already; `location` is the only column these
    # add, so an indexer is a split and a write -- nothing to translate.
    #
    #   ui/atoms/AUDIT.txt        -> rab_atoms
    #   ui/elements/AUDIT.txt     -> rab_elements
    #   ui/components/AUDIT.txt   -> rab_components
    #   ui/pages/AUDIT.txt        -> rab_pages
    #   dashboards/AUDIT.txt      -> rab_dashboards
    #   interactive/AUDIT.txt     -> rab_interactive
    #
    # `kind` is the one extra the sweep wants: an AUDIT file carries commented
    # sections (css-only atoms, python commanders, vanilla-only pages, staging
    # apps), and kind is where that lands so the catalog does not lie about
    # what a row actually is.
    "rab_atoms": "location TEXT, kind TEXT, tags TEXT",
    "rab_elements": "location TEXT, kind TEXT, tags TEXT",
    "rab_components": "location TEXT, kind TEXT, tags TEXT",
    # rab_pages carries one column the other shelves do not: `layout`, the
    # page builder's saved grid as json -- {cols, rows, areas, content}.
    # A CATALOGUED page has a location (a .tsx someone wrote). A BUILT page
    # has a layout and no location, because nobody wrote a file: it was drawn.
    # Both are pages, both live here, and `kind` says which.
    # -> dashboards/page-builder/
    "rab_pages": "location TEXT, layout TEXT, kind TEXT, tags TEXT",
    "rab_dashboards": "location TEXT, kind TEXT, tags TEXT",
    "rab_interactive": "location TEXT, kind TEXT, tags TEXT",

    # themes and tokens have NO folder to sweep -- they are loose css sheets
    # (ui/themes/*.css, ui/tokens/base.css), so these are hand-kept. `value`
    # holds the token's value or the theme's class; `type` groups them.
    "rab_themes": "location TEXT, class_name TEXT, tags TEXT",
    "rab_tokens": "type TEXT, value TEXT, theme TEXT, tags TEXT",

    # skills and memory: the two halves a neuron points at. THE SAME SHAPE AS
    # A NEURON, on purpose -- a card is a card, so one reader, one writer, one
    # form handles all three and nothing has to know which kind it is holding.
    #
    #   A SKILL is HOW TO DO A THING -- the recipe, the order, the gesture.
    #   A MEMORY is WHAT WE LEARNED -- the scar, the call, the why.
    #
    # Same fields as neurons, minus the tree (`parent`/`neurons`): these hang
    # off a neuron, they do not carry children of their own.
    #
    #   neuron       which card it hangs off, by name
    #   connections  other cards it points at -- the card's own
    #                `== Connections ==` line
    "rab_skills": (
        "neuron TEXT, folder TEXT, hint TEXT, summary TEXT, details TEXT, "
        "tags TEXT, connections TEXT, ganglion TEXT, nucleus TEXT, "
        "private INTEGER DEFAULT 0"
    ),
    "rab_memory": (
        "neuron TEXT, folder TEXT, hint TEXT, summary TEXT, details TEXT, "
        "tags TEXT, connections TEXT, ganglion TEXT, nucleus TEXT, "
        "private INTEGER DEFAULT 0"
    ),

    # paths: WHERE EVERYTHING IS. One row per known folder.
    #
    #   ROOT IS THE ONLY ABSOLUTE ONE -- it holds the real machine path
    #   (c:\rab-dashboard here, something else on the server). Every other row
    #   is RELATIVE to it: /chrome, /ui/atoms, /icons. So the whole project
    #   moves by editing ONE row, and nothing else in the db knows or cares
    #   what drive it lives on.
    #
    #   slug     what code asks for: root | ui | components | atoms | icons ...
    #   path     absolute for root, relative (leading /) for everyone else
    #   parent   the slug it hangs off, so the tree is walkable ('' for root)
    #   kind     shelf | app | data | doc -- what lives there
    "rab_paths": "slug TEXT, path TEXT, parent TEXT, kind TEXT, tags TEXT",

    # origins: WHO WROTE A ROW. Every table has an `origin` column and a write
    # is refused without it -- this is the list of writers that legally exist,
    # so 'dbcrud', 'index_icons', 'master-control-program' are declared things
    # instead of whatever a caller happened to type that day.
    "rab_origins": "slug TEXT, kind TEXT, count INTEGER DEFAULT 0, tags TEXT",

    # status: the states a row can be IN. `table_name` scopes it, because a
    # project's states are not a task's -- one vocabulary, filtered, so a
    # picker offers only what belongs. `rank` orders them for display.
    "rab_status": "slug TEXT, table_name TEXT, color TEXT, rank INTEGER DEFAULT 0, tags TEXT",

    # tags: the VOCABULARY. Every other table carries a `tags` TEXT column
    # holding a comma list -- this table is the list of tags that legally
    # exist, so a picker has something to offer and a typo is findable.
    # `count` is a cache the sweep refreshes; the tags columns stay the truth.
    "rab_tags": "slug TEXT, color TEXT, kind TEXT, count INTEGER DEFAULT 0",

    # icons: the glyph vocabulary -- WHERE the glyph is, never the glyph itself.
    #
    # `svg` IS GONE (his call, 2026-08-12). It held the full markup of all 294
    # icons inline in the db, which is the exact thing flows_api already refuses:
    # "an svg is a beautiful OUTPUT and a terrible record". The file on disk is
    # the truth; a row points AT it. Nothing read the column -- no api, no ui,
    # and the indexer that wrote it never came over from v1 -- so it was 294
    # rows of dead markup making every read heavier for nothing.
    # `view_box` went with it: it was only ever parsed off that markup, and a
    # renderer reading the file has the viewBox already.
    #
    # `location` is the MATCH KEY the indexer reconciles on -- it was missing
    # at first, so every run matched nothing and inserted a second copy of all
    # 293 rows. An indexer without a stable key is a duplicator.
    "rab_icons": "location TEXT, slug TEXT, icon_set TEXT, tags TEXT",
}

TABLES = {name: f"{BASE_COLUMNS}, {extra}" for name, extra in EXTRA_COLUMNS.items()}

# columns the LAYER owns -- a caller never sets these by hand
STAMPED = ("id", "date_added", "date_edited", "created")


def now_ms() -> int:
    return int(time.time() * 1000)


# ── THE ID ────────────────────────────────────────────────────────────────
# A ULID: 48 bits of millisecond timestamp + 80 bits of randomness, written in
# Crockford base32 -- 26 characters, and LEXICALLY SORTABLE BY TIME. That last
# part is the whole reason it beat a uuid here: `ORDER BY id` IS creation order,
# so nothing has to look at date_added to sort a list.
#
# Crockford base32 leaves out I, L, O and U -- the letters that misread as 1, 0
# or as a word nobody wants in an id.
#
# NO DEPENDENCY. This file has never needed one and a 15-line encoder is not
# worth breaking that for.
_CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def new_id() -> str:
    """A fresh ULID. Time-ordered, collision-safe, 26 chars."""
    stamp = int(time.time() * 1000)
    entropy = int.from_bytes(_os.urandom(10), "big")
    n = (stamp << 80) | entropy
    out = []
    for _ in range(26):
        out.append(_CROCKFORD[n & 31])
        n >>= 5
    return "".join(reversed(out))


def connect() -> sqlite3.Connection:
    """One connection, rows as dicts, WAL on, foreign keys honored."""
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL")
    con.execute("PRAGMA foreign_keys=ON")
    return con


def init_db() -> None:
    """Create every table in TABLES, AND add any column a table is missing.

    THE MIGRATION HALF WAS ABSENT UNTIL 2026-07-31 and it failed silently:
    CREATE TABLE IF NOT EXISTS does nothing to a table that already exists, so
    a new column added to TABLES never reached the db. The schema said one
    thing, the db held another, and nothing errored -- a write to the new
    column just raised "no such column" much later, somewhere else.

    ADDING IS ALL IT DOES. It never drops, renames or retypes -- migrations
    are additive, which is the house law and also the only kind that cannot
    lose data. A column that exists in the db but not in TABLES is left
    exactly alone.
    """
    con = connect()
    try:
        for name, columns in TABLES.items():
            con.execute(f"CREATE TABLE IF NOT EXISTS {name} ({columns})")

            have = {r[1] for r in con.execute(f"PRAGMA table_info({name})")}
            for spec in columns.split(","):
                spec = spec.strip()
                if not spec:
                    continue
                col = spec.split()[0]
                # the PK is part of CREATE and can never be ALTERed in
                if col in have or "PRIMARY KEY" in spec.upper():
                    continue
                con.execute(f"ALTER TABLE {name} ADD COLUMN {spec}")
                print(f"  + {name}.{col}")
        con.commit()
    finally:
        con.close()


def _check(table: str) -> str:
    if table not in TABLES:
        raise ValueError(f"unknown table: {table}")
    return table


def columns(table: str) -> list:
    """The real column names of a table, read off the db itself."""
    con = connect()
    try:
        rows = con.execute(f"PRAGMA table_info({_check(table)})").fetchall()
        return [r["name"] for r in rows]
    finally:
        con.close()


def read(table: str, **where) -> list:
    """Rows as dicts. Equality filters only; soft-deleted rows never come back.

    Unknown filter keys raise (a typo'd column is a bad ask, not an empty list).
    """
    _check(table)
    known = columns(table)
    clauses = ["(deleted IS NULL OR deleted = 0)"]
    values = []
    for key, val in (where or {}).items():
        if key not in known:
            raise ValueError(f"unknown column for {table}: {key}")
        clauses.append(f"{key} = ?")
        values.append(val)
    # WE ORDER BY DATE (his call, 2026-08-12). It used to be ORDER BY id, which
    # is only the same answer while nothing is ever backdated -- and the moment a
    # row carries a real date that is not its insert order, ORDER BY id is wrong
    # and silently so.
    #
    # THIS IS WHY THE GROUP LIST COLUMN IS NOT THE ORDER. tasks(19).tasks held
    # "17,18,19,20" so a dragged order could be kept, and _write_item appended to
    # it on every insert -- two copies of one fact, maintained on every write, to
    # preserve an ordering the date already gives for free.
    #
    # id is the TIE-BREAK, not the sort: two rows stamped in the same millisecond
    # still come back in a stable order.
    sql = (
        f"SELECT * FROM {table} WHERE {' AND '.join(clauses)} "
        "ORDER BY COALESCE(date_added, 0), id"
    )
    con = connect()
    try:
        return [dict(r) for r in con.execute(sql, values).fetchall()]
    finally:
        con.close()


def write(table: str, **fields) -> str:
    """Insert a row, return its id. `origin` is OPTIONAL -- see the header.

    IT USED TO RAISE (his call, reversed 2026-08-12). The guard cost more than
    it bought: it blocked every write that did not think to name itself, and
    the writes that DID name themselves largely said 'other' -- 195 rows of it.
    A required field people fill with a junk value records nothing and still
    breaks callers, so it is a plain column now. Name it when the answer is
    real; leave it when it is not.
    """
    _check(table)
    known = columns(table)
    stamp = now_ms()
    row = {k: v for k, v in fields.items() if k in known and k not in STAMPED}
    # THE ID IS OURS, NOT SQLITE'S (2026-08-13). It used to be an autoincrement
    # integer; it is a ULID now, so the row carries its own id in and lastrowid
    # is no longer the answer.
    row.setdefault("id", new_id())
    row["date_added"] = stamp
    row["date_edited"] = stamp
    row["created"] = str(stamp)          # the legacy TEXT stamp, dual-written
    row.setdefault("deleted", 0)
    keys = list(row.keys())
    sql = (
        f"INSERT INTO {table} ({', '.join(keys)}) "
        f"VALUES ({', '.join('?' for _ in keys)})"
    )
    con = connect()
    try:
        con.execute(sql, [row[k] for k in keys])
        con.commit()
        return row["id"]
    finally:
        con.close()


def edit(table: str, row_id, **fields) -> int:
    """Update by id, return how many rows changed. date_edited is stamped here."""
    _check(table)
    known = columns(table)
    row = {k: v for k, v in fields.items() if k in known and k not in STAMPED}
    if not row:
        raise ValueError(f"nothing to edit on {table}/{row_id}")
    row["date_edited"] = now_ms()
    sets = ", ".join(f"{k} = ?" for k in row)
    con = connect()
    try:
        cur = con.execute(
            f"UPDATE {table} SET {sets} WHERE id = ?",
            [*row.values(), str(row_id)],
        )
        con.commit()
        return cur.rowcount
    finally:
        con.close()


def delete(table: str, row_id) -> int:
    """SOFT delete: deleted=1. The row stays; manage/restore brings it back."""
    _check(table)
    con = connect()
    try:
        cur = con.execute(
            f"UPDATE {table} SET deleted = 1, date_edited = ? WHERE id = ?",
            [now_ms(), str(row_id)],
        )
        con.commit()
        return cur.rowcount
    finally:
        con.close()


def restore(table: str, row_id: int) -> int:
    """Undo a soft delete -- what /api/manage/restore rides on."""
    _check(table)
    con = connect()
    try:
        cur = con.execute(
            f"UPDATE {table} SET deleted = 0, date_edited = ? WHERE id = ?",
            [now_ms(), str(row_id)],
        )
        con.commit()
        return cur.rowcount
    finally:
        con.close()


def trash(table: str = None) -> list:
    """The soft-deleted rows -- one table, or every table when none is named."""
    names = [_check(table)] if table else list(TABLES)
    out = []
    con = connect()
    try:
        for name in names:
            rows = con.execute(f"SELECT * FROM {name} WHERE deleted = 1").fetchall()
            out.extend({**dict(r), "table": name} for r in rows)
        return out
    finally:
        con.close()


def stats() -> dict:
    """Row + deleted counts per table -- what /api/manage/stats reports."""
    con = connect()
    try:
        out = {}
        for name in TABLES:
            live = con.execute(
                f"SELECT COUNT(*) FROM {name} WHERE deleted IS NULL OR deleted = 0"
            ).fetchone()[0]
            gone = con.execute(
                f"SELECT COUNT(*) FROM {name} WHERE deleted = 1"
            ).fetchone()[0]
            out[name] = {"rows": live, "deleted": gone}
        return out
    finally:
        con.close()


def backup(to_path: str = None) -> str:
    """WAL-SAFE backup -- sqlite's own, never a file copy (the header law)."""
    target = Path(to_path) if to_path else HERE / f"base.backup.{now_ms()}.db"
    con = connect()
    try:
        dest = sqlite3.connect(target)
        try:
            con.backup(dest)
        finally:
            dest.close()
        return str(target)
    finally:
        con.close()


if __name__ == "__main__":
    init_db()
    print(f"base.db ready -> {DB_PATH}")
    for name, counts in stats().items():
        print(f"  {name:<12} {counts['rows']} rows")
