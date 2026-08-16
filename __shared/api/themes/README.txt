== themes -- generate a palette from one colour, and check it ==

THE ROUTES
  GET  /api/themes/preview?seed=%234a9eff&mode=dark   generate + check, keep nothing
  POST /api/themes/seed {seed,name,mode,force}        generate + check + write

  The plain table routes still serve the rows themselves:
  GET /api/themes, PUT /api/themes/<id>, DELETE /api/themes/<id>  -> ../tables/

WHAT IT DOES
  One colour in, EIGHTEEN SLOTS out -- six families (primary, secondary,
  accent, neutral, danger, success) at three shades each. The shades are made
  in OKLCH, not by mixing toward white: sRGB mixing drags a colour through
  grey and shifts its hue, so a lightened blue arrives lilac.

  Then it CHECKS the result, with the same ratios scan_themes.py uses:
      a surface must carry body text          4.5:1
      an accent must be visible on the surface  3:1
  A theme that fails is REPORTED AND NOT WRITTEN. Pass force to keep it anyway.

  -> ../../db/seed_theme.py    the maths and the checker
  -> ../../db/scan_themes.py   the same check over what is already stored

WHY THE MATHS IS HERE AND NOT IN THE UI
  Two copies of a colour ramp -- one in python, one in js -- drift the first
  time either is tuned, and the drift is invisible until a theme looks wrong.
  One implementation, called over the door.

SEMANTIC SLOTS DO NOT FOLLOW THE SEED. danger stays red and success stays
green in every theme, because they mean something. Only the surfaces, the
neutrals and the accent take the seed's hue.
