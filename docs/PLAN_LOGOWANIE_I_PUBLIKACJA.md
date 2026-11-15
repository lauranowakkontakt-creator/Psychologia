# Plan: logowanie, prywatne notatki i publiczne repo

Ustalone z Laurą 2026-10-22: najpierw dopracowujemy wszystko w tym prywatnym repo,
a na końcu za jednym razem zakładamy nowe publiczne repo i wgrywamy notatki do Firestore.
Wybrane: **nowy projekt Firebase** i **logowanie przez Google**.

## Stan

**Zrobione w kodzie** (gałąź `rozbudowa/nauka-i-logowanie`):

- Dwa tryby budowania (alias `@source` w `vite.config.js`):
  - zwykły — jak dotąd, notatki w paczce, bez logowania (podgląd, testy),
  - `npm run build:firebase` — logowanie Google, notatki z Firestore, **w paczce strony nie ma notatek**.
- `firestore.rules` — dostęp tylko dla adresów z kolekcji `dozwoleni`, każdy widzi tylko swoje dane.
- `scripts/wyslij-notatki.mjs` (`npm run wyslij-notatki`) — pakuje notatki w 7 dokumentów po ~900 KB.
- Synchronizacja zakładek, historii, postępu, fiszek, dopisków i zaznaczeń między urządzeniami.
- `npm run test:bez-notatek` — buduje wersję z logowaniem i sprawdza, że nie ma w niej żadnej notatki
  (jest w `npm run check`). `e2e-logowanie/` — test ekranu logowania.
- `firebase.json` — reguły Firestore (`npm run deploy:reguly`).

**Zrobione w konsoli Firebase (2026-10-23):** projekt `psycho-b354b`, logowanie Google, Firestore `(default)`
w `eur3`, aplikacja internetowa (konfiguracja w `.env.firebase`, poza gitem), kolekcja `dozwoleni`, klucz serwisowy
(poza repo). Notatki wysłane do Firestore (`tresc/_spis`, `tresc/p01`…).

Kolejna osoba z dostępem: Firestore -> `dozwoleni` -> *Add document*, ID = adres Gmail **małymi literami**.

**Zostało:**

1. Strona stoi na **GitHub Pages** z publicznego repo `Psychologia`:
   `https://lauranowakkontakt-creator.github.io/Psychologia/`. Buduje ją `.github/workflows/strona.yml`
   po zielonych „Testach” na `main` (albo ręcznie: Actions -> Strona -> *Run workflow*). W paczce nie ma notatek —
   przychodzą z Firestore po zalogowaniu. Raz trzeba:
   - Settings -> Pages -> *Source*: **GitHub Actions**,
   - Settings -> Secrets and variables -> Actions: sekrety `VITE_FIREBASE_API_KEY` i `VITE_FIREBASE_APP_ID`
     (z `.env.firebase`),
   - Firebase -> Authentication -> Settings -> *Authorized domains* -> dodać `lauranowakkontakt-creator.github.io`,
   - wysłać reguły Firestore (raz i po każdej zmianie `firestore.rules`):
     `npx firebase-tools deploy --only firestore:rules --project psycho-b354b`.
2. Firebase Hosting usunięty (2026-11-15) — strona stoi tylko na GitHub Pages.
3. Publiczne repo `Psychologia` (sam kod) — patrz niżej.

**Po zmianie notatek:** `npm run notatka` (szybkie testy treści + wysyłka; klucz w `klucz-serwisowy.json`
w folderze projektu albo w zmiennej `GOOGLE_APPLICATION_CREDENTIALS`).

## Publiczne repo `Psychologia`

- To repo (`Psycho`) zostaje prywatne i jest miejscem pracy: kod + notatki + pełna historia.
- `Psychologia` dostaje sam kod: `npm run publikuj-kod -- <folder z klonem Psychologia>` kopiuje ostatni commit
  bez `content/`, dopisuje `content/` do `.gitignore` klonu i wycina z plików `.md` fragmenty między
  `<!-- prywatne -->` a `<!-- /prywatne -->` (ścieżki na dysku, klucze, opis prywatnego repo — tak je oznaczamy).
  Commit i push robi się w klonie albo od razu: `npm run publikuj-kod -- <klon> --wyslij`.
- Testy w publicznym repo idą na przykładowych notatkach z `przyklad/content/` (ten sam układ działów,
  własne krótkie teksty). GitHub Actions kopiuje je do `content/`, gdy prawdziwych nie ma.
- Klon ma własny klucz SSH (deploy key z prawem zapisu), tak jak `Psycho`.

## Liczby (darmowy plan Spark)

- Notatki: ~5,7 MB (504 pliki) -> 7 paczek + spis — 0,6% z 1 GiB miejsca.
- Pierwsze wejście nowej osoby: 8 odczytów; kolejne: 1 odczyt (spis), paczki z pamięci telefonu.
- Limit: 50 000 odczytów i 20 000 zapisów dziennie, 10 GiB transferu miesięcznie — zapas ogromny.
- Firebase Storage odpada (nowe buckety wymagają planu Blaze) — wystarczy Firestore.

## Uwagi

- `apiKey` Firebase może być w publicznym repo — nie jest tajny, chronią reguły. Klucz **serwisowy** — nigdy.
- Ktoś spoza listy może się zalogować kontem Google, ale zobaczy tylko ekran „Brak dostępu” —
  reguły nie oddadzą mu ani jednej notatki.
- Dodatkowe szyfrowanie AES po naszej stronie nie wnosi wiele: klucz i tak leżałby za tymi samymi regułami.
  Google szyfruje dane na serwerach i w przesyle.
- **Wylogowanie** czyści z urządzenia dane nauki i notatki z pamięci podręcznej (wracają po zalogowaniu);
  inna osoba na tym samym telefonie zaczyna od czystego stanu (`psycho-owner`).
- Reguł Firestore nie da się dziś przetestować lokalnie (emulator wymaga Javy, której nie ma na tym Macu).
  Po instalacji Javy można dopisać testy reguł z `@firebase/rules-unit-testing`.
