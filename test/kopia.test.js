import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BACKUP_FORMAT, backupFileName, buildBackup, parseBackup, restoreBackup } from '../src/lib/backup.js'
import { BOOKMARKS_KEY } from '../src/lib/prefs.js'
import { SRS_KEY } from '../src/lib/srs.js'
import { NOTES_KEY } from '../src/lib/annotations.js'
import { hasOpenMarker, stripPrivate } from '../scripts/prywatne.mjs'

test('kopia zapasowa: zapis, odczyt i łączenie bez kasowania', () => {
  const phone = {
    [SRS_KEY]: { a: { interval: 6, last: 200 }, b: { interval: 1, last: 50 } },
    [BOOKMARKS_KEY]: ['kursy/x'],
    'psycho-theme': 'day',
  }
  const backup = buildBackup((key) => phone[key], Date.UTC(2026, 10, 15, 12))
  assert.equal(backup.format, BACKUP_FORMAT)
  assert.deepEqual(Object.keys(backup.data).sort(), [BOOKMARKS_KEY, SRS_KEY].sort())
  assert.match(backupFileName(Date.UTC(2026, 10, 15, 12)), /^psycho-kopia-2026-11-15\.json$/)

  const data = parseBackup(JSON.stringify(backup))
  assert.deepEqual(data[SRS_KEY], phone[SRS_KEY])
  assert.equal(parseBackup('to nie json'), null)
  assert.equal(parseBackup('{"format":"cos-innego","data":{}}'), null)

  // Na urządzeniu jest nowsza ocena fiszki „a”, inna zakładka i dopisek — nic z tego nie ginie.
  const now = {
    [SRS_KEY]: { a: { interval: 15, last: 900 } },
    [BOOKMARKS_KEY]: ['studia/y'],
    [NOTES_KEY]: { 'kursy/x': { text: 'moje', at: 5 } },
  }
  const changes = restoreBackup(data, (key) => now[key])
  assert.equal(changes[SRS_KEY].a.interval, 15)
  assert.equal(changes[SRS_KEY].b.interval, 1)
  assert.deepEqual(changes[BOOKMARKS_KEY], ['studia/y', 'kursy/x'])
  assert.equal(changes[NOTES_KEY], undefined)

  // Ta sama kopia drugi raz — nic do zmiany.
  assert.deepEqual(restoreBackup(data, (key) => ({ ...now, ...changes })[key]), {})
  // Puste urządzenie dostaje wszystko z kopii.
  assert.deepEqual(restoreBackup(data, () => undefined)[SRS_KEY], phone[SRS_KEY])
})

test('publikacja kodu: fragmenty <!-- prywatne --> znikają, niedomknięty znacznik jest błędem', () => {
  const text = 'Publiczne.\n\n<!-- prywatne -->\nDysk /Volumes/X i klucz.\n<!-- /prywatne -->\n\nDalej publiczne.\n'
  assert.equal(stripPrivate(text), 'Publiczne.\n\nDalej publiczne.\n')
  assert.equal(hasOpenMarker(text), false)
  assert.equal(hasOpenMarker('A\n<!-- prywatne -->\nsekret bez końca\n'), true)
  assert.equal(stripPrivate('bez znaczników\n'), 'bez znaczników\n')
})
