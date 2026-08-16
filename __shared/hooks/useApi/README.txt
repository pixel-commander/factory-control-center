== useApi -- one tuple, any table. The db pushes; nothing polls. ==

  const [rows, handleApi, status] = useApi('/api/appointments')

Carried from rab-dashboard-v2. The api is generic -- one handler against ANY
table -- so this hook is too: give it a path, get the rows.


========================================================================
THE DOOR
========================================================================
  python __shared/api/server.py        127.0.0.1:3035

The api binds LOCAL ONLY and stays closed to the network on purpose. The
browser reaches it through vite's /api proxy (see __app/vite.config.ts), so
it is same-origin, there is no cors, and the db socket is never exposed.

  no server running -> every call fails quietly, status.error goes true,
  and whatever data was already loaded STAYS. It never throws.


========================================================================
THE TUPLE
========================================================================
  [data, handleApi, status]

  data      the rows, or null before the first load lands
  handleApi the five verbs, below
  status    { loading, error, loaded, empty } -- ALWAYS all four, always
            present, so a component can branch without checking they exist

  !loaded             first load     -> skeleton
  loading && loaded   reload/mutate  -> spinner over the old data
  error               last op failed -> error state
  empty               loaded, 0 rows -> empty state
  else                                  data


========================================================================
THE FIVE VERBS -- a closed set
========================================================================
  handleApi('get')                          re-read
  handleApi('add-new', { ...fields })       POST   -> resolves the new row
  handleApi('edit',    { id, ...fields })   PUT
  handleApi('set',     { id, ...fields })   PUT  (same as edit)
  handleApi('delete',  { id })              DELETE -- SOFT, the row stays

Every mutation RETURNS its promise, so a caller can open the room the moment
it exists. Every mutation re-reads after.

ANYTHING ELSE reaches `default`, which reports to the console, names the five
verbs, and sends nothing. It used to return silently -- the same scar useURL
carries, and for the same reason: a typo that changes nothing and says nothing
costs an hour to find.


========================================================================
IDS ARE STRINGS. ULIDs, NOT INTEGERS.
========================================================================
  01KZY5YMBGTNY2J00WSH6JCR8S

The original hook did `Number(id || 0)` when building a row url, which is
fine against an INTEGER PRIMARY KEY and NaN against a ULID -- every edit and
delete would have gone to /api/appointments/NaN. It is String(id || '') here.

If a table ever does use integer ids, String() still does the right thing.


========================================================================
IT NEVER POLLS. THE PUSH IS THE AUTO-UPDATE.
========================================================================
ONE EventSource for the whole app -- not one per hook. The server bumps a
global version on every mutation and pushes `changed` on /api/events; every
mounted useApi re-reads once. A write anywhere refreshes every list.

  push: false   opts a static list out of even that

THE POLL OPTION WAS DELETED, NOT DEFAULTED OFF (his call, twice: "no polling
though, the db has to push the bag -- polling makes it blink"). An option that
exists is one someone turns on later, and a timer beside a push HIDES A DEAD
PUSH by keeping the screen looking alive. If the stream is down, fix the
stream.

The stream is lazy -- it opens on the first subscriber and EventSource
reconnects itself. No SSE available -> the initial load still happens and
nothing falls back to a timer.


========================================================================
THE HOUSE KEYS
========================================================================
Every table carries these ten, in this order:

  id name title description date_added date_edited added_by deleted
  created origin

  DATES ARE EPOCH MILLISECONDS. Flags are INTEGER 0/1, not booleans.
  DELETE IS SOFT (deleted=1) -- the row stays and restore brings it back.
  date_added / date_edited are stamped by the db layer, never by a caller.

  -> __shared/db/README.txt is the record of every table, column by column.


========================================================================
RELATED
========================================================================
  ../../db/README.txt          the schema, and the rules the api enforces
  ../../api/README.txt         the door and how routes register
  ../useURL/README.txt         the same tuple shape, for the url
  __app/vite.config.ts         the /api proxy
