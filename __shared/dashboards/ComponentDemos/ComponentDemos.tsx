import './css/component-demos.css'
import type { ComponentDemosProps } from './ComponentDemos.types'
import {GridCell} from '../../components/GridCell/GridCell'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. what are the tabs (if any)
 * 3. is there a nav bar (if any)
 * 4. are there specific cell_classes for the grid areas
 **/

const ComponentDemos = ({
  className,
  grid_type = 'side-l',
 }: ComponentDemosProps) => {
  className=`grid ${grid_type} ${className || ''}`.trim()

  return (
    <div className={className}>
      <GridCell area='side' has_padding={true}>side</GridCell>
      <GridCell area='main' has_padding={true}>main</GridCell>
    </div>
  )
}

export default ComponentDemos
 