r"""
projects_api.py -- the projects table's OWN write, on top of the generic crud.

    POST /api/projects  {fields}  -> {id}

NOTHING AUTO-SPAWNS (his call, 2026-08-07 -- this REPLACES the 08-06
spawn, which auto-started the messages group on save). A new project is
a NEW PROJECT: one row, all four group columns empty. Clicking "new
project" is not a statement that a chat exists.

EVERY GROUP IS BORN ON FIRST USE, all four the same way -- messages,
tasks, todos, notes. The birth is groups_api's: it writes the group
wearing the project's own house keys, writes the id back onto the
project row, AND appends the item, then returns. One call, one all-clear.
The FE loads nothing until that response lands.

WHY THE SPAWN WENT: an auto-started chat is a row that says work is
happening in a place nobody has been. Same reason tasks/todos/notes were
already lazy -- this just makes messages honest with them.

THE GROUP PATTERN: plural table = group (house keys + `<table>` list column
of member ids); singular table = item pointing home via <plural>_id. The
item routes live in groups_api.py, which keeps the lists true on every add.

Registration: an EXACT route always beats tables_api's /api prefix route, so
this wins POST /api/projects. Every other verb rides the generic handler.
"""
from _router import route, json_body
from events_api import bump
import base_db as db


@route("POST", "/api/projects")
def write_project(handler, parts, query):
    """ONE ROW. No children, no ceremony -- see the header. The groups are
    born by groups_api the first time something is actually added."""
    new_id = db.write("projects", **json_body(handler))
    bump()
    return {"id": new_id}
