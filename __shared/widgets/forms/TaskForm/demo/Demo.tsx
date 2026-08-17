import { useState } from 'react'
import TaskForm from '../TaskForm'
import { GridCell } from '../../../../components/GridCell/GridCell'

export const Demo = () => {
  const [reported, setReported] = useState<Record<string, unknown>>()

  const form_settings = {
    handleSubmit: (value?: unknown) => setReported(value as Record<string, unknown>),
  }

  return (
    <div className='grid with-header with-footer'>
      <GridCell area='header'>Task Form</GridCell>
      <GridCell area='main' className='side-l'>
        <GridCell area='side'>
          <TaskForm {...form_settings} />
        </GridCell>
        <GridCell area='main'>
          {JSON.stringify(reported)}
        </GridCell>
      </GridCell>
      <GridCell area='footer'>v1</GridCell>
    </div>
  )
}

export default Demo
