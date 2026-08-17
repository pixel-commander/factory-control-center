import { useState } from 'react'
import { Slider } from '../Slider'
import { Section } from '../../Section/Section'

const RUBRIC = [
  { id: 'r1', label: 'CORRECTNESS', value: 4 },
  { id: 'r2', label: 'CLARITY', value: 3 },
  { id: 'r3', label: 'EFFICIENCY', value: 3 },
  { id: 'r4', label: 'TESTS', value: 2 },
]

export const Demo = () => {
  const [marks, setMarks] = useState<Record<string, number>>({})
  const [load, setLoad] = useState(62)

  const held = (id?: string, fallback?: number) => (
    marks?.[String(id)] !== undefined ? marks[String(id)] : Number(fallback) || 0
  )

  const total = RUBRIC.reduce((sum, line) => sum + held(line.id, line.value), 0)

  return (
    <div className='grid'>

      <Section container_class='panel stacked' title='RUBRIC' description={`${total} / 20`}>
        {RUBRIC?.map(line => (
          <Slider
            key={line.id}
            label={line.label}
            value={held(line.id, line.value)}
            min={0}
            max={5}
            threshold={4}
            handleChange={(x) => setMarks({ ...marks, [line.id]: Number(x) || 0 })}
          />
        ))}
      </Section>

      <Section container_class='panel stacked' title='THRESHOLD' description='goes amber at 80'>
        <Slider
          label='LINE LOAD'
          value={load}
          min={0}
          max={100}
          threshold={80}
          handleChange={(x) => setLoad(Number(x) || 0)}
        />
      </Section>

      <Section container_class='panel stacked' title='DISABLED'>
        <Slider label='LOCKED' value={40} is_disabled />
      </Section>

    </div>
  )
}

export default Demo
