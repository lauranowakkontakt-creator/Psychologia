// Wysyła notatki z content/ do Firestore (wersja z logowaniem).
//
//   npm run wyslij-notatki -- --sprawdz        tylko policz paczki, nic nie wysyłaj
//   npm run wyslij-notatki                     wyślij (potrzebny klucz serwisowy, niżej)
//   npm run wyslij-notatki -- --z ../Psycho/content   notatki z innego folderu
//
// Klucz serwisowy: konsola Firebase -> Ustawienia projektu -> Konta usługi ->
// „Wygeneruj nowy klucz prywatny”. Plik zapisz POZA repozytorium (albo jako
// klucz-serwisowy.json — jest w .gitignore) i wskaż go zmienną:
//   GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json npm run wyslij-notatki
// Konto serwisowe omija reguły Firestore — dlatego klucz nigdy nie trafia do repo.
//
// Notatki lądują w `tresc/p01`, `tresc/p02`… (paczki do ~900 KB) i `tresc/_spis`
// (wersja, lista paczek, daty dodania). Paczki, których już nie ma, są usuwane.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { contentVersion, packChunks } from '../src/lib/chunks.js'
import { parseGitAdded } from '../src/lib/added.js'
import { walk } from '../test/helpers.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const dryRun = args.includes('--sprawdz')
const fromIndex = args.indexOf('--z')
const contentDir = resolve(fromIndex >= 0 ? args[fromIndex + 1] : join(ROOT, 'content'))

// Ścieżki w tym samym kształcie co w aplikacji: 'content/studia/...md'.
const files = {}
for (const file of walk(contentDir)) {
  if (file.endsWith('.md')) files[`content/${relative(contentDir, file)}`] = readFileSync(file, 'utf8')
}
if (!Object.keys(files).length) {
  console.error(`Brak notatek w ${contentDir}`)
  process.exit(1)
}

let added = {}
try {
  const log = execFileSync('git', ['log', '--reverse', '--name-status', '-M', '--format=@%cI', '--', '.'], {
    cwd: contentDir,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
  // git podaje ścieżki od korzenia repo; przycinamy je do części od content/.
  const prefix = execFileSync('git', ['rev-parse', '--show-prefix'], { cwd: contentDir, encoding: 'utf8' }).trim()
  for (const [path, date] of Object.entries(parseGitAdded(log.replaceAll(`\t${prefix}`, '\tcontent/')))) {
    if (files[path]) added[path] = date
  }
} catch {
  console.warn('Bez historii gita — „Ostatnio dodane” będzie puste (albo z pól `dodano:`).')
}

const chunks = packChunks(files)
const version = contentVersion(files)
const kb = (s) => `${Math.round(new TextEncoder().encode(JSON.stringify(s)).length / 1024)} KB`
console.log(`Notatki: ${Object.keys(files).length} plików, wersja ${version}`)
for (const c of chunks) console.log(`  ${c.id}: ${Object.keys(c.files).length} plików, ${kb(c.files)}`)
console.log(`  _spis: ${kb(added)} dat dodania`)

if (dryRun) {
  console.log('Tryb --sprawdz: nic nie wysłano.')
  process.exit(0)
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Brak GOOGLE_APPLICATION_CREDENTIALS (ścieżka do klucza serwisowego). Opis na górze tego pliku.')
  process.exit(1)
}

const { initializeApp, applicationDefault } = await import('firebase-admin/app')
const { getFirestore, FieldValue } = await import('firebase-admin/firestore')
initializeApp({ credential: applicationDefault() })
const db = getFirestore()
const col = db.collection('tresc')

const batch = db.batch()
for (const c of chunks) batch.set(col.doc(c.id), { files: c.files })
// Spis na końcu tej samej paczki zapisów — aplikacja nie zobaczy nowej wersji przed paczkami.
batch.set(col.doc('_spis'), { version, chunks: chunks.map((c) => c.id), added, updatedAt: FieldValue.serverTimestamp() })
const keep = new Set([...chunks.map((c) => c.id), '_spis'])
for (const ref of await col.listDocuments()) if (!keep.has(ref.id)) batch.delete(ref)
await batch.commit()
console.log(`Wysłano ${chunks.length} paczek do Firestore.`)
