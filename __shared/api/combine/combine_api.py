r"""
combine_api.py -- apis that stitch SEVERAL tables into ONE formatted return.

    GET /api/combine/thread?chat_id=1   a chat + its messages + participant users
    GET /api/combine/inbox              every chat + last message + unread count
    GET /api/combine/roster             every user + message_count + chat_count
    GET /api/combine/user_threads?handle=guage   a user's chats, each w/ last msg
    GET /api/combine                    lists what is available

WHY THESE EXIST: a page should ask ONE question and get the whole shape back,
instead of firing three fetches and stitching them in the browser. The joins
live here, next to the data, where they can be tested.

ADD ONE: write a function, add it to COMBINERS. It is live at its own path.
All reads go through the base_db primitives -- no SQL in this file.
"""
from _router import route
import base_db as db


def thread(chat_id):
    """One chat, whole: the chat row, its messages oldest-first, and the
    participant users resolved off the chat's CSV of handles."""
    chat_id = int(chat_id)
    chats = db.read("chats", id=chat_id)
    chat = chats[0] if chats else None
    msgs = sorted(db.read("messages", chat_id=chat_id), key=lambda m: m.get("id") or 0)
    handles = [h.strip() for h in str((chat or {}).get("participants") or "").split(",") if h.strip()]
    everyone = {u.get("handle"): u for u in db.read("users")}
    return {"chat": chat, "messages": msgs,
            "users": [everyone[h] for h in handles if h in everyone],
            "message_count": len(msgs)}


def inbox():
    """The rail shape: every chat with its last message and unread count."""
    out = []
    for chat in sorted(db.read("chats"), key=lambda c: c.get("date_added") or 0, reverse=True):
        msgs = sorted(db.read("messages", chat_id=chat["id"]), key=lambda m: m.get("id") or 0)
        out.append({**chat,
                    "last_message": msgs[-1] if msgs else None,
                    "message_count": len(msgs),
                    "unread": sum(1 for m in msgs if not m.get("read"))})
    return out


def roster():
    """Who is here, with live tallies -- messages sent and chats joined."""
    all_msgs, all_chats, out = db.read("messages"), db.read("chats"), []
    for u in db.read("users"):
        h = u.get("handle")
        # `user` IS THE LINK, `sender` is the name as written. Count either --
        # a message written before the link existed only carries the name.
        out.append({**u,
                    "message_count": sum(1 for m in all_msgs
                                         if m.get("user") == u.get("id") or m.get("sender") == h),
                    "chat_count": sum(1 for c in all_chats if h in
                                      [p.strip() for p in str(c.get("participants") or "").split(",")])})
    return out


def user_threads(handle):
    """One user's inbox: the chats they are in, newest activity first."""
    out = []
    for c in db.read("chats"):
        if handle not in [p.strip() for p in str(c.get("participants") or "").split(",")]:
            continue
        msgs = sorted(db.read("messages", chat_id=c["id"]), key=lambda m: m.get("id") or 0)
        out.append({**c, "last_message": msgs[-1] if msgs else None,
                    "message_count": len(msgs)})
    return sorted(out, key=lambda c: (c.get("last_message") or {}).get("id") or 0, reverse=True)


COMBINERS = {"thread": thread, "inbox": inbox,
             "roster": roster, "user_threads": user_threads}


@route("GET", "/api/combine")
def list_combiners(handler, parts, query):
    return {"combine": sorted(COMBINERS)}


@route("GET", "/api/combine", prefix=True)
def run_combiner(handler, parts, query):
    name = parts[2] if len(parts) > 2 else ""
    if name not in COMBINERS:
        raise ValueError(f"unknown combine: {name}. have: {sorted(COMBINERS)}")
    # numeric-looking args arrive as strings off the query -- coerce them
    args = {k: (int(v) if str(v).lstrip("-").isdigit() else v) for k, v in query.items()}
    return COMBINERS[name](**args)
