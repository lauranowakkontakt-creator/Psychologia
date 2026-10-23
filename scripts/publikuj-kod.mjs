// Kopiuje kod (bez notatek) do klonu publicznego repo `Psychologia`.
//
//   npm run publikuj-kod -- ../Psychologia_publiczne
//
// Bierze ostatni commit tego repo (`git archive HEAD`), pomija `content/`
// i podmienia w klonie wszystko poza `.git`, `node_modules` i `content`.
// Do .gitignore klonu dopisuje `/content/`, żeby prawdziwe notatki nigdy tam nie trafiły.
// Commit i push w klonie robisz sama — skrypt niczego nie wysyła.
// Testy w publicznym repo działają na przykładowych notatkach z `przyklad/content/`.
import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const target = process.argv[2] && resolve(process.argv[2])
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

const ignore = join(target, '.gitignore')
if (!readFileSync(ignore, 'utf8').split('\n').includes('/content/')) {
  appendFileSync(ignore, '\n# Prawdziwe notatki są prywatne (Firestore i repo Psycho) — tu tylko przyklad/content/\n/content/\n')
}

const head = execFileSync('git', ['log', '-1', '--format=%h %s'], { cwd: ROOT, encoding: 'utf8' }).trim()
console.log(`Skopiowano kod z ${head} do ${target} (bez content/).`)
console.log('Sprawdź `git status` w klonie, zrób commit i push.')
