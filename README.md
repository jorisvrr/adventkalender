# Adventskalender

Persoonlijke adventskalender-webapp (Vite + React + TypeScript). Geen backend: voortgang staat in `localStorage` op de telefoon.

## Starten

```bash
npm install
npm run dev          # http://localhost:5173
npm run dev:lan      # build + serveer op je netwerk (telefoon, zelfde wifi), poort 4173
npm run build        # productiebuild in dist/
npm run preview      # bekijk de build
npm test             # unit-tests (rooster, datums, puzzel, codes)
npm run test:e2e     # browsertests (Android- en iPhone-viewport)
```

Scripts roepen tools aan via `node node_modules/...`, omdat `::` in de mapnaam `npm run` anders breekt.

Deployen kan als statische site (bijv. Vercel: framework Vite, output `dist`).

## Toegang

- `3012`: vriendinmodus (vakjes openen vanaf N december 2026, Europe/Amsterdam).
- `1502`: ontwikkelaarsmodus (alles open, eigen testvoortgang, paneel met voorbeeld-datum en resets).

De codes zijn een eenvoudige toegangspoort, geen beveiliging: ze staan in de broncode.

## Inhoud aanpassen

| Wat | Waar |
| --- | --- |
| Teksten, titels, beloning, hints, rooster dag 2, ontgrendeldata | `src/content/days.ts` |
| Foto voor dag 3 | `DAG_3_FOTO` bovenaan `src/content/days.ts`; zet het bestand in `public/images/` (vierkant werkt het mooist) |
| Jaar, tijdzone, codes, landingsteksten | `src/content/settings.ts` |

Dag 4 t/m 24 toevoegen: zet een nieuw object in de `days`-lijst. Dagen die er niet in staan tonen automatisch "De verrassing wordt nog klaargemaakt". Een nieuw soort activiteit maak je in `src/games/` en koppel je in `src/games/registry.tsx`.

Pas je het woordzoekerrooster aan, draai dan `npm test`: die controleert dat elk woord er precies één keer in staat.

## Structuur

- `src/content/`: alle inhoud en instellingen
- `src/games/`: kraskaart, woordzoeker, fotopuzzel (kennen de opslag niet)
- `src/lib/`: datumlogica, voortgangsopslag (`vriendin` en `test` apart), sessie, spellogica
- `src/components/`: landing, kalender, dagweergave, ontwikkelaarspaneel
