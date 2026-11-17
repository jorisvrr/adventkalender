import { getDay } from '../content/days'
import { isUnlocked } from './time'

export interface DayAccess {
  /** De openingsdatum is bereikt (Europe/Amsterdam). */
  dateReached: boolean
  /** Er staat inhoud voor deze dag in src/content/days.ts. */
  hasContent: boolean
  /** Mag het vakje open? */
  openable: boolean
}

export function hasContent(day: number): boolean {
  return getDay(day).type !== 'placeholder'
}

/**
 * Publiek (en in de preview) gaat een vakje alleen open als de datum bereikt is én er
 * inhoud is. Een leeg vakje blijft dus gesloten, ook na zijn datum. In ontwikkelaarsmodus
 * zonder preview (`ignoreLocks`) staat alles open om te testen.
 */
export function dayAccess(day: number, todayKey: string, ignoreLocks = false): DayAccess {
  const dateReached = isUnlocked(day, todayKey)
  const content = hasContent(day)
  return { dateReached, hasContent: content, openable: ignoreLocks || (dateReached && content) }
}
