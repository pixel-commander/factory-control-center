import './css/task-form.css'
import FormWidget from '../FormWidget/FormWidget'
import { useFormWidget } from '../FormWidget/hooks/useFormWidget'
import { WORK_STATUS } from '../FormWidget/js/options'
import type { InputGroupBaseProps } from '../../../components/StatelessForm/StatelessForm.types'
import type { TaskFormProps } from './TaskForm.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this task-form loop through data? if so, what is the item_class
 * 3. is there a container_class for this task-form?
 **/

const FORM_FIELDS: InputGroupBaseProps[] = [
  { name: 'name', label: 'NAME', tab: 'INFO', is_required: true },
  { name: 'title', label: 'TITLE', tab: 'INFO' },
  { name: 'tags', label: 'TAGS', type: 'check_list', source: 'tags', tab: 'INFO' },
  { name: 'assigned_to', label: 'ASSIGNED TO', type: 'check_list', source: 'users', tab: 'INFO' },
  { name: 'date_due', label: 'DUE DATE', type: 'date', tab: 'INFO' },
  { name: 'status', label: 'STATUS', type: 'select', items: WORK_STATUS, default_value: 'open', tab: 'INFO' },
  { name: 'project', label: 'PROJECT', type: 'select', source: 'projects', tab: 'INFO' },
  { name: 'details', label: 'DETAILS', type: 'textarea', tab: 'DETAILS', helper_text: 'Plain words - this is what someone reads first' },
]

export const TaskForm = (props: TaskFormProps) => {
  const {
    item, items, title, action, cancel, can_scroll, className, is_visible,
    handleSubmit, handleCancel, handleSave,
  } = props || {}

  const { handleSubmit: save } = useFormWidget('task', { handleSave })

  if (is_visible === false) return null

  const form_settings = {
    className,
    item,
    items: items && items.length ? items : FORM_FIELDS,
    title: title || (item ? 'EDIT TASK' : 'NEW TASK'),
    action: action || (item ? 'UPDATE TASK' : 'SAVE TASK'),
    cancel,
    can_scroll,
    handleSubmit: handleSubmit || save,
    handleCancel,
  }

  return <FormWidget {...form_settings} />
}

export default TaskForm
