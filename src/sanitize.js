import DOMPurify from 'dompurify'
import { renderInline, renderMarkdown } from './lib/note.js'

// HTML z Markdowna przechodzi przez DOMPurify. Notatki piszemy sami, ale w wersji
// z Firestore treść przychodzi z sieci — skrypty i atrybuty `on…` nie mają prawa
// się wykonać, nawet gdyby ktoś podmienił dane. Rysunki SVG, klasy i data-* zostają.
export const sanitize = (html) => DOMPurify.sanitize(html, { USE_PROFILES: { html: true, svg: true, svgFilters: true } })

export const safeMarkdown = (md) => sanitize(renderMarkdown(md))
export const safeInline = (md) => sanitize(renderInline(md))
