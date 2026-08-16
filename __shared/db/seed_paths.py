r"""
seed_paths.py -- put the project's folders into rab_paths.

    python seed_paths.py                 seed (or refresh) every path row
    python seed_paths.py --root D:\rab   seed with a different machine root
    python seed_paths.py --dry           report only, write nothing

ROOT IS THE ONLY ABSOLUTE ROW. It holds the real path on THIS machine
(c:\rab-dashboard here, something else on the server). Everything else is
relative to it -- /chrome, /ui/atoms, /icons -- so moving the project is
editing ONE row and nothing else in the db knows what drive it lives on.

Re-runnable: it matches on `slug` and only writes when a value actually
differs, so running it twice changes nothing (the lesson index_icons paid for
-- an indexer without a stable key is a duplicator).
"""
import argparse
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent          # __shared/db
SHARED = HERE.parent                            # __shared
sys.path.insert(0, str(HERE))

import base_db as db                            # noqa: E402

TABLE = "rab_paths"
ORIGIN = "seed_paths"

# slug, path (relative unless it is root), parent, kind, description
# __shared is the real working root -- every relative path below hangs off it.
PATHS = [
    ("root",        None,                 "",        "app",   "the project root on this machine -- THE ONLY ABSOLUTE PATH"),
    ("shared",      "/__shared",          "root",    "app",   "the working root: everything the app is made of"),
    ("app",         "/__shared/app",      "shared",  "app",   "the vite build machine and its node_modules"),
    ("chrome",      "/__shared/chrome",   "shared",  "app",   "the site wrapper: loads the style stack, owns the theme"),
    ("ui",          "/__shared/ui",       "shared",  "shelf", "THE POOL -- every shelf lives under here"),
    ("atoms",       "/__shared/ui/atoms", "ui",      "shelf", "the smallest pieces; some are css-only"),
    ("elements",    "/__shared/ui/elements", "ui",   "shelf", "one-thing components"),
    ("components",  "/__shared/ui/components", "ui", "shelf", "composed components: several things wired together"),
    ("pages",       "/__shared/ui/pages", "ui",      "shelf", "one view mounted inside chrome"),
    ("hooks",       "/__shared/ui/hooks", "ui",      "shelf", "useURL, useRABWidget, useContainerSize"),
    ("util",        "/__shared/ui/util",  "ui",      "shelf", "shared helpers"),
    ("themes",      "/__shared/ui/themes", "ui",     "shelf", "the four theme sheets"),
    ("tokens",      "/__shared/ui/tokens", "ui",     "shelf", "base.css -- the token sheet everything reads"),
    ("rab_widgets", "/__shared/ui/rab-widgets", "ui", "shelf", "the dashboard widgets: RabWidget, Chat"),
    ("dashboards",  "/__shared/dashboards", "shared", "shelf", "packageable dashboards, one folder each"),
    ("interactive", "/__shared/interactive", "shared", "shelf", "standalone html that opens with no build"),
    ("icons",       "/__shared/icons",    "shared",  "shelf", "the svg shelf and its catalog"),
    ("db",          "/__shared/db",       "shared",  "data",  "base_db.py and base.db"),
    ("api",         "/__shared/api",      "shared",  "app",   "the door: one folder per api"),
    ("js",          "/__shared/js",       "shared",  "shelf", "the db client for callers outside react"),
    ("docs",        "/__shared/docs",     "shared",  "doc",   "standalone html docs, served verbatim"),
    # NO PATH YET (2026-07-30, his call). The slug is reserved so everything
    # can already ask for it; the path stays EMPTY until he says where it
    # lives. An empty path is honest -- inventing /__shared/neurons would be
    # a row that lies until someone happens to make the folder match it.
    ("neurons",       "", "shared", "data", "the brain's neurons -- laws, scars, methods (mirrors the neurons table)"),
    ("boot_sequence", "", "shared", "data", "what a cold session reads to stand up as US"),
]


def main():
    ap = argparse.ArgumentParser(description="seed the project's paths into rab_paths")
    ap.add_argument("--root", help="the absolute project root (default: derived from this file)")
    ap.add_argument("--dry", action="store_true", help="report only, write nothing")
    args = ap.parse_args()

    # derived, not guessed: this file is __shared/db/seed_paths.py, so the
    # project root is two levels up
    root = args.root or str(SHARED.parent)

    db.init_db()
    existing = {r.get("slug"): r for r in db.read(TABLE)}
    added, updated, same = [], [], []

    for slug, path, parent, kind, desc in PATHS:
        fields = {
            "name": slug,
            "title": slug,
            "description": desc,
            "slug": slug,
            "path": root if slug == "root" else path,
            "parent": parent,
            "kind": kind,
            "origin": ORIGIN,
        }
        row = existing.get(slug)
        if row is None:
            added.append(slug)
            if not args.dry:
                db.write(TABLE, **fields)
            continue
        changed = any(str(row.get(k) or "") != str(v or "")
                      for k, v in fields.items() if k != "origin")
        if changed:
            updated.append(slug)
            if not args.dry:
                db.edit(TABLE, row["id"], **{k: v for k, v in fields.items() if k != "origin"})
        else:
            same.append(slug)

    # two findings, and they are different things:
    #   unplaced -- the slug is reserved but has no path yet (waiting on him)
    #   absent   -- it HAS a path and that folder is not there (a real gap)
    # Never create a folder to make a row true.
    unplaced, absent = [], []
    for slug, path, _parent, _kind, _desc in PATHS:
        if slug == "root":
            continue
        if not path:
            unplaced.append(slug)
        elif not (Path(root) / path.lstrip("/").replace("/", "\\")).exists():
            absent.append(slug)

    print("DRY RUN -- nothing written" if args.dry else f"seeded {TABLE}")
    print(f"  root       {root}")
    print(f"  paths      {len(PATHS)}")
    print(f"  added      {len(added)}")
    print(f"  updated    {len(updated)}")
    print(f"  unchanged  {len(same)}")
    if unplaced:
        print(f"  NO PATH YET  {len(unplaced)}  (slug reserved, path unset): {', '.join(unplaced)}")
    if absent:
        print(f"  NOT ON DISK  {len(absent)}  (has a path, folder missing): {', '.join(absent)}")


if __name__ == "__main__":
    main()
