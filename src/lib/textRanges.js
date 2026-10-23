// Szukanie tekstu w notatce ponad granicami znaczników.
//
// Fraza z wyszukiwarki albo zaznaczony cytat bywają przecięte formatowaniem
// („**lęk** uogólniony” to trzy węzły tekstowe). Sklejamy więc tekst wszystkich
// węzłów w jeden ciąg, szukamy w nim, a trafienia rozkładamy z powrotem na węzły.
// Ten moduł nie dotyka DOM-u — dostaje same długości węzłów, więc da się go
// sprawdzić w Node. Owijanie w <mark> robi src/highlight.js.

import { normalize } from './search.js'

// lengths: długości kolejnych węzłów; ranges: [[początek, koniec)] w sklejonym tekście.
// Wynik: [{ node, from, to, range }] — kawałki do owinięcia, po kolei.
export function splitRanges(lengths, ranges) {
  const pieces = []
  let start = 0
  let r = 0
  for (let node = 0; node < lengths.length && r < ranges.length; node++) {
    const end = start + lengths[node]
    while (r < ranges.length && ranges[r][0] < end) {
      const [a, b] = ranges[r]
      const from = Math.max(a, start)
      const to = Math.min(b, end)
      if (to > from) pieces.push({ node, from: from - start, to: to - start, range: r })
      if (b <= end) r++
      else break
    }
    start = end
  }
  return pieces
}

// Wystąpienia cytatu w tekście, bez względu na wielkość liter, polskie znaki
// i różnice w odstępach (zaznaczenie z telefonu łapie czasem podwójną spację).
export function findQuote(text, quote) {
  const words = normalize(quote).split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const re = new RegExp(escaped.join('\\s*'), 'g')
  const hay = normalize(text)
  const out = []
  for (const m of hay.matchAll(re)) {
    if (m[0].length) out.push([m.index, m.index + m[0].length])
  }
  return out
}
