const REGIONS = {
  // ===== WIDOK BOCZNY: płaty =====
  frontal: {
    name: "Płat czołowy", latin: "Lobus frontalis", group: "Płaty kory",
    functions: ["Planowanie, podejmowanie decyzji, kontrola hamowania (funkcje wykonawcze)", "Pamięć robocza", "Ruch dowolny (kora ruchowa i przedruchowa)", "Mowa ekspresyjna (ośrodek Broki, zwykle lewa półkula)", "Regulacja emocji i zachowań społecznych, osobowość", "Asymetria: lewa kora przedczołowa wiąże się ze zbliżaniem się i optymizmem, prawa z wycofaniem i lękiem (model Davidsona)"],
    lesion: "Odhamowanie, impulsywność, apatia, perseweracje, trudność w planowaniu (zespół czołowy; klasyczny przypadek Phineasa Gage'a).",
    chem: "Silne unerwienie dopaminergiczne (szlak mezokortykalny), noradrenergiczne i serotoninergiczne."
  },
  parietal: {
    name: "Płat ciemieniowy", latin: "Lobus parietalis", group: "Płaty kory",
    functions: ["Czucie somatyczne: dotyk, ból, temperatura, czucie głębokie", "Orientacja przestrzenna i integracja zmysłów", "Uwaga przestrzenna (zwłaszcza prawa półkula)", "Liczenie, czytanie i pisanie (zakręt kątowy i nadbrzeżny)"],
    lesion: "Zaniedbywanie połowicze stronnej przestrzeni (zwykle po uszkodzeniu prawej półkuli), apraksja, zespół Gerstmanna (lewa).",
    chem: "Głównie glutaminian/GABA; modulacja noradrenergiczna uwagi."
  },
  temporal: {
    name: "Płat skroniowy", latin: "Lobus temporalis", group: "Płaty kory",
    functions: ["Słyszenie (pierwszorzędowa kora słuchowa w zakręcie Heschla)", "Rozumienie mowy (ośrodek Wernickego, zwykle lewa)", "Rozpoznawanie obiektów i twarzy (zakręt wrzecionowaty)", "Pamięć deklaratywna (przyśrodkowy płat skroniowy z hipokampem)", "Przetwarzanie emocji (ciało migdałowate leży w jego głębi)"],
    lesion: "Afazja czuciowa, prozopagnozja, zaburzenia pamięci; padaczka skroniowa bywa źródłem objawów psychopatologicznych.",
    chem: "Hipokamp i ciało migdałowate: bogate unerwienie serotoninergiczne, noradrenergiczne i cholinergiczne."
  },
  occipital: {
    name: "Płat potyliczny", latin: "Lobus occipitalis", group: "Płaty kory",
    functions: ["Pierwszorzędowa kora wzrokowa (V1) wokół bruzdy ostrogowej", "Analiza koloru, kształtu, ruchu (V2–V5)", "Początek drogi „co” (brzusznej) i „gdzie” (grzbietowej)"],
    lesion: "Ubytki pola widzenia, ślepota korowa, agnozje wzrokowe; halucynacje wzrokowe przy podrażnieniu.",
    chem: "Glutaminian/GABA; receptory 5-HT2A w korze wzrokowej są celem psychodelików."
  },
  cerebellum: {
    name: "Móżdżek", latin: "Cerebellum", group: "Tyłomózgowie",
    functions: ["Koordynacja ruchów, równowaga, napięcie mięśni", "Uczenie się ruchowe, timing", "Funkcje poznawcze i afektywne (pętle z korą przedczołową)"],
    lesion: "Ataksja, dysmetria, drżenie zamiarowe; poznawczo-afektywny zespół móżdżkowy (Schmahmanna): spłaszczenie afektu, zaburzenia funkcji wykonawczych.",
    chem: "Komórki Purkinjego (GABA) to jedyne wyjście z kory móżdżku; komórki ziarniste (glutaminian) to najliczniejsze neurony mózgu."
  },
  // ===== WIDOK BOCZNY: obszary szczegółowe =====
  motor: {
    name: "Pierwszorzędowa kora ruchowa", latin: "Gyrus precentralis (BA4)", group: "Kora czołowa",
    functions: ["Wykonanie ruchów dowolnych po przeciwnej stronie ciała", "Mapa ciała (homunkulus ruchowy)"],
    lesion: "Niedowład/porażenie połowicze po stronie przeciwnej.",
    chem: "Komórki piramidowe Betza (warstwa V) dają drogę korowo-rdzeniową."
  },
  somato: {
    name: "Kora somatosensoryczna", latin: "Gyrus postcentralis (BA1–3)", group: "Kora ciemieniowa",
    functions: ["Odbiór dotyku, bólu, temperatury, czucia ułożenia", "Mapa ciała (homunkulus czuciowy)"],
    lesion: "Zaburzenia czucia po stronie przeciwnej, astereognozja.",
    chem: "Wejście z wzgórza (jądro brzuszne tylno-boczne)."
  },
  dlpfc: {
    name: "Grzbietowo-boczna kora przedczołowa (DLPFC)", latin: "Cortex praefrontalis dorsolateralis (BA9/46)", group: "Kora przedczołowa",
    functions: ["Pamięć robocza", "Elastyczność poznawcza, planowanie", "Odgórna (poznawcza) regulacja emocji, np. przeramowanie", "Węzeł sieci wykonawczej (CEN)", "Najdłużej dojrzewa: do ok. 25. roku życia"],
    lesion: "Zespół dysegzekutywny: trudności z planowaniem, zmianą strategii, apatia.",
    chem: "Optimum dopaminowe (receptor D1) i noradrenalinowe (α2A) dla pamięci roboczej; cel rTMS w depresji."
  },
  ofc: {
    name: "Kora oczodołowo-czołowa (OFC)", latin: "Cortex orbitofrontalis", group: "Kora przedczołowa",
    functions: ["Ocena wartości nagrody i kary", "Odwracanie wyuczonych skojarzeń, elastyczność zachowania", "Zachowania społeczne, empatia, kontrola impulsów"],
    lesion: "Odhamowanie, nieadekwatność społeczna, ryzykowne decyzje (pacjent EVR, Damasio).",
    chem: "Silne wejście dopaminowe i serotoninowe; węzeł pętli CSTC w OCD."
  },
  broca: {
    name: "Ośrodek Broki", latin: "Gyrus frontalis inferior, pars opercularis/triangularis (BA44/45)", group: "Kora czołowa",
    functions: ["Produkcja mowy i składnia", "Planowanie artykulacji", "Także hamowanie odpowiedzi (zwłaszcza prawy zakręt czołowy dolny)"],
    lesion: "Afazja ruchowa (Broki): mowa niepłynna, „telegraficzna”, rozumienie względnie zachowane.",
    chem: "—"
  },
  wernicke: {
    name: "Ośrodek Wernickego", latin: "Gyrus temporalis superior, pars posterior (BA22)", group: "Kora skroniowa",
    functions: ["Rozumienie mowy", "Łączenie dźwięku słowa ze znaczeniem"],
    lesion: "Afazja czuciowa: płynna, ale „pusta” mowa, parafazje, słabe rozumienie.",
    chem: "Zwiększona aktywność tej okolicy wiąże się z halucynacjami słuchowymi w schizofrenii."
  },
  a1: {
    name: "Kora słuchowa", latin: "Gyri temporales transversi (Heschla, BA41/42)", group: "Kora skroniowa",
    functions: ["Pierwszorzędowa analiza dźwięku (mapa tonotopowa)"],
    lesion: "Głuchota korowa (obustronnie), agnozja słuchowa.",
    chem: "—"
  },
  v1: {
    name: "Pierwszorzędowa kora wzrokowa (V1)", latin: "Cortex striatus (BA17)", group: "Kora potyliczna",
    functions: ["Pierwsze korowe przetwarzanie obrazu z siatkówki (przez ciało kolankowate boczne)", "Mapa retinotopowa"],
    lesion: "Ubytki w polu widzenia (niedowidzenie połowicze).",
    chem: "—"
  },
  insula: {
    name: "Wyspa", latin: "Insula (Reili)", group: "Kora (schowana w bruździe bocznej)",
    functions: ["Interocepcja: odczuwanie stanu ciała (tętno, głód, ból)", "Świadomość emocji, wstręt", "Węzeł sieci istotności (salience network) razem z dACC", "Głód substancji (craving)"],
    lesion: "Po uszkodzeniu bywa nagła utrata chęci palenia (Naqvi i in., 2007); zaburzenia rozpoznawania wstrętu.",
    chem: "Zawiera neurony von Economo (przednia wyspa)."
  },
  tpj: {
    name: "Złącze skroniowo-ciemieniowe / zakręt kątowy", latin: "Junctio temporoparietalis, gyrus angularis (BA39)", group: "Kora ciemieniowa",
    functions: ["Teoria umysłu: przypisywanie przekonań innym", "Rozróżnianie siebie i innych, poczucie umiejscowienia w ciele", "Czytanie, semantyka, liczenie", "Węzeł sieci domyślnej (DMN)"],
    lesion: "Aleksja z agrafią; stymulacja elektryczna potrafi wywołać doświadczenie „poza ciałem”.",
    chem: "—"
  },
  // ===== PRZEKRÓJ POŚRODKOWY =====
  mpfc: {
    name: "Przyśrodkowa / brzuszno-przyśrodkowa kora przedczołowa (mPFC / vmPFC)", latin: "Cortex praefrontalis medialis", group: "Kora przedczołowa",
    functions: ["Myślenie o sobie, wartościowanie, sumienie", "Hamowanie ciała migdałowatego i wygaszanie strachu (vmPFC)", "Węzeł sieci domyślnej (DMN)", "Intuicyjne decyzje oparte na emocjach (hipoteza markerów somatycznych)"],
    lesion: "Zaburzone decyzje społeczne i moralne, płaskie przewidywanie konsekwencji, „nabyta socjopatia”.",
    chem: "Wejścia z hipokampu, ciała migdałowatego, jądra przyśrodkowo-grzbietowego wzgórza."
  },
  sgacc: {
    name: "Podkolanowa kora zakrętu obręczy (sgACC, BA25)", latin: "Cortex cingularis subgenualis", group: "Układ limbiczny / kora przedczołowa",
    functions: ["Regulacja nastroju i reakcji autonomicznych", "Łączy korę przedczołową z podwzgórzem i pniem"],
    lesion: "—",
    chem: "Bogata w transporter serotoniny; cel głębokiej stymulacji mózgu w lekoopornej depresji (Mayberg i in., 2005)."
  },
  acc: {
    name: "Przednia kora zakrętu obręczy (ACC)", latin: "Cortex cingularis anterior", group: "Układ limbiczny",
    functions: ["Wykrywanie konfliktów i błędów (dACC)", "Ból emocjonalny i społeczny (odrzucenie)", "Motywacja, wysiłek", "Węzeł sieci istotności (dACC)", "Regulacja emocji (część dziobowa)", "Okolica podkolanowa (pole 25) bywa nazywana „przełącznikiem depresji”"],
    lesion: "Mutyzm akinetyczny, apatia; cingulotomia była stosowana w opornym OCD i bólu.",
    chem: "Neurony von Economo; wysoka gęstość receptorów opioidowych."
  },
  pcc: {
    name: "Tylny zakręt obręczy i przedklinek (PCC / precuneus)", latin: "Cortex cingularis posterior, praecuneus", group: "Kora przyśrodkowa",
    functions: ["Centralny węzeł sieci domyślnej (DMN)", "Pamięć autobiograficzna, błądzenie myślami", "Samoświadomość, wyobrażanie sobie"],
    lesion: "Jedna z pierwszych okolic z obniżonym metabolizmem w chorobie Alzheimera.",
    chem: "—"
  },
  cc: {
    name: "Ciało modzelowate", latin: "Corpus callosum", group: "Istota biała",
    functions: ["Łączy obie półkule (~200 mln aksonów)", "Wymiana informacji ruchowej, czuciowej, poznawczej między półkulami"],
    lesion: "Po przecięciu (kallozotomia) zespół rozszczepionego mózgu (Sperry, Gazzaniga).",
    chem: "Zbudowane z mielinizowanych aksonów; mielinę tworzą oligodendrocyty."
  },
  thalamus: {
    name: "Wzgórze", latin: "Thalamus", group: "Międzymózgowie",
    functions: ["Stacja przekaźnikowa i filtr dla prawie wszystkich zmysłów (poza węchem) w drodze do kory", "Uwaga, czuwanie, rytm snu", "Węzeł pętli korowo-prążkowiowo-wzgórzowych (CSTC)", "Ciało kolankowate boczne przekazuje wzrok, przyśrodkowe słuch", "Jedyny zmysł, który omija wzgórze w drodze do kory, to węch"],
    lesion: "Zaburzenia czucia, ból wzgórzowy, amnezja (jądra przednie), zaburzenia świadomości.",
    chem: "Neurony przekaźnikowe (glutaminian); jądro siatkowate wzgórza (GABA) bramkuje przepływ informacji do kory."
  },
  hypothalamus: {
    name: "Podwzgórze", latin: "Hypothalamus", group: "Międzymózgowie",
    functions: ["Homeostaza: głód, pragnienie, temperatura", "Oś stresu HPA: wydziela CRH", "Rytm dobowy (jądro nadskrzyżowaniowe)", "Zachowania seksualne, agresja, sen (oreksyna)"],
    lesion: "Zaburzenia łaknienia, termoregulacji, snu; narkolepsja przy utracie neuronów oreksynowych.",
    chem: "Oksytocyna, wazopresyna, CRH, oreksyna, histamina (jądro guzowo-suteczkowe)."
  },
  pituitary: {
    name: "Przysadka", latin: "Hypophysis", group: "Gruczoł wydzielania wewnętrznego",
    functions: ["Pod kontrolą podwzgórza wydziela ACTH (stres), TSH, prolaktynę, hormony płciowe i wzrostu", "Część tylna uwalnia oksytocynę i wazopresynę"],
    lesion: "Zaburzenia hormonalne; hiperprolaktynemia jako efekt uboczny leków blokujących D2.",
    chem: "Dopamina z podwzgórza hamuje wydzielanie prolaktyny (szlak guzkowo-lejkowy)."
  },
  pallidum: {
    name: "Gałka blada", latin: "Globus pallidus", group: "Jądra podstawy",
    functions: ["Główne wyjście jąder podstawy do wzgórza", "Hamowanie i „przepuszczanie” zaplanowanych ruchów i działań", "Część brzuszna: motywacja, nagroda", "Razem ze skorupą tworzy jądro soczewkowate"],
    lesion: "Zaburzenia ruchowe, apatia (zespół „utraty autoaktywacji psychicznej” po obustronnym uszkodzeniu).",
    chem: "Neurony GABA; cel głębokiej stymulacji mózgu w dystonii i chorobie Parkinsona."
  },
  ventricles: {
    name: "Komory boczne", latin: "Ventriculi laterales", group: "Układ komorowy",
    functions: ["Wypełnione płynem mózgowo-rdzeniowym, który chroni mózg i usuwa produkty przemiany materii", "Splot naczyniówkowy produkuje płyn"],
    lesion: "Poszerzenie komór to pośredni znak ubytku tkanki wokół; jeden z najstarszych wyników w badaniach schizofrenii (Johnstone i in., 1976).",
    chem: "—"
  },
  striatum: {
    name: "Prążkowie (jądro ogoniaste, skorupa)", latin: "Striatum: nucleus caudatus, putamen", group: "Jądra podstawy",
    functions: ["Wybór i inicjowanie działań, nawyki", "Uczenie się przez nagrodę (sygnał błędu przewidywania)", "Jądro ogoniaste: pętle poznawcze z korą przedczołową i OFC", "Skorupa: pętla ruchowa"],
    lesion: "Choroba Huntingtona (zanik jądra ogoniastego), zaburzenia ruchowe, tiki; zmiany psychiatryczne (depresja, OCD-podobne).",
    chem: "95% neuronów to średnie kolczaste neurony GABA (MSN) z receptorami D1 (droga bezpośrednia) lub D2 (pośrednia)."
  },
  nacc: {
    name: "Jądro półleżące", latin: "Nucleus accumbens (prążkowie brzuszne)", group: "Jądra podstawy / układ nagrody",
    functions: ["„Chcenie”: motywacja i nadawanie bodźcom wagi zachęty", "Przyjemność (gorące punkty opioidowe)", "Cel wszystkich substancji uzależniających (wzrost dopaminy)"],
    lesion: "Anhedonia motywacyjna; cel głębokiej stymulacji w uzależnieniach i OCD (eksperymentalnie).",
    chem: "Wejście dopaminowe z VTA (szlak mezolimbiczny), glutaminianowe z PFC, hipokampu i ciała migdałowatego."
  },
  amygdala: {
    name: "Ciało migdałowate", latin: "Corpus amygdaloideum", group: "Układ limbiczny",
    functions: ["Wykrywanie zagrożeń, warunkowanie strachu", "Nadawanie wagi emocjonalnej bodźcom (także pozytywnym)", "Wzmacnianie zapisu pamięci emocjonalnej", "Rozpoznawanie emocji na twarzach", "Rozszerzone ciało migdałowate (jądro środkowe + BNST): przewlekły lęk i stres odstawienny", "Nie znosi niejednoznaczności: bodźce neutralne i niejasne ocenia jako groźniejsze, stąd lęk nieokreślony", "Szybka droga strachu (wzgórze → ciało migdałowate) działa przed świadomą oceną i tłumaczy flashbacki; wolna droga idzie przez korę", "Przyśrodkowa kora przedczołowa działa jak hamulec ciała migdałowatego; po traumie „gaz” jest silniejszy, a „hamulec” słabszy. Z wykładów: prawe ciało silniej wiąże się z lękiem, lewe z mniejszym lękiem i pozytywnymi wspomnieniami (uproszczenie, dane są mniej jednoznaczne)"],
    lesion: "Zespół Klüvera-Bucy'ego; pacjentka S.M. z obustronnym uszkodzeniem prawie nie odczuwa strachu.",
    chem: "Jądro podstawno-boczne (glutaminian) uczy się skojarzeń; jądro środkowe (GABA) uruchamia reakcję stresową; CRH i dynorfina w stresie odstawiennym."
  },
  hippocampus: {
    name: "Hipokamp", latin: "Hippocampus", group: "Układ limbiczny",
    functions: ["Tworzenie nowych wspomnień deklaratywnych (epizodycznych, semantycznych)", "Pamięć przestrzenna (komórki miejsca)", "Kontekst: „gdzie i kiedy jest bezpiecznie”", "Hamowanie osi HPA (dużo receptorów glukokortykoidowych)", "Przy umiarkowanym kortyzolu wyłącza oś stresu; przy przewlekłym kurczy się. Starsze, małe badania podawały w depresji ubytki rzędu kilku–kilkunastu procent, duże mega-analizy dają znacznie mniej (ok. 1–2%)", "Część obwodu Papeza (hipokamp → ciała suteczkowate → wzgórze → zakręt obręczy)"],
    lesion: "Amnezja następcza (pacjent H.M. po obustronnym usunięciu przyśrodkowych płatów skroniowych).",
    chem: "Zakręt zębaty to jedno z niewielu miejsc neurogenezy u dorosłych (wciąż przedmiot sporu u ludzi); wrażliwy na przewlekły kortyzol."
  },
  entorhinal: {
    name: "Kora śródwęchowa", latin: "Cortex entorhinalis (BA28)", group: "Przyśrodkowy płat skroniowy",
    functions: ["Główne wejście do hipokampu", "Komórki siatki (grid cells), nawigacja", "Pamięć"],
    lesion: "Pierwsze miejsce splątków tau w chorobie Alzheimera (stadia Braaka I–II).",
    chem: "—"
  },
  fef: {
    name: "Czołowe pole oczne (FEF)", latin: "Pole 8 Brodmanna, tylna część zakrętu czołowego środkowego", group: "Kora czołowa",
    functions: ["Kieruje spojrzenie i uwagę wzrokową (ruchy oczu)", "Węzeł grzbietowej sieci uwagi (DAN): uwaga kierowana „odgórnie”, zgodnie z celem"],
    lesion: "Trudność w skierowaniu wzroku na stronę przeciwną, osłabione przeszukiwanie otoczenia.",
    chem: "—"
  },
  spl: {
    name: "Płacik ciemieniowy górny (okolica bruzdy śródciemieniowej)", latin: "Lobulus parietalis superior (BA5, 7)", group: "Kora ciemieniowa",
    functions: ["Kierowanie uwagi „odgórnie” razem z czołowym polem ocznym (DAN)", "Łączy czucie, wzrok i ruch w przestrzeni (sięganie, chwytanie)"],
    lesion: "Ataksja wzrokowa; po obustronnym uszkodzeniu tylnej kory ciemieniowej zespół Balinta (trudność z widzeniem całości sceny i sięganiem).",
    chem: "—"
  },
  mammillary: {
    name: "Ciała suteczkowate", latin: "Corpora mammillaria", group: "Międzymózgowie (podwzgórze)",
    functions: ["Element obwodu Papeza: odbierają sygnał z hipokampu (przez sklepienie) i przekazują go do przedniego jądra wzgórza", "Pamięć epizodyczna"],
    lesion: "Uszkodzenie (np. przy niedoborze tiaminy w alkoholizmie, zespół Korsakowa) daje ciężką niepamięć następczą.",
    chem: "—"
  },
  lgn: {
    name: "Ciało kolankowate boczne", latin: "Corpus geniculatum laterale", group: "Wzgórze",
    functions: ["Stacja na drodze wzrokowej: siatkówka → ciało kolankowate boczne → kora wzrokowa V1"],
    lesion: "Ubytki w polu widzenia po stronie przeciwnej.",
    chem: "—"
  },
  mgn: {
    name: "Ciało kolankowate przyśrodkowe", latin: "Corpus geniculatum mediale", group: "Wzgórze",
    functions: ["Stacja na drodze słuchowej: wzgórki dolne → ciało kolankowate przyśrodkowe → kora słuchowa (zakręty Heschla)"],
    lesion: "Zaburzenia rozumienia dźwięków i lokalizacji źródła głosu.",
    chem: "—"
  },
  whitematter: {
    name: "Istota biała półkuli", latin: "Substantia alba", group: "Istota biała",
    functions: ["Połączenia między obszarami kory i z głębokimi strukturami: aksony pokryte mieliną", "Szybkość przewodzenia, a więc współpraca odległych obszarów, zależy od jej stanu"],
    lesion: "Demielinizacja (np. stwardnienie rozsiane) zaburza przewodzenie; zmiany istoty białej opisano w schizofrenii, depresji i chorobie dwubiegunowej.",
    chem: "Mielinę tworzą oligodendrocyty."
  },
  pineal: {
    name: "Szyszynka", latin: "Glandula pinealis", group: "Międzymózgowie",
    functions: ["Wydziela melatoninę w ciemności", "Synchronizuje rytm dobowy z porą dnia (sygnał z jądra nadskrzyżowaniowego)"],
    lesion: "Zaburzenia rytmu snu i czuwania.",
    chem: "Melatonina powstaje z serotoniny."
  },
  habenula: {
    name: "Uzdeczka", latin: "Habenula", group: "Międzymózgowie",
    functions: ["Sygnał „rozczarowania” (brak oczekiwanej nagrody)", "Hamuje neurony dopaminowe i serotoninowe"],
    lesion: "—",
    chem: "Nadaktywność boczna uzdeczki wiązana z depresją w badaniach zwierzęcych; jedno z miejsc działania ketaminy."
  },
  nbm: {
    name: "Jądro podstawne Meynerta", latin: "Nucleus basalis (Meynert), przodomózgowie podstawne", group: "Przodomózgowie podstawne",
    functions: ["Główne źródło acetylocholiny dla kory", "Uwaga, uczenie się, plastyczność"],
    lesion: "Utrata neuronów cholinergicznych w chorobie Alzheimera i otępieniu z ciałami Lewy'ego.",
    chem: "Na tym deficycie opiera się działanie inhibitorów acetylocholinesterazy (donepezil, rywastygmina)."
  },
  midbrain: {
    name: "Śródmózgowie", latin: "Mesencephalon", group: "Pień mózgu",
    functions: ["Odruchy wzrokowe i słuchowe (wzgórki)", "Istota czarna i pole brzuszne nakrywki: źródło dopaminy", "Istota szara okołowodociągowa (PAG): reakcja zamierania/ucieczki, tłumienie bólu", "Jądro czerwienne i wzgórki: górne (wzrok), dolne (słuch)"],
    lesion: "Utrata neuronów istoty czarnej daje chorobę Parkinsona.",
    chem: "Dopamina; PAG bogata w opioidy."
  },
  vta: {
    name: "Pole brzuszne nakrywki (VTA)", latin: "Area tegmentalis ventralis", group: "Pień mózgu / układ nagrody",
    functions: ["Źródło szlaku mezolimbicznego (do jądra półleżącego) i mezokortykalnego (do PFC)", "Sygnał błędu przewidywania nagrody (Schultz)"],
    lesion: "—",
    chem: "Neurony dopaminergiczne; hamowane przez GABA, które hamują opioidy (stąd wzrost DA po opioidach)."
  },
  sn: {
    name: "Istota czarna", latin: "Substantia nigra", group: "Pień mózgu / jądra podstawy",
    functions: ["Część zbita: dopamina do prążkowia grzbietowego (szlak nigrostriatalny), ruch i nawyki"],
    lesion: "Choroba Parkinsona; leki blokujące D2 mogą dawać objawy pozapiramidowe.",
    chem: "Neuromelanina, dopamina."
  },
  pons: {
    name: "Most", latin: "Pons", group: "Pień mózgu",
    functions: ["Przekaźnik kora → móżdżek", "Generowanie snu REM", "Zawiera miejsce sinawe i część jąder szwu"],
    lesion: "Zespół zamknięcia (uszkodzenie brzusznej części mostu).",
    chem: "—"
  },
  lc: {
    name: "Miejsce sinawe", latin: "Locus coeruleus", group: "Pień mózgu",
    functions: ["Główne źródło noradrenaliny w mózgu", "Czujność, pobudzenie, reakcja na stres i nowość", "Optymalny poziom uwagi (krzywa odwróconego U)"],
    lesion: "Wczesne zmiany tau w chorobie Alzheimera; utrata komórek w Parkinsonie.",
    chem: "Noradrenalina; nadaktywność wiązana z napadami paniki, objawami odstawiennymi opioidów (klonidyna je łagodzi) i nadmierną czujnością w PTSD."
  },
  raphe: {
    name: "Jądra szwu", latin: "Nuclei raphes", group: "Pień mózgu",
    functions: ["Źródło serotoniny dla całego mózgu i rdzenia", "Nastrój, impulsywność, sen, łaknienie, ból"],
    lesion: "—",
    chem: "Serotonina (5-HT); cel SSRI (transporter SERT)."
  },
  medulla: {
    name: "Rdzeń przedłużony", latin: "Medulla oblongata", group: "Pień mózgu",
    functions: ["Ośrodek oddechowy i naczynioruchowy", "Odruchy: kaszel, połykanie, wymioty (area postrema)"],
    lesion: "Zagrożenie życia; przedawkowanie opioidów hamuje oddychanie przez receptory μ w pniu.",
    chem: "—"
  },

};

