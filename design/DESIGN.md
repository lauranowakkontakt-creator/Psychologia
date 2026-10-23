# Psycho — nowa szata graficzna (dla asystenta w VS Code)

Ten folder opisuje nowy wygląd aplikacji Psycho. Zadanie: przerobić istniejący interfejs tak, żeby wyglądał jak projekty w `reference/`, **bez zmiany logiki, routingu ani danych** (trasy `#/`, `#/studia`, `#/kursy`, `#/studia/<temat>`, `#/szukaj` zostają).

## Pliki

| Plik | Co to jest |
|---|---|
| `theme.css` | Wszystkie kolory, czcionki, szkło i gotowe klasy. Zaimportuj globalnie. |
| `reference/noc.html` | Wzór trybu ciemnego — 3 ekrany: Start, Lista tematów, Notatka. Otwórz w przeglądarce. |
| `reference/dzien.html` | Ten sam układ w trybie jasnym (beż). |
| `reference/ikona.html` | Podgląd ikony aplikacji. |
| `icon-night.svg`, `icon-day.svg` | Ikona aplikacji 1024×1024 (favicon, apple-touch-icon, manifest). |

Pliki w `reference/` mają style inline, bo to makiety. W aplikacji używaj zmiennych i klas z `theme.css`, nie kopiuj kolorów na sztywno.

## Kierunek

- Dwa motywy: **Noc** (prawie czarne tło, półprzezroczyste „szklane” karty) i **Dzień** (ciepły beż, mleczne szklane karty).
- Akcent: **pastelowy fiolet**. Kolory pastelowe, bez różu.
- Za treścią dwie mocno rozmyte plamy koloru (klasa `.app-bg`) — dzięki nim szkło (`backdrop-filter`) jest widoczne.
- Czcionki: **Geist** (interfejs), **Newsreader** (tytuły i treść notatek).

## Przełącznik Dzień / Noc

1. Atrybut `data-theme="night" | "day"` na `<html>`.
2. Domyślnie z systemu: `matchMedia('(prefers-color-scheme: light)')` → `day`, inaczej `night`.
3. Wybór użytkownika zapisuj w `localStorage` pod kluczem `psycho-theme` (owiń w try/catch).
4. Ustaw atrybut jak najwcześniej (skrypt inline w `<head>`), żeby nie było mignięcia złego motywu.
5. Przycisk: segment w prawym górnym rogu ekranu Start — dwie okrągłe ikony słońce/księżyc w szklanej pigułce, aktywna ma `aria-pressed="true"` i tło `--accent-soft`.

## Ekrany

### Nagłówek (wszędzie)
- Start: po lewej logo tekstowe `psycho.` (Geist 700, 19px, kropka w kolorze `--accent-text`), po prawej przełącznik motywu.
- Podstrony: po lewej okrągły szklany przycisk Wstecz (`.icon-btn`), po prawej Szukaj (lista) albo „Aa” (notatka).
- Brak wyśrodkowanego tytułu „Psycho” jak teraz.

### Start (`#/`)
1. Pozdrowienie zależne od pory dnia („Dzień dobry” / „Dobry wieczór”), `.muted`, 14px.
2. Tytuł `.title-xl`: `Twoje <em>notatki</em>`.
3. Pole wyszukiwania — szklane, 48px wysokości, lupa po lewej. Kliknięcie/wpisanie prowadzi do `#/szukaj`.
4. Dwie szklane karty w siatce 2 kolumn: **Studia** i **Kursy**. Ikona w kółku 42px z tłem `--accent-soft`, nazwa 17px/600, pod nią liczba tematów `.muted`.
5. „Czytaj dalej” — karta `.glass.glass--accent` z ostatnio otwartym tematem: przedmiot (12px muted), tytuł (Newsreader 23px), pasek `.progress` (jeśli nie śledzimy postępu, pasek pomiń).
6. „Ostatnio otwierane” — 2–3 wiersze: kolorowa kropka przedmiotu, tytuł, czas.

### Lista tematów (`#/studia`, `#/kursy`)
1. Tytuł `.title-xl` (np. „Studia”) + podtytuł `.muted`.
2. Rząd `.chip` do filtrowania (np. Wszystkie / Wykłady / Ćwiczenia) — tylko jeśli dane to wspierają, inaczej pomiń.
3. Tematy pogrupowane w szklane karty, jedna karta na przedmiot/grupę. Nagłówek grupy: kropka `--subject-N` + nazwa 13px/500. Wiersze: tytuł 16px/500, pod nim data `.muted` 13px, strzałka `›` po prawej; separator `--line`.
4. Jeśli dane nie mają przedmiotów — jedna karta ze wszystkimi tematami.

### Notatka (`#/studia/<temat>`)
1. `.eyebrow`: „Przedmiot · numer”.
2. Tytuł: Newsreader 38px/400.
3. Meta `.muted` 13px (rodzaj zajęć, data, czas czytania jeśli jest).
4. Pierwszy akapit notatki jako ramka „W skrócie”: `.glass.glass--accent`, etykieta 11px uppercase w `--accent-text`, tekst `.prose`.
5. Reszta treści `.prose` (Newsreader 17px). Nagłówki h2 w Geist 16px/600. Listy: numer 12px w `--accent-text` + tekst.
6. Na dole pływający szklany pasek `.glass--bar`: przycisk Poprzedni (strzałka), zakładka, i duży `.btn-accent` „Następny temat →”. Pasek nie może zasłaniać ostatniego akapitu (dodaj padding-bottom do treści).

### Szukaj (`#/szukaj`)
Ten sam nagłówek co podstrony, szklane pole wyszukiwania na górze, wyniki jako wiersze jak na liście tematów.

## Zasady
- Maks. szerokość treści ~560px, wyśrodkowana; na telefonie marginesy 20–24px.
- Każdy klikalny element min. 44×44px. Prawdziwe `<button>` / `<a>`, przyciski z samą ikoną mają `aria-label`.
- Tekst w akcencie zawsze `--accent-text` (w Dniu to ciemniejszy fiolet — pastel na beżu byłby nieczytelny).
- Ikony: cienkie liniowe SVG (stroke 1.6–1.8), bez emoji.
- Ikona aplikacji: `icon-night.svg` jako favicon i `apple-touch-icon` (wyeksportuj PNG 180/192/512 jeśli jest manifest).

## Gotowy prompt do wklejenia w VS Code

> Przeczytaj `design/DESIGN.md` i obejrzyj `design/reference/noc.html` oraz `design/reference/dzien.html`. Zaimportuj `design/theme.css` globalnie i przerób komponenty aplikacji tak, żeby wyglądały jak te makiety, z przełącznikiem motywu Dzień/Noc opisanym w DESIGN.md. Nie zmieniaj routingu, danych ani logiki. Ustaw `design/icon-night.svg` jako favicon. Pokaż mi listę zmienionych plików.
