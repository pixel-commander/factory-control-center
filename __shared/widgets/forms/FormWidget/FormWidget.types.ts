import type { ReactNode } from 'react'
import type { UiProps } from '../../../../RAB.types'
import type { InputGroupBaseProps } from '../../../components/StatelessForm/StatelessForm.types'

export interface FormWidgetProps extends Omit<UiProps, 'items' | 'item'> {
  items?: InputGroupBaseProps[],
  item?: { [key: string]: unknown },
  action?: string,
  cancel?: ReactNode,
  can_scroll?: boolean,
}
