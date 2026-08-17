export interface GridCellProps {
  className?: string,
  area?: string,
  children?: React.ReactNode,
  cell_class?: string,
  has_padding?: boolean,
  can_scroll?: boolean,
  container_ref?: React.RefObject<HTMLDivElement>
}
