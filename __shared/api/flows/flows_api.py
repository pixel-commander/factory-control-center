r"""
flows_api.py -- save a drawn flow, and keep an index of them.

    POST /api/flows/save {name, flow}   write docs/<slug>-flow/flow.data.js
    GET  /api/flows                     the index -- what has been saved

THE FILE IS THE ARTIFACT, THE INDEX IS THE LIST. A saved flow lands as a real
folder next to the hand-written ones, so the renderer opens it with no special
case -- docs/<slug>-flow/index.html + flow.data.js, exactly the shape
scaffold-flow already has.

WHY JSON AND NOT SVG: an svg is a beautiful OUTPUT and a terrible record --
you cannot read one back into a model, so the next edit would start from
nothing. The json is the editable truth; an svg is generated FROM it, the same
way palette.css is generated from the themes rows.
"""
import json
import re
import time
from pathlib import Path

from _router import route, json_body
from events.events_api import bump

DOCS = Path(__file__).resolve().parent.parent.parent / "docs"
INDEX = DOCS / "flows.index.json"


def slug(name):
    """A FOLDER NAME FROM A TITLE. Lowercase, dashes, nothing else -- a name
    with a slash or a quote in it is a path traversal waiting to happen."""
    s = re.sub(r"[^a-z0-9]+", "-", str(name).lower()).strip("-")
    # THE FOLDER IS ALWAYS <slug>-flow, so a name that already ends in "flow"
    # must not become "test-flow-flow". Found exactly that way on the first
    # save, which is the useful kind of test.
    s = re.sub(r"-?flow$", "", s).strip("-")
    return s or "untitled"


def read_index():
    if INDEX.exists():
        try:
            return json.loads(INDEX.read_text(encoding="utf-8"))
        except ValueError:
            return []
    return []


@route("GET", "/api/flows")
def list_flows(handler, parts, query):
    """THE INDEX. What is saved, newest first."""
    return sorted(read_index(), key=lambda f: f.get("date_saved", 0), reverse=True)


@route("POST", "/api/flows/save")
def save(handler, parts, query):
    body = json_body(handler)
    name = body.get("name") or "untitled"
    flow = body.get("flow") or {}
    key = slug(name)

    # SAVED FLOWS LAND IN saved/ (his ask 2026-08-01) -- drawn output in its
    # own drawer instead of scattered among the hand-written folders.
    # mkdir(parents=True) births saved/ itself on the first save.
    folder = DOCS / "saved" / f"{key}-flow"
    folder.mkdir(parents=True, exist_ok=True)

    # THE DATA. This is the file ../_flow/flow.js reads -- identical in shape
    # to a hand-written one, so a drawn flow and a typed flow are the same
    # thing to the renderer.
    (folder / "flow.data.js").write_text(
        "window.FLOW = " + json.dumps(flow, indent=2) + ";\n", encoding="utf-8")

    # THE PAGE. Written only if absent, so editing a saved flow's prose by hand
    # is never overwritten by a re-save -- the DATA is generated, the PROSE is
    # yours.
    page = folder / "index.html"
    if not page.exists():
        page.write_text(f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{name}</title>
<link rel="stylesheet" href="../../_flow/flow.css">
</head>
<body>
<div class="wrap">
  <header>
    <h1 id="title"></h1>
    <div class="sub" id="subtitle"></div>
  </header>
  <div class="legend" id="legend"></div>
  <div class="board"><canvas id="flow"></canvas></div>
  <div id="details"></div>
  <footer id="foot"></footer>
</div>
<script src="flow.data.js"></script>
<script src="../../_flow/flow.js"></script>
</body>
</html>
""", encoding="utf-8")

    # THE INDEX -- one entry per saved flow, replaced in place so a re-save
    # updates rather than duplicates.
    entry = {
        "name": name,
        "slug": key,
        "folder": f"docs/saved/{key}-flow",
        "url": f"/saved/{key}-flow/index.html",
        "nodes": len(flow.get("nodes") or []),
        "edges": len(flow.get("edges") or []),
        "date_saved": int(time.time() * 1000),
    }
    index = [f for f in read_index() if f.get("slug") != key]
    index.append(entry)
    INDEX.write_text(json.dumps(index, indent=2), encoding="utf-8")

    bump()
    return {"saved": True, "file": str(folder / "flow.data.js"), **entry}
