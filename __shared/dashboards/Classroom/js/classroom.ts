import type { HouseKeyProps } from '../../../../RAB.types'
import type { RenderItemProps } from '../../../components/RenderItems/RenderItems.types'
import type { NavItemProps } from '../../../components/Nav/Nav.types'

export interface StudentProps extends HouseKeyProps {
  [key: string]: unknown,
  value?: number,
  is_active?: boolean
}

export interface SubmissionProps extends HouseKeyProps {
  [key: string]: unknown,
  value?: number,
  assignment?: string,
  file?: string,
  is_active?: boolean
}

export interface RubricLineProps extends HouseKeyProps {
  [key: string]: unknown,
  value?: number
}

export interface QuestionProps extends HouseKeyProps {
  [key: string]: unknown,
  when?: string,
  is_done?: boolean
}

export const COHORT: StudentProps[] = [
  { id: 's1', name: 'Ada Reyes', title: 'Week 4', value: 92, is_active: true },
  { id: 's2', name: 'Lena Cho', title: 'Week 4', value: 78, is_active: true },
  { id: 's3', name: 'Kofi Aalto', title: 'Week 4', value: 85, is_active: true },
  { id: 's4', name: 'Mira Vance', title: 'Week 3', value: 81, is_active: false },
  { id: 's5', name: 'Tomas Iyer', title: 'Week 4', value: 88, is_active: true },
  { id: 's6', name: 'Nel Okafor', title: 'Week 2', value: 74, is_active: false },
]

export const MATERIALS: RenderItemProps[] = [
  { id: 'f1', name: 'reclaim.py', path: 'week-4/reclaim.py' },
  { id: 'f2', name: 'mesh.js', path: 'week-4/mesh.js' },
  { id: 'f3', name: 'airlock.rs', path: 'week-3/airlock.rs' },
  { id: 'f4', name: 'brief.md', path: 'week-4/brief.md' },
]

export const ASSIGNMENTS: RenderItemProps[] = [
  { id: 'a1', name: 'Resource reclaim loop', title: 'Week 4', description: 'compound recovery per cycle' },
  { id: 'a2', name: 'Mesh traversal', title: 'Week 4', description: 'shortest path, no library' },
  { id: 'a3', name: 'Airlock state machine', title: 'Week 3', description: 'four states, no invalid edge' },
]

export const SUBMISSIONS: SubmissionProps[] = [
  { id: 'b1', name: 'Ada Reyes', label: 'reclaim.py', value: 92, assignment: 'a1', file: 'f1', is_active: true },
  { id: 'b2', name: 'Kofi Aalto', label: 'reclaim.py', value: 0, assignment: 'a1', file: 'f1' },
  { id: 'b3', name: 'Lena Cho', label: 'airlock.rs', value: 78, assignment: 'a3', file: 'f3' },
  { id: 'b4', name: 'Tomas Iyer', label: 'mesh.js', value: 0, assignment: 'a2', file: 'f2' },
  { id: 'b5', name: 'Mira Vance', label: 'mesh.js', value: 0, assignment: 'a2', file: 'f2' },
]

export const RUBRIC: RubricLineProps[] = [
  { id: 'r1', label: 'CORRECTNESS', value: 4 },
  { id: 'r2', label: 'CLARITY', value: 3 },
  { id: 'r3', label: 'EFFICIENCY', value: 3 },
  { id: 'r4', label: 'TESTS', value: 2 },
]

export const QUESTIONS: QuestionProps[] = [
  { id: 'q1', name: 'Does clarity include naming?', when: 'Ada Reyes', is_done: false },
  { id: 'q2', name: 'Recovery loop — compound per cycle?', when: 'Kofi Aalto', is_done: true },
  { id: 'q3', name: 'Can tests be pytest instead?', when: 'Lena Cho', is_done: false },
  { id: 'q4', name: 'Extension for week 3 quiz', when: 'Nel Okafor', is_done: false },
]

export const TABS: NavItemProps[] = [
  { id: 'review', label: 'REVIEW + GRADE', path: 'review' },
  { id: 'assignments', label: 'ASSIGNMENTS', path: 'assignments' },
  { id: 'students', label: 'STUDENTS', path: 'students' },
  { id: 'questions', label: 'QUESTIONS', path: 'questions' },
]
