r"""
manage_api.py -- running the DB, not the data in it.

    GET  /api/manage/stats               live + soft-deleted counts per table
    GET  /api/manage/trash[?table=x]     the soft-deleted rows (what a purge WOULD take)
    POST /api/manage/restore {table,id}  UNDELETE -- flip deleted back to 0
    POST /api/manage/backup              WAL-safe copy into db/_backups/
    GET  /api/manage                     lists what is available

RESTORE IS THE POINT OF SOFT DELETE. Nothing here ever destroys a row: delete
hides it, restore brings it back whole. A real purge stays a deliberate, separate
pass -- and trash shows exactly what one would remove, so it is never blind.

BACKUP uses sqlite's own backup api, never a file copy: base.db runs in WAL mode
and copying a live WAL database gives a torn read.
"""
import sqlite3
import time
from pathlib import Path

from _router import route, json_body
from events_api import bump
import base_db as db

BACKUPS = Path(db.DB_PATH).resolve().parent / "_backups"


def stats():
    with db._conn() as c:
        tables = {}
        for t in db.TABLES:
            live = c.execute(f'SELECT COUNT(*) FROM "{t}" WHERE ("deleted" IS NULL OR "deleted"=0)').fetchone()[0]
            gone = c.execute(f'SELECT COUNT(*) FROM "{t}" WHERE "deleted"=1').fetchone()[0]
            tables[t] = {"rows": live, "deleted": gone}
    return {"db": str(db.DB_PATH), "tables": tables}


def trash(table=None):
    names = [table] if table in db.TABLES else list(db.TABLES)
    return {t: db.read(t, deleted=1) for t in names}


def restore(table, id=None, row_id=None):
    if table not in db.TABLES:
        raise ValueError(f"unknown table: {table}")
    rid = id if id is not None else row_id
    if rid is None:
        raise ValueError("restore needs an id")
    with db._conn() as c:
        cur = c.execute(f'UPDATE "{table}" SET deleted = 0 WHERE id = ?', [rid])
        return {"restored": cur.rowcount}


def backup():
    BACKUPS.mkdir(exist_ok=True)
    out = BACKUPS / f"base.db.backup_{time.strftime('%Y-%m-%d_%H%M%S')}"
    src, dst = sqlite3.connect(db.DB_PATH), sqlite3.connect(out)
    with dst:
        src.backup(dst)
    dst.close(); src.close()
    return {"backup": str(out), "bytes": out.stat().st_size}


READS = {"stats": stats, "trash": trash}
WRITES = {"restore": restore, "backup": backup}


@route("GET", "/api/manage")
def list_ops(handler, parts, query):
    return {"read": sorted(READS), "write": sorted(WRITES)}


@route("GET", "/api/manage", prefix=True)
def run_read(handler, parts, query):
    op = parts[2] if len(parts) > 2 else ""
    if op not in READS:
        raise ValueError(f"unknown manage op: {op}. reads: {sorted(READS)}")
    return READS[op](**query)


@route("POST", "/api/manage", prefix=True)
def run_write(handler, parts, query):
    op = parts[2] if len(parts) > 2 else ""
    if op not in WRITES:
        raise ValueError(f"unknown manage op: {op}. writes: {sorted(WRITES)}")
    out = WRITES[op](**json_body(handler))
    bump()                      # a restore changes what surfaces -> push it
    return out
