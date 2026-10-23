// Własne dopiski i zaznaczenia w notatkach.
//
// Dopiski:     { [ścieżka]: { text, at } }
// Zaznaczenia: { [ścieżka]: { items: [{ id, quote, at }], at } }
// Zaznaczenie pamięta sam cytat, nie pozycję w HTML-u — po poprawce notatki
// wraca tam, gdzie ten tekst nadal jest, a jeśli zniknął, po prostu się nie pokazuje.

export const NOTES_KEY = 'psycho-notes'
export const HIGHLIGHTS_KEY = 'psycho-highlights'

// Najkrótszy i najdłuższy cytat, który da się zaznaczyć.
export const QUOTE_MIN = 3
export const QUOTE_MAX = 600

const asMap = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {})

export function setNote(map, path, text, now = Date.now()) {
  const safe = asMap(map)
  const clean = text.replace(/\s+$/, '')
  if ((safe[path]?.text || '') === clean) return map
  // Pusty dopisek zostaje jako wpis z datą — usunięcie też musi dojechać na drugi telefon.
  return { ...safe, [path]: { text: clean, at: now } }
}

export function noteText(map, path) {
  return asMap(map)[path]?.text || ''
}

export function cleanQuote(text) {
  return (text || '').replace(/\s+/g, ' ').trim()
}

export function addHighlight(map, path, quote, now = Date.now()) {
  const safe = asMap(map)
  const q = cleanQuote(quote)
  if (q.length < QUOTE_MIN || q.length > QUOTE_MAX) return map
  const items = safe[path]?.items || []
  if (items.some((h) => h.quote === q)) return map
  const item = { id: `${now.toString(36)}${items.length}`, quote: q, at: now }
  return { ...safe, [path]: { items: [...items, item], at: now } }
}

export function removeHighlight(map, path, id, now = Date.now()) {
  const safe = asMap(map)
  const items = safe[path]?.items || []
  if (!items.some((h) => h.id === id)) return map
  return { ...safe, [path]: { items: items.filter((h) => h.id !== id), at: now } }
}

export function highlightsFor(map, path) {
  return asMap(map)[path]?.items || []
}

// Wszystkie notatki z dopiskami lub zaznaczeniami, najnowsze na górze.
export function annotatedPaths(notes, highlights) {
  const at = new Map()
  for (const [path, n] of Object.entries(asMap(notes))) if (n.text) at.set(path, n.at || 0)
  for (const [path, h] of Object.entries(asMap(highlights))) {
    if (h.items?.length) at.set(path, Math.max(at.get(path) || 0, h.at || 0))
  }
  return [...at].sort((a, b) => b[1] - a[1]).map(([path]) => path)
}

// Łączenie z dwóch urządzeń: dla każdej notatki wygrywa nowszy wpis.
export function mergeByPath(a, b) {
  const out = { ...asMap(a) }
  for (const [path, entry] of Object.entries(asMap(b))) {
    if (!out[path] || (entry?.at || 0) > (out[path].at || 0)) out[path] = entry
  }
  return out
}
