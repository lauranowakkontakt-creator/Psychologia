import { useEffect, useId, useState } from 'react'
import { toHash } from '../lib/route.js'
import { subjectColor } from '../lib/format.js'
import { ChevronIcon, TocIcon } from './Icon.jsx'

// Dodatki pod i nad treścią notatki: spis treści, „Wspominają tę notatkę”,
// fiszki z notatki i własny dopisek.

// Na komputerze spis stoi z boku notatki, więc od razu jest rozwinięty
// (ta sama szerokość co w src/styles.css, „Komputer”).
const wideScreen = () => window.matchMedia?.('(min-width: 1024px)').matches || false

// headings: [{ id, text }] — nagłówki ## z treści (ID nadaje TopicView).
export function Toc({ headings }) {
  const [open] = useState(wideScreen)
  if (headings.length < 3) return null
  const go = (id) => (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <details className="glass toc" open={open || undefined}>
      <summary>
        <TocIcon />
        <span>Spis treści</span>
        <span className="muted toc-count">{headings.length}</span>
        <ChevronIcon className="toc-chevron" />
      </summary>
      <ol>
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} onClick={go(h.id)}>{h.text}</a>
          </li>
        ))}
      </ol>
    </details>
  )
}

export function Backlinks({ topics }) {
  if (!topics.length) return null
  return (
    <section className="note-extra" aria-labelledby="backlinks-label">
      <h2 className="block-label" id="backlinks-label">Wspominają tę notatkę</h2>
      <ul className="mini-list glass">
        {topics.map((t) => {
          const subject = t.subject || t.trail.at(-1) || ''
          return (
            <li key={t.path}>
              <a href={toHash(t.path)}>
                <span className={`dot subject-${subjectColor(subject)}`} aria-hidden="true" />
                <span className="mini-text">
                  <span className="mini-title">{t.title}</span>
                  <span className="mini-sub">{subject}</span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// Dopisek zapisuje się sam chwilę po przerwaniu pisania i przy wyjściu z pola.
const SAVE_DELAY = 600

export function MyNote({ text, onSave }) {
  const id = useId()
  const [draft, setDraft] = useState(text)
  const [saved, setSaved] = useState(true)

  // Dopisek zmieniony na innym urządzeniu — pokaż nowy, jeśli tu nic nie piszemy.
  useEffect(() => {
    if (saved) setDraft(text)
  }, [text, saved])

  useEffect(() => {
    if (saved) return undefined
    const t = setTimeout(() => {
      onSave(draft)
      setSaved(true)
    }, SAVE_DELAY)
    return () => clearTimeout(t)
  }, [draft, saved, onSave])

  return (
    <section className="note-extra my-note">
      <label className="block-label" htmlFor={id}>Mój dopisek</label>
      <textarea
        id={id}
        className="glass my-note-field"
        rows={3}
        placeholder="Własne przemyślenia, przykłady, pytania do wykładowcy…"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          setSaved(false)
        }}
        onBlur={() => {
          if (!saved) {
            onSave(draft)
            setSaved(true)
          }
        }}
      />
      <p className="muted my-note-hint" aria-live="polite">{saved ? (draft.trim() ? 'Zapisano' : 'Widzisz go tylko Ty') : 'Zapisuję…'}</p>
    </section>
  )
}
