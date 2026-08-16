"""index_catalog -- read every shelf's AUDIT.txt into its catalog table.

    python index_catalog.py            report only, changes nothing
    python index_catalog.py --write    put them in the db

ONE INDEXER FOR SIX SHELVES, because they share one contract: an AUDIT record
is `name | description | location`, and name + description are HOUSE KEYS
already. So an indexer is a split and a write -- nothing to translate.

AUDIT IS INTENT, THE FOLDER IS FACT. This reports the drift; it never edits an
AUDIT file and never hard-deletes a row. -> [[indexers-are-reconcilers]]

THE MATCH KEY IS `location`, not name. Two shelves can hold a `Card`; nothing
holds the same path twice. An indexer without a stable key is a duplicator --
that is the icons scar, paid for once already (293 files, 586 rows).
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SHARED = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import base_db  # noqa: E402

# table -> the AUDIT.txt that feeds it
SHELVES = {
    "rab_atoms":       "ui/atoms/AUDIT.txt",
    "rab_elements":    "ui/elements/AUDIT.txt",
    "rab_components":  "ui/components/AUDIT.txt",
    "rab_pages":       "ui/pages/AUDIT.txt",
    "rab_dashboards":  "dashboards/AUDIT.txt",
    "rab_interactive": "interactive/AUDIT.txt",
}


def records(path):
    """Every `name | description | location` line AFTER the RECORDS heading.

    THE HEADING MATTERS. The format is documented at the top of each AUDIT
    with a worked example, and that example parses as a record named "name" --
    it is how the icons dry run came back with 294 for 293 files. Records
    start after RECORDS, and nowhere else."""
    if not os.path.exists(path):
        return None
    found, started = [], False
    with open(path, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            bare = line.strip()
            if not started:
                started = bare == "RECORDS"
                continue
            if not bare or bare.startswith("#") or set(bare) == {"="}:
                continue
            parts = [p.strip() for p in bare.split(" | ")]
            if len(parts) < 3:
                continue
            found.append({
                "name": parts[0],
                "description": parts[1],
                "location": parts[2],
            })
    return found


def on_disk(location):
    """Does the thing an AUDIT record points at actually exist?"""
    return os.path.exists(os.path.join(SHARED, location.replace("/", os.sep)))


def run(write=False):
    total_new = total_edit = total_same = 0

    for table, audit in SHELVES.items():
        rows = records(os.path.join(SHARED, audit))
        print("=" * 66)
        if rows is None:
            print("%-18s NO AUDIT FILE at %s" % (table, audit))
            continue

        have = {r.get("location"): r for r in base_db.read(table)}
        missing = [r for r in rows if not on_disk(r["location"])]
        new = [r for r in rows if r["location"] not in have]
        gone = [loc for loc in have if loc not in {r["location"] for r in rows}]

        print("%-18s %3d records   %3d in db" % (table, len(rows), len(have)))
        if missing:
            print("   AUDIT SAYS IT IS THERE AND IT IS NOT (%d):" % len(missing))
            for r in missing:
                print("      %-30s %s" % (r["name"], r["location"]))
        if gone:
            print("   IN THE DB, NOT IN THE AUDIT (%d) -- not touched, your call:" % len(gone))
            for loc in gone:
                print("      %s" % loc)

        if not write:
            print("   would add %d" % len(new))
            continue

        made = edited = same = 0
        for r in rows:
            row = dict(r, title=r["name"], origin="other", added_by="index_catalog")
            old = have.get(r["location"])
            if not old:
                base_db.write(table, **row)
                made += 1
            elif any(str(old.get(k) or "") != str(v or "")
                     for k, v in r.items()):
                base_db.edit(table, old["id"], **r)
                edited += 1
            else:
                same += 1
        print("   %d new  %d edited  %d unchanged" % (made, edited, same))
        total_new += made
        total_edit += edited
        total_same += same

    if write:
        print("=" * 66)
        print("TOTAL  %d new  %d edited  %d unchanged"
              % (total_new, total_edit, total_same))


if __name__ == "__main__":
    run(write="--write" in sys.argv)
