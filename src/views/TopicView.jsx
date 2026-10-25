import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useContent } from '../content.jsx'
import { siblings } from '../lib/content.js'
import { CARD_FORMS, countLabel, formatDate, pad2 } from '../lib/format.js'
import { splitLead } from '../lib/note.js'
import { safeMarkdown } from '../sanitize.js'
import { backlinks } from '../lib/links.js'
import { addHighlight, cleanQuote, highlightsFor, noteText, QUOTE_MAX, QUOTE_MIN, removeHighlight, setNote } from '../lib/annotations.js'
import { REVIEW_PATH, toHash } from '../lib/route.js'
import { applyUserHighlights, highlightMatches, readableText } from '../highlight.js'
import { speechSupported, useSpeech } from '../speech.js'
import { useBookmarks, useHighlights, useNotes, useReadingHistory, useTextSize } from '../hooks.js'
import { Topbar } from '../components/Topbar.jsx'
import { NoteBar } from '../components/NoteBar.jsx'
import { Backlinks, MyNote, Toc } from '../components/NoteExtras.jsx'
import { CardsIcon, CloseIcon, HeadphonesIcon, HighlighterIcon, PauseIcon, PlayIcon, PrinterIcon, StopIcon, TrashIcon } from '../components/Icon.jsx'

