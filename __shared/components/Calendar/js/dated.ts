export const DAY_MS = 86400000

export const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export const MONTHS_LONG = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']

export const DOW = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const mondayOf = (date: Date): Date => {
  const day = startOfDay(date)
  return new Date(day.getTime() - ((day.getDay() + 6) % 7) * DAY_MS)
}

export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const dateOf = (raw?: unknown): Date | null => {
  if (raw === undefined || raw === null || raw === '') return null

  const word = String(raw)

  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(word)
  if (plain) return new Date(Number(plain[1]), Number(plain[2]) - 1, Number(plain[3]))

  const stamp = Number(raw)
  const date = Number.isFinite(stamp) && word.length > 6 ? new Date(stamp) : new Date(word)
  return Number.isNaN(date.getTime()) ? null : date
}

export const timeOf = (raw?: unknown): number => {
  const date = dateOf(raw)
  return date ? startOfDay(date).getTime() : 0
}

export const timeWord = (date?: Date | null): string =>
  date ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}` : ''

export const dayWord = (date?: Date | null): string =>
  date ? `${DOW[(date.getDay() + 6) % 7]} ${date.getDate()} ${MONTHS[date.getMonth()]}` : 'UNDATED'

export const longDayWord = (date?: Date | null): string =>
  date ? `${dayWord(date)} ${date.getFullYear()}` : 'UNDATED'

export const wordOfDated = (item?: Record<string, unknown>): string =>
  String(item?.label || item?.title || item?.name || '')

export const titleOf = (view?: string, anchor?: Date): string => {
  if (!anchor) return ''

  if (view === 'day') {
    return `${DOW[(anchor.getDay() + 6) % 7]} · ${MONTHS[anchor.getMonth()]} ${anchor.getDate()} ${anchor.getFullYear()}`
  }

  if (view === 'week') {
    const first = mondayOf(anchor)
    const last = new Date(first.getTime() + (35 - 1) * DAY_MS)
    return `${MONTHS[first.getMonth()]} ${first.getDate()} – ${MONTHS[last.getMonth()]} ${last.getDate()}`
  }

  return `${MONTHS_LONG[anchor.getMonth()]} ${anchor.getFullYear()}`
}
