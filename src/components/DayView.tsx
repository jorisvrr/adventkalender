import { useState } from 'react'
import { getDay } from '../content/days'
import { settings } from '../content/settings'
import { GameForDay } from '../games/registry'
import type { ProgressApi } from '../lib/useProgress'
import { formatDayMonth, opensOn } from '../lib/time'
import { LockIcon } from './Calendar'

interface Props {
  day: number
  unlocked: boolean
  progress: ProgressApi
  onBack: () => void
  /** Alleen in ontwikkelaarsmodus (zonder preview). */
  devTools: boolean
}

export function DayView({ day, unlocked, progress, onBack, devTools }: Props) {
  const config = getDay(day)
  const entry = progress.get(day)
  const [version, setVersion] = useState(0)

  const resetThisDay = () => {
    progress.resetDay(day)
    setVersion((v) => v + 1)
  }

  return (
    <main className="day-view">
      <div className="day-topbar">
        <button type="button" className="btn btn-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Terug naar de kalender
        </button>
      </div>

      <article className="day-card">
        <p className="day-eyebrow">
          Dag {day} · {formatDayMonth(opensOn(day))}
        </p>

        {!unlocked ? (
          <div className="day-empty">
            <span className="day-empty-icon">
              <LockIcon />
            </span>
            <h1 className="day-title">Nog even geduld</h1>
            <p>Dit vakje opent op {formatDayMonth(opensOn(day))}.</p>
          </div>
        ) : config.type === 'placeholder' ? (
          <div className="day-empty">
            <span className="day-empty-icon" aria-hidden="true">✦</span>
            <h1 className="day-title">{settings.placeholderText}</h1>
            <p>Kom later nog eens kijken.</p>
          </div>
        ) : (
          <>
            <h1 className="day-title">{config.title}</h1>
            <GameForDay
              key={version}
              config={config}
              saved={entry.state}
              completed={entry.completed === true}
              onState={(s) => progress.setState(day, s)}
              onComplete={() => progress.complete(day)}
            />
          </>
        )}
      </article>

      {devTools && (
        <div className="dev-strip">
          <span>
            Test · dag {day} {entry.completed ? 'voltooid' : 'niet voltooid'}
          </span>
          <button type="button" className="btn btn-small" onClick={resetThisDay}>
            Reset deze dag
          </button>
        </div>
      )}
    </main>
  )
}
