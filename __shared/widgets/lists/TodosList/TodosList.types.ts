import type { ListWidgetProps } from '../ListWidget/ListWidget.types'

export type TodosListProps = Omit<ListWidgetProps, 'query' | 'handleChange' | 'Item'>
