import { useMemo, useState } from 'react'
import { useContent } from '../content.jsx'
import { EXAM_SIZES, examGroups, examResult, examVerdict, pickQuestions } from '../lib/exam.js'
import { countLabel } from '../lib/format.js'
import { toHash } from '../lib/route.js'
import { scopeOf } from '../lib/flashcards.js'
import { useLearnScope } from '../hooks.js'
import { ScopeSwitch } from '../components/ScopeSwitch.jsx'
import { safeInline } from '../sanitize.js'
import { Topbar } from '../components/Topbar.jsx'

const QUESTION_FORMS = ['pytanie', 'pytania', 'pytań']

// Tryb egzaminu: wybór przedmiotów i liczby pytań, pytania jedno po drugim,
// samoocena i wynik z listą notatek do powtórzenia. Bez zapisu — to próba, nie fiszki.
export function ExamView() {
  const { tree, cards: allCards } = useContent()
  const [scope, setScope] = useLearnScope(tree.sections)
  const cards = useMemo(() => allCards.filter((c) => scopeOf(c) === scope), [allCards, scope])
  const groups = useMemo(() => examGroups(cards), [cards])
  const [chosen, setChosen] = useState([])
  const changeScope = (next) => {
    setScope(next)
    setChosen([])
  }
  const [size, setSize] = useState(EXAM_SIZES[0])
  const [questions, setQuestions] = useState(null)
  const [answers, setAnswers] = useState({})
  const [pos, setPos] = useState(0)
  const [shown, setShown] = useState(false)

  const available = chosen.length ? groups.filter((g) => chosen.includes(g.name)).reduce((n, g) => n + g.count, 0) : cards.length

  const start = () => {
    setQuestions(pickQuestions(cards, chosen, size))
    setAnswers({})
    setPos(0)
    setShown(false)
  }

  const answer = (knew) => {
    setAnswers((a) => ({ ...a, [questions[pos].id]: knew }))
    setPos((p) => p + 1)
    setShown(false)
  }

  const toggle = (name) => setChosen((list) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name]))

  if (!questions) {
    return (
      <>
        <Topbar backTo="" />
        <header className="page-head">
          <p className="eyebrow">Sprawdź się</p>
          <h1 className="title-xl">Egzamin</h1>
          <p className="muted page-sub">Losowe pytania i definicje z notatek. Odpowiedz w myślach, odsłoń odpowiedź i oceń się szczerze.</p>
        </header>

        <ScopeSwitch sections={tree.sections} value={scope} onChange={changeScope} />

        <section className="home-block">
          <h2 className="block-label" id="exam-size">Liczba pytań</h2>
          <div className="chips" role="group" aria-labelledby="exam-size">
            {EXAM_SIZES.map((n) => (
              <button key={n} type="button" className="chip chip--tap" aria-pressed={size === n} onClick={() => setSize(n)}>{n}</button>
            ))}
          </div>
        </section>

        <section className="home-block">
          <h2 className="block-label" id="exam-groups">Zakres {chosen.length ? `(${chosen.length})` : '— wszystko'}</h2>
          <div className="glass group exam-groups" role="group" aria-labelledby="exam-groups">
            {groups.map((g) => (
              <label key={g.name} className="check-row">
                <input type="checkbox" checked={chosen.includes(g.name)} onChange={() => toggle(g.name)} />
                <span className="check-box" aria-hidden="true" />
                <span className="row-title">{g.name}</span>
                <span className="muted check-count">{g.count}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="sticky-action">
          <button type="button" className="btn-accent wide-btn" onClick={start} disabled={!available}>
            Zacznij: {countLabel(Math.min(size, available), QUESTION_FORMS)}
          </button>
        </div>
      </>
    )
  }

  if (pos >= questions.length) {
    const result = examResult(questions, answers)
    const missedTopics = [...new Map(result.missed.map((q) => [q.path, q])).values()]
    return (
      <>
        <Topbar backTo="" />
        <header className="page-head">
          <p className="eyebrow">Wynik</p>
          <h1 className="title-xl">{result.percent}%</h1>
          <p className="muted page-sub">{result.known} z {countLabel(result.total, QUESTION_FORMS)}. {examVerdict(result.percent)}</p>
        </header>
        <div className="progress exam-progress" role="progressbar" aria-label="Wynik egzaminu" aria-valuemin={0} aria-valuemax={100} aria-valuenow={result.percent}>
          <span style={{ width: `${result.percent}%` }} />
        </div>

        {missedTopics.length > 0 && (
          <section className="home-block">
            <h2 className="block-label">Do powtórki</h2>
            <ul className="mini-list glass">
              {missedTopics.map((q) => (
                <li key={q.path}>
                  <a href={toHash(q.path)}>
                    <span className="mini-text">
                      <span className="mini-title">{q.topicTitle}</span>
                      <span className="mini-sub">{result.missed.filter((m) => m.path === q.path).length} × nie weszło</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="error-actions">
          <button type="button" className="btn-accent wide-btn" onClick={start}>Nowy zestaw</button>
          <button type="button" className="text-link" onClick={() => setQuestions(null)}>Zmień zakres</button>
        </div>
      </>
    )
  }

  const q = questions[pos]
  return (
    <>
      <Topbar backTo="" />
      <header className="page-head">
        <p className="eyebrow">Egzamin · {pos + 1} / {questions.length}</p>
      </header>
      <div className="progress exam-progress" aria-hidden="true">
        <span style={{ width: `${(pos / questions.length) * 100}%` }} />
      </div>
      <section className="glass flashcard" aria-live="polite">
        <p className="flashcard-meta"><span>{q.kind === 'definicja' ? 'Co oznacza…' : q.trail.at(-1)}</span></p>
        <h2 className="flashcard-q prose" dangerouslySetInnerHTML={{ __html: safeInline(q.question) }} />
        {shown ? (
          <>
            <div className="flashcard-a prose" dangerouslySetInnerHTML={{ __html: safeInline(q.answer) }} />
            <div className="grade-buttons grade-buttons--two">
              <button type="button" className="grade-btn grade-0" onClick={() => answer(false)}>
                <span className="grade-name">Nie wiedziałam</span>
              </button>
              <button type="button" className="grade-btn grade-2" onClick={() => answer(true)}>
                <span className="grade-name">Wiedziałam</span>
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="btn-accent flashcard-show" onClick={() => setShown(true)}>Pokaż odpowiedź</button>
        )}
      </section>
    </>
  )
}
