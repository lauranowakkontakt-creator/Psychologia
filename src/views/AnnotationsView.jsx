import { useContent } from '../content.jsx'
import { annotatedPaths, highlightsFor, noteText, removeHighlight, setNote } from '../lib/annotations.js'
import { findNode } from '../lib/content.js'
import { toHash } from '../lib/route.js'
import { useHighlights, useNotes } from '../hooks.js'
import { TrashIcon } from '../components/Icon.jsx'
import { Topbar } from '../components/Topbar.jsx'

// Wszystkie własne dopiski i zaznaczenia w jednym miejscu, najnowsze na górze.
export function AnnotationsView() {
  const { tree } = useContent()
  const [notes, setNotes] = useNotes()
  const [highlights, setHighlights] = useHighlights()
  const items = annotatedPaths(notes, highlights)
    .map((path) => findNode(tree, path))
    .filter((t) => t?.type === 'temat')

  return (
    <>
      <Topbar backTo="" />
      <header className="page-head">
        <p className="eyebrow">Nauka</p>
        <h1 className="title-xl">Moje dopiski</h1>
        <p className="muted page-sub">Zaznacz fragment notatki palcem, a pojawi się przycisk „Zaznacz”. Dopisek dodasz na końcu każdej notatki. Kosz usuwa zaznaczenie albo dopisek.</p>
      </header>

      {!items.length && <p className="muted empty">Na razie nic tu nie ma.</p>}

      {items.map((t) => {
        const note = noteText(notes, t.path)
        const quotes = highlightsFor(highlights, t.path)
        return (
          <article key={t.path} className="glass annotation">
            <a className="annotation-title" href={toHash(t.path)}>{t.title}</a>
            <p className="muted annotation-sub">{t.subject || findNode(tree, t.sectionPath)?.title}</p>
            {note && (
              <div className="annotation-row">
                <p className="annotation-note">{note}</p>
                <button
                  type="button"
                  className="icon-btn annotation-delete"
                  aria-label="Usuń dopisek"
                  onClick={() => setNotes((m) => setNote(m, t.path, ''))}
                >
                  <TrashIcon />
                </button>
              </div>
            )}
            {quotes.length > 0 && (
              <ul className="annotation-quotes">
                {quotes.map((h) => (
                  <li key={h.id} className="annotation-row">
                    <mark className="hl-user">{h.quote}</mark>
                    <button
                      type="button"
                      className="icon-btn annotation-delete"
                      aria-label="Usuń zaznaczenie"
                      onClick={() => setHighlights((m) => removeHighlight(m, t.path, h.id))}
                    >
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>
        )
      })}
    </>
  )
}
