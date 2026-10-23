# Psycho — notatki z psychologii

Strona-aplikacja (PWA, instalowana na pulpit telefonu) z notatkami Laury: studia i kursy.
React 18 + Vite 5 + vite-plugin-pwa. Laura używa jej głównie na telefonie — sprawdzaj przy 390 px.

## Dodawanie notatek

Treść to pliki Markdown w `content/`. Układ folderów = układ aplikacji, kodu nie trzeba ruszać.

- Nowy temat: plik `content/<sekcja>/<slug>.md`, np. `content/studia/temat-4.md`.
- Nowa sekcja/kurs: folder z plikiem `_sekcja.md`, np. `content/kursy/nowy-kurs/_sekcja.md`.

Nagłówek pliku (wszystkie pola opcjonalne):

```
---
tytul: Teorie przywiązania
kolejnosc: 4
opis: krótki opis pod tytułem
ikona: brain        # tylko w _sekcja.md; dostępne nazwy w src/components/Icon.jsx
licznik: kurs, kursy, kursów   # tylko w _sekcja.md bez własnych tematów — „2 kursy” na starcie
przedmiot: Psychologia poznawcza   # tylko temat; grupuje listę w karty z kolorową kropką
rodzaj: Wykład                     # tylko temat; „Wykład · 14 paź” pod tytułem
data: 2025-10-14                   # tylko temat; format RRRR-MM-DD
---
```

Pierwszy akapit notatki wyświetla się w ramce „W skrócie” — zaczynaj notatkę jednym-dwoma zdaniami streszczenia.

Bez `tytul` tytuł bierze się z nazwy pliku, bez `kolejnosc` — kolejność alfabetyczna (naturalna: 2 przed 10).
Wyszukiwarka indeksuje wszystko sama (z rysunków w HTML bierze sam tekst).

Rysunki, schematy i tabele z materiałów odtwarzamy jako HTML wprost w Markdownie (bez obrazków), klasami
opisanymi w `src/styles.css` („Rysunki i ramki w notatkach”): `.fig` + `.fig-title`/`.fig-note`, `.fig-steps` z `.step`
(fazy, etapy), `.fig-cols` (porównania), `.fig-cards` (kafelki), `.fig-hub` (pojęcie i cechy dookoła), `.fig-flow`
(strzałki w dół), `.callout` (Pamiętaj/Ważne). Blok HTML bez pustych linii w środku, Markdown w nim nie działa
(pogrubienie = `<strong>`). Wzór: `content/kursy/interwencja-kryzysowa/`.

Prawdziwe ilustracje (neuron, mózg, wykresy, schematy) rysujemy jako inline SVG w `<div class="fig ill">`:
`<svg viewBox="0 0 360 H" role="img" aria-label="opis">`. Kolory tylko klasami z motywu: `i-line`, `i-fill`…`i-fill4`,
`i-solid` (+ napis `i-on`), `i-text`, `i-muted`, `i-acc`, `i-arrow`, `i-dash` (opis w `src/styles.css`). Szerokość 360
odpowiada telefonowi, napisy krótkie (13 px). Grotów strzałek nie robimy przez `marker` (powtarzające się id) –
dorysowujemy je liniami. `e2e/ilustracje.spec.js` (reguły w `e2e/ilustracje-geometria.js`) sprawdza, że napisy nie wystają poza
rysunek ani z ramek, nie nachodzą na siebie i nie przecina ich żadna linia. Zanim narysujesz lub poprawisz rysunek, przeczytaj
`design/RYSUNKI.md` (szerokości napisów, zasady układu, audyt `scripts/audyt-ilustracji.mjs` ze zrzutami).
Tabele (także Markdown) zawijają tekst – nie przewijają się w bok; tabela z 3+ kolumnami na telefonie układa się w kafelki
(wiersz = kafelek, pierwsza kolumna to tytuł, reszta „Nagłówek: treść” – `src/lib/note.js`, klasa `table-stack`). Symbole ™, ®, ↔ łapie test emotek (zamiast ↔ – ⇔).

