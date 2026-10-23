import { useMemo, useState } from 'react'
import { useContent } from '../content.jsx'
import { cardGroup, scopeOf } from '../lib/flashcards.js'
import { examGroups, pickQuestions } from '../lib/exam.js'
import { cardStats, dueCards, grade, GRADES, previewInterval } from '../lib/srs.js'
import { CARD_FORMS, countLabel, DAY_FORMS } from '../lib/format.js'
import { findNode } from '../lib/content.js'
import { REVIEW_PATH, toHash } from '../lib/route.js'
import { navigate } from '../router.js'
import { useLearnScope, useSrs } from '../hooks.js'
import { useStored } from '../store.js'
import { safeInline } from '../sanitize.js'
import { Topbar } from '../components/Topbar.jsx'
import { ScopeSwitch } from '../components/ScopeSwitch.jsx'

const EXTRA = 10
const KIND_KEY = 'psycho-card-kind'
const KINDS = [
  { value: '', label: 'Wszystko' },
  { value: 'pytanie', label: 'Pytania' },
  { value: 'definicja', label: 'Definicje' },
]

// Powtórki fiszek: pytania z „Szybkiej powtórki” i definicje pojęć.
// Bez `group` — cały dział (Studia albo Kursy, przełącznik). `group` (z adresu ?q=)
// zawęża do przedmiotu albo do jednej notatki (wtedy to jej ścieżka).
export function ReviewView({ group }) {
  const { tree, cards } = useContent()
  const [srs] = useSrs()
  const [learnScope, setLearnScope] = useLearnScope(tree.sections)
  const [storedKind, setKind] = useStored(KIND_KEY, '')
  const kind = KINDS.some((k) => k.value === storedKind) ? storedKind : ''

  const topic = group ? findNode(tree, group) : null
  const scope = topic?.type === 'temat' ? 'topic' : group ? 'group' : 'all'
  // Dział, z którego są przedmioty do wyboru: przy wybranym przedmiocie — jego dział.
  const groupScope = scope === 'group' ? scopeOf(cards.find((c) => cardGroup(c) === group) || { path: learnScope }) : learnScope

  const pool = useMemo(() => {
    if (scope === 'topic') return cards.filter((c) => c.path === topic.path)
    const inScope = scope === 'group' ? cards.filter((c) => cardGroup(c) === group) : cards.filter((c) => scopeOf(c) === learnScope)
    return kind ? inScope.filter((c) => c.kind === kind) : inScope
  }, [cards, scope, topic, group, learnScope, kind])

  const stats = cardStats(pool, srs)
  const today = useMemo(() => dueCards(pool, srs).length, [pool, srs])
  const title = scope === 'topic' ? topic.title : scope === 'group' ? group : 'Powtórki'

  return (
    <>
      <Topbar backTo={scope === 'topic' ? topic.path : ''} />
      <header className="page-head">
        <p className="eyebrow">{scope === 'all' ? 'Fiszki' : 'Powtórki'}</p>
        <h1 className="title-xl">{title}</h1>
        <p className="muted page-sub">
          {countLabel(stats.total, CARD_FORMS)} · na dziś {today} · opanowane {stats.known}
        </p>
      </header>

      {scope === 'all' && <ScopeSwitch sections={tree.sections} value={learnScope} onChange={setLearnScope} />}
      {scope !== 'topic' && <GroupPicker cards={cards.filter((c) => scopeOf(c) === groupScope)} value={scope === 'group' ? group : ''} />}
      {scope !== 'topic' && (
        <div className="chips kind-chips" role="group" aria-label="Rodzaj fiszek">
          {KINDS.map((k) => (
            <button key={k.value} type="button" className="chip chip--tap" aria-pressed={kind === k.value} onClick={() => setKind(k.value)}>
              {k.label}
            </button>
          ))}
        </div>
      )}

      {/* Nowa seria po zmianie działu albo rodzaju fiszek. */}
      <Session key={`${learnScope}|${kind}`} pool={pool} all={scope === 'topic'} />
    </>
  )
}

// Kolejka ustalona na wejściu — ocena nie przetasowuje jej w trakcie.
// Z jednej notatki (`all`): wszystkie jej fiszki, bez czekania na termin.
function Session({ pool, all }) {
  const [srs, setSrs] = useSrs()
  const [queue, setQueue] = useState(() => (all ? pool : dueCards(pool, srs)))
  const [pos, setPos] = useState(0)
  const [shown, setShown] = useState(false)
  const [done, setDone] = useState(0)
  const card = queue[pos]

  const rate = (value) => {
    setSrs((s) => grade(s, card.id, value))
    setDone((n) => n + 1)
    // „Nie wiem” — ta sama fiszka wraca jeszcze na końcu dzisiejszej serii.
    if (value === 0) setQueue((q) => [...q, card])
    setPos((p) => p + 1)
    setShown(false)
  }

  const more = () => {
    setQueue(pickQuestions(pool, [], EXTRA))
    setPos(0)
    setShown(false)
  }

  if (!card) {
    return (
      <section className="glass glass--accent flashcard flashcard--done">
        <h2 className="flashcard-done-title">{done ? 'Na dziś wszystko' : 'Nic do powtórki na dziś'}</h2>
        <p className="muted">
          {done
            ? `Oceniono ${countLabel(done, CARD_FORMS)}. Fiszki wrócą wtedy, gdy będą zaczynały wylatywać z głowy.`
            : 'Kolejne fiszki pojawią się, gdy przyjdzie ich termin.'}
        </p>
        {pool.length > 0 && (
          <button type="button" className="btn-accent flashcard-show" onClick={more}>
            Powtórz jeszcze {Math.min(EXTRA, pool.length)}
          </button>
        )}
      </section>
    )
  }

  return (
    <section className="glass flashcard" aria-live="polite">
      <p className="flashcard-meta">
        <span>{pos + 1} / {queue.length}{card.kind === 'definicja' ? ' · definicja' : ''}</span>
        <a href={toHash(card.path)} className="flashcard-source">{card.topicTitle}</a>
      </p>
      <h2 className="flashcard-q prose" dangerouslySetInnerHTML={{ __html: safeInline(card.question) }} />
      {shown ? (
        <>
          <div className="flashcard-a prose" dangerouslySetInnerHTML={{ __html: safeInline(card.answer) }} />
          <p className="block-label grade-label">Jak poszło?</p>
          <div className="grade-buttons">
            {GRADES.map((g) => (
              <button key={g.value} type="button" className={`grade-btn grade-${g.value}`} onClick={() => rate(g.value)}>
                <span className="grade-name">{g.label}</span>
                <span className="grade-when">{when(previewInterval(srs, card.id, g.value), g.value)}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <button type="button" className="btn-accent flashcard-show" onClick={() => setShown(true)}>
          Pokaż odpowiedź
        </button>
      )}
    </section>
  )
}

// Podpis pod oceną: kiedy fiszka wróci. „Nie wiem” wraca jeszcze w tej serii.
function when(days, value) {
  if (value === 0) return 'jeszcze dziś'
  return days <= 1 ? 'jutro' : `za ${countLabel(days, DAY_FORMS)}`
}

function GroupPicker({ cards, value }) {
  const groups = useMemo(() => examGroups(cards), [cards])
  return (
    <label className="picker">
      <span className="block-label">Przedmiot</span>
      <select
        className="glass picker-select"
        value={value}
        onChange={(e) => navigate(REVIEW_PATH, e.target.value)}
      >
        <option value="">Wszystkie</option>
        {groups.map((g) => (
          <option key={g.name} value={g.name}>{g.name} ({g.count})</option>
        ))}
      </select>
    </label>
  )
}
