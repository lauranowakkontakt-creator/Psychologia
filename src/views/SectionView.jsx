import { countTopics, groupBySubject } from '../lib/content.js'
import { countLabel, subjectColor, TOPIC_FORMS } from '../lib/format.js'
import { parentPath, SEARCH_PATH, toHash } from '../lib/route.js'
import { Topbar } from '../components/Topbar.jsx'
import { SearchIcon } from '../components/Icon.jsx'
import { GroupCard } from '../components/GroupCard.jsx'
import { SectionTile } from '../components/SectionTile.jsx'

// Lista sekcji:
//  - podsekcje (np. kursy) jako kafelki — ich tematy i moduły dopiero po kliknięciu,
//  - tematy tej sekcji w kartach pogrupowanych po `przedmiot:` (bez przedmiotu — karta bez nagłówka).
export function SectionView({ section }) {
  const total = countTopics(section)
  const subtitle = [section.description, total ? countLabel(total, TOPIC_FORMS) : ''].filter(Boolean).join(' · ')
  const groups = groupBySubject(section.topics)

  return (
    <>
      <Topbar
        backTo={parentPath(section.path)}
        right={
          <a className="icon-btn" href={toHash(SEARCH_PATH)} aria-label="Szukaj w notatkach">
            <SearchIcon />
          </a>
        }
      />
      <header className="page-head">
        <h1 className="title-xl">{section.title}</h1>
        {subtitle && <p className="muted page-sub">{subtitle}</p>}
      </header>

      {section.sections.length > 0 && (
        <nav className="section-tiles" aria-label={`${section.title}: działy`}>
          {section.sections.map((s) => <SectionTile key={s.path} section={s} />)}
        </nav>
      )}

      {groups.length > 0 && (
        <div className="groups">
          {groups.map((g) => (
            <GroupCard key={g.name || '-'} name={g.name} color={subjectColor(g.name)} topics={g.topics} />
          ))}
        </div>
      )}

      {!total && !section.sections.length && <p className="muted empty">Tu jeszcze nic nie ma.</p>}
    </>
  )
}
