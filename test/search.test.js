import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildTree } from '../src/lib/content.js'
import { buildIndex, findRanges, markdownToPlain, normalize, search, snippet } from '../src/lib/search.js'
import { loadContentFiles } from './helpers.js'

test('normalize: bez polskich znaków i wielkich liter, ta sama długość', () => {
  assert.equal(normalize('Żałoba ĆWICZENIE łóż'), 'zaloba cwiczenie loz')
  const s = 'Zażółć gęślą jaźń'
  assert.equal(normalize(s).length, s.length)
})

test('markdownToPlain usuwa składnię', () => {
  const plain = markdownToPlain('## Nagłówek\n\n- **pogrubione** i [link](http://x)\n> cytat\n\n| a | b |\n|---|---|\n| c | d |')
  assert.ok(!/[#*[\]()>|]/.test(plain), plain)
  assert.match(plain, /Nagłówek/)
  assert.match(plain, /pogrubione i link/)
})

test('markdownToPlain: z rysunku w HTML zostaje sam tekst', () => {
  const plain = markdownToPlain('<div class="fig"><p class="fig-title">Fazy</p><div class="step">Szok</div></div>')
  assert.ok(!/[<>="]/.test(plain), plain)
  assert.match(plain, /Fazy Szok/)
})

test('findRanges: wszystkie trafienia, scalone, w oryginalnych pozycjach', () => {
  const text = 'Żałoba i ŻAŁOBA'
  assert.deepEqual(findRanges(text, 'zaloba'), [[0, 6], [9, 15]])
  assert.deepEqual(findRanges('abcdef', 'abc bcd'), [[0, 4]])
  assert.deepEqual(findRanges('abc', '   '), [])
})

test('snippet: fragment z podświetleniem, wielokropki przy przycięciu', () => {
  const text = 'słowo '.repeat(40) + 'TRAUMA złożona ' + 'koniec '.repeat(40)
  const parts = snippet(text, ['trauma'])
  assert.equal(parts.find((p) => p.hit).text, 'TRAUMA')
  assert.equal(parts[0].text, '…')
  assert.equal(parts.at(-1).text, '…')
})

const files = {
  '/content/studia/_sekcja.md': '---\ntytul: Studia\n---\n',
  '/content/studia/zaloba.md': '---\ntytul: Żałoba\n---\nProces żałoby według Kübler-Ross.',
  '/content/studia/lek.md': '---\ntytul: Lęk\n---\nLęk a żałoba po stracie. Lęk napadowy.',
  '/content/kursy/_sekcja.md': '---\ntytul: Kursy\n---\n',
  '/content/kursy/ptsd.md': '---\ntytul: PTSD\n---\nObjawy po traumie.',
}
const index = buildIndex(buildTree(files))

test('search: tytuł wyżej niż treść, bez polskich znaków', () => {
  const r = search(index, 'zaloba')
  assert.deepEqual(r.map((x) => x.title), ['Żałoba', 'Lęk'])
  assert.ok(r[1].snippet.some((p) => p.hit && p.text === 'żałoba'))
})

test('search: wszystkie słowa muszą wystąpić; nazwa sekcji też się liczy', () => {
  assert.deepEqual(search(index, 'lęk stracie').map((x) => x.title), ['Lęk'])
  assert.deepEqual(search(index, 'lęk ptsd'), [])
  assert.deepEqual(search(index, 'kursy objawy').map((x) => x.title), ['PTSD'])
})

test('search: puste zapytanie nic nie zwraca', () => {
  assert.deepEqual(search(index, '  '), [])
})

test('search na prawdziwej treści znajduje tematy we wszystkich działach', () => {
  const real = buildIndex(buildTree(loadContentFiles()))
  const trails = new Set(search(real, 'temat', Infinity).map((r) => r.trail.join('/')))
  assert.ok([...trails].some((t) => t.startsWith('Studia – psychologia/Przedmioty/')))
  assert.ok([...trails].some((t) => t.startsWith('Studia – psychologia/Tematy/')))
  assert.ok(trails.has('Kursy/Interwencja kryzysowa'))
  assert.ok(trails.has('Kursy/Psychotraumatologia'))
})
