import type { FormEvent, FocusEvent, ReactNode } from "react";

export interface InputGroupBaseProps {
  tab_index?: number;
  label?: ReactNode;
  helper_text?: string;
  error_message?: string;
  id?: string;
  name: string;
  is_required?: boolean;
  type?: string;
  value?: string | number;
  default_value?: string | number;
  options?: string[];
  [key: string]: unknown;
  validate?: (x?: string | number) => ReactNode;
  spacer?: 'string';
}

// EVERY FIELD ELEMENT, not just <input>. A select and a textarea raise the same
// blur and change events, and typing this to HTMLInputElement alone is why every
// handler assignment errored.
export type FormFieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type StatelessInputGroupHandlerProps = (e: FocusEvent<FormFieldElement>, props?: InputGroupBaseProps) => void;

export interface StatelessInputGroupHandlerBagProps {
  handleBlur?: StatelessInputGroupHandlerProps
  handleFocus?: StatelessInputGroupHandlerProps
  handleChange?: StatelessInputGroupHandlerProps
  handleSelect?: (x?: Record<string, unknown>, props?: InputGroupBaseProps) => void
}

export interface StatelessInputGroupProps extends InputGroupBaseProps, StatelessInputGroupHandlerBagProps {
  Container?: (x?: Record<string, unknown>) => React.JSX.Element;
  Components?: {
    GroupContainer?: (x?: Record<string, unknown>) => React.JSX.Element;
    Label?: (x?: Record<string, unknown>) => React.JSX.Element;
    Input?: (x?: Record<string, unknown>) => React.JSX.Element;
    Message?: (x?: Record<string, unknown>) => React.JSX.Element;
  },
  className?: string;
  view_mode?: boolean;
  children?: ReactNode;
}

export type StatelessFormHandlerProps = (data: { [k: string]: FormDataEntryValue }, e?: FormEvent) => void

export interface StatelessFormBaseProps {
  form_fields?: InputGroupBaseProps[];
  form_tabs?: Record<string, InputGroupBaseProps[]>;
  name?: string;
  id?: string;
  handleSubmit?: StatelessFormHandlerProps;
  handleChange?: StatelessFormHandlerProps;
  handleBlur?: StatelessFormHandlerProps
  handleCancel?: () => void;
  handleFocus?: StatelessInputGroupHandlerProps
}

export interface StatelessFormProps extends StatelessFormBaseProps {
  handleInputChange?: StatelessInputGroupHandlerProps;
  className?: string;
  view_mode?: boolean;
  form_class?: string;
  input_group_class?: string;
  submit_class?: string;
  cancel_class?: string;
  tabs_class?: string;
  tab_nav_class?: string;
  tab_button_class?: string;
  tab_class?: string;
  type?: string;
  inputGroupHandlers?: StatelessInputGroupHandlerBagProps;
  button_text?: {
    submit?: string;
    cancel?: ReactNode;
  },
  container_ref?: React.RefObject<HTMLFormElement | null>;
}
