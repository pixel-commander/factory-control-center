import type { UiProps, HouseKeyProps } from '../../../RAB.types'

export interface GridTableRowProps extends HouseKeyProps {
  [key: string]: unknown
}

export interface GridTableProps extends UiProps {
  data?: GridTableRowProps[],
  headers?: string[],
  labels?: Record<string, string>,
  container_ref?: React.RefObject<HTMLDivElement | null>,
  children?: React.ReactNode
}
