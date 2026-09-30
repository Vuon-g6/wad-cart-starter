// Zero-dependency format gate: whitespace rules only, nothing is rewritten.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const roots = ['src', 'test', 'scripts']
const problems = []

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

for (const file of roots.flatMap(walk).filter((f) => f.endsWith('.js'))) {
  const text = readFileSync(file, 'utf8')
  if (text.includes('\r')) problems.push(`${file}: CRLF line endings`)
  if (!text.endsWith('\n')) problems.push(`${file}: missing final newline`)
  text.split('\n').forEach((line, i) => {
    if (line.includes('\t')) problems.push(`${file}:${i + 1}: tab character`)
    if (/[ ]+$/.test(line)) problems.push(`${file}:${i + 1}: trailing spaces`)
  })
}

if (problems.length > 0) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log('format: ok')