const DISORDERS = [
  {
    id: "mdd", name: "Depresja (zaburzenie depresyjne)", icd: "6A70–6A71", cat: "Zaburzenia nastroju", evidence: "silne",
    summary: "Najlepiej opisany obwód to nierównowaga między układem limbicznym (ciało migdałowate, sgACC: nadaktywne) a korą przedczołową (DLPFC: słabsza kontrola). Hipokamp jest średnio nieco mniejszy, głównie przy nawracającej depresji i wczesnym początku. Do tego słabsza odpowiedź układu nagrody (anhedonia) i rozregulowana oś stresu HPA.",
    regions: [
      ["sgacc","↑ aktywność","Nadaktywność BA25; obniżenie aktywności towarzyszy poprawie po leczeniu i DBS"],
      ["dlpfc","↓ aktywność","Słabsza odgórna regulacja emocji; cel rTMS (lewa DLPFC)"],
      ["hippocampus","↓ objętość","ENIGMA: d = −0,14; efekt napędzany przez depresję nawracającą i początek ≤21 r.ż."],
      ["amygdala","↑ reaktywność","Silniejsza reakcja na bodźce negatywne, tendencyjność uwagi"],
      ["nacc","↓ odpowiedź na nagrodę","Podłoże anhedonii"],
      ["hypothalamus","rozregulowanie osi HPA","Podwyższony kortyzol, osłabione hamowanie zwrotne"],
      ["mpfc","↑ łączność DMN","Ruminacje wiązane z nadmierną łącznością sieci domyślnej"],
      ["habenula","↑ aktywność (badania zwierzęce)","Sygnał „rozczarowania” hamujący dopaminę"],
      ["raphe","układ serotoninowy","Cel SSRI; sama „teoria niedoboru serotoniny” jest dziś uznawana za zbyt prostą"]
    ],
    chem: "Serotonina, noradrenalina, dopamina, glutaminian (ketamina/esketamina), kortyzol, stan zapalny.",
    src: ["schmaal2016","schmaal2017","drevets1997","mayberg2005"]
  },
  {
    id: "bd", name: "Choroba afektywna dwubiegunowa", icd: "6A60–6A61", cat: "Zaburzenia nastroju", evidence: "silne",
    summary: "W największej analizie ENIGMA kora była cieńsza w płatach czołowych, skroniowych i ciemieniowych obu półkul. Najsilniejsze efekty: lewy zakręt czołowy dolny (część wieczkowa), zakręt wrzecionowaty i środkowa kora czołowa. Funkcjonalnie: nadreaktywny układ emocji i nagrody przy słabszej kontroli przedczołowej. Leki (lit, przeciwpadaczkowe, przeciwpsychotyczne) wpływają na pomiary.",
    regions: [
      ["broca","↓ grubość kory","Lewa pars opercularis: d = −0,29 (ENIGMA 2018)"],
      ["frontal","↓ grubość kory","Rostralna środkowa kora czołowa d = −0,28; dłuższy czas choroby → cieńsza kora"],
      ["temporal","↓ grubość kory","Zakręt wrzecionowaty d = −0,29"],
      ["amygdala","↑ reaktywność","Szczególnie w manii"],
      ["nacc","↑ wrażliwość na nagrodę","Hipoteza nadwrażliwości systemu nagrody/celów"],
      ["hippocampus","↓ objętość","Mniejszy hipokamp i wzgórze (ENIGMA, analiza podkorowa)"],
      ["thalamus","↓ objętość",""]
    ],
    chem: "Dopamina (mania), sygnalizacja wewnątrzkomórkowa (lit: GSK-3, inozytol), glutaminian.",
    src: ["hibar2018","hibar2016"]
  },
  {
    id: "scz", name: "Schizofrenia", icd: "6A20", cat: "Schizofrenia i zaburzenia psychotyczne", evidence: "silne",
    summary: "Największe zmiany strukturalne wśród częstych zaburzeń psychotycznych: rozległe ścieńczenie kory (najsilniej w płatach czołowych i skroniowych), mniejszy hipokamp, ciało migdałowate, wzgórze i jądro półleżące, większe komory boczne i gałka blada. Objawy pozytywne wiąże się z nadmiarem dopaminy w prążkowiu (hipoteza dopaminowa, wersja III), negatywne i poznawcze z niedoczynnością kory przedczołowej i zaburzeniami glutaminianu (receptor NMDA).",
    regions: [
      ["hippocampus","↓ objętość","ENIGMA: d = −0,46, największy efekt podkorowy"],
      ["frontal","↓ grubość kory","Całkowita grubość kory d ≈ −0,53; największe efekty czołowe i skroniowe"],
      ["temporal","↓ grubość kory","Zakręt skroniowy górny"],
      ["wernicke","↑ aktywność przy halucynacjach","Kora słuchowa/językowa aktywna podczas „głosów”"],
      ["dlpfc","↓ aktywność (hipofrontalność)","Zaburzenia pamięci roboczej, objawy negatywne"],
      ["striatum","↑ synteza i wydzielanie dopaminy","Głównie prążkowie asocjacyjne; cel leków blokujących D2"],
      ["thalamus","↓ objętość, zaburzone filtrowanie","d = −0,31"],
      ["amygdala","↓ objętość","d = −0,31"],
      ["nacc","↓ objętość","d = −0,25"],
      ["vta","szlak mezolimbiczny","Nadmierne nadawanie znaczenia bodźcom (aberrant salience)"]
    ],
    chem: "Dopamina (D2), glutaminian (NMDA), GABA (interneurony PV), utrata kolców dendrytycznych w korze.",
    src: ["vanerp2016","vanerp2018","howes2009"]
  },
  {
    id: "anx", name: "Zaburzenia lękowe (uogólniony lęk, panika, fobie, lęk społeczny)", icd: "6B00–6B05", cat: "Zaburzenia lękowe i związane ze strachem", evidence: "umiarkowane",
    summary: "Wspólny wzorzec to nadreaktywność ciała migdałowatego i wyspy na zagrożenie przy słabszej regulacji przez przyśrodkową korę przedczołową. Przy lęku przewlekłym, „rozlanym” ważne jest rozszerzone ciało migdałowate (BNST). W panice dużą rolę przypisuje się miejscu sinawemu i istocie szarej okołowodociągowej.",
    regions: [
      ["amygdala","↑ reaktywność","Meta-analiza Etkin i Wager (2007): wspólna nadaktywność w lęku społecznym, fobii i PTSD"],
      ["insula","↑ reaktywność","Nadmierna interocepcja, odczuwanie objawów z ciała"],
      ["mpfc","↓ regulacja","Słabsze wygaszanie strachu"],
      ["acc","↑ aktywność (dACC)","Ocena zagrożenia, martwienie się"],
      ["lc","↑ aktywność (panika)","Wyrzut noradrenaliny"],
      ["midbrain","PAG: reakcje paniki","Ucieczka/zamieranie"],
      ["hypothalamus","oś HPA",""]
    ],
    chem: "GABA (benzodiazepiny), serotonina (SSRI), noradrenalina, CRH.",
    src: ["etkin2007"]
  },
  {
    id: "ptsd", name: "Zespół stresu pourazowego (PTSD)", icd: "6B40–6B41", cat: "Zaburzenia związane ze stresem", evidence: "silne",
    summary: "Model neuroobwodowy: nadreaktywne ciało migdałowate (przesadna reakcja strachu), niedoaktywna brzuszno-przyśrodkowa kora przedczołowa, która nie hamuje ciała migdałowatego, i hipokamp, który słabiej koduje kontekst (gdzie jest bezpiecznie). Do tego nadaktywny grzbietowy ACC i wyspa (sieć istotności). Kortyzol bywa paradoksalnie obniżony.",
    regions: [
      ["amygdala","↑ reaktywność","Najczęściej replikowany wynik funkcjonalny"],
      ["mpfc","↓ aktywność (vmPFC)","Słabe hamowanie ciała migdałowatego, upośledzone wygaszanie strachu"],
      ["hippocampus","↓ objętość, ↓ kontekst","Nadmierna generalizacja strachu"],
      ["acc","↑ aktywność (dACC)",""],
      ["insula","↑ aktywność","Sieć istotności"],
      ["lc","↑ noradrenalina","Nadmierna czujność, koszmary (prazosyna)"],
      ["sgacc","wygaszanie strachu","Część vmPFC ważna dla utrwalenia wygaszenia"]
    ],
    chem: "Noradrenalina, kortyzol, CRH, endokannabinoidy, glutaminian.",
    src: ["shin_ptsd","alexandra_ptsd"]
  },
  {
    id: "ocd", name: "Zaburzenie obsesyjno-kompulsyjne (OCD)", icd: "6B20", cat: "Zaburzenia obsesyjno-kompulsyjne i pokrewne", evidence: "silne",
    summary: "Klasyczny model to nadaktywność pętli korowo-prążkowiowo-wzgórzowo-korowej (CSTC): OFC → jądro ogoniaste → wzgórze → z powrotem do OFC. Pętla „zacina się”, utrwalając myśli i nawyki. Nowsze dane dodają ACC, ciało migdałowate (upośledzone wygaszanie strachu) oraz korę ciemieniową. W bezpośrednim porównaniu ENIGMA z ADHD i autyzmem nie znaleziono różnic strukturalnych swoistych dla OCD.",
    regions: [
      ["ofc","↑ aktywność","Węzeł pętli CSTC"],
      ["striatum","↑ aktywność (jądro ogoniaste)","Nawyki, brak sygnału „zrobione”"],
      ["thalamus","↑ aktywność","Zamyka pętlę; cel zabiegów neurochirurgicznych w przypadkach skrajnie opornych"],
      ["acc","↑ aktywność","Nadmierny sygnał błędu; cel cingulotomii"],
      ["amygdala","upośledzone wygaszanie strachu",""],
      ["tpj","↓ grubość kory ciemieniowej","Sieci czołowo-ciemieniowe"]
    ],
    chem: "Serotonina (SSRI w wysokich dawkach), dopamina, glutaminian.",
    src: ["boedhoe2017","boedhoe2018","vandenheuvel2016","milad2012","boedhoe2020"]
  },
  {
    id: "adhd", name: "ADHD", icd: "6A05", cat: "Zaburzenia neurorozwojowe", evidence: "silne",
    summary: "U dzieci z ADHD jądro półleżące, ciało migdałowate, jądro ogoniaste, hipokamp i skorupa są średnio nieco mniejsze; u dorosłych różnice nie były już istotne. Pasuje to do hipotezy opóźnionego dojrzewania mózgu (kora osiąga szczyt grubości kilka lat później). Funkcjonalnie: słabsze obwody czołowo-prążkowiowe (hamowanie, uwaga) i niedostatecznie wyciszana sieć domyślna.",
    regions: [
      ["amygdala","↓ objętość (dzieci)","ENIGMA: d = −0,19, największy efekt podkorowy"],
      ["nacc","↓ objętość","d = −0,15; motywacja, awersja do odroczenia nagrody"],
      ["striatum","↓ objętość","Jądro ogoniaste d = −0,11, skorupa d = −0,14"],
      ["hippocampus","↓ objętość","d = −0,11"],
      ["dlpfc","↓ aktywność / opóźnione dojrzewanie","Funkcje wykonawcze"],
      ["broca","↓ aktywność (prawy IFG)","Hamowanie odpowiedzi"],
      ["mpfc","słabsze wyciszanie DMN","Wtargnięcia błądzenia myślami"],
      ["cerebellum","zmiany objętości i timingu",""]
    ],
    chem: "Dopamina i noradrenalina (metylofenidat, lisdeksamfetamina, atomoksetyna, guanfacyna).",
    src: ["hoogman2017","hoogman2019","shaw2007"]
  },
  {
    id: "asd", name: "Spektrum autyzmu", icd: "6A02", cat: "Zaburzenia neurorozwojowe", evidence: "umiarkowane",
    summary: "Wyniki są bardzo zróżnicowane. W ENIGMA u dorosłych z autyzmem kora czołowa była grubsza niż u osób z grupy kontrolnej i z innymi diagnozami. Funkcjonalnie bada się „mózg społeczny” (ciało migdałowate, zakręt wrzecionowaty, bruzda skroniowa górna, TPJ, mPFC), móżdżek oraz nietypową łączność. Autyzm to sposób rozwoju mózgu, nie uszkodzenie jednej struktury.",
    regions: [
      ["frontal","↑ grubość kory (dorośli)","ENIGMA 2020"],
      ["amygdala","nietypowy rozwój, przetwarzanie twarzy",""],
      ["tpj","↓ aktywność w zadaniach teorii umysłu",""],
      ["mpfc","inne wzorce mentalizacji",""],
      ["temporal","zakręt wrzecionowaty, STS: przetwarzanie twarzy i ruchu biologicznego",""],
      ["cerebellum","mniej komórek Purkinjego (badania pośmiertne)",""]
    ],
    chem: "Równowaga pobudzenia i hamowania (glutaminian/GABA), oksytocyna (badania nie potwierdziły skuteczności leczniczej).",
    src: ["vanrooij2018","boedhoe2020"]
  },
  {
    id: "an", name: "Jadłowstręt psychiczny (anoreksja)", icd: "6B80", cat: "Zaburzenia odżywiania", evidence: "silne",
    summary: "W ENIGMA ścieńczenie kory w ostrej anoreksji było największe ze wszystkich badanych zaburzeń psychicznych (d do 0,95), rozległe i skupione w węzłach sieci (hubach). Zmiany wiązały się z niskim BMI i były słabsze u osób częściowo odżywionych, co sugeruje, że w dużej mierze się cofają. Funkcjonalnie: wyspa (interocepcja, obraz ciała), prążkowie (nagroda) i nadmierna kontrola przedczołowa.",
    regions: [
      ["frontal","↓↓ grubość kory","Rozległe ścieńczenie, częściowo odwracalne"],
      ["parietal","↓↓ grubość kory","Obraz ciała"],
      ["temporal","↓ grubość kory",""],
      ["insula","nietypowa interocepcja","Sygnały głodu i sytości"],
      ["striatum","zmieniona odpowiedź na nagrodę (jedzenie)",""],
      ["dlpfc","↑ kontrola poznawcza",""],
      ["hypothalamus","zaburzenia łaknienia i hormonów",""]
    ],
    chem: "Dopamina, serotonina, leptyna i grelina; brak leków o udowodnionej skuteczności na objawy rdzeniowe.",
    src: ["walton2022"]
  },
  {
    id: "bn", name: "Bulimia i zaburzenie z napadami objadania się", icd: "6B81–6B82", cat: "Zaburzenia odżywiania", evidence: "wstępne",
    summary: "Badania wskazują na układ nagrody (silna reakcja na sygnały jedzenia) i osłabioną kontrolę hamującą. Próby są małe, a wyniki niespójne.",
    regions: [
      ["ofc","↑ reakcja na sygnały jedzenia",""],
      ["striatum","zmieniona odpowiedź na nagrodę",""],
      ["broca","↓ kontrola hamująca (IFG)",""],
      ["insula","smak, interocepcja",""]
    ],
    chem: "Serotonina, dopamina; lisdeksamfetamina zarejestrowana w BED w niektórych krajach.",
    src: []
  },
  {
    id: "sud", name: "Uzależnienia od substancji", icd: "6C40–6C4H", cat: "Zaburzenia związane z substancjami", evidence: "silne",
    summary: "Model trzech stadiów (Koob i Volkow): 1) upojenie: VTA i prążkowie brzuszne (wzrost dopaminy, wzmocnienie); 2) odstawienie i negatywny afekt: rozszerzone ciało migdałowate i uzdeczka (CRH, dynorfina, stres); 3) zaabsorbowanie i głód: kora przedczołowa, OFC, prążkowie grzbietowe, hipokamp, wyspa (osłabiona kontrola, nawyk). Cykl się nasila z każdym obrotem.",
    regions: [
      ["vta","stadium 1: ↑ dopamina","Wszystkie substancje uzależniające zwiększają DA w jądrze półleżącym"],
      ["nacc","stadium 1: wzmocnienie","Nadawanie wagi bodźcom związanym z substancją"],
      ["striatum","przejście w nawyk (prążkowie grzbietowe)",""],
      ["amygdala","stadium 2: stres odstawienny","Rozszerzone ciało migdałowate: CRH, dynorfina"],
      ["habenula","stadium 2: negatywny afekt",""],
      ["mpfc","stadium 3: ↓ kontrola",""],
      ["ofc","stadium 3: zaburzone wartościowanie",""],
      ["insula","stadium 3: głód (craving)",""],
      ["hippocampus","pamięć kontekstu używania",""]
    ],
    chem: "Dopamina, opioidy endogenne, glutaminian, CRH, dynorfina, endokannabinoidy.",
    src: ["koob2010","koob2016"]
  },
  {
    id: "bpd", name: "Zaburzenie osobowości z cechami borderline", icd: "6D10–6D11 (+ 6D11.5)", cat: "Zaburzenia osobowości", evidence: "umiarkowane",
    summary: "Meta-analiza multimodalna: przy bodźcach negatywnych większa aktywność lewego ciała migdałowatego i tylnego zakrętu obręczy, słabsza obustronnej DLPFC; lewe ciało migdałowate łączy nadaktywność z mniejszą objętością istoty szarej. Model: nadreaktywność limbiczna przy słabszej regulacji czołowej. Inna duża meta-analiza z 2021 r. nie znalazła jednak odpornych wyników dla wszystkich zadań łącznie, więc dowody są mniej pewne niż w depresji czy schizofrenii.",
    regions: [
      ["amygdala","↑ aktywność, ↓ objętość","Wynik multimodalny, zależny od leczenia (wyraźny u nieleczonych)"],
      ["dlpfc","↓ aktywność","Słabsza regulacja emocji"],
      ["pcc","↑ aktywność",""],
      ["hippocampus","↓ objętość","Silniej przy współwystępującym PTSD"],
      ["acc","zaburzona kontrola, ból społeczny",""],
      ["insula","",""]
    ],
    chem: "Serotonina, opioidy endogenne, oksytocyna (badania wstępne).",
    src: ["schulze2016","dacosta2021"]
  },
  {
    id: "asp", name: "Zaburzenie zachowania / cechy dyssocjalne (psychopatia)", icd: "6C91, 6D11 (cecha dyssocjalności)", cat: "Zaburzenia zachowania / osobowości", evidence: "umiarkowane",
    summary: "Przy cechach nieczułości emocjonalnej wiąże się słabszą reakcję ciała migdałowatego na cudzy strach i nieprawidłowe uczenie się przez karę w brzuszno-przyśrodkowej korze i OFC.",
    regions: [
      ["amygdala","↓ reaktywność na cudzy strach",""],
      ["mpfc","↓ vmPFC: ocena moralna",""],
      ["ofc","↓ uczenie przez karę",""]
    ],
    chem: "—", src: []
  },
  {
    id: "ad", name: "Choroba Alzheimera (otępienie)", icd: "6D80 / 8A20", cat: "Zaburzenia neuropoznawcze", evidence: "silne",
    summary: "Zmiany tau przebiegają według stadiów Braaka: najpierw kora śródwęchowa i hipokamp (stąd wczesne problemy z zapamiętywaniem nowych informacji), potem kora skroniowa i ciemieniowa, w końcu prawie cała kora. Wcześnie spada metabolizm tylnego zakrętu obręczy i przedklinka. Giną neurony cholinergiczne jądra podstawnego Meynerta, a miejsce sinawe bywa zajęte bardzo wcześnie.",
    regions: [
      ["entorhinal","zmiany tau najwcześniej","Stadia Braaka I–II"],
      ["hippocampus","↓↓ objętość","Zanik widoczny w MRI"],
      ["pcc","↓ metabolizm (FDG-PET)",""],
      ["parietal","zanik skroniowo-ciemieniowy","Zaburzenia orientacji przestrzennej, apraksja"],
      ["temporal","zanik",""],
      ["nbm","utrata neuronów cholinergicznych","Podstawa działania inhibitorów acetylocholinesterazy"],
      ["lc","wczesne zmiany tau",""]
    ],
    chem: "Acetylocholina, glutaminian (memantyna, antagonista NMDA), β-amyloid i białko tau.",
    src: ["braak1991"]
  },
  {
    id: "ftd", name: "Otępienie czołowo-skroniowe (wariant behawioralny)", icd: "6D83 / 8A23", cat: "Zaburzenia neuropoznawcze", evidence: "umiarkowane",
    summary: "Zanik kory czołowej i przedniej części skroniowej, szczególnie OFC, przedniego zakrętu obręczy i przedniej wyspy, czyli obszarów bogatych w neurony von Economo. Pierwsze objawy to często zmiana osobowości, odhamowanie i apatia, a nie pamięć; bywa mylnie rozpoznawane jako zaburzenie psychiczne.",
    regions: [
      ["ofc","zanik",""],
      ["acc","zanik, utrata neuronów von Economo",""],
      ["insula","zanik przedniej wyspy",""],
      ["frontal","zanik",""],
      ["temporal","zanik przedniego płata skroniowego",""]
    ],
    chem: "Serotonina, dopamina; białka tau lub TDP-43.", src: ["seeley2006"]
  },
  {
    id: "dis", name: "Zaburzenia dysocjacyjne (depersonalizacja/derealizacja)", icd: "6B60–6B66", cat: "Zaburzenia dysocjacyjne", evidence: "wstępne",
    summary: "Model „nadmiernej modulacji”: przyśrodkowa kora przedczołowa nadmiernie hamuje ciało migdałowate i wyspę, przez co emocje i ciało są odczuwane jak „wyłączone”. Wariant dysocjacyjny PTSD wykazuje odwrotny wzorzec niż typowy PTSD. Dane z małych prób.",
    regions: [
      ["mpfc","↑ hamowanie limbiczne",""],
      ["amygdala","↓ reaktywność",""],
      ["insula","↓ interocepcja",""],
      ["tpj","poczucie bycia w ciele",""]
    ],
    chem: "Glutaminian (NMDA: ketamina wywołuje dysocjację), opioidy endogenne.", src: []
  },
  {
    id: "tic", name: "Zespół Tourette'a i tiki", icd: "8A05.00 (lista neurologiczna, kodowana też w rozdziale 6)", cat: "Zaburzenia neurorozwojowe / ruchowe", evidence: "umiarkowane",
    summary: "Zaburzenie ruchowej pętli korowo-prążkowiowo-wzgórzowej: słabsze hamowanie w prążkowiu (mniej interneuronów w badaniach pośmiertnych) pozwala na „przeciekanie” niechcianych ruchów. Często współwystępuje z OCD i ADHD.",
    regions: [
      ["striatum","↓ hamowanie (skorupa)",""],
      ["thalamus","pętla CSTC","Cel DBS w ciężkich przypadkach"],
      ["motor","nadmierna pobudliwość","Uczucie przymusu przed tikiem (premonitory urge) wiązane z wyspą i SMA"]
    ],
    chem: "Dopamina (leki blokujące D2, aripiprazol), GABA.", src: []
  }
];

