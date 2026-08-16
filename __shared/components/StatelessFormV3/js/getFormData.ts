// GET THE DATA. That is the whole job.
//
// It used to live inside getFD, which ALSO validated and ALSO wrote the error
// message to the DOM -- three jobs, one function, and the seam between them is
// where the bug was: when validation failed getFD returned undefined, and the
// caller handed that undefined straight to handleSubmit. The submit handler
// fired with no data instead of not firing at all. Nothing errored.
//
// So this returns the data or nothing, and it decides nothing else. Whether the
// form is ALLOWED to submit is the caller's question, asked separately.

export const getFormData = (form_el?: HTMLFormElement | null): Record<string, FormDataEntryValue> => {
  if (!form_el) return {}
  return Object.fromEntries(new FormData(form_el))
}

export default getFormData
