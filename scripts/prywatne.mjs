// Fragmenty tylko dla prywatnego repo: w plikach .md wszystko między
//   <!-- prywatne -->  …  <!-- /prywatne -->
// znika przy kopiowaniu do publicznego repo (`npm run publikuj-kod`).
// Tak oznaczamy ścieżki na dysku, nazwy kluczy i opis prywatnego repo.
const BLOCK = /[ \t]*<!--\s*prywatne\s*-->[\s\S]*?<!--\s*\/prywatne\s*-->[ \t]*\n?/g

export function stripPrivate(text) {
  return text.replace(BLOCK, '').replace(/\n{3,}/g, '\n\n')
}

// Niedomknięty znacznik zostawiłby prywatny fragment w publicznym pliku.
export function hasOpenMarker(text) {
  return /<!--\s*\/?prywatne\s*-->/.test(stripPrivate(text))
}
