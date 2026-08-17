import './css/section.css'
import type { SectionProps } from './Section.types'

export const Section = ({
  className,
  container_class = 'rule',
  title,
  label,
  description,
  area,
  can_scroll,
  is_visible,
  container_ref,
  children
}: SectionProps) => {

  if (is_visible === false) return null

  const shown_title = title || label

  let body_class = 'section-body'
  if (can_scroll) body_class += ' scroll-area'

  return (
    <div
      className={`section ${container_class || ''} ${className || ''}`.trim()}
      data-area={area || undefined}
      ref={container_ref}
    >
      {shown_title ? (
        <div className='section-head'>
          <span className='section-title'>{shown_title}</span>
          {description ? <span className='section-meta'>{description}</span> : null}
        </div>
      ) : null}

      <div className={body_class}>{children}</div>
    </div>
  )
}

export default Section
