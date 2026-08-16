r"""
seed_path_map.py -- fill the paths/path MAP: where everything is, by group.

    python seed_path_map.py                 seed (or refresh) the map
    python seed_path_map.py --root D:\rab   seed with a different machine root
    python seed_path_map.py --dry           report only, write nothing

THE SHAPE (his call, 2026-08-12). The group pattern, same as tasks/task:

    paths   a NAMED BAG of locations -- root, user, rab
    path    ONE location inside it, pointing home through paths_id

THE SLOT IS THE POINT. A path row carries `slug` -- images, components,
elements, icons -- and THE SAME SLUG MEANS A DIFFERENT FOLDER IN EACH GROUP:

    db.read('path', paths_id=<user>, slug='images')   -> his images
    db.read('path', paths_id=<rab>,  slug='images')   -> the kit's

ROOT IS THE ONLY ABSOLUTE ROW (is_root=1). Everything else is relative to it,
so moving the project is editing ONE row:

    full path = root.path + row.path

Re-runnable: it matches on (group slug, item slug) and only writes a real
difference, so running it twice changes nothing -- the lesson index_icons paid
for, where an indexer without a stable key became a duplicator.

NEVER CREATES A FOLDER. A row whose folder is missing is a FINDING (on_disk=0),
reported and left alone. seed_paths drew this line first and it holds here:
NO PATH YET (slug reserved, location undecided) is not the same as NOT ON DISK.

rab_paths is LEFT ALONE -- it still holds its rows and nothing reads it.
"""
import argparse
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent          # __shared/db
SHARED = HERE.parent                            # __shared
sys.path.insert(0, str(HERE))

import base_db as db                            # noqa: E402

ORIGIN = "seed_path_map"

# ---------------------------------------------------------------------------
# THE MAP. One entry per group; each holds its slots.
#
#   group:  slug, kind, description
#   slots:  slug, path (relative to root -- '' means NOT PLACED YET), kind, desc
#
# ROOT is the group that anchors everything. Its one slot IS the machine path
# and it is the only absolute row in the whole table.
# ---------------------------------------------------------------------------
MAP = [
    {
        "slug": "root",
        "kind": "app",
        "description": "the anchor -- the one absolute path this machine keeps",
        "slots": [
            # path=None means "fill in the real machine root at seed time"
            ("root", None, "app", "the project root on this machine -- THE ONLY ABSOLUTE PATH"),
        ],
    },
    {
        "slug": "rab",
        "kind": "shelf",
        "description": "THE KIT -- everything the app is built from",
        # READ OFF THE DISK, not copied from the old seed_paths list -- that one
        # describes the v1 layout (chrome/, atoms/, tokens/ at __shared level)
        # and most of it is not here. A row that names a folder nobody made is
        # a row that lies, so this list is what THIS repo actually has.
        "slots": [
            ("shared",      "/__shared",                "app",   "the working root"),
            ("app",         "/__shared/app",            "app",   "the vite build machine"),
            ("api",         "/__shared/api",            "app",   "the door: one folder per api"),
            ("db",          "/__shared/db",             "data",  "base_db.py and base.db"),
            ("automation",  "/__shared/automation",     "app",   "the scanners and audits"),
            ("icons",       "/__shared/icons",          "shelf", "the svg shelf and its catalog"),
            ("ui",          "/__shared/ui",             "shelf", "THE POOL -- every shelf under here"),
            ("components",  "/__shared/ui/components",  "shelf", "composed components"),
            ("containers",  "/__shared/ui/containers",  "shelf", "Shell, Chassis -- the surfaces"),
            ("widgets",     "/__shared/ui/widgets",     "shelf", "the kit bound to a data shape"),
            ("pages",       "/__shared/ui/pages",       "shelf", "one view mounted inside chrome"),
            ("hooks",       "/__shared/ui/hooks",       "shelf", "useURL, useRABWidget, useContainerSize"),
            ("themes",      "/__shared/ui/themes",      "shelf", "the theme sheets"),
            ("types",       "/__shared/ui/types",       "shelf", "RAB.types.ts -- the keyring"),
            ("templates",   "/__shared/ui/templates",   "shelf", "the stamps"),
            ("dashboards",  "/__shared/ui/dashboards",  "shelf", "the boards"),
            ("effects",     "/__shared/ui/effects",     "shelf", "the effects"),
            ("js",          "/__shared/ui/js",          "shelf", "drag-sort, drag-scroll"),
        ],
    },
    {
        "slug": "user",
        "kind": "data",
        "description": "HIS -- what he keeps, not what the kit ships",
        # THE FOLDERS HE NAMED (2026-08-12), created beside __shared. The slots
        # mirror what is really on disk -- this list and the folder are the same
        # fact, so a NOT ON DISK finding means one of them moved.
        "slots": [
            ("user",       "/user",             "data",  "his root"),
            ("css",        "/user/css",         "shelf", "his css"),
            ("images",     "/user/images",      "data",  "his images"),
            ("icons",      "/user/icons",       "shelf", "his icons"),
            ("fonts",      "/user/fonts",       "shelf", "his fonts"),
            ("documents",  "/user/documents",   "doc",   "his documents"),
            ("components", "/user/components",  "shelf", "his components"),
            ("atoms",      "/user/atoms",       "shelf", "his atoms"),
            ("elements",   "/user/elements",    "shelf", "his elements"),
            ("uploads",    "/user/uploads",     "data",  "where an attachment's bytes land"),
        ],
    },
    {
        "slug": "brain",
        "kind": "data",
        "description": "the brain -- reserved slugs, locations not decided yet",
        "slots": [
            # EMPTY PATH IS HONEST: the slug is reserved so callers can already
            # ask for it; the location stays unset until he says where it lives.
            ("neurons",       "", "data", "the brain's neurons (mirrors the neurons table)"),
            ("boot_sequence", "", "data", "what a cold session reads to stand up as US"),
        ],
    },
]


