import { useApi } from '../../../hooks/useApi/useApi'
import { useURL } from '../../../hooks/useURL/useURL'
import { dateOf, startOfDay } from '../../../components/Calendar/js/dated'
import type { CalendarItemProps, CalendarView } from '../../../components/Calendar/Calendar.types'

export interface AppointmentRowProps {
  id?: string,
  name?: string,
  title?: string,
  description?: string,
  start_date?: string | number,
  end_date?: string | number,
  all_day?: number,
  location?: string,
  status?: string,
  type?: string | number,
  [key: string]: unknown
}

export const APPOINTMENTS_PATH = '/api/appointments'

export const toCalendarItems = (rows?: AppointmentRowProps[]): CalendarItemProps[] => {
  if (!rows?.length) return []

  return rows.map(row => {
    const { id, title, name, start_date } = row || {}

    const when = dateOf(start_date)

    return {
      ...row,
      id: String(id || ''),
      label: title || name || 'untitled',
      date: when ? when.getTime() : 0,
      kind: 'appointment'
    }
  })
}

interface UseAppointmentsProps {
  view?: CalendarView
}

export const useAppointments = ({ view }: UseAppointmentsProps = {}) => {
  const [rows, handleApi, status] = useApi<AppointmentRowProps[]>(APPOINTMENTS_PATH)

  const [{ url_vars }, go] = useURL()

  const { date, appt } = url_vars || {}

  const selected_date = Number(date) || undefined
  const selected_appointment = String(appt || '') || undefined

  const items = toCalendarItems(rows || [])

  const held = rows?.find(x => String(x?.id) === String(selected_appointment))

  const handleSelect = (x?: CalendarItemProps) => go('update-var', { date: String(x?.id || '') })

  const handleSelectAppointment = (x?: CalendarItemProps) => {
    const when = dateOf(x?.date)
    go('update-var', {
      date: when ? String(startOfDay(when).getTime()) : '',
      appt: String(x?.id || '')
    })
  }

  const handleAdd = (x?: AppointmentRowProps) => handleApi('add-new', { ...x, origin: 'appointments-dashboard' })
  const handleEdit = (x?: AppointmentRowProps) => handleApi('edit', { ...x })
  const handleDelete = (x?: AppointmentRowProps) => handleApi('delete', { id: x?.id })

  return {
    rows: rows || [],
    items,
    held,
    status,
    view,
    selected_date,
    selected_appointment,
    handleApi,
    handleSelect,
    handleSelectAppointment,
    handleAdd,
    handleEdit,
    handleDelete
  }
}

export default useAppointments
