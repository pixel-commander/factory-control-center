r"""
brain_api.py -- the read-only window onto THE BRAIN (the new world's db).

    GET /api/brain/tree             the nuclei (top branches) with counts
    GET /api/brain/neurons          light rows; ?q= contains-filter over
                                    name/title/tags/summary, ?nucleus= scopes
    GET /api/brain/neuron?folder=   ONE full row -- details, skill, memory
    GET /api/brain/search?q=        RECALL: FTS5 MATCH, ranked, with snippets
                                    (the 2000x engine; falls back to LIKE if
                                    the index is missing -- run add_fts.py)

THE BRAIN IS ELSEWHERE. brain.db lives on the project drive (the new world);
this api opens it read-only over the share and never writes -- the txt files
in rraabbiitt are the truth, the db is the index, and the parser
(neurons_to_db.py, beside brain.db) is the only writer.

The db path is a NAME in the new world's PATHS.txt (brain-db). If the drive
moves, fix BRAIN_DB here to match that registry row -- one line.
"""
import sqlite3

from _router import route

BRAIN_DB = r"\\Desktop-1ro8vgn\projects\__shared\db\brain.db"

# the light shape the list rides -- heavy organs stay behind /neuron
LIGHT = "id, name, title, hint, summary, folder, parent, nucleus, tags, connections, neurons"


def _con():
    """A fresh read connection per request -- sqlite and threads do not share
    connections, and the door is threaded."""
    con = sqlite3.connect(BRAIN_DB)
    con.row_factory = sqlite3.Row
    return con


@route("GET", "/api/brain/tree")
def tree(handler, parts, query):
    """The top branches and how many neurons each holds."""
    con = _con()
    try:
        rows = con.execute(
            "SELECT nucleus, COUNT(*) AS n FROM neurons WHERE deleted = 0 "
            "GROUP BY nucleus ORDER BY n DESC").fetchall()
        return [dict(r) for r in rows]
    finally:
        con.close()


@route("GET", "/api/brain/neurons")
def neurons(handler, parts, query):
    """The light list. ?q= filters (contains, case-insensitive) over
    name/title/tags/summary; ?nucleus= scopes to one branch."""
    q = (query.get("q") or "").strip().lower()
    nucleus = (query.get("nucleus") or "").strip()
    sql = "SELECT " + LIGHT + " FROM neurons WHERE deleted = 0"
    args = []
    if q:
        like = "%" + q + "%"
        sql += (" AND (lower(name) LIKE ? OR lower(title) LIKE ?"
                " OR lower(tags) LIKE ? OR lower(summary) LIKE ?)")
        args += [like, like, like, like]
    if nucleus:
        sql += " AND nucleus = ?"
        args.append(nucleus)
    sql += " ORDER BY folder"
    con = _con()
    try:
        return [dict(r) for r in con.execute(sql, args).fetchall()]
    finally:
        con.close()


@route("GET", "/api/brain/search")
def search(handler, parts, query):
    """RECALL -- the FTS5 route, the 2000x lesson applied (23,765ms LIKE scan
    -> ms-class MATCH, banked in work/brain/brain-north-star). Ranked hits
    with surgical snippets, never whole neurons. Falls back to the LIKE
    filter if neurons_fts is missing so the door stays honest, not dead."""
    q = (query.get("q") or "").strip()
    if not q:
        raise ValueError("q is required, e.g. ?q=persistence")
    limit = min(int(query.get("limit") or 20), 100)
    # disarm FTS operators: each word becomes a quoted term, last gets prefix-*
    terms = [t.replace('"', '') for t in q.split() if t.replace('"', '')]
    if not terms:
        raise ValueError("q had no searchable words")
    match = " ".join('"' + t + '"' for t in terms[:-1]) + ' "' + terms[-1] + '"*'
    con = _con()
    try:
        try:
            rows = con.execute(
                "SELECT n.id, n.name, n.title, n.folder, n.nucleus, "
                "snippet(neurons_fts, -1, '[', ']', ' ... ', 10) AS snippet "
                "FROM neurons_fts JOIN neurons n ON n.id = neurons_fts.rowid "
                "WHERE neurons_fts MATCH ? AND n.deleted = 0 "
                "ORDER BY rank LIMIT ?", (match, limit)).fetchall()
            return {"engine": "fts5", "hits": [dict(r) for r in rows]}
        except sqlite3.OperationalError:
            like = "%" + q.lower() + "%"
            rows = con.execute(
                "SELECT id, name, title, folder, nucleus, summary AS snippet "
                "FROM neurons WHERE deleted = 0 AND (lower(name) LIKE ? "
                "OR lower(title) LIKE ? OR lower(tags) LIKE ? "
                "OR lower(summary) LIKE ? OR lower(details) LIKE ?) "
                "ORDER BY folder LIMIT ?",
                (like, like, like, like, like, limit)).fetchall()
            return {"engine": "like-fallback", "hits": [dict(r) for r in rows]}
    finally:
        con.close()


@route("GET", "/api/brain/neuron")
def neuron(handler, parts, query):
    """One neuron, whole -- the core plus the heavy organs."""
    folder = (query.get("folder") or "").strip()
    if not folder:
        raise ValueError("folder is required, e.g. ?folder=us/identity/the-bible")
    con = _con()
    try:
        row = con.execute("SELECT * FROM neurons WHERE folder = ? AND deleted = 0",
                          (folder,)).fetchone()
        if row is None:
            raise ValueError("no neuron at " + folder)
        return dict(row)
    finally:
        con.close()
