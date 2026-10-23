// Fiszki z notatek — dwa rodzaje (`kind`):
//
// 'pytanie' — z sekcji „## Szybka powtórka”, każdy punkt listy to jedna fiszka:
//   - **Pytanie?** Odpowiedź.
//   1. **Pytanie?** Odpowiedź.
// Pogrubiony początek to pytanie, reszta punktu to odpowiedź.
//
// 'definicja' — pojęcie i jego znaczenie:
//   - z sekcji „## Słowniczek”: `- **Pojęcie** – definicja.` (myślnik, półpauza albo dwukropek),
//   - z treści: zdanie `**Pojęcie** to …` / `jest to …` / `oznacza …` (pojęcie wielką literą).
// To samo pojęcie w jednej notatce występuje raz — słowniczek ma pierwszeństwo.

import { allTopics } from './content.js'

const REVIEW_HEADING = /^##\s+Szybka powtórka\s*$/im
const GLOSSARY_HEADING = /^##\s+Słowniczek\s*$/im
const ITEM = /^\s*(?:[-*+]|\d+[.)])\s+\*\*(.+?)\*\*\s*(.*)$/
const GLOSSARY_ITEM = /^\s*[-*+]\s+\*\*([^*]+?)\*\*\s*[:–—-]?\s*(.+)$/
const INLINE_DEFINITION = /\*\*(\p{Lu}[^*]{1,58})\*\*\s+(?:to|jest to|oznacza)\s+([^.*]{15,}\.)/gu

// Krótki, stały skrót tekstu — identyfikator fiszki nie zmienia się,
// gdy pytania w notatce zamienią się miejscami.
export function hashText(text) {
  let h = 2166136261
  for (const ch of text) {
    h ^= ch.codePointAt(0)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h.toString(36)
}

// Treść sekcji o danym nagłówku (do następnego nagłówka ##) albo ''.
function section(body, heading) {
  const match = heading.exec(body || '')
  if (!match) return ''
  const rest = body.slice(match.index + match[0].length)
  const end = rest.search(/^##\s/m)
  return end === -1 ? rest : rest.slice(0, end)
}

export const reviewSection = (body) => section(body, REVIEW_HEADING)
export const glossarySection = (body) => section(body, GLOSSARY_HEADING)

// Notatka bez sekcji „Szybka powtórka”, „Słowniczek” i „Źródła” — tam szukamy definicji w zdaniach.
function prose(body) {
  return (body || '').split(/^##\s+(?:Szybka powtórka|Słowniczek|Źródła)/m)[0].replace(/<[^>]+>/g, ' ')
}

const cardFor = (topic, kind, question, answer, id) => ({
  id,
  kind,
  path: topic.path,
  topicTitle: topic.title,
  subject: topic.subject || (topic.trail || []).at(-1) || '',
  trail: topic.trail || [],
  question,
  answer,
})

export function extractDefinitions(topic) {
  const out = []
  const seen = new Set()
  const add = (term, definition) => {
    const t = term.trim().replace(/:$/, '')
    const key = t.toLowerCase()
    if (!definition || seen.has(key)) return
    seen.add(key)
    out.push(cardFor(topic, 'definicja', t, definition.trim(), `${topic.path}#d${hashText(key)}`))
  }
  for (const line of glossarySection(topic.body).split('\n')) {
    const m = GLOSSARY_ITEM.exec(line)
    if (m) add(m[1], m[2])
  }
  for (const m of prose(topic.body).matchAll(INLINE_DEFINITION)) {
    add(m[1], m[2].charAt(0).toUpperCase() + m[2].slice(1))
  }
  return out
}

export function extractCards(topic) {
  const lines = reviewSection(topic.body).split('\n')
  const cards = []
  let current = null
  for (const line of lines) {
    const m = ITEM.exec(line)
    if (m) {
      current = { question: m[1].trim(), answer: m[2].trim() }
      cards.push(current)
    } else if (current && /^\s{2,}\S/.test(line)) {
      // Dalszy ciąg odpowiedzi w następnej linii (wcięty).
      current.answer = `${current.answer} ${line.trim()}`.trim()
    } else if (!line.trim()) {
      current = null
    }
  }
  const seen = new Set()
  return cards
    .filter((c) => c.answer)
    .map((c) => {
      let id = `${topic.path}#${hashText(c.question)}`
      // Dwa identyczne pytania w jednej notatce — drugie dostaje dopisek.
      while (seen.has(id)) id += '+'
      seen.add(id)
      return cardFor(topic, 'pytanie', c.question, c.answer, id)
    })
}

// Wszystkie fiszki ze wszystkich notatek, w kolejności czytania:
// najpierw pytania danej notatki, potem jej definicje.
export function allCards(root) {
  return allTopics(root).flatMap((t) => [...extractCards(t), ...extractDefinitions(t)])
}

// Dział nauki (pierwszy człon ścieżki): 'studia' albo 'kursy'.
export const scopeOf = (cardOrTopic) => cardOrTopic.path.split('/')[0]

// Nazwa grupy do wyboru w trybie egzaminu i w postępie: przedmiot albo kurs
// (drugi poziom ścieżki, np. „Interwencja kryzysowa”), a dla kompendiów — kategoria.
export function cardGroup(card) {
  return card.trail[2] || card.trail[1] || card.trail[0] || card.subject || ''
}
