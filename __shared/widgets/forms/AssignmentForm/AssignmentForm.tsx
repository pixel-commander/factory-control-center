import './css/assignment-form.css'
import FormWidget from '../FormWidget/FormWidget'
import { useFormWidget } from '../FormWidget/hooks/useFormWidget'
import { WORK_STATUS } from '../FormWidget/js/options'
import type { InputGroupBaseProps } from '../../../components/StatelessForm/StatelessForm.types'
import type { AssignmentFormProps } from './AssignmentForm.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this assignment-form loop through data? if so, what is the item_class
 * 3. is there a container_class for this assignment-form?
 **/

const MODULES = ['Systems thinking', 'Model evaluation', 'Failure analysis', 'Capstone']

const FORM_FIELDS: InputGroupBaseProps[] = [
  { name: 'name', label: 'NAME', tab: 'INFO', is_required: true },
  { name: 'title', label: 'TITLE', tab: 'INFO' },
  { name: 'module', label: 'MODULE', type: 'select', options: MODULES, tab: 'INFO' },
  { name: 'tags', label: 'TAGS', type: 'check_list', source: 'tags', tab: 'INFO' },
  { name: 'assigned_to', label: 'ASSIGNED TO', type: 'check_list', source: 'users', tab: 'INFO' },
  { name: 'date_due', label: 'DUE DATE', type: 'date', tab: 'INFO' },
  { name: 'status', label: 'STATUS', type: 'select', items: WORK_STATUS, default_value: 'open', tab: 'INFO' },
  { name: 'points', label: 'POINTS', type: 'number', default_value: 20, tab: 'INFO' },
  { name: 'project', label: 'PROJECT', type: 'select', source: 'projects', tab: 'INFO' },
  { name: 'details', label: 'BRIEF', type: 'textarea', tab: 'DETAILS', helper_text: 'Plain words - this is what a student reads first' },
  { name: 'rubric', label: 'RUBRIC', type: 'textarea', tab: 'DETAILS', helper_text: 'One criterion per line - five points each' },
]

export const AssignmentForm = (props: AssignmentFormProps) => {
  const {
    item, items, title, action, cancel, can_scroll, className, is_visible,
    handleSubmit, handleCancel, handleSave,
  } = props || {}

  const { handleSubmit: save } = useFormWidget('assignment', { handleSave })

  if (is_visible === false) return null

  const form_settings = {
    className,
    item,
    items: items && items.length ? items : FORM_FIELDS,
    title: title || (item ? 'EDIT ASSIGNMENT' : 'NEW ASSIGNMENT'),
    action: action || (item ? 'UPDATE ASSIGNMENT' : 'SAVE ASSIGNMENT'),
    cancel,
    can_scroll,
    handleSubmit: handleSubmit || save,
    handleCancel,
  }

  return <FormWidget {...form_settings} />
}

export default AssignmentForm
