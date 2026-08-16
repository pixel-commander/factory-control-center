r"""
_router.py -- the shared plumbing every api file rides. NOT an api itself.

ONE api per file was the ask. HTTP only allows one listener per port, so
server.py is a thin dispatcher; the API LOGIC lives in its own file, and each
file registers its routes here.

HOW AN API FILE WORKS
    from _router import route, json_body

    @route("GET", "/api/thing")
    def list_things(handler, parts, query):
        return [...]          # returned value is sent as json

    A route function gets:
      handler  the http handler (only if it needs raw access -- rarely)
      parts    the path split ['api','thing','3']
      query    parsed ?a=b as a flat dict
    and returns any json-able value. Raise ValueError for a 400.

MATCHING: exact path first, then a PREFIX match so '/api/users/3' finds the
handler registered for '/api/users'. The handler reads the id off `parts`.
"""
import json

# method -> [(path, fn, prefix)] ; registration order decides priority
_ROUTES = {"GET": [], "POST": [], "PUT": [], "DELETE": []}


def route(method, path, prefix=False):
    """Register a handler. prefix=True also matches deeper paths (/api/users/3)."""
    def deco(fn):
        _ROUTES.setdefault(method.upper(), []).append((path.rstrip("/"), fn, prefix))
        return fn
    return deco


def find(method, path):
    """Exact match wins; then the longest matching prefix."""
    path = path.rstrip("/") or "/"
    table = _ROUTES.get(method.upper(), [])
    for p, fn, _pre in table:
        if p == path:
            return fn
    best = None
    for p, fn, pre in table:
        if pre and path.startswith(p + "/"):
            if best is None or len(p) > len(best[0]):
                best = (p, fn)
    return best[1] if best else None


def json_body(handler):
    n = int(handler.headers.get("Content-Length", 0) or 0)
    return json.loads(handler.rfile.read(n)) if n else {}


def routes():
    """Every registered route -- for /api/health to report what is mounted."""
    return {m: sorted(p for p, _f, _x in rs) for m, rs in _ROUTES.items() if rs}
