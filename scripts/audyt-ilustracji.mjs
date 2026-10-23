// Audyt wszystkich ilustracji SVG w notatkach – szybciej niż pełne testy
// i z pełną listą problemów (test e2e zatrzymuje się na pierwszej notatce).
//
// Użycie:
//   npx vite build --logLevel error && npx vite preview --port 4801 --strictPort &
//   node scripts/audyt-ilustracji.mjs [fragment-ścieżki] [--zrzuty katalog] [--wszystkie]
//   (AUDYT_URL=http://localhost:5173/ – audyt na serwerze deweloperskim, bez budowania)
//
// Wypisuje problemy pogrupowane według notatek. Z opcją --zrzuty zapisuje też
// zrzut każdego rysunku z problemem (do obejrzenia przed poprawką), a z
// --wszystkie – zrzut każdego rysunku z wybranych notatek.
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, devices } from '@playwright/test'
import { allTopics, buildTree } from '../src/lib/content.js'
import { loadContentFiles } from '../test/helpers.js'
import { illustrationProblems } from '../e2e/ilustracje-geometria.js'

const args = process.argv.slice(2)
const shotsIdx = args.indexOf('--zrzuty')
const shotsDir = shotsIdx >= 0 ? args[shotsIdx + 1] : null
const filter = args.find((a, i) => !a.startsWith('--') && (shotsIdx < 0 || i !== shotsIdx + 1)) || ''
const base = process.env.AUDYT_URL || 'http://localhost:4801/'
const all = args.includes('--wszystkie')

const topics = allTopics(buildTree(loadContentFiles())).filter(
  (t) => t.body.includes('class="fig ill"') && t.path.includes(filter),
)
const browser = await chromium.launch()
const page = await browser.newPage({ ...devices['Pixel 7'] })
await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }))
if (shotsDir) mkdirSync(shotsDir, { recursive: true })

let total = 0
for (const topic of topics) {
  await page.goto(`${base}#/${topic.path}`)
  await page.locator('main.page').waitFor()
  await page.waitForTimeout(150)
  const problems = await page.evaluate(illustrationProblems)
  if (!problems.length && !all) continue
  total += problems.length
  if (problems.length) console.log(`\n## ${topic.path}`)
  for (const p of problems) console.log(`  - ${p}`)
  if (shotsDir) {
    const figs = page.locator('.ill')
    const n = await figs.count()
    const bad = new Set(problems.map((p) => Number(p.match(/rysunek (\d+)/)?.[1])))
    for (let k = 0; k < n; k++) {
      if (!all && !bad.has(k + 1)) continue
      await figs.nth(k).screenshot({ path: join(shotsDir, `${topic.path.replaceAll('/', '__')}__${k + 1}.png`) })
    }
  }
}
console.log(`\nNotatek z ilustracjami: ${topics.length}, problemów: ${total}`)
await browser.close()
