import { StatCell } from '../StatCell'
import { Section } from '../../Section/Section'

const ACCENTS = ['accent-primary', 'accent-secondary', 'accent-accent', 'accent-warning', 'accent-error']

export const Demo = () => {
  return (
    <div className='grid'>

      <Section container_class='rule' title='READOUTS' description='is_active tints with the accent'>
        <StatCell label='AWAITING GRADE' value='3' is_active />
        <StatCell label='MEDIAN SCORE' value='84' />
        <StatCell label='REVISION LOOPS' value='1.4' />
      </Section>

      <Section container_class='rule stacked' title='THE ACCENT IS THE WRAPPER'>
        {ACCENTS?.map(accent => (
          <div key={accent} className={`grid ${accent}`}>
            <StatCell label={accent.replace('accent-', '').toUpperCase()} value='128' is_active />
          </div>
        ))}
      </Section>

      <Section container_class='rule' title='NO CONTAINER'>
        <StatCell container_class='' label='BARE' value='—' />
        <StatCell container_class='container-well' label='IN A WELL' value='42' />
        <StatCell container_class='container-metal' label='ON METAL' value='7' />
      </Section>

    </div>
  )
}

export default Demo
