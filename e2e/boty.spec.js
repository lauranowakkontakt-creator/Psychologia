import { expect, open, test } from './fixtures.js'

// Boty-testerzy. Zamiast sprawdzać z góry wypisane ekrany, chodzą po aplikacji jak użytkownik:
//  - „zwiedzacz” zaczyna od startu i klika każdy link wewnątrz aplikacji (#/...), aż obejdzie wszystko;
//    łapie martwe linki („Nie ma takiej strony”), błędy w konsoli i ekrany, które jadą w bok,
//  - „klikacz atlasu” otwiera atlas mózgu tak jak na telefonie (w ramce aplikacji) i klika każdą
//    pozycję w każdej zakładce; po każdym kliknięciu panel musi mieć tytuł, pasek wyboru pod modelem
//    musi pokazywać to samo, a nic nie może wystawać poza ekran,
//  - „bez internetu” sprawdza, że atlas nie potrzebuje żadnego serwera poza aplikacją (three.js jest w paczce).
// Błędy konsoli zbiera fixture (fixtures.js) – każdy test kończy się błędem, jeśli jakiś był.

const MAX_PAGES = 400

test.describe('Bot-zwiedzacz', () => {
  test.setTimeout(240_000)

  test('obchodzi wszystkie linki w aplikacji: bez martwych linków i bez jazdy w bok', async ({ page }) => {
    const seen = new Set([''])
    const queue = ['']
    const problems = []
    while (queue.length && seen.size <= MAX_PAGES) {
      const path = queue.shift()
      await open(page, path)
      const info = await page.evaluate(() => {
        const doc = document.documentElement
        const links = [...document.querySelectorAll('a[href^="#/"]')].map((a) => a.getAttribute('href').slice(2))
        return {
          title: document.querySelector('main.page h1')?.textContent?.trim() || '',
          wide: doc.scrollWidth > doc.clientWidth + 1 ? `${doc.scrollWidth}px > ${doc.clientWidth}px` : '',
          links,
        }
      })
      if (info.title === 'Nie ma takiej strony') problems.push(`martwy link: #/${path}`)
      if (info.wide) problems.push(`#/${path}: poziome przewijanie ${info.wide}`)
      for (const link of info.links) {
        // to samo miejsce z innym fragmentem (#nagłówek) albo zapytaniem to ten sam ekran
        const clean = link.split('#')[0]
        if (!seen.has(clean)) {
          seen.add(clean)
          queue.push(clean)
        }
      }
    }
    expect(seen.size, 'bot nie znalazł linków').toBeGreaterThan(5)
    expect(problems).toEqual([])
  })
})

// Atlas w ramce aplikacji, jak na telefonie.
async function openAtlasInApp(page) {
  await open(page, 'atlas')
  const frame = page.frameLocator('iframe.atlas-frame')
  const handle = await page.locator('iframe.atlas-frame').elementHandle()
  const inner = await handle.contentFrame()
  await inner.waitForFunction(() => window.ATLAS && document.querySelector('#panel h2'), null, { timeout: 60_000 })
  return { frame, inner }
}

