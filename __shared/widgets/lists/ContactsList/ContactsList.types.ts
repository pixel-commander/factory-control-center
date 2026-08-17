import type { ListWidgetProps } from '../ListWidget/ListWidget.types'

export type ContactsListProps = Omit<ListWidgetProps, 'query' | 'handleChange' | 'Item'>
