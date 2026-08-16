import React, { useEffect, useMemo, useRef, useState } from 'react'
import { highlight, langOf } from '../js/highlight'
import { check, format } from '../js/lint'
import { diffLines, diffCount, withContext } from '../js/diff'
import type { CodeViewerProps } from './CodeViewer.types'
import type { CodeHandle, IdeFileProps, ReactKeyEvent, ReactPasteEvent } from '../Ide.types'
import '../css/ide.css'
import './css/code-viewer.css'

const CLOSERS: { [key: string]: string } = { '{': '}', '(': ')', '[': ']', "'": "'", '"': '"', '`': '`' }

const rowsHtml = (text: string, lang: string) =>
  String(text ?? '').split('\n').map((line, index) => {
    const no = index + 1
    return `<span class="ide-code__num" data-row="${no}" contenteditable="false">${no}</span>` +
      `<div class="ide-code__line" data-row="${no}">${highlight(line, lang) || '<br>'}</div>`
  }).join('')

const cellsOf = (root: HTMLElement | null): HTMLElement[] =>
  root ? Array.prototype.slice.call(root.querySelectorAll('.ide-code__line')) : []

const textOf = (root: HTMLElement | null) =>
  cellsOf(root).map((cell) => String(cell.textContent || '').replace(/ /g, ' ')).join('\n')

const caretOf = (root: HTMLElement | null) => {
  const sel = window.getSelection()
  if (!root || !sel || !sel.rangeCount) return null
  const range = sel.getRangeAt(0)
  const cells = cellsOf(root)
  let at = 0
  for (let n = 0; n < cells.length; n += 1) {
    const cell = cells[n]
    if (cell === range.startContainer || cell.contains(range.startContainer)) {
      const before = document.createRange()
      before.selectNodeContents(cell)
      before.setEnd(range.startContainer, range.startOffset)
      return at + String(before.toString()).length
    }
    at += String(cell.textContent || '').length + 1
  }
  return null
}

const placeCaret = (root: HTMLElement | null, at: number | null) => {
  if (!root || at === null) return
  const cells = cellsOf(root)
  let left = at
  for (let n = 0; n < cells.length; n += 1) {
    const cell = cells[n]
    const len = String(cell.textContent || '').length
    if (left <= len) {
      const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT)
      const range = document.createRange()
      let node = walker.nextNode()
      let seen = 0
      while (node) {
        const size = String(node.textContent || '').length
        if (seen + size >= left) {
          range.setStart(node, left - seen)
          range.collapse(true)
          const sel = window.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(range)
          return
        }
        seen += size
        node = walker.nextNode()
      }
      range.selectNodeContents(cell)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
      return
    }
    left -= len + 1
  }
}

