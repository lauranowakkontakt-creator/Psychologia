import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as source from '@source'

// Logowanie i wczytanie treści.
//
// Tryb lokalny (src/source/local.js): od razu „gość” i notatki z paczki — bez
// ekranu logowania i bez czekania. Tryb Firebase (src/source/firebase.js):
//   loading  -> sprawdzamy, czy ktoś jest zalogowany,
//   signedOut -> ekran logowania,
//   denied   -> zalogowana osoba spoza listy `dozwoleni`,
//   ready    -> notatki wczytane, synchronizacja działa,
//   error    -> nie udało się wczytać notatek (np. pierwszy raz bez internetu).
// Prywatność nie zależy od tego pliku: notatek nie ma w paczce, a Firestore
// oddaje je tylko osobom z listy (firestore.rules). Tu jest tylko interfejs.

const AuthContext = createContext(null)

const initial = source.initialContent
  ? { status: 'ready', user: source.GUEST, content: source.initialContent, error: null }
  : { status: 'loading', user: null, content: null, error: null }

export function AuthProvider({ children }) {
  const [state, setState] = useState(initial)

  useEffect(() => {
    if (source.initialContent) return undefined
    let stopSync = () => {}
    let current = 0
    const stopWatch = source.watchUser(async (user) => {
      const run = ++current
      stopSync()
      stopSync = () => {}
      if (!user) {
        setState({ status: 'signedOut', user: null, content: null, error: null })
        return
      }
      setState((s) => ({ ...s, status: 'loading', user }))
      try {
        if (!(await source.hasAccess(user))) {
          if (run === current) setState({ status: 'denied', user, content: null, error: null })
          return
        }
        const content = await source.loadContent(user)
        if (run !== current) return
        stopSync = source.startSync(user)
        setState({ status: 'ready', user, content, error: null })
      } catch (e) {
        console.warn('Wczytywanie notatek:', e)
        if (run === current) setState({ status: 'error', user, content: null, error: e?.message || String(e) })
      }
    })
    return () => {
      stopWatch()
      stopSync()
    }
  }, [])

  const signIn = useCallback(async () => {
    setState((s) => ({ ...s, error: null }))
    try {
      await source.signIn()
    } catch (e) {
      setState((s) => ({ ...s, error: 'Nie udało się zalogować. Spróbuj jeszcze raz.' }))
      console.warn('Logowanie:', e)
    }
  }, [])

  const value = { ...state, mode: source.MODE, signIn, signOut: source.signOut }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
