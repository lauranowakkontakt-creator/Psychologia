// Postęp nauki: ile notatek przeczytano i ile fiszek opanowano — w każdym dziale.
//
// Przeczytane to osobna mapa { [ścieżka]: największy postęp 0–1 } (klucz READ_KEY),
// bo historia „Ostatnio otwierane” trzyma tylko kilkanaście ostatnich tematów.

import { allTopics } from './content.js'
import { cardGroup } from './flashcards.js'

export const READ_KEY = 'psycho-read'
// Notatkę uznajemy za przeczytaną po przewinięciu 90%.
export const READ_DONE = 0.9

export function markRead(map, path, progress) {
  const safe = map && typeof map === 'object' && !Array.isArray(map) ? map : {}
  const p = Math.min(1, Math.max(0, progress))
  if ((safe[path] || 0) >= p) return map
  return { ...safe, [path]: Math.round(p * 100) / 100 }
}

export function isRead(map, path) {
  return ((map && map[path]) || 0) >= READ_DONE
}

// Łączenie z dwóch urządzeń: większy postęp wygrywa.
export function mergeRead(a, b) {
  const out = { ...(a || {}) }
  for (const [path, p] of Object.entries(b || {})) out[path] = Math.max(out[path] || 0, p)
  return out
}

// Wiersze postępu: [{ name, path, read, topics, known, cards }].
// Grupą jest przedmiot / kurs / kategoria kompendiów — ta sama co w egzaminie.
export function progressRows(root, readMap, cards, srsState) {
  const rows = new Map()
  const row = (name, path) => {
    if (!rows.has(name)) rows.set(name, { name, path, read: 0, topics: 0, known: 0, cards: 0 })
    return rows.get(name)
  }
  for (const t of allTopics(root)) {
    const name = cardGroup({ trail: t.trail, subject: t.subject })
    if (!name) continue
    const r = row(name, groupPath(t))
    r.topics++
    if (isRead(readMap, t.path)) r.read++
  }
  for (const c of cards) {
    const r = rows.get(cardGroup(c))
    if (!r) continue
    r.cards++
    const s = srsState && srsState[c.id]
    if (s && s.interval >= 21) r.known++
  }
  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name, 'pl'))
}

// Adres działu, do którego prowadzi wiersz postępu (trzy pierwsze człony ścieżki).
function groupPath(topic) {
  const parts = topic.sectionPath.split('/')
  return parts.slice(0, parts[0] === 'kursy' ? 2 : 3).join('/')
}

export function percent(part, whole) {
  return whole ? Math.round((part / whole) * 100) : 0
}