export const CodeViewer = (props: CodeViewerProps) => {
  const code_viewer_settings = { ...(props || {}) }
  const {
    items, selected, can_diff, text_alt, area, className, is_visible,
    handleChange, handleSave, handleReport, code_ref,
  } = code_viewer_settings

  const rows = (items || []) as IdeFileProps[]
  const file = rows.filter((one) => String(one?.id) === String(selected ?? ''))[0] || rows[0]
  const id = String(file?.id ?? '')
  const lang = String(file?.lang || langOf(String(file?.path || file?.name || '')))

  const sheet = useRef<HTMLDivElement>(null)
  const history = useRef<{ text: string; at: number | null }[]>([])
  const undone = useRef<{ text: string; at: number | null }[]>([])
  const kept = useRef<string>(String(file?.text ?? ''))

  const [held, setHeld] = useState<string>(String(file?.text ?? ''))
  const [saved_at, setSavedAt] = useState<string>('')
  const [line, setLine] = useState(1)

  const problems = useMemo(() => check(held, lang), [held, lang])
  const is_dirty = held !== kept.current

  useEffect(() => {
    const text = String(file?.text ?? '')
    kept.current = text
    history.current = []
    undone.current = []
    setHeld(text)
    setSavedAt('')
    if (sheet.current) sheet.current.innerHTML = rowsHtml(text, lang)
  }, [id])

  useEffect(() => {
    const bad: { [key: number]: boolean } = {}
    problems.forEach((one) => { bad[one.line] = true })
    const nums = sheet.current ? sheet.current.querySelectorAll('.ide-code__num') : []
    Array.prototype.forEach.call(nums, (num: HTMLElement) => {
      const no = Number(num.getAttribute('data-row'))
      num.classList.toggle('is-blocked', !!bad[no])
      num.classList.toggle('is-active', no === line)
    })
  }, [held, line, problems.length])

  useEffect(() => {
    handleReport?.({
      problems, line, lines: held.split('\n').length, lang, is_dirty, saved_at,
    })
  }, [problems, line, held, lang, is_dirty, saved_at])

  const settle = (next?: string, at?: number | null) => {
    const node = sheet.current
    if (!node) return
    const text = next === undefined ? textOf(node) : next
    const caret = at === undefined ? caretOf(node) : at
    node.innerHTML = rowsHtml(text, lang)
    placeCaret(node, caret)
    setHeld(text)
    setLine(text.slice(0, Math.max(0, caret ?? 0)).split('\n').length)
    setSavedAt('')
    handleChange?.(text)
  }

  const remember = () => {
    history.current = history.current
      .concat([{ text: textOf(sheet.current), at: caretOf(sheet.current) }]).slice(-200)
    undone.current = []
  }

  const put = (text: string, at: number | null) => { remember(); settle(text, at) }

  const step = (back: boolean) => {
    const from = back ? history.current : undone.current
    const last = from[from.length - 1]
    if (!last) return
    const now = { text: textOf(sheet.current), at: caretOf(sheet.current) }
    if (back) { undone.current.push(now); history.current = from.slice(0, -1) }
    else { history.current.push(now); undone.current = from.slice(0, -1) }
    settle(last.text, last.at)
  }

  const save = () => {
    const text = textOf(sheet.current)
    if (check(text, lang).length) return
    kept.current = text
    setHeld(text)
    setSavedAt(new Date().toLocaleTimeString())
    handleSave?.(text)
  }

  const tidy = () => put(format(textOf(sheet.current), lang), caretOf(sheet.current))

  const goTo = (row: number) => {
    const text = textOf(sheet.current)
    const at = text.split('\n').slice(0, row - 1).join('\n').length + (row > 1 ? 1 : 0)
    sheet.current?.focus()
    placeCaret(sheet.current, at)
    setLine(row)
  }

  useEffect(() => {
    code_ref?.({ save, format: tidy, goTo, text: () => textOf(sheet.current) } as CodeHandle)
    return () => code_ref?.(null)
  }, [id, lang])

  const handleKeyDown = (event: ReactKeyEvent) => {
    const node = sheet.current
    if (!node) return
    const cmd = event.metaKey || event.ctrlKey
    const text = textOf(node)
    const at = caretOf(node) ?? 0
    const sel = window.getSelection()
    const spread = !!sel && !sel.isCollapsed

    if (cmd && event.key.toLowerCase() === 's') { event.preventDefault(); save(); return }
    if (cmd && event.key.toLowerCase() === 'z') { event.preventDefault(); step(!event.shiftKey); return }
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'f') { event.preventDefault(); tidy(); return }

    if (event.key === 'Tab') {
      event.preventDefault()
      if (!spread) { put(`${text.slice(0, at)}  ${text.slice(at)}`, at + 2); return }
      const to = at + String(sel?.toString() || '').length
      const head = text.lastIndexOf('\n', at - 1) + 1
      const block = text.slice(head, to)
      const moved = event.shiftKey ? block.replace(/^ {1,2}/gm, '') : block.replace(/^/gm, '  ')
      put(`${text.slice(0, head)}${moved}${text.slice(to)}`, head + moved.length)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const head = text.lastIndexOf('\n', at - 1) + 1
      const pad = (/^[ \t]*/.exec(text.slice(head, at)) || [''])[0]
      const opens = /[{([]$/.test(text.slice(0, at).trim())
      const insert = opens ? `\n${pad}  ` : `\n${pad}`
      put(`${text.slice(0, at)}${insert}${text.slice(at)}`, at + insert.length)
      return
    }

    if (CLOSERS[event.key] && spread) {
      event.preventDefault()
      const inner = String(sel?.toString() || '')
      const to = at + inner.length
      put(`${text.slice(0, at)}${event.key}${inner}${CLOSERS[event.key]}${text.slice(to)}`, at + inner.length + 2)
    }
  }

  const handlePaste = (event: ReactPasteEvent) => {
    event.preventDefault()
    const said = String(event.clipboardData?.getData('text/plain') || '')
    const text = textOf(sheet.current)
    const at = caretOf(sheet.current) ?? 0
    const sel = window.getSelection()
    const to = at + String(sel && !sel.isCollapsed ? sel.toString() : '').length
    put(`${text.slice(0, at)}${said}${text.slice(to)}`, at + said.length)
  }

  const incoming = String(text_alt ?? file?.text_alt ?? '')
  const in_review = !!can_diff && !!incoming
  const changes = useMemo(
    () => (can_diff && incoming ? diffLines(held, incoming) : []), [can_diff, incoming, held])
  const shown = useMemo(() => withContext(changes), [changes])

  if (is_visible === false) return null

  return (
    <div className={`ide-code ide-code__body ${className || ''}`.trim()} data-area={area || undefined}>
      <div className={`ide-code__diff ${in_review ? '' : 'is-hidden'}`}>
        {shown.map((row, index) => (
          row.kind === 'gap' ? (
            <div key={index} className="ide-code__diff-gap">
              {row.count} UNCHANGED LINES
            </div>
          ) : (
            <React.Fragment key={index}>
              <span className="ide-code__diff-no">{row.left_no ?? ''}</span>
              <span
                className={`ide-code__diff-line ${row.kind === 'del' ? 'is-removed' : row.left === null ? 'is-empty' : ''}`}
                dangerouslySetInnerHTML={{ __html: highlight(String(row.left ?? ''), lang) || '&nbsp;' }}
              />
              <span className="ide-code__diff-no">{row.right_no ?? ''}</span>
              <span
                className={`ide-code__diff-line is-right ${row.kind === 'add' ? 'is-added' : row.right === null ? 'is-empty' : ''}`}
                dangerouslySetInnerHTML={{ __html: highlight(String(row.right ?? ''), lang) || '&nbsp;' }}
              />
            </React.Fragment>
          )
        ))}
      </div>

      <div
        ref={sheet}
        className={`ide-code__sheet ${in_review ? 'is-hidden' : ''}`}
        contentEditable
        spellCheck={false}
        suppressContentEditableWarning
        onInput={() => { remember(); settle() }}
        onKeyDown={handleKeyDown}
        onKeyUp={() => { const at = caretOf(sheet.current); if (at !== null) setLine(textOf(sheet.current).slice(0, at).split('\n').length) }}
        onClick={() => { const at = caretOf(sheet.current); if (at !== null) setLine(textOf(sheet.current).slice(0, at).split('\n').length) }}
        onPaste={handlePaste}
      />
    </div>
  )
}

export const codeDiffCount = diffCount

export default CodeViewer
