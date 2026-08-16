Ide - ported 2026-08-16 from B:\rab-dashboard-v2-main\__shared\ui\components\Ide
under the house law (comments stripped to here; the repo is the king).

WHAT IT IS
- Ide.tsx: the two parts wired together and nothing else. The tree picks a
  file, the editor edits it; Ide holds the one shared fact - which files are
  open and their saved text. Both parts run alone, so a dashboard can put
  the tree in a rail and the editor in main without the wrapper.
- CodeTabsWrapper.tsx (renamed from CodeEditor 2026-08-16): THE FRAME -
  tabs in the header, CodeViewer in main, save/format strip and problems
  band in the footer. It never holds the text.
- CodeViewer\ (its own stamped folder since 2026-08-16, renamed from
  Code): THE CODE WINDOW - the editable sheet and the diff, no chrome.
  Its props live in CodeViewer.types.ts, its styles in
  css\code-viewer.css. FIX carried in the move: the window root now wears
  ide-code itself, so token colours and the mono font work when the
  window is mounted bare - previously they were scoped under the frame's
  root class and a bare window rendered unstyled.
- TOKEN LAW for the family (owner's ruling): the master shim tokens live
  in css\ide.css scoped to the family roots; child css files
  (folder-tree.css, code-viewer.css) ride them through those roots and
  may intercept or add new tokens at the lowest level that needs them.
- FolderTree\ (its own stamped folder since 2026-08-16): the files as a
  tree, derived from flat items' path strings (never stored nested - a
  nested shape is a second thing to keep in step). expanded is the optional
  controlled lookup for open folders. Its types live in
  FolderTree.types.ts, its styles in css\folder-tree.css; it still imports
  ../css/ide.css for the token shim and the shared .ide-row.
- js/: highlight (regex tokeniser - a tree can't be built from mid-edit
  code; a token pass never fails), lint (one scanner serves the checker AND
  the formatter - two features, one truth; a broken save is refused), diff
  (line LCS, capped, context-collapsed), demo (IDE_FILES + IDE_REVIEW -
  the demo ships the part's own files; BROKEN.tsx exists to show a refused
  save).

LAWS CARRIED IN FROM THE ORIGINAL (do not undo these)
- THE DOM IS THE TEXT in Code: no state per line, no controlled value.
  React paints the rows once per file; every keystroke reads the DOM back,
  re-colours, and restores the caret by absolute offset. Undo is a local
  snapshot stack because we own the paint.
- The views do not unmount: diff and sheet are both in the document and
  the switch is a class - text and caret survive a trip through a review.
- Every hook sits above the is_visible early-return. React counts hooks
  per render; a hook after a conditional return is the crash.
- .ide owns the height (height:100%): both halves measure against it;
  without it the whole thing collapses to 0 inside a grid cell.
- The +/- tally is computed whenever the DIFF tab is SHOWN, not once it is
  open - the counts are the reason to click. Memoised on the two texts.
- handleReport fires from an effect, never during render.
- Keys: Cmd/Ctrl+S save, Shift+Alt+F format, Tab indents (selection-aware),
  Enter keeps indent and opens a brace, Cmd+Z / Cmd+Shift+Z history.

WHAT CHANGED IN THE PORT (rulings 2026-08-16, logged in QA)
- Shell / Row / TabBar / Button do not exist here yet. Ruling: use what we
  have, add what's missing to ide.css. Surfaces are divs wearing
  container-main plus data-mode/data-color (styling pass to come,
  together); rows are .ide-row, tabs are .ide-tabs/.ide-tab, buttons wear the
  button-solid / button-ghost atoms - all local css in css/ide.css.
- The folder scan (useFolderTree -> useApi -> /api/files/tree) is TRIMMED:
  no api exists in the factory yet. Ide and FolderTree are items-driven
  only; the path prop and the SCANNING state return when an api arrives.
  The v2 originals hold the reference implementation.
- Vocabulary is component-local by ruling: text, text_alt, is_dirty,
  expanded, can_diff, bytes, mode, area live in Ide.types.ts, not
  GLOBAL_TYPES.
- css tokens: translated to theme.css where possible; the rest live in a
  shim block at the top of ide.css scoped to the Ide roots (--pad-* fine
  grades, --text-2xs/3xs, the mono font stack, surfaces, faint text,
  speed/ease, and role aliases: ide-primary/secondary, ide-good=success,
  ide-bad=error, ide-accent=accent). Zero global tokens added.
- Editor.tsx was NOT ported: it is the un-split original that Code +
  CodeEditor replaced. __REV_Ide_GAUGE.tsx was mid-refactor scrap; not
  ported. HUMAN_REVIEW.txt was empty.
- The legacy demo's obfuscated "expor\u0074" strings were normalised to
  plain text in js/demo.ts (they are string data, never compiled).
