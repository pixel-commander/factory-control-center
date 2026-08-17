import { useApi } from '../../../../hooks/useApi/useApi'
import type { OptionItemProps } from '../js/options'

export interface TagRowProps {
  id?: string | number,
  name?: string,
  title?: string,
  description?: string,
  slug?: string,
  color?: string,
  kind?: string,
  count?: number,
  [key: string]: unknown,
}

export interface UseFormWidgetSettings {
  handleSave?: (made?: unknown) => unknown,
  sources?: string[],
}

export const TAGS_PATH = '/api/rab_tags'
export const USERS_PATH = '/api/users'
export const PROJECTS_PATH = '/api/projects'
export const COURSES_PATH = '/api/courses'
export const ASSIGNMENTS_PATH = '/api/assignments'

export const useFormWidget = (table?: string, settings: UseFormWidgetSettings = {}) => {
  const { handleSave, sources } = settings || {}
  const wanted = sources || []

  const [tag_rows] = useApi<TagRowProps[]>(TAGS_PATH)
  const [user_rows] = useApi<Record<string, unknown>[]>(wanted.includes('users') ? USERS_PATH : '')
  const [project_rows] = useApi<Record<string, unknown>[]>(wanted.includes('projects') ? PROJECTS_PATH : '')
  const [course_rows] = useApi<Record<string, unknown>[]>(wanted.includes('courses') ? COURSES_PATH : '')
  const [assignment_rows] = useApi<Record<string, unknown>[]>(wanted.includes('assignments') ? ASSIGNMENTS_PATH : '')
  const [rows, handleApi, status] = useApi<Record<string, unknown>[]>(table ? `/api/${table}` : '')

  const tags = tag_rows || []
  const tag_options = tags.map((tag) => String(tag?.slug || tag?.name || ''))
  const tag_items: OptionItemProps[] = tags.map((tag) => ({
    id: String(tag?.slug || tag?.name || ''),
    name: String(tag?.title || tag?.name || tag?.slug || ''),
  }))
  const user_items: OptionItemProps[] = (user_rows || []).map((user) => ({
    id: String(user?.id || ''),
    name: String(user?.name || user?.title || ''),
  }))
  const project_items: OptionItemProps[] = (project_rows || []).map((project) => ({
    id: String(project?.id || ''),
    name: String(project?.name || project?.title || ''),
  }))
  const course_items: OptionItemProps[] = (course_rows || []).map((course) => ({
    id: String(course?.id || ''),
    name: String(course?.name || course?.title || ''),
  }))
  const assignment_items: OptionItemProps[] = (assignment_rows || []).map((assignment) => ({
    id: String(assignment?.id || ''),
    name: String(assignment?.name || assignment?.title || ''),
  }))

  const submit = async (values?: Record<string, unknown>, item?: Record<string, unknown>) => {
    if (!table) return null
    const body = { ...(values || {}) }
    const id = item?.id
    const made = id !== undefined && id !== null && String(id) !== ''
      ? await handleApi('edit', { id, ...body })
      : await handleApi('add-new', body)
    handleSave?.(made)
    return made
  }

  const handleSubmit = (values?: unknown) => submit(values as Record<string, unknown>)

  return {
    tags,
    tag_options,
    tag_items,
    user_items,
    project_items,
    course_items,
    assignment_items,
    rows: rows || [],
    status,
    submit,
    handleSubmit,
    handleApi,
  }
}

export default useFormWidget
