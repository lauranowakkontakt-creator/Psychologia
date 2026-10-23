// Wyszukiwarka pełnotekstowa po wszystkich notatkach.
//
// Szuka bez względu na wielkość liter i polskie znaki („zaloba” znajdzie
// „żałoba”). Kilka słów = wszystkie muszą wystąpić w temacie, w dowolnym
// miejscu. Trafienia w tytule są wyżej niż trafienia w treści.

import { allTopics } from './content.js'

// Normalizacja znak po znaku, tak żeby długość tekstu się nie zmieniała —
// wtedy pozycja trafienia w tekście znormalizowanym = pozycja w oryginale,
// co pozwala podświetlić dokładnie ten fragment, który użytkownik widzi.
export function normalize(text) {
  let out = ''
  for (const ch of text) {
    let n = ch.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    if (n === 'ł') n = 'l'
    // Znaki spoza alfabetu łacińskiego mogą się rozjechać na kilka — wtedy zostawiamy.
    out += n.length === ch.length ? n : ch
  }
  return out
}

export function queryWords(query) {
  return normalize(query || '').split(/\s+/).filter(Boolean)
}

// Markdown -> sam tekst (do indeksu i do fragmentów w wynikach).
export function markdownToPlain(md) {
  return md
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```\w*/g, ''))
    // Rysunki w notatkach są pisane w HTML — zostaje sam ich tekst.
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, '')
    .replace(/^\s*\|?[-:|\s]+\|[-:|\s]*$/gm, '')
    .replace(/\|/g, ' ')
    .replace(/(\*\*|__|\*|_|~~|`)/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

// Wszystkie wystąpienia słów zapytania w tekście, jako [początek, koniec),
// posortowane i bez nakładania się. Używane do fragmentów i do <mark> w notatce.
export function findRanges(text, query) {
  const words = Array.isArray(query) ? query : queryWords(query)
  if (!words.length) return []
  const hay = normalize(text)
  const ranges = []
  for (const w of words) {
    let i = hay.indexOf(w)
    while (i !== -1) {
      ranges.push([i, i + w.length])
      i = hay.indexOf(w, i + w.length)
    }
  }
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1])
  const merged = []
  for (const r of ranges) {
    const last = merged[merged.length - 1]
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else merged.push([...r])
  }
  return merged
}

export function buildIndex(root) {
  return allTopics(root).map((t) => {
    const text = markdownToPlain(t.body)
    return {
      path: t.path,
      title: t.title,
      trail: t.trail,
      text,
      nTitle: normalize(t.title),
      nText: normalize(text),
      nTrail: normalize(t.trail.join(' ')),
    }
  })
}

// Fragment tekstu wokół pierwszego trafienia, pocięty na kawałki
// [{ text, hit }] — widok sam decyduje, jak podświetlić `hit`.
export function snippet(text, words, radius = 70) {
  const ranges = findRanges(text, words)
  if (!ranges.length) {
    const short = text.length > radius * 2 ? text.slice(0, radius * 2).trimEnd() + '…' : text
    return [{ text: short, hit: false }]
  }
  let start = Math.max(0, ranges[0][0] - radius)
  let end = Math.min(text.length, ranges[0][1] + radius * 1.5)
  // Nie tniemy w środku słowa.
  if (start > 0) {
    const space = text.indexOf(' ', start)
    if (space !== -1 && space < ranges[0][0]) start = space + 1
  }
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end)
    if (space > ranges[0][1]) end = space
  }

  const parts = []
  let pos = start
  for (const [a, b] of ranges) {
    if (b <= start || a >= end) continue
    const from = Math.max(a, start)
    const to = Math.min(b, end)
    if (from > pos) parts.push({ text: text.slice(pos, from), hit: false })
    parts.push({ text: text.slice(from, to), hit: true })
    pos = to
  }
  if (pos < end) parts.push({ text: text.slice(pos, end), hit: false })
  if (start > 0) parts.unshift({ text: '…', hit: false })
  if (end < text.length) parts.push({ text: '…', hit: false })
  return parts.map((p) => ({ ...p, text: p.text.replace(/\n/g, ' ') }))
}

export function search(index, query, limit = 50) {
  const words = queryWords(query)
  if (!words.length) return []
  const results = []
  for (const item of index) {
    let score = 0
    let all = true
    for (const w of words) {
      const inTitle = item.nTitle.includes(w)
      const inTrail = item.nTrail.includes(w)
      const count = countOf(item.nText, w)
      if (!inTitle && !inTrail && !count) {
        all = false
        break
      }
      score += (inTitle ? 10 : 0) + (inTrail ? 3 : 0) + Math.min(count, 5)
    }
    if (!all) continue
    if (item.nTitle.startsWith(words[0])) score += 5
    results.push({ path: item.path, title: item.title, trail: item.trail, score, snippet: snippet(item.text, words) })
  }
  results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'pl', { numeric: true }))
  return results.slice(0, limit)
}

function countOf(hay, word) {
  let n = 0
  let i = hay.indexOf(word)
  while (i !== -1) {
    n++
    i = hay.indexOf(word, i + word.length)
  }
  return n
}
