==============================
Folder Name: api/brain
File: README.txt
Hint: the read-only window onto the new world's brain.db -- four GETs,
      zero writes, the parser beside the db is the only writer
==============================

ROUTES
  GET /api/brain/tree             nuclei + counts
  GET /api/brain/neurons          light rows (?q=, ?nucleus=)
  GET /api/brain/neuron?folder=   one full row
  GET /api/brain/search?q=        RECALL -- FTS5 MATCH, ranked, snippets
                                  (?limit=, max 100). Falls back to LIKE
                                  if the index is missing (add_fts.py,
                                  beside the db, builds it). The 2000x
                                  engine: 23,765ms scan -> ms-class MATCH.

THE LAW
  Files (rraabbiitt on the project drive) are truth. brain.db is the
  index, filled by neurons_to_db.py which lives beside it. This door
  READS ONLY -- if a neuron looks wrong here, fix the txt file and
  re-run the parser, never the row.

THE PATH
  BRAIN_DB points at the share. The name lives in the new world's
  PATHS.txt as brain-db; if the drive moves, that registry row and the
  one constant here move together.
