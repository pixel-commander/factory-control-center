# Views

`view` is the **span** — `day | week | month`.
`size` is the **dress** — `small | full`.

They are **crossed, not folded**. A small month is a popup thumbnail; a full week
is the instrument. Folding them would make "small" mean "month, but quiet", and a
small week could not be asked for.

## The three spans

### month

A fixed **42 cells** from the Monday before the 1st — six whole weeks, always. The
grid never changes height between months, so the page does not jump when you step.

Days from the neighbouring months fill the pad and wear `.is-outside-month`.

### week

**Transposed**: the weekday is the ROW and the week is the COLUMN.

```
        AUG 3–9   AUG 10–16   AUG 17–23   AUG 24–30   AUG 31–SEP 6
M         ▢           ▢           ▢           ▢            ▢
T         ▢           ▢           ▢           ▢            ▢
W         ▢           ▢           ▢           ▢            ▢
```

Five weeks side by side, so you read a single weekday straight across — every
Tuesday in the span on one line. The month view is the other way up; this one
answers *"what do my Tuesdays look like"*.

A week cell is **not** a month cell. It is `grid with-header`: the date states
itself in the header, the appointments own main, and it wears no container class
— no border, no background, no square.

### day

Hour lanes, **07:00 to 19:00**. Appointments render `is_block`, so each shows its
time beside its label.

## The two states, and only two

[useCalendar](../hooks/useCalendar.ts) holds exactly:

- **`view`** — the span
- **`month`** — the anchor, as a **number**

Everything else is derived: `anchor`, `by_day`, `days`, `today_key`, `held_key`.

## All days are numeric until displayed

The anchor is a `getTime()` stamp because that is how a day is saved in the db and
written to the url. It becomes words exactly once, at the moment of drawing, in
[js/dated.ts](../js/dated.ts). Nothing else holds a formatted day, so there is no
second representation to keep in step.

### The one that bites

```js
new Date('2026-08-16')   // UTC MIDNIGHT -> the 15th, west of Greenwich
```

A bare `YYYY-MM-DD` is parsed as UTC, so in any timezone west of Greenwich it
lands on the day *before* the one written. That is the classic off-by-one calendar
bug.

`dateOf()` matches the plain form and builds it locally, piece by piece, which is
why it is not simply `new Date(raw)`. Use `dateOf` / `timeOf` and it cannot
happen; go around them and it will.

## Stepping

What "next" means depends on the span, which is why `handleStep` lives with the
state and not in the markup:

| span | one step |
| --- | --- |
| day | ± 1 day |
| week | ± 35 days (the whole 5-week window) |
| month | ± 1 month |

## Filling the window

Day and week views fill the height. That needs an unbroken chain — break any link
and the view collapses to its content:

```
.calendar             grid-template-rows: auto minmax(0, 1fr)
  .calendar-body      min-height: 0
    .inner            grid-template-rows: minmax(0, 1fr)
      .calendar-weeks grid-auto-rows: 1fr
```

**A grid row's default minimum is its CONTENT.** Without `minmax(0, 1fr)` and
`min-height: 0` the row grows to fit whatever is inside it, and neither the fill
nor any `overflow: auto` beneath it will ever trigger.

## Related

- [handlers.md](handlers.md) — what reports out, and why picking never moves the view
- [appointments.md](appointments.md) — what sits in a day
- [../hooks/useCalendar.ts](../hooks/useCalendar.ts) — the state
- [../js/dated.ts](../js/dated.ts) — every day-word
- [../ViewToggler.tsx](../ViewToggler.tsx) — the day/week/month switch
