const ESCAPES: { [key: string]: string } = { '&': '&amp;', '<': '&lt;', '>': '&gt;' }
export const escapeHtml = (said: string) => String(said).replace(/[&<>]/g, (one) => ESCAPES[one])

export const langOf = (name: string) => {
  const word = String(name || '').toLowerCase()
  const dot = word.lastIndexOf('.')
  const end = dot < 0 ? word : word.slice(dot + 1)
  if (end === 'tsx' || end === 'jsx') return 'tsx'
  if (end === 'ts' || end === 'js' || end === 'mjs') return 'ts'
  if (end === 'json') return 'json'
  if (end === 'css') return 'css'
  if (end === 'md' || end === 'markdown') return 'md'
  if (end === 'html') return 'html'
  return 'txt'
}

const KEYWORDS = ('const let var function return if else for while do break continue new class extends ' +
  'import export from default async await try catch finally throw typeof instanceof in of delete void ' +
  'interface type enum implements public private readonly static as satisfies null undefined true false this super yield').split(' ')

const RULES: { [key: string]: { kind: string; test: RegExp }[] } = {
  ts: [
    { kind: 'comment', test: /\/\*[\s\S]*?(?:\*\/|$)|\/\/[^\n]*/ },
    { kind: 'string', test: /`(?:\\[\s\S]|[^`\\])*`?|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/ },
    { kind: 'tag', test: /<\/?[A-Za-z][\w.-]*|\/?>/ },
    { kind: 'number', test: /\b\d[\d_.]*(?:e[+-]?\d+)?\b/i },
    { kind: 'word', test: /[A-Za-z_$][\w$]*/ },
    { kind: 'punct', test: /[{}()[\];,.:?!=+\-*/%<>&|^~]+/ },
  ],
  json: [
    { kind: 'key', test: /"(?:\\.|[^"\\])*"(?=\s*:)/ },
    { kind: 'string', test: /"(?:\\.|[^"\\])*"?/ },
    { kind: 'number', test: /-?\b\d[\d.]*(?:e[+-]?\d+)?\b/i },
    { kind: 'keyword', test: /\b(?:true|false|null)\b/ },
    { kind: 'punct', test: /[{}[\],:]/ },
  ],
  css: [
    { kind: 'comment', test: /\/\*[\s\S]*?(?:\*\/|$)/ },
    { kind: 'string', test: /"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/ },
    { kind: 'keyword', test: /--[\w-]+|@[\w-]+/ },
    { kind: 'key', test: /[a-z-]+(?=\s*:)/ },
    { kind: 'number', test: /-?\b\d[\d.]*(?:px|rem|em|%|vh|vw|s|ms|deg)?\b/ },
    { kind: 'tag', test: /\.[\w-]+|#[\w-]+|\[[^\]\n]*\]|:{1,2}[a-z-]+/ },
    { kind: 'punct', test: /[{};,>+~()]/ },
  ],
  md: [
    { kind: 'head', test: /^#{1,6} [^\n]*/m },
    { kind: 'comment', test: /^> [^\n]*/m },
    { kind: 'string', test: /```[\s\S]*?(?:```|$)|`[^`\n]*`?/ },
    { kind: 'keyword', test: /^\s*(?:[-*+]|\d+\.) /m },
    { kind: 'tag', test: /\[[^\]\n]*\]\([^)\n]*\)/ },
    { kind: 'number', test: /\*\*[^*\n]+\*\*|__[^_\n]+__/ },
    { kind: 'key', test: /\*[^*\n]+\*|_[^_\n]+_/ },
  ],
  html: [
    { kind: 'comment', test: /<!--[\s\S]*?(?:-->|$)/ },
    { kind: 'string', test: /"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/ },
    { kind: 'tag', test: /<\/?[A-Za-z][\w-]*|\/?>/ },
    { kind: 'key', test: /[a-z-]+(?==)/ },
  ],
}
RULES.tsx = RULES.ts

const CACHE: { [key: string]: { rules: { kind: string; test: RegExp }[]; all: RegExp } } = {}
const compile = (lang: string) => {
  if (CACHE[lang]) return CACHE[lang]
  const rules = RULES[lang] || []
  const all = new RegExp(rules.map((rule) => `(${rule.test.source})`).join('|'),
    rules.some((rule) => rule.test.flags.indexOf('m') > -1) ? 'gmi' : 'gi')
  CACHE[lang] = { rules, all }
  return CACHE[lang]
}

export const highlight = (text: string, lang: string) => {
  const said = String(text ?? '')
  const { rules, all } = compile(lang)
  if (!rules.length) return escapeHtml(said)

  let out = ''
  let at = 0
  all.lastIndex = 0
  let hit = all.exec(said)
  while (hit) {
    if (hit.index > at) out += escapeHtml(said.slice(at, hit.index))
    let kind = rules[0].kind
    for (let n = 1; n < hit.length; n += 1) {
      if (hit[n] !== undefined) { kind = rules[n - 1].kind; break }
    }
    const word = hit[0]
    if (kind === 'word') {
      if (KEYWORDS.indexOf(word) > -1) kind = 'keyword'
      else if (/^[A-Z]/.test(word)) kind = 'type'
      else if (said[all.lastIndex] === '(') kind = 'call'
      else kind = 'plain'
    }
    out += kind === 'plain' ? escapeHtml(word) : `<span class="tok tok--${kind}">${escapeHtml(word)}</span>`
    at = all.lastIndex
    if (all.lastIndex === hit.index) all.lastIndex += 1
    hit = all.exec(said)
  }
  out += escapeHtml(said.slice(at))
  return out
}
