// Tryb egzaminu: losowy zestaw pytań z wybranych przedmiotów i wynik.
// Odpowiedzi są otwarte, więc oceniamy się sami: „wiedziałam” / „nie wiedziałam”.

import { cardGroup } from './flashcards.js'

export const EXAM_SIZES = [10, 20, 40]

// Grupy (przedmioty, kursy, kategorie kompendiów) z liczbą pytań, alfabetycznie.
export function examGroups(cards) {
  const counts = new Map()
  for (const card of cards) {
    const g = cardGroup(card)
    if (g) counts.set(g, (counts.get(g) || 0) + 1)
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
}

// Prosty generator liczb z ziarnem — ten sam egzamin po odświeżeniu strony.
export function seededRandom(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s >>>= 0
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
}

export function pickQuestions(cards, groups, size, random = Math.random) {
  const wanted = new Set(groups)
  const pool = cards.filter((c) => !wanted.size || wanted.has(cardGroup(c)))
  // Fisher–Yates na kopii.
  const list = [...pool]
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list.slice(0, size)
}

// answers: { [idFiszki]: true | false }
export function examResult(questions, answers) {
  const known = questions.filter((q) => answers[q.id] === true)
  const missed = questions.filter((q) => answers[q.id] === false)
  const percent = questions.length ? Math.round((known.length / questions.length) * 100) : 0
  return { known: known.length, total: questions.length, percent, missed }
}

export function examVerdict(percent) {
  if (percent >= 90) return 'Świetnie, materiał siedzi w głowie.'
  if (percent >= 70) return 'Dobrze. Przejrzyj jeszcze pytania, które nie weszły.'
  if (percent >= 50) return 'Połowa za Tobą. Warto wrócić do notatek z listy poniżej.'
  return 'Na razie słabo. Zacznij od fiszek z tych notatek.'
}
