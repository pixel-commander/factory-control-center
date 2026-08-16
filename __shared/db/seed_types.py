r"""
seed_types.py -- THE SUBJECT VOCABULARY: what a thing is ABOUT.

    python seed_types.py         seed (or refresh) the subjects
    python seed_types.py --dry   report only, write nothing
    python seed_types.py --wipe  remove what this seeder wrote, then stop

HIS NINE (2026-08-08): health, medical, dental, school, sport, work, travel,
birthday, anniversary.

TWO AXES SHARE rab_types, told apart by `kind` -- and the split is the whole
reason this file exists rather than eight more rows beside the others:

    kind='type'     what a ROW IS       task, appointment, note, neuron
    kind='subject'  what it is ABOUT    dental, school, birthday

An appointment IS an appointment and is ABOUT the dentist. Those are two
different questions and a picker filtering on `kind` gets one clean list for
each, out of one table.

IT IS HOUSE KEYS PLUS ICON AND COLOR (his call). name/title/description are
the columns every table already carries; the only additions are how the type
PRESENTS -- a Glyph name and a colour token -- so a timeline row, a form
picker and a calendar chip can all draw the same subject the same way without
any of them keeping a private map.

COLOURS ARE NAMED TOKENS, NEVER HEX AND NEVER A RAW PALETTE SLOT: each row
points at its own --type-<slug> (ui/tokens/base.css), the same move rab_status
made with --status-*. A raw --c3 would say "palette slot 3", a fact about the
theme rather than about the thing; --type-school says what it is FOR, so a
theme that wants school blue overrides one line and no row changes.

Re-runnable: matched on (slug, kind), so running it twice writes nothing the
second time -- the lesson index_icons paid for, an indexer without a stable
key is a duplicator.
"""
import argparse
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import base_db as db                            # noqa: E402

ORIGIN = "seed_types"
KIND = "subject"

# slug, title, description, icon, color
#
# THE ICONS ARE REAL GLYPH NAMES, and there are only SIX of them: spark,
# layers, route, cube, arrow, pulse (ui/atoms/glyph/Glyph.tsx). Glyph falls
# back to 'spark' for anything it does not know, so an invented name like
# 'tooth' or 'gift' would not error -- it would just silently render the
# wrong icon, which is worse. These nine reuse the six honestly:
#   pulse  the body            health, medical, dental
#   layers a stack of days     school, sport
#   cube   a unit of work      work
#   route  going somewhere     travel
#   spark  a day that matters  birthday, anniversary
# When the glyph set grows, these are the rows to revisit -- the icon lives
# in the DB precisely so that is an UPDATE and not a code change.
#
# `table_name` is left BLANK for all nine: a birthday is a subject whether it
# lands on an appointment, a todo or a note, and scoping it to `appointments`
# would just mean re-typing them the first time a todo needs one.
SUBJECTS = [
    ("health",      "Health",      "the body in general -- fitness, checkups, the ongoing stuff", "pulse",  "var(--type-health)"),
    ("medical",     "Medical",     "doctors, specialists, procedures, prescriptions",             "pulse",  "var(--type-medical)"),
    ("dental",      "Dental",      "the dentist, the orthodontist, the teeth",                    "pulse",  "var(--type-dental)"),
    ("school",      "School",      "conferences, pickups, terms, anything the school runs",       "layers", "var(--type-school)"),
    ("sport",       "Sport",       "practice, games, the season",                                 "layers", "var(--type-sport)"),
    ("work",        "Work",        "clients, meetings, the paid hours",                           "cube",   "var(--type-work)"),
    ("vet",         "Vet",         "the animals -- shots, rechecks, the emergencies",             "pulse",  "var(--type-vet)"),
    ("travel",      "Travel",      "flights, drives, being somewhere else",                       "route",  "var(--type-travel)"),
    ("birthday",    "Birthday",    "the day itself -- recurring, and it matters",                 "spark",  "var(--type-birthday)"),
    ("anniversary", "Anniversary", "the other recurring one worth remembering",                   "spark",  "var(--type-anniversary)"),
]


def existing() -> dict:
    """what this seeder already wrote, keyed on (slug, kind). Reading ONLY our
    own origin is what keeps a hand-written row of his out of the match set --
    and, on --wipe, out of the delete."""
    return {
        (row["slug"], row["kind"]): row
        for row in db.read("rab_types", origin=ORIGIN)
    }


def seed(dry: bool) -> None:
    have = existing()
    added = 0
    fixed = 0
    for rank, (slug, title, description, icon, color) in enumerate(SUBJECTS, start=1):
        row = have.get((slug, KIND))
        if row:
            # RANK IS RECONCILED, NOT JUST INSERTED. The list above IS the
            # order, so inserting a word in the middle re-numbers everything
            # after it -- and an insert-only seeder would leave those rows on
            # their old numbers, giving two subjects the same rank (vet and
            # travel both landed on 7 the first time). A seeder that cannot
            # fix what it already wrote is only half a reconciler.
            if row["rank"] != rank:
                if dry:
                    print(f"  ~ rank     {slug:<12} {row['rank']} -> {rank}")
                else:
                    db.edit("rab_types", row["id"], rank=rank)
                fixed += 1
            continue
        if dry:
            print(f"  + {KIND:8} {slug:<12} {icon:<7} {color:<11} {title}")
            added += 1
            continue
        db.write(
            "rab_types",
            origin=ORIGIN,
            added_by="claude",
            name=slug,          # the name IS the address -- the slug, lowercase
            title=title,        # what a human reads in a picker
            description=description,
            slug=slug,
            kind=KIND,
            table_name="",      # fits any table -- see the note up top
            rank=rank,
            color=color,
            icon=icon,
        )
        added += 1
    print(f"subjects: {added} written, {fixed} re-ranked, {len(have)} already there")


def wipe() -> None:
    rows = db.read("rab_types", origin=ORIGIN)
    for row in rows:
        db.delete("rab_types", row["id"])
    print(f"rab_types: {len(rows)} removed")


def main() -> None:
    ap = argparse.ArgumentParser(description="seed the subject vocabulary")
    ap.add_argument("--dry", action="store_true", help="report only, write nothing")
    ap.add_argument("--wipe", action="store_true", help="remove what this seeder wrote, then stop")
    args = ap.parse_args()

    # init_db migrates additively, which is what adds rab_types.icon to a db
    # stamped before this column existed
    db.init_db()

    if args.wipe:
        wipe()
        return

    if args.dry:
        print("DRY RUN — nothing is written\n")
    seed(args.dry)

    if not args.dry:
        total = len(db.read("rab_types", kind=KIND))
        print(f"\nthe subject vocabulary: {total} subjects")


if __name__ == "__main__":
    main()
