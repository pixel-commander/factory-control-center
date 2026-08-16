export interface NavItemProps {
  id: string,
  label: string,
  slug?: string,
  path: string,
  is_selected?: boolean,
  handleClick?: (x?: NavItemProps) => void
}

export interface NavProps {
  className?: string,
  handleClick?: (x?: NavItemProps) => void,
  nav_items: NavItemProps[],
  container_class?: string,
  item_class?: string,
  selected?: string | number,
  is_vertical?: boolean,
  container_ref?: React.RefObject<HTMLElement>
}
