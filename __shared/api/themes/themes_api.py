r"""
themes_api.py -- generate a palette from ONE colour, check it, keep it.

    POST /api/themes/seed {seed, name, mode}   generate + check + write
    GET  /api/themes/preview?seed=%23ff0000    generate + check, write NOTHING

WHY IT IS AN API AND NOT A UI FUNCTION: the maths is OKLCH -- it lives in
db/seed_theme.py beside the checker that uses the same ratios. Two copies of a
colour ramp, one in python and one in js, would drift the first time either
was tuned, and the drift would be invisible until a theme looked wrong.

PREVIEW WRITES NOTHING, on purpose. Trying a seed should cost nothing and
leave nothing behind -- so the form can generate on every keystroke and only
the Save button touches the db.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "db"))

from _router import route, json_body
from events.events_api import bump
import seed_theme


@route("GET", "/api/themes/preview")
def preview(handler, parts, query):
    """GENERATE AND CHECK, KEEP NOTHING. The form calls this while typing."""
    seed = query.get("seed") or "#4a9eff"
    mode = query.get("mode") or "dark"
    palette = seed_theme.build(seed, mode)
    fails = seed_theme.check(palette)
    return {"seed": seed, "mode": mode, "palette": palette,
            "passes": not fails, "fails": fails}


@route("POST", "/api/themes/seed")
def seed(handler, parts, query):
    """GENERATE, CHECK, AND WRITE IT -- unless it fails and force is not set.

    A FAILING THEME IS REPORTED, NOT SILENTLY FIXED. "this one is decorative
    and I know" is a real answer, so force exists; guessing on the caller's
    behalf is not."""
    body = json_body(handler)
    theme_id, fails = seed_theme.seed_theme(
        body.get("seed") or "#4a9eff",
        body.get("name") or "generated",
        body.get("mode") or "dark",
        force=bool(body.get("force")),
    )
    if theme_id:
        bump()                  # a new theme is a row -> tell every screen
    return {"id": theme_id, "passes": not fails, "fails": fails,
            "written": theme_id is not None}
