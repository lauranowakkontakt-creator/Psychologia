import { ALL_TOPICS_TIMEOUT, allSections, expect, open, test, topics, tree } from './fixtures.js'
import { normalize } from '../src/lib/search.js'
import { siblings } from '../src/lib/content.js'
import { allCards, cardGroup } from '../src/lib/flashcards.js'

// Działanie aplikacji krok po kroku, tak jak klika użytkowniczka.

test.describe('Start', () => {
  test('pokazuje logo, przywitanie i wszystkie działy z liczbą tematów', async ({ page }) => {
    await open(page)
    await expect(page.locator('.logo')).toHaveText('psycho.')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Twoje notatki')
    await expect(page.locator('.home-hello .muted')).toHaveText(/^(Dzień dobry|Dobry wieczór)/)

    const cards = page.locator('.home-card')
    await expect(cards).toHaveCount(tree.sections.length)
    for (const [i, section] of tree.sections.entries()) {
      await expect(cards.nth(i).locator('.home-card-title')).toHaveText(section.title)
      await expect(cards.nth(i).locator('.muted')).toHaveText(/^\d+ \S+$/)
    }
  })

  test('na pierwszym wejściu nie ma historii ani zakładek', async ({ page }) => {
    await open(page)
    await expect(page.getByText('Czytaj dalej')).toHaveCount(0)
    await expect(page.getByText('Ostatnio otwierane')).toHaveCount(0)
    await expect(page.getByText('Zakładki')).toHaveCount(0)
  })

  test('karta działu prowadzi do jego listy, a Wstecz wraca na start', async ({ page }) => {
    const first = tree.sections[0]
    await open(page)
    await page.locator('.home-card').first().click()
    await expect(page).toHaveURL(new RegExp(`#/${first.path}$`))
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(first.title)
    await page.getByRole('link', { name: 'Wstecz' }).click()
    await expect(page.locator('.logo')).toBeVisible()
  })
})

