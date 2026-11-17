import { useEffect, useState } from 'react'
import { Calendar } from './components/Calendar'
import { DayView } from './components/DayView'
import { DevGate } from './components/DevGate'
import { DevPanel } from './components/DevPanel'
import { Landing } from './components/Landing'
import { getDay } from './content/days'
import { settings } from './content/settings'
import { contentKey } from './games/registry'
import { dayAccess } from './lib/access'
import { clearLegacySession, loadDevUnlocked, saveDevUnlocked } from './lib/session'
import { loadDevSettings, saveDevSettings, type DevSettings } from './lib/storage'
import { formatDayMonth, localDateKey } from './lib/time'
import { useNow } from './lib/useNow'
import { useProgress } from './lib/useProgress'
import { useRoute, type Route } from './lib/useRoute'

type Nav = ReturnType<typeof useRoute>

/**
 * De modus volgt uit de route, niet uit opgeslagen sessiegegevens:
 * publieke routes tonen altijd de gewone kalender met datumvergrendeling.
 */
export function App() {
  const nav = useRoute()
  const { route } = nav
  const [devUnlocked, setDevUnlocked] = useState(() => loadDevUnlocked())

  useEffect(() => clearLegacySession(), [])

  useEffect(() => {
    const base = settings.landing.title
    document.title = route.view === 'dag' ? `Dag ${route.day} · ${base}` : route.dev ? `Ontwikkelaarsmodus · ${base}` : base
  }, [route])

  if (!route.dev) {
    if (route.view === 'start') return <Landing onOpen={nav.openCalendar} />
    return <CalendarApp key="publiek" dev={false} route={route} nav={nav} />
  }

  if (!devUnlocked)
    return (
      <DevGate
        onUnlock={() => {
          saveDevUnlocked(true)
          setDevUnlocked(true)
        }}
      />
    )

  const exitDev = () => {
    saveDevUnlocked(false)
    setDevUnlocked(false)
    nav.toStart()
  }
  return <CalendarApp key="dev" dev route={route} nav={nav} onExit={exitDev} />
}

interface CalendarAppProps {
  dev: boolean
  route: Route
  nav: Nav
  onExit?: () => void
}

function CalendarApp({ dev: isDev, route, nav, onExit }: CalendarAppProps) {
  const now = useNow()
  const realToday = localDateKey(now)

  // Ontwikkelaarsinstellingen worden alleen in ontwikkelaarsmodus gelezen.
  const [dev, setDevState] = useState<DevSettings>(() =>
    isDev ? loadDevSettings(`${settings.year}-12-01`) : { previewDate: realToday, previewAsFriend: false },
  )
  const setDev = (next: DevSettings) => {
    setDevState(next)
    saveDevSettings(next)
  }

  const previewing = isDev && dev.previewAsFriend
  const locksActive = !isDev || previewing
  const todayKey = previewing ? dev.previewDate : realToday
  const progress = useProgress(isDev ? 'test' : 'vriendin', contentKeyFor)
  const access = (day: number) => dayAccess(day, todayKey, !locksActive)

  const completedCount = Object.values(progress.progress).filter((p) => p.completed).length

  const backToDevPanel = () => {
    setDev({ ...dev, previewAsFriend: false })
    if (route.view === 'dag') nav.toCalendar(true)
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
        {onExit && (
          <button type="button" className="btn btn-small btn-quiet" onClick={onExit}>
            Afsluiten
          </button>
        )}
      </header>

      {route.view === 'dag' ? (
        <DayView
          key={route.day}
          day={route.day}
          access={access(route.day)}
          progress={progress}
          onBack={() => nav.toCalendar(isDev)}
          devTools={isDev && !previewing}
        />
      ) : (
        <main className="calendar-view">
          <h1 className="calendar-title">{settings.landing.title}</h1>
          <p className="calendar-intro">{introText(locksActive, todayKey, access)}</p>

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
            showTechnical={isDev && !previewing}
            progress={progress.progress}
            access={access}
            onOpen={(day) => nav.openDay(isDev, day)}
          />
        </main>
      )}

      {previewing && (
        <div className="preview-bar" role="region" aria-label="Preview">
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

function introText(locksActive: boolean, todayKey: string, access: (day: number) => { openable: boolean }): string {
  if (!locksActive) return 'Alle vakjes staan open om te testen.'
  const first = `${settings.year}-12-01`
  const last = `${settings.year}-12-${String(settings.totalDays).padStart(2, '0')}`
  if (todayKey < first) return 'Op 1 december gaat het eerste vakje open.'
  if (todayKey > last) return 'Alle vakjes zijn open. Je kunt alles nog eens teruglezen.'
  const today = Number(todayKey.slice(8))
  return access(today).openable
    ? `Vandaag is het ${formatDayMonth(todayKey)}. Vakje ${today} is open.`
    : `Vandaag is het ${formatDayMonth(todayKey)}.`
}
