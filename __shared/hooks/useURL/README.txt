== useURL -- the URL IS the state. paths + # vars, one hook. ==

WHAT IT DOES
Names the URL's path segments, reads them back as an object, and changes the
address bar through ONE dispatch handle. Client-side routing with no library.

THE APP SERVES THE URL, NOT THE BROWSER. handle() uses history.pushState, so the
page never reloads -- the app re-renders off state and routes itself.


========================================================================
THE PATH  ->   /main/page/view/tab/sub-tab
========================================================================
THAT IS THE HOUSE URL SHAPE. Five named segments, coarse -> fine, and it is the
hook's BUILT-IN DEFAULT (his 2026-07-09). Call useURL() with NO argument and you
get exactly these names.

  /main / page / view / tab / sub-tab
    |      |      |      |      |
    |      |      |      |      +-- deepest: a section inside a tab
    |      |      |      +--------- which tab within the view
    |      |      +---------------- which view within the page
    |      +----------------------- which page within the app
    +------------------------------ which app / top-level area

  segment    routes            typical value
  --------   ---------------   -------------------------------
  main       APP routing       dashboard | admin | home
  page       APP routing       reports | students | settings
  view       PAGE routing      billing | list | detail
  tab        PAGE routing      general | info | history
  sub-tab    PAGE routing      anything deeper

  main/page       pick the app + page          -> app-routing
  view/tab/sub-tab route WITHIN a page         -> page-routing
  Same hook, different depth.

WORKED EXAMPLE
  URL   /dashboard/reports/billing/general#id=234

  const [{ main, page, view, tab, url_vars }, handle] = useURL()

  main    = 'dashboard'
  page    = 'reports'
  view    = 'billing'
  tab     = 'general'
  sub-tab = ''                 <- absent segments read '', never undefined
  url_vars= { id: '234' }

WHY IT IS ALWAYS THESE NAMES: every component reads the SAME segments, so the
names line up everywhere and there is nothing to guess. That is why the site
"runs on useURL". Pass a different template ONLY for a genuinely different shape.

  sub-tab HAS A HYPHEN -> bracket-access it:  state['sub-tab']  (NOT state.sub-tab)


========================================================================
THE STRING ARG -- it names the segments
========================================================================
The argument is a TEMPLATE: slash-separated names mapped left-to-right onto the
real path segments. That string is what makes `main` mean the first segment.

  useURL()                               the DEFAULT: main/page/view/tab/sub-tab
  useURL('main/page/view/tab/sub-tab')   the same thing, written out
  useURL('org/repo/branch')              your own shape, your own names
  useURL('')                             no path segments -- vars only


========================================================================
BOTH HALVES: the path AND the # vars
========================================================================
PATH  -> the named segments above.       /dashboard/reports/billing
VARS  -> everything after # (or ? or $) as key=value pairs joined by &.
         url_vars is a RESERVED key -- it always holds the vars, never a
         segment. Never name a path segment 'url_vars'.

WRITES emit '#':   /dashboard/reports/billing#id=234&open=1
READS accept ? # $ so an older ?id=234 link still parses.
Why '#': his call. It survives a refresh with no server rewrite rule.

STAYING IN SYNC -- two listeners, both needed:
  popstate    back/forward through pushState entries      (the PATH half)
  hashchange  an anchor click or a hand-edited '#...'     (the VARS half)
A bare hash change does not always raise popstate. With only one listener the
address bar says one thing and state says another, silently.


========================================================================
THE HANDLE -- FIVE VERBS, AND ONLY FIVE
========================================================================
  handle('update-path', { view: 'settings' })      rewrite segment(s), KEEP
                                                   the vars (the '#' rides on)
  handle('set-path',    { view: 'settings' })      rewrite segment(s) and DROP
                                                   the vars -- one commit
  handle('update-var',  { id: 'cats' })            set/merge var(s)
  handle('update',      { paths: {...}, vars: {...} })
                                                   BOTH in one commit = ONE
                                                   history entry (one Back tap)
  handle('remove-var',  { id: '' })                drop the named var(s)

Returns the new state.

UPDATE-PATH OR SET-PATH? Ask whether the vars still MEAN anything where you
are going. Moving between tabs of the same record -- the id survives, so
update-path. Going somewhere new -- the id described the page you just left,
so set-path. Carrying it is how you land on /organizer#id=234 pointing at a
row in a table you are not looking at any more.

ANYTHING ELSE reaches `default`, which reports to the console, names the five
verbs, and leaves the URL alone. It RETURNS rather than throws -- handle()
runs inside click handlers, and a throw there takes down the render, which is
a bigger failure than the typo. It used to be SILENT; see LOSSES.txt, "the
expensive one".


========================================================================
RENDERING THE ROUTE -- this IS the router
========================================================================
  const [{ main, page }] = useURL()

  if (main === 'home')  return <Home />
  if (main === 'about') return <About section={page} />
  return <NotFound />

Segment -> component. No route table, no <Routes>, no library.


========================================================================
THE RULES
========================================================================
  VIEW STATE RIDES THE URL. Never useState for what view is open, never a
    hand-rolled URLSearchParams. That is the law, and it is a scar.
  READ THE URL, DON'T PASS IT DOWN. It is global state -- a component reads its
    own segment (const [{ view }] = useURL()), never through props.
  EVERY <a> THAT DRIVES useURL MUST preventDefault. The #1 gotcha; see LOSSES.
  READ url_vars DEFENSIVELY: const { id } = url_vars || {}.
  DEEP PATHS NEED AN SPA FALLBACK. Refreshing /a/b/c must serve index.html.
    Vite dev already does; a static host needs the rewrite rule.
    (Verified 2026-07-25 on :4300 -- /board/chat/3 returns the app shell.)
 