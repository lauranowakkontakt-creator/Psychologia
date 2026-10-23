import { toHash } from '../lib/route.js'
import { Topbar } from '../components/Topbar.jsx'

export function NotFoundView() {
  return (
    <>
      <Topbar backTo="" />
      <header className="page-head">
        <h1 className="title-xl">Nie ma takiej strony</h1>
        <p className="muted page-sub">Możliwe, że notatka zmieniła nazwę albo miejsce.</p>
      </header>
      <p className="error-actions">
        <a className="text-link" href={toHash('')}>Wróć na start</a>
      </p>
    </>
  )
}
