// Strażnik prywatności: buduje wersję z logowaniem (`--mode firebase`) do folderu
// tymczasowego i sprawdza, że w gotowych plikach strony nie ma ani kawałka notatek.
// Tę paczkę widzi każdy, kto otworzy adres strony — także bez logowania.
// Uruchamiane w `npm run check`; kończy się błędem, jeśli coś przeciekło.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseFrontmatter } from '../src/lib/content.js'
import { loadContentFiles } from '../test/helpers.js'

const out = mkdtempSync(join(tmpdir(), 'psycho-firebase-'))
try {
  execFileSync('npx', ['vite', 'build', '--mode', 'firebase', '--outDir', out, '--emptyOutDir', '--logLevel', 'error'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Prawdziwa konfiguracja nie jest potrzebna do sprawdzenia paczki.
      VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || 'test',
      VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || 'test',
    },
  })

  const bundle = filesIn(out).map((f) => readFileSync(f, 'utf8')).join('\n')

  // Próbki z każdej notatki: tytuł (dłuższy niż 12 znaków) i najdłuższa linia treści.
  const leaks = []
  for (const [path, raw] of Object.entries(loadContentFiles())) {
    const { meta, body } = parseFrontmatter(raw)
    const longest = body.split('\n').map((l) => l.trim()).sort((a, b) => b.length - a.length)[0] || ''
    const samples = [longest.slice(0, 80)]
    if ((meta.tytul || '').length > 12) samples.push(meta.tytul)
    for (const s of samples) {
      if (s.length > 12 && bundle.includes(s)) leaks.push(`${path}: „${s.slice(0, 60)}…”`)
    }
  }
  if (bundle.includes('content/studia') || bundle.includes('content/kursy')) leaks.push('ścieżki plików z content/ (daty dodania?)')

  if (leaks.length) {
    console.error(`Wersja z logowaniem zawiera treść notatek (${leaks.length}):`)
    for (const l of leaks.slice(0, 20)) console.error('  ' + l)
    process.exit(1)
  }
  console.log(`Wersja z logowaniem: w paczce strony nie ma notatek (${Math.round(bundle.length / 1024)} KB kodu).`)
} finally {
  rmSync(out, { recursive: true, force: true })
}

function filesIn(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name.startsWith('._')) return []
    const p = join(dir, name)
    return statSync(p).isDirectory() ? filesIn(p) : /\.(js|html|css|json|webmanifest)$/.test(name) ? [p] : []
  })
}
