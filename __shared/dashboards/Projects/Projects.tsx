import './css/projects.css'
import type { ProjectsProps } from './Projects.types'
import { GridCell } from '../../components/GridCell/GridCell'


/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. what are the tabs (if any)
 * 3. is there a nav bar (if any)
 * 4. are there specific cell_classes for the grid areas
 **/

const Projects = ({
  className,
  grid_type = 'sides',
 }: ProjectsProps) => {
  className=`grid ${grid_type} ${className || ''}`.trim()

    return (
      <div className={className}>
        <GridCell area='left'>left</GridCell>
        <GridCell area='main'>main</GridCell>
        <GridCell area='right'>right</GridCell>
      </div>
    )
}

export default Projects
 