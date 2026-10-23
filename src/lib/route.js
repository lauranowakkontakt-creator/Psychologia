// Adresy w aplikacji siedzą po `#`, bo strona jest statyczna (bez serwera,
// który rozumiałby /studia/temat-1) — tak samo działa po instalacji na pulpicie.
//
//   #/                         start
//   #/studia                   sekcja
//   #/studia/temat-1?q=lęk     temat, z podświetleniem słowa z wyszukiwarki
//   #/szukaj?q=lęk             wyniki wyszukiwania
//   #/powtorki, #/egzamin, #/postep, #/mapa, #/dopiski   ekrany nauki

export const SEARCH_PATH = 'szukaj'
export const REVIEW_PATH = 'powtorki'
export const EXAM_PATH = 'egzamin'
export const PROGRESS_PATH = 'postep'
export const MAP_PATH = 'mapa'
export const NOTES_PATH = 'dopiski'

// Adresy ekranów, które nie są notatkami ani sekcjami. Folder w content/
// nie może się tak nazywać (pilnuje tego test).
export const APP_PATHS = [SEARCH_PATH, REVIEW_PATH, EXAM_PATH, PROGRESS_PATH, MAP_PATH, NOTES_PATH]

export function parseHash(hash) {
  const raw = (hash || '').replace(/^#/, '')
  const [pathPart, queryPart = ''] = raw.split('?')
  const path = safeDecode(pathPart).replace(/^\/+|\/+$/g, '')
  const q = new URLSearchParams(queryPart).get('q') || ''
  return { path, q }
}

export function toHash(path, q) {
  const clean = (path || '').replace(/^\/+|\/+$/g, '')
  const encoded = clean.split('/').map(encodeURIComponent).join('/')
  const query = q ? `?q=${encodeURIComponent(q)}` : ''
  return `#/${encoded}${query}`
}

function safeDecode(s) {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

// Adres o poziom wyżej: „kursy/trauma/temat-1” -> „kursy/trauma”, „studia” -> „” (start).
export function parentPath(path) {
  return (path || '').replace(/^\/+|\/+$/g, '').split('/').slice(0, -1).join('/')
}

// Stare adresy sprzed podziału „Studiów” na „Przedmioty” i „Tematy”:
//   studia/<przedmiot>/…  -> studia/przedmioty/<przedmiot>/…
//   tematy/…              -> studia/tematy/…
// Zwraca nowy adres albo null, gdy adres nie jest stary. Dzięki temu działają
// zapisane zakładki, historia czytania i linki sprzed zmiany.
const STUDIA_PARTS = new Set(['przedmioty', 'tematy'])

export function legacyPath(path) {
  const clean = (path || '').replace(/^\/+|\/+$/g, '')
  const parts = clean.split('/')
  if (parts[0] === 'tematy') return ['studia', ...parts].join('/')
  if (parts[0] === 'studia' && parts.length > 1 && !STUDIA_PARTS.has(parts[1])) {
    return ['studia', 'przedmioty', ...parts.slice(1)].join('/')
  }
  return null
}
