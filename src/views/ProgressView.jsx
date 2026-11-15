import { useContent } from '../content.jsx'
import { percent, progressRows } from '../lib/progress.js'
import { cardStats } from '../lib/srs.js'
import { CARD_FORMS, countLabel, subjectColor, TOPIC_FORMS } from '../lib/format.js'
import { REVIEW_PATH, toHash } from '../lib/route.js'
import { scopeOf } from '../lib/flashcards.js'
import { useLearnScope, useReadMap, useSrs } from '../hooks.js'
import { useRef, useState } from 'react'
import { backupFileName, buildBackup, parseBackup, restoreBackup } from '../lib/backup.js'
import { readStored, writeLocal } from '../store.js'
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

      <Backup />
    </>
  )
}

// Kopia zapasowa danych nauki do pliku — i wczytanie jej z powrotem (łączy, nie kasuje).
function Backup() {
  const input = useRef(null)
  const [message, setMessage] = useState('')

  const download = () => {
    const backup = buildBackup((key) => readStored(key, undefined))
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName()
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Kopia zapisana w pobranych plikach.')
  }

  const restore = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const data = parseBackup(await file.text())
    if (!data) {
      setMessage('To nie jest plik kopii z tej aplikacji.')
      return
    }
    const changes = restoreBackup(data, (key) => readStored(key, undefined))
    for (const [key, value] of Object.entries(changes)) writeLocal(key, value)
    setMessage(Object.keys(changes).length ? 'Kopia wczytana i połączona z danymi na tym urządzeniu.' : 'Wszystko z tej kopii już tu jest.')
  }

  return (
    <section className="home-block backup">
      <h2 className="block-label">Kopia zapasowa</h2>
      <p className="muted backup-text">
        Fiszki, przeczytane notatki, zakładki, dopiski i zaznaczenia w jednym pliku. Wczytanie kopii niczego nie kasuje.
      </p>
      <div className="backup-actions">
        <button type="button" className="btn-accent" onClick={download}>Pobierz kopię</button>
        <button type="button" className="text-link" onClick={() => input.current?.click()}>Wczytaj kopię</button>
        <input ref={input} type="file" accept="application/json,.json" hidden onChange={restore} aria-label="Plik kopii zapasowej" />
      </div>
      {message && <p className="muted backup-text" role="status">{message}</p>}
    </section>
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
