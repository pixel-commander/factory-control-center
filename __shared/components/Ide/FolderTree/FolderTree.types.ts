import type { UiProps } from '../../../../RAB.types'
import type { IdeFileProps } from '../Ide.types'

export interface FolderTreeProps extends Omit<UiProps, 'items'> {
  mode?: string,
  style_type?: string,
  area?: string,
  items?: IdeFileProps[],
  expanded?: Record<string, boolean>,
}

export interface TreeLine {
  id: string,
  kind: 'folder' | 'file',
  name: string,
  depth: number,
  row?: IdeFileProps,
}
