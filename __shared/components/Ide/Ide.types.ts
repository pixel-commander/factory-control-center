import type * as React from 'react'
import type { UiProps } from '../../../RAB.types'

export interface IdeFileProps {
  id?: number | string,
  name?: string,
  path?: string,
  lang?: string,
  bytes?: number,
  text?: string,
  text_alt?: string,
  is_dirty?: boolean,
}

export interface CodeProblem {
  line: number,
  column: number,
  message: string,
}

export interface CodeReport {
  problems: CodeProblem[],
  line: number,
  lines: number,
  lang: string,
  is_dirty: boolean,
  saved_at: string,
}

export interface CodeHandle {
  save: () => void,
  format: () => void,
  goTo: (row: number) => void,
  text: () => string,
}

export interface DiffRow {
  kind: 'same' | 'add' | 'del',
  left: string | null,
  right: string | null,
  left_no: number | null,
  right_no: number | null,
}

export interface DiffGap {
  kind: 'gap',
  count: number,
}

export interface ScanResult {
  problems: CodeProblem[],
  depths: number[],
  closes: number[],
}

export interface IdeProps extends Omit<UiProps, 'items'> {
  mode?: string,
  style_type?: string,
  area?: string,
  items?: IdeFileProps[],
}

export interface CodeTabsWrapperProps extends Omit<UiProps, 'items'> {
  mode?: string,
  area?: string,
  items?: IdeFileProps[],
  text_alt?: string,
  can_diff?: boolean,
  handleReport?: (state: CodeReport) => void,
}

export type ReactKeyEvent = React.KeyboardEvent<HTMLDivElement>
export type ReactPasteEvent = React.ClipboardEvent<HTMLDivElement>
