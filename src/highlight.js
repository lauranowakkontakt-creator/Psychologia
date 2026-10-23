import { findRanges } from './lib/search.js'
import { findQuote, splitRanges } from './lib/textRanges.js'

// Owijanie fragmentów gotowego HTML-a notatki w <mark>: trafienia z wyszukiwarki
// i własne zaznaczenia. Działa na węzłach tekstowych, więc nie psuje znaczników
// (linków, kursywy, list), a fraza przecięta pogrubieniem też się podświetli.

function textNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    // Napisy w rysunkach SVG zostają bez zmian (<mark> w SVG nie istnieje).
    acceptNode: (n) => (n.parentElement?.closest('svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  })
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  return nodes
}

// ranges w sklejonym tekście węzłów -> <mark> (makeMark tworzy element dla trafienia nr r).
// Zwraca pierwszy <mark> każdego trafienia.
function wrapRanges(nodes, ranges, makeMark) {
  const pieces = splitRanges(nodes.map((n) => n.nodeValue.length), ranges)
  const firsts = []
  // Od końca, żeby podział węzła nie przesuwał pozycji kolejnych kawałków.
  for (let i = pieces.length - 1; i >= 0; i--) {
    const { node, from, to, range } = pieces[i]
    let target = nodes[node]
    if (to < target.nodeValue.length) target.splitText(to)
    if (from > 0) target = target.splitText(from)
    const mark = makeMark(range)
    target.parentNode.replaceChild(mark, target)
    mark.appendChild(target)
    firsts[range] = mark
  }
  return firsts
}

export function highlightMatches(root, query) {
  const nodes = textNodes(root)
  const text = nodes.map((n) => n.nodeValue).join('')
  const ranges = findRanges(text, query)
  if (!ranges.length) return null
  return wrapRanges(nodes, ranges, () => document.createElement('mark')).find(Boolean) || null
}

// Własne zaznaczenia: items [{ id, quote }]. Cytat zaznaczony w notatce
// podświetla się w pierwszym miejscu, gdzie występuje.
export function applyUserHighlights(root, items) {
  for (const item of items) {
    const nodes = textNodes(root)
    const text = nodes.map((n) => n.nodeValue).join('')
    const [first] = findQuote(text, item.quote)
    if (!first) continue
    wrapRanges(nodes, [first], () => {
      const mark = document.createElement('mark')
      mark.className = 'hl-user'
      mark.dataset.hl = item.id
      return mark
    })
  }
}

// Tekst do czytania na głos: akapity, listy, tabele i ramki — bez rysunków SVG.
export function readableText(root) {
  const blocks = root.querySelectorAll('p, li, h2, h3, h4, td, th, blockquote, .fig-title, .step-name')
  const out = []
  for (const el of blocks) {
    if (el.closest('svg')) continue
    // Element zawierający inny blok czytamy przez ten blok (np. <li> z <p>).
    if (el.querySelector('p, li, td')) continue
    const t = el.textContent.replace(/\s+/g, ' ').trim()
    if (t) out.push(/[.!?:;]$/.test(t) ? t : `${t}.`)
  }
  return out.join(' ')
}
