/**
 * Inhoud van de kalender: één plek voor alle teksten, beloningen,
 * afbeeldingen en ontgrendeldata.
 *
 * Een dag toevoegen (bijvoorbeeld dag 4):
 *   1. Voeg hieronder een object toe met `day: 4` en een `type`.
 *   2. Bestaat dat type al (kraskaart, woordzoeker, fotopuzzel), dan ben je klaar.
 *   3. Nieuw soort activiteit? Maak een component in src/games/ en koppel het
 *      type in src/games/registry.tsx.
 * Dagen die hier niet staan, tonen automatisch "De verrassing wordt nog klaargemaakt".
 *
 * Ontgrendelen: standaard opent dag N op N december (settings.year) om 00:00
 * Europe/Amsterdam. Wil je een andere datum, zet dan `opensOn: 'JJJJ-MM-DD'`.
 */

/** Foto voor de puzzel van dag 3. Vervang door bijvoorbeeld '/images/wij.jpg' (zet het bestand in public/images/). */
const DAG_3_FOTO = '/images/dag-3-placeholder.svg'

interface BaseDay {
  day: number
  title: string
  /** Optioneel: afwijkende ontgrendeldatum, 'JJJJ-MM-DD' in Amsterdamse tijd. */
  opensOn?: string
}

export interface ScratchDay extends BaseDay {
  type: 'kraskaart'
  intro: string
  coverLabel: string
  message: string
  revealButton: string
}

export interface WordSearchDay extends BaseDay {
  type: 'woordzoeker'
  instruction: string
  /** Rooster, één string per rij. Alle rijen even lang. */
  grid: string[]
  /** Woorden in de vaste volgorde van de lijst. */
  words: string[]
  solution: string
  rewardMessage: string
  hints: { search: string; code: string }
  wrongAnswer: string
}

export interface PhotoPuzzleDay extends BaseDay {
  type: 'fotopuzzel'
  intro: string
  image: string
  imageAlt: string
  size: number
  doneMessage: string
}

export interface PlaceholderDay extends BaseDay {
  type: 'placeholder'
}

export type DayConfig = ScratchDay | WordSearchDay | PhotoPuzzleDay | PlaceholderDay

export const days: DayConfig[] = [
  {
    day: 1,
    type: 'kraskaart',
    title: 'Een klein begin',
    intro: 'Kras het kaartje open met je vinger.',
    coverLabel: 'Kras hier',
    message:
      'Ook al zijn we niet altijd op dezelfde plek, ik wilde toch elke dag een beetje bij je zijn. Daarom: 24 kleine verrassingen, speciaal voor jou. ❤️',
    revealButton: 'Onthul mijn bericht',
  },
  {
    day: 2,
    type: 'woordzoeker',
    title: 'Zoek je verrassing',
    instruction:
      'Vind alle zes woorden. Lees daarna de eerste letters van de woorden in de lijst van boven naar beneden. Welk woord krijg je?',
    // Gecontroleerd in src/lib/wordsearch.test.ts: elk woord staat er precies één keer in,
    // alleen horizontaal (links → rechts) of verticaal (boven → onder).
    grid: [
      'BKSWPFGZ',
      'PCHOCOLA',
      'ALKSBUFR',
      'VGZPWIKM',
      'OSBKETEN',
      'NFWGLJSP',
      'DROOMEYK',
      'ZPKBSWFG',
    ],
    words: ['CHOCOLA', 'AVOND', 'DROOM', 'ETEN', 'ARM', 'UITJE'],
    solution: 'CADEAU',
    rewardMessage:
      'Goed gevonden! Je hebt €5 gewonnen om iets leuks voor jezelf te halen. Stuur mij een screenshot, dan regel ik het 💸',
    hints: {
      search:
        'Woorden staan alleen van links naar rechts of van boven naar beneden. Sleep over de letters, of tik op de eerste en daarna op de laatste letter.',
      code: 'Pak van elk woord in de lijst de eerste letter: C, A, … en lees ze achter elkaar.',
    },
    wrongAnswer: 'Bijna! Dat is het nog niet. Lees de eerste letters nog eens van boven naar beneden.',
  },
  {
    day: 3,
    type: 'fotopuzzel',
    title: 'Stukjes van ons',
    intro: 'Tik op twee stukjes om ze van plek te wisselen.',
    image: DAG_3_FOTO,
    imageAlt: 'Een winterse avond met twee lichtjes naast elkaar',
    size: 3,
    doneMessage: 'Jij maakt het plaatje compleet. ❤️',
  },
]

export function getDay(day: number): DayConfig {
  return days.find((d) => d.day === day) ?? { day, type: 'placeholder', title: `Dag ${day}` }
}