const CELLS = [
  { name: "Neuron piramidowy", where: "Kora (warstwy III i V), hipokamp, ciało migdałowate", what: "Główne neurony pobudzające (glutaminian). Długi akson wysyła informację do innych okolic kory, wzgórza i rdzenia. Kolce dendrytyczne to miejsca synaps; ich ubytek opisywano w schizofrenii i przewlekłym stresie.", type: "neuron" },
  { name: "Interneurony GABA: parwalbumina (PV)", where: "Cała kora, hipokamp", what: "Szybko wyładowujące komórki koszyczkowe; synchronizują rytm gamma potrzebny do pamięci roboczej. Ich dysfunkcję wiąże się ze schizofrenią.", type: "neuron" },
  { name: "Interneurony GABA: somatostatyna (SST) i VIP", where: "Kora", what: "SST hamują dendryty komórek piramidowych, VIP hamują inne interneurony (odhamowanie). Mniej SST znajdowano w korze w depresji.", type: "neuron" },
  { name: "Średni kolczasty neuron (MSN)", where: "Prążkowie, jądro półleżące", what: "Ok. 95% neuronów prążkowia, hamujące (GABA). Typ D1 tworzy drogę bezpośrednią („idź”), typ D2 pośrednią („stop”). Na D2 działają leki przeciwpsychotyczne.", type: "neuron" },
  { name: "Neurony dopaminergiczne", where: "Pole brzuszne nakrywki (VTA), istota czarna, podwzgórze", what: "Kodują błąd przewidywania nagrody. Szlaki: mezolimbiczny, mezokortykalny, nigrostriatalny, guzkowo-lejkowy.", type: "neuron" },
  { name: "Neurony serotoninergiczne", where: "Jądra szwu (pień mózgu)", what: "Kilkaset tysięcy komórek unerwia cały mózg. Nastrój, impulsywność, sen, łaknienie.", type: "neuron" },
  { name: "Neurony noradrenergiczne", where: "Miejsce sinawe (most)", what: "Ok. 50 tys. komórek po każdej stronie. Czujność, stres, uwaga.", type: "neuron" },
  { name: "Neurony cholinergiczne", where: "Jądro podstawne Meynerta, przegroda, pień mózgu; interneurony prążkowia", what: "Uwaga, pamięć, sen REM. Giną w chorobie Alzheimera.", type: "neuron" },
  { name: "Komórka Purkinjego", where: "Kora móżdżku", what: "Ogromne, rozgałęzione drzewo dendrytyczne; hamujące (GABA), jedyne wyjście z kory móżdżku. Mniejszą liczbę opisywano w autyzmie.", type: "neuron" },
  { name: "Komórka ziarnista", where: "Móżdżek, zakręt zębaty hipokampu", what: "Najliczniejsze neurony mózgu (ok. 50–70 mld w móżdżku). W zakręcie zębatym to komórki, które mogą powstawać u dorosłych (neurogeneza; u ludzi temat sporny).", type: "neuron" },
  { name: "Neuron von Economo (wrzecionowaty)", where: "Przedni zakręt obręczy, przednia wyspa", what: "Duże, wydłużone neurony występujące u człowieka, małp człekokształtnych, słoni i waleni. Hipotetycznie ważne dla szybkiej intuicji społecznej; selektywnie giną w otępieniu czołowo-skroniowym.", type: "neuron" },
  { name: "Komórki miejsca i komórki siatki", where: "Hipokamp (miejsca), kora śródwęchowa (siatki)", what: "Tworzą wewnętrzną mapę przestrzeni (Nobel 2014: O'Keefe, May-Britt i Edvard Moser).", type: "neuron" },
  { name: "Neuron lustrzany", where: "Dolny zakręt czołowy i okolice przedruchowe, dolny płacik ciemieniowy", what: "Aktywny, gdy sami wykonujemy ruch i gdy patrzymy, jak robi to ktoś inny. Wiązany z naśladowaniem, uczeniem się przez obserwację i empatią; jego rola u człowieka oraz związek z autyzmem są wciąż przedmiotem sporu.", type: "neuron" },
  { name: "Astrocyt", where: "Cały mózg", what: "Utrzymuje barierę krew-mózg, zbiera nadmiar glutaminianu z synaps, odżywia neurony, reguluje przepływ krwi. Mniej astrocytów znajdowano w korze przedczołowej osób z depresją (badania pośmiertne).", type: "glej" },
  { name: "Oligodendrocyt", where: "Istota biała mózgu i rdzenia", what: "Tworzy osłonkę mielinową, która przyspiesza przewodzenie. Zmiany istoty białej opisano w schizofrenii, depresji i chorobie dwubiegunowej.", type: "glej" },
  { name: "Komórka Schwanna", where: "Nerwy obwodowe", what: "Odpowiednik oligodendrocyta poza mózgiem i rdzeniem: tworzy osłonkę mielinową wokół jednego odcinka aksonu i pomaga w regeneracji uszkodzonych nerwów obwodowych.", type: "glej" },
  { name: "Mikroglej", where: "Cały mózg", what: "Komórki odpornościowe mózgu: sprzątają resztki, przycinają nieużywane synapsy w rozwoju. Hipoteza nadmiernego przycinania w schizofrenii (gen C4) i rola stanu zapalnego w depresji.", type: "glej" },
  { name: "Komórki prekursorowe oligodendrocytów (NG2) i ependymalne", where: "Cały mózg; wyściółka komór", what: "NG2 odtwarzają mielinę; komórki wyściółki produkują i poruszają płyn mózgowo-rdzeniowy.", type: "glej" }
];

