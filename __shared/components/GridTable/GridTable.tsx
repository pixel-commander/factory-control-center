import './css/grid-table.css'
import type { GridTableProps } from './GridTable.types'

export const GridTable = ({
  className,
  container_class = '',
  data,
  headers,
  labels,
  selected,
  is_visible,
  container_ref,
  handleSelect
}: GridTableProps) => {

  if (is_visible === false) return null

  const keys = headers?.length ? headers : Object.keys(data?.[0] || {})

  const track = { gridTemplateColumns: `repeat(${keys.length || 1}, minmax(0, auto))` }

  return (
    <div className={`grid-table ${container_class || ''} ${className || ''}`.trim()} ref={container_ref}>
      <div className='grid-table-grid scroll-area' style={track}>

        {keys?.map(key => (
          <div key={key} className='grid-table-label'>
            {String(labels?.[key] || key).toUpperCase()}
          </div>
        ))}

        {data?.map((item, i) => {
          const { id } = item || {}
          const is_selected = selected !== undefined && String(id) === String(selected)

          let row_class = 'grid-table-row'
          if (is_selected) row_class += ' is-selected'

          return (
            <div
              key={String(id || i)}
              className={row_class}
              onClick={() => handleSelect?.(id)}
            >
              {keys?.map(key => (
                <div key={key} className='grid-table-cell'>
                  {String(item?.[key] ?? '—')}
                </div>
              ))}
            </div>
          )
        })}

        {!data?.length ? <div className='grid-table-empty'>NOTHING HERE</div> : null}

      </div>
    </div>
  )
}

export default GridTable
