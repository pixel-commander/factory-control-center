import { useState } from 'react'
import { Calendar } from '../Calendar'
import '../css/calendar-main.css'
import type { CalendarItemProps } from '../Calendar.types'

const day = (y: number, m: number, d: number, h = 9) => new Date(y, m - 1, d, h).getTime()

const ITEMS: CalendarItemProps[] = [
  { id: 'a', label: 'line 3 changeover', date: day(2026, 8, 12, 9), kind: 'job' },
  { id: 'b', label: 'audit', date: day(2026, 8, 12, 14), kind: 'appointment' },
  { id: 'c', label: 'maintenance', date: day(2026, 8, 19, 11), kind: 'job' },
  { id: 'd', label: 'shift review', date: day(2026, 8, 27, 16), kind: 'appointment' },
  { id: 'e', label: 'safety walk', date: day(2026, 8, 12, 17), kind: 'job' },
]

export const Demo = () => {

  const [value, setValue] = useState<number>(day(2026, 8, 19))

  const calendar_settings = {
    items: ITEMS,
    value,

    handleSelect: (x?: CalendarItemProps) => {
      if (x?.id) setValue(Number(x.id))
    }
  }

  return (
    <div className='grid with-header'>
      <div className='pad-sm'>Calendar</div>
      <Calendar {...calendar_settings} />
    </div>
  )
}

export default Demo