test.describe('Bot-klikacz atlasu (w aplikacji)', () => {
  test.skip(({ browserName }) => browserName === 'webkit', 'ciężki render 3D: tylko Chromium')
  test.setTimeout(180_000)

  test('ramka rośnie z treścią: przewija się jedna strona, nie okno w oknie', async ({ page }) => {
    const { inner } = await openAtlasInApp(page)
    await expect
      .poll(async () => {
        const frameH = await page.locator('iframe.atlas-frame').evaluate((e) => e.offsetHeight)
        const contentH = await inner.evaluate(() => document.documentElement.scrollHeight)
        return Math.abs(frameH - contentH)
      })
      .toBeLessThanOrEqual(2)
  })

  test('dotknięcie modelu pokazuje pod nim nazwę i funkcję, „Opis” prowadzi do opisu', async ({ page }) => {
    const { frame, inner } = await openAtlasInApp(page)
    const bar = frame.locator('#selbar')
    await expect(bar).toBeHidden()
    // legenda kolorów płatów jest widoczna także na telefonie
    await expect(frame.locator('#lobeleg')).toBeVisible()
    await expect(frame.locator('#lobeleg')).toContainText('Płat czołowy')

    const box = await frame.locator('#gl').boundingBox()
    let hit = false
    for (const [fx, fy] of [[0.45, 0.45], [0.35, 0.4], [0.55, 0.35], [0.4, 0.55], [0.6, 0.5]]) {
      await page.touchscreen.tap(box.x + box.width * fx, box.y + box.height * fy)
      if (await inner.evaluate(() => !!window.ATLAS._state.region)) {
        hit = true
        break
      }
    }
    expect(hit, 'dotknięcie modelu nic nie wybrało').toBe(true)
    await expect(bar).toBeVisible()
    const title = (await frame.locator('#panel h2').textContent()).trim()
    await expect(frame.locator('#selbar-name')).toHaveText(title)
    await expect(frame.locator('#selbar-sum')).not.toBeEmpty()
    // pasek leży w widoku tuż pod modelem
    const barBox = await bar.boundingBox()
    expect(barBox.y + barBox.height, 'pasek wyboru poza ekranem').toBeLessThan(page.viewportSize().height + (await page.evaluate(() => scrollY)))

    // „Opis” przewija płynnie, a na serwerze CI (render 3D bez karty graficznej) klatki są rzadkie,
    // więc samo przewijanie trwa kilka sekund – stąd dłuższy limit niż domyślne 5 s.
    const before = await page.evaluate(() => scrollY)
    await frame.locator('#selbar-more').click()
    await expect
      .poll(async () => (await frame.locator('#panel h2').boundingBox()).y, { timeout: 20_000 })
      .toBeLessThan(page.viewportSize().height)
    expect(await page.evaluate(() => scrollY), '„Opis” nie przewinął strony').toBeGreaterThan(before)
    await frame.locator('#selbar-x').click()
    await expect(bar).toBeHidden()
    expect(await inner.evaluate(() => window.ATLAS._state.region)).toBeNull()
  })

  test('każda pozycja w każdej zakładce: panel z tytułem, zgodny pasek wyboru, nic nie wystaje', async ({ page }) => {
    const { inner } = await openAtlasInApp(page)
    // Klikanie dzieje się w samej stronie atlasu, jedno po drugim: prawdziwe kliknięcia w przyciski,
    // ale bez czekania na lot kamery i render 3D (bez karty graficznej to by trwało kilkanaście minut).
    const result = await inner.evaluate(() => {
      const problems = []
      let clicks = 0
      const W = document.documentElement.clientWidth
      const $ = (s) => document.querySelector(s)
      const overflowing = () => {
        const out = []
        if (document.documentElement.scrollWidth > W + 1) out.push(`strona ${document.documentElement.scrollWidth}px`)
        for (const el of document.querySelectorAll('#panel *, .stage *, .tabpanel:not([hidden]) > *')) {
          if (el.closest('.tablewrap, .viewscroll, nav.tabs, pre, #labels')) continue // przewijają się w bok celowo albo są przycinane
          const r = el.getBoundingClientRect()
          if (r.width && r.right > W + 1) out.push(`${el.tagName.toLowerCase()}.${el.className}: ${Math.round(r.right)}px`)
        }
        return out.slice(0, 3)
      }
      const check = (where) => {
        clicks++
        const h2 = $('#panel h2')?.textContent.trim()
        if (!h2) problems.push(`${where}: panel bez tytułu`)
        const s = window.ATLAS._state
        if (s.region || s.disorder || s.network || s.pathways.size) {
          if ($('#selbar').hidden) problems.push(`${where}: brak paska wyboru pod modelem`)
          else if ($('#selbar-name').textContent.trim() !== h2) problems.push(`${where}: pasek „${$('#selbar-name').textContent}” ≠ panel „${h2}”`)
        }
        for (const o of overflowing()) problems.push(`${where}: wystaje ${o}`)
      }
      const tab = (t) => $(`#tabs [data-tab="${t}"]`).click()
      const tabs = [
        ['dis', '#tab-dis [data-dis]'],
        ['reg', '#reglist [data-reg]'],
        ['net', '#netlist [data-net]'],
        ['nt', '#nttable button'],
        ['drugs', '#druglist button'],
      ]
      for (const [t, selector] of tabs) {
        tab(t)
        const n = document.querySelectorAll(selector).length
        if (!n) problems.push(`zakładka ${t}: pusta`)
        for (let i = 0; i < n; i++) {
          tab(t)
          const el = document.querySelectorAll(selector)[i]
          const label = el.textContent.trim().slice(0, 40)
          el.click()
          check(`${t} → ${label}`)
          // każdy przycisk w panelu po wybraniu (obszary, szlaki, sieci, „wróć”) też musi działać
          if (t === 'dis' || t === 'reg') {
            const inPanel = [...document.querySelectorAll('#panel button')].map((b, j) => j)
            for (const j of inPanel.slice(0, 6)) {
              const b = document.querySelectorAll('#panel button')[j]
              if (!b || b.id === 'selbar-x') continue
              const bl = b.textContent.trim().slice(0, 30)
              b.click()
              check(`${t} → ${label} → ${bl}`)
              tab(t)
              document.querySelectorAll(selector)[i].click()
            }
          }
        }
      }
      for (const b of document.querySelectorAll('#pw-btns [data-pw]')) {
        b.click()
        check(`szlak ${b.dataset.pw}`)
        b.click()
      }
      $('#selbar-x').click()
      if (!$('#selbar').hidden) problems.push('przycisk × nie chowa paska wyboru')
      $('#dim [data-dim="2d"]').click()
      for (const axis of ['x', 'z', 'y']) {
        $(`#sec-axis [data-axis="${axis}"]`).click()
        if (document.querySelectorAll('#flat .fr').length < 3) problems.push(`2D ${axis}: pusty przekrój`)
        const fr = document.querySelector('#flat .fr[data-r]:not(.rib)')
        if (fr) {
          fr.dispatchEvent(new MouseEvent('click', { bubbles: true }))
          check(`2D ${axis} → ${fr.getAttribute('data-label')}`)
        }
      }
      $('#dim [data-dim="3d"]').click()
      for (const t of ['cells', 'read', 'json']) {
        tab(t)
        for (const o of overflowing()) problems.push(`zakładka ${t}: wystaje ${o}`)
      }
      return { problems, clicks }
    })
    expect(result.clicks, 'bot prawie nic nie kliknął').toBeGreaterThan(50)
    expect(result.problems).toEqual([])
  })
})

test('Atlas działa bez internetu: żadnych zapytań poza aplikację (poza czcionkami)', async ({ page, baseURL }) => {
  const outside = []
  page.on('request', (r) => {
    const url = r.url()
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith(baseURL)) return
    if (/fonts\.(googleapis|gstatic)\.com/.test(url)) return
    outside.push(url)
  })
  await page.route(/^https?:\/\/(?!localhost)/, (route) =>
    /fonts\.(googleapis|gstatic)\.com/.test(route.request().url()) ? route.fallback() : route.abort(),
  )
  await page.goto('atlas/index.html?theme=night')
  await page.waitForFunction(() => window.THREE && window.THREE.OrbitControls && window.ATLAS, null, { timeout: 60_000 })
  expect(outside).toEqual([])
})