Na starcie są dwa działy: **Studia – psychologia** (`content/studia/`) i **Kursy** (`content/kursy/`). Studia mają dwa poddziały:
`content/studia/przedmioty/<przedmiot>/` – notatki z przedmiotów, i `content/studia/tematy/<kategoria>/` – kompendia przekrojowe
(cała wiedza o jednym temacie ze wszystkich przedmiotów, `rodzaj: Kompendium`, z sekcjami „Gdzie ten temat się pojawia”, „W pigułce”,
„Szybka powtórka”, „Powiązane tematy”, „Źródła z przedmiotów” i linkami `#/studia/...`). Kompendium ma być samowystarczalne:
w tekście nie odsyłamy („zob. temat…”, „opisuje temat…”) – potrzebną wiedzę z innego tematu wpisujemy wprost (krótko),
a linki do innych kompendiów są tylko w „Powiązane tematy”, do notatek z przedmiotów – tylko w „Źródła z przedmiotów”
(tabela „Gdzie ten temat się pojawia” jest bez linków). Stare adresy (`#/studia/<przedmiot>`, `#/tematy/...`) przekierowuje
`legacyPath` w `src/lib/route.js`, a historię i zakładki przepisuje `src/main.jsx`.

Przedmioty: notatki według treści, nie według kolejnych wykładów; większe przedmioty dzielą się na
kategorie (podfoldery z `_sekcja.md`). Bez notatek z pytaniami egzaminacyjnymi – sama teoria.

Notatka z kursu/przedmiotu: ramka „W skrócie” (pierwszy akapit), „W pigułce”, pełne opracowanie, „Słowniczek”
(pojęcia z notatki: `- **Pojęcie** – definicja.`, jedno-dwa zdania, wszystkie ważne terminy), „Szybka powtórka”
(pytania z materiału z odpowiedziami: `1. **Pytanie?** Odpowiedź.`), „Źródła z kursu”. Z „Słowniczka” i „Szybkiej powtórki”
aplikacja sama robi fiszki, egzamin i „Pojęcie na teraz” — trzymaj się tego zapisu. Prosty, naturalny język, polskie cudzysłowy i półpauzy.
Treść parafrazujemy, nie przepisujemy dłuższych cytatów z materiałów.

Projekt leży na dysku exFAT (`/Volumes/Laura_4T/PLIKI_NOWA_SEGREGACJA/PSYCHOLOGIA/Aplikacja`) — macOS dokłada tam pliki-cienie `._nazwa`.
Lint i testy je pomijają, a `npm run check` czyści je na starcie (`npm run clean:mac`, też przy błędach gita).

## Zasady

- **Bez emotek** — w treści i w UI tylko ikony wektorowe (lucide-react). Pilnuje tego `test/no-emoji.test.js`.
- Czysta logika w `src/lib/*.js` (bez Reacta i Vite) — testy ładują ją wprost w Node.
- Wygląd: szablon Laury w `design/` (DESIGN.md, makiety w `design/reference/`). Kolory, czcionki i klasy
  (`.glass`, `.title-xl`, `.btn-accent`…) są w `design/theme.css` — nie wpisuj kolorów na sztywno; brakujące
  zmienne z makiet dopisuj na górze `src/styles.css` dla obu motywów (`night` i `day`).
- Motywy Dzień/Noc: atrybut `data-theme` na `<html>`, ustawiany skryptem w `index.html` przed rysowaniem.
- Stan użytkownika (historia, zakładki, przeczytane, fiszki `psycho-srs`, dopiski, zaznaczenia, motyw, rozmiar tekstu)
  jest w localStorage (`src/store.js`, hooki w `src/hooks.js`). W wersji z logowaniem klucze z `src/lib/sync.js`
  jadą też do Firestore (`uzytkownicy/{uid}/dane/{klucz}`) i łączą się między urządzeniami — nowy klucz do synchronizacji
  = wpis w `SYNCED` + na liście w `firestore.rules`.
