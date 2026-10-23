import { useEffect, useState } from 'react'
import { useAuth } from './auth.jsx'
import { ContentProvider, useContent } from './content.jsx'
import { findNode } from './lib/content.js'
import { EXAM_PATH, legacyPath, MAP_PATH, NOTES_PATH, PROGRESS_PATH, REVIEW_PATH, SEARCH_PATH, toHash } from './lib/route.js'
import { useRoute } from './router.js'
import { HomeView } from './views/HomeView.jsx'
import { SectionView } from './views/SectionView.jsx'
import { TopicView } from './views/TopicView.jsx'
import { SearchView } from './views/SearchView.jsx'
import { NotFoundView } from './views/NotFoundView.jsx'
import { ReviewView } from './views/ReviewView.jsx'
import { ExamView } from './views/ExamView.jsx'
import { ProgressView } from './views/ProgressView.jsx'
import { MapView } from './views/MapView.jsx'
import { AnnotationsView } from './views/AnnotationsView.jsx'
import { GateView } from './views/GateView.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

export const APP_NAME = 'Psycho'

const TITLES = {
  [SEARCH_PATH]: 'Szukaj',
  [REVIEW_PATH]: 'Powtórki',
  [EXAM_PATH]: 'Egzamin',
  [PROGRESS_PATH]: 'Postęp nauki',
  [MAP_PATH]: 'Mapa powiązań',
  [NOTES_PATH]: 'Moje dopiski',
}

export default function App() {
  const auth = useAuth()
  if (auth.status !== 'ready') {
    return (
      <Shell>
        <GateView />
      </Shell>
    )
  }
  return (
    <ContentProvider content={auth.content}>
      <Screens />
    </ContentProvider>
  )
}

function Shell({ children }) {
  return (
    <div className="app app-bg">
      <main className="page">{children}</main>
    </div>
  )
}

function Screens() {
  const { tree } = useContent()
  const { path, q } = useRoute()
  // Ostatnie zapytanie zostaje, żeby po wejściu w wynik i powrocie do lupy
  // nie trzeba było go wpisywać od nowa.
  const [lastQuery, setLastQuery] = useState('')

  const appScreen = TITLES[path] !== undefined
  const found = appScreen ? null : findNode(tree, path)
  // Stary adres (sprzed podziału Studiów) – pokazujemy notatkę i podmieniamy adres.
  const moved = !appScreen && !found ? legacyPath(path) : null
  const node = found || (moved ? findNode(tree, moved) : null)

  useEffect(() => {
    if (moved && node) window.location.replace(toHash(moved, q))
  }, [moved, node, q])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  useEffect(() => {
    const title = appScreen ? TITLES[path] : node && node.path ? node.title : ''
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [node, path, appScreen])

  let view
  if (path === SEARCH_PATH) view = <SearchView initialQuery={q || lastQuery} onQueryChange={setLastQuery} />
  else if (path === REVIEW_PATH) view = <ReviewView key={q} group={q} />
  else if (path === EXAM_PATH) view = <ExamView />
  else if (path === PROGRESS_PATH) view = <ProgressView />
  else if (path === MAP_PATH) view = <MapView />
  else if (path === NOTES_PATH) view = <AnnotationsView />
  else if (!node) view = <NotFoundView />
  else if (node.type === 'temat') view = <TopicView key={`${node.path}?${q}`} topic={node} highlight={q} />
  else if (node.path) view = <SectionView key={node.path} section={node} />
  else view = <HomeView root={node} />

  return (
    <Shell>
      <ErrorBoundary key={path}>{view}</ErrorBoundary>
    </Shell>
  )
}
