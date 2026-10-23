import { useEffect, useState } from 'react'
import { parseHash, toHash } from './lib/route.js'

const NAV_EVENT = 'psycho:navigate'

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    window.addEventListener('popstate', onChange)
    window.addEventListener(NAV_EVENT, onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('popstate', onChange)
      window.removeEventListener(NAV_EVENT, onChange)
    }
  }, [])
  return route
}

// Przejście bez czekania na `hashchange` (które przychodzi asynchronicznie).
// Owinięte we flushSync pozwala jeszcze w tym samym kliknięciu ustawić fokus
// na nowym ekranie — tylko wtedy iPhone otwiera klawiaturę.
export function navigate(path, q) {
  window.history.pushState(null, '', toHash(path, q))
  window.dispatchEvent(new Event(NAV_EVENT))
}
