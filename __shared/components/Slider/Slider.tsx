import './css/slider.css'
import type { SliderProps } from './Slider.types'

export const Slider = ({
  className,
  container_class = '',
  label,
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  threshold,
  is_disabled,
  is_visible,
  container_ref,
  handleChange
}: SliderProps) => {

  if (is_visible === false) return null

  const low = Number(min) || 0
  const high = Number(max) || 100
  const grain = Number(step) || 1
  const held = Number(value) || 0
  const span = high - low || 1
  const pct = ((held - low) / span) * 100
  const over = typeof threshold === 'number' && held >= threshold

  let slider_class = `slider ${container_class || ''} ${className || ''}`.trim()
  if (over) slider_class += ' is-over'
  if (is_disabled) slider_class += ' is-disabled'

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange?.(Number(e?.target?.value) || 0)
  }

  return (
    <label className={slider_class} ref={container_ref}>
      <span className='slider-head'>
        <span className='slider-label'>{label || ''}</span>
        <span className='slider-value'>{held}</span>
      </span>

      <span className='slider-rail'>
        <span className='slider-fill' style={{ width: `${pct}%` }} />
        {typeof threshold === 'number' ? (
          <span className='slider-tick' style={{ left: `${((threshold - low) / span) * 100}%` }} />
        ) : null}
        <input
          className='slider-input'
          type='range'
          min={low}
          max={high}
          step={grain}
          value={held}
          disabled={is_disabled}
          onChange={handleInput}
        />
      </span>
    </label>
  )
}

export default Slider
