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

/** Foto's staan in public/images/advent/. */
const foto = (bestand: string) => `/images/advent/${bestand}`

/**
 * Uitsnede van een foto: focuspunt in procenten van de breedte/hoogte (0–100) en
 * zoomfactor (1 = hele foto). Er ontstaan nooit lege randen: bij de rand schuift de
 * uitsnede vanzelf naar binnen.
 */
export interface Crop {
  x: number
  y: number
  zoom: number
}

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

export interface MemoryDay extends BaseDay {
  type: 'memory'
  intro: string
  /** Elke foto wordt een paar (dus twee kaartjes). */
  cards: { image: string; alt: string; crop: Crop }[]
  doneMessage: string
}

export interface CloseUpDay extends BaseDay {
  type: 'closeup'
  intro: string
  rounds: {
    image: string
    alt: string
    /** Waar de eerste, kleinste uitsnede op inzoomt. */
    focus: { x: number; y: number }
    /** Zoomfactoren per stap; de laatste moet 1 zijn (hele foto). */
    zoomSteps: number[]
    options: string[]
    /** Moet letterlijk een van de opties zijn. */
    answer: string
  }[]
  correctMessage: string
  wrongMessage: string
  doneMessage: string
}

export interface GiftDay extends BaseDay {
  type: 'cadeau'
  /** Tekst bij het ingepakte cadeau. */
  tapLabel: string
  image: string
  imageAlt: string
  message: string
}

export interface PlaceholderDay extends BaseDay {
  type: 'placeholder'
}

export type DayConfig = ScratchDay | WordSearchDay | PhotoPuzzleDay | MemoryDay | CloseUpDay | GiftDay | PlaceholderDay

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
    image: foto('dag-03-puzzel-selfie.jpeg'),
    imageAlt: 'Selfie van ons samen',
    size: 3,
    doneMessage: 'Jij maakt het plaatje compleet. ❤️',
  },
  {
    day: 6,
    type: 'memory',
    title: 'Memory',
    intro: 'Tik twee kaartjes om en zoek de paren.',
    // Pas je de foto's aan, dan begint opgeslagen voortgang van deze dag opnieuw.
    cards: [
      { image: foto('dag-06-memory-01-water-huizen.jpeg'), alt: 'Huizen aan het water', crop: { x: 55, y: 45, zoom: 1.35 } },
      { image: foto('dag-06-memory-02-broodje.jpeg'), alt: 'Jij met een broodje', crop: { x: 45, y: 42, zoom: 1.3 } },
      { image: foto('dag-06-memory-03-pizza-eten.jpeg'), alt: 'Jij die pizza eet', crop: { x: 45, y: 33, zoom: 1.3 } },
      { image: foto('dag-06-memory-04-pizzas.jpeg'), alt: "Pizza's op tafel", crop: { x: 45, y: 55, zoom: 1.3 } },
      { image: foto('dag-06-memory-05-boot.jpeg'), alt: 'Jij op de boot', crop: { x: 60, y: 68, zoom: 1.2 } },
      { image: foto('dag-06-memory-06-stadion.jpeg'), alt: 'Het stadion', crop: { x: 50, y: 62, zoom: 1.4 } },
    ],
    doneMessage: 'Alle paren gevonden!',
  },
  {
    day: 17,
    type: 'closeup',
    title: 'Wat zie je hier?',
    intro: 'Raad wat er op de foto staat. Lastig? Zoom dan uit.',
    rounds: [
      {
        image: foto('dag-17-close-up-01-burrata.jpeg'),
        alt: 'Burrata op een bord',
        focus: { x: 47, y: 54 },
        zoomSteps: [7, 4, 2.2, 1],
        options: ['Burrata', 'Risotto', 'Vanille-ijs'],
        answer: 'Burrata', // voorlopige benaming, pas gerust aan (ook in options)
      },
      {
        image: foto('dag-17-close-up-02-sushi.jpeg'),
        alt: 'Een schaal sushi',
        focus: { x: 40, y: 46 },
        zoomSteps: [6, 3.5, 2, 1],
        options: ['Sushi', 'Pokébowl', 'Noedels'],
        answer: 'Sushi',
      },
      {
        image: foto('dag-17-close-up-03-jij.jpeg'),
        alt: 'Jij',
        focus: { x: 49, y: 44 },
        zoomSteps: [8, 4, 2, 1],
        options: ['Jij', 'Joris', 'Een filmster'],
        answer: 'Jij',
      },
    ],
    correctMessage: 'Goed geraden!',
    wrongMessage: 'Nee, dat is het niet. Probeer het nog eens.',
    doneMessage: 'Alle drie goed geraden!',
  },
  {
    day: 20,
    type: 'fotopuzzel',
    title: 'Nog meer stukjes',
    intro: 'Tik op twee stukjes om ze van plek te wisselen.',
    image: foto('dag-20-puzzel-pasta.jpeg'),
    imageAlt: 'Jij met een vork vol pasta',
    size: 3,
    doneMessage: 'Puzzel compleet!',
  },
  {
    day: 24,
    type: 'cadeau',
    title: 'Het laatste pakje',
    tapLabel: 'Tik op het pakje',
    image: foto('dag-24-finale-eiffeltoren.jpeg'),
    imageAlt: 'Wij samen bij de Eiffeltoren',
    message: 'Fijne kerst, lieverd.',
  },
]

export function getDay(day: number): DayConfig {
  return days.find((d) => d.day === day) ?? { day, type: 'placeholder', title: `Dag ${day}` }
}