test.describe('Listy tematów', () => {
  test('każda sekcja pokazuje swoje tematy, a podsekcje jako kafelki', async ({ page }) => {
    test.setTimeout(ALL_TOPICS_TIMEOUT)
    for (const section of allSections()) {
      await open(page, section.path)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(section.title)
      for (const t of section.topics) {
        await expect(page.locator(`a.row[href="#/${t.path}"]`)).toBeVisible()
      }
      for (const sub of section.sections) {
        const tile = page.locator(`a.section-tile[href="#/${sub.path}"]`)
        await expect(tile.locator('.section-tile-title')).toHaveText(sub.title)
        await expect(tile.locator('.section-tile-count')).toHaveText(/^\d+ temat(y|ów)?$/)
        // tematy podsekcji widać dopiero po wejściu w kafelek
        for (const t of sub.topics) {
          await expect(page.locator(`a.row[href="#/${t.path}"]`)).toHaveCount(0)
        }
      }
    }
  })

  test('kafelek kursu otwiera listę jego tematów', async ({ page }) => {
    const parent = allSections().find((s) => s.sections.some((sub) => sub.topics.length))
    test.skip(!parent, 'brak sekcji z podsekcjami, które mają tematy')
    const sub = parent.sections.find((s) => s.topics.length)
    await open(page, parent.path)
    await page.locator(`a.section-tile[href="#/${sub.path}"]`).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(sub.title)
    await expect(page.locator(`a.row[href="#/${sub.topics[0].path}"]`)).toBeVisible()
    await page.getByRole('link', { name: 'Wstecz' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(parent.title)
  })

  test('tematy z polem „przedmiot” są w kartach z nazwą przedmiotu', async ({ page }) => {
    const withSubject = topics.find((t) => t.subject)
    test.skip(!withSubject, 'żadna notatka nie ma jeszcze pola „przedmiot”')
    await open(page, withSubject.sectionPath)
    const card = page.locator('.group', { has: page.locator(`a[href="#/${withSubject.path}"]`) })
    await expect(card.locator('.group-head')).toHaveText(withSubject.subject)
  })
})

test.describe('Notatka', () => {
  test('każdy temat się otwiera: tytuł, nadtytuł, treść, bez czasu czytania', async ({ page }) => {
    test.setTimeout(ALL_TOPICS_TIMEOUT)
    test.slow()
    for (const t of topics) {
      await open(page, t.path)
      await expect(page.locator('.note-title'), t.path).toHaveText(t.title)
      await expect(page.locator('.eyebrow'), t.path).toHaveText(/ · \d{2}$/)
      await expect(page.getByText(/min czytania/), t.path).toHaveCount(0)
      await expect(page.locator('.note-lead, .note-body').first(), t.path).toBeVisible()
    }
  })

  test('pasek na dole: następny, poprzedni, a na końcu powrót do listy', async ({ page }) => {
    const section = allSections().find((s) => s.topics.length >= 2)
    test.skip(!section, 'brak sekcji z co najmniej dwoma tematami')
    const [first, second] = section.topics
    const last = section.topics.at(-1)

    await open(page, first.path)
    await expect(page.getByRole('link', { name: /^Poprzedni temat/ })).toHaveCount(0)
    await page.getByRole('link', { name: `Następny temat: ${second.title}` }).click()
    await expect(page.locator('.note-title')).toHaveText(second.title)
    await page.getByRole('link', { name: `Poprzedni temat: ${first.title}` }).click()
    await expect(page.locator('.note-title')).toHaveText(first.title)

    await open(page, last.path)
    await page.getByRole('link', { name: 'Wróć do listy tematów' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(section.title)
  })

  test('Wstecz z notatki wraca do jej listy', async ({ page }) => {
    const t = topics[0]
    await open(page, t.path)
    await page.getByRole('link', { name: 'Wstecz' }).click()
    await expect(page).toHaveURL(new RegExp(`#/${t.sectionPath}$`))
  })

  test('„Aa” powiększa tekst i pamięta wybór po odświeżeniu', async ({ page }) => {
    await open(page, topics[0].path)
    const size = () => page.locator('.note-body, .note-lead .prose').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    const before = await size()
    await page.getByRole('button', { name: /^Rozmiar tekstu/ }).click()
    const after = await size()
    expect(after).toBeGreaterThan(before)
    await page.reload()
    expect(await size()).toBe(after)
    // trzecie kliknięcie wraca do standardowego
    await page.getByRole('button', { name: /^Rozmiar tekstu/ }).click()
    await page.getByRole('button', { name: /^Rozmiar tekstu/ }).click()
    expect(await size()).toBe(before)
  })

  test('zakładka: zapis, widać ją na starcie, usunięcie', async ({ page }) => {
    const t = topics[0]
    await open(page, t.path)
    await page.getByRole('button', { name: 'Zapisz zakładkę' }).click()
    await expect(page.getByRole('button', { name: 'Usuń zakładkę' })).toHaveAttribute('aria-pressed', 'true')

    await open(page)
    const list = page.locator('.home-block', { hasText: 'Zakładki' })
    await expect(list.getByRole('link', { name: new RegExp(t.title) })).toBeVisible()

    await list.getByRole('link', { name: new RegExp(t.title) }).click()
    await page.getByRole('button', { name: 'Usuń zakładkę' }).click()
    await open(page)
    await expect(page.getByText('Zakładki')).toHaveCount(0)
  })

  test('historia: „Czytaj dalej” to ostatni temat, wcześniejsze w „Ostatnio otwierane”', async ({ page }) => {
    test.skip(topics.length < 2, 'potrzebne co najmniej dwa tematy')
    const [a, b] = [topics[0], topics.at(-1)]
    await open(page, a.path)
    await open(page, b.path)
    await open(page)
    await expect(page.locator('.continue-title')).toHaveText(b.title)
    await expect(page.locator('.continue-sub')).toHaveText(new RegExp(` · ${String(siblings(tree, b).number).padStart(2, '0')}$`))
    const recent = page.locator('.home-block', { hasText: 'Ostatnio otwierane' })
    await expect(recent.locator('.mini-title')).toHaveText([a.title])
    await expect(recent.locator('.mini-aside')).toHaveText(['dziś'])
  })
})

test.describe('Wyszukiwarka', () => {
  // Słowo z treści pierwszej notatki, wpisywane bez polskich znaków.
  function wordFrom(topic) {
    const words = topic.body.match(/[\p{L}]{5,}/gu) || [topic.title]
    return words.find((w) => normalize(w) !== w.toLowerCase()) || words[0]
  }

  test('pole na starcie otwiera wyszukiwarkę z kursorem w polu', async ({ page }) => {
    await open(page)
    await page.getByRole('button', { name: 'Szukaj w notatkach' }).click()
    await expect(page).toHaveURL(/#\/szukaj/)
    await expect(page.getByRole('searchbox', { name: 'Szukaj w notatkach' })).toBeFocused()
  })

  test('znajduje bez polskich znaków i podświetla trafienie w notatce', async ({ page }) => {
    const t = topics[0]
    const word = wordFrom(t)
    const typed = normalize(word)
    await open(page, 'szukaj')
    await page.getByRole('searchbox').fill(typed)
    await expect(page.locator('.search-count')).toHaveText(/^Wyniki: \d+$/)
    await expect(page.locator('.row mark').first()).toBeVisible()

    await page.locator(`a.row[href^="#/${t.path}?q="]`).click()
    await expect(page.locator('.note-title')).toHaveText(t.title)
    await expect(page.locator('mark').first()).toHaveText(new RegExp(word, 'i'))
  })

  test('zapytanie zostaje: w adresie po odświeżeniu i po powrocie do lupy', async ({ page }) => {
    await open(page, 'szukaj')
    await page.getByRole('searchbox').fill('temat')
    await expect(page).toHaveURL(/#\/szukaj\?q=temat$/)
    await page.reload()
    await expect(page.getByRole('searchbox')).toHaveValue('temat')

    await page.locator('a.row').first().click()
    await page.getByRole('link', { name: 'Wstecz' }).click()
    await page.getByRole('link', { name: 'Szukaj w notatkach' }).click()
    await expect(page.getByRole('searchbox')).toHaveValue('temat')
  })

  test('brak wyników i czyszczenie pola', async ({ page }) => {
    await open(page, 'szukaj')
    await expect(page.locator('.search-count')).toContainText('Polskie znaki nie są potrzebne')
    await page.getByRole('searchbox').fill('qqqzzzxxx')
    await expect(page.locator('.search-count')).toHaveText(/^Nic nie znaleziono/)
    await page.getByRole('button', { name: 'Wyczyść' }).click()
    await expect(page.getByRole('searchbox')).toHaveValue('')
    await expect(page.getByRole('searchbox')).toBeFocused()
  })
})

test.describe('Motyw Dzień / Noc', () => {
  test('przełącznik zmienia motyw i pamięta go po odświeżeniu', async ({ page }) => {
    await open(page)
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'night')
    await page.getByRole('button', { name: 'Tryb dzienny' }).click()
    await expect(html).toHaveAttribute('data-theme', 'day')
    await expect(page.getByRole('button', { name: 'Tryb dzienny' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F3EEE5')
    // tło zmienia się płynnie (0,3 s) — czekamy na koniec przejścia
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(243, 238, 229)')

    await page.reload()
    await expect(html).toHaveAttribute('data-theme', 'day')
  })

  test.describe('bez zapisanego wyboru', () => {
    test.use({ theme: null, colorScheme: 'light' })
    test('idzie za motywem telefonu', async ({ page }) => {
      await open(page)
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
    })
  })

  test('motyw jest ustawiony, zanim narysuje się aplikacja (bez mignięcia)', async ({ page }) => {
    await open(page)
    await page.getByRole('button', { name: 'Tryb dzienny' }).click()
    // Zatrzymujemy skrypt aplikacji: motyw musi przyjść z samego <head>.
    await page.route(/\/assets\/.*\.js$/, (route) => route.abort())
    page.removeAllListeners('console')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'day')
  })
})

test.describe('Adresy', () => {
  test('nieistniejący adres pokazuje komunikat z drogą powrotu', async ({ page }) => {
    await open(page, 'nie/ma/takiej/notatki')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nie ma takiej strony')
    await page.getByRole('link', { name: 'Wróć na start' }).click()
    await expect(page.locator('.logo')).toBeVisible()
  })

  test('przycisk Wstecz przeglądarki cofa po ekranach', async ({ page }) => {
    const t = topics[0]
    await open(page)
    await page.locator(`.home-card[href="#/${t.sectionPath.split('/')[0]}"]`).click()
    await page.getByRole('link', { name: 'Wstecz' }).click()
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`#/${t.sectionPath.split('/')[0]}$`))
  })
})

// ---------- Nauka: fiszki, egzamin, postęp, mapa, dopiski ----------

const cards = allCards(tree)
const withCards = topics.find((t) => cards.some((c) => c.path === t.path))

test.describe('Nauka', () => {
  test('kafelki „Nauka” na starcie prowadzą do swoich ekranów', async ({ page }) => {
    for (const [name, hash, heading] of [
      ['Powtórki', 'powtorki', 'Powtórki'],
      ['Egzamin', 'egzamin', 'Egzamin'],
      ['Postęp', 'postep', 'Postęp'],
      ['Mapa', 'mapa', 'Mapa powiązań'],
      ['Dopiski', 'dopiski', 'Moje dopiski'],
    ]) {
      await open(page)
      await page.locator('.learn-tile', { hasText: name }).click()
      await expect(page).toHaveURL(new RegExp(`#/${hash}$`))
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
    }
  })

  test('powtórki: odpowiedź, ocena, zapis i następna fiszka', async ({ page }) => {
    await open(page, 'powtorki')
    await expect(page.locator('.flashcard-meta')).toContainText(/^1 \/ \d+/)
    await page.getByRole('button', { name: 'Pokaż odpowiedź' }).click()
    await expect(page.locator('.flashcard-a')).not.toBeEmpty()
    await page.getByRole('button', { name: /^Dobrze/ }).click()
    await expect(page.locator('.flashcard-meta')).toContainText(/^2 \/ \d+/)
    const saved = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('psycho-srs'))).length)
    expect(saved).toBe(1)
  })

  test('powtórki z jednej notatki i wybór zakresu', async ({ page }) => {
    test.skip(!withCards, 'brak notatek z „Szybką powtórką”')
    await open(page, withCards.path)
    await page.getByRole('link', { name: /Powtórz fiszki z tej notatki/ }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(withCards.title)
    const n = cards.filter((c) => c.path === withCards.path).length
    await expect(page.locator('.flashcard-meta')).toContainText(`1 / ${n}`)

    await open(page, 'powtorki')
    const group = cardGroup(cards[0])
    await page.getByRole('combobox').selectOption(group)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(group)
  })

  test('egzamin: 10 pytań, samoocena i wynik z notatkami do powtórki', async ({ page }) => {
    await open(page, 'egzamin')
    await page.getByRole('button', { name: /^Zacznij/ }).click()
    for (let i = 0; i < 10; i++) {
      await expect(page.locator('.eyebrow')).toHaveText(`Egzamin · ${i + 1} / 10`)
      await page.getByRole('button', { name: 'Pokaż odpowiedź' }).click()
      await page.getByRole('button', { name: i < 7 ? 'Wiedziałam' : 'Nie wiedziałam', exact: true }).click()
    }
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('70%')
    await expect(page.locator('.home-block', { hasText: 'Do powtórki' }).locator('li')).not.toHaveCount(0)
  })

  test('postęp: przeczytana notatka liczy się w swoim przedmiocie', async ({ page }) => {
    const t = topics[0]
    await open(page, t.path)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect.poll(() => page.evaluate((p) => JSON.parse(localStorage.getItem('psycho-read') || '{}')[p] || 0, t.path)).toBeGreaterThan(0.9)
    await open(page, 'postep')
    await expect(page.locator('.stat-tile').first()).toContainText(/1 z \d+/)
  })

  test('mapa powiązań: kompendia z linkami do powiązanych tematów', async ({ page }) => {
    await open(page, 'mapa')
    const chip = page.locator('.map-chip').first()
    await expect(chip).toBeVisible()
    const href = await chip.getAttribute('href')
    await chip.click()
    await expect(page).toHaveURL(new RegExp(`${href.replace(/[?]/g, '\\?')}$`))
    await expect(page.locator('.note-title')).toBeVisible()
  })
})

test.describe('Notatka: dodatki', () => {
  const long = topics.find((t) => (t.body.match(/^## /gm) || []).length >= 3)

  test('spis treści przenosi do nagłówka', async ({ page }) => {
    test.skip(!long, 'brak notatki z 3+ nagłówkami')
    await open(page, long.path)
    await page.locator('.toc summary').click()
    const items = page.locator('.toc li a')
    const last = items.last()
    const text = await last.textContent()
    await last.click()
    await expect(page.locator('.note-body h2', { hasText: text }).first()).toBeInViewport()
    await expect(page).toHaveURL(new RegExp(`#/${long.path}$`))
  })

  test('zaznaczenie fragmentu: zapis, po odświeżeniu nadal jest, widać je w dopiskach, usunięcie', async ({ page }) => {
    const t = topics[0]
    await open(page, t.path)
    await page.evaluate(() => {
      const p = document.querySelector('.note-body p, .note-lead p')
      const text = p.firstChild
      const r = document.createRange()
      r.setStart(text, 0)
      r.setEnd(text, Math.min(20, text.nodeValue.length))
      getSelection().removeAllRanges()
      getSelection().addRange(r)
    })
    await page.getByRole('button', { name: 'Zaznacz' }).click()
    await expect(page.locator('mark.hl-user')).not.toHaveCount(0)
    await page.reload()
    await expect(page.locator('mark.hl-user')).not.toHaveCount(0)

    await open(page, 'dopiski')
    await expect(page.locator('.annotation-title')).toHaveText([t.title])

    await open(page, t.path)
    await page.locator('mark.hl-user').first().click()
    await page.getByRole('button', { name: 'Usuń' }).click()
    await expect(page.locator('mark.hl-user')).toHaveCount(0)
  })

  test('w dopiskach kosz usuwa zaznaczenie i dopisek', async ({ page }) => {
    const t = topics[0]
    await open(page, t.path)
    await page.getByRole('textbox', { name: 'Mój dopisek' }).fill('Do usunięcia')
    await expect(page.locator('.my-note-hint')).toHaveText('Zapisano')
    await page.evaluate(() => {
      const text = document.querySelector('.note-body p, .note-lead p').firstChild
      const r = document.createRange()
      r.setStart(text, 0)
      r.setEnd(text, Math.min(20, text.nodeValue.length))
      getSelection().removeAllRanges()
      getSelection().addRange(r)
    })
    await page.getByRole('button', { name: 'Zaznacz' }).click()
    await expect(page.locator('mark.hl-user')).not.toHaveCount(0)

    await open(page, 'dopiski')
    await page.getByRole('button', { name: 'Usuń zaznaczenie' }).click()
    await expect(page.locator('.annotation-quotes')).toHaveCount(0)
    await page.getByRole('button', { name: 'Usuń dopisek' }).click()
    await expect(page.locator('.annotation')).toHaveCount(0)
    await expect(page.getByText('Na razie nic tu nie ma.')).toBeVisible()

    await open(page, t.path)
    await expect(page.locator('mark.hl-user')).toHaveCount(0)
    await expect(page.getByRole('textbox', { name: 'Mój dopisek' })).toHaveValue('')
  })

  test('dopisek zapisuje się sam i zostaje po odświeżeniu', async ({ page }) => {
    const t = topics[0]
    await open(page, t.path)
    const field = page.getByRole('textbox', { name: 'Mój dopisek' })
    await field.fill('Zapytać na wykładzie')
    await expect(page.locator('.my-note-hint')).toHaveText('Zapisano')
    await page.reload()
    await expect(field).toHaveValue('Zapytać na wykładzie')
    await open(page, 'dopiski')
    await expect(page.locator('.annotation-note')).toHaveText('Zapytać na wykładzie')
  })

  test('czytanie na głos: start, pauza, wznowienie, koniec', async ({ page }) => {
    await page.addInitScript(() => {
      // Udawany syntezator — w testach nic nie gra, a wypowiedzi są zapisywane.
      window.__spoken = []
      window.SpeechSynthesisUtterance = function (text) { this.text = text }
      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          speak: (u) => window.__spoken.push(u.text),
          cancel: () => {},
          getVoices: () => [],
        },
      })
    })
    const t = topics[0]
    await open(page, t.path)
    await page.getByRole('button', { name: 'Czytaj na głos' }).click()
    await expect(page.getByRole('group', { name: 'Czytanie na głos' })).toBeVisible()
    const first = await page.evaluate(() => window.__spoken[0])
    expect(first.length).toBeGreaterThan(10)
    await page.getByRole('button', { name: 'Pauza' }).click()
    await page.getByRole('button', { name: 'Czytaj dalej' }).click()
    await page.getByRole('button', { name: 'Zakończ czytanie' }).click()
    await expect(page.getByRole('group', { name: 'Czytanie na głos' })).toHaveCount(0)
  })

  test('druk: przycisk otwiera okno drukowania, a pasek i przyciski znikają na wydruku', async ({ page }) => {
    await page.addInitScript(() => {
      window.__printed = 0
      window.print = () => window.__printed++
    })
    await open(page, topics[0].path)
    await page.getByRole('button', { name: 'Drukuj lub zapisz jako PDF' }).click()
    expect(await page.evaluate(() => window.__printed)).toBe(1)
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('.note-bar')).toBeHidden()
    await expect(page.locator('.topbar')).toBeHidden()
    await expect(page.locator('.note-title')).toBeVisible()
  })

  test('„Wspominają tę notatkę” prowadzi do notatek, które do niej linkują', async ({ page }) => {
    const target = topics.find((t) => topics.some((o) => o.path !== t.path && o.body.includes(`](#/${t.path})`)))
    test.skip(!target, 'brak linków między notatkami')
    await open(page, target.path)
    const list = page.locator('.note-extra', { hasText: 'Wspominają tę notatkę' })
    await expect(list.locator('li')).not.toHaveCount(0)
    await list.locator('a').first().click()
    await expect(page.locator('.note-title')).toBeVisible()
  })

  test('wyszukiwarka podświetla frazę przeciętą pogrubieniem', async ({ page }) => {
    let found = null
    for (const t of topics) {
      const m = /(?:^|\s)\*\*([\p{L}]{4,})\*\* ([\p{L}]{4,})/mu.exec(t.body.replace(/<[^>]+>/g, ' '))
      if (m) {
        found = { t, a: m[1], b: m[2] }
        break
      }
    }
    test.skip(!found, 'brak frazy z pogrubieniem')
    await open(page, `${found.t.path}?q=${encodeURIComponent(`${found.a} ${found.b}`)}`)
    const marks = await page.locator('.prose mark').allTextContents()
    expect(marks.join(' ')).toContain(found.a)
    expect(marks.join(' ')).toContain(found.b)
  })
})

test('„Ostatnio dodane” na starcie pokazuje notatki z datą', async ({ page }) => {
  await open(page)
  const block = page.locator('.home-block', { hasText: 'Ostatnio dodane' })
  await expect(block.locator('li')).not.toHaveCount(0)
  await expect(block.locator('.mini-aside').first()).toHaveText(/^\d{1,2} \S+$/)
})

test.describe('Nauka osobno dla działów', () => {
  test('przełącznik Studia / Kursy zmienia fiszki i pojęcie, a wybór zostaje', async ({ page }) => {
    test.skip(tree.sections.length < 2, 'tylko jeden dział')
    const [first, second] = tree.sections
    const count = (scope) => cards.filter((c) => c.path.split('/')[0] === scope).length
    await open(page)
    const tile = page.locator('.learn-tile', { hasText: 'Powtórki' }).locator('.learn-sub')
    await expect(page.getByRole('button', { name: first.title, exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(tile).toContainText(String(count(first.path)))
    await page.getByRole('button', { name: second.title, exact: true }).click()
    await expect(tile).toContainText(String(count(second.path)))
    await page.reload()
    await expect(page.getByRole('button', { name: second.title, exact: true })).toHaveAttribute('aria-pressed', 'true')
    await open(page, 'egzamin')
    await expect(page.getByRole('button', { name: second.title, exact: true })).toHaveAttribute('aria-pressed', 'true')
  })

  test('„Pojęcie na teraz”: definicja z notatki, „Inne” pokazuje kolejne, zmiana co ile godzin', async ({ page }) => {
    await open(page)
    const card = page.locator('.term-now')
    const term = card.locator('.term-now-term')
    const before = await term.textContent()
    expect(cards.some((c) => c.kind === 'definicja' && c.question === before)).toBe(true)
    await card.getByRole('button', { name: 'Inne' }).click()
    await expect(term).not.toHaveText(before)
    await card.getByRole('button', { name: /^Zmiana pojęcia co 3 godz/ }).click()
    await expect(card.getByRole('button', { name: /^Zmiana pojęcia co 6 godz/ })).toBeVisible()
    await card.locator('a.text-link').click()
    await expect(page.locator('.note-title')).toBeVisible()
  })

  test('powtórki: same definicje', async ({ page }) => {
    await open(page, 'powtorki')
    await page.getByRole('button', { name: 'Definicje', exact: true }).click()
    await expect(page.locator('.flashcard-meta')).toContainText('· definicja')
    await page.getByRole('button', { name: 'Pokaż odpowiedź' }).click()
    await expect(page.locator('.flashcard-a')).not.toBeEmpty()
  })
})

// ---------- Komputer: szeroki ekran ----------

test.describe('Komputer', () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false })

  test('start w dwóch kolumnach: notatki po lewej, „Nauka” po prawej', async ({ page }) => {
    await open(page)
    const main = await page.locator('.home-main').boundingBox()
    const side = await page.locator('.home-side').boundingBox()
    expect(side.x).toBeGreaterThan(main.x + main.width)
    expect(Math.abs(side.y - main.y)).toBeLessThan(40)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440)
  })

  test('notatka: spis treści rozwinięty z boku i zostaje przy przewijaniu', async ({ page }) => {
    const long = topics.find((t) => (t.body.match(/^## /gm) || []).length >= 3)
    test.skip(!long, 'brak notatki z co najmniej 3 nagłówkami')
    await open(page, long.path)
    const toc = page.locator('.note-side .toc')
    await expect(toc).toHaveAttribute('open', '')
    await expect(toc.locator('li a').first()).toBeVisible()
    const tocBox = await toc.boundingBox()
    const body = await page.locator('.note-main').boundingBox()
    expect(tocBox.x + tocBox.width).toBeLessThan(body.x)
    await expect(toc).toHaveCSS('position', 'sticky')
  })
})
