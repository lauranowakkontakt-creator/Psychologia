import { test } from 'node:test'
import assert from 'node:assert/strict'
import { allTopics, buildTree } from '../src/lib/content.js'
import { allCards, cardGroup, extractCards, hashText, reviewSection } from '../src/lib/flashcards.js'
import { cardStats, dayNumber, dueCards, grade, mergeSrs, NEW_PER_DAY, previewInterval } from '../src/lib/srs.js'
import { examGroups, examResult, pickQuestions, seededRandom } from '../src/lib/exam.js'
import { isRead, markRead, mergeRead, progressRows } from '../src/lib/progress.js'
import { loadContentFiles } from './helpers.js'

const topic = (body, extra = {}) => ({ path: 'kursy/k/t', title: 'T', subject: '', trail: ['Kursy', 'Kurs K'], body, ...extra })

const BODY = `Wstęp.

## W pigułce

- **To nie fiszka** bo jest w innej sekcji

## Szybka powtórka

1. **Czym jest PPP?** Wsparcie po zdarzeniu.
2. **Cele?** Stabilizacja
   i sprawczość.
- **Bez odpowiedzi?**
- zwykły punkt bez pytania

## Źródła

- **Autor** książka`

test('fiszki: tylko z „Szybkiej powtórki”, pytanie pogrubione, odpowiedź za nim', () => {
  assert.match(reviewSection(BODY), /PPP/)
  assert.doesNotMatch(reviewSection(BODY), /Autor/)
  const cards = extractCards(topic(BODY))
  assert.deepEqual(cards.map((c) => [c.question, c.answer]), [
    ['Czym jest PPP?', 'Wsparcie po zdarzeniu.'],
    ['Cele?', 'Stabilizacja i sprawczość.'],
  ])
  assert.equal(cards[0].id, `kursy/k/t#${hashText('Czym jest PPP?')}`)
})

test('fiszki: identyfikator nie zależy od kolejności, powtórzone pytanie dostaje dopisek', () => {
  const a = extractCards(topic('## Szybka powtórka\n\n- **A?** 1\n- **B?** 2'))
  const b = extractCards(topic('## Szybka powtórka\n\n- **B?** 2\n- **A?** 1'))
  assert.equal(a[0].id, b[1].id)
  const dup = extractCards(topic('## Szybka powtórka\n\n- **A?** 1\n- **A?** 2'))
  assert.notEqual(dup[0].id, dup[1].id)
  assert.deepEqual(extractCards(topic('Brak sekcji')), [])
})

test('fiszki: grupa to przedmiot, kurs albo kategoria kompendiów', () => {
  assert.equal(cardGroup({ trail: ['Kursy', 'Interwencja kryzysowa'] }), 'Interwencja kryzysowa')
  assert.equal(cardGroup({ trail: ['Studia', 'Przedmioty', 'Neurologia', 'Budowa'] }), 'Neurologia')
  assert.equal(cardGroup({ trail: ['Studia', 'Tematy', 'Zaburzenia'] }), 'Zaburzenia')
})

test('fiszki z prawdziwych notatek: każda ma pytanie i odpowiedź, identyfikatory są unikalne', () => {
  const root = buildTree(loadContentFiles())
  const cards = allCards(root)
  // Próg rośnie z liczbą notatek (publiczne repo ma tylko kilka przykładowych).
  assert.ok(cards.length > Math.min(100, allTopics(root).length * 2), `za mało fiszek: ${cards.length}`)
  assert.equal(new Set(cards.map((c) => c.id)).size, cards.length)
  for (const c of cards) {
    assert.ok(c.question && c.answer, c.id)
    assert.ok(cardGroup(c), c.id)
  }
})

const NOW = new Date(2026, 9, 22, 12).getTime()
const DAY = 24 * 60 * 60 * 1000

test('powtórki: dobra odpowiedź wydłuża odstęp, „Nie wiem” wraca jutro', () => {
  let s = grade({}, 'a', 2, NOW)
  assert.equal(s.a.interval, 2)
  assert.equal(s.a.due, dayNumber(NOW) + 2)
  s = grade(s, 'a', 2, NOW + DAY)
  assert.equal(s.a.interval, 6)
  s = grade(s, 'a', 2, NOW + 7 * DAY)
  assert.equal(s.a.interval, 15)
  s = grade(s, 'a', 0, NOW + 22 * DAY)
  assert.equal(s.a.interval, 1)
  assert.equal(s.a.reps, 0)
  assert.equal(s.a.lapses, 1)
  assert.ok(s.a.ease < 2.5)
  assert.equal(s.a.first, NOW)
})

test('powtórki: „Łatwo” daje dłuższy odstęp niż „Trudne”', () => {
  assert.ok(previewInterval({}, 'a', 3, NOW) > previewInterval({}, 'a', 1, NOW))
  const s = grade(grade({}, 'a', 2, NOW), 'a', 2, NOW + DAY)
  assert.ok(previewInterval(s, 'a', 3, NOW + 7 * DAY) > previewInterval(s, 'a', 1, NOW + 7 * DAY))
})

