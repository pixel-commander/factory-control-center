import { useState } from 'react';
import { StatelessForm } from '../StatelessForm';
import { GridCell } from '../../GridCell/GridCell';

// BOTH SHAPES, ONE DEMO. form_fields and form_tabs are the two ways the same
// component takes its fields, so they belong side by side in the one demo rather
// than in two -- a component has ONE demo/Demo.tsx.

const CONTACT_FIELDS = [
  { name: 'full_name', label: 'Full Name', placeholder: 'Ada Lovelace', is_required: true },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'ada@example.com', is_required: true },
  { name: 'role', label: 'Role', type: 'select', options: ['Owner', 'Editor', 'Viewer'], default_value: 'Editor' },
  { name: 'starts_on', label: 'Starts On', type: 'date' },
  { name: 'notes', label: 'Notes', type: 'textarea', rows: 4, placeholder: 'anything worth keeping' },
];

// form_tabs IS A MAP, NOT A LIST: the KEY is the tab's label and the value is
// that tab's fields. The first key renders open; the rest start hidden.
const ACCOUNT_TABS = {
  profile: [
    { name: 'full_name', label: 'Full Name', placeholder: 'Ada Lovelace', is_required: true },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'ada@example.com', is_required: true },
    { name: 'role', label: 'Role', type: 'select', options: ['Owner', 'Editor', 'Viewer'], default_value: 'Editor' },
  ],
  access: [
    { name: 'username', label: 'Username', placeholder: 'alovelace' },
    { name: 'team', label: 'Team', type: 'select', options: ['Platform', 'Controls', 'Floor'] },
    { name: 'starts_on', label: 'Starts On', type: 'date' },
  ],
  notes: [
    { name: 'summary', label: 'Summary', placeholder: 'one line' },
    { name: 'detail', label: 'Detail', type: 'textarea', rows: 4, placeholder: 'anything worth keeping' },
  ],
};

export const Demo = () => {
  const [form_data, setFormData] = useState<Record<string, unknown>>()
  const [tabs_data, setTabsData] = useState<Record<string, unknown>>()

  const form_settings = {
    form_fields: CONTACT_FIELDS,
    handleSubmit: (x?: Record<string, unknown>) => setFormData(x)
  }

  const tabs_settings = {
    form_tabs: ACCOUNT_TABS,
    handleSubmit: (x?: Record<string, unknown>) => setTabsData(x)
  }

  return (
    <div className='grid'>

      <div className='grid with-header with-footer'>
        <GridCell area='header'>Stateless Form -- fields</GridCell>
        <GridCell area='main' className='side-l'>
            <GridCell area='side'>
               <StatelessForm {...form_settings}/>
            </GridCell>
            <GridCell area='main'>
              {JSON.stringify(form_data)}
            </GridCell>
        </GridCell>
        <GridCell area='footer'>v1</GridCell>
      </div>

      <div className='grid with-header with-footer'>
        <GridCell area='header'>Stateless Form -- tabs</GridCell>
        <GridCell area='main' className='side-l'>
            <GridCell area='side'>
               <StatelessForm {...tabs_settings}/>
            </GridCell>
            <GridCell area='main'>
              {JSON.stringify(tabs_data)}
            </GridCell>
        </GridCell>
        <GridCell area='footer'>v1</GridCell>
      </div>

    </div>
  );
};

export default Demo;
