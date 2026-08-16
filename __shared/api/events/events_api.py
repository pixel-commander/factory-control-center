r"""
events_api.py -- THE PUSH. /api/events, server-sent events.

PUSH, NOT POLL (his hard requirement). A module VERSION counter bumps on every
mutation anywhere in the api; this stream holds the connection open and pushes
'changed' ONLY when the counter moves. The page then re-reads once. Nothing
polls the db -- the only thing checked on a timer is an in-memory int.

Any api file that writes calls bump() after the write.
"""
import threading
import time

from _router import route

_version = 0
_lock = threading.Lock()


def bump():
    """Call after ANY mutation -- this is what makes the site update itself."""
    global _version
    with _lock:
        _version += 1
    return _version


def version():
    return _version


@route("GET", "/api/events")
def stream(handler, parts, query):
    """Hold the connection open, push on change, heartbeat every ~20s so a dead
    client surfaces (broken pipe -> thread exits). One thread per viewer."""
    handler.send_response(200)
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Content-Type", "text/event-stream")
    handler.send_header("Cache-Control", "no-cache")
    handler.send_header("Connection", "keep-alive")
    handler.end_headers()

    seen = _version
    last_beat = time.time()
    try:
        handler.wfile.write(f"event: hello\ndata: {seen}\n\n".encode("utf-8"))
        handler.wfile.flush()
        while True:
            cur = _version
            if cur != seen:
                seen = cur
                handler.wfile.write(f"event: changed\ndata: {cur}\n\n".encode("utf-8"))
                handler.wfile.flush()
                last_beat = time.time()
            elif time.time() - last_beat > 20:
                handler.wfile.write(b": keep-alive\n\n")
                handler.wfile.flush()
                last_beat = time.time()
            time.sleep(0.5)
    except (BrokenPipeError, ConnectionResetError, OSError):
        return
    return None          # the stream wrote its own response
