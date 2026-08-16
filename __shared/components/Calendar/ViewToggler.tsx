import type { CalendarView } from './Calendar.types'

const VIEWS: { id: CalendarView, label: string }[] = [
  { id: 'day', label: 'DAY' },
  { id: 'week', label: 'WEEK' },
  { id: 'month', label: 'MONTH' }
]

interface ViewTogglerProps {
  className?: string,
  selected?: CalendarView,
  views?: { id: CalendarView, label: string }[],
  toggler_class?: string,
  button_class?: string,
  handleView?: (x?: CalendarView) => void
}

export const ViewToggler = ({
  className,
  selected,
  views = VIEWS,
  toggler_class = '',
  button_class = 'button-ghost',
  handleView
}: ViewTogglerProps) => {

  className = `calendar-views ${toggler_class || ''} ${className || ''}`.trim()

  return (
    <div className={className}>
      {views?.map((item, i) => {
        const { id, label } = item || {}
        let view_class = `calendar-view ${button_class || ''}`.trim()
        if (id === selected) view_class += ' is-selected'
        return (
          <button
            key={id || i}
            type='button'
            className={view_class}
            onClick={() => handleView?.(id)}
          >
            {label || 'n/a'}
          </button>
        )
      })}
    </div>
  )
}

export default ViewToggler
