import { settings } from '../content/settings'
import { getDay } from '../content/days'

/** Datum als 'JJJJ-MM-DD' in de tijdzone van de kalender (Europe/Amsterdam). */
export function localDateKey(now: Date, timeZone: string = settings.timeZone): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

export function opensOn(day: number): string {
  return getDay(day).opensOn ?? `${settings.year}-12-${String(day).padStart(2, '0')}`
}

/** Is het vakje open op deze datum ('JJJJ-MM-DD')? Eerdere dagen blijven open. */
export function isUnlocked(day: number, todayKey: string): boolean {
  return todayKey >= opensOn(day)
}

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

/** '2026-12-04' → '4 december' */
export function formatDayMonth(key: string): string {
  const [, m, d] = key.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]}`
}

export function isValidDateKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(Date.parse(`${key}T12:00:00Z`))
}
