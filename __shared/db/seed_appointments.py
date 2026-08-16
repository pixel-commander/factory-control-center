r"""
seed_appointments.py -- gauge's calendar: contacts, then appointments on them.

    python seed_appointments.py         seed (or refresh) contacts + appointments
    python seed_appointments.py --dry   report only, write nothing
    python seed_appointments.py --wipe  remove what this seeder wrote, then stop

WHAT IT WRITES (his call, 2026-08-08): "give me like a weekly one, then 15
random ones over 2 months", "add some fake contacts", "link contacts to appt
one or 2 at a time".

  THE WEEKLY ONE      a standing appointment, same slot every week, from two
                      weeks back through six weeks out. It is the rhythm row --
                      the one that proves a repeating thing reads correctly on
                      a calendar next to one-offs.
  THE FIFTEEN         scattered across a two-month window (one month back, one
                      forward), each on a real contact, at plausible hours.

RE-RUNNABLE, AND THAT IS THE WHOLE DESIGN. An indexer without a stable key is a
duplicator -- the lesson index_icons paid for and seed_vocab wrote down. Every
row here is matched on (name, start_date) within origin='seed_appointments',
so running it twice writes nothing the second time. Rows a human edited are
left alone; only missing rows are added.

THE DATES ARE DERIVED, NOT TYPED. Everything hangs off THE ANCHOR -- today at
midnight -- so the seed is always "around now" whenever it runs, instead of
rotting into a fixed month that drifts off the calendar's current view.

NOT RANDOM AT RUNTIME. The fifteen use a FIXED offset table, not random(), so
two runs on the same day produce the same calendar and the re-run check above
actually holds. "Random" here means scattered and irregular, which is what a
real month looks like -- not unpredictable per run.
"""
import argparse
import sys
from datetime import datetime, timedelta
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import base_db as db                            # noqa: E402

ORIGIN = "seed_appointments"
DAY_MS = 86_400_000

# THE USER. gauge is id 1, the first user, always (base_db seeds him). The
# appointments carry his HANDLE in `users`, not his id -- the form's User field
# is type 'table' on /api/users and the house sends the handle, because the
# name IS the address.
USER_ID = 1
USER_HANDLE = "gauge"

# ── THE CONTACTS ──────────────────────────────────────────────────────────
# name, title, kind, org, phone, email
#
# `name` is the stable key -- lowercase, one word where it can be, because it
# is an address, not a label. The dentist already exists in the db (his
# daughter's, written from the organizer); it is NOT repeated here, so this
# seeder never touches a real row of his.
CONTACTS = [
    ("hollis",  "Dr. Hollis — physio",        "doctor",   "Northside Physio",   "312-555-0148", "front@northsidephysio.com"),
    ("mercado", "Ana Mercado — accountant",   "finance",  "Mercado & Co",       "312-555-0179", "ana@mercadoco.com"),
    ("vance",   "Ruth Vance — school office", "school",   "Lincoln Elementary", "312-555-0122", "office@lincoln.k12.us"),
    ("okafor",  "Sam Okafor — contractor",    "trade",    "Okafor Build",       "773-555-0195", "sam@okaforbuild.com"),
    ("delgado", "Rosa Delgado — barber",      "personal", "Delgado Cuts",       "773-555-0110", None),
    ("keene",   "Marcus Keene — client",      "client",   "Keene Logistics",    "312-555-0163", "mkeene@keenelog.com"),
    ("bhatt",   "Priya Bhatt — vet",          "vet",      "Ravenswood Animal",  "773-555-0187", "care@ravenswoodvet.com"),
    ("lindqvist", "Erik Lindqvist — bank",    "finance",  "First Trust",        "312-555-0134", "e.lindqvist@firsttrust.com"),
]

# ── THE WEEKLY ONE ────────────────────────────────────────────────────────
# The standing row: same weekday, same hour, every week. -2 weeks .. +6 weeks
# means it is already behind you and still ahead of you, which is what makes a
# repeating appointment look real on a month view.
WEEKLY = {
    "name": "physio",
    "title": "Physio — standing appointment",
    "description": "the weekly one. same slot, every week.",
    "contact": "hollis",
    "weekday": 2,          # Wednesday (Mon=0) -- a mid-week anchor
    "hour": 8,
    "minutes": 45,
    "weeks_back": 2,
    "weeks_forward": 6,
    "location": "Northside Physio, 2200 W Irving Park",
    "tags": "health,standing",
    "subject": "health",
}

