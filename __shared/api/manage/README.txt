== manage -- running the DB, not the data in it ==

WHAT IT IS
The db's own controls: what is in it, what is in the bin, putting something back,
and taking a safe copy.

THE ROUTES
  GET  /api/manage                      list the ops
  GET  /api/manage/stats                live + soft-deleted counts, per table
  GET  /api/manage/trash[?table=x]      the soft-deleted rows
  POST /api/manage/restore {table,id}   UNDELETE -> {restored}
  POST /api/manage/backup               WAL-safe copy -> {backup, bytes}

RESTORE IS THE POINT OF SOFT DELETE
Nothing in this house destroys a row. delete() hides it (deleted=1), trash shows
exactly what is hidden, restore brings it back whole. A real purge -- if it ever
happens -- stays a deliberate, separate pass, and trash means it can never be
done blind.

BACKUP USES SQLITE'S OWN BACKUP API, NEVER A FILE COPY
base.db runs in WAL mode. Copying a live WAL database with the filesystem gives a
TORN READ -- a file that looks fine and is quietly corrupt. Backups land in
db/_backups/ stamped with the time, and never overwrite an existing one.

THE RULES
  - stats and trash are READS -- they never bump the push.
  - restore and backup are WRITES -- they bump, because a restored row changes
    what every screen should show.
  - restore accepts the row as `id` (what a json caller naturally sends) or
    `row_id` (the internal name). Both work; neither is renamed in flight.