const PATHWAYS = [
  { id: "da", name: "Dopamina", color: "#ff4d8d", sourceText: "pole brzuszne nakrywki (VTA), istota czarna, podwzgórze",
    role: "Ruch (istota czarna) oraz chcenie i przewidywanie nagrody (VTA). Neurony reagują na nieoczekiwaną nagrodę, a po nauce na sygnał, który ją zapowiada. To nie jest „cząsteczka przyjemności”, tylko sygnał „warto po to sięgnąć”.",
    receptors: "Receptory metabotropowe D1–D5: działają wolno, ale długo. Na D2 działają leki przeciwpsychotyczne.",
    disorders: ["scz", "adhd", "sud", "mdd", "tic"],
    routes: [
      { from: "vta", to: "s_accumbens", name: "Szlak mezolimbiczny", label: "VTA → jądro półleżące", effect: "Motywacja i nagroda. Nadmiar dopaminy: objawy wytwórcze w psychozie (urojenia, omamy). Tu schodzą się wszystkie substancje uzależniające.", via: [[3, -6, -11], [6, 5, -9]] },
      { from: "vta", to: "medialorbitofrontal", name: "Szlak mezokortykalny", label: "VTA → przyśrodkowa kora przedczołowa", effect: "Funkcje poznawcze i planowanie. Niedobór: objawy negatywne i poznawcze w schizofrenii.", via: [[4, 0, -4], [5, 22, 2]] },
      { from: "vta", to: "rostralmiddlefrontal", name: "Szlak mezokortykalny", label: "VTA → grzbietowo-boczna kora przedczołowa (DLPFC)", effect: "Pamięć robocza; optimum dopaminowe, za mało i za dużo pogarsza wyniki.", via: [[8, 2, 0], [20, 30, 20]] },
      { from: "sn", to: "s_caudate", name: "Szlak czarno-prążkowiowy", label: "istota czarna → jądro ogoniaste", effect: "Ruch i nawyki. Utrata neuronów: choroba Parkinsona.", via: [[-4, -10, -4]] },
      { from: "sn", to: "s_putamen", name: "Szlak czarno-prążkowiowy", label: "istota czarna → skorupa", effect: "Blokada przez leki przeciwpsychotyczne daje parkinsonizm lekowy, akatyzję i późne dyskinezy.", via: [[-12, -10, -6]] },
      { from: "hypothalamus", to: "pituitary", name: "Szlak guzowo-lejkowy", label: "podwzgórze → przysadka", effect: "Dopamina hamuje wydzielanie prolaktyny. Blokada D2 podnosi prolaktynę (mlekotok, zaburzenia miesiączkowania)." }
    ] },
  { id: "5ht", name: "Serotonina", color: "#9b6bff", sourceText: "jądra szwu w pniu mózgu",
    role: "Nastrój, sen, apetyt, impulsywność, ból. Największy układ przekaźnikowy: kilkaset tysięcy neuronów unerwia cały mózg i rdzeń, a siedem klas receptorów daje bardzo różne efekty. Ok. 80% serotoniny w organizmie jest w jelitach.",
    receptors: "Siedem klas receptorów 5-HT; prawie wszystkie metabotropowe. Receptor 5-HT2A jest celem psychodelików.",
    disorders: ["mdd", "anx", "ocd", "bn", "bpd"],
    routes: [
      { from: "raphe", to: "superiorfrontal", name: "Szlak wstępujący", label: "jądra szwu → kora czołowa", effect: "Nastrój i kontrola impulsów. Niski obrót serotoniny wiąże się z impulsywną agresją.", via: [[2, -10, -10], [-4, 20, 30]] },
      { from: "raphe", to: "s_hippocampus", name: "Szlak wstępujący", label: "jądra szwu → hipokamp", effect: "Pamięć i neuroplastyczność; długo trwały efekt przewlekłego leczenia SSRI.", via: [[-6, -22, -14]] },
      { from: "raphe", to: "s_amygdala", name: "Szlak wstępujący", label: "jądra szwu → ciało migdałowate", effect: "Modulacja reakcji lękowej.", via: [[-8, -18, -16]] },
      { from: "raphe", to: "superiorparietal", name: "Szlak wstępujący", label: "jądra szwu → kora ciemieniowa", effect: "Rozproszone unerwienie całej kory.", via: [[-2, -40, 6]] },
      { from: "raphe", to: "cerebellum", name: "Szlak zstępujący", label: "jądra szwu → móżdżek", effect: "Modulacja ruchu i funkcji móżdżku.", via: [[-6, -45, -22]] }
    ] },
  { id: "na", name: "Noradrenalina", color: "#ff9f1c", sourceText: "miejsce sinawe w moście",
    role: "Czujność i reakcja „walcz albo uciekaj”. Neurony wyładowują się najsilniej przy nowości i zagrożeniu. Zarówno za mało, jak i za dużo osłabia korę przedczołową (krzywa odwróconego U).",
    receptors: "Receptory α1, α2 i β, metabotropowe. Prazosyna (α1) i klonidyna (α2) łagodzą nadmierne pobudzenie.",
    disorders: ["anx", "ptsd", "adhd", "mdd"],
    routes: [
      { from: "lc", to: "rostralmiddlefrontal", name: "Szlak wstępujący", label: "miejsce sinawe → kora przedczołowa", effect: "Uwaga i pamięć robocza; nadmiar w stresie wyłącza myślenie przedczołowe.", via: [[8, -30, -10], [24, 20, 24]] },
      { from: "lc", to: "s_thalamus", name: "Szlak wstępujący", label: "miejsce sinawe → wzgórze", effect: "Czuwanie i filtrowanie bodźców.", via: [[-4, -30, -14]] },
      { from: "lc", to: "s_hippocampus", name: "Szlak wstępujący", label: "miejsce sinawe → hipokamp", effect: "Utrwalanie wspomnień o silnym ładunku emocjonalnym.", via: [[-12, -30, -18]] },
      { from: "lc", to: "s_amygdala", name: "Szlak wstępujący", label: "miejsce sinawe → ciało migdałowate", effect: "Nadmierna czujność, koszmary i wzmożone pobudzenie w PTSD.", via: [[-12, -22, -18]] },
      { from: "lc", to: "inferiorparietal", name: "Szlak wstępujący", label: "miejsce sinawe → kora ciemieniowa", effect: "Czujność i uwaga przestrzenna.", via: [[-4, -45, -4]] },
      { from: "lc", to: "cerebellum", name: "Szlak zstępujący", label: "miejsce sinawe → móżdżek", effect: "Modulacja pracy móżdżku.", via: [[-8, -50, -26]] }
    ] },
  { id: "ach", name: "Acetylocholina", color: "#2fd07a", sourceText: "jądro podstawne Meynerta, przegroda, pień mózgu; poza mózgiem nerwy ruchowe i przywspółczulne",
    role: "Uwaga, przetwarzanie bodźców, pamięć, sen REM; poza mózgiem skurcz mięśni szkieletowych i układ przywspółczulny. Neurony cholinergiczne giną w chorobie Alzheimera.",
    receptors: "Receptory nikotynowe (jonotropowe, szybkie) i muskarynowe (metabotropowe).",
    disorders: ["ad"],
    routes: [
      { from: "nbm", to: "rostralmiddlefrontal", name: "Szlak podstawno-korowy", label: "jądro Meynerta → kora czołowa", effect: "Uwaga i uczenie się. Na deficycie opiera się działanie inhibitorów acetylocholinesterazy (donepezil).", via: [[-14, 6, 0], [-30, 30, 22]] },
      { from: "nbm", to: "inferiorparietal", name: "Szlak podstawno-korowy", label: "jądro Meynerta → kora ciemieniowa", effect: "Uwaga przestrzenna i pamięć.", via: [[-20, -20, 14]] },
      { from: "nbm", to: "lateraloccipital", name: "Szlak podstawno-korowy", label: "jądro Meynerta → kora potyliczna", effect: "Wzmacnianie przetwarzania wzrokowego przy skupionej uwadze.", via: [[-20, -35, 8]] },
      { from: "nbm", to: "s_amygdala", name: "Szlak podstawno-korowy", label: "jądro Meynerta → ciało migdałowate", effect: "Uwaga na bodźce o znaczeniu emocjonalnym.", via: [[-18, -5, -12]] }
    ] },
  { id: "glu", name: "Glutaminian", color: "#ffd23f", sourceText: "neurony piramidowe kory, hipokamp, wzgórze",
    role: "Główny przekaźnik pobudzający. Uczenie się i pamięć: wzmocnienie długotrwałe (LTP) przez receptor NMDA. Nadmiar zabija neurony (ekscytotoksyczność).",
    receptors: "Jonotropowe AMPA, NMDA i kainianowe (szybkie) oraz metabotropowe mGluR. Ketamina i memantyna blokują NMDA.",
    disorders: ["scz", "mdd", "ad"],
    routes: [
      { from: "rostralmiddlefrontal", to: "s_caudate", name: "Szlak korowo-prążkowiowy", label: "kora przedczołowa → jądro ogoniaste", effect: "Wejście pobudzające do pętli korowo-prążkowiowo-wzgórzowych (CSTC); nadaktywne w OCD.", via: [[-28, 28, 28]] },
      { from: "s_thalamus", to: "postcentral", name: "Szlak wzgórzowo-korowy", label: "wzgórze → kora czuciowa", effect: "Przekazywanie czucia do kory.", via: [[-14, -12, 18]] },
      { from: "s_thalamus", to: "s_amygdala", name: "Szybka droga strachu", label: "wzgórze → ciało migdałowate", effect: "Reakcja na zagrożenie przed świadomą oceną; źródło „walcz albo uciekaj” i flashbacków.", via: [[-18, -8, -4]] },
      { from: "entorhinal", to: "s_hippocampus", name: "Szlak przeszywający", label: "kora śródwęchowa → hipokamp", effect: "Główne wejście do hipokampu; wzmocnienie długotrwałe (LTP) tej drogi to model zapamiętywania.", via: [[-26, -12, -22]] }
    ] },
  { id: "gaba", name: "GABA", color: "#2ec4ff", sourceText: "interneurony kory i hipokampu, prążkowie, gałka blada, móżdżek, ciało migdałowate",
    role: "Główny przekaźnik hamujący: wyciszanie, rytmy mózgowe, kontrola lęku. Alkohol i benzodiazepiny wzmacniają receptor GABA-A; przewlekły alkohol zmniejsza liczbę tych receptorów.",
    receptors: "GABA-A (jonotropowy, szybki; tu działają benzodiazepiny, barbiturany i alkohol) oraz GABA-B (metabotropowy).",
    disorders: ["anx", "scz", "sud"],
    routes: [
      { from: "s_caudate", to: "s_pallidum", name: "Droga jąder podstawy", label: "jądro ogoniaste → gałka blada", effect: "Hamowanie w obwodach wyboru działań.", via: [[-14, 4, 2]] },
      { from: "s_putamen", to: "s_pallidum", name: "Droga jąder podstawy", label: "skorupa → gałka blada", effect: "Obwód ruchowy: wybór i hamowanie ruchów.", via: [[-20, 2, 0]] },
      { from: "s_pallidum", to: "s_thalamus", name: "Droga jąder podstawy", label: "gałka blada → wzgórze", effect: "Główne wyjście jąder podstawy: hamuje wzgórze, które inaczej pobudzałoby korę.", via: [[-14, -6, 4]] },
      { from: "s_amygdala", to: "hypothalamus", name: "Wyjście ciała migdałowatego", label: "ciało migdałowate (jądro środkowe) → podwzgórze", effect: "Uruchamia reakcję stresową (oś HPA, układ współczulny).", via: [[-8, -2, -14]] }
    ] }
];

