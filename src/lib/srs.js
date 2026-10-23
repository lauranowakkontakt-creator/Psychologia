// Powtórki rozłożone w czasie (uproszczony SM-2, jak w Anki).
//
// Stan to obiekt { [idFiszki]: { due, interval, ease, reps, lapses, last } }:
//   due      – dzień następnej powtórki (numer dnia, patrz dayNumber),
//   interval – ile dni do następnej powtórki,
//   ease     – mnożnik odstępu (rośnie, gdy idzie łatwo; maleje przy kłopotach),
//   reps     – ile razy z rzędu odpowiedź była dobra,
//   lapses   – ile razy fiszka „wypadła” z pamięci,
//   last     – kiedy ostatnio oceniona (ms), do łączenia zapisów z kilku urządzeń,
//   first    – kiedy oceniona pierwszy raz (ms), do dziennego limitu nowych.
// Fiszka bez wpisu jest nowa.

export const SRS_KEY = 'psycho-srs'
export const NEW_PER_DAY = 15

// Oceny w kolejności przycisków.
export const GRADES = [
  { value: 0, label: 'Nie wiem' },
  { value: 1, label: 'Trudne' },
  { value: 2, label: 'Dobrze' },
  { value: 3, label: 'Łatwo' },
]

const DAY = 24 * 60 * 60 * 1000
const MIN_EASE = 1.3
const START_EASE = 2.5

// Numer dnia w strefie czasowej telefonu — powtórka „na jutro” jest jutro
// od północy, a nie za równe 24 godziny.
export function dayNumber(time = Date.now()) {
  const d = new Date(time)
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / DAY)
}

export function grade(state, id, value, now = Date.now()) {
  const safe = state && typeof state === 'object' ? state : {}
  const prev = safe[id] || { interval: 0, ease: START_EASE, reps: 0, lapses: 0 }
  let { interval, ease, reps, lapses } = prev

  if (value === 0) {
    // Nie pamiętam: od nowa, jutro jeszcze raz.
    reps = 0
    lapses += prev.reps > 0 ? 1 : 0
    interval = 1
    ease = Math.max(MIN_EASE, ease - 0.2)
  } else {
    reps += 1
    if (value === 1) ease = Math.max(MIN_EASE, ease - 0.15)
    if (value === 3) ease += 0.15
    if (reps === 1) interval = [0, 1, 2, 4][value]
    else if (reps === 2) interval = value === 1 ? 3 : 6
    else interval = Math.round(interval * (value === 1 ? 1.2 : ease) * (value === 3 ? 1.3 : 1))
    interval = Math.max(1, interval)
  }

  const entry = {
    due: dayNumber(now) + interval,
    interval,
    ease: Math.round(ease * 100) / 100,
    reps,
    lapses,
    last: now,
    first: prev.first || now,
  }
  return { ...safe, [id]: entry }
}

// Fiszki na dziś: najpierw zaległe (najstarsze pierwsze), potem nowe —
// najwyżej `newLimit` nowych dziennie (już zaczęte dziś liczą się do limitu).
export function dueCards(cards, state, now = Date.now(), newLimit = NEW_PER_DAY) {
  const today = dayNumber(now)
  const safe = state && typeof state === 'object' ? state : {}
  const due = []
  const fresh = []
  let startedToday = 0
  for (const card of cards) {
    const s = safe[card.id]
    if (!s) fresh.push(card)
    else {
      if (s.due <= today) due.push(card)
      if (s.first && dayNumber(s.first) === today) startedToday++
    }
  }
  due.sort((a, b) => safe[a.id].due - safe[b.id].due)
  return [...due, ...fresh.slice(0, Math.max(0, newLimit - startedToday))]
}

export function cardStats(cards, state, now = Date.now()) {
  const today = dayNumber(now)
  const safe = state && typeof state === 'object' ? state : {}
  let fresh = 0
  let learning = 0
  let known = 0
  let due = 0
  for (const card of cards) {
    const s = safe[card.id]
    if (!s) fresh++
    else {
      if (s.interval >= 21) known++
      else learning++
      if (s.due <= today) due++
    }
  }
  return { total: cards.length, fresh, learning, known, due }
}

// Za ile dni wróci fiszka po danej ocenie — podpis pod przyciskiem.
export function previewInterval(state, id, value, now = Date.now()) {
  return grade(state, id, value, now)[id].interval
}

// Łączenie stanu z dwóch urządzeń: dla każdej fiszki wygrywa nowsza ocena.
export function mergeSrs(a, b) {
  const out = { ...(a || {}) }
  for (const [id, entry] of Object.entries(b || {})) {
    if (!out[id] || (entry.last || 0) > (out[id].last || 0)) out[id] = entry
  }
  return out
}