# ── THE FIFTEEN ───────────────────────────────────────────────────────────
# day offset, hour, minute, minutes long, name, title, contacts, tags, location, TYPE
#
# Offsets run -28 .. +30 -- a two-month window with today near the middle, so
# the calendar has history behind it and plans ahead of it. ONE OR TWO CONTACTS
# EACH (his call): most rows carry one, a few carry two where the meeting really
# is between two people.
#
# THE TYPE IS THE SUBJECT SLUG (rab_types, kind='subject'), resolved to its id
# at write time -- the column holds the id, not the word, because a subject can
# be re-titled and an id cannot. A row with no subject that fits carries none:
# a haircut is not health, and inventing a 'personal' subject to avoid a blank
# would be putting a word in his vocabulary he did not ask for.
SCATTERED = [
    (-28,  9, 30,  60, "taxes-q",     "Quarterly taxes review",      ["mercado"],             "money",           "Mercado & Co",              "work"),
    (-23, 15,  0,  30, "school-conf", "Parent-teacher conference",   ["vance"],               "school,kid",      "Lincoln Elementary, rm 12", "school"),
    (-19, 11,  0,  90, "kitchen-bid", "Kitchen estimate walkthrough",["okafor"],              "house",           "here",                      ""),
    (-14, 13, 30,  60, "keene-scope", "Keene — scope the dashboard", ["keene"],               "work",            "call",                      "work"),
    (-9,  10,  0,  45, "vet-shots",   "Dog — annual shots",          ["bhatt"],               "pets",            "Ravenswood Animal",         "vet"),
    (-5,  16, 30,  30, "haircut",     "Haircut",                     ["delgado"],             "personal",        "Delgado Cuts",              ""),
    (-2,  14,  0,  60, "loan-review", "Loan paperwork review",       ["lindqvist", "mercado"],"money",           "First Trust, downtown",     "work"),
    (1,   9,  15,  45, "keene-demo",  "Keene — demo the build",      ["keene"],               "work",            "call",                      "work"),
    (4,  12,   0,  60, "lunch-okafor","Lunch — punch list",          ["okafor"],              "house",           "Gino's on Grand",           ""),
    (8,  15,  30,  30, "school-pickup","Early pickup — dentist day", ["vance"],               "school,kid",      "Lincoln Elementary",        "school"),
    (12, 10,  30,  60, "mercado-books","Books — mid-year clean up",  ["mercado"],             "money",           "Mercado & Co",              "work"),
    (17, 11,   0,  90, "kitchen-start","Kitchen — first day",        ["okafor"],              "house",           "here",                      ""),
    (21, 13,   0,  45, "vet-recheck", "Dog — recheck",               ["bhatt"],               "pets",            "Ravenswood Animal",         "vet"),
    (26, 16,   0,  60, "keene-review","Keene — quarter review",      ["keene", "lindqvist"],  "work",            "Keene Logistics",           "work"),
    (30,  9,   0,  30, "haircut-2",   "Haircut",                     ["delgado"],             "personal",        "Delgado Cuts",              ""),
]


def anchor() -> datetime:
    """today at midnight -- everything below is derived from it, so the seed is
    always 'around now' rather than a fixed month that rots."""
    return datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)


def ms(dt: datetime) -> int:
    return int(dt.timestamp() * 1000)


def existing(table: str) -> dict:
    """what this seeder already wrote, by its stable key. Reading ONLY our own
    origin is what keeps a hand-written row of his from ever being matched,
    counted, or (on --wipe) deleted."""
    out = {}
    for row in db.read(table, origin=ORIGIN):
        if table == "contacts":
            out[row["name"]] = row
        else:
            out[(row["name"], row["start_date"])] = row
    return out


def seed_contacts(dry: bool) -> dict:
    """returns {name: id} for every seeded contact, existing or new -- the
    appointments need real ids to put in their `contacts` list."""
    have = existing("contacts")
    ids, added = {}, 0
    for name, title, kind, org, phone, email in CONTACTS:
        if name in have:
            ids[name] = have[name]["id"]
            continue
        if dry:
            print(f"  + contact  {name:<10} {title}")
            ids[name] = 0
            added += 1
            continue
        ids[name] = db.write(
            "contacts",
            origin=ORIGIN,
            added_by="claude",
            name=name,
            title=title,
            description=f"{kind} — seeded for the organizer calendar",
            kind=kind,
            org=org,
            phone=phone,
            email=email,
            user_id=USER_ID,
        )
        added += 1
    print(f"contacts: {added} written, {len(have)} already there")
    return ids


def weekly_rows(at: datetime) -> list:
    """every instance of the standing appointment, as (name, start, end)."""
    # the first instance: walk back to the anchor's own week, then to the weekday
    first = at - timedelta(days=at.weekday() - WEEKLY["weekday"], weeks=WEEKLY["weeks_back"])
    out = []
    for week in range(WEEKLY["weeks_back"] + WEEKLY["weeks_forward"] + 1):
        start = (first + timedelta(weeks=week)).replace(hour=WEEKLY["hour"], minute=0)
        out.append((start, start + timedelta(minutes=WEEKLY["minutes"])))
    return out


