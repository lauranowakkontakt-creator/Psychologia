import { useContent } from '../content.jsx'
import { annotatedPaths, highlightsFor, noteText } from '../lib/annotations.js'
import { findNode } from '../lib/content.js'
import { toHash } from '../lib/route.js'
import { useHighlights, useNotes } from '../hooks.js'
import { Topbar } from '../components/Topbar.jsx'

// Wszystkie własne dopiski i zaznaczenia w jednym miejscu, najnowsze na górze.
export function AnnotationsView() {
  const { tree } = useContent()
  const [notes] = useNotes()
  const [highlights] = useHighlights()
  const items = annotatedPaths(notes, highlights)
    .map((path) => findNode(tree, path))
    .filter((t) => t?.type === 'temat')

  return (
    <>
      <Topbar backTo="" />
      <header className="page-head">
        <p className="eyebrow">Nauka</p>
        <h1 className="title-xl">Moje dopiski</h1>
        <p className="muted page-sub">Zaznacz fragment notatki palcem, a pojawi się przycisk „Zaznacz”. Dopisek dodasz na końcu każdej notatki.</p>
      </header>

      {!items.length && <p className="muted empty">Na razie nic tu nie ma.</p>}

      {items.map((t) => {
        const note = noteText(notes, t.path)
        const quotes = highlightsFor(highlights, t.path)
        return (
          <article key={t.path} className="glass annotation">
            <a className="annotation-title" href={toHash(t.path)}>{t.title}</a>
            <p className="muted annotation-sub">{t.subject || findNode(tree, t.sectionPath)?.title}</p>
            {note && <p className="annotation-note">{note}</p>}
            {quotes.length > 0 && (
              <ul className="annotation-quotes">
                {quotes.map((h) => (
                  <li key={h.id}><mark className="hl-user">{h.quote}</mark></li>
                ))}
              </ul>
            )}
          </article>
        )
      })}
    </>
  )
}
