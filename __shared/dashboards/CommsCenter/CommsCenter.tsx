import './css/comms-center.css'
import type { CommsCenterProps } from './CommsCenter.types'
import { GridCell } from '../../components/GridCell/GridCell'


/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. what are the tabs (if any)
 * 3. is there a nav bar (if any)
 * 4. are there specific cell_classes for the grid areas
 **/

const CommsCenter = ({
  className,
  grid_type = 'sides',
 }: CommsCenterProps) => {
  className=`grid gap ${grid_type} ${className || ''}`.trim()

    return (
      <div className={className}>
        <GridCell cell_class='container-panel inset pad-xs' area='left'>
          <GridCell cell_class='container-panel'>ilef</GridCell>
        </GridCell>
        <GridCell has_padding can_scroll area='main'>main</GridCell>
        <GridCell cell_class='container-panel inset' has_padding can_scroll area='right'>right</GridCell>
      </div>
    )
}

export default CommsCenter
 