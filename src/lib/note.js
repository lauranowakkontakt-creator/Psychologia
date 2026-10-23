import { marked } from 'marked'

// Tabele z co najmniej tyloma kolumnami dostają klasę `table-stack`:
// na telefonie każdy wiersz staje się kafelkiem (pierwsza kolumna – tytuł,
// reszta – „Nagłówek: treść”), zamiast ściskać tekst w wąskich kolumnach.
export const STACK_COLUMNS = 3

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// Etykieta z nagłówka bez formatowania Markdownu.
const plainLabel = (text) => text.replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim()

marked.use({
  renderer: {
    table(token) {
      const stack = token.header.length >= STACK_COLUMNS
      const align = (a) => (a ? ` style="text-align:${a}"` : '')
      const head = token.header
        .map((cell) => `<th${align(cell.align)}>${this.parser.parseInline(cell.tokens)}</th>`)
        .join('')
      const labels = token.header.map((cell) => escapeAttr(plainLabel(cell.text)))
      const body = token.rows
        .map((row) => {
          const cells = row
            .map((cell, i) => {
              const label = stack ? ` data-label="${labels[i] || ''}"` : ''
              return `<td${align(cell.align)}${label}>${this.parser.parseInline(cell.tokens)}</td>`
            })
            .join('')
          return `<tr>${cells}</tr>`
        })
        .join('\n')
      const cls = stack ? ' class="table-stack"' : ''
      return `<table${cls}>\n<thead><tr>${head}</tr></thead>\n<tbody>\n${body}\n</tbody>\n</table>\n`
    },
  },
})

// Pierwszy akapit notatki idzie do ramki „W skrócie”, reszta pod nią.
// Jeśli notatka nie zaczyna się akapitem (np. od nagłówka albo listy),
// ramki nie ma i cała treść jest zwykłym tekstem.
export function splitLead(body) {
  const tokens = marked.lexer(body || '')
  const first = tokens.findIndex((t) => t.type !== 'space')
  if (first === -1 || tokens[first].type !== 'paragraph') return { lead: '', rest: body || '' }
  const rest = tokens.slice(first + 1).map((t) => t.raw).join('')
  return { lead: tokens[first].raw.trim(), rest: rest.trim() }
}

export function renderMarkdown(md) {
  return marked.parse(md || '')
}

export function renderInline(md) {
  return marked.parseInline(md || '')
}
