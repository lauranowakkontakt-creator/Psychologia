import { useMemo } from 'react'
import { useContent } from '../content.jsx'
import { compendiumMap } from '../lib/links.js'
import { findNode } from '../lib/content.js'
import { subjectColor } from '../lib/format.js'
import { toHash } from '../lib/route.js'
import { scopeOf } from '../lib/flashcards.js'
import { useLearnScope } from '../hooks.js'
import { Topbar } from '../components/Topbar.jsx'
import { ScopeSwitch } from '../components/ScopeSwitch.jsx'

// Mapa powiązań: w Studiach — kompendia przekrojowe, w Kursach — moduły kursów.
// Każdy temat z tematami, z którymi się łączy (linki w obie strony).
// Najbardziej „centralne” tematy na górze grupy.
const inMap = (scope) => (t) => (scope === 'studia' ? t.kind === 'Kompendium' || t.path.startsWith('studia/tematy/') : scopeOf(t) === scope)

export function MapView() {
  const { tree, links } = useContent()
  const [scope, setScope] = useLearnScope(tree.sections)
  const groups = useMemo(() => compendiumMap(tree, links, inMap(scope)), [tree, links, scope])
  const titleOf = (path) => findNode(tree, path)?.title || path
  // Kolor kropki = kategoria tematu (nazwa jego sekcji), jak w nagłówkach grup.
  const categoryOf = (path) => findNode(tree, findNode(tree, path)?.sectionPath)?.title || ''

  return (
    <>
      <Topbar backTo="" />
      <header className="page-head">
        <p className="eyebrow">Nauka</p>
        <h1 className="title-xl">Mapa powiązań</h1>
        <p className="muted page-sub">Tematy i to, z czym się łączą. Dotknij, żeby przejść.</p>
      </header>

      <ScopeSwitch sections={tree.sections} value={scope} onChange={setScope} />

      {groups.map((g) => (
        <section key={g.name} className={`home-block map-group subject-${subjectColor(g.name)}`}>
          <h2 className="group-head map-group-head">
            <span className="dot" aria-hidden="true" />
            {g.name}
          </h2>
          {g.items.map((item) => (
            <article key={item.path} className="glass map-node">
              <a className="map-node-title" href={toHash(item.path)}>{item.title}</a>
              {item.linked.length > 0 ? (
                <ul className="map-links" aria-label={`Powiązane z: ${item.title}`}>
                  {item.linked.map((p) => (
                    <li key={p}>
                      <a className={`map-chip subject-${subjectColor(categoryOf(p))}`} href={toHash(p)}>
                        {titleOf(p)}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted map-none">Bez powiązań z innymi tematami</p>
              )}
            </article>
          ))}
        </section>
      ))}
    </>
  )
}
