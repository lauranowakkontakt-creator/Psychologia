import { test } from 'node:test'
import assert from 'node:assert/strict'
import { legacyPath, parentPath, parseHash, toHash } from '../src/lib/route.js'

test('parseHash', () => {
  assert.deepEqual(parseHash(''), { path: '', q: '' })
  assert.deepEqual(parseHash('#/'), { path: '', q: '' })
  assert.deepEqual(parseHash('#/kursy/psychotraumatologia/'), { path: 'kursy/psychotraumatologia', q: '' })
  assert.deepEqual(parseHash('#/szukaj?q=l%C4%99k%20napadowy'), { path: 'szukaj', q: 'lęk napadowy' })
  assert.deepEqual(parseHash('#/zl%E0'), { path: 'zl%E0', q: '' })
})

test('toHash i parseHash są odwrotne', () => {
  for (const [path, q] of [['', ''], ['studia/temat-1', 'żałoba & strata'], ['szukaj', 'a?b=c']]) {
    assert.deepEqual(parseHash(toHash(path, q)), { path, q })
  }
})

test('parentPath: poziom wyżej', () => {
  assert.equal(parentPath('kursy/trauma/temat-1'), 'kursy/trauma')
  assert.equal(parentPath('/studia/'), '')
  assert.equal(parentPath(''), '')
})

test('legacyPath: stare adresy Studiów i Tematów', () => {
  assert.equal(legacyPath('studia/neurofizjologia/neuron/psychofarmakologia'), 'studia/przedmioty/neurofizjologia/neuron/psychofarmakologia')
  assert.equal(legacyPath('/tematy/zaburzenia/uzaleznienia/'), 'studia/tematy/zaburzenia/uzaleznienia')
  assert.equal(legacyPath('tematy'), 'studia/tematy')
  assert.equal(legacyPath('studia/przedmioty/logika'), null)
  assert.equal(legacyPath('studia/tematy/procesy'), null)
  assert.equal(legacyPath('studia'), null)
  assert.equal(legacyPath('kursy/psychotraumatologia'), null)
  assert.equal(legacyPath(''), null)
})

test('ekrany aplikacji nie kolidują z działami w content/', async () => {
  const { APP_PATHS } = await import('../src/lib/route.js')
  const { readdirSync } = await import('node:fs')
  const { ROOT } = await import('./helpers.js')
  const top = readdirSync(new URL('content', `file://${ROOT}`)).filter((n) => !n.startsWith('.') && !n.startsWith('_'))
  for (const p of APP_PATHS) assert.ok(!top.includes(p), `folder content/${p} zasłoniłby ekran aplikacji`)
})
