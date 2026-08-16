// ONE FIELD'S VERDICT, WRITTEN WHERE THE FORM CAN SEE IT.
//
// StatelessForm's isValid() does not re-run any field's rules -- it TALLIES the
// classes this function leaves behind (.is-required / .has-error) on each input
// group container. So this is the half that decides, and isValid is the half
// that counts. Change a class name here and you must change it there.
//
// Lifted out of StatelessInputGroup for the same reason getFormData and isValid
// were lifted out of StatelessForm: the component should say WHEN to check, not
// HOW to check.

export const REQUIRED_CLASS = 'is-required'
export const ERROR_CLASS = 'has-error'
export const DEFAULT_ERROR = 'Invalid value'

interface ValidateFieldProps {
  container_el?: HTMLElement | null,
  value?: string | number,
  is_required?: boolean,
  validate?: (x?: string | number) => React.ReactNode
}

export const validateField = ({
  container_el,
  value,
  is_required,
  validate
}: ValidateFieldProps): boolean => {
  if (!container_el) return true

  const message_el = container_el.querySelector(`[data-id='form-group-message']`) as HTMLElement

  // REQUIRED WINS. An empty required field is not "invalid input", it is missing
  // input -- a different message and a different class, so it is asked first and
  // the custom rule never runs on a blank value.
  if (is_required) {
    const is_empty = value === '' || value === undefined || value === null
    container_el.classList.toggle(REQUIRED_CLASS, is_empty)
    if (is_empty) return false
  }

  if (!validate || !value) {
    container_el.classList.remove(ERROR_CLASS)
    return true
  }

  let message = validate(value)
  if (message === true) message = DEFAULT_ERROR

  if (message) {
    if (message_el) message_el.textContent = `${message}`
    container_el.classList.add(ERROR_CLASS)
    return false
  }

  container_el.classList.remove(ERROR_CLASS)
  return true
}

export default validateField
