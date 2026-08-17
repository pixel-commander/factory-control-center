import type { ListWidgetProps } from '../ListWidget/ListWidget.types'

export type UsersListProps = Omit<ListWidgetProps, 'query' | 'handleChange' | 'Item'>
