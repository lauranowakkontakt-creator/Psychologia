import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderMarkdown, splitLead } from '../src/lib/note.js'

test('pierwszy akapit idzie do „W skrócie”', () => {
  const { lead, rest } = splitLead('\nKrótko o temacie.\nDruga linia.\n\n## Dalej\n\n- punkt\n')
  assert.equal(lead, 'Krótko o temacie.\nDruga linia.')
  assert.match(rest, /^## Dalej/)
  assert.match(rest, /- punkt/)
})

test('notatka zaczynająca się nagłówkiem albo listą nie ma ramki', () => {
  assert.deepEqual(splitLead('## Tytuł\n\nTekst'), { lead: '', rest: '## Tytuł\n\nTekst' })
  assert.equal(splitLead('- a\n- b').lead, '')
  assert.deepEqual(splitLead(''), { lead: '', rest: '' })
})

test('sam akapit: ramka i pusta reszta', () => {
  assert.deepEqual(splitLead('Tylko to.'), { lead: 'Tylko to.', rest: '' })
})

test('tabela z 3+ kolumnami układa się w kafelki na telefonie, węższa zostaje zwykła', () => {
  const wide = renderMarkdown('| Wzorzec | **Dziecko** | Opiekun |\n|---|---|---|\n| bezpieczny | eksploruje | dostępny |')
  assert.match(wide, /<table class="table-stack">/)
  assert.match(wide, /<td data-label="Dziecko">eksploruje<\/td>/)
  assert.match(wide, /<th><strong>Dziecko<\/strong><\/th>/)
  const narrow = renderMarkdown('| a | b |\n|---|---|\n| 1 | 2 |')
  assert.match(narrow, /<table>/)
  assert.doesNotMatch(narrow, /data-label/)
})