export function TopicView({ topic, highlight }) {
  const { tree, links, cards, topicByPath } = useContent()
  const { prev, next, number, section } = siblings(tree, topic)
  const { leadHtml, restHtml } = useMemo(() => {
    const { lead, rest } = splitLead(topic.body)
    return {
      leadHtml: lead ? safeMarkdown(lead) : '',
      restHtml: safeMarkdown(rest),
    }
  }, [topic.body])

  useReadingHistory(topic.path)
  const [bookmarks, toggleBookmark] = useBookmarks()
  const textSize = useTextSize()
  const [notes, setNotes] = useNotes()
  const [highlights, setHighlights] = useHighlights()
  const bodyRef = useRef(null)
  const [headings, setHeadings] = useState([])

  const myHighlights = highlightsFor(highlights, topic.path)
  // Zmiana zaznaczeń rysuje treść od nowa (klucz), a efekt nakłada je jeszcze raz.
  const hlKey = myHighlights.map((h) => h.id).join(',')

  // Po narysowaniu treści: ID nagłówków do spisu treści, własne zaznaczenia,
  // a po wejściu z wyszukiwarki — podświetlenie szukanych słów i przewinięcie do pierwszego.
  // TopicView ma klucz ścieżka+zapytanie (App), więc HTML jest świeży przy każdym zapytaniu.
  useEffect(() => {
    const root = bodyRef.current
    if (!root) return
    const found = [...root.querySelectorAll('.note-body > h2')].map((h, i) => {
      h.id = `sekcja-${i + 1}`
      return { id: h.id, text: h.textContent }
    })
    setHeadings(found)
    applyUserHighlights(root, myHighlights)
    if (highlight) highlightMatches(root, highlight)?.scrollIntoView({ block: 'center' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hlKey, highlight])

  const related = useMemo(
    () => backlinks(links, topic.path).map((p) => topicByPath.get(p)).filter(Boolean),
    [links, topicByPath, topic.path],
  )
  const cardCount = useMemo(() => cards.filter((c) => c.path === topic.path).length, [cards, topic.path])

  const saveNote = useCallback((text) => setNotes((m) => setNote(m, topic.path, text)), [setNotes, topic.path])

  const selection = useSelection(bodyRef)
  const [activeMark, setActiveMark] = useState(null)
  const onBodyClick = (e) => {
    const mark = e.target.closest?.('mark.hl-user')
    setActiveMark(mark ? mark.dataset.hl : null)
  }
  const saveSelection = () => {
    setHighlights((m) => addHighlight(m, topic.path, selection.text))
    selection.clear()
  }
  const deleteMark = () => {
    setHighlights((m) => removeHighlight(m, topic.path, activeMark))
    setActiveMark(null)
  }

  const getText = useCallback(() => readableText(bodyRef.current), [])
  const speech = useSpeech(getText)
  const canSpeak = speechSupported()

  const eyebrow = [topic.subject || section?.title, pad2(number)].filter(Boolean).join(' · ')
  const meta = [topic.kind, formatDate(topic.date, true)].filter(Boolean).join(' · ')

  return (
    <article className="note" style={{ '--prose-size': `${textSize.size.px}px` }}>
      <Topbar
        backTo={topic.sectionPath}
        right={
          <div className="topbar-actions">
            {canSpeak && (
              <button
                type="button"
                className="icon-btn"
                aria-label={speech.state === 'idle' ? 'Czytaj na głos' : 'Zatrzymaj czytanie'}
                aria-pressed={speech.state !== 'idle'}
                onClick={speech.state === 'idle' ? speech.play : speech.stop}
              >
                <HeadphonesIcon />
              </button>
            )}
            <button type="button" className="icon-btn" aria-label="Drukuj lub zapisz jako PDF" onClick={() => window.print()}>
              <PrinterIcon />
            </button>
            <button
              type="button"
              className="icon-btn text-size-btn"
              aria-label={`Rozmiar tekstu: ${textSize.size.label}. Zmień na ${textSize.next.label}`}
              onClick={textSize.cycle}
            >
              Aa
            </button>
          </div>
        }
      />

      <header className="note-head">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="note-title">{topic.title}</h1>
        {meta && <p className="muted note-meta">{meta}</p>}
      </header>

      <div className="note-side">
        <Toc headings={headings} />
      </div>

      <div className="note-main">
        <div ref={bodyRef} key={hlKey} onClick={onBodyClick}>
          {leadHtml && (
            <aside className="glass glass--accent note-lead" aria-label="W skrócie">
              <p className="note-lead-label" aria-hidden="true">W skrócie</p>
              <div className="prose" dangerouslySetInnerHTML={{ __html: leadHtml }} />
            </aside>
          )}
          {restHtml && <div className="prose note-body" dangerouslySetInnerHTML={{ __html: restHtml }} />}
        </div>

        {cardCount > 0 && (
          <a className="glass note-cards" href={toHash(REVIEW_PATH, topic.path)}>
            <CardsIcon />
            <span className="mini-text">
              <span className="mini-title">Powtórz fiszki z tej notatki</span>
              <span className="mini-sub">{countLabel(cardCount, CARD_FORMS)} z „Szybkiej powtórki”</span>
            </span>
          </a>
        )}

        <Backlinks topics={related} />
        <MyNote key={topic.path} text={noteText(notes, topic.path)} onSave={saveNote} />
      </div>

      <div className="note-float">
        {selection.text && !activeMark && (
          <div className="glass glass--bar float-bar">
            <span className="float-bar-text">Zaznaczony fragment</span>
            <button type="button" className="btn-accent float-btn" onPointerDown={(e) => e.preventDefault()} onClick={saveSelection}>
              <HighlighterIcon /> Zaznacz
            </button>
          </div>
        )}
        {activeMark && (
          <div className="glass glass--bar float-bar">
            <span className="float-bar-text">Twoje zaznaczenie</span>
            <button type="button" className="bar-btn" aria-label="Zamknij" onClick={() => setActiveMark(null)}>
              <CloseIcon />
            </button>
            <button type="button" className="btn-accent float-btn" onClick={deleteMark}>
              <TrashIcon /> Usuń
            </button>
          </div>
        )}
        {speech.state !== 'idle' && (
          <div className="glass glass--bar float-bar" role="group" aria-label="Czytanie na głos">
            <button
              type="button"
              className="bar-btn"
              aria-label={speech.state === 'playing' ? 'Pauza' : 'Czytaj dalej'}
              onClick={speech.state === 'playing' ? speech.pause : speech.play}
            >
              {speech.state === 'playing' ? <PauseIcon /> : <PlayIcon />}
            </button>
            <span className="float-bar-text">{speech.state === 'playing' ? 'Czytam notatkę' : 'Wstrzymano'}</span>
            <button type="button" className="bar-btn rate-btn" aria-label={`Tempo ${speech.rate}×. Zmień`} onClick={speech.cycleRate}>
              {String(speech.rate).replace('.', ',')}×
            </button>
            <button type="button" className="bar-btn" aria-label="Zakończ czytanie" onClick={speech.stop}>
              <StopIcon />
            </button>
          </div>
        )}
      </div>

      <NoteBar
        prev={prev}
        next={next}
        listPath={topic.sectionPath}
        saved={bookmarks.includes(topic.path)}
        onToggleBookmark={() => toggleBookmark(topic.path)}
      />
    </article>
  )
}

// Zaznaczony tekst w treści notatki (do przycisku „Zaznacz”). Po skasowaniu
// zaznaczenia przycisk znika z opóźnieniem — na telefonie dotknięcie przycisku
// najpierw czyści zaznaczenie, a dopiero potem jest kliknięciem.
function useSelection(rootRef) {
  const [text, setText] = useState('')
  useEffect(() => {
    let timer = null
    const onChange = () => {
      clearTimeout(timer)
      const sel = window.getSelection()
      const root = rootRef.current
      const inside = sel && !sel.isCollapsed && root && root.contains(sel.anchorNode) && root.contains(sel.focusNode)
      const quote = inside ? cleanQuote(sel.toString()) : ''
      if (quote.length >= QUOTE_MIN && quote.length <= QUOTE_MAX) setText(quote)
      else timer = setTimeout(() => setText(''), 400)
    }
    document.addEventListener('selectionchange', onChange)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('selectionchange', onChange)
    }
  }, [rootRef])
  const clear = () => {
    window.getSelection()?.removeAllRanges()
    setText('')
  }
  return { text, clear }
}
