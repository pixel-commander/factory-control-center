import '../list-item.css'

export const Demo = () => {
  return (
    <div className='grid with-header'>
      <div className='pad-sm'>list-item - the wrapper only; the inner grid is the shape's own css (second one wears is-selected)</div>
      <div className='grid'>
        <div className='list-item'>list-item</div>
        <div className='list-item is-selected'>list-item is-selected</div>
        <div className='list-item inset'>list-item inset</div>
        <div className='list-item float'>list-item float</div>
      </div>
    </div>
  )
}

export default Demo
