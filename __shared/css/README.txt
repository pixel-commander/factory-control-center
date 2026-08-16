== __shared/css -- the three files every page loads, in this order. ==

  styles.css   the reset + the font
  grid.css     the layout engine
  theme.css    the tokens

LOAD ORDER (Chrome.tsx, top of file): styles -> grid -> theme.

That order looks wrong -- the tokens load LAST, after the rules that read them
-- and it does not matter. Custom properties resolve at USE time, not at parse
time, so `body { font-size: var(--size) }` in styles.css picks up a --size that
theme.css defines afterwards. The only thing order controls here is which
duplicate SELECTOR wins, and these three files share none.


========================================================================
styles.css -- the reset, and the only two things body owns
========================================================================
A small reset: border-box on everything, margin/padding zeroed, media elements
made block-level and bounded, form controls inheriting the page font.

  @import MUST STAY ON LINE 1. @import is only legal before any other rule --
  one rule above it and the font silently never loads. It pulls Roboto (300,
  400, 500, 700) from fonts.googleapis.com with display=swap.

  THIS MEANS THE APP WANTS A NETWORK to render in Roboto. Offline it falls
  through to system-ui and still reads fine. To cut the dependency, self-host
  the .woff2 files under __app/public/ and swap the @import for @font-face.

BODY SETS EXACTLY TWO THINGS, and every other size in the app is measured off
the second one:

  font-family: var(--font-body)
  font-size:   var(--size)

  A CATCH WORTH KNOWING: `rem` is relative to the ROOT (<html>), not to body.
  Nothing sets a root font-size, so 1rem stays a fixed 16px and rem-based
  sizes do NOT ride the --size clamp -- they stay frozen while body text
  scales. To make the whole app scale together, move `font-size: var(--size)`
  from body to html. (Its own catch: --padding-* are rems too, so padding
  would start scaling with the text. Often wanted, but it IS a change.)

UTILITIES: .scroll-area (thin scrollbar, contained overscroll), .scroll-x,
.scroll-y.


========================================================================
grid.css -- always grid, never flex
========================================================================
`.grid` is display:grid and nothing else. Every layout is that class plus ONE
shape class, and the shape classes are the whole vocabulary:

  .side-l              auto 1fr   -> "side main"
  .side-r              1fr auto   -> "main side"
  .with-header         rows: auto / 1fr
  .with-footer         rows: 1fr / auto
  .with-header.with-footer        header / main / footer
  .holy-grail          header . header / left main right / footer . footer
                       (also pins 100vh)

  <div className='grid side-l'>          layout
  <div className='grid with-header'>     layout

THE SECOND HALF IS data-area. The shape class names the regions; a child claims
one by attribute, never by class:

  <div data-area='main'>

  Reserved names, and these are the ONLY ones the css knows:
    header  left  main  right  footer  side

  Every [data-area] is itself display:grid -- the fractal keeps going down --
  and left/main/right/side also get min-width:0 and min-height:0.

  THAT min-*:0 IS LOAD-BEARING, not tidiness. A grid item's default minimum is
  its CONTENT, so one long unbroken string or a wide table makes the whole
  column refuse to shrink and the page scrolls sideways. Zeroing it lets the
  track win. header and footer do not need it -- they are auto-height rows.


========================================================================
theme.css -- every token, one :root block
========================================================================
No rules, no selectors, just custom properties. Kept comment-free ON PURPOSE
(his call) -- what would have been comments lives here instead.

BACKGROUNDS -- one hex drives five.
  --bg-main          #071018, the base
  --bg-light         color-mix 96% toward #fff   one step up
  --bg-lighter       color-mix 92% toward #fff   two steps up
  --bg-dark          color-mix 96% toward #000   one step down
  --bg-darker        color-mix 92% toward #000   two steps down
  --page-bg          = --bg-main

  Change --bg-main and the whole family follows. The steps are DELIBERATELY
  small: these are the endpoints of container gradients, and a wider spread
  reads as a visible ramp instead of a sheen.

  --page-bg IS DEFINED BUT NOTHING READS IT YET. body sets font only. Applying
  it is one line: `body { background: var(--page-bg) }`.

CONTAINER BACKGROUNDS -- the surfaces things sit ON, as opposed to the page.
  --bg-container-main / -alt / -raised / -soft / -deep

  Named by ROLE, not by a light->dark ladder (unlike the border set below).

BORDERS -- a five-rung ladder, plus the composite.
  --color-border-darker -> -dark -> --color-border -> -light -> -lighter
  --border-width     1px
  --border           = width + solid + --color-border

  Write `border: var(--border)` and override just the edge you need after it,
  the way the float containers override border-top-color.

TEXT
  --color-text  --color-text-strong  --color-muted  --color-text-dim

ACCENTS -- three families, each base + lighter/lightest + darker/darkest.
  --color-primary    cyan
  --color-secondary  indigo
  --color-accent     mint

  (tertiary, quaternary and the --header-* set were removed -- nothing read
  them.)

DEPTH -- shadows, carried in from rab-dashboard-v2/dash-2-styles.css.
  --lift          1px white inset on the TOP EDGE ONLY -- the highlight of
                  light catching a raised lip, not a glow
  --lift-strong   the same, harder
  --drop          the shadow beneath
  --drop-lg       a bigger, softer one
  --sink          inset all round -- presses the surface INWARD

  The two recipes those exist to build:
    float  =  --lift-strong + --drop-lg
    inset  =  --sink alone

RADIUS
  --radius-lg     0.5rem   (the only rung; no scale yet)

TYPE
  --font-body     Roboto, then system-ui / -apple-system / Segoe UI
  --size          clamp(12px, 0.6667rem + 0.4167vw, 16px)

  THE CLAMP MATH, so nobody has to re-derive it. Fluid 12px -> 16px across a
  320px -> 1280px viewport:
    slope     = (16-12) / (1280-320) = 4/960 = 0.0041667  -> 0.4167vw
    intercept = 12 - (0.0041667 * 320) = 10.6667px        -> 0.6667rem
  Check: 320px  -> 0.6667*16 + 0.004167*320  = 10.667 + 1.333 = 12px
         1280px -> 0.6667*16 + 0.004167*1280 = 10.667 + 5.333 = 16px

  THE INTERCEPT IS IN REM, NOT PX, and that is not cosmetic: a px term inside
  clamp() pins the text and ignores the reader's browser zoom entirely.

PADDING
  --padding-xs .25 / -sm .5 / -md 1 / -lg 1.5 / -xl 2 rem, plus a bare
  --padding at 1rem.

  THE .pad CLASSES DO NOT EXIST. GridCell's has_padding renders `pad grid`, and
  the atom demos use `pad-sm`, but no .pad rule is defined in any of these three
  files -- so has_padding currently does nothing visible. Either write them off
  these tokens or stop rendering the class.
