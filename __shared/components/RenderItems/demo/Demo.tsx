import { useState } from 'react'
import { RenderItems } from '../RenderItems'
import type { RenderItemProps } from '../RenderItems.types'

const LINES: RenderItemProps[] = [
  { id: 1, label: 'Line 1', name: 'running', description: 'bottling', mark: '●', color: 'success', rate: 412 },
  { id: 2, label: 'Line 2', name: 'idle', description: 'awaiting stock', mark: '●', color: 'muted', rate: 0 },
  { id: 3, label: 'Line 3', name: 'changeover', description: 'sku 44 → 51', mark: '●', color: 'warning', rate: 96 },
  { id: 4, label: 'Line 4', name: 'down', description: 'gearbox fault', mark: '●', color: 'error', rate: 0 },
  { id: 5, label: 'Line 5', name: 'running', description: 'labelling', mark: '●', color: 'success', rate: 388 },
  { id: 6, label: 'Line 6', name: 'running', description: 'palletising', mark: '●', color: 'success', rate: 275 },
]

const SHIFTS: RenderItemProps[] = [
  { id: 'a', label: 'A shift', description: '06:00 – 14:00' },
  { id: 'b', label: 'B shift', description: '14:00 – 22:00' },
  { id: 'c', label: 'C shift', description: '22:00 – 06:00' },
]

const LineItem = (props?: RenderItemProps) => {
  const { label, name, description, mark, rate } = props || {}
  return (
    <>
      <span>{String(mark || '')} {String(label || 'n/a')}</span>
      <span>{String(name || '')}</span>
      <span>{String(description || '')}</span>
      <span>{String(rate || 0)}/hr</span>
    </>
  )
}

const ShiftItem = (props?: RenderItemProps) => {
  const { label, description } = props || {}
  return <span>{String(label || 'n/a')} — {String(description || '')}</span>
}

export const Demo = () => {
  const [line, setLine] = useState<string | number>(3)
  const [shift, setShift] = useState<string | number>('b')

  const lines_settings = {
    items: LINES,
    selected: line,
    item_class: 'container-panel is-row',
    Item: LineItem,
    handleClick: (item?: RenderItemProps) => setLine(item?.id || '')
  }

  const shifts_settings = {
    items: SHIFTS,
    selected: shift,
    container_class: 'is-horizontal',
    item_class: 'button-ghost',
    Item: ShiftItem,
    handleClick: (item?: RenderItemProps) => setShift(item?.id || '')
  }

  return (
    <div className='grid with-header'>
      <div className='pad-sm'>RenderItems — line {String(line)}, shift {String(shift)}</div>

      <div className='grid'>
        <RenderItems {...shifts_settings} />
        <RenderItems {...lines_settings} />
      </div>
    </div>
  )
}

export default Demo
