import { useState, useEffect, useRef } from 'react'
import type { CalendarItemProps, CalendarView } from '../Calendar.types'
import { startOfDay, dayKey, dateOf, mondayOf, DAY_MS } from '../js/dated'

interface UseCalendarProps {
  items?: CalendarItemProps[],
  view?: CalendarView,
  value?: string | number,
}

export const useCalendar = ({ items, view, value }: UseCalendarProps = {}) => {

  const [view_state, setView] = useState<CalendarView>(view || 'month')

  const [month_state, setMonth] = useState<number>(0)

  const held_date = dateOf(value)
  const held_time = held_date ? startOfDay(held_date).getTime() : 0

  const hold_month = useRef(false)
  const holdMonth = () => { hold_month.current = true }

  useEffect(() => {
    if (!held_time) return
    if (hold_month.current) { hold_month.current = false; return }
    setMonth(held_time)
  }, [held_time])

  useEffect(() => {
    if (view) setView(view)
  }, [view])

  const anchor = new Date(month_state || held_time || startOfDay(new Date()).getTime())

  const by_day: Record<string, CalendarItemProps[]> = {}
  items?.forEach(item => {
    const date = dateOf(item?.date)
    if (!date) return
    const key = dayKey(date)
    by_day[key] = (by_day[key] || []).concat([item])
  })
  Object.keys(by_day).forEach(key => {
    by_day[key].sort((a, b) => Number(dateOf(a?.date)) - Number(dateOf(b?.date)))
  })

  const handleStep = (delta: number) => {
    const next = new Date(anchor)
    if (view_state === 'day') next.setDate(next.getDate() + delta)
    else if (view_state === 'week') next.setDate(next.getDate() + delta * 35)
    else next.setMonth(next.getMonth() + delta)
    setMonth(next.getTime())
  }

  const handleView = (x?: unknown) => setView(String(x) as CalendarView)

  const daysToShow = (): Date[] => {
    const days: Date[] = []

    if (view_state === 'day') {
      days.push(startOfDay(anchor))
      return days
    }

    if (view_state === 'week') {
      const first = mondayOf(anchor)
      for (let i = 0; i < 35; i += 1) days.push(new Date(first.getTime() + i * DAY_MS))
      return days
    }

    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    const monday = mondayOf(first)
    for (let i = 0; i < 42; i += 1) days.push(new Date(monday.getTime() + i * DAY_MS))
    return days
  }

  return {
    view: view_state,
    month: month_state,
    anchor,
    by_day,
    days: daysToShow(),
    today_key: dayKey(new Date()),
    held_key: held_date ? dayKey(held_date) : null,
    handleStep,
    handleView,
    holdMonth,
    setMonth
  }
}

export default useCalendar
