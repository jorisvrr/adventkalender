/**
 * Inhoud van de kalender: één plek voor alle teksten, beloningen,
 * afbeeldingen en ontgrendeldata.
 *
 * Een dag toevoegen (bijvoorbeeld dag 4):
 *   1. Voeg hieronder een object toe met `day: 4` en een `type`.
 *   2. Bestaat dat type al (kraskaart, woordzoeker, fotopuzzel), dan ben je klaar.
 *   3. Nieuw soort activiteit? Maak een component in src/games/ en koppel het
 *      type in src/games/registry.tsx.
 * Dagen die hier niet staan, blijven publiek gesloten (alleen nummer en slotje), ook na
 * hun datum. In ontwikkelaarsmodus (/#/dev) zie je welke dagen nog leeg zijn.
 * Een dag toevoegen wist geen bestaande voortgang van andere dagen.
 *
 * Ontgrendelen: standaard opent dag N op N december (settings.year) om 00:00
 * Europe/Amsterdam. Wil je een andere datum, zet dan `opensOn: 'JJJJ-MM-DD'`.
 */

/** Meegeleverde voorbeeldafbeelding. Zolang een dag die gebruikt, meldt de ontwikkelaarsmodus dat. */
export const VOORBEELDAFBEELDING = '/images/dag-3-placeholder.svg'

/**
 * Foto voor de puzzel van dag 3. Vervang door bijvoorbeeld '/images/wij.jpg' (zet het bestand
 * in public/images/, vierkant werkt het mooist) en pas `imageAlt` bij dag 3 aan.
 */
const DAG_3_FOTO = VOORBEELDAFBEELDING

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
  /** Label boven het invoerveld dat verschijnt als alle woorden gevonden zijn. */
  answerLabel: string
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
      'Ook al zijn we niet altijd op dezelfde plek, ik wilde toch elke dag een beetje bij je zijn. Daarom: 24 kleine verrassingen, speciaal voor jou.',
    revealButton: 'Onthul mijn bericht',
  },
  {
    day: 2,
    type: 'woordzoeker',
    title: 'Zoek je verrassing',
    instruction: 'Zoek de zes woorden. Neem daarna de beginletters van de woorden.',
    answerLabel: 'Vul hier je eerste 6 letters in',
    // Gecontroleerd in src/lib/wordsearch.test.ts: elk woord staat er precies één keer in,
    // alleen horizontaal (links → rechts) of verticaal (boven → onder).
    // Pas je het rooster of de woorden aan, dan begint opgeslagen voortgang van deze dag opnieuw.
    grid: [
      'KIKKERWB',
      'HUGZFJVC',
      'BNOODLES',
      'ZPWHGUYN',
      'FAJCVBHO',
      'GSROOKIE',
      'WTUBZFJP',
      'MAASHGCW',
    ],
    words: ['KIKKER', 'PASTA', 'NOODLES', 'ROOKIE', 'SNOEP', 'MAAS'],
    solution: 'KPNRSM',
    rewardMessage: 'Goed gevonden! App mij deze letters, dan krijg je een cadeau.',
    hints: {
      search:
        'Woorden staan alleen van links naar rechts of van boven naar beneden. Sleep over de letters, of tik op de eerste en daarna op de laatste letter.',
      code: 'Neem van elk woord in de lijst de eerste letter, van boven naar beneden: K, P, … Samen zijn dat 6 letters.',
    },
    wrongAnswer: 'Nog niet helemaal. Probeer het nog eens.',
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
