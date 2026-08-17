import './css/appointment-form.css'
import FormWidget from '../FormWidget/FormWidget'
import { useFormWidget } from '../FormWidget/hooks/useFormWidget'
import type { InputGroupBaseProps } from '../../../components/StatelessForm/StatelessForm.types'
import type { AppointmentFormProps } from './AppointmentForm.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this appointment-form loop through data? if so, what is the item_class
 * 3. is there a container_class for this appointment-form?
 **/

const FORM_FIELDS: InputGroupBaseProps[] = [
  { name: 'name', label: 'NAME', tab: 'INFO', is_required: true },
  { name: 'title', label: 'TITLE', tab: 'INFO' },
  { name: 'tags', label: 'TAGS', type: 'check_list', source: 'tags', tab: 'INFO' },
  { name: 'details', label: 'DETAILS', type: 'textarea', tab: 'DETAILS', helper_text: 'Plain words - this is what someone reads first' },
]

export const AppointmentForm = (props: AppointmentFormProps) => {
  const {
    item, items, title, action, cancel, can_scroll, className, is_visible,
    handleSubmit, handleCancel, handleSave,
  } = props || {}

  const { handleSubmit: save } = useFormWidget('appointments', { handleSave })

  if (is_visible === false) return null

  const form_settings = {
    className,
    item,
    items: items && items.length ? items : FORM_FIELDS,
    title: title || (item ? 'EDIT APPOINTMENT' : 'NEW APPOINTMENT'),
    action: action || (item ? 'UPDATE APPOINTMENT' : 'SAVE APPOINTMENT'),
    cancel,
    can_scroll,
    handleSubmit: handleSubmit || save,
    handleCancel,
  }

  return <FormWidget {...form_settings} />
}

export default AppointmentForm
