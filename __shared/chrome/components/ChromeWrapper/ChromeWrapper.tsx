import './css/chrome-wrapper.css'
import type { ChromeWrapperProps } from './ChromeWrapper.types'
import { RAILS, TRIMS, CORNERS } from './js/hardware'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this chrome-wrapper loop through data? if so, what is the item_class
 * 3. is there a container_class for this chrome-wrapper?
 **/

/**
 * THE CASE THE APP SITS IN. Wrap anything: <ChromeWrapper>{site}</ChromeWrapper>.
 *
 * The rails, trim, arcs and rivets are absolutely placed siblings BEFORE the
 * body; the children land in .chrome-wrapper-body, which is a plain grid cell.
 *
 * IT HAS NO HEIGHT OF ITS OWN. Give it one -- the wrapper is `position:
 * relative` and everything inside it is absolute, so with no height it collapses
 * to nothing and takes the site with it.
 *
 * Every position is a PERCENTAGE from js/hardware.ts, because the rails are the
 * only part whose height is unknown. That is also why the original painted them
 * on a canvas; percentages do the same job with no canvas and no resize listener.
 */
export const ChromeWrapper = ({
  className,
  wrapper_class = '',
  body_class = '',
  has_rails = true,
  container_ref,
  children
}: ChromeWrapperProps) => {

  className = `chrome-wrapper ${wrapper_class || ''} ${className || ''}`.trim()
  if (!has_rails) className += ' no-rails'

  return (
    <div className={className} ref={container_ref}>

      {has_rails && RAILS?.map((rail, i) => {
        const { side, tubes, joints, leds } = rail || {}
        return (
          <span key={side || i} className={`chrome-wrapper-rail ${side || ''}`.trim()}>
            <span className='chrome-wrapper-grain' />

            {tubes?.map((tube, j) => {
              const { color, top, height, breathes } = tube || {}
              let tube_class = `chrome-wrapper-tube ${color || ''}`.trim()
              if (breathes) tube_class += ' breathes'
              return <span key={j} className={tube_class} style={{ top, height }} />
            })}

            {joints?.map((top, j) => {
              return <span key={j} className='chrome-wrapper-joint' style={{ top }} />
            })}

            {leds?.map((led, j) => {
              const { color, top, blinks } = led || {}
              let led_class = `chrome-wrapper-led ${color || ''}`.trim()
              if (blinks) led_class += ' blinks'
              return <span key={j} className={led_class} style={{ top }} />
            })}
          </span>
        )
      })}

      {has_rails && TRIMS?.map((trim, i) => {
        const { edge, tubes, blocks } = trim || {}
        return (
          <span key={edge || i} className={`chrome-wrapper-trim ${edge || ''}`.trim()}>
            <span className='chrome-wrapper-trim-grain' />

            {tubes?.map((tube, j) => {
              const { color, left, right, width } = tube || {}
              return (
                <span
                  key={j}
                  className={`chrome-wrapper-trim-tube ${color || ''}`.trim()}
                  style={{ left, right, width }}
                />
              )
            })}

            {blocks?.map((left, j) => {
              return <span key={j} className='chrome-wrapper-trim-block' style={{ left }} />
            })}
          </span>
        )
      })}

      {has_rails && CORNERS?.map(corner => {
        return <span key={corner} className={`chrome-wrapper-arc ${corner}`} />
      })}

      {has_rails && CORNERS?.map(corner => {
        return <span key={corner} className={`chrome-wrapper-rivet ${corner}`} />
      })}

      <div className={`chrome-wrapper-body scroll-area ${body_class || ''}`.trim()}>
        {children}
      </div>

    </div>
  )
}

export default ChromeWrapper
