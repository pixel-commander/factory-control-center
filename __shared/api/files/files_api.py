r"""
files_api.py -- the IDE's door: the tree, the read, the SAVE.

    GET  /api/files/tree?root=__shared        the folder tree (dirs+files)
    GET  /api/files/read?path=__shared/x.tsx  {path, body}
    POST /api/files/save {path, body}         WRITES THE REAL FILE, then bump()

THE FENCE: every path resolves inside the REPO ROOT or it is refused --
the IDE edits the house, never the machine. Text files only, 2mb cap on
reads; the tree skips the machine dirs (node_modules, .git, dist...).

Built for the code-review dashboard (2026-08-07): originals snapshot into
the db (`file` rows, per session); saves land on disk THROUGH HERE.
"""
from pathlib import Path

from _router import route, json_body
from events_api import bump

ROOT = Path(__file__).resolve().parents[3]   # files -> api -> __shared -> repo
SKIP = {"node_modules", ".git", "dist", "build", "coverage", ".next", ".vite", "__pycache__"}
MAX_READ = 2 * 1024 * 1024


def _fence(rel_path):
    """resolve inside the repo or refuse -- the fence IS the feature"""
    p = (ROOT / str(rel_path)).resolve()
    if ROOT not in p.parents and p != ROOT:
        raise ValueError(f"outside the house: {rel_path}")
    return p


def _tree(p):
    node = {"name": p.name, "path": str(p.relative_to(ROOT)).replace("\\", "/"), "kind": "dir", "children": []}
    try:
        entries = sorted(p.iterdir(), key=lambda e: (e.is_file(), e.name.lower()))
    except OSError:
        return node
    for e in entries:
        if e.name.startswith("."):
            continue
        if e.is_dir():
            if e.name in SKIP:
                continue
            node["children"].append(_tree(e))
        else:
            node["children"].append({
                "name": e.name,
                "path": str(e.relative_to(ROOT)).replace("\\", "/"),
                "kind": "file",
                "bytes": e.stat().st_size,
            })
    return node


@route("GET", "/api/files/tree")
def tree(handler, parts, query):
    root = _fence(query.get("root", "__shared"))
    if not root.is_dir():
        raise ValueError(f"not a folder: {query.get('root')}")
    return _tree(root)


@route("GET", "/api/files/read")
def read(handler, parts, query):
    p = _fence(query.get("path", ""))
    if not p.is_file():
        raise ValueError(f"no such file: {query.get('path')}")
    if p.stat().st_size > MAX_READ:
        raise ValueError("too big for the pad (2mb cap)")
    try:
        body = p.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        raise ValueError("not a text file")
    return {"path": str(p.relative_to(ROOT)).replace("\\", "/"), "body": body}


@route("POST", "/api/files/review")
def review(handler, parts, query):
    """MARK FOR REVIEW (his flow): copy the file to REV_<name> beside it --
    the frozen original. Already marked? Returns the existing copy, so a
    session can re-open its files without resetting the baseline."""
    data = json_body(handler)
    p = _fence(data.get("path", ""))
    if not p.is_file():
        raise ValueError(f"no such file: {data.get('path')}")
    rev = p.with_name(f"REV_{p.name}")
    if not rev.exists():
        rev.write_bytes(p.read_bytes())
        bump()
    return {"review": str(rev.relative_to(ROOT)).replace("\\", "/"),
            "path": str(p.relative_to(ROOT)).replace("\\", "/")}


@route("GET", "/api/files/marked")
def marked(handler, parts, query):
    """EVERY REV_ IN THE HOUSE -- the auto-scan (his call: build a review
    session by scanning for REV_ files). Returns the pairs: the original's
    path, its REV_ copy, and whether they still match."""
    root = _fence(query.get("root", "__shared"))
    out = []
    for rev in root.rglob("REV_*"):
        if not rev.is_file():
            continue
        if any(part in SKIP for part in rev.parts):
            continue
        base = rev.with_name(rev.name[4:])
        if not base.exists():
            continue
        try:
            same = base.read_bytes() == rev.read_bytes()
        except OSError:
            same = False
        out.append({
            "path": str(base.relative_to(ROOT)).replace("\\", "/"),
            "review": str(rev.relative_to(ROOT)).replace("\\", "/"),
            "name": base.name,
            "folder": str(base.parent.relative_to(ROOT)).replace("\\", "/"),
            "changed": not same,
        })
    out.sort(key=lambda r: r["path"])
    return {"root": str(root.relative_to(ROOT)).replace("\\", "/"), "marked": out}


