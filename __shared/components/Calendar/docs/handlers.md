# Handlers

Every handler is `handleX` and every one of them is optional. The calendar never
holds what was picked — it reports, and the caller decides what that means.

## The five

| handler | fires when | you get |
| --- | --- | --- |
| `handleSelect` | a day cell is clicked | the cell: `{ id, date, items }` |
| `handleClickCell` | the same click, second channel | the same cell |
| `handleSelectAppointment` | an appointment inside a day is clicked | that item |
| `handleMonthChange` | the ‹ or › arrow is used | `{ month, year }` |
| `handleItemClick` | *declared, not wired* | — |

## The stamp is the id

A day cell reports `getTime()` — a number — as both its `id` and its `date`:

```js
handleSelect: (x) => setValue(Number(x?.id))
```

That number is what the db keeps and what the url carries, so it goes straight
back into `selected_date` with nothing in between. **Never** re-parse it with
`new Date(...)`. See [views.md](views.md) for why that would cost you a day.

## Why handleSelect and handleClickCell are both there

They answer different questions and both fire on the same click:

- `handleSelect` is the house "a day was picked" pair with `selected_date` —
  the same shape as any other selection in the system.
- `handleClickCell` is the cell *and everything in it*, for a page that wants to
  open a drawer or a form for that day.

A page can use either, or both, and does not have to work out which one a click
belongs to.

## An appointment is not its day

Clicking an appointment calls `stopPropagation`, so the day underneath stays
quiet. Without that, one click would pick a day *and* open an appointment, and
the page would have to guess which was meant.

```
click a day          -> handleSelect + handleClickCell
click an appointment -> handleSelectAppointment ONLY
```

## Picking never moves the calendar

Every cell click calls `holdMonth()` inside [useCalendar](../hooks/useCalendar.ts)
before reporting. That pins the anchor for exactly one `selected_date` change.

Without it, clicking a day writes `selected_date`, the effect walks the anchor to
that day, and the grid re-anchors under the cursor — visibly throwing you into
the next month when the day was a pad cell, and silently moving the point the
arrows step *from* when it was not.

The effect cannot tell a click from a url navigation; both are just the value
changing. So the click says so, and the effect honours the pin once and clears it.

**Only the arrows move the view.**

## Read-only

`view_mode` removes every click handler and hides the arrows and the view
toggler. The calendar still draws today, the selection and the range — it just
cannot be operated.

## Related

- [views.md](views.md) — the three spans and what a cell is in each
- [appointments.md](appointments.md) — what goes in a day, and selection
- [sending-cells-as-components.md](sending-cells-as-components.md) — take the cell over
- [../Calendar.types.ts](../Calendar.types.ts) — the signatures
