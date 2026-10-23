// Synchronizacja danych użytkownika między urządzeniami — czysta logika łączenia.
//
// Każdy klucz z localStorage, który ma jechać do chmury, ma tu swoją funkcję
// łączenia `merge(lokalne, zdalne, lokalneAt, zdalneAt)`. Tam, gdzie da się
// połączyć wpis po wpisie (historia, postęp, fiszki, dopiski), nic nie ginie,
// nawet gdy dwa urządzenia pracowały bez internetu. Zakładki idą w całości:
// wygrywa nowsza lista, żeby usunięta zakładka nie wracała z drugiego telefonu.
// Motyw i rozmiar tekstu zostają na urządzeniu.

import { BOOKMARKS_KEY, RECENT_KEY, RECENT_MAX } from './prefs.js'
import { mergeRead, READ_KEY } from './progress.js'
import { mergeSrs, SRS_KEY } from './srs.js'
import { HIGHLIGHTS_KEY, mergeByPath, NOTES_KEY } from './annotations.js'

export function mergeRecent(a, b) {
  const byPath = new Map()
  for (const e of [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]) {
    if (!e || typeof e.path !== 'string') continue
    const prev = byPath.get(e.path)
    byPath.set(e.path, prev
      ? { path: e.path, at: Math.max(prev.at || 0, e.at || 0), progress: Math.max(prev.progress || 0, e.progress || 0) }
      : e)
  }
  return [...byPath.values()].sort((x, y) => (y.at || 0) - (x.at || 0)).slice(0, RECENT_MAX)
}

const newer = (local, remote, localAt, remoteAt) => ((remoteAt || 0) > (localAt || 0) ? remote : local)

export const SYNCED = {
  [RECENT_KEY]: mergeRecent,
  [BOOKMARKS_KEY]: newer,
  [READ_KEY]: mergeRead,
  [SRS_KEY]: mergeSrs,
  [NOTES_KEY]: mergeByPath,
  [HIGHLIGHTS_KEY]: mergeByPath,
}

export function mergeValue(key, local, remote, localAt, remoteAt) {
  const merge = SYNCED[key]
  if (!merge) return local
  if (local === undefined) return remote
  if (remote === undefined) return local
  return merge(local, remote, localAt, remoteAt)
}

// Porównanie po treści — żeby nie wysyłać do chmury tego, co już tam jest.
export function sameValue(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}
