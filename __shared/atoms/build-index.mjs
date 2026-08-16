// REWRITES atoms/index.css FROM WHAT IS ON DISK.
//
// The index is a LIST, and a hand-kept list is a list that drifts: rename an
// atom and the import points at a file that no longer exists (the whole @import
// chain after it can die), delete one and you get a dead entry, add one and the
// class simply does not exist anywhere and nothing errors -- the button just
// renders unstyled and you go hunting.
//
// So it is generated. Run it after any add/rename/delete:
//
//   npm run atoms          (from __app)
//   node __shared/atoms/build-index.mjs
//
// THE RULE FOR BEING INCLUDED: a folder two levels down (group/atom) holding a
// css file named after itself -- atoms/buttons/button-solid/button-solid.css.
// That is the house stamp, so anything following it is picked up automatically
// and anything not following it is reported below rather than silently skipped.

import { readdirSync, statSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ATOMS_DIR = dirname(fileURLToPath(import.meta.url))
// imports.css, NOT index.css -- the name says "generated". A hand-editable file
// and a rewritten one must never share a name, or someone edits the wrong one and
// loses the work on the next run.
const OUT_FILE = join(ATOMS_DIR, 'imports.css')

const HEADER = `/* GENERATED -- do not edit by hand.
   Rewritten by __shared/atoms/build-index.mjs from the folders on disk.
   Add, rename or delete an atom, then run:  npm run atoms  */
`

const dirsIn = (path) => {
  if (!existsSync(path)) return []
  return readdirSync(path)
    .filter(name => !name.startsWith('.'))
    .filter(name => statSync(join(path, name)).isDirectory())
    .sort()
}

const groups = dirsIn(ATOMS_DIR)
const lines = []
const skipped = []
let count = 0

for (const group of groups) {
  const atoms = dirsIn(join(ATOMS_DIR, group))
  const found = []

  for (const atom of atoms) {
    // the stamp: <atom>/<atom>.css
    if (existsSync(join(ATOMS_DIR, group, atom, `${atom}.css`))) {
      found.push(`@import './${group}/${atom}/${atom}.css';`)
      count += 1
      continue
    }
    skipped.push(`${group}/${atom}  (no ${atom}.css)`)
  }

  if (!found.length) continue
  lines.push(`\n/* ${group} */`, ...found)
}

writeFileSync(OUT_FILE, `${HEADER}${lines.join('\n')}\n`, 'utf8')

console.log(`atoms/imports.css -- ${count} atom${count === 1 ? '' : 's'} across ${groups.length} group${groups.length === 1 ? '' : 's'}`)

// SAY WHAT WAS DROPPED. A folder that looks like an atom but has no matching css
// is either half-finished or misnamed, and either way silence is the wrong answer
// -- that is exactly the case where you would go looking for a class that never
// got written.
if (skipped.length) {
  console.log(`\nskipped ${skipped.length}:`)
  for (const s of skipped) console.log(`  ${s}`)
}

// AND WHAT IS LISTED BUT UNUSED IS NOT CHECKED HERE -- this only knows the disk.
// An atom can be in the index and worn by nothing; that is fine and not drift.
