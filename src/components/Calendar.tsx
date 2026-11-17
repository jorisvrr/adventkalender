import { settings } from '../content/settings'
import type { DayAccess } from '../lib/access'
import type { Progress } from '../lib/storage'
import { formatDayMonth, opensOn } from '../lib/time'

export type TileStatus = 'gesloten' | 'beschikbaar' | 'voltooid'

interface Props {
  todayKey: string
  /** false = ontwikkelaarsmodus zonder preview: niets is op slot. */
  locksActive: boolean
  /** Alleen in ontwikkelaarsmodus: toon technische status (zoals ontbrekende inhoud). */
  showTechnical: boolean
  progress: Progress
  access: (day: number) => DayAccess
  onOpen: (day: number) => void
}

export function Calendar({ todayKey, locksActive, showTechnical, progress, access, onOpen }: Props) {
  const daysList = Array.from({ length: settings.totalDays }, (_, i) => i + 1)

  return (
    <ol className="calendar" aria-label="Adventskalender">
      {daysList.map((day) => {
        const a = access(day)
        const done = progress[day]?.completed === true
        const status: TileStatus = !a.openable ? 'gesloten' : done ? 'voltooid' : 'beschikbaar'
        const isToday = locksActive && opensOn(day) === todayKey
        const style = { '--i': day } as React.CSSProperties

        if (status === 'gesloten') {
          return (
            <li key={day} className="tile-slot" data-day={day} data-status={status} style={style}>
              <div className="tile is-locked">
                <span className="tile-number" aria-hidden="true">
                  {day}
                </span>
                <span className="tile-lock">
                  <LockIcon />
                </span>
                <span className="tile-meta tile-meta-locked">
                  <span className="visually-hidden">Dag {day}{a.dateReached ? ', gesloten' : ': '}</span>
                  {!a.dateReached && (
                    <>
                      <span>Opent op</span> <span className="nowrap">{formatDayMonth(opensOn(day))}</span>
                    </>
                  )}
                </span>
              </div>
            </li>
          )
        }

        const missing = showTechnical && !a.hasContent
        return (
          <li key={day} style={style} data-day={day} data-status={status} className="tile-slot">
            <button
              type="button"
              className={`tile is-${status} tone-${day % 3} ${isToday ? 'is-today' : ''} ${missing ? 'is-missing' : ''}`}
              onClick={() => onOpen(day)}
              aria-label={`Dag ${day}${status === 'voltooid' ? ', voltooid' : ''}${isToday ? ', vandaag' : ''}${missing ? ', nog geen inhoud' : ''}`}
            >
              <span className="tile-number">{day}</span>
              <span className="tile-meta">
                {status === 'voltooid' ? (
                  <>
                    <CheckIcon /> <span>Voltooid</span>
                  </>
                ) : missing ? (
                  <span>Geen inhoud</span>
                ) : isToday ? (
                  <span>Vandaag</span>
                ) : (
                  <span>Open mij</span>
                )}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
