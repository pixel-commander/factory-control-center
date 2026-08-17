import { Section } from '../Section'
import { StatCell } from '../../StatCell/StatCell'

const MODES = ['rule', 'panel', 'well', 'accent']

export const Demo = () => {
  return (
    <div className='grid'>
      {MODES?.map(mode => (
        <Section
          key={mode}
          container_class={mode}
          title={`SECTION · ${mode}`}
          description='the meta word'
        >
          <StatCell label='AWAITING' value='3' is_active />
          <StatCell label='MEDIAN' value='84' />
          <StatCell label='LOOPS' value='1.4' />
        </Section>
      ))}

      <Section container_class='rule stacked' title='SECTION · stacked'>
        <StatCell label='ROWS INSTEAD OF COLUMNS' value='—' />
        <StatCell label='SECOND ROW' value='—' />
      </Section>
    </div>
  )
}

export default Demo
