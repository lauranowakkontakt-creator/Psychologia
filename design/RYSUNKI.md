# Rysunki SVG w notatkach – wiedza robocza

Zebrane zasady i pułapki z poprawiania wszystkich ilustracji (`<div class="fig ill">`). Czytaj przed
rysowaniem nowego rysunku albo poprawianiem starego. Ogólne zasady treści są w `CLAUDE.md`.

## Szkielet

```html
<div class="fig ill" role="group" aria-label="Krótki opis">
<p class="fig-title">Tytuł rysunku</p>
<svg viewBox="0 0 360 H" role="img" aria-label="Pełny opis tego, co widać – dla czytnika ekranu">
...
</svg>
<p class="fig-note">Jedno zdanie komentarza (opcjonalnie).</p>
</div>
```

- Bez pustych linii w środku bloku (Markdown przerwałby HTML). Pogrubienie tylko `<strong>`.
- Szerokość zawsze 360 (telefon), wysokość H dobrana do treści – bez pustych pasów na dole.
- `id` (np. `clipPath`) muszą być unikalne na stronie – prefiks od notatki: `wdp-mozg`, `kp-mozg`.
- Groty strzałek rysujemy liniami w tej samej ścieżce, nie przez `marker`.

## Klasy (src/styles.css, „Rysunki i ramki w notatkach”)

| klasa | co to | uwagi |
|---|---|---|
| `i-line` | kontur, linia | |
| `i-fill`…`i-fill4` | wypełnienie + obrys (fiolet, niebieski, zieleń, pomarańcz) | **półprzezroczyste** – linia pod spodem prześwituje |
| `i-solid` | pełny akcent, bez obrysu | napis na nim: `class="i-on" font-size="13"` |
| `i-text` | napis 13 px | |
| `i-muted` | napis drugorzędny 12 px | |
| `i-acc` | napis 13 px pogrubiony w akcencie / linia w akcencie | |
| `i-arrow` | linia-strzałka w akcencie | grot dorysowany: `M.. L tip L..` |
| `i-dash` | linia przerywana | odnośniki (leader lines) do podpisów |

## Szerokość napisów (do planowania)

Realnie szerzej, niż się wydaje:

- `i-text` / `i-acc` 13 px: **ok. 7,5–8 px na znak** (pogrubiony `i-acc` bliżej 8).
- `i-muted` 12 px: **ok. 6,5–7 px na znak**.
- Wysokość pola napisu ok. 13–15 px; linia bazowa `y` jest u dołu liter, pole sięga ok. 10 px w górę.

Przykłady: „psychotyczny” ok. 88 px, „II-rzędowa” ok. 66 px, „sekundy–minuty” (12 px) ok. 95 px.

## Zasady układu

1. Napis w ramce: **co najmniej 3 px** wolnego miejsca z każdego boku (lepiej 5+). Jeśli brakuje –
   poszerz ramkę, przesuń sąsiednie albo skróć napis tak, by nadal był wierny treści notatki.
2. Napis nigdy nie stoi na linii ani na krawędzi kształtu – kładziemy go obok linii/strzałki.
3. Podpis części anatomicznej najczęściej **na zewnątrz** z kreską `i-dash` do miejsca (mózg, oko, komórka).
4. Linie łączące kółka/węzły kończą się **na krawędzi** kółka, nie w środku (wypełnienia są
   półprzezroczyste, więc linia przecięłaby cyfrę/napis). Punkty krawędzi liczymy:
   `P = C + (T − C) · r / |T − C|`.
5. Napis w elipsie/pierścieniu: sprawdź szerokość pasa na wysokości napisu na **obu końcach** napisu, nie tylko
   w środku (elipsy się zwężają). Dla warstw zagnieżdżonych (Bronfenbrenner, cebula) dobrze działają elipsy
   wspólnie „stojące” na dole – pasy u góry są wtedy grube.
6. Kontury mózgu: `clipPath` z obrysem półkuli, bruzdy i płaty jako ścieżki przycięte do niego. Przód zawsze
   opisany („przód”/„tył”). Kora ruchowa leży **przed** bruzdą środkową; Broca nad przednią częścią bruzdy
   bocznej, Wernicke za jej tylnym końcem w płacie skroniowym.
7. Kierunek strzałek zgodny z treścią (np. łuk odruchowy: doprowadzająca do rdzenia, odprowadzająca do mięśnia;
   model Wernickego–Geschwinda: Wernicke → pęczek łukowaty → Broca).
8. Legenda zamiast podpisu w tłoku: krótki odcinek linii + napis w rogu (np. „- - - hamowanie”).
9. Krzywe Béziera: zanim położysz napis obok, policz kilka punktów krzywej
   (`B(t) = (1−t)³P0 + 3(1−t)²tP1 + 3(1−t)t²P2 + t³P3`), żeby nie przeciąć jej napisem.

## Sprawdzanie

- `e2e/ilustracje-geometria.js` – reguły (napis poza viewBox, napisy nachodzące na siebie, napis ciasno
  w ramce < 3 px, zasłonięty przez kształt narysowany później, wystający z kształtu, przecięty linią/krawędzią).
  Uwzględnia `clip-path`, pomija `defs`/`clipPath`, a linia pod nieprzezroczystym kształtem (`i-solid`) nie liczy się.
- `e2e/ilustracje.spec.js` – te same reguły w `npm run check` (iPhone/WebKit + Android/Chromium).
- Szybki audyt z listą wszystkich problemów i zrzutami rysunków:

  ```
  npx vite --port 4802 --strictPort          # serwer deweloperski, zmiany widać od razu
  AUDYT_URL=http://localhost:4802/ node scripts/audyt-ilustracji.mjs [fragment-ścieżki] [--zrzuty katalog] [--wszystkie]
  ```

  Fragment ścieżki to zwykły podciąg (nie wyrażenie regularne), np. `neurofizjologia/` albo `zmysly/wzrok`.
  Zrzuty **zawsze obejrzyj** – test nie oceni, czy rysunek jest wierny (kierunek strzałek, położenie struktur,
  czy podpis jednoznacznie wskazuje element).

## Proces pracy

1. `git fetch` (Laura pracuje w kilku sesjach).
2. Audyt → poprawki → audyt na 0 → obejrzenie zrzutów.
3. `npm run clean:mac && npm run lint && npm test`, a przed pushem pełne `npm run check` (robi to hook).
4. Commit kończy się linią `Co-Authored-By`; push z keepalive SSH (hook trwa długo, GitHub zrywa połączenie):

   ```
   git -c core.sshCommand="ssh -F /dev/null -i ~/.ssh/psycho_deploy_ed25519 -o IdentitiesOnly=yes -o ServerAliveInterval=15 -o ServerAliveCountMax=100" push
   ```

   Potem `git status -sb` – gałąź nie może być „ahead”. Nie używać `--no-verify`.
