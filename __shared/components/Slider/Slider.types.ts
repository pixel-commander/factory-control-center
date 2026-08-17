import type { UiProps } from '../../../RAB.types'

export interface SliderProps extends UiProps {
  value?: number,
  min?: number,
  max?: number,
  step?: number,
  threshold?: number,
  container_ref?: React.RefObject<HTMLLabelElement | null>
}
