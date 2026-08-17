import './css/course-form.css'
import FormWidget from '../FormWidget/FormWidget'
import { useFormWidget } from '../FormWidget/hooks/useFormWidget'
import { WORK_STATUS } from '../FormWidget/js/options'
import type { InputGroupBaseProps } from '../../../components/StatelessForm/StatelessForm.types'
import type { CourseFormProps } from './CourseForm.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this course-form loop through data? if so, what is the item_class
 * 3. is there a container_class for this course-form?
 **/

const FORM_FIELDS: InputGroupBaseProps[] = [
  { name: 'name', label: 'NAME', tab: 'INFO', is_required: true },
  { name: 'title', label: 'TITLE', tab: 'INFO' },
  { name: 'tags', label: 'TAGS', type: 'check_list', source: 'tags', tab: 'INFO' },
  { name: 'status', label: 'STATUS', type: 'select', items: WORK_STATUS, default_value: 'open', tab: 'INFO' },
  { name: 'date_start', label: 'STARTS', type: 'date', tab: 'INFO' },
  { name: 'date_end', label: 'ENDS', type: 'date', tab: 'INFO' },
  { name: 'assignments', label: 'ASSIGNMENTS', type: 'check_list', source: 'assignments', tab: 'ASSIGNMENTS', helper_text: 'The set work this course is made of - searched by name, stored by id' },
  { name: 'students', label: 'ENROLLED', type: 'check_list', source: 'users', tab: 'ASSIGNMENTS', helper_text: 'A student is a user' },
  { name: 'details', label: 'DESCRIPTION', type: 'textarea', tab: 'DETAILS', helper_text: 'Plain words - this is what a student reads first' },
]

export const CourseForm = (props: CourseFormProps) => {
  const {
    item, items, title, action, cancel, can_scroll, className, is_visible,
    handleSubmit, handleCancel, handleSave,
  } = props || {}

  const { handleSubmit: save } = useFormWidget('course', { handleSave })

  if (is_visible === false) return null

  const form_settings = {
    className,
    item,
    items: items && items.length ? items : FORM_FIELDS,
    title: title || (item ? 'EDIT COURSE' : 'NEW COURSE'),
    action: action || (item ? 'UPDATE COURSE' : 'SAVE COURSE'),
    cancel,
    can_scroll,
    handleSubmit: handleSubmit || save,
    handleCancel,
  }

  return <FormWidget {...form_settings} />
}

export default CourseForm
