import './css/grid-cell.css'
import type { GridCellProps } from './GridCell.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this grid-cell loop through data? if so, what is the item_class
 * 3. is there a container_class for this grid-cell?
 **/

export const GridCell = ({ 
  className,
  area,
  has_padding,
  children,
  container_ref,
  cell_class
 }: GridCellProps) => {
  className=`grid  ${className || ''} ${cell_class || ''}`.trim()

  const cell_settings = {
    className: className,
    'data-area': area,
    ref: container_ref
  }

  let Cell = children

  if (has_padding) {
    Cell = <div className='pad grid'>{Cell}</div>
  }

  return <div {...cell_settings}>{Cell}</div>

}

export default GridCell
 