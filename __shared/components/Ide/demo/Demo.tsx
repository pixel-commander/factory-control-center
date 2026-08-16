import { useState } from 'react'
import { Ide } from '../Ide'
import { CodeViewer } from '../CodeViewer/CodeViewer'
import { CodeTabsWrapper } from '../CodeTabsWrapper'
import { FolderTree } from '../FolderTree/FolderTree'
import { IDE_FILES, IDE_REVIEW } from '../js/demo'

const TABS = [
  { id: 'ide', label: 'IDE' },
  { id: 'editor', label: 'EDITOR' },
  { id: 'code', label: 'CODE' },
  { id: 'tree', label: 'FOLDER TREE' },
]

const ONE = IDE_FILES.filter((one) => one?.id === 'f1')

export const Demo = () => {
  const [pane, setPane] = useState('ide')
  const [saved, setSaved] = useState('')
  const [held, setHeld] = useState('f1')
  const [reviewing, setReviewing] = useState(false)

  const wrote = (word: string) => () => setSaved(`${word} · ${new Date().toLocaleTimeString()}`)

  return (
    <div className="grid with-header ide-demo">
      <div data-area="header" className="ide-tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ide-tab ${pane === item.id ? 'is-selected' : ''}`.trim()}
            onClick={() => setPane(item.id)}
          >
            {item.label}
          </button>
        ))}
        <span className="ide-empty">
          {saved ? `WROTE ${saved}` : '⌘S saves · SHIFT+ALT+F formats · TAB indents'}
        </span>
      </div>

      <div data-area="main">
        {pane === 'ide' ? (
          <Ide items={IDE_FILES} selected="f1" handleSave={wrote('saved')} />
        ) : null}

        {pane === 'editor' ? (
          <CodeTabsWrapper
            items={IDE_FILES}
            selected="f1"
            can_diff
            text_alt={IDE_REVIEW}
            handleSave={wrote('saved')}
          />
        ) : null}

        {pane === 'code' ? (
          <div className="grid side-l ide">
            <div data-area="side" className="ide-file-tree container-main">
              <button
                type="button"
                className={reviewing ? 'button-solid' : 'button-ghost'}
                onClick={() => setReviewing(!reviewing)}
              >
                {reviewing ? 'DIFF · ON' : 'DIFF · OFF'}
              </button>
              <span className="ide-empty">{reviewing ? 'Card.tsx rewritten' : 'PLAIN · one file'}</span>
            </div>
            <CodeViewer
              area="main"
              items={ONE}
              selected="f1"
              can_diff={reviewing}
              text_alt={IDE_REVIEW}
              handleSave={wrote('Card.tsx')}
            />
          </div>
        ) : null}

        {pane === 'tree' ? (
          <div className="grid side-l ide">
            <div data-area="side" className="ide-file-tree container-main">
              <span className="ide-empty">HELD FILE</span>
              <span className="ide-empty">
                {String(IDE_FILES.filter((one) => one?.id === held)[0]?.path || '—')}
              </span>
            </div>
            <FolderTree
              area="main"
              items={IDE_FILES}
              selected={held}
              handleSelect={(id) => setHeld(String(id))}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Demo
