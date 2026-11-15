// Kopiuje kod (bez notatek) do klonu publicznego repo `Psychologia`.
//
//   npm run publikuj-kod -- ../Psychologia_publiczne
//
// Bierze ostatni commit tego repo (`git archive HEAD`), pomija `content/`
// i podmienia w klonie wszystko poza `.git`, `node_modules` i `content`.
// Do .gitignore klonu dopisuje `/content/`, żeby prawdziwe notatki nigdy tam nie trafiły.
// W plikach .md wycina fragmenty między `<!-- prywatne -->` a `<!-- /prywatne -->` (scripts/prywatne.mjs).
// Commit i push w klonie robisz sama — chyba że dodasz `--wyslij`:
//   npm run publikuj-kod -- ../Psychologia_publiczne --wyslij
// Testy w publicznym repo działają na przykładowych notatkach z `przyklad/content/`.
import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { walk } from '../test/helpers.js'
import { hasOpenMarker, stripPrivate } from './prywatne.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const send = args.includes('--wyslij')
const folder = args.find((a) => !a.startsWith('--'))
const target = folder && resolve(folder)
const KEEP = new Set(['.git', 'node_modules', 'content'])

if (!target || !existsSync(join(target, '.git'))) {
  console.error('Podaj folder z klonem publicznego repo, np.: npm run publikuj-kod -- ../Psychologia_publiczne')
  process.exit(1)
}
if (execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' }).trim()) {
  console.error('Najpierw zrób commit — do publicznego repo idzie tylko to, co jest w ostatnim commicie.')
  process.exit(1)
}

for (const name of readdirSync(target)) {
  if (!KEEP.has(name)) rmSync(join(target, name), { recursive: true, force: true })
}

const tar = execFileSync('git', ['archive', '--format=tar', 'HEAD', '--', '.', ':(exclude)content'], {
  cwd: ROOT,
  maxBuffer: 256 * 1024 * 1024,
})
execFileSync('tar', ['-x', '-C', target], { input: tar })

// Prywatne fragmenty dokumentacji (ścieżki, klucze, opis prywatnego repo) nie idą dalej.
for (const name of readdirSync(target)) {
  if (KEEP.has(name)) continue
  const path = join(target, name)
  const files = name.endsWith('.md') ? [path] : statSync(path).isDirectory() ? walk(path).filter((f) => f.endsWith('.md')) : []
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    if (hasOpenMarker(text)) {
      console.error(`Niedomknięty znacznik <!-- prywatne --> w ${file} — popraw i uruchom jeszcze raz.`)
      process.exit(1)
    }
    const clean = stripPrivate(text)
    if (clean !== text) writeFileSync(file, clean)
  }
}

const ignore = join(target, '.gitignore')
if (!readFileSync(ignore, 'utf8').split('\n').includes('/content/')) {
  appendFileSync(ignore, '\n# Prawdziwe notatki są prywatne (Firestore i repo Psycho) — tu tylko przyklad/content/\n/content/\n')
}

const head = execFileSync('git', ['log', '-1', '--format=%h %s'], { cwd: ROOT, encoding: 'utf8' }).trim()
console.log(`Skopiowano kod z ${head} do ${target} (bez content/).`)
if (send) {
  const git = (...a) => execFileSync('git', a, { cwd: target, stdio: 'inherit' })
  git('add', '-A')
  if (execFileSync('git', ['status', '--porcelain'], { cwd: target, encoding: 'utf8' }).trim()) {
    git('commit', '-m', head.replace(/^\S+\s/, ''))
    git('push')
    console.log('Wysłano do publicznego repo.')
  } else {
    console.log('W publicznym repo nie ma nic do wysłania.')
  }
} else {
  console.log('Sprawdź `git status` w klonie, zrób commit i push (albo dodaj --wyslij).')
}
