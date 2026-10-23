import { toHash } from '../lib/route.js'
import { ArrowLeftIcon, ArrowRightIcon, BookmarkIcon } from './Icon.jsx'

// Pływający pasek na dole notatki: poprzedni temat, zakładka, następny temat.
// Przy ostatnim temacie duży przycisk wraca do listy.
export function NoteBar({ prev, next, listPath, saved, onToggleBookmark }) {
  return (
    <nav className="glass glass--bar note-bar" aria-label="Nawigacja notatki">
      {prev ? (
        <a className="bar-btn" href={toHash(prev.path)} aria-label={`Poprzedni temat: ${prev.title}`}>
          <ArrowLeftIcon />
        </a>
      ) : (
        <span className="bar-btn" aria-hidden="true" />
      )}
      <button
        type="button"
        className="bar-btn"
        aria-pressed={saved}
        aria-label={saved ? 'Usuń zakładkę' : 'Zapisz zakładkę'}
        onClick={onToggleBookmark}
      >
        <BookmarkIcon filled={saved} />
      </button>
      <a
        className="btn-accent bar-next"
        href={toHash(next ? next.path : listPath)}
        aria-label={next ? `Następny temat: ${next.title}` : 'Wróć do listy tematów'}
      >
        <span className="bar-next-text">{next ? next.title : 'Wróć do listy'}</span>
        {next && <ArrowRightIcon />}
      </a>
    </nav>
  )
}
