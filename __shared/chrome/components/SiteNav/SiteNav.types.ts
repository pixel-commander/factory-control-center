
export interface SiteNavItemProps {
  id: string,
  label: string,
  slug?: string,
  path: string,
  is_selected?: boolean,
  handleClick?: (x?: SiteNavItemProps) => void
}

export interface SiteNavProps {
 
  className?: string,
  handleClick?: (x?: SiteNavItemProps) => void,
  nav_items: SiteNavItemProps[],
  container_class?: string,
  item_class?: string
  selected?: string | number,
  is_vertical?: boolean
}
