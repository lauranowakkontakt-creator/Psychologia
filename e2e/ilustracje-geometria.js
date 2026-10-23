// Geometria napisów w ilustracjach SVG – funkcja uruchamiana w przeglądarce
// (page.evaluate). Wspólna dla testu e2e/ilustracje.spec.js i skryptu
// scripts/audyt-ilustracji.mjs. Zwraca listę problemów, każdy z numerem
// rysunku, tytułem i opisem.
//
// Sprawdza dla każdego napisu:
//  1. czy mieści się w viewBox,
//  2. czy nie nachodzi na inny napis,
//  3. czy nie wystaje z wypełnionego kształtu (ramki, koła), w którym stoi
//     – część napisu w środku, część na zewnątrz,
//  4. czy nie przecina go żadna linia ani krawędź kształtu (stroke).
export function illustrationProblems() {
  const problems = []
  const SAMPLE_X = 12
  const SAMPLE_Y = 4

  const isVisibleFill = (el) => {
    const cs = getComputedStyle(el)
    return cs.fill && cs.fill !== 'none' && parseFloat(cs.fillOpacity || '1') > 0 && parseFloat(cs.opacity || '1') > 0
  }
  const isOpaqueFill = (el) => {
    const cs = getComputedStyle(el)
    if (!isVisibleFill(el) || parseFloat(cs.fillOpacity || '1') < 1 || parseFloat(cs.opacity || '1') < 1) return false
    return !/rgba\([^)]*,\s*0?\.\d+\)|\/\s*0?\.\d+|transparent/.test(cs.fill)
  }
  const isVisibleStroke = (el) => {
    const cs = getComputedStyle(el)
    return cs.stroke && cs.stroke !== 'none' && parseFloat(cs.strokeWidth || '0') > 0 && parseFloat(cs.strokeOpacity || '1') > 0
  }

  document.querySelectorAll('.ill').forEach((fig, i) => {
    const svg = fig.querySelector('svg')
    if (!svg) return
    const title = fig.querySelector('.fig-title')?.textContent?.trim() || `rysunek ${i + 1}`
    const where = `rysunek ${i + 1} („${title}”)`
    const vb = svg.viewBox.baseVal
    if (!svg.getAttribute('aria-label') || svg.getAttribute('role') !== 'img') {
      problems.push(`${where}: brak role="img" lub aria-label`)
    }
    const texts = [...svg.querySelectorAll('text')].map((t) => ({ text: t.textContent.trim(), box: t.getBBox() }))
    // Kształty w <defs>/<clipPath> nie są rysowane wprost – pomijamy je.
    const shapes = [...svg.querySelectorAll('rect, circle, ellipse, path, polygon, polyline, line')].filter(
      (s) => !s.closest('defs, clipPath, mask, marker, pattern'),
    )
    const pt = svg.createSVGPoint()
    // Kształt przycięty przez clip-path istnieje tylko wewnątrz obszaru przycięcia.
    const clipOf = (s) => {
      const holder = s.closest('[clip-path]')
      const id = holder?.getAttribute('clip-path')?.match(/#([^)]+)/)?.[1]
      return id ? [...(svg.querySelector(`[id="${id}"]`)?.querySelectorAll('rect, circle, ellipse, path, polygon') || [])] : null
    }
    const visibleAt = (s, p) => {
      const clip = clipOf(s)
      return !clip || clip.some((c) => c.isPointInFill(p))
    }

    for (const { text, box } of texts) {
      if (!text) continue
      const out =
        box.x < vb.x - 2 || box.y < vb.y - 2 ||
        box.x + box.width > vb.x + vb.width + 2 || box.y + box.height > vb.y + vb.height + 2
      if (out) problems.push(`${where}: napis „${text}” wystaje poza rysunek`)

      // Punkty próbne wewnątrz prostokąta napisu (z marginesem 1 px). Pionowo
      // bierzemy środkową część – getBBox obejmuje też miejsce na ogonki liter.
      const pts = []
      const nx = Math.max(SAMPLE_X, Math.ceil(box.width / 1.5))
      for (let ix = 0; ix < nx; ix++) {
        for (let iy = 0; iy < SAMPLE_Y; iy++) {
          pts.push([
            box.x + 1 + ((box.width - 2) * ix) / (nx - 1),
            box.y + box.height * 0.25 + (box.height * 0.5 * iy) / (SAMPLE_Y - 1),
          ])
        }
      }
      const textEl = svg.querySelectorAll('text')[texts.findIndex((t) => t.box === box)]
      for (const shape of shapes) {
        if (shape.closest('text')) continue
        // Kształt z wypełnieniem narysowany PO napisie zasłania go.
        if (
          isVisibleFill(shape) && shape.tagName !== 'line' &&
          textEl.compareDocumentPosition(shape) & Node.DOCUMENT_POSITION_FOLLOWING
        ) {
          let covered = 0
          for (const [x, y] of pts) {
            pt.x = x
            pt.y = y
            if (shape.isPointInFill(pt) && visibleAt(shape, pt)) covered++
          }
          if (covered / pts.length > 0.15) {
            problems.push(`${where}: napis „${text}” jest zasłonięty przez <${shape.tagName}> narysowany później`)
            continue
          }
        }
        // Napis w ramce (rect) potrzebuje choć 3 px oddechu od jej boków.
        if (shape.tagName === 'rect' && isVisibleFill(shape)) {
          const sb = shape.getBBox()
          const cx = box.x + box.width / 2
          const cy = box.y + box.height / 2
          const holds = cx > sb.x && cx < sb.x + sb.width && cy > sb.y && cy < sb.y + sb.height
          const small = sb.width < 0.8 * vb.width || sb.height < 0.8 * vb.height
          if (holds && small && (box.x - sb.x < 3 || sb.x + sb.width - (box.x + box.width) < 3)) {
            problems.push(`${where}: napis „${text}” jest ciasno w ramce – za mało miejsca po bokach`)
            continue
          }
        }
        if (isVisibleFill(shape) && shape.tagName !== 'line') {
          let inside = 0
          for (const [x, y] of pts) {
            pt.x = x
            pt.y = y
            if (shape.isPointInFill(pt) && visibleAt(shape, pt)) inside++
          }
          // Częściowo w środku: napis „wychodzi” z ramki/koła.
          if (inside >= 3 && inside / pts.length < 0.92) {
            problems.push(`${where}: napis „${text}” wystaje z kształtu <${shape.tagName}>`)
            continue
          }
        }
        if (isVisibleStroke(shape)) {
          // Linia zasłonięta kształtem narysowanym później (np. kółko na linii
          // łączącej kółka) nie przecina napisu, który stoi na tym kształcie.
          // Większość wypełnień (i-fill…i-fill4) jest półprzezroczysta – linia pod nimi
          // prześwituje. Zasłania tylko pełne, nieprzezroczyste wypełnienie (np. i-solid).
          const later = shapes.slice(shapes.indexOf(shape) + 1).filter((s) => s.tagName !== 'line' && isOpaqueFill(s))
          let hits = 0
          for (const [x, y] of pts) {
            pt.x = x
            pt.y = y
            if (shape.isPointInStroke(pt) && visibleAt(shape, pt) && !later.some((s) => s.isPointInFill(pt) && visibleAt(s, pt))) hits++
          }
          if (hits >= 2) problems.push(`${where}: linia/krawędź <${shape.tagName}> przecina napis „${text}”`)
        }
      }
    }
    for (let a = 0; a < texts.length; a++) {
      for (let b = a + 1; b < texts.length; b++) {
        const p = texts[a].box
        const q = texts[b].box
        const overlapX = Math.min(p.x + p.width, q.x + q.width) - Math.max(p.x, q.x)
        const overlapY = Math.min(p.y + p.height, q.y + q.height) - Math.max(p.y, q.y)
        if (overlapX > 1 && overlapY > 3) {
          problems.push(`${where}: napisy „${texts[a].text}” i „${texts[b].text}” na siebie nachodzą`)
        }
      }
    }
  })
  return problems
}
