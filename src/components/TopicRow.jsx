import { formatDate } from '../lib/format.js'
import { ChevronIcon } from './Icon.jsx'

// Podpis pod tytułem tematu: „Wykład · 14 paź”, a bez tych pól — opis tematu.
export function topicMeta(topic) {
  return [topic.kind, formatDate(topic.date)].filter(Boolean).join(' · ') || topic.description
}

// Wiersz w szklanej karcie: tytuł, podpis, opcjonalna treść (np. fragment wyniku), strzałka.
export function TopicRow({ href, title, meta, children }) {
  return (
    <a className="row" href={href}>
      <span className="row-text">
        <span className="row-title">{title}</span>
        {meta && <span className="row-meta">{meta}</span>}
        {children}
      </span>
      <ChevronIcon className="row-chevron" />
    </a>
  )
}