const NETWORKS = [
  { name: "Sieć domyślna (DMN)", color: "#b388ff", regions: ["mpfc", "pcc", "tpj", "hippocampus"], text: "Aktywna w spoczynku i gdy myślimy o sobie, wspomnieniach i przyszłości. Nadmierna łączność wiąże się z ruminacjami w depresji, w ADHD sieć dojrzewa z opóźnieniem, a w chorobie Alzheimera to jedna z pierwszych sieci zajętych zmianami.", src: ["menon2011"] },
  { name: "Sieć istotności (salience)", color: "#ff8a3d", regions: ["insula", "acc", "amygdala"], text: "Przednia wyspa i grzbietowy przedni zakręt obręczy wykrywają, co jest ważne (w ciele i otoczeniu), i działają jak przełącznik między siecią domyślną a wykonawczą. Nadaktywna: lęk, neurotyzm, ból przewlekły. Zbyt słaba: schizofrenia, autyzm. Blisko spokrewniona sieć obręczowo-wieczkowa uruchamia i podtrzymuje zasady zadania.", src: ["menon2011"] },
  { name: "Sieć wykonawcza (czołowo-ciemieniowa, FPN/CEN)", color: "#4da3ff", regions: ["dlpfc", "tpj", "spl"], text: "Pamięć robocza, planowanie, decyzje i przerzutność uwagi. Osłabiona w depresji, schizofrenii i ADHD.", src: ["menon2011"] },
  { name: "Sieć uwagi grzbietowa (DAN)", color: "#35d0ba", regions: ["fef", "spl"], text: "Kieruje uwagę „odgórnie”, zgodnie z celem: czołowe pola oczne i okolica bruzdy śródciemieniowej tworzą mapy tego, co ważne w polu widzenia.", src: ["corbetta2002"] },
  { name: "Sieć uwagi brzuszna (VAN)", color: "#ff5c8a", regions: ["tpj", "broca"], text: "Reaguje na ważne, niespodziewane bodźce poza centrum uwagi i „przerywa” bieżące zadanie. Działa głównie w prawej półkuli (styk skroniowo-ciemieniowy i brzuszna kora czołowa).", src: ["corbetta2002"] },
  { name: "Obwód nagrody", color: "#ffd23f", regions: ["vta", "nacc", "ofc", "mpfc", "amygdala"], text: "Motywacja i uczenie się przez nagrodę. Kluczowy w uzależnieniach, anhedonii i manii. Dopamina z VTA przewiduje nagrodę, a połączenia z hipokampem i płatami czołowymi zapamiętują, gdzie ona była." },
  { name: "Obwód strachu", color: "#ff5b5b", regions: ["amygdala", "hippocampus", "mpfc", "sgacc", "acc", "lc", "hypothalamus"], text: "Dwie drogi: szybka (wzgórze → ciało migdałowate, przed świadomą oceną) i wolna (przez korę). Ciało migdałowate działa jak gaz, przyśrodkowa kora przedczołowa jak hamulec. Terapia ekspozycyjna wzmacnia hamulec (lewa kora przedczołowa, vmPFC, hipokamp), dlatego ekspozycja musi być stopniowa." },
  { name: "Pętle CSTC (kora – prążkowie – wzgórze – kora)", color: "#5b8def", regions: ["ofc", "acc", "striatum", "thalamus", "motor", "dlpfc"], text: "Równoległe pętle: wykonawcza (DLPFC), uwagi i emocji (zakręt obręczy, jądro półleżące), impulsywności i kompulsji (OFC – jądro ogoniaste) oraz ruchowa. W OCD „zepsuty filtr” jądra ogoniastego sprawia, że kora oczodołowo-czołowa ciągle sygnalizuje „coś jest nie tak”. Zaburzenia w OCD, tikach, ADHD i uzależnieniach (przejście w nawyk).", src: ["vandenheuvel2016", "milad2012"] },
  { name: "Oś stresu HPA", color: "#ff7a45", regions: ["hypothalamus", "pituitary", "hippocampus", "amygdala"], text: "Podwzgórze (CRH) → przysadka (ACTH) → nadnercza (kortyzol). Hipokamp ją hamuje, ciało migdałowate pobudza. Rozregulowana w depresji i PTSD; wczesny stres może ustawić ją na całe życie." },
  { name: "Obwód Papeza (pamięć i emocje)", color: "#7bd88f", regions: ["hippocampus", "mammillary", "thalamus", "acc", "entorhinal"], text: "Hipokamp → (sklepienie) → ciała suteczkowate → przednie jądro wzgórza → zakręt obręczy → kora śródwęchowa → hipokamp. Klasyczny model łączący pamięć z emocjami; uszkodzenie ciał suteczkowatych daje zespół Korsakowa.", src: ["papez1937"] }
];

