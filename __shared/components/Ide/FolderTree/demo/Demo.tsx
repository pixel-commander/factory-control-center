import { useState } from 'react'
import FolderTree from '../FolderTree'
import { IDE_FILES } from '../../js/demo'

export const Demo = () => {
  const [held, setHeld] = useState('f1')

  return (
    <FolderTree items={IDE_FILES} selected={held} handleSelect={(id) => setHeld(String(id))} />
  )
}

export default Demo
