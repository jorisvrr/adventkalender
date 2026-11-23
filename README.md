# Adventskalender

Persoonlijke adventskalender-webapp (Vite + React + TypeScript). Geen backend: voortgang staat in `localStorage` op de telefoon.

## Starten

```bash
npm install
npm run dev          # http://localhost:5173
npm run dev:lan      # build + serveer op je netwerk (telefoon, zelfde wifi), poort 4173
npm run build        # typecheck + unit-tests + productiebuild in dist/ (stopt bij kapotte inhoud)
npm run preview      # bekijk de build
npm test             # unit-tests (rooster, datums, puzzel, codes)
npm run test:e2e     # browsertests (Android- en iPhone-viewport)
```

Scripts roepen tools aan via `node node_modules/...`, omdat `::` in de mapnaam `npm run` anders breekt.

Deployen kan als statische site (bijv. Vercel: framework Vite, output `dist`).

## Toegang

- **Publiek** (de link die je deelt): startpagina met één knop, "Open de kalender". Vakje N opent op N december 2026 (Europe/Amsterdam), ook directe links zoals `#/dag/5` blijven tot dan dicht. Een vakje zonder inhoud blijft publiek gesloten, ook na zijn datum.
- **Ontwikkelaarsmodus**: `/#/dev`, code `1502`. Alles open, eigen testvoortgang, preview met voorbeeld-datum, resets en een inhoudsstatus (welke dagen nog leeg zijn, voorbeeldafbeelding, afbeeldingen die niet laden). Nergens publiek gelinkt.

De modus volgt uit de route: publieke routes lezen nooit iets van een ontwikkelaarssessie. De code en alle inhoud staan wel in de JavaScript van de site; dit is een persoonlijke toegangspoort, geen beveiliging.

## Inhoud aanpassen

| Wat | Waar |
| --- | --- |
| Teksten, titels, beloning, hints, rooster dag 2, ontgrendeldata | `src/content/days.ts` |
| Foto's | `public/images/advent/` (originelen, ongewijzigd). Uitsneden (focuspunt + zoom) en antwoorden per dag in `src/content/days.ts` |
| Jaar, tijdzone, codes, landingsteksten | `src/content/settings.ts` |

Dag 4 t/m 24 toevoegen: zet een nieuw object in de `days`-lijst. Bestaande voortgang blijft staan. Dagen die er niet in staan blijven publiek gesloten; in `/#/dev` zie je welke nog leeg zijn. Een nieuw soort activiteit maak je in `src/games/` en koppel je in `src/games/registry.tsx`.

Pas je het woordzoekerrooster aan, draai dan `npm test`: die controleert dat elk woord er precies één keer in staat. Opgeslagen voortgang van die dag hoort bij het oude rooster en wordt dan automatisch genegeerd (zie `contentKey` in `src/games/registry.tsx`).

## Structuur

- `src/content/`: alle inhoud en instellingen
- `src/games/`: kraskaart, woordzoeker, fotopuzzel, memory, close-up, cadeau (kennen de opslag niet)
- `src/lib/`: datumlogica, voortgangsopslag (`vriendin` en `test` apart), sessie, spellogica
- `src/components/`: landing, kalender, dagweergave, ontwikkelaarspaneel
