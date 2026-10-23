// Źródło treści „lokalne”: notatki z folderu content/ wbudowane w paczkę strony.
//
// Tak działa podgląd (`npm run dev`), testy i obecna prywatna wersja.
// Wersja publiczna (`--mode firebase`) dostaje zamiast tego src/source/firebase.js —
// wybiera to alias `@source` w vite.config.js, więc tych plików nie ma wtedy w paczce.
// Oba pliki mają to samo API.
import added from 'virtual:psycho-added'

export const MODE = 'local'

// Vite wczytuje przy budowaniu wszystkie pliki .md z `content/`.
const files = import.meta.glob('/content/**/*.md', { query: '?raw', import: 'default', eager: true })

// Treść dostępna od razu, bez czekania (w trybie Firebase — null).
export const initialContent = { files, added }

export const GUEST = { name: 'Gość', guest: true }

// Bez logowania: od razu „gość” z pełnym dostępem.
export function watchUser(callback) {
  callback(GUEST)
  return () => {}
}

export async function hasAccess() {
  return true
}

export async function loadContent() {
  return initialContent
}

export async function signIn() {}
export async function signOut() {}

// Dane zostają tylko w tej przeglądarce.
export function startSync() {
  return () => {}
}
