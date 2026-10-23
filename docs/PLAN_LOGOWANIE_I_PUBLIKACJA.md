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
- `firebase.json` — hosting (Firebase Hosting, darmowy) + reguły.

**Zrobione w konsoli Firebase (2026-10-23):** projekt `psycho-b354b`, logowanie Google, Firestore `(default)`
w `eur3`, aplikacja internetowa (konfiguracja w `.env.firebase`, poza gitem), kolekcja `dozwoleni`, klucz serwisowy
(poza repo). Notatki wysłane do Firestore (`tresc/_spis`, `tresc/p01`…).

Kolejna osoba z dostępem: Firestore -> `dozwoleni` -> *Add document*, ID = adres Gmail **małymi literami**.

**Zostało:**

1. Projekt jest przypięty w `.firebaserc` (`psycho-b354b`) — `firebase-tools use --add` już niepotrzebne.
2. Deploy idzie sam z GitHuba (`.github/workflows/deploy.yml`): po zielonych „Testach” na `main`
   buduje wersję bez notatek i wysyła stronę oraz reguły. Można go też uruchomić ręcznie
   (Actions -> Deploy Firebase -> *Run workflow*). Strona: `https://psycho-b354b.web.app`.
   Raz trzeba dodać sekrety repo (Settings -> Secrets and variables -> Actions -> *New repository secret*):
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_APP_ID` — przepisane z `.env.firebase`,
   - `FIREBASE_SERVICE_ACCOUNT` — cały JSON klucza konta usługi do deployu. Konto: Google Cloud ->
     IAM -> Service Accounts -> *Create* (np. `github-deploy`), role **Firebase Hosting Admin**,
     **Firebase Rules Admin**, **Service Usage Consumer**, potem *Keys -> Add key -> JSON*.
     Nie używaj klucza Admin SDK od `wyslij-notatki` — ma dostęp do wszystkich danych.
   Z Maca nadal działa `npx firebase-tools login` + `npm run deploy:firebase`.
3. Publiczne repo `Psychologia` (sam kod) — patrz niżej.

**Po zmianie notatek:** `GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json npm run wyslij-notatki`.

## Publiczne repo `Psychologia`

- To repo (`Psycho`) zostaje prywatne i jest miejscem pracy: kod + notatki + pełna historia.
- `Psychologia` dostaje sam kod: `npm run publikuj-kod -- <folder z klonem Psychologia>` kopiuje ostatni commit
  bez `content/` i dopisuje `content/` do `.gitignore` klonu. Commit i push robi się w klonie.
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
- **GitHub:** domyślna gałąź `test-dostepu` jest pusta, ale `origin/main` nadal ma wszystkie notatki
  i historię — tego repo **nie** przełączamy na publiczne. Domyślną gałąź warto przestawić z powrotem na `main`
  (GitHub -> Settings -> General -> Default branch), a `test-dostepu` usunąć.
- Reguł Firestore nie da się dziś przetestować lokalnie (emulator wymaga Javy, której nie ma na tym Macu).
  Po instalacji Javy można dopisać testy reguł z `@firebase/rules-unit-testing`.
