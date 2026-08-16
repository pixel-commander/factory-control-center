import { useState } from 'react'
import { FolderTree } from './FolderTree/FolderTree'
import { CodeTabsWrapper } from './CodeTabsWrapper'
import type { IdeProps, IdeFileProps } from './Ide.types'
import './css/ide.css'

const defaults = { color: 'secondary' }

export const Ide = (props: IdeProps) => {
  const ide_settings = { ...defaults, ...(props || {}) }
  const { mode, style_type, color, items, selected, area, className, is_visible, handleSave } = ide_settings

  const rows = (items || []) as IdeFileProps[]
  const [files, setFiles] = useState<IdeFileProps[]>(rows)
  const [held, setHeld] = useState<string>(String(selected ?? rows[0]?.id ?? ''))
  const [paths, setPaths] = useState<string[]>([String(selected ?? rows[0]?.id ?? '')].filter(Boolean))

  if (is_visible === false) return null

  const pick = (value: unknown) => {
    const word = String(value ?? '')
    setHeld(word)
    if (paths.indexOf(word) < 0) setPaths(paths.concat([word]))
  }

  const shut = (value: unknown) => {
    const word = String(value ?? '')
    const left = paths.filter((one) => one !== word)
    setPaths(left)
    if (held === word) setHeld(left[left.length - 1] || '')
  }

  const write = (value?: unknown) => {
    const text = String(value ?? '')
    setFiles(files.map((one) => (String(one?.id) === held ? { ...one, text } : one)))
    handleSave?.(text)
  }

  return (
    <div
      className={`ide grid side-l ${className || ''}`.trim()}
      data-area={area || undefined}
    >
      <FolderTree
        area="side"
        mode={mode || 'panel'}
        style_type={style_type}
        color={color}
        items={files}
        selected={held}
        handleSelect={pick}
      />
      <CodeTabsWrapper
        area="main"
        mode={mode || 'well'}
        color={color}
        items={files.filter((one) => paths.indexOf(String(one?.id)) > -1)}
        selected={held}
        handleSelect={pick}
        handleRemove={shut}
        handleSave={write}
      />
    </div>
  )
}

export default Ide
