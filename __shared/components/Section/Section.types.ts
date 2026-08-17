import type { UiProps } from '../../../RAB.types'

export interface SectionProps extends UiProps {
  area?: string,
  can_scroll?: boolean,
  container_ref?: React.RefObject<HTMLDivElement | null>,
  children?: React.ReactNode
}
