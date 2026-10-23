// Drzewo treści z plików Markdown w `content/`.
//
// Układ folderów to układ aplikacji:
//   content/studia/_sekcja.md                         -> sekcja „Studia”
//   content/studia/temat-1.md                         -> temat w „Studiach”
//   content/kursy/interwencja-kryzysowa/_sekcja.md    -> podsekcja w „Kursach”
//
// Każdy plik może zaczynać się nagłówkiem (frontmatter):
//   ---
//   tytul: Temat 1
//   kolejnosc: 1
//   opis: krótki opis pod tytułem
//   ikona: graduation-cap        (tylko sekcje, nazwy w src/components/Icon.jsx)
//   licznik: kurs, kursy, kursów (tylko sekcje bez własnych tematów: „2 kursy” na starcie)
//   przedmiot: Psychologia poznawcza   (tylko tematy: grupuje listę w karty)
//   rodzaj: Wykład                     (tylko tematy)
//   data: 2025-10-14                   (tylko tematy)
//   dodano: 2026-10-14                 (tylko tematy; inaczej data z gita)
//   ---
// Bez nagłówka tytuł bierze się z nazwy pliku, a kolejność jest alfabetyczna.
//
// Ten moduł nie zależy od Vite ani od przeglądarki — dostaje zwykły obiekt
// { 'ścieżka/pliku.md': 'treść' }, dzięki czemu testy ładują go wprost w Node.

const SECTION_FILE = '_sekcja.md'

export function parseFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return { meta: {}, body: text }

  const meta = {}
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':')
    if (i < 1) continue
    const key = line.slice(0, i).trim()
    let value = line.slice(i + 1).trim()
    if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1)
    meta[key] = value
  }
  return { meta, body: text.slice(match[0].length) }
}

// „temat-1” -> „Temat 1”, „interwencja-kryzysowa” -> „Interwencja kryzysowa”.
export function titleFromSlug(slug) {
  const words = slug.replace(/[-_]+/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function toOrder(value) {
  const n = Number(value)
  return value !== undefined && value !== '' && Number.isFinite(n) ? n : Infinity
}

function byOrder(a, b) {
  return a.order - b.order || a.title.localeCompare(b.title, 'pl', { numeric: true })
}

function makeSection(path) {
  const slug = path.split('/').pop() || ''
  return {
    type: 'sekcja',
    path,
    slug,
    title: slug ? titleFromSlug(slug) : 'Start',
    description: '',
    icon: '',
    counter: null,
    order: Infinity,
    sections: [],
    topics: [],
  }
}

// files: { 'content/studia/temat-1.md': '...', ... } — prefiks przed `content/`
// jest obojętny (Vite podaje ścieżki od korzenia projektu, np. '/content/...').
// added: { 'content/studia/temat-1.md': '2026-10-14T…' } — kiedy notatka trafiła
// do zbioru (z historii gita, patrz src/lib/added.js); pole `dodano:` ma pierwszeństwo.
export function buildTree(files, added = {}) {
  const root = makeSection('')
  const sections = new Map([['', root]])

  const ensureSection = (path) => {
    if (sections.has(path)) return sections.get(path)
    const section = makeSection(path)
    sections.set(path, section)
    const parentPath = path.split('/').slice(0, -1).join('/')
    ensureSection(parentPath).sections.push(section)
    return section
  }

  for (const [filePath, raw] of Object.entries(files)) {
    const rel = filePath.replace(/^.*?content\//, '')
    if (!rel.endsWith('.md')) continue
    const parts = rel.split('/')
    const fileName = parts.pop()
    const dir = parts.join('/')
    const section = ensureSection(dir)
    const { meta, body } = parseFrontmatter(raw)

    if (fileName === SECTION_FILE) {
      if (meta.tytul) section.title = meta.tytul
      if (meta.opis) section.description = meta.opis
      if (meta.ikona) section.icon = meta.ikona
      if (meta.licznik) section.counter = parseCounter(meta.licznik)
      section.order = toOrder(meta.kolejnosc)
      section.intro = body.trim()
      continue
    }

    const slug = fileName.replace(/\.md$/, '')
    section.topics.push({
      type: 'temat',
      path: dir ? `${dir}/${slug}` : slug,
      slug,
      title: meta.tytul || titleFromSlug(slug),
      description: meta.opis || '',
      subject: meta.przedmiot || '',
      kind: meta.rodzaj || '',
      date: meta.data || '',
      added: meta.dodano || added[`content/${rel}`] || '',
      order: toOrder(meta.kolejnosc),
      body: body.trim(),
      sectionPath: dir,
    })
  }

  for (const section of sections.values()) {
    section.sections.sort(byOrder)
    section.topics.sort(byOrder)
  }
  return root
}

// „kurs, kursy, kursów” -> trzy formy liczebnika (1 / 2–4 / 5+).
function parseCounter(value) {
  const forms = value.split(',').map((f) => f.trim()).filter(Boolean)
  return forms.length === 3 ? forms : null
}

// Ile jest tematów w sekcji razem z podsekcjami.
export function countTopics(section) {
  return section.topics.length + section.sections.reduce((n, s) => n + countTopics(s), 0)
}

// Tematy sekcji pogrupowane po przedmiocie, w kolejności pierwszego wystąpienia.
// Tematy bez przedmiotu trafiają do grupy z pustą nazwą (karta bez nagłówka).
export function groupBySubject(topics) {
  const groups = []
  const byName = new Map()
  for (const t of topics) {
    let g = byName.get(t.subject)
    if (!g) {
      g = { name: t.subject, topics: [] }
      byName.set(t.subject, g)
      groups.push(g)
    }
    g.topics.push(t)
  }
  return groups
}

export function findNode(root, path) {
  const clean = (path || '').replace(/^\/+|\/+$/g, '')
  if (!clean) return root
  let node = root
  const parts = clean.split('/')
  for (let i = 0; i < parts.length; i++) {
    const current = parts.slice(0, i + 1).join('/')
    const next = node.sections.find((s) => s.path === current)
    if (next) {
      node = next
      continue
    }
    // Temat może być tylko ostatnim kawałkiem ścieżki.
    if (i === parts.length - 1) return node.topics.find((t) => t.path === current) || null
    return null
  }
  return node
}

// Ścieżka okruszków od startu (bez niego) do węzła włącznie.
export function breadcrumbs(root, path) {
  const clean = (path || '').replace(/^\/+|\/+$/g, '')
  if (!clean) return []
  const parts = clean.split('/')
  const trail = []
  for (let i = 1; i <= parts.length; i++) {
    const node = findNode(root, parts.slice(0, i).join('/'))
    if (!node) break
    trail.push({ path: node.path, title: node.title })
  }
  return trail
}

// Wszystkie tematy w kolejności czytania (najpierw tematy sekcji, potem podsekcje).
export function allTopics(section, trail = []) {
  const here = section.path ? [...trail, section.title] : trail
  const out = section.topics.map((t) => ({ ...t, trail: here }))
  for (const child of section.sections) out.push(...allTopics(child, here))
  return out
}

// Poprzedni i następny temat w tej samej sekcji oraz numer tematu (od 1).
export function siblings(root, topic) {
  const section = findNode(root, topic.sectionPath)
  const list = section ? section.topics : []
  const i = list.findIndex((t) => t.path === topic.path)
  return {
    prev: i > 0 ? list[i - 1] : null,
    next: i >= 0 && i < list.length - 1 ? list[i + 1] : null,
    number: i + 1,
    section,
  }
}
