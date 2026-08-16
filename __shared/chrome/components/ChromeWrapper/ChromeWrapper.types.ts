export interface ChromeWrapperProps {
  className?: string,
  wrapper_class?: string,
  body_class?: string,
  // the frame with none of the hardware -- just the case and its inner shadows
  has_rails?: boolean,
  container_ref?: React.RefObject<HTMLDivElement | null>,
  children?: React.ReactNode
}
