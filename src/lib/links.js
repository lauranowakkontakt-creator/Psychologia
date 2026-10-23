// Powiązania między notatkami: linki `#/...` wpisane w treść.
//
// Z nich powstaje mapa: dokąd notatka odsyła i które notatki odsyłają do niej
// („Wspominają tę notatkę”). Linki do sekcji i nieistniejących notatek są pomijane.

import { allTopics } from './content.js'

const LINK = /\]\(#\/([^)\s?#]+)[^)]*\)/g

export function linkTargets(body) {
  const out = []
  for (const m of (body || '').matchAll(LINK)) {
    let path = m[1].replace(/\/+$/, '')
    try {
      path = decodeURIComponent(path)
    } catch {}
    if (!out.includes(path)) out.push(path)
  }
  return out
}

// { out: Map(ścieżka -> [ścieżki]), in: Map(ścieżka -> [ścieżki]) }
// `rename` przepisuje stare adresy (legacyPath), żeby stare linki też się liczyły.
export function buildLinkGraph(root, rename = () => null) {
  const topics = allTopics(root)
  const exists = new Set(topics.map((t) => t.path))
  const out = new Map()
  const incoming = new Map()
  for (const t of topics) {
    const targets = []
    for (const raw of linkTargets(t.body)) {
      const path = exists.has(raw) ? raw : rename(raw)
      if (!path || !exists.has(path) || path === t.path || targets.includes(path)) continue
      targets.push(path)
      if (!incoming.has(path)) incoming.set(path, [])
      incoming.get(path).push(t.path)
    }
    out.set(t.path, targets)
  }
  return { out, in: incoming }
}

export function backlinks(graph, path) {
  return graph.in.get(path) || []
}

// Mapa kompendiów: każde kompendium z listą kompendiów, z którymi jest połączone
// (w dowolną stronę), pogrupowane po kategorii. Najbardziej połączone na górze grupy.
export function compendiumMap(root, graph, isCompendium) {
  const topics = allTopics(root).filter(isCompendium)
  const paths = new Set(topics.map((t) => t.path))
  const groups = new Map()
  for (const t of topics) {
    const linked = new Set([...(graph.out.get(t.path) || []), ...(graph.in.get(t.path) || [])].filter((p) => paths.has(p)))
    const name = t.trail.at(-1) || ''
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push({ path: t.path, title: t.title, linked: [...linked] })
  }
  return [...groups].map(([name, items]) => ({
    name,
    items: items.sort((a, b) => b.linked.length - a.linked.length || a.title.localeCompare(b.title, 'pl')),
  }))
}
