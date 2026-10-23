// Widżet „Pojęcie na teraz” na ekran główny iPhone'a (aplikacja Scriptable, darmowa).
//
//   npm run widget             zapisuje skrypt do widget/Psycho_pojecie.js
//   npm run widget -- --icloud zapisuje go też do folderu Scriptable w iCloud Drive,
//                              skąd iPhone pobierze go sam
//
// Definicje są wpisane w sam skrypt — widżet działa bez internetu i bez logowania,
// a pojęcia nie wychodzą poza Twój iCloud. Po dodaniu nowych notatek uruchom ponownie.
//
// Na iPhonie: zainstaluj Scriptable, przytrzymaj ekran główny -> „+” -> Scriptable ->
// widżet (mały, średni albo duży) -> przytrzymaj go -> „Edytuj widżet” -> Script: „Psycho pojęcie”.
// W polu Parameter można wpisać np. „kursy 6” (dział i co ile godzin), „studia 24”,
// „wszystko 3”, a słowo „pytania” dokłada też pytania z „Szybkiej powtórki”.
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildTree } from '../src/lib/content.js'
import { allCards, scopeOf } from '../src/lib/flashcards.js'
import { nextChange, slotIndex, slotNumber } from '../src/lib/daily.js'
import { loadContentFiles } from '../test/helpers.js'

export function widgetScript(items, appUrl = '') {
  return `// Psycho — pojęcie na teraz. Wygenerowane przez \`npm run widget\` (${new Date().toISOString().slice(0, 10)}).
// Nie edytuj ręcznie — po nowych notatkach wygeneruj ponownie.
// Parameter widżetu: dział (studia / kursy / wszystko), co ile godzin (np. 3, 6, 24), „pytania”.
// icon-color: deep-purple; icon-glyph: brain;

const APP_URL = ${JSON.stringify(appUrl)}
const ITEMS = ${JSON.stringify(items)}

${slotNumber.toString()}
${nextChange.toString()}
${slotIndex.toString()}

const HOUR = 60 * 60 * 1000
const param = (args.widgetParameter || '').toLowerCase()
const scope = /kurs/.test(param) ? 'kursy' : /wszyst/.test(param) ? '' : 'studia'
const hours = Number((param.match(/\\d+/) || [3])[0]) || 3
const withQuestions = /pytan/.test(param)
const pool = ITEMS.filter((i) => (!scope || i[0] === scope) && (withQuestions || i[1] === 'd'))
const now = Date.now()
const item = pool[slotIndex(slotNumber(now, hours), pool.length)] || ['', 'd', 'Brak pojęć', 'Wygeneruj widżet ponownie: npm run widget', '', '']

const bg = Color.dynamic(new Color('#F3EEE5'), new Color('#0D0D11'))
const text = Color.dynamic(new Color('#1C1C1F'), new Color('#EEEDF0'))
const muted = Color.dynamic(new Color('#5F5E66'), new Color('#A3A1AA'))
const accent = Color.dynamic(new Color('#5B45B8'), new Color('#B9A6FF'))

const w = new ListWidget()
w.backgroundColor = bg
w.setPadding(14, 16, 14, 16)
const size = config.widgetFamily || 'medium'

const head = w.addText((item[1] === 'd' ? 'POJĘCIE' : 'PYTANIE') + (size === 'small' ? '' : '  ·  ' + item[4].toUpperCase()))
head.font = Font.semiboldSystemFont(10)
head.textColor = accent
head.lineLimit = 1
w.addSpacer(6)

const term = w.addText(item[2])
term.font = new Font('Georgia', size === 'small' ? 17 : 21)
term.textColor = text
term.lineLimit = size === 'small' ? 3 : 2
term.minimumScaleFactor = 0.7
w.addSpacer(6)

const def = w.addText(item[3])
def.font = Font.systemFont(size === 'large' ? 15 : 12)
def.textColor = muted
def.lineLimit = size === 'small' ? 4 : size === 'large' ? 14 : 4
def.minimumScaleFactor = 0.85
w.addSpacer()

if (APP_URL && item[5]) w.url = APP_URL + '#/' + item[5].split('/').map(encodeURIComponent).join('/')
w.refreshAfterDate = new Date(nextChange(now, hours))

if (config.runsInWidget) Script.setWidget(w)
else await w.presentMedium()
Script.complete()
`
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ICLOUD = join(homedir(), 'Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents')
const NAME = 'Psycho pojęcie.js'

// Adres aplikacji (po publikacji): dotknięcie widżetu otwiera notatkę. Pusty = otwiera Scriptable.
const APP_URL = process.env.PSYCHO_URL || ''

const plain = (md) => md.replace(/\*{1,2}|__|`/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]+>/g, '').trim()

// Uruchomione wprost (`npm run widget`), a nie zaimportowane przez test.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()

function main() {
  const cards = allCards(buildTree(loadContentFiles()))
  // [dział, rodzaj (d/p), pojęcie, znaczenie, notatka, ścieżka]
  const items = cards.map((c) => [scopeOf(c), c.kind === 'definicja' ? 'd' : 'p', plain(c.question), plain(c.answer), c.topicTitle, c.path])

  const script = widgetScript(items, APP_URL)

  const outDir = join(ROOT, 'widget')
  mkdirSync(outDir, { recursive: true })
  const out = join(outDir, 'Psycho_pojecie.js')
  writeFileSync(out, script)
  const counts = { studia: 0, kursy: 0 }
  for (const i of items) if (i[1] === 'd') counts[i[0]] = (counts[i[0]] || 0) + 1
  console.log(`Widżet: ${items.length} fiszek (definicje: studia ${counts.studia}, kursy ${counts.kursy}), ${Math.round(script.length / 1024)} KB -> ${out}`)

  if (process.argv.includes('--icloud')) {
    if (!existsSync(ICLOUD)) {
      console.error('Nie ma folderu Scriptable w iCloud Drive — zainstaluj Scriptable i włącz iCloud.')
      process.exit(1)
    }
    copyFileSync(out, join(ICLOUD, NAME))
    console.log(`Skopiowano do iCloud: ${join(ICLOUD, NAME)}`)
  }
}
