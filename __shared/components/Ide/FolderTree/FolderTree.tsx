import { useState } from 'react'
import { langOf } from '../js/highlight'
import Folder from '../../../icons/indexed/Folder/Folder'
import FolderAlt from '../../../icons/indexed/FolderAlt/FolderAlt'
import FolderOpen from '../../../icons/indexed/FolderOpen/FolderOpen'
import ChevronDown from '../../../icons/indexed/ChevronDown/ChevronDown'
import Doc from '../../../icons/indexed/Doc/Doc'
import Paper from '../../../icons/indexed/Paper/Paper'
import Markdown from '../../../icons/indexed/Markdown/Markdown'
import type { FolderTreeProps, TreeLine } from './FolderTree.types'
import type { IdeFileProps } from '../Ide.types'
import '../css/ide.css'
import './css/folder-tree.css'
import './css/folder-tree-alt.css'

const defaults = { mode: 'panel', color: 'secondary', title: 'FILES', style_type: 'main' }

const STYLE_TYPE_ICONS = {
  main: { folder: Folder, folder_open: FolderOpen, caret: ChevronDown, file: Doc, file_md: Markdown },
  alt: { folder: FolderAlt, folder_open: FolderAlt, caret: ChevronDown, file: Paper, file_md: Markdown },
}

const isShut = (trail: string, expanded: Record<string, boolean>) => {
  if (!trail) return false
  return Object.keys(expanded).some((one) =>
    expanded[one] === false && (trail === one || trail.indexOf(`${one}/`) === 0))
}

const linesOf = (items: IdeFileProps[], expanded: Record<string, boolean>): TreeLine[] => {
  const out: TreeLine[] = []
  const seen: { [key: string]: boolean } = {}
  const sorted = items.slice().sort((a, b) =>
    String(a?.path || a?.name).localeCompare(String(b?.path || b?.name)))

  sorted.forEach((row) => {
    const parts = String(row?.path || row?.name || '').split('/').filter(Boolean)
    const name = parts.pop() || ''
    let trail = ''
    parts.forEach((part, depth) => {
      const parent = trail
      trail = trail ? `${trail}/${part}` : part
      if (!seen[trail]) {
        seen[trail] = true
        if (!isShut(parent, expanded)) out.push({ id: trail, kind: 'folder', name: part, depth })
      }
    })
    if (!isShut(trail, expanded)) {
      out.push({ id: String(row?.id ?? row?.path ?? name), kind: 'file', name, depth: parts.length, row })
    }
  })
  return out
}

export const FolderTree = (props: FolderTreeProps) => {
  const folder_tree_settings = { ...defaults, ...(props || {}) }
  const {
    mode, style_type, color, items, selected, expanded, title, area, className, is_visible,
    handleSelect, handleToggle,
  } = folder_tree_settings

  const [own_open, setOwnOpen] = useState<Record<string, boolean>>({})
  const open_map = expanded || own_open
  const icons = STYLE_TYPE_ICONS[String(style_type) as keyof typeof STYLE_TYPE_ICONS] || STYLE_TYPE_ICONS.main

  if (is_visible === false) return null

  const rows = (items || []) as IdeFileProps[]
  const lines = linesOf(rows, open_map)
  const dirty = rows.filter((one) => one?.is_dirty).length

  return (
    <div
      className={`container-main grid with-header ide-file-tree ${className || ''}`.trim()}
      data-mode={mode}
      data-style={style_type}
      data-color={color}
      data-area={area || undefined}
    >
      <div data-area="header" className="ide-file-tree__head">
        <span>{title}</span>
        <span className="ide-file-tree__count">
          {rows.length}{dirty ? ` · ${dirty} UNSAVED` : ''}
        </span>
      </div>

      <div data-area="main" className="ide-file-tree__rows">
        {lines.map((line) => {
          const is_open = open_map[line.id] !== false
          const lang = line.kind === 'file' ? langOf(line.name) : ''
          const dot = line.name.lastIndexOf('.')
          const stem = dot > 0 ? line.name.slice(0, dot) : line.name
          const end = dot > 0 ? line.name.slice(dot) : ''
          const line_class = [
            'ide-row',
            'ide-file-tree__row',
            line.kind === 'folder' ? 'is-folder' : `lang-${lang}`,
            is_open ? 'is-open' : '',
            line.row?.is_dirty ? 'is-dirty' : '',
          ].filter(Boolean).join(' ')
          return (
            <div
              key={`${line.kind}:${line.id}`}
              className={line_class}
              data-selected={line.kind === 'file' && String(selected ?? '') === line.id ? 'true' : undefined}
              onClick={() => {
                if (line.kind !== 'folder') { handleSelect?.(line.id); return }
                const next = { ...open_map, [line.id]: !is_open }
                setOwnOpen(next)
                handleToggle?.(!is_open)
              }}
            >
              <span className="ide-file-tree__lead">
                <span className="ide-file-tree__rails">
                  {Array.from({ length: line.depth }).map((_none, at) => (
                    <span key={at} className="ide-file-tree__rail" />
                  ))}
                </span>
                {line.kind === 'folder' ? (
                  <>
                    <span className="ide-file-tree__caret"><icons.caret /></span>
                    <span className="ide-file-tree__mark">{is_open ? <icons.folder_open /> : <icons.folder />}</span>
                  </>
                ) : (
                  <>
                    <span className="ide-file-tree__caret" />
                    <span className="ide-file-tree__mark">{lang === 'md' ? <icons.file_md /> : <icons.file />}</span>
                  </>
                )}
              </span>
              <span className="ide-row__label">{stem}<span className="ide-file-tree__ext">{end}</span></span>
              {line.row?.is_dirty ? <span className="ide-file-tree__flag">{'●'}</span> : <span />}
            </div>
          )
        })}
        {!lines.length ? <span className="ide-empty">NO FILES</span> : null}
      </div>
    </div>
  )
}

export default FolderTree
