import { useState } from 'react'
import { GridTable } from '../GridTable'
import { Section } from '../../Section/Section'
import type { HouseKeyProps } from '../../../../RAB.types'

interface TableRowProps extends HouseKeyProps {
  [key: string]: unknown
}

const ASSIGNMENTS: TableRowProps[] = [
  { id: 'a1', name: 'Resource reclaim loop', module: 'Week 4', due: '12 AUG', status: 'OPEN', grade: '—', submitted: '2' },
  { id: 'a2', name: 'Mesh traversal', module: 'Week 4', due: '14 AUG', status: 'OPEN', grade: '—', submitted: '2' },
  { id: 'a3', name: 'Airlock state machine', module: 'Week 3', due: '05 AUG', status: 'CLOSED', grade: '78', submitted: '1' },
  { id: 'a4', name: 'Signal decay model', module: 'Week 2', due: '29 JUL', status: 'CLOSED', grade: '84', submitted: '6' },
]

const COHORT: TableRowProps[] = [
  { id: 's1', name: 'Ada Reyes', standing: 'Week 4', mark: '92' },
  { id: 's2', name: 'Lena Cho', standing: 'Week 4', mark: '78' },
  { id: 's3', name: 'Kofi Aalto', standing: 'Week 4', mark: '85' },
  { id: 's4', name: 'Mira Vance', standing: 'Week 3', mark: '81' },
]

export const Demo = () => {
  const [held_work, setHeldWork] = useState<string | number>('a1')
  const [held_who, setHeldWho] = useState<string | number>('')

  return (
    <div className='grid'>

      <Section container_class='panel stacked' title='ASSIGNMENTS' description='six columns, labels overridden'>
        <GridTable
          data={ASSIGNMENTS}
          headers={['name', 'module', 'due', 'status', 'grade', 'submitted']}
          labels={{ name: 'ASSIGNMENT', submitted: 'IN' }}
          selected={held_work}
          handleSelect={(x) => setHeldWork(String(x || ''))}
        />
      </Section>

      <Section container_class='panel stacked' title='COHORT' description='three columns'>
        <GridTable
          data={COHORT}
          headers={['name', 'standing', 'mark']}
          labels={{ standing: 'STANDING' }}
          selected={held_who}
          handleSelect={(x) => setHeldWho(String(x || ''))}
        />
      </Section>

      <Section container_class='panel stacked' title='EMPTY'>
        <GridTable data={[]} headers={['name', 'status']} />
      </Section>

    </div>
  )
}

export default Demo