// Leki i inne związki. `nt` = przekaźniki, na które działają (podświetlają szlaki na mózgu).
// `mode` = co dzieje się w synapsie na rysunku w zakładce „Komórki”.
const DRUGS = [
  { id: "ssri", name: "SSRI", group: "Przeciwdepresyjne", examples: "sertralina, escitalopram, citalopram, fluoksetyna, paroksetyna", nt: ["5ht"], mode: "reuptake",
    action: "Blokują transporter serotoniny (SERT), więc przekaźnik dłużej zostaje w szczelinie synaptycznej.",
    use: "Depresja (leki I rzutu), zaburzenia lękowe, OCD.", note: "Poprawa po 2–4 tygodniach, pełna odpowiedź do ok. 12 tygodni, bo mózg musi przestawić receptory. Hipoteza „niedoboru serotoniny” jest dziś uznawana za zbyt prostą, a efekt względem placebo bywa niewielki. Groźny jest zespół serotoninowy przy łączeniu leków." },
  { id: "snri", name: "SNRI", group: "Przeciwdepresyjne", examples: "wenlafaksyna, duloksetyna", nt: ["5ht", "na"], mode: "reuptake",
    action: "Blokują wychwyt serotoniny i noradrenaliny; w korze czołowej podnoszą też dopaminę.",
    use: "Depresja, zaburzenia lękowe, ból neuropatyczny.", note: "Dobrze działają przeciwlękowo; odstawienie bywa trudne, więc zawsze stopniowo." },
  { id: "bupropion", name: "Bupropion (NDRI)", group: "Przeciwdepresyjne", examples: "bupropion", nt: ["da", "na"], mode: "reuptake",
    action: "Blokuje wychwyt noradrenaliny i dopaminy.",
    use: "Depresja z anhedonią i sennością, rzucanie palenia.", note: "Nie tyje się po nim i rzadko daje dysfunkcje seksualne." },
  { id: "maoi", name: "Inhibitory MAO", group: "Przeciwdepresyjne", examples: "moklobemid", nt: ["5ht", "na", "da"], mode: "degradation",
    action: "Hamują enzym MAO, który rozkłada monoaminy, więc rośnie ich zapas w neuronie i w szczelinie.",
    use: "Depresja (rzadko, gdy inne leki zawiodły).", note: "Ryzyko przełomu nadciśnieniowego z tyraminą z jedzenia (sery, wędzonki) i interakcji z innymi lekami." },
  { id: "tlpd", name: "Trójpierścieniowe (TLPD)", group: "Przeciwdepresyjne", examples: "amitryptylina", nt: ["5ht", "na"], mode: "reuptake",
    action: "Blokują wychwyt serotoniny i noradrenaliny, a przy tym wiele innych receptorów (stąd dużo działań niepożądanych).",
    use: "Depresja, ból neuropatyczny, bezsenność.", note: "Skuteczne, lecz obciążają serce, mogą nasilać jaskrę i tyć." },
  { id: "ketamina", name: "Ketamina i esketamina", group: "Przeciwdepresyjne", examples: "ketamina, esketamina", nt: ["glu"], mode: "antagonist",
    action: "Blokują receptor NMDA dla glutaminianu.",
    use: "Szybko działająca terapia depresji lekoopornej.", note: "Efekt pojawia się w godzinach lub dniach. Wiąże się z odbudową synaps zniszczonych przez stres i depresję." },
  { id: "neuroleptyki1", name: "Neuroleptyki I generacji", group: "Przeciwpsychotyczne", examples: "haloperidol", nt: ["da"], mode: "antagonist",
    action: "Głównie blokada receptora D2. Blokada w drodze mezolimbicznej łagodzi objawy wytwórcze.",
    use: "Schizofrenia i inne psychozy.", note: "Blokada drogi czarno-prążkowiowej daje objawy pozapiramidowe (parkinsonizm, akatyzja, dyskinezy), a guzowo-lejkowej – nadmiar prolaktyny. Groźny jest złośliwy zespół neuroleptyczny: sztywność, gorączka, zaburzenia świadomości." },
  { id: "neuroleptyki2", name: "Neuroleptyki II generacji", group: "Przeciwpsychotyczne", examples: "olanzapina, kwetiapina, risperidon, arypiprazol", nt: ["da", "5ht"], mode: "antagonist",
    action: "Blokują D2 oraz receptory serotoninowe (5-HT2A).",
    use: "Schizofrenia, choroba dwubiegunowa, zaburzenia zachowania w otępieniu.", note: "Lepiej działają na objawy negatywne, ale częściej dają tycie i zespół metaboliczny. Niedobór dopaminy w drodze mezokortykalnej (objawy negatywne) trudno wyrównać blokadą D2." },
  { id: "benzo", name: "Benzodiazepiny", group: "Przeciwlękowe i nasenne", examples: "diazepam, alprazolam, klonazepam", nt: ["gaba"], mode: "agonist",
    action: "Wzmacniają działanie GABA na receptorze GABA-A (ten sam receptor, na który działa alkohol).",
    use: "Ostry lęk, drgawki, bezsenność, odstawienie alkoholu.", note: "Działają szybko, ale dają tolerancję i uzależnienie, więc stosuje się je najwyżej 2–4 tygodnie. Nie są lekami pierwszego wyboru w zaburzeniach lękowych." },
  { id: "stymulanty", name: "Stymulanty", group: "ADHD", examples: "metylofenidat", nt: ["da", "na"], mode: "reuptake",
    action: "Blokują wychwyt dopaminy i noradrenaliny (metylofenidat), co poprawia działanie sieci wykonawczej.",
    use: "ADHD.", note: "Atomoksetyna działa głównie przez noradrenalinę." },
  { id: "ache", name: "Inhibitory acetylocholinesterazy", group: "Choroba Alzheimera", examples: "donepezil, rywastygmina", nt: ["ach"], mode: "degradation",
    action: "Hamują enzym rozkładający acetylocholinę, więc przekaźnika w szczelinie jest więcej.",
    use: "Choroba Alzheimera, otępienie z ciałami Lewy'ego.", note: "Spowalniają objawy, nie zatrzymują choroby." },
  { id: "memantyna", name: "Memantyna", group: "Choroba Alzheimera", examples: "memantyna", nt: ["glu"], mode: "antagonist",
    action: "Łagodnie blokuje receptor NMDA, chroniąc przed nadmiarem glutaminianu (ekscytotoksycznością).",
    use: "Umiarkowane i ciężkie otępienie w chorobie Alzheimera.", note: "Stosowana osobno lub z inhibitorem acetylocholinesterazy." },
  { id: "lit", name: "Lit i stabilizatory nastroju", group: "Stabilizatory", examples: "lit, walproinian, karbamazepina, lamotrygina", nt: [], mode: "none",
    action: "Działają głównie wewnątrz komórki (np. hamowanie GSK-3 przez lit), nie na jeden przekaźnik.",
    use: "Choroba afektywna dwubiegunowa.", note: "Lit jest jedynym lekiem o udowodnionym działaniu przeciwsamobójczym; wymaga kontroli stężenia we krwi. Walproiniany są przeciwwskazane w ciąży." },
  { id: "alkohol", name: "Alkohol", group: "Substancje psychoaktywne", examples: "etanol", nt: ["gaba", "glu", "da"], mode: "agonist",
    action: "Wzmacnia hamujące receptory GABA-A i osłabia pobudzające NMDA, a przez to podnosi dopaminę w układzie nagrody.",
    use: "Brak zastosowania leczniczego.", note: "Przewlekłe picie zmniejsza liczbę receptorów GABA; stąd drgawki i pobudzenie przy odstawieniu." },
  { id: "opioidy", name: "Opioidy", group: "Substancje psychoaktywne", examples: "morfina, heroina, fentanyl", nt: ["da"], mode: "agonist",
    action: "Pobudzają receptory opioidowe μ; w VTA hamują neurony GABA, które hamowały neurony dopaminowe, więc dopamina w jądrze półleżącym rośnie.",
    use: "Ból (leczniczo).", note: "W pniu mózgu receptory μ hamują ośrodek oddechowy, dlatego przedawkowanie grozi śmiercią. Naltrekson jest antagonistą." }
];

