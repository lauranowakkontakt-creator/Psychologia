// Kopia zapasowa danych nauki: historia, zakładki, przeczytane, fiszki, dopiski i zaznaczenia
// w jednym pliku JSON. Chmura tylko synchronizuje urządzenia — jeśli zepsuty stan trafi na
// jedno, rozejdzie się na wszystkie, a plik pozwala wrócić. Wczytanie kopii niczego nie
// kasuje: łączy ją z tym, co jest na urządzeniu, tymi samymi funkcjami co synchronizacja.

import { mergeValue, SYNCED } from './sync.js'
import { BOOKMARKS_KEY } from './prefs.js'

export const BACKUP_FORMAT = 'psycho-kopia'

export function buildBackup(read, now = Date.now()) {
  const data = {}
  for (const key of Object.keys(SYNCED)) {
    const value = read(key)
    if (value !== undefined && value !== null) data[key] = value
  }
  return { format: BACKUP_FORMAT, version: 1, at: now, data }
}

export function backupFileName(now = Date.now()) {
  const d = new Date(now)
  const two = (n) => String(n).padStart(2, '0')
  return `psycho-kopia-${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}.json`
}

// Zwraca dane z pliku albo null, gdy to nie jest kopia z tej aplikacji.
export function parseBackup(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }
  if (!parsed || parsed.format !== BACKUP_FORMAT || !parsed.data || typeof parsed.data !== 'object') return null
  const data = {}
  for (const key of Object.keys(SYNCED)) {
    const value = parsed.data[key]
    if (value && typeof value === 'object') data[key] = value
  }
  return data
}

// Wartości po połączeniu kopii z tym, co jest na urządzeniu (tylko klucze, które się zmienią).
export function restoreBackup(data, read) {
  const out = {}
  for (const [key, saved] of Object.entries(data)) {
    const local = read(key)
    let merged
    if (key === BOOKMARKS_KEY) {
      // Zakładki: suma obu list, żeby żadna nie zginęła.
      const both = [...(Array.isArray(local) ? local : []), ...(Array.isArray(saved) ? saved : [])]
      merged = [...new Set(both)]
    } else {
      merged = mergeValue(key, local ?? undefined, saved, 0, 0)
    }
    if (JSON.stringify(merged) !== JSON.stringify(local)) out[key] = merged
  }
  return out
}
