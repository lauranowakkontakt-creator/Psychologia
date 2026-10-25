import { useState } from 'react'
import { flushSync } from 'react-dom'
import { useContent } from '../content.jsx'
import { countTopics, findNode, siblings } from '../lib/content.js'
import { CARD_FORMS, countLabel, formatDate, greeting, pad2, relativeTime, subjectColor, TOPIC_FORMS } from '../lib/format.js'
import { existingRecent } from '../lib/prefs.js'
import { recentlyAdded } from '../lib/added.js'
import { cardStats } from '../lib/srs.js'
import { annotatedPaths } from '../lib/annotations.js'
import { scopeOf } from '../lib/flashcards.js'
import { DAILY_HOURS, DAILY_KEY, nextChange, pickForNow } from '../lib/daily.js'
import { safeInline } from '../sanitize.js'
import { useStored } from '../store.js'
import { ScopeSwitch } from '../components/ScopeSwitch.jsx'
import { EXAM_PATH, MAP_PATH, NOTES_PATH, PROGRESS_PATH, REVIEW_PATH, SEARCH_PATH, toHash } from '../lib/route.js'
import { navigate } from '../router.js'
import { useBookmarks, useHighlights, useLearnScope, useNotes, useRecent, useSrs } from '../hooks.js'
import { useAuth } from '../auth.jsx'
import { CardsIcon, ExamIcon, Icon, LogOutIcon, MapIcon, NotesIcon, ProgressIcon, SearchIcon } from '../components/Icon.jsx'
import { ThemeToggle } from '../components/ThemeToggle.jsx'

const RECENT_SHOWN = 3
const BOOKMARKS_SHOWN = 5
const ADDED_SHOWN = 4

const DUE_FORMS = ['fiszka na dziś', 'fiszki na dziś', 'fiszek na dziś']
const NOTE_FORMS = ['notatka', 'notatki', 'notatek']

// „3 tematy”, a dla sekcji z samymi podsekcjami i polem `licznik:` — „2 kursy”.
function sectionCount(section) {
  if (section.counter && section.sections.length && !section.topics.length) {
    return countLabel(section.sections.length, section.counter)
  }
  return countLabel(countTopics(section), TOPIC_FORMS)
}

