import './css/form-widget.css'
import { StatelessForm } from '../../../components/StatelessForm'
import { useFormWidget } from './hooks/useFormWidget'
import type { InputGroupBaseProps } from '../../../components/StatelessForm/StatelessForm.types'
import type { OptionItemProps } from './js/options'
import type { FormWidgetProps } from './FormWidget.types'
import { GridCell } from '../../../components/GridCell/GridCell'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this form-widget loop through data? if so, what is the item_class
 * 3. is there a container_class for this form-widget?
 **/

const defaults = { action: 'SAVE', cancel: 'CANCEL', can_scroll: true }

export const FormWidget = (props: FormWidgetProps) => {
  const form_widget_settings = { ...defaults, ...(props || {}) }
  const {
    items, item, title, action, cancel, can_scroll, is_visible, className,
    handleSubmit, handleCancel,
  } = form_widget_settings

  const sources = (items || [])
    .map((field) => (field?.source ? String(field.source) : ''))
    .filter(Boolean)

  const { tag_items, user_items, project_items, course_items, assignment_items } = useFormWidget(undefined, { sources })

  if (is_visible === false) return null

  const source_items: Record<string, OptionItemProps[]> = {
    tags: tag_items,
    users: user_items,
    projects: project_items,
    courses: course_items,
    assignments: assignment_items,
  }

  const fields = (items || []).map((field) => {
    const held = item?.[String(field?.name)]
    const seeded = held === undefined ? field : { ...field, default_value: held as string | number }
    const source = seeded?.source ? String(seeded.source) : ''
    return source ? { ...seeded, items: source_items[source] || [] } : seeded
  })

  const form_tabs: Record<string, InputGroupBaseProps[]> = {}
  fields.forEach((field) => {
    const tab = field?.tab ? String(field.tab) : ''
    if (!tab) return
    form_tabs[tab] = [...(form_tabs[tab] || []), field]
  })

  const form_fields = fields.filter((field) => !field?.tab)
  const has_tabs = Object.keys(form_tabs).length > 0

  const form_settings = {
    form_fields: form_fields.length ? form_fields : undefined,
    form_tabs: has_tabs ? form_tabs : undefined,
    button_text: { submit: action, cancel },
    handleSubmit,
    handleCancel,
  }

  const widget_class = ['form-widget', 'grid', 'with-header', can_scroll ? 'can-scroll' : '', className || ''].filter(Boolean).join(' ')

  return (
    <div className={widget_class}>
      {title ? <GridCell area='header' className='form-widget-title'>{title}</GridCell> : null}
      <GridCell area='main' can_scroll><StatelessForm {...form_settings} /></GridCell>
    </div>
  )
}

export default FormWidget
