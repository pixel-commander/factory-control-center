import { useState } from 'react'
import CodeViewer from '../CodeViewer'
import { IDE_FILES, IDE_REVIEW } from '../../js/demo'

const ONE = IDE_FILES.filter((one) => one?.id === 'f1')

export const Demo = () => {
  const [reviewing, setReviewing] = useState(false)

  return (
    <div className="grid with-header ide-demo">
      <div data-area="header">
        <button
          type="button"
          className={reviewing ? 'button-solid' : 'button-ghost'}
          onClick={() => setReviewing(!reviewing)}
        >
          {reviewing ? 'DIFF · ON' : 'DIFF · OFF'}
        </button>
      </div>
      <CodeViewer
        area="main"
        items={ONE}
        selected="f1"
        can_diff={reviewing}
        text_alt={IDE_REVIEW}
      />
    </div>
  )
}

export default Demo
