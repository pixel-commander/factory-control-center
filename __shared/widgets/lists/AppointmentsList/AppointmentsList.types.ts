import type { ListWidgetProps } from '../ListWidget/ListWidget.types'

export type AppointmentsListProps = Omit<ListWidgetProps, 'query' | 'handleChange' | 'Item'>
