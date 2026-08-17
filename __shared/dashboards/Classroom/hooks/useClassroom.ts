import { useState } from 'react'
import { useURL } from '../../../hooks/useURL/useURL'
import { COHORT, SUBMISSIONS, ASSIGNMENTS, MATERIALS, RUBRIC, QUESTIONS } from '../js/classroom'

export const useClassroom = () => {
  const [{ url_vars }, go] = useURL()

  const { tab, student, submission, assignment } = url_vars || {}

  const [marks, setMarks] = useState<Record<string, number>>({})

  const held_tab = String(tab || '') || 'review'
  const held_student = String(student || '')
  const held_submission = String(submission || '')

  const students = COHORT
  const assignments = ASSIGNMENTS

  const who = students?.find(x => String(x?.id) === held_student)

  const submissions = held_student
    ? SUBMISSIONS.filter(x => String(x?.name) === String(who?.name || ''))
    : SUBMISSIONS

  const held = SUBMISSIONS.find(x => String(x?.id) === held_submission) || submissions?.[0] || SUBMISSIONS[0]

  const held_assignment = String(assignment || held?.assignment || 'a1')
  const paper = assignments?.find(x => String(x?.id) === held_assignment) || assignments?.[0]
  const file = MATERIALS?.find(x => String(x?.id) === String(held?.file || '')) || MATERIALS?.[0]

  const rubric = RUBRIC?.map(line => ({
    ...line,
    value: marks?.[String(line?.id)] !== undefined ? marks[String(line?.id)] : Number(line?.value) || 0
  }))

  const total = rubric?.reduce((sum, line) => sum + (Number(line?.value) || 0), 0) || 0

  const awaiting = SUBMISSIONS.filter(x => !x?.value)?.length || 0

  const handleClickTab = (x?: unknown) => go('update-var', { tab: String(x || '') })

  const handleSelectStudent = (x?: unknown) => {
    const id = String(x || '')
    go('update-var', { student: id === held_student ? '' : id, submission: '' })
  }

  const handleSelectSubmission = (x?: unknown) => go('update-var', { submission: String(x || '') })

  const handleSelectAssignment = (x?: unknown) => {
    go('update-var', { assignment: String(x || ''), tab: 'review' })
  }

  const handleChangeMark = (id?: string, value?: number) => {
    setMarks({ ...marks, [String(id || '')]: Number(value) || 0 })
  }

  return {
    students,
    assignments,
    submissions,
    questions: QUESTIONS,
    materials: MATERIALS,
    rubric,
    total,
    awaiting,
    who,
    held,
    paper,
    file,
    tab: held_tab,
    selected_student: held_student,
    selected_submission: String(held?.id || ''),
    selected_assignment: held_assignment,
    handleClickTab,
    handleSelectStudent,
    handleSelectSubmission,
    handleSelectAssignment,
    handleChangeMark
  }
}

export default useClassroom
