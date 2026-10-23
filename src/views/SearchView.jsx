import { useEffect, useMemo, useRef, useState } from 'react'
import { useContent } from '../content.jsx'
import { search } from '../lib/search.js'
import { SEARCH_PATH, toHash } from '../lib/route.js'
import { Topbar } from '../components/Topbar.jsx'
import { TopicRow } from '../components/TopicRow.jsx'
import { CloseIcon, SearchIcon } from '../components/Icon.jsx'

export function SearchView({ initialQuery, onQueryChange }) {
  const { searchIndex } = useContent()
  const [query, setQuery] = useState(initialQuery)
  const inputRef = useRef(null)
  const results = useMemo(() => search(searchIndex, query), [searchIndex, query])
  const trimmed = query.trim()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Zapytanie trafia do adresu bez nowego wpisu w historii — „wstecz” w telefonie
  // nie cofa litera po literze, a odświeżenie strony zostawia wyniki.
  useEffect(() => {
    onQueryChange(query)
    const hash = toHash(SEARCH_PATH, trimmed)
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
  }, [query, trimmed, onQueryChange])

  return (
    <>
      <Topbar backTo="" />
      <form className="glass search-field" role="search" onSubmit={(e) => { e.preventDefault(); inputRef.current?.blur() }}>
        <SearchIcon />
        <input
          id="search-input"
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Szukaj w notatkach"
          aria-label="Szukaj w notatkach"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button type="button" className="field-clear" aria-label="Wyczyść" onClick={() => { setQuery(''); inputRef.current?.focus() }}>
            <CloseIcon />
          </button>
        )}
      </form>

      <p className="muted search-count" aria-live="polite">
        {!trimmed && 'Szukaj w tytułach i treści wszystkich notatek. Polskie znaki nie są potrzebne.'}
        {trimmed && (results.length ? `Wyniki: ${results.length}` : 'Nic nie znaleziono. Spróbuj krótszego słowa.')}
      </p>

      {results.length > 0 && (
        <section className="glass group">
          {results.map((r) => (
            <TopicRow key={r.path} href={toHash(r.path, trimmed)} title={r.title} meta={r.trail.join(' · ')}>
              <span className="row-snippet">
                {r.snippet.map((p, i) => (p.hit ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
              </span>
            </TopicRow>
          ))}
        </section>
      )}
    </>
  )
}
