r"""
rab_widget_api.py -- the widget's box, server-side: load-by-id across tables,
ONE formatted return; save back to those same ids.

    GET  /api/rab-widget?projects=3&messages=12,40&ideas=7,9
         -> {"projects": {..row..}, "messages": [rows], "ideas": [rows]}
         A single id returns the row (or None); a comma list returns rows.
         Every key must be a real table name -- the house keys (id on every
         table) are what make this generic.

    POST /api/rab-widget  {"messages": [{"id": 12, "read": 1}], ...}
         -> {"saved": {"messages": [12]}}
         EDITS ONLY, by id. The box saves back to the ids it was handed and
         never invents rows -- new rows go through POST /api/<table>.

No SQL in this file; base_db primitives only. Mutations bump().
"""
from _router import route, json_body
from events_api import bump
import base_db as db


def _ids(raw):
    """'12,40' -> [12, 40]; '3' -> [3]. A bad piece raises -- a 400, correctly."""
    try:
        return [int(p) for p in str(raw).split(",") if p != ""]
    except ValueError:
        raise ValueError(f"rab-widget: ids must be integers, got: {raw}")


@route("GET", "/api/rab-widget")
def read_bag(handler, parts, query):
    out = {}
    for table, raw in query.items():
        if table not in db.TABLES:
            raise ValueError(f"rab-widget: unknown table: {table}")
        ids = _ids(raw)
        by_id = {r.get("id"): r for r in db.read(table)}
        found = [by_id[i] for i in ids if i in by_id]
        single = "," not in str(raw)
        out[table] = (found[0] if found else None) if single else found
    return out


@route("POST", "/api/rab-widget")
def save_bag(handler, parts, query):
    body = json_body(handler)
    saved = {}
    for table, rows in (body or {}).items():
        if table not in db.TABLES:
            raise ValueError(f"rab-widget: unknown table: {table}")
        if isinstance(rows, dict):
            rows = [rows]
        done = []
        for fields in rows or []:
            fields = dict(fields or {})
            row_id = fields.pop("id", None)
            if row_id is None:
                raise ValueError(
                    f"rab-widget: every {table} save needs an id -- "
                    "the box only writes back to ids it was handed")
            db.edit(table, int(row_id), **fields)
            done.append(int(row_id))
        saved[table] = done
    if any(saved.values()):
        bump()
    return {"saved": saved}
