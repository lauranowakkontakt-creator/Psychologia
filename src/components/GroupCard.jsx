import { toHash } from '../lib/route.js'
import { TopicRow, topicMeta } from './TopicRow.jsx'

// Szklana karta z grupą tematów jednego przedmiotu. Nagłówek — kolorowa
// kropka i nazwa — tylko gdy grupa ma nazwę.
export function GroupCard({ name, color, topics }) {
  return (
    <section className={`glass group subject-${color}`} aria-label={name || undefined}>
      {name && (
        <h2 className="group-head">
          <span className="dot" aria-hidden="true" />
          {name}
        </h2>
      )}
      {topics.map((t) => (
        <TopicRow key={t.path} href={toHash(t.path)} title={t.title} meta={topicMeta(t)} />
      ))}
    </section>
  )
}