def _full(root, rel):
    """root + relative -> a real path on this machine."""
    return Path(root) / str(rel or "").lstrip("/").replace("/", "\\")


def main():
    ap = argparse.ArgumentParser(description="seed the paths/path map")
    ap.add_argument("--root", help="the absolute project root (default: derived from this file)")
    ap.add_argument("--dry", action="store_true", help="report only, write nothing")
    args = ap.parse_args()

    # derived, not guessed: this file is __shared/db/seed_path_map.py
    root = args.root or str(SHARED.parent)

    db.init_db()

    groups_added, groups_same = [], []
    added, updated, same = [], [], []
    unplaced, absent = [], []

    for group in MAP:
        gslug = group["slug"]

        # ---- the group row -------------------------------------------------
        found = [r for r in db.read("paths", slug=gslug)]
        if found:
            gid = int(found[0]["id"])
            groups_same.append(gslug)
        else:
            groups_added.append(gslug)
            gid = 0 if args.dry else db.write(
                "paths",
                name=gslug, title=gslug, description=group["description"],
                slug=gslug, kind=group["kind"], paths="", origin=ORIGIN,
            )

        # ---- its slots -----------------------------------------------------
        have = {} if args.dry and not found else {
            r.get("slug"): r for r in (db.read("path", paths_id=gid) if gid else [])
        }
        member_ids = []

        for slug, rel, kind, desc in group["slots"]:
            is_root = 1 if (gslug == "root" and slug == "root") else 0
            value = root if is_root else rel

            # a finding, never a fix: report, do not create
            if not is_root:
                if not value:
                    unplaced.append(f"{gslug}/{slug}")
                elif not _full(root, value).exists():
                    absent.append(f"{gslug}/{slug}")
            on_disk = 1 if (is_root or (value and _full(root, value).exists())) else 0

            fields = {
                "name": slug, "title": slug, "description": desc,
                "paths_id": gid, "slug": slug, "path": value,
                "kind": kind, "is_root": is_root, "on_disk": on_disk,
            }

            row = have.get(slug)
            if row is None:
                added.append(f"{gslug}/{slug}")
                if not args.dry:
                    member_ids.append(db.write("path", origin=ORIGIN, **fields))
                continue

            member_ids.append(int(row["id"]))
            changed = any(str(row.get(k) or "") != str(v or "") for k, v in fields.items())
            if changed:
                updated.append(f"{gslug}/{slug}")
                if not args.dry:
                    db.edit("path", int(row["id"]), **fields)
            else:
                same.append(f"{gslug}/{slug}")

        # keep the group's own list true -- both ends, like every other pair
        if not args.dry and gid:
            joined = ",".join(str(i) for i in member_ids)
            if str(db.read("paths", id=gid)[0].get("paths") or "") != joined:
                db.edit("paths", gid, paths=joined)

    print("DRY RUN -- nothing written" if args.dry else "seeded paths/path")
    print(f"  root         {root}")
    print(f"  groups       {len(MAP)}  (+{len(groups_added)} new, {len(groups_same)} existing)")
    print(f"  slots        {sum(len(g['slots']) for g in MAP)}")
    print(f"  added        {len(added)}")
    print(f"  updated      {len(updated)}")
    print(f"  unchanged    {len(same)}")
    if unplaced:
        print(f"  NO PATH YET  {len(unplaced)}  (slug reserved, location unset): {', '.join(unplaced)}")
    if absent:
        print(f"  NOT ON DISK  {len(absent)}  (has a path, folder missing):")
        for a in absent:
            print(f"                 {a}")


if __name__ == "__main__":
    main()
