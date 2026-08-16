import { useApi } from '../../../hooks/useApi/useApi'
import { dateOf } from '../../../components/Calendar/js/dated'
import type { CalendarItemProps } from '../../../components/Calendar/Calendar.types'

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

    // dateOf, NOT timeOf -- timeOf floors to midnight, and the day view lays
    // appointments out in hour lanes. The db keeps most of these as epoch ms
    // but at least one row is an ISO string ('2026-08-13T18:00'), which is
    // exactly the case dateOf exists to absorb.
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

export const useAppointments = () => {
  const [rows, handleApi, status] = useApi<AppointmentRowProps[]>(APPOINTMENTS_PATH)

  const items = toCalendarItems(rows || [])

  const handleAdd = (x?: AppointmentRowProps) => handleApi('add-new', { ...x, origin: 'appointments-dashboard' })
  const handleEdit = (x?: AppointmentRowProps) => handleApi('edit', { ...x })
  const handleDelete = (x?: AppointmentRowProps) => handleApi('delete', { id: x?.id })

  return {
    rows: rows || [],
    items,
    status,
    handleApi,
    handleAdd,
    handleEdit,
    handleDelete
  }
}

export default useAppointments
