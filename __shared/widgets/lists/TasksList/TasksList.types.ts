import type { ListWidgetProps } from '../ListWidget/ListWidget.types'

export type TasksListProps = Omit<ListWidgetProps, 'query' | 'handleChange' | 'Item'>
