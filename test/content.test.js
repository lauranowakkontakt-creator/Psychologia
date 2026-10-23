import { test } from 'node:test'
import assert from 'node:assert/strict'
import { allTopics, breadcrumbs, buildTree, countTopics, findNode, groupBySubject, parseFrontmatter, siblings, titleFromSlug } from '../src/lib/content.js'
import { loadContentFiles } from './helpers.js'

test('frontmatter: pola i treść', () => {
  const { meta, body } = parseFrontmatter('---\ntytul: "Temat: lęk"\nkolejnosc: 2\n---\n\nTreść')
  assert.deepEqual(meta, { tytul: 'Temat: lęk', kolejnosc: '2' })
  assert.equal(body.trim(), 'Treść')
})

test('frontmatter: plik bez nagłówka i z końcami linii z Windowsa', () => {
  assert.deepEqual(parseFrontmatter('# Tytuł\n'), { meta: {}, body: '# Tytuł\n' })
  assert.equal(parseFrontmatter('---\r\ntytul: A\r\n---\r\nB').meta.tytul, 'A')
})

test('tytuł z nazwy pliku', () => {
  assert.equal(titleFromSlug('temat-1'), 'Temat 1')
  assert.equal(titleFromSlug('interwencja-kryzysowa'), 'Interwencja kryzysowa')
})

const sample = {
  '/content/studia/_sekcja.md': '---\ntytul: Studia\nkolejnosc: 1\nikona: brain\n---\n',
  '/content/studia/temat-10.md': '---\ntytul: Temat 10\n---\nx',
  '/content/studia/temat-2.md': '---\ntytul: Temat 2\n---\nx',
  '/content/studia/wstep.md': '---\ntytul: Wstęp\nkolejnosc: 0\n---\nx',
  '/content/kursy/_sekcja.md': '---\ntytul: Kursy\nkolejnosc: 2\n---\n',
  '/content/kursy/trauma/temat-1.md': 'bez nagłówka',
  '/content/kursy/notes.txt': 'pomijane',
}

test('drzewo: sekcje, podsekcje bez _sekcja.md i kolejność', () => {
  const root = buildTree(sample)
  assert.deepEqual(root.sections.map((s) => s.title), ['Studia', 'Kursy'])
  // jawna kolejność pierwsza, potem naturalnie: 2 przed 10
  assert.deepEqual(findNode(root, 'studia').topics.map((t) => t.title), ['Wstęp', 'Temat 2', 'Temat 10'])
  const trauma = findNode(root, 'kursy/trauma')
  assert.equal(trauma.title, 'Trauma')
  assert.equal(trauma.topics[0].title, 'Temat 1')
  assert.equal(findNode(root, 'studia').icon, 'brain')
})

test('findNode: temat, brak, ścieżka z ukośnikami', () => {
  const root = buildTree(sample)
  assert.equal(findNode(root, '/kursy/trauma/temat-1/').type, 'temat')
  assert.equal(findNode(root, 'studia/nie-ma'), null)
  assert.equal(findNode(root, 'studia/temat-2/dalej'), null)
  assert.equal(findNode(root, ''), root)
})

test('okruszki i sąsiednie tematy', () => {
  const root = buildTree(sample)
  assert.deepEqual(breadcrumbs(root, 'kursy/trauma/temat-1').map((c) => c.title), ['Kursy', 'Trauma', 'Temat 1'])
  const t2 = findNode(root, 'studia/temat-2')
  const { prev, next, number } = siblings(root, t2)
  assert.equal(prev.title, 'Wstęp')
  assert.equal(next.title, 'Temat 10')
  assert.equal(number, 2)
  assert.equal(siblings(root, findNode(root, 'studia/wstep')).prev, null)
})

test('allTopics: każdy temat z pełną ścieżką sekcji', () => {
  const topics = allTopics(buildTree(sample))
  assert.equal(topics.length, 4)
  assert.deepEqual(topics.find((t) => t.slug === 'temat-1').trail, ['Kursy', 'Trauma'])
})

test('prawdziwa treść: Studia i Kursy na starcie, w Studiach Przedmioty i Tematy, dwa kursy', () => {
  const root = buildTree(loadContentFiles())
  assert.deepEqual(root.sections.map((s) => s.title), ['Studia – psychologia', 'Kursy'])
  assert.deepEqual(findNode(root, 'studia').sections.map((s) => s.title), ['Przedmioty', 'Tematy'])
  assert.deepEqual(findNode(root, 'kursy').sections.map((s) => s.title), ['Interwencja kryzysowa', 'Psychotraumatologia'])
  assert.equal(root.topics.length, 0, 'pliki .md luzem w content/ nie mają gdzie się pokazać')
  for (const t of allTopics(root)) {
    assert.ok(t.title, `brak tytułu: ${t.path}`)
    assert.ok(t.body, `pusty temat: ${t.path}`)
  }
})

test('przedmiot, rodzaj, data i licznik z nagłówka', () => {
  const root = buildTree({
    '/content/kursy/_sekcja.md': '---\ntytul: Kursy\nlicznik: kurs, kursy, kursów\n---\n',
    '/content/kursy/a/x.md': 'x',
    '/content/studia/a.md': '---\nprzedmiot: Statystyka\nrodzaj: Ćwiczenia\ndata: 2025-10-08\n---\nx',
    '/content/studia/b.md': '---\nprzedmiot: Poznawcza\n---\nx',
    '/content/studia/c.md': '---\nprzedmiot: Statystyka\n---\nx',
    '/content/studia/d.md': 'bez przedmiotu',
  })
  assert.deepEqual(findNode(root, 'kursy').counter, ['kurs', 'kursy', 'kursów'])
  const a = findNode(root, 'studia/a')
  assert.deepEqual([a.subject, a.kind, a.date], ['Statystyka', 'Ćwiczenia', '2025-10-08'])
  const groups = groupBySubject(findNode(root, 'studia').topics)
  assert.deepEqual(groups.map((g) => [g.name, g.topics.map((t) => t.slug)]), [
    ['Statystyka', ['a', 'c']], ['Poznawcza', ['b']], ['', ['d']],
  ])
  assert.equal(countTopics(root), 5)
})
