import { ALL_TOPICS_TIMEOUT, expect, open, test, topics } from './fixtures.js'
import { illustrationProblems } from './ilustracje-geometria.js'

// Ilustracje SVG w notatkach (.fig.ill) rysujemy ręcznie, więc łatwo o napis,
// który wystaje poza rysunek, wchodzi na inny napis, wychodzi z ramki albo
// przecina go linia. Sprawdzamy każdą notatkę z ilustracją – reguły są
// w e2e/ilustracje-geometria.js (te same, co w scripts/audyt-ilustracji.mjs).

const withIllustrations = topics.filter((t) => t.body.includes('class="fig ill"'))

test('ilustracje: napisy mieszczą się w rysunku, ramkach i nie są przecięte', async ({ page }) => {
  test.skip(!withIllustrations.length, 'brak notatek z ilustracjami')
  test.setTimeout(ALL_TOPICS_TIMEOUT)
  test.slow()
  const all = []
  for (const topic of withIllustrations) {
    await open(page, topic.path)
    for (const p of await page.evaluate(illustrationProblems)) all.push(`${topic.path}: ${p}`)
  }
  expect(all).toEqual([])
})
