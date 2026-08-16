import type { CodeProblem, ScanResult } from '../Ide.types'

const PAIRS: { [key: string]: string } = { '}': '{', ')': '(', ']': '[' }
const NAMES: { [key: string]: string } = { '{': 'brace', '(': 'paren', '[': 'bracket' }

const isCode = (lang: string) => lang === 'ts' || lang === 'tsx' || lang === 'css' || lang === 'json'

const scan = (text: string): ScanResult => {
  const said = String(text ?? '')
  const problems: CodeProblem[] = []
  const stack: { one: string; line: number; column: number }[] = []
  const depths: number[] = [0]
  const closes: number[] = [0]
  let line = 1
  let column = 1
  let mode = 'code'
  let quote = ''
  let opened = { line: 1, column: 1 }
  let line_start = true

  const step = () => { column += 1 }
  const newline = () => {
    line += 1
    column = 1
    line_start = true
    depths[line - 1] = stack.length
    closes[line - 1] = stack.length
  }

  for (let at = 0; at < said.length; at += 1) {
    const one = said[at]
    const next = said[at + 1]

    if (one === '\n') {
      if (mode === 'line_comment') mode = 'code'
      if (mode === 'string' && quote !== '`') {
        problems.push({ line, column, message: `Unterminated ${quote === '"' ? 'double' : 'single'}-quoted string` })
        mode = 'code'
      }
      newline()
      continue
    }

    if (mode === 'line_comment') { step(); continue }

    if (mode === 'block_comment') {
      if (one === '*' && next === '/') { mode = 'code'; at += 1; column += 1 }
      step()
      continue
    }

    if (mode === 'string') {
      if (one === '\\') { at += 1; column += 2; continue }
      if (one === quote) mode = 'code'
      step()
      continue
    }

    if (one === '/' && next === '/') { mode = 'line_comment'; at += 1; column += 1; step(); continue }
    if (one === '/' && next === '*') { mode = 'block_comment'; opened = { line, column }; at += 1; column += 1; step(); continue }
    if (one === '"' || one === "'" || one === '`') {
      mode = 'string'
      quote = one
      opened = { line, column }
      step()
      continue
    }

    if (one === '{' || one === '(' || one === '[') {
      stack.push({ one, line, column })
      if (line_start) closes[line - 1] = stack.length - 1
      line_start = false
      step()
      continue
    }
    if (one === '}' || one === ')' || one === ']') {
      const want = PAIRS[one]
      const top = stack[stack.length - 1]
      if (!top) problems.push({ line, column, message: `Stray closing ${NAMES[want]} '${one}'` })
      else if (top.one !== want) {
        problems.push({ line, column, message: `Closing '${one}' does not match the ${NAMES[top.one]} opened on line ${top.line}` })
        stack.pop()
      } else stack.pop()
      if (line_start) closes[line - 1] = stack.length
      line_start = false
      step()
      continue
    }

    if (one !== ' ' && one !== '\t') line_start = false
    step()
  }

  if (mode === 'string') problems.push({ line: opened.line, column: opened.column, message: 'Unterminated string' })
  if (mode === 'block_comment') problems.push({ line: opened.line, column: opened.column, message: 'Unterminated block comment' })
  stack.forEach((held) => {
    problems.push({ line: held.line, column: held.column, message: `Unclosed ${NAMES[held.one]} '${held.one}'` })
  })

  return { problems, depths, closes }
}

const VOIDS = 'area base br col embed hr img input link meta param source track wbr'.split(' ')
const tagCheck = (text: string, lang: string): CodeProblem[] => {
  if (lang !== 'tsx' && lang !== 'html') return []
  const said = String(text ?? '')
  const problems: CodeProblem[] = []
  const stack: { name: string; line: number }[] = []
  const all = /<\/?([A-Za-z][\w.-]*)((?:"[^"]*"|'[^']*'|\{[^}]*\}|[^>"'{])*?)(\/?)>/g
  let hit = all.exec(said)
  while (hit) {
    const line = said.slice(0, hit.index).split('\n').length
    const name = hit[1]
    const closing = hit[0][1] === '/'
    const self = hit[3] === '/' || VOIDS.indexOf(name.toLowerCase()) > -1
    if (closing) {
      const top = stack.pop()
      if (!top) problems.push({ line, column: 1, message: `</${name}> closes a tag that was never opened` })
      else if (top.name !== name) problems.push({ line, column: 1, message: `</${name}> should be </${top.name}> (opened on line ${top.line})` })
    } else if (!self) stack.push({ name, line })
    hit = all.exec(said)
  }
  stack.forEach((held) => problems.push({ line: held.line, column: 1, message: `<${held.name}> is never closed` }))
  return problems
}

export const check = (text: string, lang: string): CodeProblem[] => {
  const said = String(text ?? '')
  if (lang === 'json') {
    try {
      JSON.parse(said || 'null')
      return []
    } catch (error) {
      const message = String((error as Error)?.message || 'Invalid JSON')
      const at = /position (\d+)/.exec(message)
      const line = at ? said.slice(0, Number(at[1])).split('\n').length : 1
      return [{ line, column: 1, message: message.replace(/ in JSON at position \d+.*/, '') }]
    }
  }
  if (!isCode(lang) && lang !== 'html') return []
  return scan(said).problems.concat(tagCheck(said, lang)).slice(0, 30)
}

export const format = (text: string, lang: string) => {
  const said = String(text ?? '')
  if (lang === 'json') {
    try { return `${JSON.stringify(JSON.parse(said || 'null'), null, 2)}\n` } catch { return said }
  }
  const lines = said.replace(/[ \t]+$/gm, '').split('\n')
  if (!isCode(lang)) return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '')}\n`

  const { depths, closes } = scan(said)
  const out = lines.map((row, index) => {
    const bare = row.trim()
    if (!bare) return ''
    const depth = Math.max(0, Math.min(depths[index] ?? 0, closes[index] ?? depths[index] ?? 0))
    return `${'  '.repeat(depth)}${bare}`
  })
  return `${out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '')}\n`
}
