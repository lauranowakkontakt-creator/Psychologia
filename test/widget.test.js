import { test } from 'node:test'
import assert from 'node:assert/strict'
import { widgetScript } from '../scripts/widget.mjs'

// Wygenerowany skrypt widżetu uruchomiony z udawanym Scriptable:
// wybiera pojęcie z właściwego działu, pyta tylko o definicje (chyba że „pytania”)
// i ustawia odświeżenie na następne okienko czasu.
function run(items, param, family = 'medium') {
  const texts = []
  let widget = null
  class Color {
    static dynamic(_light, dark) { return dark }
  }
  class Font {}
  Font.semiboldSystemFont = Font.systemFont = () => ({})
  class ListWidget {
    constructor() { widget = this }
    setPadding() {}
    addText(t) { texts.push(t); return {} }
    addSpacer() {}
  }
  const fn = new Function('args', 'config', 'Color', 'Font', 'ListWidget', 'Script', `return (async () => { ${widgetScript(items, 'https://psycho.example/')} })()`)
  fn({ widgetParameter: param }, { runsInWidget: true, widgetFamily: family }, Color, Font, ListWidget, { setWidget() {}, complete() {} })
  return { texts, widget }
}

const ITEMS = [
  ['studia', 'd', 'Ruminacje', 'Ciągłe odtwarzanie sytuacji.', 'Objawy', 'studia/x/objawy'],
  ['kursy', 'd', 'Kryzys', 'Przejściowa nierównowaga.', 'Moduł 1', 'kursy/k/modul-1'],
  ['studia', 'p', 'Co to jest?', 'Pytanie.', 'Objawy', 'studia/x/objawy'],
]

test('widżet: dział z parametru, domyślnie studia i same definicje', () => {
  assert.equal(run(ITEMS, '').texts[1], 'Ruminacje')
  assert.equal(run(ITEMS, 'kursy 6').texts[1], 'Kryzys')
  const { texts, widget } = run(ITEMS, 'kursy')
  assert.match(texts[0], /^POJĘCIE/)
  assert.equal(widget.url, 'https://psycho.example/#/kursy/k/modul-1')
  assert.ok(widget.refreshAfterDate > new Date())
})

test('widżet: pusty zbiór nie wysypuje skryptu', () => {
  assert.equal(run([], '').texts[1], 'Brak pojęć')
})
