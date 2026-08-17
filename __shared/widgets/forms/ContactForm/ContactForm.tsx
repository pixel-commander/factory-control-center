import './css/contact-form.css'
import FormWidget from '../FormWidget/FormWidget'
import { useFormWidget } from '../FormWidget/hooks/useFormWidget'
import type { InputGroupBaseProps } from '../../../components/StatelessForm/StatelessForm.types'
import type { OptionItemProps } from '../FormWidget/js/options'
import type { ContactFormProps } from './ContactForm.types'

/**
 * questions to ask:
 * 1. what type of grid layout
 * 2. does this contact-form loop through data? if so, what is the item_class
 * 3. is there a container_class for this contact-form?
 **/

const US_STATES: OptionItemProps[] = [
  { id: 'AL', name: 'Alabama' },
  { id: 'AK', name: 'Alaska' },
  { id: 'AZ', name: 'Arizona' },
  { id: 'AR', name: 'Arkansas' },
  { id: 'CA', name: 'California' },
  { id: 'CO', name: 'Colorado' },
  { id: 'CT', name: 'Connecticut' },
  { id: 'DE', name: 'Delaware' },
  { id: 'DC', name: 'District of Columbia' },
  { id: 'FL', name: 'Florida' },
  { id: 'GA', name: 'Georgia' },
  { id: 'HI', name: 'Hawaii' },
  { id: 'ID', name: 'Idaho' },
  { id: 'IL', name: 'Illinois' },
  { id: 'IN', name: 'Indiana' },
  { id: 'IA', name: 'Iowa' },
  { id: 'KS', name: 'Kansas' },
  { id: 'KY', name: 'Kentucky' },
  { id: 'LA', name: 'Louisiana' },
  { id: 'ME', name: 'Maine' },
  { id: 'MD', name: 'Maryland' },
  { id: 'MA', name: 'Massachusetts' },
  { id: 'MI', name: 'Michigan' },
  { id: 'MN', name: 'Minnesota' },
  { id: 'MS', name: 'Mississippi' },
  { id: 'MO', name: 'Missouri' },
  { id: 'MT', name: 'Montana' },
  { id: 'NE', name: 'Nebraska' },
  { id: 'NV', name: 'Nevada' },
  { id: 'NH', name: 'New Hampshire' },
  { id: 'NJ', name: 'New Jersey' },
  { id: 'NM', name: 'New Mexico' },
  { id: 'NY', name: 'New York' },
  { id: 'NC', name: 'North Carolina' },
  { id: 'ND', name: 'North Dakota' },
  { id: 'OH', name: 'Ohio' },
  { id: 'OK', name: 'Oklahoma' },
  { id: 'OR', name: 'Oregon' },
  { id: 'PA', name: 'Pennsylvania' },
  { id: 'RI', name: 'Rhode Island' },
  { id: 'SC', name: 'South Carolina' },
  { id: 'SD', name: 'South Dakota' },
  { id: 'TN', name: 'Tennessee' },
  { id: 'TX', name: 'Texas' },
  { id: 'UT', name: 'Utah' },
  { id: 'VT', name: 'Vermont' },
  { id: 'VA', name: 'Virginia' },
  { id: 'WA', name: 'Washington' },
  { id: 'WV', name: 'West Virginia' },
  { id: 'WI', name: 'Wisconsin' },
  { id: 'WY', name: 'Wyoming' },
  { id: 'PR', name: 'Puerto Rico' },
]

const COUNTRIES: OptionItemProps[] = [
  { id: 'US', name: 'United States' },
  { id: 'CA', name: 'Canada' },
  { id: 'GB', name: 'United Kingdom' },
  { id: 'IE', name: 'Ireland' },
  { id: 'AU', name: 'Australia' },
  { id: 'NZ', name: 'New Zealand' },
  { id: 'DE', name: 'Germany' },
  { id: 'FR', name: 'France' },
  { id: 'ES', name: 'Spain' },
  { id: 'IT', name: 'Italy' },
  { id: 'NL', name: 'Netherlands' },
  { id: 'MX', name: 'Mexico' },
  { id: 'JP', name: 'Japan' },
]

const FORM_FIELDS: InputGroupBaseProps[] = [
  { name: 'name', label: 'NAME', tab: 'INFO', is_required: true },
  { name: 'first_name', label: 'FIRST NAME', tab: 'INFO' },
  { name: 'last_name', label: 'LAST NAME', tab: 'INFO' },
  { name: 'title', label: 'TITLE', tab: 'INFO' },
  { name: 'tags', label: 'TAGS', type: 'check_list', source: 'tags', tab: 'INFO' },
  { name: 'address_1', label: 'ADDRESS', tab: 'INFO' },
  { name: 'address_2', label: 'ADDRESS LINE 2', tab: 'INFO' },
  { name: 'city', label: 'CITY', tab: 'INFO' },
  { name: 'region', label: 'STATE / REGION', type: 'select', items: US_STATES, default_value: 'IL', tab: 'INFO' },
  { name: 'postcode', label: 'POSTCODE', tab: 'INFO' },
  { name: 'country', label: 'COUNTRY', type: 'select', items: COUNTRIES, default_value: 'US', tab: 'INFO' },
  { name: 'details', label: 'DETAILS', type: 'textarea', tab: 'DETAILS', helper_text: 'Plain words - this is what someone reads first' },
]

export const ContactForm = (props: ContactFormProps) => {
  const {
    item, items, title, action, cancel, can_scroll, className, is_visible,
    handleSubmit, handleCancel, handleSave,
  } = props || {}

  const { handleSubmit: save } = useFormWidget('contacts', { handleSave })

  if (is_visible === false) return null

  const form_settings = {
    className,
    item,
    items: items && items.length ? items : FORM_FIELDS,
    title: title || (item ? 'EDIT CONTACT' : 'NEW CONTACT'),
    action: action || (item ? 'UPDATE CONTACT' : 'SAVE CONTACT'),
    cancel,
    can_scroll,
    handleSubmit: handleSubmit || save,
    handleCancel,
  }

  return <FormWidget {...form_settings} />
}

export default ContactForm
