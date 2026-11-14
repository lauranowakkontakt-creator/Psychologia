# Atlas mózgu i zaburzeń psychicznych

Moduł edukacyjny do aplikacji psychologicznej Laury (dla studentów i młodych specjalistów, PL). Interaktywny model 3D mózgu (three.js): obszary i ich funkcje, 17 zaburzeń z kodami ICD-11, mapy efektów ENIGMA, komórki, neuroprzekaźniki, sieci. Moduł jest edukacyjny, nie diagnostyczny (unikamy klasyfikacji jako wyrób medyczny wg EU MDR).

## Język i styl
- Cała treść dla użytkownika po polsku, z polskimi znakami. Liczby z przecinkiem dziesiętnym (−0,14).
- Teksty naturalne, bez nadmuchanych sformułowań i konstrukcji „nie X, tylko Y”.
- Laura woli krótkie, bezpośrednie odpowiedzi.

## Wersja 2 (zmiany)
- Wygląd jak w aplikacji Psycho: motyw `night`/`day` z `?theme=` lub wiadomości `{type:"psycho-theme",theme}` z aplikacji (ekran `#/atlas`, `src/views/AtlasView.jsx`, ramka z `public/atlas/index.html`).
- Tryb 3D i 2D (płaski schemat przekroju pośrodkowego, `renderFlat` w app.js, kształty w tablicy `FLAT`).
- Przekroje (strzałkowy, czołowy, poziomy) z kolorowymi „zaślepkami” (stencil, `addCapSet`), kliknięcie w przekrój wykrywa strukturę (`insideAt`).
- Szlaki neuroprzekaźników (`PATHWAYS` w data.js: da, 5ht, na, ach, glu, gaba) z animowanymi cząsteczkami, świeceniem źródła i barwieniem celów; leki (`DRUGS`) podświetlają szlaki i pokazują mechanizm na rysunku synapsy.
- Sieci: węzły z etykietami i połączeniami; zaznaczenie obszaru pulsuje, kamera leci do widoku odpowiedniego dla obszaru.
- Treści uzupełnione z notatek z wykładów (neurofizjologia, psychiatria): sieci DAN/VAN, obwód Papeza, ciała kolankowate i suteczkowate, neurony lustrzane, komórki Schwanna, lateralizacja kory przedczołowej.
- `src/meaning.js`: `MEANING` (opis „co to znaczy” dla każdej pary zaburzenie:obszar) i `PW_NOTES` (jak zaburzenie wiąże się ze szlakiem). Każda para w `DISORDERS` musi mieć wpis w `MEANING` (pilnuje tego `e2e/atlas.spec.js`).
- Zaznaczenie obszaru to świecąca nakładka (`updateSelOverlay`), a rysowanie jest na żądanie (render tylko przy zmianie), żeby nie obciążać telefonu.
- Wybrane zaburzenie zostaje jako kontekst przy klikaniu obszarów i szlaków; szlaki w panelu zaburzenia pokazują się tylko, gdy `PATHWAYS[].disorders` je wymienia.
- Po zmianach w `src/` zawsze `python3 scripts/build.py` (kopiuje też do `../public/atlas/`).

