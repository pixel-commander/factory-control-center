import '../list-item-heavy.css'

export const Demo = () => {
  return (
    <div className='grid with-header'>
      <div className='pad-sm'>list-item-heavy (second one wears is-selected)</div>
      <div className='grid'>
        <div className='list-item-heavy'>list-item-heavy</div>
        <div className='list-item-heavy is-selected'>list-item-heavy is-selected</div>
        <div className='list-item-heavy inset'>list-item-heavy inset</div>
        <div className='list-item-heavy float'>list-item-heavy float</div>
      </div>
    </div>
  )
}

export default Demo
