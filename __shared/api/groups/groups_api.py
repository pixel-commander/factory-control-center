r"""
groups_api.py -- the ITEM writes of the group pattern, on top of the crud.

    POST /api/message  {messages_id, fields}  -> {id}
    POST /api/task     {tasks_id, fields}     -> {id}
    POST /api/note     {notes_id, fields}     -> {id}

THE GROUP PATTERN (his call, 2026-08-06): the plural table is the GROUP --
house keys + a list column named like the table (messages[id].messages) --
and the singular table is the ITEM, pointing home via <plural>_id. These
routes keep the list TRUE: writing an item with a group id appends the new
item's id to that group's list, one transaction-shaped ceremony behind the
door. An item with no group id is just written (ungrouped is legal).

You never pull the whole shelf: read the ONE group row (/api/messages?id=3
via the generic GET) and its members (/api/message?messages_id=3).

Exact routes beat tables_api's prefix route; GET/PUT/DELETE stay generic.
"""
from _router import route, json_body
from events_api import bump
import base_db as db

# item table -> (group table, group pointer field, group list column)
PAIRS = {
    "message": ("messages", "messages_id", "messages"),
    "task": ("tasks", "tasks_id", "tasks"),
    "note": ("notes", "notes_id", "notes"),
    "todo": ("todos", "todos_id", "todos"),
    # the classroom shelves (2026-08-12) -- same pattern, three more shapes.
    # -> db/base_db.py declares them; ui/widgets/lists/hooks/useListData.ts
    # mirrors this map on the read side.
    "assignment": ("assignments", "assignments_id", "assignments"),
    "course": ("courses", "courses_id", "courses"),
    "classroom": ("classrooms", "classrooms_id", "classrooms"),
    # what something cost (2026-08-12) -- same pattern, hangs off a project or
    # a contact through target/target_id
    "expense": ("expenses", "expenses_id", "expenses"),
    # the inventory of our automated stuff (2026-08-13): a group is a FAMILY of
    # scripts that do one job together (adding components, code reviews); an item
    # is one script. -> db/base_db.py
    "automation": ("automations", "automations_id", "automations"),
    # the brain (2026-08-12): ganglion -> neurons -> neuron, and the two halves
    # a neuron points at
    "neuron": ("neurons", "neurons_id", "neurons"),
    "neurons": ("ganglion", "ganglion_id", "neurons"),
    "skill": ("skills", "skills_id", "skills"),
    "memory": ("memories", "memories_id", "memories"),
}


def _resolve_group(table, body):
    """FIND the project's group. NEVER START ONE (his call, 2026-08-12).

    A caller may send just project_id; the door looks up which group that
    project already points at and uses it. If the project has no group yet,
    the item is written UNGROUPED -- which the header already says is legal.

    IT USED TO BIRTH THE GROUP: no group meant write a new tasks/todos/messages
    row wearing the project's house keys and stamp its id back on the project.
    That is the auto-add, and it is gone. A row nobody asked for is a row that
    says work exists where none does -- project 3 carries messages='11',
    tasks='16' and todos='1' from that behaviour, all three empty.

    Making a group is now something a caller does ON PURPOSE, by writing the
    group row itself and passing its id.
    """
    group_table, pointer, list_col = PAIRS[table]
    project_id = body.pop("project_id", None)
    if body.get(pointer) or not project_id:
        return
    rows = db.read("projects", id=str(project_id))
    if not rows:
        return
    p = rows[0]
    # projects.<messages|tasks|notes|todos> is a comma list -- first id wins
    have = str(p.get(group_table) or "").split(",")[0].strip()
    if have:
        body[pointer] = str(have)
    # NO ELSE. The project has no group -- the item is written ungrouped and
    # nothing is created behind the caller's back.


def _write_item(table, body):
    """THE WHOLE CEREMONY, THEN THE ANSWER (his law, 2026-08-07): resolve or
    BIRTH the group, write the item, append it to the group's list -- and
    only then return. The caller waits on this one response; there is no
    half-done state it could load.

    IT ANSWERS WITH THE GROUP ID TOO. A caller that sent no group (the
    birth send: project_id, or target/target_id) has no other way to learn
    what the door just created, and waiting for the push means a gap where
    the pane knows about no group at all."""
    group_table, pointer, list_col = PAIRS[table]
    _resolve_group(table, body)
    new_id = db.write(table, **body)

    # THE APPEND IS GONE (his call, 2026-08-12). It used to write the new id onto
    # the group's list column too, so the row was recorded in BOTH directions:
    # the item pointing home, and the group listing its members.
    #
    # The only thing that second copy bought was ORDER -- the group's list was
    # the sort order a drag wrote. WE ORDER BY DATE, so it bought nothing, and
    # cost a second write on every insert plus two copies of one fact that could
    # disagree. One direction is enough: the item says where it belongs.
    #
    # base_db.read now sorts by date_added, so members come back in order with
    # nothing maintaining a list.

    bump()
    group_id = body.get(pointer)
    return {"id": new_id, pointer: str(group_id) if group_id else ""}


