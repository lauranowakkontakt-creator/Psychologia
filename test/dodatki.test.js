import { test } from 'node:test'
import assert from 'node:assert/strict'
import { allTopics, buildTree } from '../src/lib/content.js'
import { backlinks, buildLinkGraph, compendiumMap, linkTargets } from '../src/lib/links.js'
import { legacyPath } from '../src/lib/route.js'
import { MAX_CHUNK, speechChunks } from '../src/lib/speech.js'
import { parseGitAdded, recentlyAdded } from '../src/lib/added.js'
import { addHighlight, annotatedPaths, highlightsFor, mergeByPath, noteText, removeHighlight, setNote } from '../src/lib/annotations.js'
import { findQuote, splitRanges } from '../src/lib/textRanges.js'
import { contentVersion, packChunks, unpackChunks } from '../src/lib/chunks.js'
import { mergeRecent, mergeValue, SYNCED } from '../src/lib/sync.js'
import { BOOKMARKS_KEY, RECENT_KEY } from '../src/lib/prefs.js'
import { loadContentFiles } from './helpers.js'

test('linki: ścieżki z `#/...`, bez zapytania, bez powtórzeń', () => {
  assert.deepEqual(linkTargets('[a](#/studia/x) i [b](#/studia/y?q=lęk) oraz [a](#/studia/x) [w](https://x.pl)'), ['studia/x', 'studia/y'])
})

test('mapa powiązań: dokąd prowadzi notatka i kto do niej prowadzi (także starymi adresami)', () => {
  const root = buildTree({
    'content/studia/tematy/k/a.md': '---\nrodzaj: Kompendium\n---\n[b](#/studia/tematy/k/b) [stary](#/tematy/k/c)',
    'content/studia/tematy/k/b.md': '---\nrodzaj: Kompendium\n---\n[a](#/studia/tematy/k/a) [nie ma](#/studia/nie-ma)',
    'content/studia/tematy/k/c.md': '---\nrodzaj: Kompendium\n---\nbez linków',
  })
  const g = buildLinkGraph(root, legacyPath)
  assert.deepEqual(g.out.get('studia/tematy/k/a'), ['studia/tematy/k/b', 'studia/tematy/k/c'])
  assert.deepEqual(backlinks(g, 'studia/tematy/k/c'), ['studia/tematy/k/a'])
  const map = compendiumMap(root, g, (t) => t.kind === 'Kompendium')
  assert.equal(map.length, 1)
  assert.deepEqual(map[0].items.map((i) => [i.title, i.linked.length]), [['A', 2], ['B', 1], ['C', 1]])
})

test('mapa powiązań na prawdziwych notatkach: kompendia są ze sobą połączone', () => {
  const root = buildTree(loadContentFiles())
  const g = buildLinkGraph(root, legacyPath)
  const linked = allTopics(root).filter((t) => (g.out.get(t.path) || []).length)
  // Próg rośnie z liczbą notatek (publiczne repo ma tylko kilka przykładowych).
  assert.ok(linked.length >= Math.min(20, Math.ceil(allTopics(root).length / 4)), `za mało notatek z linkami: ${linked.length}`)
})

test('czytanie na głos: zdania sklejone do limitu, długie zdanie pocięte', () => {
  const chunks = speechChunks('Pierwsze zdanie. Drugie zdanie? Trzecie!')
  assert.deepEqual(chunks, ['Pierwsze zdanie. Drugie zdanie? Trzecie!'])
  const long = Array.from({ length: 80 }, (_, i) => `słowo${i}`).join(' ') + '.'
  const parts = speechChunks(`Krótkie. ${long}`)
  assert.equal(parts[0], 'Krótkie.')
  assert.ok(parts.every((p) => p.length <= MAX_CHUNK), parts.map((p) => p.length).join(','))
  assert.equal(parts.join(' ').replace(/\s+/g, ' '), `Krótkie. ${long}`)
  assert.deepEqual(speechChunks('  '), [])
})

test('ostatnio dodane: data z gita przechodzi przez przeniesienia, usunięte znikają', () => {
  const log = [
    '@2026-10-12T10:00:00+02:00', '', 'A\tcontent/a.md', 'A\tcontent/b.md',
    '@2026-10-14T10:00:00+02:00', '', 'R100\tcontent/a.md\tcontent/x/a.md', 'D\tcontent/b.md', 'A\tcontent/c.md',
  ].join('\n')
  assert.deepEqual(parseGitAdded(log), {
    'content/x/a.md': '2026-10-12T10:00:00+02:00',
    'content/c.md': '2026-10-14T10:00:00+02:00',
  })
  const root = buildTree(
    { 'content/s/a.md': 'x', 'content/s/b.md': '---\ndodano: 2026-10-20\n---\nx', 'content/s/c.md': 'x' },
    { 'content/s/a.md': '2026-10-12T10:00:00+02:00', 'content/s/b.md': '2026-01-01' },
  )
  assert.deepEqual(recentlyAdded(allTopics(root)).map((t) => t.slug), ['b', 'a'])
})