const SOURCES = {
  lariviere2021: ["Larivière i in. (2021). The ENIGMA Toolbox: multiscale neural contextualization of multisite neuroimaging datasets. Nature Methods, 18, 698–700. Źródło liczb na mapach i modeli struktur podkorowych.", "https://github.com/MICA-MNI/ENIGMA"],
  schmaal2017: ["Schmaal i in. (2017). Cortical abnormalities in adults and adolescents with major depression (ENIGMA MDD). Molecular Psychiatry, 22, 900–909.", "https://doi.org/10.1038/mp.2016.60"],
  boedhoe2017: ["Boedhoe i in. (2017). Distinct subcortical volume alterations in pediatric and adult OCD (ENIGMA OCD). American Journal of Psychiatry, 174, 60–69.", "https://doi.org/10.1176/appi.ajp.2016.16020201"],
  boedhoe2018: ["Boedhoe i in. (2018). Cortical abnormalities associated with pediatric and adult OCD (ENIGMA OCD). American Journal of Psychiatry, 175, 453–462.", "https://doi.org/10.1176/appi.ajp.2017.17050485"],
  hoogman2019: ["Hoogman i in. (2019). Brain imaging of the cortex in ADHD: a coordinated analysis of large-scale clinical and population-based samples. American Journal of Psychiatry, 176, 531–542.", "https://doi.org/10.1176/appi.ajp.2019.18091033"],
  vanrooij2018: ["van Rooij i in. (2018). Cortical and subcortical brain morphometry differences between patients with autism spectrum disorder and healthy individuals (ENIGMA ASD). American Journal of Psychiatry, 175, 359–369.", "https://doi.org/10.1176/appi.ajp.2017.17010100"],
  fischl2012: ["Fischl (2012). FreeSurfer. NeuroImage, 62, 774–781; Desikan i in. (2006). An automated labeling system for subdividing the human cerebral cortex. NeuroImage, 31, 968–980. Powierzchnia kory fsaverage5 i podział na 68 obszarów.", "https://doi.org/10.1016/j.neuroimage.2006.01.021"],
  fonov2011: ["Fonov i in. (2011). Unbiased average age-appropriate atlases for pediatric studies (szablon MNI152 ICBM 2009). NeuroImage, 54, 313–327. Źródło modelu móżdżku i pnia.", "https://doi.org/10.1016/j.neuroimage.2010.07.033"],
  schmaal2016: ["Schmaal i in. (2016). Subcortical brain alterations in major depressive disorder: findings from the ENIGMA MDD working group. Molecular Psychiatry, 21, 806–812.", "https://doi.org/10.1038/mp.2015.69"],
  drevets1997: ["Drevets i in. (1997). Subgenual prefrontal cortex abnormalities in mood disorders. Nature, 386, 824–827.", "https://doi.org/10.1038/386824a0"],
  mayberg2005: ["Mayberg i in. (2005). Deep brain stimulation for treatment-resistant depression. Neuron, 45, 651–660.", "https://doi.org/10.1016/j.neuron.2005.02.014"],
  hibar2018: ["Hibar i in. (2018). Cortical abnormalities in bipolar disorder: an MRI analysis of 6503 individuals from the ENIGMA BD Working Group. Molecular Psychiatry, 23, 932–942.", "https://doi.org/10.1038/mp.2017.73"],
  hibar2016: ["Hibar i in. (2016). Subcortical volumetric abnormalities in bipolar disorder. Molecular Psychiatry, 21, 1710–1716.", "https://doi.org/10.1038/mp.2015.227"],
  vanerp2016: ["van Erp i in. (2016). Subcortical brain volume abnormalities in 2028 individuals with schizophrenia and 2540 healthy controls via the ENIGMA consortium. Molecular Psychiatry, 21, 547–553.", "https://doi.org/10.1038/mp.2015.63"],
  vanerp2018: ["van Erp i in. (2018). Cortical brain abnormalities in 4474 individuals with schizophrenia and 5098 control subjects (ENIGMA). Biological Psychiatry, 84, 644–654.", "https://doi.org/10.1016/j.biopsych.2018.04.023"],
  howes2009: ["Howes & Kapur (2009). The dopamine hypothesis of schizophrenia: version III. Schizophrenia Bulletin, 35, 549–562.", "https://doi.org/10.1093/schbul/sbp006"],
  etkin2007: ["Etkin & Wager (2007). Functional neuroimaging of anxiety: a meta-analysis of emotional processing in PTSD, social anxiety disorder, and specific phobia. American Journal of Psychiatry, 164, 1476–1488.", "https://doi.org/10.1176/appi.ajp.2007.07030504"],
  shin_ptsd: ["Hughes & Shin (2011). Functional neuroimaging studies of post-traumatic stress disorder. Expert Review of Neurotherapeutics (PMC3142267).", "https://pmc.ncbi.nlm.nih.gov/articles/PMC3142267"],
  alexandra_ptsd: ["Koenigs & Grafman (2009). Posttraumatic stress disorder: the role of medial prefrontal cortex and amygdala. The Neuroscientist (PMC2771687).", "https://pmc.ncbi.nlm.nih.gov/articles/PMC2771687"],
  vandenheuvel2016: ["van den Heuvel i in. (2016). Brain circuitry of compulsivity. European Neuropsychopharmacology, 26, 810–827.", "https://www.repository.cam.ac.uk/bitstream/1810/253154/1/van%20den%20Heuvel%202016%20European%20Neuropsychopharmacology.pdf"],
  milad2012: ["Milad & Rauch (2012). Obsessive-compulsive disorder: beyond segregated cortico-striatal pathways. Trends in Cognitive Sciences, 16, 43–51 (PMC4955838).", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4955838"],
  boedhoe2020: ["Boedhoe i in. (2020). Subcortical brain volume, regional cortical thickness, and cortical surface area across disorders: ENIGMA ADHD, ASD, and OCD. American Journal of Psychiatry, 177, 834–843.", "https://ajp.psychiatryonline.org/doi/10.1176/appi.ajp.2020.19030331"],
  hoogman2017: ["Hoogman i in. (2017). Subcortical brain volume differences in participants with ADHD in children and adults: a cross-sectional mega-analysis. Lancet Psychiatry, 4, 310–319.", "https://doi.org/10.1016/S2215-0366(17)30049-4"],
  shaw2007: ["Shaw i in. (2007). Attention-deficit/hyperactivity disorder is characterized by a delay in cortical maturation. PNAS, 104, 19649–19654.", "https://doi.org/10.1073/pnas.0707741104"],
  walton2022: ["Walton i in. (2022). Brain structure in acutely underweight and partially weight-restored individuals with anorexia nervosa (ENIGMA Eating Disorders). Biological Psychiatry, 92, 730–738.", "https://doi.org/10.1016/j.biopsych.2022.04.022"],
  koob2010: ["Koob & Volkow (2010). Neurocircuitry of addiction. Neuropsychopharmacology, 35, 217–238.", "https://pmc.ncbi.nlm.nih.gov/articles/PMC2805560"],
  koob2016: ["Koob & Volkow (2016). Neurobiology of addiction: a neurocircuitry analysis. Lancet Psychiatry, 3, 760–773.", "https://pmc.ncbi.nlm.nih.gov/articles/6135092/"],
  schulze2016: ["Schulze, Schmahl & Niedtfeld (2016). Neural correlates of disturbed emotion processing in borderline personality disorder: a multimodal meta-analysis. Biological Psychiatry, 79, 97–106.", "https://doi.org/10.1016/j.biopsych.2015.03.027"],
  dacosta2021: ["Fernandes da Costa i in. (2021). Parsing variability in borderline personality disorder: a meta-analysis of neuroimaging studies. Translational Psychiatry, 11, 314.", "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8144551/"],
  braak1991: ["Braak & Braak (1991). Neuropathological stageing of Alzheimer-related changes. Acta Neuropathologica, 82, 239–259.", "https://doi.org/10.1007/BF00308809"],
  seeley2006: ["Seeley i in. (2006). Early frontotemporal dementia targets neurons unique to apes and humans. Annals of Neurology, 60, 660–667.", "https://doi.org/10.1002/ana.21055"],
  vanerp_cross: ["van Erp i in. (2022). Cross-disorder comparisons of brain structure in schizophrenia, bipolar disorder, MDD and 22q11.2DS: a review of ENIGMA findings. Psychiatry and Clinical Neurosciences.", "https://doi.org/10.1111/pcn.13337"],
  corbetta2002: ["Corbetta & Shulman (2002). Control of goal-directed and stimulus-driven attention in the brain. Nature Reviews Neuroscience, 3, 201–215.", "https://doi.org/10.1038/nrn755"],
  papez1937: ["Papez (1937). A proposed mechanism of emotion. Archives of Neurology and Psychiatry, 38, 725–743.", "https://doi.org/10.1001/archneurpsyc.1937.02260220069003"],
  menon2011: ["Menon (2011). Large-scale brain networks and psychopathology: a unifying triple network model. Trends in Cognitive Sciences, 15, 483–506.", "https://doi.org/10.1016/j.tics.2011.08.003"]
};
