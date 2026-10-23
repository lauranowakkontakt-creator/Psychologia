import { createContext, useContext, useMemo } from 'react'
import { allTopics, buildTree } from './lib/content.js'
import { buildIndex } from './lib/search.js'
import { allCards } from './lib/flashcards.js'
import { buildLinkGraph } from './lib/links.js'
import { legacyPath } from './lib/route.js'

// Treść aplikacji w jednym miejscu: drzewo notatek, indeks wyszukiwarki,
// fiszki i mapa powiązań. Pliki przychodzą z paczki (tryb lokalny) albo
// z Firestore po zalogowaniu (tryb Firebase) — reszta aplikacji tego nie wie.

const ContentContext = createContext(null)

export function buildContent({ files, added }) {
  const tree = buildTree(files, added)
  const topics = allTopics(tree)
  return {
    tree,
    // Tematy z `trail` (nazwy sekcji od góry) — po kolei i po ścieżce.
    topics,
    topicByPath: new Map(topics.map((t) => [t.path, t])),
    searchIndex: buildIndex(tree),
    cards: allCards(tree),
    links: buildLinkGraph(tree, legacyPath),
  }
}

export function ContentProvider({ content, children }) {
  const value = useMemo(() => buildContent(content), [content])
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  return useContext(ContentContext)
}
