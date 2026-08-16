== Calendar -- day, week and month, on one hook and one bag of items. ==

  <Calendar items={ITEMS} selected_date={day} handleSelect={pick} />

Hand it a flat array of dated rows and it draws them. It holds no state you care
about, owns no data, and reports every click back out -- the page decides what a
selection means.

THE STATE IS IN THE HOOK, THE WORDS ARE IN js/dated, THE MARKUP IS IN Calendar.tsx.
Nothing in the component does date arithmetic and nothing decides what a month is
called.


========================================================================
THE FILES
========================================================================
  Calendar.tsx          the markup. Three views, no arithmetic.
  Calendar.types.ts     every prop and payload
  ViewToggler.tsx       the day | week | month switch, its own component
  hooks/useCalendar.ts  the two states, the day bucket, the cells
  js/dated.ts           every day-word the calendar says
  css/calendar.css      layout, padding, font-size -- nothing else
  css/calendar-main.css the skin, arriving through calendar_class
  demo/Demo.tsx         a working month with items

  docs/                 the write-ups (below)


========================================================================
THE DOCS
========================================================================
  docs/handlers.md
      the five handlers, what each reports, and why picking a day never
      moves the calendar

  docs/views.md
      day | week | month, the two states, and why every day is a number
      until the moment it is drawn

  docs/appointments.md
      the item shape, one-pass bucketing, the three selections, ranges

  docs/sending-cells-as-components.md
      the Cell escape hatch -- what it gives you and what it costs

  docs/type-defs.md
      every type, what it does, where it is used, and which ones are
      declared but not yet wired

  docs/how-to/styling.md
      the hard line between the two css files, and the atom hooks

  docs/how-to/using-the-cell-component.md
      worked Cell examples, and the one mistake that remounts everything

  docs/how-to/handling-clicks.md
      picking days, opening appointments, putting the day in the url

  docs/how-to/filling-the-window.md
      the height chain, and the grid rule the whole layout rests on


========================================================================
THE FOUR THINGS TO KNOW
========================================================================

1. ALL DAYS ARE NUMERIC UNTIL DISPLAYED.
   A day is a getTime() stamp in the db, in the url, in state, and in every
   handler payload. It becomes words once, in js/dated.ts.

   new Date('2026-08-16') is parsed as UTC MIDNIGHT -- the 15th in every
   timezone west of Greenwich. That is the classic off-by-one calendar bug.
   dateOf() matches the plain form and builds it locally instead. Use dateOf
   and timeOf; go around them and the bug comes back.
   -> docs/views.md

2. THE STAMP IS THE ID.
   A day cell reports { id, date, items } where id and date are the SAME
   number. It goes straight back into selected_date with no parsing.
   -> docs/handlers.md

3. PICKING IS NOT TRAVELLING.
   Every cell click pins the anchor first (holdMonth). Without it, writing
   selected_date walks the calendar to that day -- visibly throwing you into
   the next month on a pad cell, and silently moving the point the arrows
   step from on an ordinary one. Only the arrows move the view.
   -> docs/handlers.md

4. A GRID ROW'S DEFAULT MINIMUM IS ITS CONTENT.
   Which is why minmax(0, 1fr) and min-height: 0 are everywhere in the css.
   Without them a row grows to fit its contents, and neither the fill nor any
   overflow beneath it will ever trigger.
   -> docs/how-to/filling-the-window.md


========================================================================
THE SPLIT
========================================================================
  view is the SPAN     day | week | month
  size is the DRESS    small | full

CROSSED, NOT FOLDED. A small month is a popup thumbnail; a full week is the
instrument. Folding them would make "small" mean "month, but quiet", and a small
week could not be asked for.


========================================================================
STYLING
========================================================================
  css/calendar.css       layout, padding, font-size. NOTHING else.
  css/calendar-main.css  colour, border, background, radius.

The second is an atom -- it arrives through calendar_class and can be swapped
whole. The line between them is hard on purpose: a rule in the layout file that
sets `border` is two classes deep against an atom's one, so it wins silently and
the atom does nothing. That already happened once with the form's buttons.
  -> docs/how-to/styling.md


========================================================================
RELATED
========================================================================
  ../../css/theme.css        every token these files resolve through
  ../../css/grid.css         .grid, the shape classes, data-area
  ../../css/README.txt       what those three css files each own
  ../../atoms/containers/    the container atoms a calendar can wear
  ../../hooks/useURL/        for putting the held day in the url
