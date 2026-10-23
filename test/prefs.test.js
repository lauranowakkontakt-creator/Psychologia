import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addRecent, existingRecent, migratePaths, RECENT_MAX, resolveTheme, setProgress, textSizeIndex, toggleBookmark } from '../src/lib/prefs.js'

test('motyw: zapisany wybór wygrywa z systemem', () => {
  assert.equal(resolveTheme('day', false), 'day')
  assert.equal(resolveTheme('night', true), 'night')
  assert.equal(resolveTheme(null, true), 'day')
  assert.equal(resolveTheme('cokolwiek', false), 'night')
})

test('rozmiar tekstu: złe wartości wracają do standardowego', () => {
  assert.equal(textSizeIndex(2), 2)
  assert.equal(textSizeIndex(9), 0)
  assert.equal(textSizeIndex('x'), 0)
  assert.equal(textSizeIndex(null), 0)
})

test('historia: najnowszy na górze, bez powtórzeń, z zachowanym postępem', () => {
  let list = addRecent(null, 'a', 1)
  list = setProgress(list, 'a', 0.5)
  list = addRecent(list, 'b', 2)
  list = addRecent(list, 'a', 3)
  assert.deepEqual(list, [{ path: 'a', at: 3, progress: 0.5 }, { path: 'b', at: 2, progress: 0 }])
  for (let i = 0; i < 30; i++) list = addRecent(list, `t${i}`, i)
  assert.equal(list.length, RECENT_MAX)
})

test('postęp tylko rośnie i jest w zakresie 0–1', () => {
  const list = [{ path: 'a', at: 1, progress: 0.6 }]
  assert.equal(setProgress(list, 'a', 0.2), list, 'bez zmiany zwraca tę samą listę')
  assert.equal(setProgress(list, 'a', 7)[0].progress, 1)
  assert.equal(setProgress(list, 'nie-ma', 0.9), list)
})

test('historia pomija usunięte tematy i śmieci z pamięci', () => {
  assert.deepEqual(existingRecent([{ path: 'a' }, null, { path: 'b' }], (p) => p === 'b'), [{ path: 'b' }])
  assert.deepEqual(existingRecent('zepsute', () => true), [])
  assert.deepEqual(addRecent([{ x: 1 }, 'zle'], 'a', 1), [{ path: 'a', at: 1, progress: 0 }])
})

test('zakładki: dodaj i usuń', () => {
  assert.deepEqual(toggleBookmark(undefined, 'a'), ['a'])
  assert.deepEqual(toggleBookmark(['a', 'b'], 'a'), ['b'])
  assert.deepEqual(toggleBookmark(['b'], 'a'), ['a', 'b'])
})

test('migratePaths: przepisuje historię i zakładki, bez zmian zwraca tę samą listę', () => {
  const rename = (p) => (p.startsWith('stare/') ? p.replace('stare/', 'nowe/') : null)
  const recent = [{ path: 'stare/a', at: 1, progress: 0.5 }, { path: 'inne', at: 2 }]
  assert.deepEqual(migratePaths(recent, rename), [{ path: 'nowe/a', at: 1, progress: 0.5 }, { path: 'inne', at: 2 }])
  assert.deepEqual(migratePaths(['stare/a', 'nowe/a', 'x'], rename), ['nowe/a', 'x'])
  const same = ['x', 'y']
  assert.equal(migratePaths(same, rename), same)
  assert.equal(migratePaths('zepsute', rename), 'zepsute')
})
