import { toHash } from '../lib/route.js'
import { BackIcon } from './Icon.jsx'

// Nagłówek podstron: okrągły Wstecz po lewej, dowolna akcja po prawej.
export function Topbar({ backTo, right }) {
  return (
    <header className="topbar">
      <a className="icon-btn" href={toHash(backTo)} aria-label="Wstecz">
        <BackIcon />
      </a>
      {right || <span className="topbar-spacer" />}
    </header>
  )
}
