import './css/render-items.css'
import type { RenderItemsProps, RenderItemProps } from './RenderItems.types'

export const RenderItems = ({
  className,
  items,
  selected,
  container_class = '',
  item_class = '',
  Item,
  container_ref,
  handleClick,
  children
}: RenderItemsProps) => {

  const RenderItem = Item || (({ label, name, is_selected }: RenderItemProps = {}) => (
    <div className={is_selected ? 'is-selected' : ''}>{String(label || name || '')}</div>
  ))

  className = `render-items ${container_class || ''} ${className || ''}`.trim()

  return (
    <div className={className} ref={container_ref}>
      {items?.map((item, i) => {
        const { id } = item || {}
        const is_selected = selected !== undefined && String(id) === String(selected)

        let row_class = `render-item ${item_class || ''}`.trim()
        if (is_selected) row_class += ' is-selected'

        return (
          <button
            key={String(id || i)}
            type='button'
            className={row_class}
            data-id={String(id || '')}
            onClick={() => handleClick?.(item)}
          >
            <RenderItem {...item} is_selected={is_selected} />
          </button>
        )
      })}
      {children}
    </div>
  )
}

export default RenderItems
