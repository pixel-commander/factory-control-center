import './css/list-widget.css'
import { RenderItems } from '../../../components/RenderItems/RenderItems'
import type { ListWidgetProps } from './ListWidget.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this list-widget loop through data? if so, what is the item_class
 * 3. is there a container_class for this list-widget?
 **/

export const ListWidget = (props: ListWidgetProps) => {
  const {
    items, Item, item_class, container_class, selected, className, is_visible,
    handleClick,
  } = props || {}

  if (is_visible === false) return null

  const list_settings = {
    items,
    Item,
    item_class: item_class || 'list-item',
    container_class: ['list-widget', container_class || ''].filter(Boolean).join(' '),
    selected,
    className,
    handleClick,
  }

  return <RenderItems {...list_settings} />
}

export default ListWidget