@route("POST", "/api/message")
def write_message(handler, parts, query):
    """A message may arrive pointed at an ITEM: target='task', target_id=19.
    The door reads that item's `messages` column -- its own chat's group id --
    and uses it. A bare CHAT NAME still works too (chat='projects').

    NOTHING IS BORN HERE ANY MORE (his call, 2026-08-12). Both births are gone:
    the one that created a messages group from target/target_id and stamped it
    on the item, and the one that created a group from an unknown chat name.
    A message whose group does not exist is written UNGROUPED rather than
    quietly starting a chat nobody asked for.

    MAKING THE GROUP IS THE CALLER'S JOB NOW -- useProject on the client owns
    that ceremony, on purpose, where it can be seen."""
    body = json_body(handler)
    chat = str(body.pop("chat", "") or "").strip()
    # popped, not used: it only ever titled a group this door no longer creates.
    # It is still removed from the body so it cannot reach db.write as a column
    # `message` does not have.
    body.pop("chat_title", None)
    # target/target_id ARE GONE (2026-08-13). A row no longer says what it hangs off;
    # the OWNER holds the list -- contacts.expenses, task.notes. So a
    # caller that knows the chat names it outright with messages_id.
    body.pop("target", None)
    body.pop("target_id", None)

    if chat and not body.get("messages_id"):
        rows = db.read("messages", name=chat)
        if rows:
            body["messages_id"] = str(rows[0]["id"])
        # NO ELSE -- an unknown chat name does not start a chat. The line is
        # written ungrouped and the caller makes the group when it means to.
    return _write_item("message", body)


@route("POST", "/api/task")
def write_task(handler, parts, query):
    return _write_item("task", json_body(handler))


@route("POST", "/api/note")
def write_note(handler, parts, query):
    """A note write does DOUBLE duty: the group append (like every item),
    AND -- when it carries target/target_id -- the ATTACH: the new note's id
    is appended to the OWNER row's `notes` list (every row table carries
    one, his call 2026-08-06, message excepted). Both ends stay true:
    note.target points at the owner, owner.notes lists the note."""
    body = json_body(handler)
    made = _write_item("note", dict(body))

    # THE ATTACH IS THE CALLER'S NOW (2026-08-13). target/target_id are gone, so the door
    # cannot work out who owns this note -- whoever writes it appends the id to that row's
    # own `notes` list, which is the one direction that survived.
    target = ""
    target_id = None
    if target and target_id and target in db.TABLES and "notes" in db.columns(target):
        rows = db.read(target, id=str(target_id))
        if rows:
            have = str(rows[0].get("notes") or "")
            joined = f"{have},{made['id']}" if have else str(made["id"])
            db.edit(target, str(target_id), notes=joined)

    return made


@route("POST", "/api/todo")
def write_todo(handler, parts, query):
    return _write_item("todo", json_body(handler))


# THE CLASSROOM SHELVES (2026-08-12). Nothing new happens here -- each is the
# same one-line write the task and todo doors are, because the ceremony lives
# in _write_item and the shapes differ only in PAIRS above. They are declared
# as separate routes rather than one generic /api/<item> for the reason the
# module docstring already gives: exact routes beat tables_api's prefix route,
# and a generic one would swallow paths nobody meant to hand it.
@route("POST", "/api/assignment")
def write_assignment(handler, parts, query):
    return _write_item("assignment", json_body(handler))


@route("POST", "/api/course")
def write_course(handler, parts, query):
    return _write_item("course", json_body(handler))


@route("POST", "/api/classroom")
def write_classroom(handler, parts, query):
    return _write_item("classroom", json_body(handler))


# expense (2026-08-12). THE ROUTE IS NOT OPTIONAL: being in PAIRS is what lets
# the ceremony run, but without an exact route the write falls through to
# tables_api's generic prefix handler, which writes the row and never appends it
# to the group. The first probe did exactly that -- expense written, group list
# still empty -- and it looked like a success.
@route("POST", "/api/expense")
def write_expense(handler, parts, query):
    return _write_item("expense", json_body(handler))


# automation (2026-08-13). Same reason the expense route is not optional: being in
# PAIRS is what lets the door resolve the group, but only an EXACT route reaches
# _write_item -- without it the write falls through to tables_api's generic prefix
# and the item is written without ever joining its group.
@route("POST", "/api/automation")
def write_automation(handler, parts, query):
    return _write_item("automation", json_body(handler))


# ---- THE BRAIN (2026-08-12) ------------------------------------------------
# Exact routes, same as every other item shape. Being in PAIRS is not enough:
# without a route the write falls through to tables_api's generic prefix
# handler and the ceremony never runs.
@route("POST", "/api/neuron")
def write_neuron(handler, parts, query):
    return _write_item("neuron", json_body(handler))


@route("POST", "/api/skill")
def write_skill(handler, parts, query):
    return _write_item("skill", json_body(handler))


@route("POST", "/api/memory")
def write_memory(handler, parts, query):
    return _write_item("memory", json_body(handler))
