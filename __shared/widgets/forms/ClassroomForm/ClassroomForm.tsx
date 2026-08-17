import './css/classroom-form.css'
import FormWidget from '../FormWidget/FormWidget'
import { useFormWidget } from '../FormWidget/hooks/useFormWidget'
import { WORK_STATUS } from '../FormWidget/js/options'
import type { InputGroupBaseProps } from '../../../components/StatelessForm/StatelessForm.types'
import type { ClassroomFormProps } from './ClassroomForm.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this classroom-form loop through data? if so, what is the item_class
 * 3. is there a container_class for this classroom-form?
 **/

const FORM_FIELDS: InputGroupBaseProps[] = [
  { name: 'name', label: 'NAME', tab: 'INFO', is_required: true },
  { name: 'title', label: 'TITLE', tab: 'INFO' },
  { name: 'tags', label: 'TAGS', type: 'check_list', source: 'tags', tab: 'INFO' },
  { name: 'status', label: 'STATUS', type: 'select', items: WORK_STATUS, default_value: 'open', tab: 'INFO' },
  { name: 'date_start', label: 'STARTS', type: 'date', tab: 'INFO' },
  { name: 'date_end', label: 'ENDS', type: 'date', tab: 'INFO' },
  { name: 'courses', label: 'COURSES', type: 'check_list', source: 'courses', tab: 'COURSES', helper_text: 'The courses taught in this room - searched by name, stored by id' },
  { name: 'students', label: 'ENROLLED', type: 'check_list', source: 'users', tab: 'COURSES', helper_text: 'A student is a user' },
  { name: 'details', label: 'DESCRIPTION', type: 'textarea', tab: 'DETAILS', helper_text: 'What this room runs, and who it is for' },
]

export const ClassroomForm = (props: ClassroomFormProps) => {
  const {
    item, items, title, action, cancel, can_scroll, className, is_visible,
    handleSubmit, handleCancel, handleSave,
  } = props || {}

  const { handleSubmit: save } = useFormWidget('classroom', { handleSave })

  if (is_visible === false) return null

  const form_settings = {
    className,
    item,
    items: items && items.length ? items : FORM_FIELDS,
    title: title || (item ? 'EDIT CLASSROOM' : 'NEW CLASSROOM'),
    action: action || (item ? 'UPDATE CLASSROOM' : 'SAVE CLASSROOM'),
    cancel,
    can_scroll,
    handleSubmit: handleSubmit || save,
    handleCancel,
  }

  return <FormWidget {...form_settings} />
}

export default ClassroomForm