@route("POST", "/api/files/unmark")
def unmark(handler, parts, query):
    """REVIEW DONE: drop the REV_ copy. The original stays as it stands --
    the review's decisions are already IN it."""
    data = json_body(handler)
    p = _fence(data.get("path", ""))
    rev = p.with_name(f"REV_{p.name}")
    if rev.exists():
        rev.unlink()
        bump()
    return {"unmarked": str(p.relative_to(ROOT)).replace("\\", "/")}


@route("GET", "/api/files/search")
def search(handler, parts, query):
    r"""HOUSE-WIDE SEARCH -- the ripgrep trick, ours.

    Most of ripgrep's edge is not a faster regex engine, it is NOT RUNNING
    the regex most of the time: pull the longest literal out of the
    pattern, find candidate lines with plain substring search (which is
    optimized C in CPython), and only run the regex on the survivors.

        ?q=            the pattern
        &root=         where to look (default __shared)
        &regex=1       treat q as a pattern rather than a literal
        &case=1        match case
        &word=1        whole word only
        &ext=tsx,css   only these extensions
        &cap=          stop after this many hits (default 500)

    Returns hits grouped by file so the panel can render a tree without
    regrouping. Skips the machine dirs and anything that is not text.
    """
    import re

    q = query.get("q", "")
    if not q:
        return {"hits": [], "files": 0, "capped": False}

    root = _fence(query.get("root", "__shared"))
    want_regex = query.get("regex") in ("1", "true")
    want_case = query.get("case") in ("1", "true")
    want_word = query.get("word") in ("1", "true")
    cap = min(int(query.get("cap", 500) or 500), 5000)
    exts = {e.strip().lstrip(".").lower() for e in (query.get("ext") or "").split(",") if e.strip()}

    src = q if want_regex else re.escape(q)
    if want_word:
        src = r"\b(?:%s)\b" % src
    try:
        rx = re.compile(src, 0 if want_case else re.IGNORECASE)
    except re.error as e:
        raise ValueError(f"bad pattern: {e}")

    # THE LITERAL: the longest run of plain characters the pattern must
    # contain. Empty means every line has to meet the regex.
    if want_regex:
        runs = re.split(r"[.*+?^$\[\]{}()|\\]", q)
        literal = max(runs, key=len) if runs else ""
    else:
        literal = q
    needle = literal if want_case else literal.lower()

    out = []
    files = 0
    capped = False
    for p in sorted(root.rglob("*")):
        if len(out) >= cap:
            capped = True
            break
        if not p.is_file() or p.name.startswith("."):
            continue
        if any(part in SKIP for part in p.parts):
            continue
        if exts and p.suffix.lstrip(".").lower() not in exts:
            continue
        try:
            if p.stat().st_size > MAX_READ:
                continue
            body = p.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue

        # the pre-filter, on the WHOLE file first -- one substring scan
        # rejects most files without ever splitting them into lines
        if needle and needle not in (body if want_case else body.lower()):
            continue

        rel = str(p.relative_to(ROOT)).replace("\\", "/")
        hit_here = False
        for n, line in enumerate(body.split("\n")):
            if len(out) >= cap:
                capped = True
                break
            if needle and needle not in (line if want_case else line.lower()):
                continue
            m = rx.search(line)
            if not m:
                continue
            hit_here = True
            out.append({
                "path": rel,
                "line": n,
                "col": m.start(),
                "end": m.end(),
                "text": line[:400],
            })
        if hit_here:
            files += 1

    return {"hits": out, "files": files, "capped": capped,
            "root": str(root.relative_to(ROOT)).replace("\\", "/")}


@route("POST", "/api/files/save")
def save(handler, parts, query):
    data = json_body(handler)
    p = _fence(data.get("path", ""))
    body = data.get("body")
    if body is None:
        raise ValueError("save needs a body")
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(str(body), encoding="utf-8", newline="")
    bump()   # the push tells every open pad
    return {"saved": str(p.relative_to(ROOT)).replace("\\", "/"), "bytes": p.stat().st_size}
