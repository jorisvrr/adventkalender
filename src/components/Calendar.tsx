import { settings } from '../content/settings'
import { getDay } from '../content/days'
import { formatDayMonth, opensOn } from '../lib/time'
import type { Progress } from '../lib/storage'

export type TileStatus = 'gesloten' | 'beschikbaar' | 'voltooid'

interface Props {
  todayKey: string
  /** false = ontwikkelaarsmodus zonder preview: niets is op slot. */
  locksActive: boolean
  progress: Progress
  isUnlocked: (day: number) => boolean
  onOpen: (day: number) => void
}

export function Calendar({ todayKey, locksActive, progress, isUnlocked, onOpen }: Props) {
  const daysList = Array.from({ length: settings.totalDays }, (_, i) => i + 1)

  return (
    <ol className="calendar" aria-label="Adventskalender">
      {daysList.map((day) => {
        const open = isUnlocked(day)
        const done = progress[day]?.completed === true
        const status: TileStatus = !open ? 'gesloten' : done ? 'voltooid' : 'beschikbaar'
        const isToday = locksActive && opensOn(day) === todayKey
        const placeholder = getDay(day).type === 'placeholder'
        const style = { '--i': day } as React.CSSProperties

        if (status === 'gesloten') {
          return (
            <li key={day} className="tile-slot" data-day={day} data-status={status} style={style}>
              <div className="tile is-locked">
                <span className="tile-number" aria-hidden="true">{day}</span>
                <span className="tile-lock">
                  <LockIcon />
                </span>
                <span className="tile-meta tile-meta-locked">
                  <span className="visually-hidden">Dag {day}: </span>
                  <span>Opent op</span> <span className="nowrap">{formatDayMonth(opensOn(day))}</span>
                </span>
              </div>
            </li>
          )
        }

        return (
          <li key={day} style={style} data-day={day} data-status={status} className="tile-slot">
            <button
              type="button"
              className={`tile is-${status} tone-${day % 3} ${isToday ? 'is-today' : ''} ${placeholder ? 'is-placeholder' : ''}`}
              onClick={() => onOpen(day)}
              aria-label={`Dag ${day}${status === 'voltooid' ? ', voltooid' : ', beschikbaar'}${isToday ? ', vandaag' : ''}`}
            >
              <span className="tile-number">{day}</span>
              <span className="tile-meta">
                {status === 'voltooid' ? (
                  <>
                    <CheckIcon /> <span>Voltooid</span>
                  </>
                ) : isToday ? (
                  <span>Vandaag</span>
                ) : (
                  <span>{placeholder && !locksActive ? 'Placeholder' : 'Open mij'}</span>
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
