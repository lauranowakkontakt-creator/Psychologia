// Drobne formatowanie tekstów w interfejsie: liczebniki, daty, czas, kolory przedmiotów.

// Polska odmiana liczebnika: 1 temat, 2 tematy, 5 tematów, 22 tematy, 12 tematów.
export function plural(n, [one, few, many]) {
  if (n === 1) return one
  const d = n % 10
  const dd = n % 100
  return d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? few : many
}

export function countLabel(n, forms) {
  return `${n} ${plural(n, forms)}`
}

export const TOPIC_FORMS = ['temat', 'tematy', 'tematów']

const MONTHS_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']
const MONTHS_LONG = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia',
  'września', 'października', 'listopada', 'grudnia']

// „2025-10-14” -> „14 paź” (krótko) albo „14 października” (długo).
// Data w innym formacie zostaje taka, jak ją wpisano.
export function formatDate(value, long = false) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value || '').trim())
  if (!m) return (value || '').trim()
  const month = Number(m[2]) - 1
  if (month < 0 || month > 11) return value.trim()
  return `${Number(m[3])} ${(long ? MONTHS_LONG : MONTHS_SHORT)[month]}`
}

export function pad2(n) {
  return String(n).padStart(2, '0')
}

export function greeting(date = new Date()) {
  const h = date.getHours()
  return h >= 5 && h < 18 ? 'Dzień dobry' : 'Dobry wieczór'
}

const DAY = 24 * 60 * 60 * 1000

// Krótki opis „jak dawno”: dziś, wczoraj, 3 dni, tydzień, 3 tyg., miesiąc, 4 mies.
// Liczy dni kalendarzowe, nie pełne doby — wczoraj wieczorem to „wczoraj”.
export function relativeTime(then, now = Date.now()) {
  const startOf = (t) => {
    const d = new Date(t)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  }
  const days = Math.round((startOf(now) - startOf(then)) / DAY)
  if (days <= 0) return 'dziś'
  if (days === 1) return 'wczoraj'
  if (days < 7) return `${days} dni`
  if (days < 14) return 'tydzień'
  if (days < 30) return `${Math.floor(days / 7)} tyg.`
  if (days < 60) return 'miesiąc'
  return `${Math.floor(days / 30)} mies.`
}

// Stały kolor (1–4) dla nazwy przedmiotu — ta sama nazwa zawsze ma tę samą kropkę.
export function subjectColor(name) {
  let h = 0
  for (const ch of name || '') h = (h * 31 + ch.codePointAt(0)) >>> 0
  return (h % 4) + 1
}

export const CARD_FORMS = ['fiszka', 'fiszki', 'fiszek']
export const DAY_FORMS = ['dzień', 'dni', 'dni']
