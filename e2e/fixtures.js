import { test as base, expect } from '@playwright/test'
import { allTopics, buildTree } from '../src/lib/content.js'
import { loadContentFiles } from '../test/helpers.js'

// Prawdziwa treść z content/ — testy sprawdzają to, co faktycznie jest w notatkach,
// więc nie trzeba ich poprawiać po dodaniu nowego tematu.
export const tree = buildTree(loadContentFiles())
export const topics = allTopics(tree)

export function allSections(section = tree) {
  return section.sections.flatMap((s) => [s, ...allSections(s)])
}

export const THEMES = ['night', 'day']

// Limit dla testów, które w jednej pętli przechodzą przez wszystkie notatki:
// rośnie razem z ich liczbą, żeby nowe notatki nie wysadzały domyślnych 30 s.
export const ALL_TOPICS_TIMEOUT = 30_000 + topics.length * 1_000

// Każdy test:
//  - zaczyna z czystą pamięcią przeglądarki i wybranym motywem (domyślnie noc),
//  - dostaje puste czcionki Google zamiast pobierania (szybciej, bez internetu),
//  - kończy się błędem, jeśli w konsoli pojawił się błąd strony.
export const test = base.extend({
  theme: ['night', { option: true }],

  page: async ({ page, theme }, use) => {
    const errors = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`console: ${m.text()}`)
    })
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
      route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
    )
    await page.addInitScript((t) => {
      if (!sessionStorage.getItem('e2e-started')) {
        sessionStorage.setItem('e2e-started', '1')
        localStorage.clear()
        if (t) localStorage.setItem('psycho-theme', JSON.stringify(t))
      }
    }, theme)
    await use(page)
    expect(errors, 'błędy w konsoli przeglądarki').toEqual([])
  },
})

export { expect }

// Przejście po adresie w aplikacji (#/...) i czekanie, aż ekran się narysuje.
export async function open(page, hash = '') {
  await page.goto(`./#/${hash}`)
  await expect(page.locator('main.page')).not.toBeEmpty()
}
