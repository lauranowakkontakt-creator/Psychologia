// Ustawienia i historia czytania — czysta logika, bez localStorage.
// Zapis i odczyt z przeglądarki są w src/store.js.

export const THEME_KEY = 'psycho-theme'
export const TEXT_SIZE_KEY = 'psycho-text-size'
export const RECENT_KEY = 'psycho-recent'
export const BOOKMARKS_KEY = 'psycho-bookmarks'

// Zapisany wybór ma pierwszeństwo, inaczej motyw systemu.
export function resolveTheme(stored, prefersLight) {
  if (stored === 'day' || stored === 'night') return stored
  return prefersLight ? 'day' : 'night'
}

// Rozmiary tekstu notatki przełączane przyciskiem „Aa”.
export const TEXT_SIZES = [
  { px: 17, label: 'standardowy' },
  { px: 19, label: 'duży' },
  { px: 21, label: 'bardzo duży' },
]

export function textSizeIndex(stored) {
  const i = Number(stored)
  return Number.isInteger(i) && i >= 0 && i < TEXT_SIZES.length ? i : 0
}

export const RECENT_MAX = 12

// Historia: [{ path, at, progress }], najnowsze na początku, bez powtórzeń.
// Otwarcie tematu przenosi go na górę i zachowuje postęp czytania.
export function addRecent(list, path, now) {
  const safe = Array.isArray(list) ? list.filter((e) => e && typeof e.path === 'string') : []
  const prev = safe.find((e) => e.path === path)
  const rest = safe.filter((e) => e.path !== path)
  return [{ path, at: now, progress: prev ? prev.progress || 0 : 0 }, ...rest].slice(0, RECENT_MAX)
}

// Postęp tylko rośnie — przewinięcie do góry nie kasuje przeczytanego.
export function setProgress(list, path, progress) {
  const p = Math.min(1, Math.max(0, progress))
  let changed = false
  const out = (Array.isArray(list) ? list : []).map((e) => {
    if (e.path !== path || (e.progress || 0) >= p) return e
    changed = true
    return { ...e, progress: p }
  })
  return changed ? out : list
}

// Pomija wpisy tematów, których już nie ma (np. po zmianie nazwy pliku).
export function existingRecent(list, exists) {
  return (Array.isArray(list) ? list : []).filter((e) => e && exists(e.path))
}

export function toggleBookmark(list, path) {
  const safe = Array.isArray(list) ? list : []
  return safe.includes(path) ? safe.filter((p) => p !== path) : [path, ...safe]
}

// Przepisuje zapisane adresy (historia: [{ path }], zakładki: ['path']) według
// funkcji `rename` (zwraca nowy adres albo null). Bez zmian – zwraca tę samą listę.
export function migratePaths(list, rename) {
  if (!Array.isArray(list)) return list
  let changed = false
  const out = list.map((e) => {
    const path = typeof e === 'string' ? e : e && e.path
    const next = typeof path === 'string' ? rename(path) : null
    if (!next) return e
    changed = true
    return typeof e === 'string' ? next : { ...e, path: next }
  })
  if (!changed) return list
  // Po przepisaniu mogą się powtórzyć te same adresy – zostaje pierwszy.
  const seen = new Set()
  return out.filter((e) => {
    const path = typeof e === 'string' ? e : e && e.path
    if (seen.has(path)) return false
    seen.add(path)
    return true
  })
}
