import { useMemo, useState } from 'react'
import { CodeViewer, codeDiffCount } from './CodeViewer/CodeViewer'
import { diffLines } from './js/diff'
import type { CodeTabsWrapperProps, CodeHandle, CodeProblem, CodeReport, IdeFileProps } from './Ide.types'
import './css/ide.css'

const defaults = { mode: 'well', color: 'secondary' }

const NO_STATE: CodeReport = {
  problems: [],
  line: 1,
  lines: 1,
  lang: 'txt',
  is_dirty: false,
  saved_at: '',
}

export const CodeTabsWrapper = (props: CodeTabsWrapperProps) => {
  const code_tabs_wrapper_settings = { ...defaults, ...(props || {}) }
  const {
    mode, color, items, selected, can_diff, text_alt, area, className, is_visible,
    handleSelect, handleChange, handleSave, handleInsert, handleRemove,
  } = code_tabs_wrapper_settings

  const [code, setCode] = useState<CodeHandle | null>(null)
  const [state, setState] = useState(NO_STATE)
  const [tab, setTab] = useState('')

  const rows = (items || []) as IdeFileProps[]
  const file = rows.filter((one) => String(one?.id) === String(selected ?? ''))[0] || rows[0]
  const id = String(file?.id ?? '')

  const incoming = String(text_alt ?? file?.text_alt ?? '')
  const shows_diff = !!can_diff && !!incoming
  const in_review = shows_diff && tab === 'diff'

  const tally = useMemo(
    () => (shows_diff
      ? codeDiffCount(diffLines(String(file?.text ?? ''), incoming))
      : { added: 0, removed: 0 }),
    [shows_diff, file?.text, incoming],
  )

  if (is_visible === false) return null

  const problems = state?.problems || []

  return (
    <div
      className={`container-main grid with-header with-footer ide-code ${className || ''}`.trim()}
      data-mode={mode}
      data-color={color}
      data-area={area || undefined}
    >
      <div data-area="header" className="ide-code__head">
        <div className="ide-tabs">
          {rows.map((one) => {
            const one_id = String(one?.id ?? '')
            const is_on = !in_review && one_id === id
            return (
              <button
                key={one_id}
                type="button"
                className={`ide-tab ${is_on ? 'is-selected' : ''} ${one?.is_dirty ? 'is-blocked' : ''}`.trim()}
                onClick={() => { setTab(''); handleSelect?.(one_id) }}
              >
                {one?.name}
                {handleRemove ? (
                  <span
                    className="ide-tab__shut"
                    onClick={(event) => { event.stopPropagation(); handleRemove?.(one_id) }}
                  >
                    {'✕'}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
        {shows_diff ? (
          <div className="ide-tabs ide-code__review-tab">
            <button
              type="button"
              className={`ide-tab is-review ${in_review ? 'is-selected' : ''}`.trim()}
              onClick={() => setTab('diff')}
            >
              {`DIFF +${tally.added} -${tally.removed}`}
            </button>
          </div>
        ) : null}
      </div>

      <div data-area="main">
        <CodeViewer
          items={rows}
          selected={id}
          can_diff={in_review}
          text_alt={incoming}
          handleChange={handleChange}
          handleSave={handleSave}
          handleReport={setState}
          code_ref={setCode}
        />
      </div>

      <div data-area="footer" className="ide-code__foot">
        <div className={`ide-code__problems ${problems.length ? '' : 'is-hidden'}`}>
          {problems.map((one: CodeProblem, index: number) => (
            <div key={index} className="ide-row ide-code__problem" onClick={() => code?.goTo(one.line)}>
              <span className="ide-code__at">{one.line}:{one.column}</span>
              <span className="ide-row__label">{one.message}</span>
              <span />
            </div>
          ))}
        </div>

        <div className="ide-code__tools">
          <span className="ide-code__path">
            {String(file?.path || file?.name || '—')}
            {state?.is_dirty ? <span className="ide-code__dirty"> {'●'}</span> : null}
          </span>

          {in_review ? (
            <>
              <button
                type="button"
                className="button-solid ide-code__button"
                onClick={() => { setTab(''); handleInsert?.(incoming) }}
              >
                KEEP
              </button>
              <button type="button" className="button-ghost ide-code__button" onClick={() => setTab('')}>
                DISCARD
              </button>
            </>
          ) : (
            <>
              <button type="button" className="button-ghost ide-code__button" onClick={() => code?.format()}>
                FORMAT
              </button>
              <button
                type="button"
                className="button-solid ide-code__button"
                disabled={!!problems.length}
                onClick={() => code?.save()}
              >
                SAVE
              </button>
            </>
          )}

          <span className={`ide-code__state ${problems.length ? 'is-blocked' : state?.saved_at ? 'is-active' : ''}`.trim()}>
            {problems.length
              ? `${problems.length} PROBLEM${problems.length > 1 ? 'S' : ''} · SAVE BLOCKED`
              : state?.saved_at
                ? `SAVED ${state.saved_at}`
                : `${String(state?.lang || '').toUpperCase()} · LN ${state?.line} · ${state?.lines} LINES`}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CodeTabsWrapper
