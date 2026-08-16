import type { HouseKeyProps } from '../../../RAB.types'

export type CalendarView = 'day' | 'week' | 'month'

export interface AppointmentItemProps extends HouseKeyProps {

}
export interface CalendarDayProps {

  date?: string,
  day?: number,
  month?: number,
  year?: number,

  is_today?: boolean,
  is_selected?: boolean,
  is_disabled?: boolean,
  is_outside_month?: boolean,

  label?: React.ReactNode,
  items?: CalendarItemProps[]
}

export interface CalendarItemProps {

  id?: string | number,
  label?: React.ReactNode,

  date?: string | number,
  item_class?: string,
  appointments?: AppointmentItemProps[],
  [key: string]: unknown
}

export type CalendarHandlerProps = (x?: CalendarDayProps) => void
export type CalendarItemHandlerProps = (x?: CalendarItemProps) => void

export interface CalendarProps {
  className?: string,

  month?: number,
  year?: number,
  items?: CalendarItemProps[],

  selected_date?: number,
  selected_appointment?: string | number,

  selected_timeframe?: [number?, number?],

  view?: CalendarView,
  value?: string | number,
  size?: string,

  view_mode?: boolean,
  start_day?: number,
  show_outside_days?: boolean,
  day_labels?: string[],

  calendar_class?: string,
  header_class?: string,
  nav_button_class?: string,
  week_class?: string,
  day_class?: string,
  cell_class?: string,
  today_class?: string,
  selected_class?: string,
  item_class?: string,

  Cell?: (x?: CalendarItemProps) => React.JSX.Element,

  handleSelect?: CalendarItemHandlerProps,
  handleItemClick?: CalendarItemHandlerProps,
  handleMonthChange?: (x?: { month?: number, year?: number }) => void,
  handleSelectAppointment?: CalendarItemHandlerProps,
  handleClickCell?: CalendarItemHandlerProps,

  container_ref?: React.RefObject<HTMLDivElement | null>,
  children?: React.ReactNode
}
