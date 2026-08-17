import type { ListWidgetProps } from '../ListWidget/ListWidget.types'

export type AssignmentsListProps = Omit<ListWidgetProps, 'query' | 'handleChange' | 'Item'>
