# Type definitions

Every type in [../Calendar.types.ts](../Calendar.types.ts), what it is for, and
where it is actually used.

---

## `CalendarView`

```ts
type CalendarView = 'day' | 'week' | 'month'
```

**What** — the span. A closed set of three, deliberately: a bare `string` would
swallow the literals, so `'weeks'` would compile, fall through, and silently do
nothing.

**Where** — the `view` prop; `useCalendar`'s `view_state`; `ViewToggler`'s
`selected`; the branch in `Calendar.tsx` that picks which body to draw.

---

## `AppointmentItemProps`

```ts
interface AppointmentItemProps extends HouseKeyProps {}
```

**What** — an appointment as the house knows it. Empty extension, so it inherits
the house keys: `id`, `label`, `title`, `color`, `name`, `description`, `mark`,
`path`, `View`.

**Where** — the `appointments` key on `CalendarItemProps`.

**Note** — it carries no time fields yet. If appointments grow `start_time` /
`end_time` / `duration`, this is where they go, and this is the type the cell
layout would read.

---

## `CalendarDayProps`

```ts
interface CalendarDayProps {
  date?, day?, month?, year?
  is_today?, is_selected?, is_disabled?, is_outside_month?
  label?, items?
}
```

**What** — one day cell as data: which day it is, and the four `is_*` flags a
grid needs to render it differently.

**Where** — the signature of `CalendarHandlerProps`.

**Note** — this describes the shape the component *conceptually* renders, but the
component builds its cells from `Date` objects and reports `CalendarItemProps`.
Nothing constructs a `CalendarDayProps` today. It stands as the vocabulary for
the `is_*` flags, which the class names mirror exactly.

---

## `CalendarItemProps`

```ts
interface CalendarItemProps {
  id?: string | number
  label?: React.ReactNode
  date?: string | number
  item_class?: string
  appointments?: AppointmentItemProps[]
  [key: string]: unknown
}
```

**What** — the workhorse. It is **three things at once**, which is why it is the
type you meet most:

1. **an appointment you pass in** — `items={[...]}`
2. **a day cell reported back out** — `{ id, date, items }` where `id` and `date`
   are both the day's `getTime()` stamp
3. **the props your `Cell` component receives**

**Where** — `items`, every `handleX` payload, `Cell`'s parameter, the `Dated` and
`DayCell` internals.

**`date` is `string | number`** — a stamp is what the db and url keep, but some
columns are kept as text, so both are accepted. `dateOf()` normalises either.

**`id` is `string | number`** — a row's id may be text, and a day cell's id is
always the numeric stamp.

**The index signature is a trade.** `[key: string]: unknown` is what lets a db row
go in untouched with no mapping step. It also means **a typo compiles** —
`requred: true` will not error. That is a real cost, and it is why `wordOfDated`
reads defensively rather than trusting a key exists.

---

## `CalendarHandlerProps`

```ts
type CalendarHandlerProps = (x?: CalendarDayProps) => void
```

**What** — a handler that takes a day.

**Where** — declared and exported, **currently unused**. `handleSelect` was moved
to `CalendarItemHandlerProps` when cells started reporting their items too.

---

## `CalendarItemHandlerProps`

```ts
type CalendarItemHandlerProps = (x?: CalendarItemProps) => void
```

**What** — a handler that takes an item or a cell.

**Where** — `handleSelect`, `handleItemClick`, `handleSelectAppointment`,
`handleClickCell`. All four share it, so a page can pass the same function to any
of them.

---

## `CalendarProps`

The component's whole surface. Grouped as it is in the file:

### what it shows

| prop | type | notes |
| --- | --- | --- |
| `items` | `CalendarItemProps[]` | flat; bucketed by day internally |
| `month` / `year` | `number` | declared; the anchor comes from `value` today |
| `value` | `string \| number` | the held day — older spelling of `selected_date` |

### the selections

| prop | type | marks |
| --- | --- | --- |
| `selected_date` | `number` | `.is-selected` on the day |
| `selected_appointment` | `string \| number` | `.is-selected` on the item |
| `selected_timeframe` | `[number?, number?]` | `.is-in-range` + the two ends |

Three props, not one, because a held day, an open appointment and a range are
three different questions. See [appointments.md](appointments.md).

### how it shows it

| prop | default | notes |
| --- | --- | --- |
| `view` | `'month'` | seeds `useCalendar`, then the toggler owns it |
| `size` | `'full'` | `'small'` is the thumbnail dress |
| `view_mode` | `false` | read-only: no clicks, no arrows, no toggler |
| `start_day` | `0` | 0 = Sunday. **Declared, not yet wired** — the grid is Monday-first |
| `show_outside_days` | `true` | **Declared, not yet wired** in the component |
| `day_labels` | — | override the weekday words. **Declared, not yet wired** |

### the class hooks

`calendar_class`, `header_class`, `nav_button_class`, `week_class`, `day_class`,
`cell_class`, `today_class`, `selected_class`, `item_class`.

Every one is an atom name. The component's own css does layout only — see
[how-to/styling.md](how-to/styling.md).

### the escape hatch

```ts
Cell?: (x?: CalendarItemProps) => React.JSX.Element
```

Takes the day's contents over entirely. See
[sending-cells-as-components.md](sending-cells-as-components.md).

### the handlers

`handleSelect`, `handleClickCell`, `handleSelectAppointment`, `handleMonthChange`,
and `handleItemClick` (declared, not wired). See [handlers.md](handlers.md).

### the rest

`className`, `container_ref` (`RefObject<HTMLDivElement | null>` — the `| null` is
required, React 19 types `useRef<T>(null)` that way), `children`.

---

## Declared but not wired

Worth knowing before you reach for one:

- `start_day`, `show_outside_days`, `day_labels` — on `CalendarProps`, not read
  by `Calendar.tsx`
- `handleItemClick` — superseded by `handleSelectAppointment`
- `CalendarHandlerProps`, `CalendarDayProps` — superseded by the item versions
- `month` / `year` — the anchor is driven by `value` / `selected_date`

None of them break anything; they are simply inert. Wiring any of them is small.

## Related

- [../Calendar.types.ts](../Calendar.types.ts) — the source
- [handlers.md](handlers.md) · [views.md](views.md) · [appointments.md](appointments.md)
