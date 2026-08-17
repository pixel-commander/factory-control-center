import './css/stat-cell.css'
import type { StatCellProps } from './StatCell.types'

export const StatCell = ({
  className,
  container_class = 'container-panel',
  label,
  value,
  is_active,
  is_visible,
  container_ref,
  children
}: StatCellProps) => {

  if (is_visible === false) return null

  let stat_class = `stat-cell ${container_class || ''} ${className || ''}`.trim()
  if (is_active) stat_class += ' is-active'

  return (
    <div className={stat_class} ref={container_ref}>
      <span className='stat-cell-label'>{label || ''}</span>
      <span className='stat-cell-value'>{value || children || ''}</span>
    </div>
  )
}

export default StatCell
