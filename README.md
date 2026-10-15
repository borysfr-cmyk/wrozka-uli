# Tajemnice Magii

Darmowa aplikacja do wróżenia z tarota. Wróżbę prowadzi **Aylena**, elfia wróżka w klimacie wysokiej fantasy.

- Pełna talia 78 kart Rider–Waite–Smith (1909, domena publiczna).
- Dwie sfery: **miłość i związki** oraz **finanse i biznes**.
- Rozkłady: **Krzyż Celtycki** (10 kart, ok. 2–3 minuty) i **Trzy karty** (przeszłość, teraźniejszość, przyszłość).
- Aylena czyta wróżbę na głos (synteza mowy przeglądarki, można wyłączyć).
- Na końcu podsumowanie do pobrania jako **PDF** lub **obraz PNG** oraz **link do udostępnienia**.
- Limit darmowych wróżb dziennie (na czas testów wyłączony). Historia wróżb („Księga wróżb”) zapisuje się w przeglądarce, bez zakładania konta.

## Scena z Ayleną

Cała strona to komnata wróżki: realistyczny obraz Ayleny przy stole (`public/aylena.webp`), ożywiony animacjami. Kadr delikatnie „oddycha” i podąża za kursorem, świeca migocze, a podczas seansu karty wylatują z dłoni Ayleny na zielony obrus. Kliknięcie w Aylenę sprawia, że coś do Ciebie powie.

Żeby podmienić obraz, wgraj nowy plik do `public/` i popraw ułamki w `src/data/aylena.ts` (położenie dłoni, świecy, stołu i twarzy).

## Jak wróżby się nie powtarzają

1. **Gemini (AI)**: po wpisaniu darmowego klucza w ustawieniach (⚙) każdą wróżbę pisze od nowa Google Gemini. Do zapytania trafiają losowy motyw i ton oraz początki ostatnich wróżb, których AI ma unikać.
2. **Księga Ayleny (bez AI)**: gdy klucza brak albo AI nie odpowiada, teksty składa wbudowany generator z bazy znaczeń 78 kart. Każda pula zdań rotuje, a odcisk każdego zdania jest zapamiętywany, więc identyczny tekst nie pojawi się drugi raz.

Do tego każda wróżba to losowanie z pełnej talii (kryptograficzny generator liczb losowych, tasowanie Fishera–Yatesa).

### Darmowy klucz Gemini

1. Wejdź na <https://aistudio.google.com/apikey> i utwórz klucz (wystarczy konto Google).
2. W aplikacji kliknij ⚙, wklej klucz i naciśnij „Sprawdź klucz”.

Klucz zapisuje się tylko w przeglądarce osoby, która go wpisała. Można też wpisać go przy budowaniu (`VITE_GEMINI_API_KEY` w pliku `.env`), ale wtedy klucz będzie widoczny w kodzie strony dla każdego odwiedzającego.

## Uruchomienie

Wymagany Node.js 18 lub nowszy.

```bash
npm install
npm run dev      # wersja deweloperska: http://localhost:5173
npm run build    # gotowa strona w folderze dist/
npm test         # testy talii i niepowtarzalności
```

Po każdej zmianie na gałęzi `main` GitHub Actions buduje stronę i publikuje ją na gałęzi `gh-pages`, czyli pod adresem https://borysfr-cmyk.github.io/wrozka-uli/ (GitHub Pages z gałęzi `gh-pages`).

Folder `dist/` to zwykła strona statyczna (HTML, CSS, JS i obrazki kart), którą można wrzucić na dowolny hosting, np. GitHub Pages.

### Ustawienia przy budowaniu (`.env`)

| Zmienna | Znaczenie | Domyślnie |
|---|---|---|
| `VITE_DAILY_LIMIT` | darmowe wróżby dziennie (0 = bez limitu) | `0` (na czas testów) |
| `VITE_GEMINI_API_KEY` | klucz Gemini wbudowany w stronę | brak |

## Struktura

```
src/data/cards.ts       78 kart: nazwy, słowa-klucze, znaczenia w miłości i finansach, rada
src/data/spreads.ts     rozkłady i pozycje
src/engine/generator.ts Księga Ayleny: generator tekstów z pamięcią niepowtarzalności
src/engine/ai.ts        teksty z Google Gemini
src/engine/reading.ts   losowanie kart i składanie wróżby
src/engine/share.ts     PDF, obraz i link do udostępnienia
src/engine/speech.ts    głos Ayleny
src/data/aylena.ts      położenie dłoni, świecy i stołu na obrazie sceny
src/components/Scene.tsx scena na całą stronę z Ayleną
src/components/         ekrany: wybór, tasowanie, seans, podsumowanie, księga, ustawienia
public/karty/           obrazy kart (WebP)
```

## Uwagi

Wróżby mają charakter rozrywkowy i nie zastępują porady specjalisty. Aplikacja nie korzysta z nazw ani postaci z utworów J.R.R. Tolkiena; klimat fantasy jest własny.

Obrazy kart pochodzą z pakietu npm `@cometpisces/tarot-kit-images` (talia Rider–Waite–Smith z 1909 r., uznawana za domenę publiczną) i zostały przekonwertowane do WebP.
