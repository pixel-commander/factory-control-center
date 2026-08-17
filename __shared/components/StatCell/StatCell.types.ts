import type { UiProps } from '../../../RAB.types'

export interface StatCellProps extends UiProps {
  value?: React.ReactNode | number | string,
  container_ref?: React.RefObject<HTMLDivElement | null>,
  children?: React.ReactNode
}
