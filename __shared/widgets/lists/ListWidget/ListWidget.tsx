import './css/list-widget.css'
import { RenderItems } from '../../../components/RenderItems/RenderItems'
import { StatelessInputGroup } from '../../../components/StatelessForm'
import type { FormFieldElement } from '../../../components/StatelessForm/StatelessForm.types'
import type { ListWidgetProps } from './ListWidget.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this list-widget loop through data? if so, what is the item_class
 * 3. is there a container_class for this list-widget?
 **/

const defaults = { has_search: true, can_add: true, is_open: true, action: '+' }

export const ListWidget = (props: ListWidgetProps) => {
  const list_widget_settings = { ...defaults, ...(props || {}) }
  const {
    items, Item, item_class, container_class, selected, title, label, name,
    query, has_search, can_add, is_open, is_visible, className, action,
    handleClick, handleChange, handleToggle, handleClickAddNew,
  } = list_widget_settings

  if (is_visible === false) return null

  const seedOpen = (section: HTMLDetailsElement | null) => {
    if (!section || section.dataset.seeded) return
    section.open = is_open !== false
    section.dataset.seeded = 'true'
  }

  const search = (event: React.FocusEvent<FormFieldElement>) => handleChange?.(event?.target?.value)

  const widget_class = ['list-widget', 'container-panel', container_class || '', className || '']
    .filter(Boolean)
    .join(' ')

  return (
    <details
      className={widget_class}
      ref={seedOpen}
      name={name ? String(name) : undefined}
      onToggle={(event) => handleToggle?.((event.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className='list-widget-head pad-sm'>{title || label || 'n/a'}</summary>
      <div className='grid with-header'>
        {has_search === false ? null : (
          <div data-area='header' className='grid side-r'>
            <div data-area='main'>
              <StatelessInputGroup name='query' default_value={query} handleChange={search} />
            </div>
            {can_add === false ? null : (
              <div data-area='side'>
                <button type='button' className='button-glow' onClick={() => handleClickAddNew?.()}>
                  {action}
                </button>
              </div>
            )}
          </div>
        )}
        <div data-area='main' className='list-widget-well container-well scroll-y'>
          <RenderItems
            items={items}
            selected={selected}
            item_class={item_class}
            Item={Item}
            handleClick={handleClick}
          />
        </div>
      </div>
    </details>
  )
}

export default ListWidget
