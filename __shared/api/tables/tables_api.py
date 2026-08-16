r"""
tables_api.py -- CRUD for every table. read / write / edit / delete.

    GET    /api/<table>[?col=val]      READ   -- soft-deleted rows hidden
    POST   /api/<table>   {fields}     WRITE  -> {id}
    PUT    /api/<table>/<id> {fields}  EDIT   -> {changed}
    DELETE /api/<table>/<id>           DELETE -> {deleted}   (soft: deleted=1)

ONE generic handler serves every table (the commander pattern) -- adding a table
to base_db.TABLES makes it routable here with no new code. Every call goes
through the base_db primitives; there is no SQL in this file.
"""
from _router import route, json_body
from events_api import bump
import base_db as db


def _table(parts):
    """['api','users','3'] -> 'users', validated against the real table list."""
    if len(parts) < 2 or parts[0] != "api":
        raise ValueError("not an api path")
    name = parts[1]
    if name not in db.TABLES:
        raise ValueError(f"unknown table: {name}")
    return name


def _row_id(parts):
    """The id AS WRITTEN -- no int() (2026-08-13). Ids are ULIDs now: 26 chars of
    Crockford base32, time-sortable, and int('01KZY6...') raises. gauge is still
    '1' and rraabbiitt '2', so the column holds both shapes and neither is a
    number to this door."""
    if len(parts) < 3:
        raise ValueError("this call needs a row id: /api/<table>/<id>")
    return str(parts[2])


@route("GET", "/api", prefix=True)
def read_rows(handler, parts, query):
    return db.read(_table(parts), **query)


@route("POST", "/api", prefix=True)
def write_row(handler, parts, query):
    new_id = db.write(_table(parts), **json_body(handler))
    bump()                                  # tell the site something landed
    return {"id": new_id}


@route("PUT", "/api", prefix=True)
def edit_row(handler, parts, query):
    changed = db.edit(_table(parts), _row_id(parts), **json_body(handler))
    bump()
    return {"changed": changed}


@route("DELETE", "/api", prefix=True)
def delete_row(handler, parts, query):
    deleted = db.delete(_table(parts), _row_id(parts))
    bump()
    return {"deleted": deleted}