export function HomeView({ root }) {
  const { tree, topics, cards } = useContent()
  const { user, mode, signOut } = useAuth()
  const isTopic = (path) => findNode(tree, path)?.type === 'temat'
  // Przedmiot tematu albo nazwa jego sekcji — do kropki i podpisu.
  const subjectOf = (topic) => topic.subject || findNode(tree, topic.sectionPath)?.title || ''

  const recent = existingRecent(useRecent(), isTopic)
  const [bookmarks] = useBookmarks()
  const [srs] = useSrs()
  const [notes] = useNotes()
  const [highlights] = useHighlights()

  const current = recent[0]
  const currentTopic = current && findNode(tree, current.path)
  const hello = greeting()
  const [scope, setScope] = useLearnScope(root.sections)
  const scopedCards = cards.filter((c) => scopeOf(c) === scope)
  const stats = cardStats(scopedCards, srs)
  const annotated = annotatedPaths(notes, highlights).filter(isTopic).length

  // Pole na starcie tylko wygląda jak pole: dotknięcie przenosi do wyszukiwarki
  // i ustawia tam fokus w tym samym geście — tylko wtedy iPhone otwiera klawiaturę.
  const openSearch = () => {
    flushSync(() => navigate(SEARCH_PATH))
    document.getElementById('search-input')?.focus()
  }

  const learning = [
    { path: REVIEW_PATH, icon: CardsIcon, title: 'Powtórki', sub: stats.due ? countLabel(stats.due, DUE_FORMS) : countLabel(stats.total, CARD_FORMS) },
    { path: EXAM_PATH, icon: ExamIcon, title: 'Egzamin', sub: 'losowe pytania' },
    { path: PROGRESS_PATH, icon: ProgressIcon, title: 'Postęp', sub: 'co już umiesz' },
    { path: MAP_PATH, icon: MapIcon, title: 'Mapa', sub: 'powiązania tematów' },
    { path: NOTES_PATH, icon: NotesIcon, title: 'Dopiski', sub: annotated ? countLabel(annotated, NOTE_FORMS) : 'Twoje zaznaczenia' },
  ]

  return (
    <div className="home">
      <header className="home-top">
        <a className="logo" href={toHash('')} aria-label="psycho, start">psycho<span>.</span></a>
        <ThemeToggle />
      </header>

      <div className="home-main">
        <div className="home-hello">
          <p className="muted">{user.guest ? hello : `${hello}, ${user.name}`}</p>
          <h1 className="title-xl">Twoje <em>notatki</em></h1>
      </div>

      <button type="button" className="glass search-field search-field--fake" onClick={openSearch}>
        <SearchIcon />
        <span>Szukaj w notatkach</span>
      </button>

      <nav className="home-cards" aria-label="Działy">
        {root.sections.map((s, i) => (
          <a key={s.path} className={`glass home-card tint-${(i % 2) + 1}`} href={toHash(s.path)}>
            <span className="home-card-icon"><Icon name={s.icon} /></span>
            <span className="home-card-text">
              <span className="home-card-title">{s.title}</span>
              <span className="muted">{sectionCount(s)}</span>
            </span>
          </a>
        ))}
      </nav>

      {currentTopic && <ContinueCard topic={currentTopic} progress={current.progress} subject={subjectOf(currentTopic)} number={siblings(tree, currentTopic).number} />}

      <MiniList
        label="Ostatnio otwierane"
        subjectOf={subjectOf}
        items={recent.slice(1, 1 + RECENT_SHOWN).map((e) => ({ topic: findNode(tree, e.path), aside: relativeTime(e.at) }))}
      />
      <MiniList
        label="Zakładki"
        subjectOf={subjectOf}
        items={bookmarks.filter(isTopic).slice(0, BOOKMARKS_SHOWN).map((p) => ({ topic: findNode(tree, p) }))}
      />
      <MiniList
        label="Ostatnio dodane"
        subjectOf={subjectOf}
        items={recentlyAdded(topics, ADDED_SHOWN).map((t) => ({ topic: findNode(tree, t.path), aside: formatDate(t.added.slice(0, 10)) }))}
      />

      {mode === 'firebase' && (
        <footer className="home-account">
          <span className="muted">{user.email}</span>
          <button type="button" className="text-link" onClick={signOut}>
            <LogOutIcon /> Wyloguj
          </button>
        </footer>
      )}
      </div>

      <div className="home-side">
        <nav className="home-block home-learn" aria-labelledby="learn-label">
          <h2 className="block-label" id="learn-label">Nauka</h2>
          <ScopeSwitch sections={root.sections} value={scope} onChange={setScope} />
          <TermNow definitions={scopedCards.filter((c) => c.kind === 'definicja')} />
          <div className="learn-grid">
            {learning.map(({ path, icon: LearnIcon, title, sub }) => (
              <a key={path} className={`glass learn-tile${path === REVIEW_PATH && stats.due ? ' learn-tile--due' : ''}`} href={toHash(path)}>
                <span className="learn-icon"><LearnIcon /></span>
                <span className="learn-title">{title}</span>
                <span className="muted learn-sub">{sub}</span>
              </a>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

// „Pojęcie na teraz”: definicja, która sama zmienia się co kilka godzin
// (ta sama co w widżecie na ekranie głównym). „Inne” pokazuje kolejne bez czekania.
const HOURS_LABEL = { 3: 'co 3 godz.', 6: 'co 6 godz.', 24: 'raz dziennie' }

function TermNow({ definitions }) {
  const [hours, setHours] = useStored(DAILY_KEY, DAILY_HOURS[0])
  const h = DAILY_HOURS.includes(hours) ? hours : DAILY_HOURS[0]
  const [skip, setSkip] = useState(0)
  const now = Date.now()
  const term = pickForNow(definitions, now, h, skip)
  if (!term) return null
  const next = new Date(nextChange(now, h))
  const cycle = () => setHours(DAILY_HOURS[(DAILY_HOURS.indexOf(h) + 1) % DAILY_HOURS.length])
  return (
    <section className="glass glass--accent term-now" aria-labelledby="term-now-label">
      <p className="term-now-head">
        <span className="note-lead-label" id="term-now-label">Pojęcie na teraz</span>
        <button type="button" className="term-now-every" onClick={cycle} aria-label={`Zmiana pojęcia ${HOURS_LABEL[h]}. Zmień`}>
          {HOURS_LABEL[h]}
        </button>
      </p>
      <h3 className="term-now-term">{term.question}</h3>
      <p className="prose term-now-def" dangerouslySetInnerHTML={{ __html: safeInline(term.answer) }} />
      <p className="term-now-foot">
        <a className="text-link" href={toHash(term.path)}>{term.topicTitle}</a>
        <button type="button" className="text-link" onClick={() => setSkip((n) => n + 1)}>Inne</button>
      </p>
      <p className="muted term-now-next">Następne o {next.getHours()}:{String(next.getMinutes()).padStart(2, '0')}{h === 24 ? ' (jutro)' : ''}</p>
    </section>
  )
}

function ContinueCard({ topic, progress = 0, subject, number }) {
  const percent = Math.round(progress * 100)
  return (
    <section className="home-block" aria-labelledby="continue-label">
      <h2 className="block-label" id="continue-label">Czytaj dalej</h2>
      <a className="glass glass--accent continue" href={toHash(topic.path)}>
        <span className="continue-sub muted">{subject} · {pad2(number)}</span>
        <span className="continue-title">{topic.title}</span>
        {percent > 2 && (
          <span className="progress" role="progressbar" aria-label="Przeczytano"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
            <span style={{ width: `${percent}%` }} />
          </span>
        )}
      </a>
    </section>
  )
}

function MiniList({ label, items, subjectOf }) {
  if (!items.length) return null
  return (
    <section className="home-block home-list">
      <h2 className="block-label">{label}</h2>
      <ul className="mini-list">
        {items.map(({ topic, aside }) => {
          const subject = subjectOf(topic)
          return (
            <li key={topic.path}>
              <a href={toHash(topic.path)}>
                <span className={`dot subject-${subjectColor(subject)}`} aria-hidden="true" />
                <span className="mini-text">
                  <span className="mini-title">{topic.title}</span>
                  <span className="mini-sub">{subject}</span>
                </span>
                {aside && <span className="mini-aside">{aside}</span>}
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
