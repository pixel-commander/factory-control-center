import './css/classroom.css'
import { GridCell } from '../../components/GridCell/GridCell'
import { Nav } from '../../components/Nav/Nav'
import { Section } from '../../components/Section/Section'
import { StatCell } from '../../components/StatCell/StatCell'
import { Slider } from '../../components/Slider/Slider'
import { RenderItems } from '../../components/RenderItems/RenderItems'
import { useClassroom } from './hooks/useClassroom'
import { TABS } from './js/classroom'
import type { ClassroomProps } from './Classroom.types'
import type { RenderItemProps } from '../../components/RenderItems/RenderItems.types'

const StudentItem = (props?: RenderItemProps) => {
  const { name, title, value } = props || {}
  return (
    <>
      <span className='name'>{String(name || '')}</span>
      <span className='title'>{String(title || '')}</span>
      <span className='mark'>{String(value || '—')}</span>
    </>
  )
}

const SubmissionItem = (props?: RenderItemProps) => {
  const { name, label, value } = props || {}
  return (
    <>
      <span className='name'>{String(name || '')}</span>
      <span className='title'>{String(label || '')}</span>
      <span className='mark'>{value ? String(value) : 'UNGRADED'}</span>
    </>
  )
}

const AssignmentItem = (props?: RenderItemProps) => {
  const { name, title, description } = props || {}
  return (
    <>
      <span className='name'>{String(name || '')}</span>
      <span className='title'>{String(description || '')}</span>
      <span className='mark'>{String(title || '')}</span>
    </>
  )
}

const QuestionItem = (props?: RenderItemProps) => {
  const { name, when, is_done } = props || {}
  return (
    <>
      <span className='name'>{String(name || '')}</span>
      <span className='title'>{String(when || '')}</span>
      <span className='mark'>{is_done ? 'ANSWERED' : 'OPEN'}</span>
    </>
  )
}

export const Classroom = ({
  className,
  title = 'Applied Systems Reasoning',
  accent_class = 'accent-primary'
}: ClassroomProps) => {

  const {
    students,
    assignments,
    submissions,
    questions,
    rubric,
    total,
    awaiting,
    who,
    held,
    paper,
    tab,
    selected_student,
    selected_submission,
    selected_assignment,
    handleClickTab,
    handleSelectStudent,
    handleSelectSubmission,
    handleSelectAssignment,
    handleChangeMark
  } = useClassroom()

  const nav_settings = {
    nav_items: TABS,
    selected: tab,
    container_class: 'site-nav enclosed is-small',
    handleClick: (x?: { id?: string | number }) => handleClickTab(x?.id)
  }

  return (
    <div className={`classroom grid with-header ${accent_class || ''} ${className || ''}`.trim()}>

      <GridCell area='header' className='classroom-head'>
        <span className='classroom-title'>{title}</span>
        <Nav {...nav_settings} />
      </GridCell>

      <GridCell area='main' className='side-l classroom-body'>

        <GridCell area='side' className='classroom-rail scroll-area'>
          <Section container_class='rule stacked' title='COHORT'>
            <RenderItems
              items={students}
              selected={selected_student}
              item_class='list-item'
              Item={StudentItem}
              handleClick={(x) => handleSelectStudent(x?.id)}
            />
          </Section>

          <Section container_class='rule stacked' title='SET WORK'>
            <RenderItems
              items={assignments}
              selected={selected_assignment}
              item_class='list-item'
              Item={AssignmentItem}
              handleClick={(x) => handleSelectAssignment(x?.id)}
            />
          </Section>
        </GridCell>

        <GridCell area='main' className='classroom-main scroll-area'>

          {tab === 'review' ? (
            <div className='grid classroom-review'>
              <Section container_class='rule' title={`WEEK 4 · ${String(paper?.name || '')}`}>
                <StatCell label='AWAITING GRADE' value={String(awaiting)} is_active />
                <StatCell label='MEDIAN SCORE' value='84' />
                <StatCell label='RUBRIC TOTAL' value={String(total)} />
              </Section>

              <div className='grid side-l classroom-review-body'>
                <GridCell area='side'>
                  <Section
                    container_class='panel stacked'
                    title={`SUBMISSIONS · ${submissions?.length || 0}`}
                    description={who ? String(who?.name || '') : 'ALL'}
                  >
                    <RenderItems
                      items={submissions}
                      selected={selected_submission}
                      item_class='list-item'
                      Item={SubmissionItem}
                      handleClick={(x) => handleSelectSubmission(x?.id)}
                    />
                  </Section>
                </GridCell>

                <GridCell area='main'>
                  <Section
                    container_class='panel stacked'
                    title='RUBRIC'
                    description={String(held?.label || '')}
                  >
                    {rubric?.map(line => (
                      <Slider
                        key={String(line?.id)}
                        label={String(line?.label || '')}
                        value={Number(line?.value) || 0}
                        min={0}
                        max={5}
                        threshold={4}
                        handleChange={(x) => handleChangeMark(String(line?.id), Number(x))}
                      />
                    ))}
                  </Section>
                </GridCell>
              </div>
            </div>
          ) : null}

          {tab === 'assignments' ? (
            <Section container_class='panel stacked' title='SET WORK' description={`${assignments?.length || 0}`}>
              <RenderItems
                items={assignments}
                selected={selected_assignment}
                item_class='list-item'
                Item={AssignmentItem}
                handleClick={(x) => handleSelectAssignment(x?.id)}
              />
            </Section>
          ) : null}

          {tab === 'students' ? (
            <Section container_class='panel stacked' title='COHORT' description={`${students?.length || 0}`}>
              <RenderItems
                items={students}
                selected={selected_student}
                item_class='list-item'
                Item={StudentItem}
                handleClick={(x) => handleSelectStudent(x?.id)}
              />
            </Section>
          ) : null}

          {tab === 'questions' ? (
            <Section container_class='panel stacked' title='QUESTIONS' description={`${questions?.length || 0}`}>
              <RenderItems
                items={questions}
                item_class='list-item'
                Item={QuestionItem}
              />
            </Section>
          ) : null}

        </GridCell>
      </GridCell>
    </div>
  )
}

export default Classroom
