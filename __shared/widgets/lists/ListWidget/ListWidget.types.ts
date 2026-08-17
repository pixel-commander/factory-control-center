import type * as React from 'react'
import type { UiProps } from '../../../../RAB.types'
import type { RenderItemProps } from '../../../components/RenderItems/RenderItems.types'

export interface ListWidgetProps extends Omit<UiProps, 'name' | 'items' | 'handleClick' | 'Item'> {
  name?: string,
  items?: RenderItemProps[],
  Item?: (x?: RenderItemProps) => React.JSX.Element,
  handleClick?: (item?: RenderItemProps) => void,
  query?: string,
  has_search?: boolean,
  can_add?: boolean,
  is_open?: boolean,
  action?: React.ReactNode,
  handleClickAddNew?: (value?: unknown) => unknown,
}