def subject_ids() -> dict:
    """{slug: id} for the subject vocabulary. The appointments carry the ID,
    not the word -- a subject can be re-titled and an id cannot. Read live
    rather than hardcoded, because seed_types owns those rows and their ids
    are whatever the db handed out."""
    return {
        row["slug"]: row["id"]
        for row in db.read("rab_types", kind="subject")
    }


def seed_appointments(contact_ids: dict, dry: bool) -> None:
    have = existing("appointments")
    subjects = subject_ids()
    at = anchor()
    added = 0
    typed = 0

    # THE WEEKLY ONE -- every instance is its own row. A recurrence RULE would
    # be the other design; rows are taken because the calendar reads rows and
    # nothing in the house speaks rrule yet. Each instance is still keyed on
    # (name, start_date), so a re-run matches them one for one.
    hollis = str(contact_ids.get(WEEKLY["contact"], ""))
    for start, end in weekly_rows(at):
        key = (WEEKLY["name"], ms(start))
        if key in have:
            # BACKFILL. The rows were written before `type` existed as a
            # column, so a skip-if-present seeder would leave them blank
            # forever. Same reconciler rule the ranks needed: it has to be
            # able to fix what it already wrote, not only insert.
            want = subjects.get(WEEKLY["subject"], "")
            if want and not have[key]["type"]:
                if dry:
                    print(f"  ~ type     {WEEKLY['name']:<14} -> {WEEKLY['subject']}")
                else:
                    db.edit("appointments", have[key]["id"], type=want)
                typed += 1
            continue
        if dry:
            print(f"  + weekly   {start:%Y-%m-%d %H:%M}  {WEEKLY['title']}")
            added += 1
            continue
        db.write(
            "appointments",
            origin=ORIGIN,
            added_by="claude",
            name=WEEKLY["name"],
            title=WEEKLY["title"],
            description=WEEKLY["description"],
            start_date=ms(start),
            end_date=ms(end),
            all_day=0,
            location=WEEKLY["location"],
            status="new",
            type=subjects.get(WEEKLY["subject"], ""),
            tags=WEEKLY["tags"],
            contacts=hollis,
            users=USER_HANDLE,
        )
        added += 1

    # THE FIFTEEN
    for days, hour, minute, mins, name, title, who, tags, location, subject in SCATTERED:
        start = (at + timedelta(days=days)).replace(hour=hour, minute=minute)
        key = (name, ms(start))
        if key in have:
            want = subjects.get(subject, "")          # backfill -- see above
            if want and not have[key]["type"]:
                if dry:
                    print(f"  ~ type     {name:<14} -> {subject}")
                else:
                    db.edit("appointments", have[key]["id"], type=want)
                typed += 1
            continue
        # ONE OR TWO CONTACTS, as an id list ("3,7") -- the column is a list of
        # ids, not a join table (base_db's note on the appointments table)
        ids = ",".join(str(contact_ids[c]) for c in who if c in contact_ids)
        if dry:
            print(f"  + appt     {start:%Y-%m-%d %H:%M}  {title:<32} contacts={ids}")
            added += 1
            continue
        db.write(
            "appointments",
            origin=ORIGIN,
            added_by="claude",
            name=name,
            title=title,
            description=f"with {', '.join(who)}",
            start_date=ms(start),
            end_date=ms(start + timedelta(minutes=mins)),
            all_day=0,
            location=location,
            status="new",
            type=subjects.get(subject, ""),
            tags=tags,
            contacts=ids,
            users=USER_HANDLE,
        )
        added += 1

    print(f"appointments: {added} written, {typed} typed, {len(have)} already there")


def wipe() -> None:
    """remove ONLY what this seeder wrote -- matched on origin, so his real
    rows (the dentist, anything he typed) are never in the set."""
    for table in ("appointments", "contacts"):
        rows = db.read(table, origin=ORIGIN)
        for row in rows:
            db.delete(table, row["id"])
        print(f"{table}: {len(rows)} removed")


def main() -> None:
    ap = argparse.ArgumentParser(description="seed gauge's contacts and appointments")
    ap.add_argument("--dry", action="store_true", help="report only, write nothing")
    ap.add_argument("--wipe", action="store_true", help="remove what this seeder wrote, then stop")
    args = ap.parse_args()

    db.init_db()

    if args.wipe:
        wipe()
        return

    if args.dry:
        print("DRY RUN — nothing is written\n")

    ids = seed_contacts(args.dry)
    seed_appointments(ids, args.dry)

    if not args.dry:
        total = len(db.read("appointments", origin=ORIGIN))
        print(f"\ngauge's calendar: {total} appointments on {len(ids)} contacts")


if __name__ == "__main__":
    main()
