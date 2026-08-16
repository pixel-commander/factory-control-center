import './css/calendar.css'
import { Fragment } from 'react'
import type { CalendarProps, CalendarItemProps } from './Calendar.types'
import { useCalendar } from './hooks/useCalendar'
import { ViewToggler } from './ViewToggler'
import { dayKey, timeWord, dateOf, wordOfDated, titleOf, DOW, MONTHS } from './js/dated'

export const Calendar = ({
  className,
  items,
  view,
  value,
  selected_date,
  selected_appointment,
  selected_timeframe,
  size = 'full',
  view_mode = false,
  calendar_class = 'calendar-main',
  header_class = '',
  nav_button_class = 'button-ghost',
  week_class = '',
  day_class = '',
  cell_class = '',
  today_class = '',
  selected_class = '',
  item_class = '',
  Cell,
  container_ref,
  children,
  handleSelect,
  handleClickCell,
  handleSelectAppointment,
  handleMonthChange
}: CalendarProps) => {

  const {
    view: span,
    anchor,
    by_day,
    days,
    today_key,
    held_key,
    handleStep,
    handleView,
    holdMonth

  } = useCalendar({ items, view, value: selected_date || value })

  const is_small = size === 'small'

  className = `calendar ${calendar_class || ''} ${className || ''}`.trim()
  if (view_mode) className += ' view-mode'
  className += ` is-${span}`
  if (is_small) className += ' is-small'

  const step = (delta: number) => {
    handleStep(delta)
    handleMonthChange?.({ month: anchor.getMonth() + 1 + delta, year: anchor.getFullYear() })
  }

  const Dated = ({ item, is_block }: { item?: CalendarItemProps, is_block?: boolean }) => {
    const date = dateOf(item?.date)

    let dated_class = `calendar-item ${item?.item_class || item_class || ''}`.trim()

    if (selected_appointment !== undefined && String(item?.id) === String(selected_appointment)) {
      dated_class += ' is-selected'
    }

    return (
      <div
        className={dated_class}
        data-kind={String(item?.kind || 'appointment')}
        data-block={is_block ? 'true' : undefined}
        onClick={(e) => { e.stopPropagation(); handleSelectAppointment?.(item) }}
      >
        <span className='calendar-item-label'>{wordOfDated(item) || 'n/a'}</span>
        {is_block ? <span className='calendar-item-when'>{timeWord(date)}</span> : null}
      </div>
    )
  }

  const DayCell = ({ date, shows_dow }: { date: Date, shows_dow?: boolean }) => {
    const key = dayKey(date)
    const held = by_day?.[key] || []
    const shown = held.slice(0, is_small ? 1 : 2)

     const is_outside_month = date.getMonth() !== anchor.getMonth() && span === 'month'

     const id = date.getTime()

     const [from, to] = selected_timeframe || []
    const start = Math.min(from || 0, to || from || 0)
    const end = Math.max(from || 0, to || from || 0)
    const in_range = !!from && id >= start && id <= end

    let cell = `calendar-day ${day_class || ''}`.trim()
    if (key === today_key) cell += ` is-today ${today_class || ''}`.trimEnd()
    if (key === held_key) cell += ` is-selected ${selected_class || ''}`.trimEnd()
    if (is_outside_month) cell += ' is-outside-month'
    if (in_range) cell += ' is-in-range'
    if (in_range && id === start) cell += ' is-range-start'
    if (in_range && id === end) cell += ' is-range-end'

    const cell_settings: CalendarItemProps = { id, date: id, items: held }

    return (
      <div
        className={cell}
        data-date={id}
        onClick={view_mode ? undefined : () => {
          holdMonth()
          handleSelect?.(cell_settings)
        handleClickCell?.(cell_settings)
        }}
      >
        <span className='calendar-day-head'>
          {shows_dow ? <span className='calendar-day-dow'>{DOW[(date.getDay() + 6) % 7]}</span> : null}
          <span className='calendar-day-number'>
            {date.getDate() === 1 ? `${MONTHS[date.getMonth()]} 1` : date.getDate()}
          </span>
        </span>

        <div className={`calendar-day-items ${cell_class || ''}`.trim()}>
          {Cell
            ? <Cell {...cell_settings} />
            : shown?.map((item, i) => <Fragment key={String(item?.id || i)}>{Dated({ item })}</Fragment>)}
        </div>

        {!Cell && held.length > shown.length
          ? <span className='calendar-more'>+{held.length - shown.length} more</span>
          : null}
      </div>
    )
  }

  const WeekCell = ({ date }: { date: Date }) => {
    const key = dayKey(date)
    const held = by_day?.[key] || []
    const id = date.getTime()

    let cell = `calendar-week-cell grid with-header ${day_class || ''}`.trim()
    if (key === today_key) cell += ` is-today ${today_class || ''}`.trimEnd()
    if (key === held_key) cell += ` is-selected ${selected_class || ''}`.trimEnd()

    const cell_settings: CalendarItemProps = { id, date: id, items: held }

    return (
      <div
        className={cell}
        data-date={id}
        onClick={view_mode ? undefined : () => {

          holdMonth()
          handleSelect?.(cell_settings)
          handleClickCell?.(cell_settings)
        }}
      >
        <div className='calendar-week-cell-head' data-area='header'>
          {MONTHS[date.getMonth()]} {date.getDate()}
        </div>

        <div className={`calendar-week-cell-items ${cell_class || ''}`.trim()} data-area='main'>
          {Cell
            ? <Cell {...cell_settings} />
            : held?.map((item, i) => <Fragment key={String(item?.id || i)}>{Dated({ item, is_block: true })}</Fragment>)}
        </div>
      </div>
    )
  }

  let body = null

  if (span === 'day') {
    const held = by_day?.[dayKey(anchor)] || []
    const hours: number[] = []
    for (let hour = 7; hour <= 19; hour += 1) hours.push(hour)

    body = (
      <div className='calendar-day-view'>
        {hours?.map(hour => {
          return (
            <div key={`hour-${hour}`} className='calendar-hour-row'>
              <span className='calendar-hour'>{String(hour).padStart(2, '0')}:00</span>
              <div className='calendar-lane'>
                {held
                  ?.filter(item => (dateOf(item?.date) || new Date(0)).getHours() === hour)
                  ?.map((item, i) => <Dated key={String(item?.id || i)} item={item} is_block />)}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  else if (span === 'week') {

    const weeks: Date[][] = []
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
    const shown_weeks = is_small ? weeks.slice(0, 2) : weeks

     const week_columns = { gridTemplateColumns: `auto repeat(${shown_weeks.length}, minmax(0, 1fr))` }

    body = (
      <div className='calendar-weeks' style={week_columns}>

        <span className='calendar-weeks-corner' />
        {shown_weeks?.map((week, i) => {
          const first = week?.[0]
          const last = week?.[week.length - 1]
          return (
            <span key={first ? dayKey(first) : i} className='calendar-week-label'>
              {first ? `${MONTHS[first.getMonth()]} ${first.getDate()}` : ''}
              {last ? ` – ${MONTHS[last.getMonth()]} ${last.getDate()}` : ''}
            </span>
          )
        })}

        {DOW?.map((word, day_index) => {
          return (
            <div key={word || day_index} className='calendar-weekday-row' style={week_columns}>
              <span className='calendar-weekday-label'>{is_small ? word.slice(0, 1) : word}</span>
              {shown_weeks?.map((week, i) => {
                const date = week?.[day_index]
                if (!date) return <span key={i} />
                return <Fragment key={dayKey(date)}>{WeekCell({ date })}</Fragment>
              })}
            </div>
          )
        })}

      </div>
    )
  }

  else {
    body = (
      <div className='calendar-month'>
        <div className={`calendar-week ${week_class || ''}`.trim()}>
          {DOW?.map((word, i) => <span key={i}>{is_small ? word.slice(0, 1) : word}</span>)}
        </div>
        <div className='calendar-days'>
          {days?.map(date => <Fragment key={dayKey(date)}>{DayCell({ date })}</Fragment>)}
        </div>
      </div>
    )
  }

  return (
    <div className={className} ref={container_ref} data-size={size}>

      <div className={`calendar-header ${header_class || ''}`.trim()}>

        <div className='calendar-stepper'>
          <button type='button' className={`calendar-step ${nav_button_class || ''}`.trim()} onClick={() => step(-1)}>‹</button>
          <span className='calendar-title'>{titleOf(span, anchor)}</span>
          <button type='button' className={`calendar-step ${nav_button_class || ''}`.trim()} onClick={() => step(1)}>›</button>
        </div>

        {!is_small && !view_mode
          ? <ViewToggler selected={span} button_class={nav_button_class} handleView={handleView} />
          : null}

      </div>

      <div className='calendar-body' data-area='main'>
        <div className='inner grid'>
          <div className='scroll grid'>
            {body}
          </div>
        </div>
      </div>

      {children}

    </div>
  )
}

export default Calendar
