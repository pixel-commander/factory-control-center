import { useState } from 'react'
import TodosList from '../TodosList'
import { GridCell } from '../../../../components/GridCell/GridCell'
import type { RenderItemProps } from '../../../../components/RenderItems/RenderItems.types'

export const Demo = () => {
  const [picked, setPicked] = useState<RenderItemProps>()

  const list_settings = {
    handleClick: (item?: RenderItemProps) => setPicked(item),
    selected: String(picked?.id ?? ''),
  }

  return (
    <div className='grid with-header with-footer'>
      <GridCell area='header'>Todos List - live from the db</GridCell>
      <GridCell area='main' className='side-l'>
        <GridCell area='side'>
          <TodosList {...list_settings} />
        </GridCell>
        <GridCell area='main'>
          {JSON.stringify(picked)}
        </GridCell>
      </GridCell>
      <GridCell area='footer'>v1</GridCell>
    </div>
  )
}

export default Demo
