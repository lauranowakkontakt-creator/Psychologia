import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Wersja z logowaniem bez zalogowanej osoby: ekran logowania i nic więcej.

test.beforeEach(async ({ page }) => {
  // Żadnych połączeń z Google (Firebase, czcionki) — test działa bez internetu.
  await page.route(/googleapis\.com|gstatic\.com|firebaseapp\.com|google\.com/, (route) => route.abort())
})

test('bez logowania widać tylko ekran logowania, bez notatek i wyszukiwarki', async ({ page }) => {
  await page.goto('./#/')
  await expect(page.getByRole('button', { name: 'Zaloguj przez Google' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Twoje notatki')
  await expect(page.locator('.home-card, .search-field, .note')).toHaveCount(0)

  // Bezpośredni adres notatki też prowadzi do logowania.
  await page.goto('./#/kursy/interwencja-kryzysowa/modul-2-pierwsza-pomoc')
  await expect(page.getByRole('button', { name: 'Zaloguj przez Google' })).toBeVisible()
  await expect(page.locator('.note-title')).toHaveCount(0)
})

for (const theme of ['night', 'day']) {
  test(`ekran logowania bez błędów dostępności (${theme})`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem('psycho-theme', JSON.stringify(t)), theme)
    await page.goto('./#/')
    await expect(page.getByRole('button', { name: 'Zaloguj przez Google' })).toBeVisible()
    await page.waitForTimeout(400)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(results.violations.map((v) => v.id)).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)
  })
}
