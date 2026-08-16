== events -- THE PUSH. /api/events ==

WHAT IT IS
The live wire. The site opens this ONCE and leaves it open; the server pushes a
'changed' event whenever a row lands. That is the whole reason nothing on the
page polls.

THE ROUTE
  GET /api/events        server-sent events (text/event-stream)

WHAT IT SENDS
  event: hello      on connect, with the current version number
  event: changed    every time the db is mutated, with the new version
  : keep-alive      a comment line every ~20s so a dead client surfaces

HOW IT WORKS
A module-level VERSION int. Every mutating api calls bump() after it writes.
This stream compares the int twice a second and only writes when it MOVES.
Nothing here reads the db -- polling an in-memory integer costs nothing;
polling a database costs everything.

USING IT FROM A PAGE
  const es = new EventSource('/api/events');
  es.addEventListener('changed', () => reload());   // re-read ONCE per push
  // and always es.close() on unmount, or you leak a thread per mount

USING IT FROM AN API
  from events_api import bump
  ... after any write/edit/delete/restore ...
  bump()

THE RULE: if you add an api that MUTATES anything, it must call bump(). A write
that does not bump is a silent write -- the data changed and no screen knows.

ONE THREAD PER VIEWER. Fine at lab scale, not for hundreds of clients.
