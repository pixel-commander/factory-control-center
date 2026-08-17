import { useState } from 'react'
import ListWidget from '../ListWidget/ListWidget'
import { GridCell } from '../../../components/GridCell/GridCell'
import type { RenderItemProps } from '../../../components/RenderItems/RenderItems.types'

const DEMO_ITEMS = [
  { id: 'north-line', label: 'North line survey' },
  { id: 'relay-swap', label: 'Relay swap - bay 4' },
  { id: 'permit-renewal', label: 'Permit renewal' },
  { id: 'signage-quote', label: 'Signage quote' },
  { id: 'client-walkthrough', label: 'Client walkthrough' },
]

export const Demo = () => {
  const [picked, setPicked] = useState<string>()
  const [word, setWord] = useState('')
  const [searched, setSearched] = useState<string>()
  const [add_presses, setAddPresses] = useState(0)

  const shown = DEMO_ITEMS.filter((item) =>
    String(item.label).toLowerCase().includes(word.toLowerCase())
  )

  const rows_settings = {
    title: 'ROWS',
    items: DEMO_ITEMS,
    selected: picked,
    has_search: false,
    can_add: false,
    handleClick: (item?: RenderItemProps) => setPicked(String(item?.id ?? '')),
  }

  const search_settings = {
    title: 'SEARCH + ADD',
    items: shown,
    selected: searched,
    query: word,
    handleChange: (value: unknown) => setWord(String(value ?? '')),
    handleClick: (item?: RenderItemProps) => setSearched(String(item?.id ?? '')),
    handleClickAddNew: () => setAddPresses((count) => count + 1),
  }

  return (
    <div className='grid'>

      <div className='grid with-header with-footer'>
        <GridCell area='header'>List Widget -- rows, click reports the item</GridCell>
        <GridCell area='main' className='side-l'>
          <GridCell area='side'>
            <ListWidget {...rows_settings} />
          </GridCell>
          <GridCell area='main'>
            {JSON.stringify({ picked })}
          </GridCell>
        </GridCell>
        <GridCell area='footer'>v1</GridCell>
      </div>

      <div className='grid with-header with-footer'>
        <GridCell area='header'>List Widget -- search + add</GridCell>
        <GridCell area='main' className='side-l'>
          <GridCell area='side'>
            <ListWidget {...search_settings} />
          </GridCell>
          <GridCell area='main'>
            {JSON.stringify({ word, searched, add_presses })}
          </GridCell>
        </GridCell>
        <GridCell area='footer'>v1</GridCell>
      </div>

    </div>
  )
}

export default Demo
