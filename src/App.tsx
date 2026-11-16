import { useEffect, useState } from 'react'
import { settings, type Mode } from './content/settings'
import { Calendar } from './components/Calendar'
import { DayView } from './components/DayView'
import { DevPanel } from './components/DevPanel'
import { getDay } from './content/days'
import { contentKey } from './games/registry'
import { Landing } from './components/Landing'
import { loadMode, saveMode } from './lib/session'
import { loadDevSettings, saveDevSettings, type DevSettings } from './lib/storage'
import { formatDayMonth, isUnlocked, localDateKey } from './lib/time'
import { useNow } from './lib/useNow'
import { useProgress } from './lib/useProgress'
import { useRoute } from './lib/useRoute'

export function App() {
  const [mode, setMode] = useState<Mode | null>(() => loadMode())

  const enter = (m: Mode) => {
    saveMode(m)
    setMode(m)
    window.history.replaceState(null, '', '#/')
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }
  const exit = () => {
    saveMode(null)
    setMode(null)
    window.history.replaceState(null, '', window.location.pathname)
  }

  if (!mode) return <Landing onEnter={enter} />
  return <CalendarApp mode={mode} onExit={exit} />
}

function CalendarApp({ mode, onExit }: { mode: Mode; onExit: () => void }) {
  const now = useNow()
  const realToday = localDateKey(now)
  const { route, openDay, toCalendar } = useRoute()
  const isDev = mode === 'ontwikkelaar'

  const [dev, setDevState] = useState<DevSettings>(() => loadDevSettings(`${settings.year}-12-01`))
  const setDev = (next: DevSettings) => {
    setDevState(next)
    saveDevSettings(next)
  }

  const previewing = isDev && dev.previewAsFriend
  const locksActive = !isDev || previewing
  const todayKey = previewing ? dev.previewDate : realToday
  const progress = useProgress(isDev ? 'test' : 'vriendin', contentKeyFor)
  const unlocked = (day: number) => !locksActive || isUnlocked(day, todayKey)

  const completedCount = Object.values(progress.progress).filter((p) => p.completed).length

  useEffect(() => {
    document.title = route.name === 'dag' ? `Dag ${route.day} · ${settings.landing.title}` : settings.landing.title
  }, [route])

  const backToDevPanel = () => {
    setDev({ ...dev, previewAsFriend: false })
    if (route.name === 'dag') toCalendar()
  }

  return (
    <div className={`app ${previewing ? 'has-preview-bar' : ''}`}>
      <header className="app-header">
        <div className="app-header-text">
          <p className="app-kicker">Adventskalender</p>
          {isDev && (
            <p className="badge-dev" data-testid="badge-ontwikkelaar">
              Ontwikkelaarsmodus{previewing ? ' · preview' : ''}
            </p>
          )}
        </div>
        <button type="button" className="btn btn-small btn-quiet" onClick={onExit}>
          Afsluiten
        </button>
      </header>

      {route.name === 'dag' ? (
        <DayView
          key={`${route.day}-${isDev}`}
          day={route.day}
          unlocked={unlocked(route.day)}
          progress={progress}
          onBack={toCalendar}
          devTools={isDev && !previewing}
        />
      ) : (
        <main className="calendar-view">
          <h1 className="calendar-title">{settings.landing.title}</h1>
          <p className="calendar-intro">{introText(locksActive, todayKey)}</p>

          {isDev && !previewing && (
            <DevPanel
              dev={dev}
              onChange={setDev}
              onResetDay={(d) => progress.resetDay(d)}
              onResetAll={() => progress.resetAll()}
              completedCount={completedCount}
            />
          )}

          <Calendar
            todayKey={todayKey}
            locksActive={locksActive}
            progress={progress.progress}
            isUnlocked={unlocked}
            onOpen={openDay}
          />
        </main>
      )}

      {previewing && (
        <div className="preview-bar" role="region" aria-label="Vriendin-preview">
          <span>
            Preview als vriendin · <strong>{formatDayMonth(dev.previewDate)}</strong>
          </span>
          <button type="button" className="btn btn-small btn-light" onClick={backToDevPanel}>
            Terug naar ontwikkelaarspaneel
          </button>
        </div>
      )}
    </div>
  )
}

const contentKeyFor = (day: number) => contentKey(getDay(day))

function introText(locksActive: boolean, todayKey: string): string {
  if (!locksActive) return 'Elke dag een kleine verrassing.'
  const first = `${settings.year}-12-01`
  const last = `${settings.year}-12-${String(settings.totalDays).padStart(2, '0')}`
  if (todayKey < first) return 'Op 1 december gaat het eerste vakje open. Nog heel even.'
  if (todayKey > last) return 'Alle vakjes zijn open. Je kunt alles nog eens teruglezen.'
  return `Vandaag is het ${formatDayMonth(todayKey)}. Vakje ${Number(todayKey.slice(8))} is open.`
}
