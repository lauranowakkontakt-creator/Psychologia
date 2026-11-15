import { useEffect, useRef, useState } from 'react'
import { addRecent, BOOKMARKS_KEY, RECENT_KEY, setProgress, TEXT_SIZE_KEY, TEXT_SIZES, textSizeIndex, toggleBookmark } from './lib/prefs.js'
import { markRead, READ_KEY } from './lib/progress.js'
import { SRS_KEY } from './lib/srs.js'
import { HIGHLIGHTS_KEY, NOTES_KEY } from './lib/annotations.js'
import { useStored } from './store.js'

const EMPTY = []
const NONE = {}
const PROGRESS_SAVE_DELAY = 400

// Zapisuje otwarcie tematu (do „Czytaj dalej” i „Ostatnio otwierane”)
// oraz to, jak daleko notatkę przewinięto (też do postępu nauki).
export function useReadingHistory(path) {
  const [, setRecent] = useStored(RECENT_KEY, EMPTY)
  const [, setRead] = useStored(READ_KEY, NONE)

  useEffect(() => {
    setRecent((list) => addRecent(list, path, Date.now()))
  }, [path, setRecent])

  useEffect(() => {
    let timer = null
    const save = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 1
      setRecent((list) => setProgress(list, path, progress))
      setRead((map) => markRead(map, path, progress))
    }
    const onScroll = () => {
      clearTimeout(timer)
      timer = setTimeout(save, PROGRESS_SAVE_DELAY)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    // Krótka notatka mieści się na ekranie bez przewijania — od razu przeczytana.
    const fits = setTimeout(() => {
      if (document.documentElement.scrollHeight <= window.innerHeight + 1) save()
    }, PROGRESS_SAVE_DELAY)
    return () => {
      clearTimeout(timer)
      clearTimeout(fits)
      window.removeEventListener('scroll', onScroll)
    }
  }, [path, setRecent, setRead])
}

export function useRecent() {
  const [recent] = useStored(RECENT_KEY, EMPTY)
  return Array.isArray(recent) ? recent : EMPTY
}

export function useBookmarks() {
  const [list, setList] = useStored(BOOKMARKS_KEY, EMPTY)
  const bookmarks = Array.isArray(list) ? list : EMPTY
  const toggle = (path) => setList((current) => toggleBookmark(current, path))
  return [bookmarks, toggle]
}

// Bieżący czas, który sam się odświeża: po powrocie do aplikacji (na telefonie
// potrafi wisieć w tle całymi dniami) i w chwili `until(now)` — np. gdy zmienia się
// „Pojęcie na teraz” albo o północy przybywa fiszek na dziś.
export function useNow(until) {
  const [now, setNow] = useState(() => Date.now())
  const at = until ? until(now) : 0
  useEffect(() => {
    const tick = () => setNow(Date.now())
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pageshow', tick)
    // Limit setTimeout to ok. 24 dni; +50 ms, żeby na pewno być już po zmianie.
    const delay = at - Date.now() + 50
    const timer = at && delay < 2 ** 31 ? setTimeout(tick, Math.max(delay, 1000)) : null
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pageshow', tick)
      clearTimeout(timer)
    }
  }, [at])
  return now
}

// Rozmiar tekstu notatki: { size, next, cycle } — `cycle` przełącza na kolejny.
export function useTextSize() {
  const [stored, setStored] = useStored(TEXT_SIZE_KEY, 0)
  const index = textSizeIndex(stored)
  const nextIndex = (index + 1) % TEXT_SIZES.length
  return {
    size: TEXT_SIZES[index],
    next: TEXT_SIZES[nextIndex],
    cycle: () => setStored(nextIndex),
  }
}

// Mapy zapisane w localStorage (i synchronizowane): przeczytane, powtórki, dopiski, zaznaczenia.
const useMap = (key) => {
  const [value, setValue] = useStored(key, NONE)
  return [value && typeof value === 'object' && !Array.isArray(value) ? value : NONE, setValue]
}

export const useReadMap = () => useMap(READ_KEY)
export const useSrs = () => useMap(SRS_KEY)
export const useNotes = () => useMap(NOTES_KEY)
export const useHighlights = () => useMap(HIGHLIGHTS_KEY)

// Dział nauki — Studia albo Kursy (pierwszy człon ścieżki). Fiszki, egzamin, postęp,
// mapa i „Pojęcie na teraz” liczą się osobno dla każdego działu. Zostaje na urządzeniu.
export const LEARN_SCOPE_KEY = 'psycho-learn-scope'

export function useLearnScope(sections) {
  const [stored, setStored] = useStored(LEARN_SCOPE_KEY, null)
  const scope = sections.some((s) => s.path === stored) ? stored : sections[0]?.path || ''
  return [scope, setStored]
}

// Skróty klawiszowe na komputerze (fiszki, egzamin): `onKey(klawisz)` zwraca true,
// gdy klawisz obsłużył. Nie działa podczas pisania w polu ani z Ctrl/Alt/Cmd.
export function useKeys(onKey) {
  const handler = useRef(onKey)
  handler.current = onKey
  useEffect(() => {
    const onDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return
      if (e.target.closest?.('input, textarea, select, a, [contenteditable]')) return
      // Spacja i Enter na przycisku z fokusem robią swoje — nie dublujemy kliknięcia.
      if (e.target.closest?.('button') && (e.key === ' ' || e.key === 'Enter')) return
      if (handler.current(e.key)) e.preventDefault()
    }
    window.addEventListener('keydown', onDown)
    return () => window.removeEventListener('keydown', onDown)
  }, [])
}
