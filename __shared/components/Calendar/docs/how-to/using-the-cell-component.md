# How to use the Cell component

## The shortest version

```tsx
const JobCell = (x) => (
  <div className='grid'>
    {x?.items?.map(item => (
      <div key={String(item?.id)} className='container-edge'>
        {String(item?.label || '')}
      </div>
    ))}
  </div>
)

<Calendar items={JOBS} Cell={JobCell} />
```

That is the whole contract. The calendar draws the grid and the day head; your
cell fills the items region.

## What arrives

```ts
{
  id:    1786924800000,   // the day, getTime()
  date:  1786924800000,   // the same number
  items: [ /* that day's appointments, sorted by time */ ]
}
```

Already bucketed and sorted — do **not** filter `items` yourself, and do not
compare dates in the cell. It has been done.

## A cell that counts instead of listing

```tsx
const CountCell = (x) => {
  const total = x?.items?.length || 0
  if (!total) return <span />
  return <span className='container-panel'>{total} jobs</span>
}
```

## A cell with its own click

Call `stopPropagation` or the day underneath gets picked too:

```tsx
const ClickableCell = (x) => (
  <div className='grid'>
    {x?.items?.map(item => (
      <div
        key={String(item?.id)}
        onClick={(e) => { e.stopPropagation(); openJob(item) }}
      >
        {String(item?.label || '')}
      </div>
    ))}
  </div>
)
```

The built-in item does exactly this. An appointment is not its day, and one click
must not mean both.

## Define it OUTSIDE your component

```tsx
// RIGHT
const MyCell = (x) => <div>{...}</div>
const Page = () => <Calendar Cell={MyCell} />

// WRONG -- new type every render, all 42 cells remount
const Page = () => {
  const MyCell = (x) => <div>{...}</div>
  return <Calendar Cell={MyCell} />
}
```

A component defined inside its parent is a **new type on every render**, so React
tears down and rebuilds instead of updating. You lose focus, scroll position, and
any state inside the cell.

## What you give up

`Cell` replaces the built-in item list, so these stop applying:

- the 2-item slice and `+N more`
- `item_class` and `selected_appointment` on items
- `handleSelectAppointment`

Everything else stays: the grid, the day number, all `.is-*` state classes, and
the day-level click.

## When not to use it

If only the **look** differs, use `item_class` — one prop, and you keep all of the
above:

```tsx
<Calendar items={JOBS} item_class='container-edge' />
```

Reach for `Cell` when the *shape* is wrong: a status light, a progress bar, a
total, a coloured band.

## Related

- [../sending-cells-as-components.md](../sending-cells-as-components.md) — the reasoning
- [../appointments.md](../appointments.md) — the item shape
- [handling-clicks.md](handling-clicks.md) — what still reports out
