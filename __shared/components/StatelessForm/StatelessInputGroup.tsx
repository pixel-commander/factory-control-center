import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { StatelessInputGroupProps, StatelessInputGroupHandlerProps, FormFieldElement } from './StatelessForm.types';
import { validateField } from './js/validateField';

export const StatelessInputGroup = ({
  type = 'text',
  view_mode = false,
  tab_index,
  className,
  validate,
  Container,
  Components,
  children,
  ...props
}: StatelessInputGroupProps): React.JSX.Element => {

  const { Label, Message } = Components || {}

  const { label, helper_text, error_message, id, name, is_required, default_value } = props || {}
  let { value } = props || {}
  if (type === 'select') value = value || default_value

  const container_ref = useRef<HTMLDivElement>(null)

  className = `input-group input-group--${type} input-group--${name || 'undefined'} ${className || ''}`.trim()

  if (helper_text) className += ' has-helper'
  if (error_message) className += ' has-error'

  if (view_mode && ((!value && !default_value) || value === '')) return <></>

  const handleChange: StatelessInputGroupHandlerProps = (e) => {
    const container_el = container_ref?.current
    if (!container_el) return

    container_el?.classList.remove('has-error')
    if (type === 'select') props?.handleSelect?.({ [name]: e?.target?.value }, props)

    return props?.handleChange?.(e, props)
  }

  const handleBlur: StatelessInputGroupHandlerProps = (e) => {
    const container_el = container_ref?.current
    if (!container_el) return

    const value = e?.target?.value

    validateField({ container_el, value, is_required, validate })

    return props?.handleBlur?.(e, props)
  }

  const collectChecks = () => {
    const container_el = container_ref?.current
    if (!container_el) return

    const holder_el = container_el.querySelector(`input[type='hidden']`) as HTMLInputElement
    if (!holder_el) return

    const boxes = container_el.querySelectorAll<HTMLInputElement>(`input[type='checkbox']`)
    const checked_ids: string[] = []
    boxes.forEach((box: HTMLInputElement) => { if (box.checked) checked_ids.push(box.value) })
    holder_el.value = checked_ids.join(',')
  }

  const input_settings: {
    defaultValue?: string | number;
    tabIndex?: number;
    id?: string;
    name: string;
    type: string;
    required?: boolean;
    value?: string | number;
    onChange?: (e: any) => void;
    onBlur?: (e: any) => void;
    onFocus?: (e: any) => void;
    onKeyDown?: (e: KeyboardEvent<FormFieldElement>) => void;
  } = {
    tabIndex: tab_index,
    id: id || name,
    name,
    type,
    required: is_required,
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: props?.handleFocus,
  }

  const Wrapper = Container || 'div'

  const { type: input_type, ...field_settings } = input_settings

  let InputToUse = <input {...input_settings} defaultValue={default_value || value} />

  if (Components?.Input) InputToUse = <Components.Input {...input_settings} defaultValue={default_value || value} />

  if (type === 'textarea') InputToUse =
    <textarea {...field_settings} defaultValue={`${default_value || value || ''}`} />

  if (type === 'select') InputToUse =
    <select {...field_settings} defaultValue={default_value}>
      <option value=''>Select</option>
      {props?.items
        ? props.items.map((item, i) => {
            return <option key={item.id || i} value={item.id}>{item.name || 'n/a'}</option>
          })
        : props?.options?.map((option: string, i: number) => {
            return <option key={option || i} value={option}>{option || 'n/a'}</option>
          })}
    </select>

  const list_items = props?.items || props?.options?.map(option => ({ id: option, name: option })) || []

  if (type === 'check_list') {
    const checked_ids = `${default_value || value || ''}`.split(',').map(entry => entry.trim()).filter(Boolean)
    InputToUse =
      <div>
        <input type='hidden' id={id || name} name={name} defaultValue={`${default_value || value || ''}`} />
        {list_items.map((item, i) =>
          <label key={item.id || i}>
            <input type='checkbox' value={item.id} tabIndex={tab_index} defaultChecked={checked_ids.includes(item.id)} onChange={collectChecks} />
            {item.name || 'n/a'}
          </label>)}
      </div>
  }

  if (type === 'radio_list') InputToUse =
    <div>
      {list_items.map((item, i) =>
        <label key={item.id || i}>
          <input type='radio' name={name} value={item.id} tabIndex={tab_index} defaultChecked={`${default_value || value || ''}` === item.id} />
          {item.name || 'n/a'}
        </label>)}
    </div>

  const LabelComponent = () => {
    if (Label) return <Label data-id='form-group-label' className='input-group-label' htmlFor={name} {...props} />
    if (!label) return <></>
    return (
      <label data-id='form-group-label' className='input-group-label' htmlFor={name}>
        {label}
        {is_required && <span className='red-star'>*</span>}
      </label>
    )
  }

  const MessageComponent = () => {
    if (Message) return <Message data-id='form-group-message' className='input-group-message' {...props} />
    return <div data-id='form-group-message' className='input-group-message'>{helper_text}</div>
  }

  const group_settings = {
    className,
    ref: container_ref,
    'data-id': 'inputgroup',
    'data-inputgroup': name
  }

  if (view_mode) return (
    <Wrapper {...group_settings}>
      <div className='form-group-label'>{label}</div>
      <div className='form-group-input'>{value || default_value || '-'}</div>
    </Wrapper>
  )

  return (
    <Wrapper {...group_settings}>
      <LabelComponent />
      {InputToUse}
      {children}
      <MessageComponent />
    </Wrapper>
  )
}

export default StatelessInputGroup