## Struktura
- `src/template.html` — HTML + CSS (tokeny kolorów w `:root`, jasny i ciemny motyw). Placeholdery `/*DATA*/ /*GEO*/ /*EXTRAS*/ /*APP*/`.
- `src/data.js` — treść: `REGIONS` (id → nazwa, łacina, funkcje, uszkodzenie, chemia), `DISORDERS` (regiony z kierunkiem zmiany i siłą dowodów), `CELLS`, `PATHWAYS`, `NETWORKS`, `SOURCES`.
- `src/app.js` — scena three.js, mapowanie anatomii (`PARCEL`, `REGION_PARCELS`, `SCTX`, `MARKERS`), kolorowanie, wybieranie myszą, panel szczegółów, zakładki.
- `src/extras.js` — rysunek neuronu (SVG), tabela neuroprzekaźników, lista źródeł, eksport JSON, przełączanie zakładek.
- `data/geo.json` — siatki w base64: kora lh/rh (fsaverage5, 10242 wierzchołki/półkulę, etykiety Desikan-Killiany 1–35, sulc), podkorowe sctx_lh/rh (ENIGMA Toolbox; 8 struktur), móżdżek i pień (z szablonu MNI152 + tekstura T1).
- `data/enigma.json` — Cohen's d na obszar dla 8 zaburzeń (mdd, bd, scz, ocd, adhd, asd, an, asp), z ENIGMA Toolbox.
- `dist/index.html` — gotowa, samodzielna strona (~4 MB). Nie edytuj jej ręcznie: zmieniaj `src/` i przebuduj.
- `scripts/` — budowanie i potok danych (patrz niżej).

## Budowanie
```
python3 scripts/build.py      # src + data → dist/index.html
open dist/index.html          # podgląd (three.js ładuje się z cdnjs/jsdelivr, potrzebny internet)
```

## Regeneracja siatek (rzadko potrzebna)
`data/geo.json` i `data/enigma.json` już są gotowe. Żeby je odtworzyć:
```
pip install nibabel nilearn scikit-image scipy numpy matplotlib
git clone --depth 1 https://github.com/MICA-MNI/ENIGMA.git vendor/ENIGMA
python3 scripts/build_cerebellum.py   # móżdżek + pień → data/cs.pkl (+ data/seg_check.png do kontroli)
python3 scripts/build_geo.py          # wszystko → data/geo.json, data/enigma.json
```
Ścieżkę do danych ENIGMA można też podać przez `ENIGMA_DATASETS`.

## Ważne szczegóły
- Układ współrzędnych: MNI (x prawo, y przód, z góra) → three.js przez `toV(x,y,z) = (x, z−10, −(y+18))`.
- Etykiety kory: indeksy w `DK` w app.js (kolejność tabeli kolorów FreeSurfer; 4 = corpuscallosum, 0 = ściana przyśrodkowa). Klucze ENIGMA: `L_<nazwa>`, `R_<nazwa>`; podkorowe `Lhippo`, `Ramyg`, `LLatVent` itd.
- Kolejność struktur sctx (liczby wierzchołków lh): accumbens 867, amygdala 1419, caudate 3012, hippocampus 3784, pallidum 1446, putamen 4003, thalamus 3726, ventricles 7653.
- Małe jądra (VTA, miejsce sinawe, jądra szwu, podwzgórze itp.) to kulki w przybliżonych współrzędnych MNI (`MARKERS`).
- Każdy nowy region w `DISORDERS`/`NETWORKS` musi istnieć w `REGIONS` i mieć reprezentację 3D (parcel, sctx, marker, pień lub móżdżek).
- Twierdzenia naukowe muszą mieć źródło w `SOURCES`. Wielkości efektów przy zaburzeniach bez danych ENIGMA nie wymyślamy.

## Licencje danych
- ENIGMA Toolbox (siatki podkorowe, fsaverage5, statystyki): BSD-3, Larivière i in. 2021, Nature Methods.
- fsaverage5 / atlas Desikan-Killiany: FreeSurfer.
- Szablon MNI152 ICBM 2009 (przez nilearn): wolny do użytku z podaniem źródła (Fonov i in. 2011).
- three.js r128: MIT.
- Nie używać grafik ani modeli z BrainFacts.org (prawa autorskie SfN); wolno tylko linkować.

## Pomysły na dalszą pracę
- Przeniesienie do frameworka aplikacji (np. komponent React z `@react-three/fiber`), dane jako osobny JSON.
- Etykiety tekstowe na modelu 3D, animowane przejścia kamery.
- Mapy ENIGMA dla kolejnych zaburzeń (PTSD, uzależnienia), gdy będą dostępne publiczne statystyki.
- Test na telefonach (wydajność ~200 tys. trójkątów).
