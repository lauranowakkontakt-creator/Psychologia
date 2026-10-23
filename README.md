# Psycho — notatki z psychologii

Aplikacja do nauki z własnych notatek ze studiów i kursów psychologii. Działa w przeglądarce
i instaluje się na pulpit telefonu (PWA). Ma wyszukiwarkę bez polskich znaków, fiszki z powtórkami,
egzamin próbny, postęp nauki, mapę powiązań między tematami, zakładki, zaznaczenia i dopiski
oraz motyw dzienny i nocny.

Notatki są prywatne. Wersja publiczna strony prosi o zalogowanie kontem Google i wpuszcza
tylko osoby z listy, a treść pobiera z Firestore. W tym repo jest sam kod i kilka
przykładowych notatek w `przyklad/content/`.

## Uruchomienie z przykładowymi notatkami

```bash
cp -R przyklad/content content
npm install
npm run dev
```

Notatka to plik Markdown w `content/<dział>/<temat>.md`, a układ folderów jest układem aplikacji
(szczegóły w `CLAUDE.md`).

## Testy

```bash
npm run check
```

Lint, testy logiki w Node, sprawdzenie, że do paczki strony nie trafiła żadna notatka,
oraz testy w przeglądarkach (iPhone/WebKit i Android/Chromium) z zasadami telefonu
i dostępności WCAG AA.

## Technologie

React 18, Vite 5, vite-plugin-pwa, Firebase (Authentication, Firestore, Hosting), Playwright.
