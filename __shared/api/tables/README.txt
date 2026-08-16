== tables -- CRUD for every table. read / write / edit / delete ==

WHAT IT IS
One generic handler that serves EVERY table in base_db.TABLES. Adding a table to
the schema makes it routable here with no new code -- that is the point.

THE ROUTES
  GET    /api/<table>[?col=val]      READ    -- equality filters, deleted hidden
  POST   /api/<table>   {fields}     WRITE   -> {id}
  PUT    /api/<table>/<id> {fields}  EDIT    -> {changed}
  DELETE /api/<table>/<id>           DELETE  -> {deleted}   (SOFT: deleted=1)

  <table> is one of: users, chats, messages

EXAMPLES
  GET  /api/messages?chat_id=1        that chat's messages
  POST /api/messages  {"origin":"site","chat_id":1,"sender":"guage","body":"hi"}
  PUT  /api/messages/7   {"read":1}
  DELETE /api/messages/7              hides it; the row stays

THE LAWS THIS HOLDS
  - NO SQL IN THIS FILE. Everything goes through the base_db primitives.
  - DELETE IS SOFT. It sets deleted=1. The row is never removed; /api/manage/trash
    shows it and /api/manage/restore brings it back.
  - A messages write REQUIRES `origin` (where it came from). base_db raises on a
    missing one and it surfaces as a 400 -- that is correct, not a bug.
  - Every mutation calls bump() so the site updates itself. See ../events.
  - date_added / date_edited are stamped by the layer, never by a caller.

WHY GENERIC: a per-table handler means a new table needs new endpoints, and the
endpoints drift apart. One handler means every table behaves identically, forever.
