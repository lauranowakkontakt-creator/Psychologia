import { expect, open, test, topics } from './fixtures.js'

// Instalacja na pulpicie telefonu i działanie bez internetu.

test('manifest i ikony aplikacji są na miejscu', async ({ page, request }) => {
  await open(page)
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  const manifest = await (await request.get(href)).json()
  expect(manifest).toMatchObject({ short_name: 'Psycho', display: 'standalone', lang: 'pl' })
  for (const icon of manifest.icons) {
    const res = await request.get(icon.src)
    expect(res.ok(), icon.src).toBe(true)
    expect(res.headers()['content-type']).toBe('image/png')
  }
  for (const sel of ['link[rel="apple-touch-icon"]', 'link[rel="icon"]']) {
    const res = await request.get(await page.locator(sel).getAttribute('href'))
    expect(res.ok(), sel).toBe(true)
  }
})

test('po pierwszym otwarciu notatki działają bez internetu', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'tryb offline z service workerem sprawdzamy w Chromium')
  await open(page)
  await page.evaluate(() => navigator.serviceWorker.ready)
  // Service worker przejmuje stronę po przeładowaniu.
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)

  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('.logo')).toBeVisible()
  const t = topics[0]
  await open(page, t.path)
  await expect(page.locator('.note-title')).toHaveText(t.title)
  await context.setOffline(false)
})
