import { useState } from 'react'
import ListWidget from '../ListWidget/ListWidget'
import AppointmentsList from '../AppointmentsList/AppointmentsList'
import ProjectsList from '../ProjectsList/ProjectsList'
import TasksList from '../TasksList/TasksList'
import TodosList from '../TodosList/TodosList'
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
  const [row, setRow] = useState<RenderItemProps>()

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

  const live_settings = {
    name: 'live-lists',
    is_open: false,
    selected: String(row?.id ?? ''),
    handleClick: (item?: RenderItemProps) => setRow(item),
  }

  const first_settings = { ...live_settings, is_open: true }

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

      <div className='grid with-header with-footer'>
        <GridCell area='header'>The domain lists -- live from the db, one open at a time</GridCell>
        <GridCell area='main' className='side-l'>
          <GridCell area='side'>
            <AppointmentsList {...first_settings} />
            <ProjectsList {...live_settings} />
            <TasksList {...live_settings} />
            <TodosList {...live_settings} />
          </GridCell>
          <GridCell area='main'>
            {JSON.stringify(row)}
          </GridCell>
        </GridCell>
        <GridCell area='footer'>v1</GridCell>
      </div>

    </div>
  )
}

export default Demo
