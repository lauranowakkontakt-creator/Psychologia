import { useCallback, useEffect, useRef, useState } from 'react'

// Ustawienia tej przeglądarki (motyw, rozmiar tekstu, historia, zakładki).
// localStorage bywa niedostępny (tryb prywatny, zablokowane dane) — wtedy
// appka działa normalnie, tylko nie pamięta wyboru po zamknięciu.

export function readStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStored(key, value) {
  try {
    if (value === undefined) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// Jednorazowo przepisuje zapisane adresy, np. po przeniesieniu notatek.
export function migrateStored(key, migrate) {
  const current = readStored(key, undefined)
  if (current === undefined) return
  const next = migrate(current)
  if (next !== current) writeStored(key, next)
}

const listeners = new Map()
const writeListeners = new Set()

function notify(key, value) {
  for (const fn of listeners.get(key) || []) fn(value)
}

// Zmiany zrobione w aplikacji (nie te, które przyszły z chmury) — słucha ich
// synchronizacja, żeby wysłać je na inne urządzenia.
export function subscribeWrites(fn) {
  writeListeners.add(fn)
  return () => writeListeners.delete(fn)
}

// Wartość z innego urządzenia: zapis i odświeżenie ekranów, bez odsyłania z powrotem.
export function writeFromSync(key, value) {
  writeStored(key, value)
  notify(key, value)
}

// Stan zapisywany w localStorage i wspólny dla wszystkich komponentów,
// które używają tego samego klucza (zakładka dodana w notatce od razu
// widać na starcie).
export function useStored(key, fallback) {
  const [value, setValue] = useState(() => readStored(key, fallback))
  // Wartość domyślna z pierwszego renderu — żeby `update` się nie zmieniał,
  // gdy ktoś poda nową tablicę [] przy każdym renderze.
  const fallbackRef = useRef(fallback)

  useEffect(() => {
    const set = listeners.get(key) || new Set()
    set.add(setValue)
    listeners.set(key, set)
    return () => set.delete(setValue)
  }, [key])

  const update = useCallback(
    (next) => {
      const current = readStored(key, fallbackRef.current)
      const resolved = typeof next === 'function' ? next(current) : next
      if (resolved === current) return
      writeStored(key, resolved)
      notify(key, resolved)
      for (const fn of writeListeners) fn(key, resolved)
    },
    [key],
  )

  return [value, update]
}
