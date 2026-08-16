import { useRef } from 'react'
import type { FormEventHandler, ReactNode } from 'react'
import { StatelessInputGroup } from './StatelessInputGroup'
import { getFormData } from './js/getFormData'
import { isValid } from './js/isValid'
import type { StatelessFormProps } from './StatelessForm.types'
import './css/stateless-form.css'
import './css/form-main.css'
import './css/input-group-main.css'

interface Props extends StatelessFormProps {
  children?: ReactNode
}

export const StatelessForm = ({
  className = 'form-main',
  view_mode = false,
  container_ref,
  form_class = 'container-main',
  input_group_class = 'input-group-main',
  submit_class = 'button-solid',
  cancel_class = 'button-ghost',
  tabs_class = 'container-panel inset',
  tab_nav_class = 'container-panel inset',
  tab_button_class = 'button-glow',
  tab_class = 'container-cell',
  ...props
}: Props): React.JSX.Element => {

  className = `stateless-form ${className || ``}`.trim()

  const { button_text, form_fields, form_tabs, children  } = props

  container_ref = container_ref || useRef<HTMLFormElement>(null)

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    if (!isValid(container_ref?.current)) return
    return props?.handleSubmit?.(getFormData(container_ref?.current))
  }

  const handleBlur: FormEventHandler<HTMLFormElement> = (e) => {
    if (!(e?.target as HTMLInputElement)?.value) return
    if (!isValid(container_ref?.current)) return
    return props?.handleBlur?.(getFormData(container_ref?.current))
  }

  const handleCancel = () => props?.handleCancel?.()

  const toggleView = (tabName: string) => {
    container_ref?.current?.querySelectorAll('[data-tab]')?.forEach(el => {
      if (el.getAttribute('data-tab') === tabName) {
        el.classList.add('active')
        el.classList.remove('hidden')
      }
      else {
        el.classList.remove('active')
        el.classList.add('hidden')
      }
    })
  }

  const form_settings = {
    className: `${className}${view_mode ? ' view-mode' : ''} ${form_class || ''}`.trim(),
    ref: container_ref,
    onSubmit: handleSubmit,
    onBlur: handleBlur
  }
  
  return (
    <form {...form_settings}>

      <div data-id='form-message' className='stateless-form-message'></div>

      {form_fields &&
        <div className='stateless-form-fields'>
          {form_fields?.map((field, i) => (
            !field?.spacer
              ? <StatelessInputGroup key={field.name} view_mode={view_mode} className={input_group_class} {...field} />
              : <div key={`spacer-${i}`} className='stateless-form-spacer'>{field?.spacer || ' '}</div>
          ))}
        </div>}

      {form_tabs &&
        <div className={`stateless-form-tabs ${tabs_class || ''}`.trim()}>
          <div className={`stateless-form-tabs-nav ${tab_nav_class || ''}`.trim()}>
            {Object.keys(form_tabs).map((tabName, i) =>
              <button type='button' key={tabName} className={`stateless-form-tab-name ${tab_button_class || ''}${i === 0 ? ' active' : ''}`.trim()} onClick={() => toggleView(tabName)}>{tabName}</button>
            )}
          </div>
          {Object.entries(form_tabs).map(([tabName, tabFields], i) => {
            return <div key={tabName} className={`stateless-form-tab ${tab_class || ''}${i === 0 ? ' active' : ' hidden'}`.trim()} data-tab={tabName}>
              <div className='stateless-form-tab-fields'>
                {tabFields?.map((field, i) => (
                  !field?.spacer
                    ? <StatelessInputGroup view_mode={view_mode} key={field.name} className={input_group_class} {...field} />
                    : <div key={`spacer-${i}`} className='stateless-form-spacer'>{field?.spacer || ' '}</div>
                ))}
              </div>
            </div>
          })}
        </div>}

      {children &&
        <div className='stateless-form-children'>
          {children}
        </div>}

      <div className='stateless-form-buttons'>
        {!view_mode ? <>
          {!className.includes('hide-cancel') &&
            <button type='button' className={`cancel ${cancel_class || ''}`.trim()} onClick={() => handleCancel?.()}>{button_text?.cancel || `Cancel`}</button>}
          {!className.includes('hide-submit') &&
            <input type='submit' className={`submit ${submit_class || ''}`.trim()} value={button_text?.submit || `Submit`} />}
        </> : <></>}
      </div>

    </form>
  )
}
