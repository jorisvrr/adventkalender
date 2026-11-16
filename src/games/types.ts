/** Wat elk spel van de dagweergave krijgt. Spellen kennen de opslag zelf niet. */
export interface GameProps<Config, State> {
  config: Config
  /** Eerder opgeslagen spelstaat, of undefined bij de eerste keer. */
  saved: State | undefined
  completed: boolean
  onState: (state: State) => void
  onComplete: () => void
}
