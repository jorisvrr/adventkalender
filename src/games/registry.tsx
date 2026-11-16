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