test('dopiski: zapis, usunięcie zostawia wpis z datą, łączenie bierze nowszy', () => {
  let m = setNote({}, 'x', 'moja myśl  ', 1)
  assert.equal(noteText(m, 'x'), 'moja myśl')
  assert.equal(setNote(m, 'x', 'moja myśl', 2), m)
  m = setNote(m, 'x', '', 3)
  assert.deepEqual(m.x, { text: '', at: 3 })
  assert.deepEqual(mergeByPath({ x: { at: 1 }, y: { at: 5 } }, { x: { at: 2 } }), { x: { at: 2 }, y: { at: 5 } })
})

test('zaznaczenia: dodanie bez duplikatów, za krótkie odrzucone, usuwanie', () => {
  let m = addHighlight({}, 'x', '  ważne\n zdanie ', 10)
  assert.deepEqual(highlightsFor(m, 'x').map((h) => h.quote), ['ważne zdanie'])
  assert.equal(addHighlight(m, 'x', 'ważne zdanie', 11), m)
  assert.equal(addHighlight(m, 'x', 'ab', 11), m)
  const id = highlightsFor(m, 'x')[0].id
  m = removeHighlight(m, 'x', id, 12)
  assert.deepEqual(highlightsFor(m, 'x'), [])
  assert.deepEqual(annotatedPaths({ a: { text: 'x', at: 1 }, b: { text: '', at: 9 } }, { c: { items: [{}], at: 5 } }), ['c', 'a'])
})

test('tekst przez znaczniki: trafienie rozłożone na kolejne węzły', () => {
  // „lęk” | „ uogól” | „niony” -> szukamy „lęk uogólniony” na pozycjach 0–14
  assert.deepEqual(splitRanges([3, 6, 5], [[0, 14]]), [
    { node: 0, from: 0, to: 3, range: 0 },
    { node: 1, from: 0, to: 6, range: 0 },
    { node: 2, from: 0, to: 5, range: 0 },
  ])
  assert.deepEqual(splitRanges([5, 5], [[1, 2], [6, 8]]), [
    { node: 0, from: 1, to: 2, range: 0 },
    { node: 1, from: 1, to: 3, range: 1 },
  ])
  assert.deepEqual(findQuote('Lęk  uogólniony to lęk', 'lek uogolniony'), [[0, 15]])
  assert.deepEqual(findQuote('akapit pierwszyakapit drugi', 'pierwszy akapit'), [[7, 21]])
})

test('paczki Firestore: limit rozmiaru, powrót do plików, wersja zależy od treści', () => {
  const files = { 'content/a.md': 'x'.repeat(400), 'content/b.md': 'y'.repeat(400), 'content/c.md': 'z' }
  const chunks = packChunks(files, 600)
  assert.deepEqual(chunks.map((c) => Object.keys(c.files)), [['content/a.md'], ['content/b.md', 'content/c.md']])
  assert.deepEqual(unpackChunks(chunks), files)
  assert.throws(() => packChunks({ 'content/big.md': 'x'.repeat(2000) }, 900), /za duża/)
  assert.notEqual(contentVersion(files), contentVersion({ ...files, 'content/c.md': 'zz' }))
  assert.equal(contentVersion(files), contentVersion({ ...files }))
})

test('paczki Firestore z prawdziwych notatek mieszczą się w limicie dokumentu', () => {
  const chunks = packChunks(loadContentFiles())
  for (const c of chunks) {
    const size = new TextEncoder().encode(JSON.stringify(c.files)).length
    assert.ok(size < 1024 * 1024, `${c.id}: ${size} B`)
  }
})

test('synchronizacja: historia łączona wpis po wpisie, zakładki — nowsza lista', () => {
  const merged = mergeRecent([{ path: 'a', at: 5, progress: 0.2 }], [{ path: 'a', at: 3, progress: 0.8 }, { path: 'b', at: 9 }])
  assert.deepEqual(merged, [{ path: 'b', at: 9 }, { path: 'a', at: 5, progress: 0.8 }])
  assert.deepEqual(mergeValue(BOOKMARKS_KEY, ['a'], ['b'], 1, 2), ['b'])
  assert.deepEqual(mergeValue(BOOKMARKS_KEY, ['a'], ['b'], 3, 2), ['a'])
  assert.deepEqual(mergeValue(RECENT_KEY, undefined, [{ path: 'x', at: 1 }]), [{ path: 'x', at: 1 }])
  assert.equal(mergeValue('psycho-theme', 'day', 'night'), 'day')
  assert.ok(!('psycho-theme' in SYNCED))
})
