import type { ListWidgetProps } from '../ListWidget/ListWidget.types'

export type ProjectsListProps = Omit<ListWidgetProps, 'query' | 'handleChange' | 'Item'>
