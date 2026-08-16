# How to handle clicks

## Pick a day

```tsx
const [value, setValue] = useState(Date.now())

<Calendar
  items={ITEMS}
  selected_date={value}
  handleSelect={(x) => setValue(Number(x?.id))}
/>
```

The cell reports `getTime()` as its `id`. That number goes straight back into
`selected_date` — no parsing, no formatting, nothing in between.

## Never re-parse the day

```js
// WRONG -- lands on the day BEFORE, west of Greenwich
setValue(new Date(String(x?.date)).getTime())

// RIGHT
setValue(Number(x?.id))
```

`new Date('2026-08-16')` is parsed as UTC midnight. If you ever do need to convert
something, use `timeOf()` from [js/dated.ts](../../js/dated.ts), which builds a
plain date locally.

## Open an appointment

```tsx
<Calendar
  items={ITEMS}
  selected_appointment={open_id}
  handleSelectAppointment={(item) => setOpenId(item?.id)}
/>
```

The click stops at the appointment, so the day underneath is **not** also picked.
That is handled for you.

## Both selections at once

They are separate props on purpose — a day can be held while an appointment in a
different day is open:

```tsx
<Calendar
  selected_date={day}
  selected_appointment={appointment_id}
  handleSelect={(x) => setDay(Number(x?.id))}
  handleSelectAppointment={(item) => setAppointmentId(item?.id)}
/>
```

## Get the day AND everything on it

`handleClickCell` fires on the same click as `handleSelect` and carries the same
payload. Use it when a click should open a drawer or a form for that day:

```tsx
handleClickCell={(cell) => {
  openDrawer({ date: cell?.id, jobs: cell?.items })
}}
```

## Know when the month moved

```tsx
handleMonthChange={({ month, year }) => {
  fetchJobs(month, year)
}}
```

Fires on ‹ and › only. **Picking a day never moves the calendar**, so this will
not fire from a cell click — that is deliberate, see below.

## Why picking never moves the view

Every cell click pins the anchor before reporting. Without it, writing
`selected_date` walks the calendar to that day: clicking a pad cell visibly throws
you into the next month, and clicking an ordinary day silently moves the point the
arrows step from.

**Only the arrows move the view.** If you want a click to navigate, do it
yourself in the handler.

## Read-only

```tsx
<Calendar items={ITEMS} view_mode={true} />
```

No handlers fire, no arrows, no view toggler. Today, the selection and any range
still render — it just cannot be operated.

## Put the day in the url

The stamp is url-safe as-is, which is the point of keeping days numeric:

```tsx
const [{ tab }, go] = useURL()

<Calendar
  selected_date={Number(tab) || undefined}
  handleSelect={(x) => go('update-path', { tab: String(x?.id) })}
/>
```

## Related

- [../handlers.md](../handlers.md) — the full reference
- [../views.md](../views.md) — why days are numeric
- [using-the-cell-component.md](using-the-cell-component.md) — clicks inside a custom cell
