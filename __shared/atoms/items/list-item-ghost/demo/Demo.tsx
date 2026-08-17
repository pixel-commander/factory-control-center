import '../list-item-ghost.css'

export const Demo = () => {
  return (
    <div className='grid with-header'>
      <div className='pad-sm'>list-item-ghost (second one wears is-selected)</div>
      <div className='grid'>
        <div className='list-item-ghost'>list-item-ghost</div>
        <div className='list-item-ghost is-selected'>list-item-ghost is-selected</div>
        <div className='list-item-ghost inset'>list-item-ghost inset</div>
        <div className='list-item-ghost float'>list-item-ghost float</div>
      </div>
    </div>
  )
}

export default Demo
