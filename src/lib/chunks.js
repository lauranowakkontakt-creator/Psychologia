// Pakowanie notatek do dokumentów Firestore.
//
// Dokument Firestore może mieć najwyżej 1 MiB, a każdy odczyt dokumentu liczy się
// do darmowego limitu (50 000 dziennie). Zamiast ~500 dokumentów (jeden na notatkę)
// pakujemy notatki w paczki do ~900 KB — całość to kilka odczytów.
// Ten sam moduł składa paczki z powrotem w obiekt { ścieżka: treść } dla buildTree.

export const CHUNK_LIMIT = 900 * 1024

const bytes = (s) => new TextEncoder().encode(s).length

// files: { 'content/...md': 'treść' } -> [{ id: 'p01', files: {...} }, ...]
// Kolejność stała (alfabetyczna), więc te same notatki dają te same paczki.
export function packChunks(files, limit = CHUNK_LIMIT) {
  const chunks = []
  let current = null
  let size = 0
  for (const path of Object.keys(files).sort()) {
    const entrySize = bytes(path) + bytes(files[path]) + 16
    if (entrySize > limit) throw new Error(`Notatka ${path} jest za duża na jeden dokument (${entrySize} B).`)
    if (!current || size + entrySize > limit) {
      current = { id: `p${String(chunks.length + 1).padStart(2, '0')}`, files: {} }
      chunks.push(current)
      size = 0
    }
    current.files[path] = files[path]
    size += entrySize
  }
  return chunks
}

export function unpackChunks(chunks) {
  const files = {}
  for (const c of chunks) Object.assign(files, c.files || {})
  return files
}

// Wersja treści: skrót ze wszystkich ścieżek i treści. Aplikacja porównuje ją
// z zapamiętaną i pobiera paczki z serwera tylko wtedy, gdy coś się zmieniło.
export function contentVersion(files) {
  let h = 2166136261
  for (const path of Object.keys(files).sort()) {
    for (const s of [path, files[path]]) {
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h = Math.imul(h, 16777619) >>> 0
      }
    }
  }
  return `${Object.keys(files).length}-${h.toString(36)}`
}
