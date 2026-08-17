import { useState } from 'react'
import ListWidget from '../ListWidget'
import { GridCell } from '../../../../components/GridCell/GridCell'
import type { RenderItemProps } from '../../../../components/RenderItems/RenderItems.types'

const DEMO_ITEMS = [
  { id: 'north-line', label: 'North line survey' },
  { id: 'relay-swap', label: 'Relay swap - bay 4' },
  { id: 'permit-renewal', label: 'Permit renewal' },
  { id: 'signage-quote', label: 'Signage quote' },
  { id: 'client-walkthrough', label: 'Client walkthrough' },
]

export const Demo = () => {
  const [word, setWord] = useState('')
  const [picked, setPicked] = useState<string>()
  const [add_presses, setAddPresses] = useState(0)

  const shown = DEMO_ITEMS.filter((item) =>
    String(item.label).toLowerCase().includes(word.toLowerCase())
  )

  const list_settings = {
    title: 'PROJECTS',
    items: shown,
    selected: picked,
    query: word,
    handleChange: (value: unknown) => setWord(String(value ?? '')),
    handleClick: (item?: RenderItemProps) => setPicked(String(item?.id ?? '')),
    handleClickAddNew: () => setAddPresses((count) => count + 1),
  }

  return (
    <div className='grid with-header with-footer'>
      <GridCell area='header'>List Widget</GridCell>
      <GridCell area='main' className='side-l'>
        <GridCell area='side'>
          <ListWidget {...list_settings} />
        </GridCell>
        <GridCell area='main'>
          {JSON.stringify({ word, picked, add_presses })}
        </GridCell>
      </GridCell>
      <GridCell area='footer'>v1</GridCell>
    </div>
  )
}

export default Demo
