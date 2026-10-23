// „Ostatnio dodane”: kiedy notatka pojawiła się w zbiorze.
//
// Data pochodzi z historii gita (pierwszy commit z plikiem, z uwzględnieniem
// przeniesień) albo z pola `dodano:` w nagłówku notatki, które ma pierwszeństwo.
// Ten moduł tylko czyta gotowy wynik — samo `git log` uruchamia vite.config.js
// i skrypt wysyłki notatek.

// Wyjście `git log --reverse --name-status -M --format=@%cI -- content`
// -> { 'content/studia/x.md': '2026-10-14T20:03:34+02:00', ... } dla plików, które istnieją teraz.
export function parseGitAdded(output) {
  const added = new Map()
  let date = ''
  for (const line of (output || '').split('\n')) {
    if (line.startsWith('@')) {
      date = line.slice(1).trim()
      continue
    }
    const parts = line.split('\t')
    const status = parts[0]
    if (!status || !date) continue
    if (status === 'A') {
      if (!added.has(parts[1])) added.set(parts[1], date)
    } else if (status.startsWith('R')) {
      // Przeniesiony plik zachowuje datę pierwszego dodania.
      const [, from, to] = parts
      added.set(to, added.get(from) || date)
      added.delete(from)
    } else if (status === 'D') {
      added.delete(parts[1])
    }
  }
  return Object.fromEntries(added)
}

// Najnowsze notatki: po dacie dodania, w obrębie dnia — w kolejności czytania.
export function recentlyAdded(topics, limit = 5) {
  return topics
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.added)
    .sort((a, b) => b.t.added.localeCompare(a.t.added) || a.i - b.i)
    .slice(0, limit)
    .map(({ t }) => t)
}
