// Zero-dependency lint gate: every .js file must at least parse.
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const roots = ['src', 'test', 'scripts']
let failed = false

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

for (const file of roots.flatMap(walk).filter((f) => f.endsWith('.js'))) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
  if (result.status !== 0) {
    failed = true
    console.error(`lint: ${file}\n${result.stderr}`)
  }
}

if (failed) process.exit(1)
console.log('lint: ok')
