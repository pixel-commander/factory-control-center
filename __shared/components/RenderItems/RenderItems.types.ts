import type { HouseKeyProps } from '../../../RAB.types'

export interface RenderItemProps extends HouseKeyProps {
  is_selected?: boolean,
  [key: string]: unknown
}

export interface RenderItemsProps {
  className?: string,
  items?: RenderItemProps[],
  selected?: string | number,
  container_class?: string,
  item_class?: string,
  Item?: (x?: RenderItemProps) => React.JSX.Element,
  container_ref?: React.RefObject<HTMLDivElement | null>,
  handleClick?: (x?: RenderItemProps) => void,
  children?: React.ReactNode
}