- **Dwa tryby** (alias `@source` w `vite.config.js`): zwykły (`npm run dev`, testy) — notatki z `content/` w paczce,
  bez logowania (`src/source/local.js`); `--mode firebase` (`npm run build:firebase`) — logowanie Google, notatki
  z Firestore, w paczce strony nie ma ani jednej notatki (`src/source/firebase.js`). Oba pliki mają to samo API.
  Prywatności pilnują reguły `firestore.rules` (lista `dozwoleni/{email}`), a `npm run test:bez-notatek` sprawdza,
  że do paczki nic nie przeciekło. Notatki wysyła `npm run wyslij-notatki`. Cały plan i kroki do uruchomienia:
  `docs/PLAN_LOGOWANIE_I_PUBLIKACJA.md`. Tego repo nie upubliczniamy (notatki są w historii).
- **Publiczne repo `Psychologia`** ma sam kod: `npm run publikuj-kod -- <klon>` kopiuje ostatni commit bez `content/`.
  Testy idą tam na `przyklad/content/` — przykładowe notatki muszą spełniać to, czego wymagają testy
  (układ działów z `test/content.test.js`, co najmniej 10 fiszek w Studiach, linki między kompendiami, pole `dodano:`).
- Treść notatek idzie do HTML-a przez DOMPurify (`src/sanitize.js`) — nie wstawiaj `renderMarkdown` bez niego.
- Fiszki biorą się same z sekcji „## Szybka powtórka” (pytania) i „## Słowniczek” (definicje) oraz ze zdań
  `**Pojęcie** to …` (`src/lib/flashcards.js`). Nauka (fiszki, egzamin, postęp, mapa, „Pojęcie na teraz”) liczy się
  osobno dla Studiów i Kursów (przełącznik, `useLearnScope`). „Ostatnio dodane” bierze datę z historii gita albo z pola
  `dodano:` w nagłówku.
- Widżet na iPhone'a (Scriptable): `npm run widget -- --icloud` generuje `scripts/widget.mjs` -> „Psycho pojęcie.js”
  w iCloud Drive z definicjami wpisanymi w skrypt. Po nowych notatkach trzeba go wygenerować ponownie.
- **Testy za każdym razem.** Przed końcem pracy i przed commitem: `npm run check` = lint + testy logiki
  (`test/`, Node) + strażnik prywatności (`scripts/sprawdz-paczke.mjs`) + testy aplikacji (`e2e/`, Playwright na zbudowanej
  wersji, iPhone/WebKit + Android/Chromium) + ekran logowania w trybie Firebase (`e2e-logowanie/`).
  Hook `.githooks/pre-push` uruchamia to samo przed każdym pushem, a GitHub Actions (`.github/workflows/testy.yml`) po nim.
  Nowa logika -> test w `test/`; nowy ekran lub zachowanie -> test w `e2e/app.spec.js`.
- Testy e2e czytają prawdziwy `content/` (nie zakładają „Temat 1”) — nowe notatki są sprawdzane automatycznie:
  każda się otwiera, każdy ekran w obu motywach przechodzi zasady telefonu (`e2e/telefon.spec.js`: brak poziomego
  przewijania, cele dotyku ≥ 44 px, pola ≥ 16 px, zero emotek) i dostępności WCAG AA (`e2e/dostepnosc.spec.js`).
- Struktura: `src/lib/` czysta logika, `src/views/` ekrany, `src/components/` klocki, `src/hooks.js` stan,
  `src/content.jsx` drzewo/indeks/fiszki/linki z plików, `src/auth.jsx` logowanie i wczytanie treści, `src/source/` tryby.
  Ekrany nauki: `#/powtorki`, `#/egzamin`, `#/postep`, `#/mapa`, `#/dopiski` (`APP_PATHS` w `src/lib/route.js` —
  folder w `content/` nie może się tak nazywać).

## Git

Repo `git@github.com:lauranowakkontakt-creator/Psycho.git`, osobny deploy key `~/.ssh/psycho_deploy_ed25519`
(ustawiony w `core.sshCommand` tego klonu). Przed pracą `git fetch` — Laura pracuje w kilku sesjach naraz.
