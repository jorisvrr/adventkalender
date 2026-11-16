import type { DayConfig } from '../content/days'
import { PhotoPuzzle, type PhotoPuzzleState } from './PhotoPuzzle'
import { ScratchCard } from './ScratchCard'
import { WordSearch, type WordSearchState } from './WordSearch'

interface Props {
  config: DayConfig
  saved: unknown
  completed: boolean
  onState: (state: unknown) => void
  onComplete: () => void
}

/**
 * Sleutel van de inhoud waar opgeslagen spelstaat van afhangt. Verandert de sleutel
 * (bijvoorbeeld een nieuw rooster), dan begint die dag opnieuw. undefined = voortgang
 * hangt niet af van de inhoud (een tekstwijziging wist dus niets).
 */
export function contentKey(config: DayConfig): string | undefined {
  switch (config.type) {
    case 'woordzoeker':
      return `woordzoeker:${config.grid.join('/')}|${config.words.join(',')}|${config.solution}`
    default:
      return undefined
  }
}

/** Koppelt het `type` uit days.ts aan een spelcomponent. Nieuw type? Voeg hier een regel toe. */
export function GameForDay({ config, saved, ...rest }: Props) {
  switch (config.type) {
    case 'kraskaart':
      return <ScratchCard config={config} saved={undefined} {...rest} />
    case 'woordzoeker':
      return <WordSearch config={config} saved={saved as WordSearchState | undefined} {...rest} />
    case 'fotopuzzel':
      return <PhotoPuzzle config={config} saved={saved as PhotoPuzzleState | undefined} {...rest} />
    case 'placeholder':
      return null
  }
}
