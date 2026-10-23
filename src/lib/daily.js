// „Pojęcie na teraz”: jedna definicja, która zmienia się co kilka godzin.
//
// Wybór zależy tylko od czasu i listy — telefon, komputer i widżet na ekranie
// głównym pokazują w tym samym okienku czasu to samo pojęcie, bez zapisywania czegokolwiek.
// Ta sama funkcja jest wklejana do widżetu Scriptable (scripts/widget.mjs).

export const DAILY_KEY = 'psycho-daily-hours'
export const DAILY_HOURS = [3, 6, 24]

const HOUR = 60 * 60 * 1000

// Numer okienka czasu liczony od lokalnej północy — „raz dziennie” zmienia się o północy.
export function slotNumber(now, hours) {
  const d = new Date(now)
  const localMs = now - d.getTimezoneOffset() * 60 * 1000
  return Math.floor(localMs / (hours * HOUR))
}

export function nextChange(now, hours) {
  const d = new Date(now)
  const offset = d.getTimezoneOffset() * 60 * 1000
  return (slotNumber(now, hours) + 1) * hours * HOUR + offset
}

// Mieszanie numeru okienka, żeby kolejne pojęcia nie szły po kolei z jednej notatki.
export function slotIndex(slot, length) {
  if (!length) return -1
  let h = (slot + 1) * 2654435761
  h = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0
  h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) % length
}

export function pickForNow(items, now = Date.now(), hours = DAILY_HOURS[0], skip = 0) {
  if (!items.length) return null
  return items[(slotIndex(slotNumber(now, hours), items.length) + skip) % items.length]
}
