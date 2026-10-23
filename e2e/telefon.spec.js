import { ALL_TOPICS_TIMEOUT, allSections, expect, open, test, THEMES, topics } from './fixtures.js'

// Zasady, które na telefonie realnie bolą — sprawdzane na każdym ekranie
// aplikacji (każda sekcja i każda notatka), w obu motywach.
//  - nic nie jedzie w bok (brak poziomego przewijania),
//  - wszystko klikalne ma co najmniej 44×44 px (poza linkami w środku tekstu notatki),
//  - pola tekstowe mają co najmniej 16 px (inaczej Safari powiększa stronę),
//  - zero emotek w tym, co widać na ekranie.

const SCREENS = [
  '',
  ...allSections().map((s) => s.path),
  ...topics.map((t) => t.path),
  'szukaj?q=temat',
  'powtorki',
  'egzamin',
  'postep',
  'mapa',
  'dopiski',
  'nie-ma-takiej-strony',
]

const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️]/u

async function screenProblems(page) {
  return page.evaluate((emojiSource) => {
    const problems = []
    const doc = document.documentElement
    if (doc.scrollWidth > doc.clientWidth + 1) problems.push(`poziome przewijanie: ${doc.scrollWidth}px > ${doc.clientWidth}px`)

    const clickable = document.querySelectorAll('a[href], button, input, select, textarea, [role="button"]')
    for (const el of clickable) {
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height || el.closest('.prose')) continue
      // Pole dotyku może być powiększone niewidocznym ::after (np. przełącznik motywu).
      const after = getComputedStyle(el, '::after')
      const grow = after.content !== 'none' && after.position === 'absolute' ? -2 * (parseFloat(after.top) || 0) : 0
      if (Math.min(r.width, r.height) + grow < 43.5) {
        problems.push(`za mały cel dotyku ${Math.round(r.width)}×${Math.round(r.height)}: ${el.outerHTML.slice(0, 90)}`)
      }
    }

    for (const input of document.querySelectorAll('input, textarea, select')) {
      const size = parseFloat(getComputedStyle(input).fontSize)
      if (size < 16) problems.push(`pole ma ${size}px (Safari powiększy stronę): ${input.outerHTML.slice(0, 80)}`)
    }

    if (new RegExp(emojiSource, 'u').test(document.body.innerText)) problems.push('emotka na ekranie')
    return problems
  }, EMOJI.source)
}

for (const theme of THEMES) {
  test.describe(`motyw ${theme}`, () => {
    test.use({ theme })

    test('każdy ekran spełnia zasady telefonu', async ({ page }) => {
      test.setTimeout(ALL_TOPICS_TIMEOUT)
      test.slow()
      for (const screen of SCREENS) {
        await open(page, screen)
        expect(await screenProblems(page), `ekran #/${screen}`).toEqual([])
      }
    })

    test('pasek na dole notatki nie zasłania ostatniego akapitu', async ({ page }) => {
      test.setTimeout(ALL_TOPICS_TIMEOUT)
      for (const t of topics) {
        await open(page, t.path)
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
        const covered = await page.evaluate(() => {
          const blocks = document.querySelectorAll('.note-body > *, .note-lead')
          const last = blocks[blocks.length - 1].getBoundingClientRect()
          const bar = document.querySelector('.note-bar').getBoundingClientRect()
          return last.bottom > bar.top
        })
        expect(covered, `#/${t.path}`).toBe(false)
      }
    })
  })
}
