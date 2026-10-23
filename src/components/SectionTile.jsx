import { countTopics } from '../lib/content.js'
import { countLabel, subjectColor, TOPIC_FORMS } from '../lib/format.js'
import { toHash } from '../lib/route.js'
import { ChevronIcon, Icon } from './Icon.jsx'

// Kafelek podsekcji (np. kursu) na liście: ikona w kolorze kursu, nazwa,
// opis i liczba tematów. Tematy widać dopiero po wejściu w kafelek.
// Kolor jest ten sam co kropka kursu na starcie (subjectColor nazwy).
export function SectionTile({ section }) {
  return (
    <a className={`glass section-tile subject-${subjectColor(section.title)}`} href={toHash(section.path)}>
      <span className="section-tile-icon"><Icon name={section.icon} /></span>
      <span className="section-tile-text">
        <span className="section-tile-title">{section.title}</span>
        {section.description && <span className="section-tile-desc">{section.description}</span>}
        <span className="section-tile-count">{countLabel(countTopics(section), TOPIC_FORMS)}</span>
      </span>
      <ChevronIcon className="row-chevron" />
    </a>
  )
}
