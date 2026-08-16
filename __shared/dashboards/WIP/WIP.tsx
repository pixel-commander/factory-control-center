import './css/wip.css'
import type { WIPProps } from './WIP.types'


/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. what are the tabs (if any)
 * 3. is there a nav bar (if any)
 * 4. are there specific cell_classes for the grid areas
 **/

const WIP = ({
  className,
  grid_type = 'holy-grail',
 }: WIPProps) => {
  className=`grid ${grid_type} ${className || ''}`.trim()

    return <div className={className}>WIP</div>
}

export default WIP
 