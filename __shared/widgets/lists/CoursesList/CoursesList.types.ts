import type { ListWidgetProps } from '../ListWidget/ListWidget.types'

export type CoursesListProps = Omit<ListWidgetProps, 'query' | 'handleChange' | 'Item'>
