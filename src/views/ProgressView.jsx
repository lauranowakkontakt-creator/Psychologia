import { useContent } from '../content.jsx'
import { percent, progressRows } from '../lib/progress.js'
import { cardStats } from '../lib/srs.js'
import { CARD_FORMS, countLabel, subjectColor, TOPIC_FORMS } from '../lib/format.js'
import { REVIEW_PATH, toHash } from '../lib/route.js'
import { scopeOf } from '../lib/flashcards.js'
import { useLearnScope, useReadMap, useSrs } from '../hooks.js'
import { Topbar } from '../components/Topbar.jsx'
import { ScopeSwitch } from '../components/ScopeSwitch.jsx'

// Postęp nauki: przeczytane notatki i opanowane fiszki w każdym przedmiocie i kursie.
// Fiszka jest „opanowana”, gdy jej odstęp powtórek urósł do 3 tygodni.
export function ProgressView() {
  const { tree, cards: allCards, topics: allTopicsList } = useContent()
  const [scope, setScope] = useLearnScope(tree.sections)
  const [read] = useReadMap()
  const [srs] = useSrs()
  const cards = allCards.filter((c) => scopeOf(c) === scope)
  const topics = allTopicsList.filter((t) => scopeOf(t) === scope)
  const rows = progressRows(tree, read, cards, srs).filter((r) => r.path.split('/')[0] === scope)
  const totalRead = rows.reduce((n, r) => n + r.read, 0)
  const stats = cardStats(cards, srs)

  return (
    <>
      <Topbar backTo="" />
      <header className="page-head">
        <p className="eyebrow">Nauka</p>
        <h1 className="title-xl">Postęp</h1>
        <p className="muted page-sub">Notatka liczy się jako przeczytana po przewinięciu do końca.</p>
      </header>

      <ScopeSwitch sections={tree.sections} value={scope} onChange={setScope} />

      <div className="stat-tiles">
        <Stat label="Przeczytane" value={`${percent(totalRead, topics.length)}%`} sub={`${totalRead} z ${countLabel(topics.length, TOPIC_FORMS)}`} />
        <Stat label="Opanowane fiszki" value={`${percent(stats.known, stats.total)}%`} sub={`${stats.known} z ${countLabel(stats.total, CARD_FORMS)}`} />
        <Stat label="W nauce" value={stats.learning} sub={`na dziś ${stats.due}`} />
      </div>

      <section className="home-block">
        <h2 className="block-label">Przedmioty i kursy</h2>
        <ul className="glass group progress-list">
          {rows.map((r) => (
            <li key={r.name} className={`progress-row subject-${subjectColor(r.name)}`}>
              <a className="progress-name" href={toHash(r.path)}>
                <span className="dot" aria-hidden="true" />
                <span className="row-title">{r.name}</span>
              </a>
              <Bar label="Notatki" part={r.read} whole={r.topics} />
              {r.cards > 0 && <Bar label="Fiszki" part={r.known} whole={r.cards} />}
              {r.cards > 0 && (
                <a className="text-link progress-review" href={toHash(REVIEW_PATH, r.name)}>Powtórz fiszki</a>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div className="glass stat-tile">
      <span className="muted stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      <span className="muted stat-sub">{sub}</span>
    </div>
  )
}

function Bar({ label, part, whole }) {
  const p = percent(part, whole)
  return (
    <div className="progress-bar-row">
      <span className="muted progress-bar-label">{label}</span>
      <span className="progress" role="progressbar" aria-label={`${label}: ${part} z ${whole}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={p}>
        <span style={{ width: `${p}%` }} />
      </span>
      <span className="muted progress-bar-value">{part}/{whole}</span>
    </div>
  )
}
