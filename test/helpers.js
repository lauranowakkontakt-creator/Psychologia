import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

export const ROOT = new URL('..', import.meta.url).pathname

// Prawdziwe pliki z content/ w tym samym kształcie, w jakim podaje je Vite.
export function loadContentFiles() {
  const files = {}
  for (const file of walk(join(ROOT, 'content'))) {
    if (file.endsWith('.md')) files['/' + relative(ROOT, file)] = readFileSync(file, 'utf8')
  }
  return files
}

export function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    // ._plik to „cień” zapisywany przez macOS na dyskach exFAT, nie prawdziwy plik.
    if (name.startsWith('._')) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}
