r"""
server.py -- the rab-dashboard-v2 api DOOR. A thin dispatcher, nothing else.

    python server.py            -> http://127.0.0.1:3035

THIS FILE HOLDS NO API LOGIC. Http allows one listener per port, so there is one
server; but each api lives in its OWN FOLDER with its own file, README and
LOSSES, and registers its own routes through _router. This file only:
    1. puts db/ and each api folder on the path
    2. imports each api (the import is what registers its routes)
    3. matches an incoming request to a route and returns its value as json

ADD AN API: make a folder here with <name>_api.py + README.txt + LOSSES.txt,
add the folder name to APIS below. Nothing else changes.

BINDS 127.0.0.1 -- local only. The site reaches it through vite's /api proxy on
the dev port (same origin), so a LAN browser -> LAN vite -> local db. The db
socket stays closed to the network on purpose.
"""
import json
import sys
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs

HERE = Path(__file__).resolve().parent
# 3035, not 3034 (2026-08-12): the SAME scar, one door along. 3033 was taken when
# this file was written, so it moved to 3034; v2 is a second copy of that door and
# rab-dashboard's is already answering on 3034 right now. Windows lets the second
# bind succeed SILENTLY while the OLDEST process keeps answering -- so a v2 door on
# 3034 would look like it started, and every row you read would be v1's. Each door
# owns its own number, and this one is v2's.
PORT = 3035
# ORDER IS PRIORITY. _router matches an exact path first, then the LONGEST
# prefix -- but among equals, registration order wins. `tables` registers
# /api/<table> as a prefix route, so it would swallow /api/themes/preview and
# serve the ROWS instead. Anything with sub-paths under a table's name must
# register BEFORE tables. Found exactly that way: preview returned a list.
# themes is UNMOUNTED (2026-07-30): themes_api imports db/seed_theme.py -- the
# OKLCH palette generator -- which has never been written. Mount it back the
# day that file lands; until then it takes the whole door down at import.
APIS = ["events", "flows", "combine", "manage", "rab_widget", "hexbase", "brain", "tables", "projects", "groups", "files"]      # folder per api

sys.path.insert(0, str(HERE))                          # _router
sys.path.insert(0, str(HERE.parent / "db"))            # base_db + base.db
for name in APIS:
    sys.path.insert(0, str(HERE / name))

import base_db as db                                   # noqa: E402
from _router import find, routes                       # noqa: E402

db.init_db()

# importing an api file is what REGISTERS its routes (the @route decorators run)
import events_api      # noqa: E402,F401  /api/events   -- the push
import files_api       # noqa: E402,F401  /api/files -- the IDE's tree/read/save. BEFORE tables:
                       #                 /api/files/* is a sub-path tables' prefix route would swallow
import tables_api      # noqa: E402,F401  /api/<table>  -- crud
import combine_api     # noqa: E402,F401  /api/combine  -- joined shapes
import manage_api      # noqa: E402,F401  /api/manage   -- running the db
# THEMES REGISTERS AFTER tables ON PURPOSE... and it does not matter here,
# because find() checks EXACT paths before any prefix. /api/themes/preview is
# exact, so it wins over tables' /api prefix wherever it sits in this list.
# ADDING THE FOLDER TO APIS IS NOT ENOUGH -- that only puts it on sys.path.
# THIS LINE is what runs the @route decorators. Missing it, the api mounted,
# reported itself in /api/health, and served nothing.
# import themes_api    # UNMOUNTED -- needs db/seed_theme.py (see APIS above)
import flows_api      # noqa: E402,F401  /api/flows -- save a drawn flow
import rab_widget_api  # noqa: E402,F401  /api/rab-widget -- the widget's box (load/save by id)
import hexbase_api     # noqa: E402,F401  /api/hexbase -- the db's shape, for the 3d viewer
import brain_api       # noqa: E402,F401  /api/brain -- read-only window onto the new world's brain.db
import projects_api    # noqa: E402,F401  POST /api/projects -- write + SPAWN the three groups
import groups_api      # noqa: E402,F401  POST /api/message|task|note -- item writes that keep group lists true


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, data, status=200):
        b = json.dumps(data).encode("utf-8")
        self.send_response(status); self._cors()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers(); self.wfile.write(b)

    def _dispatch(self, method):
        u = urlparse(self.path)
        path = u.path.rstrip("/") or "/"

        if path in ("/", "/api/health") and method == "GET":
            self._json({"ok": 1, "service": "rab-dashboard-v2", "port": PORT,
                        "tables": sorted(db.TABLES), "apis": APIS,
                        "routes": routes()})
            return
        if path == "/api/schema" and method == "GET":
            self._json({t: db.TABLES[t].split(', ') for t in db.TABLES})
            return

        fn = find(method, path)
        if fn is None:
            self._json({"error": "not found", "path": path}, 404)
            return
        parts = [p for p in path.split("/") if p]
        query = {k: v[0] for k, v in parse_qs(u.query).items()}
        try:
            out = fn(self, parts, query)
        except ValueError as e:                  # a bad ask -> 400
            self._json({"error": str(e)}, 400); return
        except Exception as e:                   # a broken api -> 500
            self._json({"error": str(e)}, 500); return
        if out is not None:                      # SSE writes its own response
            self._json(out)

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_GET(self):
        self._dispatch("GET")

    def do_POST(self):
        self._dispatch("POST")

    def do_PUT(self):
        self._dispatch("PUT")

    def do_DELETE(self):
        self._dispatch("DELETE")


if __name__ == "__main__":
    print(f"rab-dashboard-v2 api -> http://127.0.0.1:{PORT}")
    print(f"  apis mounted: {', '.join(APIS)}")
    ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
