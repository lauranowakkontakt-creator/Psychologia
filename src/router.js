import { useEffect, useState } from 'react'
import { parseHash, toHash } from './lib/route.js'

const NAV_EVENT = 'psycho:navigate'

// Każdy wpis w historii przeglądarki dostaje numer. Wpis bez numeru jest nowy
// (kliknięty link), wpis z numerem to cofnięcie albo przejście naprzód — wtedy
// ekran wraca do miejsca, w którym był przewinięty (App).
const INDEX = 'psychoIdx'
let lastIndex = -1

function readRoute() {
  const state = window.history.state
  let nav = 'history'
  if (typeof state?.[INDEX] === 'number') {
    lastIndex = state[INDEX]
  } else {
    nav = 'new'
    lastIndex += 1
    try {
      window.history.replaceState({ ...state, [INDEX]: lastIndex }, '')
    } catch {}
  }
  return { ...parseHash(window.location.hash), nav }
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    // Kliknięcie linku zgłasza i `popstate`, i `hashchange` — drugie zdarzenie nic nie zmienia.
    const onChange = () => {
      const next = readRoute()
      setRoute((prev) => (prev.path === next.path && prev.q === next.q ? prev : next))
    }
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
