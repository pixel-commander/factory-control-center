# How to style the calendar

## The split

Two css files, and the line between them is hard:

| file | owns |
| --- | --- |
| [css/calendar.css](../../css/calendar.css) | layout, padding, font-size — **nothing else** |
| [css/calendar-main.css](../../css/calendar-main.css) | colour, border, background, radius |

`calendar-main` is an **atom**: it arrives through `calendar_class`, which
defaults to `'calendar-main'`. Swap that prop and the whole skin changes with no
edit to either file.

### Why the line is hard

A rule in `calendar.css` that sets `border` is **two classes deep**
(`.calendar-main .calendar-day`) against an atom's **one** (`.container-cell`).
It wins silently, and the atom does nothing at all.

That already happened once with the form's buttons. Keeping appearance out of the
layout file entirely means the fight cannot start.

## Restyle without touching the component

```tsx
<Calendar
  calendar_class='my-calendar'    // your own skin file
  day_class='container-cell'      // every day wears an atom
  today_class='container-edge'    // today wears another on top
  item_class='container-panel'    // every appointment
  nav_button_class='button-glow'  // the arrows and the toggler
/>
```

## The state classes

The component writes these; your skin targets them:

| class | on | when |
| --- | --- | --- |
| `.is-today` | day cell | the date is today |
| `.is-selected` | day cell / item | matches `selected_date` / `selected_appointment` |
| `.is-outside-month` | day cell | a pad day from a neighbouring month |
| `.is-in-range` | day cell | inside `selected_timeframe` |
| `.is-range-start` / `.is-range-end` | day cell | the two ends of the range |
| `.is-day` / `.is-week` / `.is-month` | root | the open span |
| `.is-small` | root | `size='small'` |

Plain classes, not `data-*` attributes — the same `.is-x` convention the atoms use.

## Writing a skin

Copy `calendar-main.css`, rename the outer class, edit. Every rule is scoped
under it, so two skins never collide:

```css
.my-calendar .calendar-day {
  border: var(--border);
  background: var(--bg-light);
}

.my-calendar .calendar-day.is-today {
  border-color: var(--color-primary);
}
```

## The rules a skin must respect

**Effects are written literally, never through a token.** `box-shadow: inset 0 0
.875rem rgba(0, 0, 0, .7)` — not `var(--sink)`. The token names mislead:
`--lift-strong` is an *inset* highlight, not a stronger drop shadow.

**Colour comes from tokens.** `--color-*`, `--bg-*`, `--border`. Never a raw hex
unless it is genuinely one-off.

**Never set height or width.** The grid owns size. See
[filling-the-window.md](filling-the-window.md).

## Related

- [../views.md](../views.md) — what the layout has to do
- [using-the-cell-component.md](using-the-cell-component.md) — when styling is not enough
- [filling-the-window.md](filling-the-window.md) — the height chain
