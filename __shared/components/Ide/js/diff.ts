import type { DiffRow, DiffGap } from '../Ide.types'

const CAP = 4000

export const diffLines = (before: string, after: string): DiffRow[] => {
  const a = String(before ?? '').split('\n')
  const b = String(after ?? '').split('\n')

  if (a.length * b.length > CAP * CAP) {
    return [
      ...a.map((line, index) => ({ kind: 'del' as const, left: line, right: null, left_no: index + 1, right_no: null })),
      ...b.map((line, index) => ({ kind: 'add' as const, left: null, right: line, left_no: null, right_no: index + 1 })),
    ]
  }

  const table: number[][] = []
  for (let i = a.length; i >= 0; i -= 1) {
    table[i] = table[i] || []
    for (let j = b.length; j >= 0; j -= 1) {
      if (i === a.length || j === b.length) table[i][j] = 0
      else if (a[i] === b[j]) table[i][j] = table[i + 1][j + 1] + 1
      else table[i][j] = Math.max(table[i + 1][j], table[i][j + 1])
    }
  }

  const out: DiffRow[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ kind: 'same', left: a[i], right: b[j], left_no: i + 1, right_no: j + 1 })
      i += 1
      j += 1
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      out.push({ kind: 'del', left: a[i], right: null, left_no: i + 1, right_no: null })
      i += 1
    } else {
      out.push({ kind: 'add', left: null, right: b[j], left_no: null, right_no: j + 1 })
      j += 1
    }
  }
  while (i < a.length) { out.push({ kind: 'del', left: a[i], right: null, left_no: i + 1, right_no: null }); i += 1 }
  while (j < b.length) { out.push({ kind: 'add', left: null, right: b[j], left_no: null, right_no: j + 1 }); j += 1 }
  return out
}

export const diffCount = (rows: DiffRow[]) => ({
  added: rows.filter((row) => row.kind === 'add').length,
  removed: rows.filter((row) => row.kind === 'del').length,
})

export const withContext = (rows: DiffRow[], around = 3): (DiffRow | DiffGap)[] => {
  const keep: boolean[] = rows.map((row) => row.kind !== 'same')
  rows.forEach((row, index) => {
    if (row.kind === 'same') return
    for (let n = Math.max(0, index - around); n <= Math.min(rows.length - 1, index + around); n += 1) keep[n] = true
  })
  const out: (DiffRow | DiffGap)[] = []
  let skipped = 0
  rows.forEach((row, index) => {
    if (keep[index]) {
      if (skipped) { out.push({ kind: 'gap', count: skipped }); skipped = 0 }
      out.push(row)
    } else skipped += 1
  })
  if (skipped) out.push({ kind: 'gap', count: skipped })
  return out
}
