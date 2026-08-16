import type { UiProps } from '../../../../RAB.types'
import type { IdeFileProps, CodeReport, CodeHandle } from '../Ide.types'

export interface CodeViewerProps extends Omit<UiProps, 'items'> {
  area?: string,
  items?: IdeFileProps[],
  text_alt?: string,
  can_diff?: boolean,
  handleReport?: (state: CodeReport) => void,
  code_ref?: (handle: CodeHandle | null) => void,
}
