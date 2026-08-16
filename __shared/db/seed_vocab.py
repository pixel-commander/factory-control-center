r"""
seed_vocab.py -- the vocabularies: who may write, and what a row may BE.

    python seed_vocab.py         seed (or refresh) origins + status
    python seed_vocab.py --dry   report only, write nothing

ORIGINS ARE REAL, NOT GUESSED. Every one below is a writer that actually
exists in this repo -- an api, a script, a component that posts. `count` is a
cache the sweep refreshes; the `origin` column on each row stays the truth.

STATUS IS SCOPED BY TABLE. A project's states are not a task's, so the row
carries `table_name` and a picker filters on it. `rank` is display order.

Re-runnable: matches on slug (+ table_name for status) and only writes a real
difference -- the lesson index_icons paid for, an indexer without a stable key
is a duplicator.
"""
import argparse
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import base_db as db                            # noqa: E402

ORIGIN = "seed_vocab"

# slug, kind, description -- WHERE A ROW CAME FROM. His four (2026-07-30):
# not which script ran, but what KIND of thing the row was born out of. A row
# whose origin is 'project' came out of project work; 'other' is the honest
# catch-all instead of inventing a category nobody asked for.
ORIGINS = [
    ("project", "source", "born out of project work"),
    ("message", "source", "born out of a conversation"),
    ("task",    "source", "born out of a task"),
    ("other",   "source", "everything else -- the honest catch-all"),
]

# table, slug, rank, description
#
# HIS EIGHT (2026-07-30), and they are ONE SHARED SET: table_name is '' so
# they fit anything with a status -- a project, a task, an idea, whatever
# comes next. My per-table guesses were replaced by these.
STATUS = [
    ("", "new",       1, "just arrived, untouched"),
    ("", "ready",     2, "ready to be worked"),
    ("", "on hold",   3, "deliberately paused"),
    ("", "processed", 4, "run through, done being handled"),
    ("", "approved",  5, "signed off"),
    ("", "rejected",  6, "turned down"),
    ("", "shipped",   7, "out the door"),
    ("", "retired",   8, "done and put away"),
]


def sync(table, rows, key_of, fields_of, dry):
    existing = {key_of(r): r for r in db.read(table)}
    added, updated, same = [], [], []
    for row in rows:
        key = key_of_input(row, table)
        fields = fields_of(row)
        fields["origin"] = ORIGIN
        found = existing.get(key)
        if found is None:
            added.append(key)
            if not dry:
                db.write(table, **fields)
            continue
        changed = any(str(found.get(k) or "") != str(v or "")
                      for k, v in fields.items() if k != "origin")
        if changed:
            updated.append(key)
            if not dry:
                db.edit(table, found["id"], **{k: v for k, v in fields.items() if k != "origin"})
        else:
            same.append(key)
    return added, updated, same


def key_of_input(row, table):
    """status is scoped by table, so its key is the pair"""
    return f"{row[0]}:{row[1]}" if table == "rab_status" else row[0]


def main():
    ap = argparse.ArgumentParser(description="seed the origins and status vocabularies")
    ap.add_argument("--dry", action="store_true", help="report only, write nothing")
    args = ap.parse_args()

    db.init_db()

    o_add, o_upd, o_same = sync(
        "rab_origins", ORIGINS,
        key_of=lambda r: r.get("slug"),
        fields_of=lambda row: {
            "name": row[0], "title": row[0], "description": row[2],
            "slug": row[0], "kind": row[1],
        },
        dry=args.dry,
    )

    s_add, s_upd, s_same = sync(
        "rab_status", STATUS,
        key_of=lambda r: f"{r.get('table_name')}:{r.get('slug')}",
        fields_of=lambda row: {
            "name": row[1], "title": row[1], "description": row[3],
            "slug": row[1], "table_name": row[0], "rank": row[2],
        },
        dry=args.dry,
    )

    print("DRY RUN -- nothing written" if args.dry else "seeded the vocabularies")
    print(f"  rab_origins  {len(ORIGINS):>3}   added {len(o_add)}  updated {len(o_upd)}  unchanged {len(o_same)}")
    print(f"  rab_status   {len(STATUS):>3}   added {len(s_add)}  updated {len(s_upd)}  unchanged {len(s_same)}")


if __name__ == "__main__":
    main()
