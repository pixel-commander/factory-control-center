# Appointments

An appointment is anything that lands on a day — an event, a job, a shift, a
booking. The calendar calls them `items` and does not care what they are.

## The shape

```ts
{
  id?: string | number,
  label?: React.ReactNode,
  date?: string | number,     // getTime() stamp
  item_class?: string,        // this one item's atom
  [key: string]: unknown      // the db row rides along untouched
}
```

Only `date` is load-bearing. Everything else is optional, and the index signature
means **the row you fetched goes in as-is** — no mapping step, no second shape to
keep in step with the table.

## One flat array, not a map

```js
items = [
  { id: 'a', label: 'line 3 changeover', date: 1786...  },
  { id: 'b', label: 'audit',             date: 1786...  },
]
```

Flat is how a query returns rows. [useCalendar](../hooks/useCalendar.ts) buckets
them by day in **one pass** and sorts each bucket by time; every view then reads
the bucket and never walks the array.

That is why a month with 400 appointments costs one pass, not 42.

## The words it looks for

`wordOfDated` reads **label, then title, then name** — the first one present wins.
So a table calling it `title` and another calling it `name` both render without
either learning the other's column names.

## Selection

Two selections, and they are **not the same question**:

| prop | type | marks |
| --- | --- | --- |
| `selected_date` | `number` | the held day → `.is-selected` on the cell |
| `selected_appointment` | `string \| number` | the open item → `.is-selected` on the item |

They are separate props because a day can be held while an appointment inside a
*different* day is open. Picking one must not clear the other.

`selected_appointment` compares as a **string**, because a row id may be numeric
in one table and text in another, and `3` should still match `'3'`.

## Ranges

```js
selected_timeframe = [start_stamp, end_stamp]
```

Every day from start to end inclusive wears `.is-in-range`; the two ends also wear
`.is-range-start` and `.is-range-end`. The skin draws the run as one continuous
band — interior days square, only the ends rounded.

Read in **either order**, so a backwards drag still draws the band it looks like
it is drawing.

## How many show

| view | shown per day |
| --- | --- |
| month, full | 2, then `+N more` |
| month, small | 1, then `+N more` |
| week | all of them, the cell scrolls |
| day | all of them, in hour lanes |

A month square has no room; a week column is tall. Nothing is hidden without
saying so — the `+N more` count is always the truth.

## Styling one differently

`item_class` on the item beats `item_class` on the calendar, so one day can hold
mixed styles:

```js
{ id: 'x', label: 'URGENT', date: stamp, item_class: 'container-edge' }
```

`data-kind` is also written to the element from `item.kind`, if the row has one.

## Related

- [handlers.md](handlers.md) — `handleSelectAppointment`, and why the click stops there
- [sending-cells-as-components.md](sending-cells-as-components.md) — draw the day yourself
- [type-defs.md](type-defs.md) — `CalendarItemProps` in full
