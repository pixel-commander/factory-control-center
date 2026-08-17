import './css/classrooms-list.css'
import { useState } from 'react'
import ListWidget from '../ListWidget/ListWidget'
import ClassroomElement from './ClassroomElement'
import { useApi } from '../../../hooks/useApi/useApi'
import type { RenderItemProps } from '../../../components/RenderItems/RenderItems.types'
import type { ClassroomsListProps } from './ClassroomsList.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this classrooms-list loop through data? if so, what is the item_class
 * 3. is there a container_class for this classrooms-list?
 **/

export const ClassroomsList = (props: ClassroomsListProps) => {
  const {
    items, selected, title, name, item_class, container_class, className,
    can_add, has_search, is_open, is_visible,
    handleClick, handleClickAddNew, handleToggle,
  } = props || {}

  const [word, setWord] = useState('')
  const [rows] = useApi<RenderItemProps[]>('/api/classroom')

  if (is_visible === false) return null

  const held = word.toLowerCase()
  const shown = (items && items.length ? items : rows || []).filter((row) => {
    if (!held) return true
    const words = `${row?.name || ''} ${row?.title || ''} ${row?.label || ''}`.toLowerCase()
    return words.includes(held)
  })

  const list_settings = {
    title: title || 'CLASSROOMS',
    items: shown,
    selected,
    name,
    item_class,
    container_class,
    className,
    can_add,
    has_search,
    is_open,
    query: word,
    Item: ClassroomElement,
    handleChange: (value: unknown) => setWord(String(value ?? '')),
    handleClick,
    handleClickAddNew,
    handleToggle,
  }

  return <ListWidget {...list_settings} />
}

export default ClassroomsList
