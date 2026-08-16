// ASKS ONE QUESTION: is the form clean? Returns true/false, and says WHY in the
// form's message node on the way out.
//
// It reads the DOM rather than a state object because that is where the input
// groups put their verdict -- StatelessInputGroup adds .is-required / .has-error
// to its own container on blur. This function just tallies them up.
//
// PAIRED WITH getFormData, AND THE ORDER MATTERS: ask this first, fetch the data
// only if it says yes. They used to be one function (getFD) that returned the
// data OR undefined, and the caller could not tell "invalid" from "empty form" --
// so handleSubmit fired with undefined and nothing errored.

const MESSAGES = {
  required: 'Please fill out all required fields',
  errors: 'Please check the form for errors'
}

export const isValid = (form_el?: HTMLFormElement | null): boolean => {
  if (!form_el) return false

  const message_el = form_el.querySelector('[data-id="form-message"]') as HTMLElement

  const say = (message?: string) => {
    form_el.classList.add('has-errors')
    if (message_el) message_el.textContent = message || ''
  }

  if (form_el.querySelectorAll('.is-required')?.length) {
    say(MESSAGES.required)
    return false
  }

  if (form_el.querySelectorAll('.has-errors')?.length) {
    say(MESSAGES.errors)
    return false
  }

  return true
}

export default isValid
