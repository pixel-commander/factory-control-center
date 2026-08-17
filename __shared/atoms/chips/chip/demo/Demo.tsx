import '../chip.css'

const TONES = ['success', 'warning', 'error', 'idle']

export const Demo = () => {
  return (
    <div className='grid'>

      <div className='grid with-header'>
        <div className='pad-sm'>chip + chip-set (second chip wears is-selected)</div>
        <div className='chip-set'>
          <div className='chip'>site-visit</div>
          <div className='chip is-selected'>handover</div>
          <div className='chip'>inspection</div>
          <div className='chip add'>+ add</div>
        </div>
      </div>

      <div className='grid with-header'>
        <div className='pad-sm'>the tones, static (state, not selectable)</div>
        <div className='chip-set'>
          {TONES.map((tone) => (
            <div key={tone} className={`chip static ${tone}`}>{tone}</div>
          ))}
        </div>
      </div>

      <div className='grid with-header'>
        <div className='pad-sm'>chip counter - a count riding inside an item</div>
        <div className='chip-set'>
          <div className='chip counter'>3</div>
          <div className='chip counter success'>12</div>
          <div className='chip counter error'>99</div>
        </div>
      </div>

      <div className='grid with-header'>
        <div className='pad-sm'>chip-set wrap</div>
        <div className='chip-set wrap'>
          <div className='chip'>lighting</div>
          <div className='chip'>rewire</div>
          <div className='chip'>signage</div>
          <div className='chip'>survey</div>
          <div className='chip'>permit</div>
          <div className='chip'>relay</div>
          <div className='chip'>north-line</div>
          <div className='chip'>client-work</div>
        </div>
      </div>

    </div>
  )
}

export default Demo
