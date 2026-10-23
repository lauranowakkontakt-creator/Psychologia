import AxeBuilder from '@axe-core/playwright'
import { allSections, expect, open, test, THEMES, topics } from './fixtures.js'

// Dostępność według WCAG 2.1 AA (axe-core): kontrast tekstu w obu motywach,
// etykiety przycisków i pól, nagłówki, role, język strony.
// Każda notatka osobno — notatki mają własne rysunki i ramki w HTML.

const SCREENS = [
  ['start', ''],
  ['lista', allSections()[0]?.path],
  ...(topics.length ? topics.map((t) => [`notatka ${t.path}`, t.path]) : [['notatka', undefined]]),
  ['wyszukiwarka', 'szukaj?q=temat'],
  ['powtórki', 'powtorki'],
  ['egzamin', 'egzamin'],
  ['postęp', 'postep'],
  ['mapa powiązań', 'mapa'],
  ['dopiski', 'dopiski'],
]

for (const theme of THEMES) {
  test.describe(`motyw ${theme}`, () => {
    test.use({ theme })

    for (const [name, hash] of SCREENS) {
      test(`${name} bez błędów dostępności`, async ({ page }) => {
        test.skip(hash === undefined, 'brak treści dla tego ekranu')
        await open(page, hash)
        // Kontrast liczony po zakończeniu przejść kolorów motywu.
        await page.waitForTimeout(400)
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
        const summary = results.violations.map((v) => ({
          zasada: v.id,
          opis: v.help,
          gdzie: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
        }))
        expect(summary).toEqual([])
      })
    }
  })
}

for (const theme of THEMES) {
  test.describe(`motyw ${theme}`, () => {
    test.use({ theme })

    test('fiszka z odpowiedzią i przyciskami ocen bez błędów dostępności', async ({ page }) => {
      await open(page, 'powtorki')
      await page.getByRole('button', { name: 'Pokaż odpowiedź' }).click()
      await page.waitForTimeout(400)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([])
    })
  })
}
