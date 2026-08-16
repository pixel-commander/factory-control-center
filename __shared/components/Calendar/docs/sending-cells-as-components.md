# Sending cells as components

`Cell` is the way out. Give the calendar one and it stops deciding what a day's
contents look like — it hands over the day's data and draws the frame around it.

```tsx
const MyCell = (x) => (
  <div className='grid'>
    {x?.items?.map(item => <JobTile key={item.id} {...item} />)}
  </div>
)

<Calendar items={JOBS} Cell={MyCell} />
```

## What your cell receives

```ts
{
  id: 1786...,      // the day, getTime() -- the stamp IS the id
  date: 1786...,    // the same number
  items: [ ... ]    // every appointment on that day, sorted by time
}
```

`items` is already bucketed and sorted. You do not filter the array yourself.

## What the calendar keeps

Even with a `Cell`, the calendar still owns:

- the grid, the six-week height, the columns
- the day number and its head
- `.is-today`, `.is-selected`, `.is-outside-month`, `.is-in-range`
- the click that reports the day out

Your cell fills the **items region** of the day, not the whole day.

## What it costs you

`Cell` replaces the built-in item list, which means these stop applying:

- the 2-item slice and the `+N more` count
- `item_class` / `selected_appointment` on items
- `handleSelectAppointment`

Your cell renders every item and wires its own clicks. If you want an appointment
click not to also pick the day, call `stopPropagation` — the built-in `Dated` does
exactly that, and it is the one behaviour worth copying:

```tsx
onClick={(e) => { e.stopPropagation(); openJob(item) }}
```

## When to reach for it

Use `Cell` when the page knows something the calendar cannot:

- a job needs a status light, a progress bar, a machine name
- a shift is a coloured band, not a line of text
- the day should show a count or a total rather than a list

Use `item_class` instead when the *shape* is fine and only the **look** differs —
that is one prop and keeps everything above.

## Why not just pass children

Children land after the grid, not inside a day. `Cell` is per-day and is called
once for each of the 42 cells, with that day's data. They solve different problems
and both exist.

## Related

- [appointments.md](appointments.md) — the item shape and how bucketing works
- [handlers.md](handlers.md) — what still reports out when Cell is in play
- [type-defs.md](type-defs.md) — `CalendarItemProps`, which is also the cell's props
