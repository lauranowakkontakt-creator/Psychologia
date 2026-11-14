/* global DISORDERS, PATHWAYS */
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './fixtures.js'

// „Bot-użytkownik” atlasu mózgu (public/atlas/index.html): klika po zaburzeniach, obszarach,
// szlakach, przekrojach i trybie 2D i pilnuje tego, na co skarżyła się Laura:
//  - wybrane zaburzenie nie znika po kliknięciu obszaru ani szlaku,
//  - każdy obszar zaburzenia ma opis „co to znaczy”,
//  - szlaki są tylko tam, gdzie zaburzenie ich dotyczy,
//  - nazwa przy najechaniu = nazwa po kliknięciu,
//  - 2D ma opis, jak go czytać,
//  - zaznaczenie nie przelicza kolorów co klatkę (płynność).

async function openAtlas(page) {
  await page.goto('/atlas/index.html?theme=night')
  await page.waitForFunction(() => window.ATLAS && document.querySelector('#panel h2'), null, { timeout: 30_000 })
}

test.describe('Atlas mózgu: bot-użytkownik', () => {
  // Render 3D bez karty graficznej jest wolny, więc te testy idą tylko w jednym silniku (Chromium/Android);
  // ekran atlasu w ramce sprawdzają osobno testy telefonu i dostępności w obu.
  test.skip(({ browserName }) => browserName === 'webkit', 'ciężki render 3D: tylko Chromium')
  // Render 3D w testach jest programowy (bez GPU) i przy pełnym przebiegu wielu testów naraz bywa wolny.
  test.setTimeout(180_000)
  test('każde zaburzenie: opis obszarów, kontekst po kliknięciu obszaru i szlaków', async ({ page }) => {
    test.skip(!!process.env.CI, 'za wolne bez karty graficznej na serwerze CI; sprawdzane lokalnie w npm run check')
    await openAtlas(page)
    const list = await page.evaluate(() =>
      DISORDERS.map((d) => ({ id: d.id, name: d.name, paths: PATHWAYS.filter((p) => p.disorders.includes(d.id)).map((p) => p.id) })),
    )
    expect(list.length).toBeGreaterThan(10)
    for (const d of list) {
      await page.locator(`#tab-dis [data-dis="${d.id}"]`).click()
      const panel = page.locator('#panel')
      await expect(panel.locator('h2'), d.id).toHaveText(d.name)

      // każdy obszar ma wytłumaczenie dla psychologa
      const rows = panel.locator('.rows .row')
      const n = await rows.count()
      expect(n, `${d.id}: brak obszarów`).toBeGreaterThan(0)
      expect(await panel.locator('.rows .row .mean').count(), `${d.id}: obszar bez opisu „co to znaczy”`).toBe(n)

      // szlaki tylko wtedy, gdy zaburzenie ich dotyczy
      const toggles = panel.locator('[data-pwtoggle]')
      expect(await toggles.count(), `${d.id}: szlaki w panelu`).toBe(d.paths.length)
      if (d.paths.length) {
        await toggles.first().click()
        await expect(panel.locator('h2'), `${d.id}: szlak wyrzucił zaburzenie`).toHaveText(d.name)
        expect(await page.evaluate(() => window.ATLAS._state.disorder)).toBe(d.id)
        expect(await page.evaluate(() => window.ATLAS._state.pathways.size)).toBe(1)
        await panel.locator('[data-pwtoggle]').first().click()
        expect(await page.evaluate(() => window.ATLAS._state.pathways.size)).toBe(0)
      } else {
        await expect(panel.locator('.ntcard')).toHaveCount(0)
      }

      // kliknięcie obszaru zostawia zaburzenie jako kontekst
      await rows.first().click()
      await expect(panel.locator('.ctx'), `${d.id}: brak kontekstu zaburzenia`).toContainText(d.name.replace(/ \(.*\)/, ''))
      expect(await page.evaluate(() => window.ATLAS._state.disorder)).toBe(d.id)
      expect(await panel.locator('.ctx .ctxmean').count(), `${d.id}: kontekst bez „co to znaczy”`).toBe(1)
      await panel.locator('#backctx').click()
      await expect(panel.locator('h2')).toHaveText(d.name)
    }
  })

  test('szlaki: wiele naraz, zaburzenie zostaje, bez błędów', async ({ page }) => {
    await openAtlas(page)
    await page.locator('#tab-dis [data-dis="adhd"]').click()
    const buttons = page.locator('#pw-btns [data-pw]')
    const count = await buttons.count()
    for (let i = 0; i < count; i++) await buttons.nth(i).click()
    expect(await page.evaluate(() => window.ATLAS._state.pathways.size)).toBe(count)
    expect(await page.evaluate(() => window.ATLAS._state.disorder)).toBe('adhd')
    // przyciski szlaków niezwiązanych z ADHD są przyciemnione, związane podświetlone
    await expect(page.locator('#pw-btns .rel').first()).toBeVisible()
    for (let i = 0; i < count; i++) await buttons.nth(i).click()
    expect(await page.evaluate(() => window.ATLAS._state.pathways.size)).toBe(0)
    // bez zaburzenia szlak pokazuje własny panel
    await page.locator('#panel #clearhl').click()
    await page.locator('#pw-btns [data-pw="da"]').click()
    await expect(page.locator('#panel h2')).toHaveText('Dopamina')
  })

  test('nazwa przy najechaniu to ta sama nazwa co po kliknięciu', async ({ page }) => {
    test.skip(!!process.env.CI, 'za wolne bez karty graficznej na serwerze CI; sprawdzane lokalnie w npm run check')
    await openAtlas(page)
    await page.locator('#gl').scrollIntoViewIfNeeded()
    const box = await page.locator('#gl').boundingBox()
    let checked = 0
    for (let iy = 1; iy < 6; iy++) {
      for (let ix = 1; ix < 7; ix++) {
        const x = box.x + (box.width * ix) / 7
        const y = box.y + (box.height * iy) / 6
        await page.mouse.move(x, y)
        await page.waitForTimeout(250)
        const tip = await page.locator('#tip').evaluate((e) => ({ o: e.style.opacity, t: e.textContent }))
        if (tip.o !== '1') continue
        await page.mouse.click(x, y)
        const title = (await page.locator('#panel h2').textContent()).trim()
        // kamera leci do wybranego obszaru; czekamy, żeby kolejne najechanie trafiło w ten sam widok
        await page.waitForTimeout(900)
        expect(tip.t.split(' · d =')[0], `nazwa przy najechaniu (${ix},${iy})`).toBe(title)
        checked++
      }
    }
    expect(checked).toBeGreaterThan(3)
  })

  test('2D: opis przekroju, obszary zaburzenia ze strzałkami, klikanie', async ({ page }) => {
    await openAtlas(page)
    await page.locator('#dim [data-dim="2d"]').click()
    const info = page.locator('#flatinfo')
    await expect(info).toBeVisible()
    await expect(info).toContainText('Przekrój strzałkowy')
    for (const [axis, word] of [['z', 'Przekrój czołowy'], ['y', 'Przekrój poziomy'], ['x', 'Przekrój strzałkowy']]) {
      await page.locator(`#sec-axis [data-axis="${axis}"]`).click()
      await expect(info).toContainText(word)
      expect(await page.locator('#flat .fr').count(), `${axis}: pusty przekrój`).toBeGreaterThan(3)
    }
    // kliknięcie struktury daje panel o tej samej nazwie, którą ma w opisie
    const el = page.locator('#flat .fr[data-r]:not(.rib)').first()
    const label = await el.getAttribute('data-label')
    await el.dispatchEvent('click')
    await expect(page.locator('#panel h2')).toHaveText(label)
    // zaburzenie: przekrój przechodzi przez jego obszar, opis kolorów i strzałki przy nazwach
    await page.locator('#tab-dis [data-dis="adhd"]').click()
    await expect(info).toContainText('Czerwony')
    await expect(info).toContainText('ADHD')
    expect(await page.locator('#flat text.aff').count(), 'brak podpisów obszarów zaburzenia').toBeGreaterThan(0)
    // suwak daje inny przekrój, a pusty przekrój jest opisany
    await page.locator('#sec-range').fill('3')
    await expect(page.locator('#flat')).toBeVisible()
    await page.locator('#dim [data-dim="3d"]').click()
    await expect(page.locator('#gl')).toBeVisible()
  })

  test('przekroje 3D: płaszczyzny, suwak, odwracanie', async ({ page }) => {
    await openAtlas(page)
    for (const axis of ['x', 'z', 'y']) {
      await page.locator(`#sec-axis [data-axis="${axis}"]`).click()
      await expect(page.locator('#sec-val')).not.toHaveText('')
      await page.locator('#sec-range').fill('30')
      await page.locator('#sec-flip').click()
      await page.locator('#sec-range').fill('70')
    }
    await page.locator('#sec-axis').getByRole('button', { name: 'Brak' }).dispatchEvent('click')
    await expect(page.locator('#sec-extra')).toBeHidden()
  })

  test('zaznaczenie i szlaki nie przeliczają kolorów co klatkę', async ({ page }) => {
    await openAtlas(page)
    await page.locator('#pw-btns [data-pw="da"]').click()
    await page.locator('#pw-btns [data-pw="5ht"]').click()
    await page.locator('#tab-reg').evaluate(() => {})
    await page.evaluate(() => document.querySelector('[data-tab="reg"]').click())
    await page.locator('#tab-reg [data-reg="hippocampus"]').click()
    const before = await page.evaluate(() => window.ATLAS._stats().recolor)
    await page.waitForTimeout(1500)
    const after = await page.evaluate(() => window.ATLAS._stats().recolor)
    expect(after - before, 'kolory przeliczane bez powodu').toBeLessThanOrEqual(3)
  })

  for (const theme of ['night', 'day']) {
    test(`dostępność (WCAG AA) w różnych stanach, motyw ${theme}`, async ({ page }) => {
      test.skip(!!process.env.CI, 'za wolne bez karty graficznej na serwerze CI; sprawdzane lokalnie w npm run check')
      await page.goto(`/atlas/index.html?theme=${theme}`)
      await page.waitForFunction(() => window.ATLAS && document.querySelector('#panel h2'), null, { timeout: 30_000 })
      const scan = async (name) => {
        await page.waitForTimeout(400)
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
        const summary = results.violations.map((v) => ({ zasada: v.id, gdzie: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }))
        expect(summary, name).toEqual([])
      }
      await scan('start')
      await page.locator('#tab-dis [data-dis="adhd"]').click()
      await scan('zaburzenie')
      await page.locator('#panel .rows .row').first().click()
      await scan('obszar w kontekście zaburzenia')
      await page.locator('#pw-btns [data-pw="da"]').click()
      await page.locator('#dim [data-dim="2d"]').click()
      await scan('2D z szlakiem')
      await page.locator('#dim [data-dim="3d"]').click()
      for (const tab of ['reg', 'net', 'cells', 'nt', 'drugs', 'read']) {
        await page.locator(`#tabs [data-tab="${tab}"]`).click()
        await scan(`zakładka ${tab}`)
      }
    })
  }
})
