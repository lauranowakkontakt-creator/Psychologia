import { test } from 'node:test'
import assert from 'node:assert/strict'
import { countLabel, formatDate, greeting, pad2, plural, relativeTime, subjectColor, TOPIC_FORMS } from '../src/lib/format.js'

test('plural: polska odmiana', () => {
  const got = [0, 1, 2, 4, 5, 11, 12, 14, 21, 22, 25, 102, 112].map((n) => countLabel(n, TOPIC_FORMS))
  assert.deepEqual(got, ['0 tematów', '1 temat', '2 tematy', '4 tematy', '5 tematów', '11 tematów', '12 tematów',
    '14 tematów', '21 tematów', '22 tematy', '25 tematów', '102 tematy', '112 tematów'])
  assert.equal(plural(3, ['kurs', 'kursy', 'kursów']), 'kursy')
})

test('formatDate: krótko i długo, inne formaty bez zmian', () => {
  assert.equal(formatDate('2025-10-07'), '7 paź')
  assert.equal(formatDate('2025-10-14', true), '14 października')
  assert.equal(formatDate('zimą'), 'zimą')
  assert.equal(formatDate('2025-13-01'), '2025-13-01')
  assert.equal(formatDate(''), '')
})

test('pad2 i pozdrowienie', () => {
  assert.equal(pad2(4), '04')
  assert.equal(pad2(12), '12')
  assert.equal(greeting(new Date(2026, 0, 1, 9)), 'Dzień dobry')
  assert.equal(greeting(new Date(2026, 0, 1, 21)), 'Dobry wieczór')
  assert.equal(greeting(new Date(2026, 0, 1, 3)), 'Dobry wieczór')
})

test('relativeTime liczy dni kalendarzowe', () => {
  const now = new Date(2026, 9, 12, 9, 0).getTime()
  const at = (d, h = 12) => new Date(2026, 9, 12 - d, h).getTime()
  assert.equal(relativeTime(at(0, 8), now), 'dziś')
  assert.equal(relativeTime(at(1, 23), now), 'wczoraj')
  assert.equal(relativeTime(at(3), now), '3 dni')
  assert.equal(relativeTime(at(8), now), 'tydzień')
  assert.equal(relativeTime(at(21), now), '3 tyg.')
  assert.equal(relativeTime(at(40), now), 'miesiąc')
  assert.equal(relativeTime(at(130), now), '4 mies.')
})

test('subjectColor: stały kolor 1–4 dla nazwy', () => {
  const c = subjectColor('Psychologia poznawcza')
  assert.ok(c >= 1 && c <= 4)
  assert.equal(subjectColor('Psychologia poznawcza'), c)
  assert.equal(subjectColor(''), 1)
})
