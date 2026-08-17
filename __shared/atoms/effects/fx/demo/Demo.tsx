import '../fx.css'

const EFFECTS = [
  'fx-scanlines', 'fx-grid', 'fx-ribbed', 'fx-vignette', 'fx-sheen',
  'fx-glow-pulse', 'fx-flicker', 'fx-blink', 'fx-corner-ticks',
]

export const Demo = () => {
  return (
    <div className='grid with-header'>
      <div className='pad-sm'>fx - stack any of these onto a container, cosmetic only</div>
      <div className='grid'>
        {EFFECTS.map((effect) => (
          <div key={effect} className={`container-cell pad-sm ${effect}`}>
            {effect}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Demo
