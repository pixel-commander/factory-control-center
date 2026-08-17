import { useState } from 'react'
import FormWidget from '../FormWidget/FormWidget'
import { GridCell } from '../../../components/GridCell/GridCell'

const DEMO_FIELDS = [
  { name: 'name', label: 'NAME', tab: 'INFO', is_required: true },
  { name: 'title', label: 'TITLE', tab: 'INFO' },
  { name: 'status', label: 'STATUS', type: 'select', tab: 'INFO', options: ['open', 'active', 'done'] },
  { name: 'date_due', label: 'DUE DATE', type: 'date', tab: 'INFO' },
  { name: 'details', label: 'DETAILS', type: 'textarea', tab: 'DETAILS' },
]

const DEMO_RECORD = { name: 'North line survey', title: 'Walk the north line', status: 'active' }

export const Demo = () => {
  const [added, setAdded] = useState<Record<string, unknown>>()
  const [edited, setEdited] = useState<Record<string, unknown>>()

  const add_settings = {
    title: 'NEW ITEM',
    items: DEMO_FIELDS,
    action: 'SAVE',
    handleSubmit: (value?: unknown) => setAdded(value as Record<string, unknown>),
  }

  const edit_settings = {
    title: 'EDIT ITEM',
    items: DEMO_FIELDS,
    item: DEMO_RECORD,
    action: 'UPDATE',
    handleSubmit: (value?: unknown) => setEdited(value as Record<string, unknown>),
  }

  return (
    <div className='grid'>

      <div className='grid with-header with-footer'>
        <GridCell area='header'>Form Widget -- add</GridCell>
        <GridCell area='main' className='side-l'>
          <GridCell area='side'>
            <FormWidget {...add_settings} />
          </GridCell>
          <GridCell area='main'>
            {JSON.stringify(added)}
          </GridCell>
        </GridCell>
        <GridCell area='footer'>v1</GridCell>
      </div>

      <div className='grid with-header with-footer'>
        <GridCell area='header'>Form Widget -- edit, seeded from a record</GridCell>
        <GridCell area='main' className='side-l'>
          <GridCell area='side'>
            <FormWidget {...edit_settings} />
          </GridCell>
          <GridCell area='main'>
            {JSON.stringify(edited)}
          </GridCell>
        </GridCell>
        <GridCell area='footer'>v1</GridCell>
      </div>

    </div>
  )
}

export default Demo
