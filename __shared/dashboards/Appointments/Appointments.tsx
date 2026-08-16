import { useState } from 'react'
import { Calendar } from '../../components/Calendar/Calendar'
import '../../components/Calendar/css/calendar-main.css'
import { GridCell } from '../../components/GridCell/GridCell'
import { useAppointments } from './hooks/useAppointments'
import type { CalendarItemProps } from '../../components/Calendar/Calendar.types'

export const Appointments = () => {
  const { items, status, rows } = useAppointments()
  const [selected_date, setSelectedDate] = useState<number>()
  const [selected_appointment, setSelectedAppointment] = useState<string | number>()

  const held = rows?.find(x => String(x?.id) === String(selected_appointment))

  const calendar_settings = {
    items,
    selected_date,
    selected_appointment,
    handleSelect: (x?: CalendarItemProps) => setSelectedDate(Number(x?.id) || undefined),
    handleSelectAppointment: (x?: CalendarItemProps) => setSelectedAppointment(x?.id)
  }

  let note = `${items?.length || 0} appointments`
  if (!status?.loaded) note = 'loading…'
  if (status?.error) note = 'no api — is python __shared/api/server.py running?'
  if (status?.empty) note = 'no appointments'

  return (
    <div className='grid with-header'>
      <GridCell area='header'>appointments — {note}</GridCell>

      <GridCell area='main' className='side-r'>
        <GridCell area='main'>
          <Calendar {...calendar_settings} />
        </GridCell>

        <GridCell area='side' className='container-panel' has_padding={true}>
          {held ? (
            <div className='grid'>
              <span>{String(held?.title || held?.name || '')}</span>
              <span>{String(held?.description || '')}</span>
              <span>{String(held?.location || '')}</span>
              <span>{String(held?.status || '')}</span>
            </div>
          ) : (
            <span>pick an appointment</span>
          )}
        </GridCell>
      </GridCell>
    </div>
  )
}

export default Appointments
