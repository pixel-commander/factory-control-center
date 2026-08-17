import type { ListWidgetProps } from '../ListWidget/ListWidget.types'

export type ClassroomsListProps = Omit<ListWidgetProps, 'query' | 'handleChange' | 'Item'>
