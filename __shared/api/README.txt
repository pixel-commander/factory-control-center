== api -- THE DOOR. every api into base.db lives here. ==

START HERE. This file is the INDEX, not the record. It tells you what exists and
which folder to open. Each api carries its own README with the real detail --
follow the trail down, don't build from this page alone.

RUN IT
  python server.py            -> http://127.0.0.1:3034
  the site reaches it at /api through vite's proxy on :4300 (same origin)
  GET /api/health             -> what is mounted, live, right now


========================================================================
WHAT'S HERE  (open the folder's README for the detail)
========================================================================

  events\      THE PUSH -- the site updates itself, nothing polls
               GET /api/events                     server-sent events
               -> events\README.txt
               CLUE: if a screen isn't updating after a write, the api that
                     wrote probably forgot to call bump(). Read this one.

  tables\      CRUD -- read / write / edit / delete, every table
               GET    /api/<table>[?col=val]
               POST   /api/<table>                 -> {id}
               PUT    /api/<table>/<id>            -> {changed}
               DELETE /api/<table>/<id>            -> {deleted}  (SOFT)
               -> tables\README.txt
               CLUE: one generic handler serves EVERY table. Adding a table to
                     base_db.TABLES makes it routable with no new code.
               CLUE: a messages write REQUIRES `origin`. A 400 there is the
                     guard working, not a bug.

  combine\     JOINS -- several tables, ONE formatted return
               GET /api/combine                    what's available
               GET /api/combine/thread?chat_id=1   chat + messages + its people
               GET /api/combine/inbox              chats + last msg + unread
               GET /api/combine/roster             users + their tallies
               GET /api/combine/user_threads?handle=guage
               -> combine\README.txt
               CLUE: reach for these BEFORE firing three fetches and stitching
                     in the browser. If the shape you want isn't here, add it
                     here -- the join belongs next to the data.

  manage\      RUNNING THE DB -- not the data in it
               GET  /api/manage/stats              row + deleted counts
               GET  /api/manage/trash[?table=x]    what's soft-deleted
               POST /api/manage/restore {table,id} UNDELETE
               POST /api/manage/backup             WAL-safe copy
               -> manage\README.txt
               CLUE: nothing here destroys a row. Deleted rows are in trash and
                     restore brings them back whole.
               CLUE: never back up base.db with a file copy -- it's WAL, a copy
                     tears silently. Use this backup.

  server.py    the dispatcher. NO api logic -- it mounts the folders and routes.
  _router.py   the shared plumbing (@route). Not an api.


========================================================================
THE SHAPE -- one folder per api
========================================================================
  api\
    server.py          thin: puts folders on the path, imports each api, routes
    _router.py         @route decorator + matcher
    <name>\
      <name>_api.py    the api. its routes register on import.
      README.txt       what it does, how, and WHY. the real record.
      LOSSES.txt       scars: what broke here + the rule that stops it again.

ADD AN API
  1. make a folder with <name>_api.py + README.txt + LOSSES.txt
  2. use @route("GET", "/api/<name>") -- see _router.py's header for the contract
  3. add the folder name to APIS in server.py
  4. if it MUTATES anything, call bump() (see events\) or no screen will know
  Nothing else changes.


========================================================================
THE LAWS EVERY API HOLDS
========================================================================
  NO SQL IN AN API FILE. Everything goes through the base_db primitives in
    ..\db\. An api that writes its own SQL has left the trail.
  DELETE IS SOFT, ALWAYS. deleted=1, the row stays, restore brings it back.
  MUTATIONS PUSH. Write, then bump(), or the site is stale and nobody knows.
  ARGUMENT NAMES ARE THE CONTRACT. Accept what a caller naturally sends; never
    rename a key in flight. (This one is a scar -- manage\LOSSES.txt.)
  THE DOOR IS LOCAL ONLY. Binds 127.0.0.1 on purpose; the site reaches it
    through the proxy. Exposure is always a deliberate layer in front.

  NEXT BREADCRUMB -> ..\db\README.txt  (the tables, column by column)
