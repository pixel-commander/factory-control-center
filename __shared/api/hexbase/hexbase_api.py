r"""
hexbase_api.py -- the db's SHAPE, in the one format the hex viewer eats.

    GET /api/hexbase   -> { tables: [...], links: [...], counts: {...} }

WHY IT IS ITS OWN API AND NOT /api/schema: /api/schema is the raw column list
(table -> [columns]) and other things read it. The hex viewer wants a DRAWING:
one entry per table with its live row count and a guessed KIND, plus the links
between them already resolved. Two shapes, two endpoints -- widening the old
one would have broken its existing readers.

THE SHAPE, exactly what interactive/db-hex-base/hexbase-LIVE.html reads:

    tables[] = { table, records, type, columns[] }
        table    the table name       -> the hex's label
        records  live row count       -> the hex's HEIGHT
        type     data|lookup|junction|template  -> the hex's COLOUR
        columns  every column name    -> the hex's face

    links[]  = { from, to, via }
        a column named <thing>_id in `from` pointing at <thing>.id in `to`.
        `via` is that column. This is the whole FK story -- the db declares no
        foreign keys, so the NAME is the relationship (the house convention:
        chat_id -> chats.id).

    counts   = { tables, links }

THE KIND GUESS, and it is a guess, stated plainly:
    junction  2+ *_id columns and little else -- it exists to join
    lookup    a vocabulary table (rab_tags, rab_icons)
    template  the catalog tables -- they describe the app, not its data
    data      everything else
"""
from _router import route
import base_db as db

# a plural table name -> what a <thing>_id points AT. The db has no foreign
# keys; the column NAME is the relationship, so this is the whole mapping.
SINGULAR = {
    "users": "user",
    "messages": "message",
    "chats": "chat",
    "ideas": "ideas",          # the GROUP table is already plural-named
    "idea": "idea",
    "projects": "project",
    "tasks": "task",
    "assignments": "assignment",
    "neurons": "neuron",
    "notes": "note",
}

CATALOG = ("rab_atoms", "rab_elements", "rab_components",
           "rab_pages", "rab_dashboards", "rab_interactive")
VOCAB = ("rab_tags", "rab_icons", "rab_themes", "rab_tokens")


def _kind(name, columns):
    """What kind of hex this table is. A guess -- see the header."""
    if name in CATALOG:
        return "template"
    if name in VOCAB or name == "system":
        return "lookup"
    fks = [c for c in columns if c.endswith("_id")]
    # a junction is mostly just ids: two or more, and few columns of its own
    if len(fks) >= 2 and len(columns) - len(db.BASE_COLUMNS.split(", ")) <= len(fks) + 1:
        return "junction"
    return "data"


@route("GET", "/api/hexbase")
def hexbase(handler, parts, query):
    """Every table as a hex, every *_id as a link."""
    # column name -> the table it points at, built from the mapping above
    points_at = {}
    for table, single in SINGULAR.items():
        points_at[single + "_id"] = table
    points_at["ideas_id"] = "ideas"          # idea.ideas_id -> the group
    points_at["pinned_message_id"] = "messages"

    tables, links = [], []
    for name in sorted(db.TABLES):
        columns = db.columns(name)
        rows = db.read(name)
        tables.append({
            "table": name,
            "records": len(rows),
            "type": _kind(name, columns),
            "columns": columns,
        })
        for col in columns:
            target = points_at.get(col)
            if target and target != name and target in db.TABLES:
                links.append({"from": name, "to": target, "via": col})

    return {
        "tables": tables,
        "links": links,
        "counts": {"tables": len(tables), "links": len(links)},
    }
