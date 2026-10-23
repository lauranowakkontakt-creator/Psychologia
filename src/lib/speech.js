// Czytanie notatki na głos — dzielenie tekstu na kawałki dla syntezatora mowy.
//
// Safari na iPhonie potrafi urwać długą wypowiedź w połowie, więc czytamy
// zdaniami (sklejonymi do ~MAX znaków). Dzięki temu da się też pokazać,
// który fragment jest czytany, i wznowić od niego po pauzie.

export const MAX_CHUNK = 220

export function speechChunks(text, max = MAX_CHUNK) {
  const clean = (text || '').replace(/\s+/g, ' ').trim()
  if (!clean) return []
  // Zdanie kończy się kropką, pytajnikiem, wykrzyknikiem albo dwukropkiem.
  const sentences = clean.match(/[^.!?:;]+[.!?:;]+["”»)]*\s*|[^.!?:;]+$/g) || [clean]
  const out = []
  let buf = ''
  for (const s of sentences) {
    const piece = s.trim()
    if (!piece) continue
    if (piece.length > max) {
      if (buf) out.push(buf)
      buf = ''
      out.push(...splitLong(piece, max))
    } else if ((buf + ' ' + piece).trim().length > max) {
      out.push(buf)
      buf = piece
    } else {
      buf = (buf + ' ' + piece).trim()
    }
  }
  if (buf) out.push(buf)
  return out
}

// Bardzo długie zdanie: tniemy po przecinkach, a w ostateczności po spacjach.
function splitLong(sentence, max) {
  const out = []
  let buf = ''
  for (const word of sentence.split(/(?<=,)\s+|\s+/)) {
    if ((buf + ' ' + word).trim().length > max && buf) {
      out.push(buf)
      buf = word
    } else {
      buf = (buf + ' ' + word).trim()
    }
  }
  if (buf) out.push(buf)
  return out
}

// Szybkości czytania przełączane przyciskiem.
export const SPEECH_RATES = [1, 1.25, 1.5, 0.85]