test('powtórki na dziś: zaległe najpierw, potem nowe do dziennego limitu', () => {
  const cards = Array.from({ length: 30 }, (_, i) => ({ id: `c${i}` }))
  let state = grade({}, 'c5', 2, NOW - 3 * DAY) // termin minął
  state = grade(state, 'c6', 3, NOW) // za 3 dni
  const due = dueCards(cards, state, NOW)
  assert.equal(due[0].id, 'c5')
  assert.ok(!due.some((c) => c.id === 'c6'))
  // c6 zaczęta dziś — liczy się do limitu nowych
  assert.equal(due.length, 1 + NEW_PER_DAY - 1)
  const stats = cardStats(cards, state, NOW)
  assert.deepEqual(stats, { total: 30, fresh: 28, learning: 2, known: 0, due: 1 })
})

test('powtórki z dwóch urządzeń: wygrywa nowsza ocena każdej fiszki', () => {
  const a = { x: { last: 1, interval: 1 }, y: { last: 5, interval: 9 } }
  const b = { x: { last: 3, interval: 6 }, z: { last: 2, interval: 1 } }
  assert.deepEqual(mergeSrs(a, b), { x: b.x, y: a.y, z: b.z })
})

test('egzamin: losuje z wybranych grup, bez powtórzeń, ten sam przy tym samym ziarnie', () => {
  const cards = [
    ...Array.from({ length: 8 }, (_, i) => ({ id: `a${i}`, trail: ['Kursy', 'A'] })),
    ...Array.from({ length: 5 }, (_, i) => ({ id: `b${i}`, trail: ['Kursy', 'B'] })),
  ]
  assert.deepEqual(examGroups(cards), [{ name: 'A', count: 8 }, { name: 'B', count: 5 }])
  const q = pickQuestions(cards, ['B'], 10, seededRandom(7))
  assert.equal(q.length, 5)
  assert.ok(q.every((c) => c.id.startsWith('b')))
  const all = pickQuestions(cards, [], 10, seededRandom(7))
  assert.equal(new Set(all.map((c) => c.id)).size, 10)
  assert.deepEqual(pickQuestions(cards, [], 10, seededRandom(7)), all)
})

test('egzamin: wynik i lista pytań, które nie weszły', () => {
  const qs = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
  const r = examResult(qs, { a: true, b: false, c: true })
  assert.equal(r.known, 2)
  assert.equal(r.percent, 50)
  assert.deepEqual(r.missed.map((q) => q.id), ['b'])
})

test('postęp: przeczytane od 90%, postęp tylko rośnie, łączenie bierze większy', () => {
  let m = markRead({}, 'x', 0.5)
  assert.equal(isRead(m, 'x'), false)
  m = markRead(m, 'x', 0.95)
  assert.equal(isRead(m, 'x'), true)
  assert.equal(markRead(m, 'x', 0.2), m)
  assert.deepEqual(mergeRead({ x: 0.3, y: 1 }, { x: 0.9 }), { x: 0.9, y: 1 })
})

test('postęp: wiersze po przedmiotach z liczbą notatek i fiszek', () => {
  const root = buildTree({
    'content/kursy/k/a.md': '---\ntytul: A\n---\n## Szybka powtórka\n\n- **P?** O',
    'content/kursy/k/b.md': '---\ntytul: B\n---\ntekst',
  })
  const cards = allCards(root)
  const rows = progressRows(root, { 'kursy/k/a': 1 }, cards, { [cards[0].id]: { interval: 30 } })
  assert.deepEqual(rows, [{ name: 'K', path: 'kursy/k', read: 1, topics: 2, known: 1, cards: 1 }])
})

test('definicje: ze „Słowniczka” i ze zdań „**Pojęcie** to …”, bez powtórzeń', async () => {
  const { extractDefinitions } = await import('../src/lib/flashcards.js')
  const body = `**Stres** to zaburzenie równowagi między zasobami a wymaganiami.
**małe litery** to nie jest pojęcie do fiszki z wielkiej litery.

## Słowniczek

- **Kryzys** – przejściowa nierównowaga po zdarzeniu.
- **Stres**: reakcja na wymagania przekraczające zasoby.

## Szybka powtórka

- **Co to?** Odpowiedź.`
  const defs = extractDefinitions(topic(body))
  assert.deepEqual(defs.map((d) => [d.kind, d.question, d.answer]), [
    ['definicja', 'Kryzys', 'przejściowa nierównowaga po zdarzeniu.'],
    ['definicja', 'Stres', 'reakcja na wymagania przekraczające zasoby.'],
  ])
  assert.ok(defs.every((d) => d.id.includes('#d')))
})

test('pojęcie na teraz: to samo w jednym okienku czasu, inne w następnym', async () => {
  const { nextChange, pickForNow, slotNumber } = await import('../src/lib/daily.js')
  const items = Array.from({ length: 50 }, (_, i) => i)
  const t = new Date(2026, 9, 22, 10, 15).getTime()
  assert.equal(pickForNow(items, t, 3), pickForNow(items, t + 30 * 60 * 1000, 3))
  const next = nextChange(t, 3)
  assert.ok(next > t && next - t <= 3 * 60 * 60 * 1000)
  assert.equal(slotNumber(next, 3), slotNumber(t, 3) + 1)
  // raz dziennie zmienia się o północy
  assert.equal(new Date(nextChange(t, 24)).getHours(), 0)
  const seen = new Set(Array.from({ length: 20 }, (_, i) => pickForNow(items, t + i * 3 * 3600e3, 3)))
  assert.ok(seen.size > 10)
  assert.equal(pickForNow([], t, 3), null)
  assert.notEqual(pickForNow(items, t, 3, 1), pickForNow(items, t, 3))
})
