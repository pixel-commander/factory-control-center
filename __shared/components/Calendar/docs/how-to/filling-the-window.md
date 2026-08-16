# How to make it fill the window

## The chain

The calendar fills its container only if **every link** hands the height down.
Break one and the view collapses to its content:

```
parent                  must give the calendar a height
  .calendar             grid-template-rows: auto minmax(0, 1fr)
    .calendar-body      min-height: 0
      .inner            grid-template-rows: minmax(0, 1fr)
        the view        grid-auto-rows: 1fr  (day and week)
```

## The one rule behind all of it

**A grid row's default minimum is its CONTENT.**

So a row grows to fit whatever is inside it, and:

- `1fr` never shrinks it
- `overflow: auto` beneath it never triggers

`minmax(0, 1fr)` and `min-height: 0` say *"you may be smaller than your
contents"*, which is what makes both work. That is also why every `[data-area]` in
[grid.css](../../../../css/grid.css) carries `min-width: 0; min-height: 0`.

## Give it a height

The calendar has no height of its own:

```tsx
// inside a chrome region -- it already gets 1fr
<GridCell area='main'><Calendar /></GridCell>

// standalone
<div className='grid' style={{ height: '100dvh' }}>
  <Calendar />
</div>
```

## What each view does with it

| view | fill |
| --- | --- |
| month | 6 rows, `repeat(6, minmax(0, 1fr))` — never changes height between months |
| week | head row `auto`, then 7 weekday rows share the rest |
| day | 13 hour rows, `grid-auto-rows: 1fr` |

## When it collapses

**Symptom** — the calendar is short and sits at the top.
**Cause** — a link in the chain is missing, usually the parent giving no height.

**Symptom** — the calendar pushes the page taller and the page scrolls.
**Cause** — a `min-height: 0` is missing somewhere above it, so the row grew to
fit instead of scrolling inside.

## Overflow

`.calendar-week-cell-items` is the one region that scrolls itself — a week cell is
tall and lists every appointment. Everything else fits by construction, because
the grid divides the space rather than stacking content.

## Related

- [../views.md](../views.md) — the three spans
- [styling.md](styling.md) — why the layout file never sets height
- [../../css/calendar.css](../../css/calendar.css) — the source
