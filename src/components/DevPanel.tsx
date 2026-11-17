import { useEffect, useState } from 'react'
import { settings } from '../content/settings'
import { contentImages, contentWarnings, formatRanges, missingDays } from '../lib/contentStatus'
import type { DevSettings } from '../lib/storage'
import { formatDayMonth, isValidDateKey } from '../lib/time'

interface Props {
  dev: DevSettings
  onChange: (next: DevSettings) => void
  onResetDay: (day: number) => void
  onResetAll: () => void
  completedCount: number
}

export function DevPanel({ dev, onChange, onResetDay, onResetAll, completedCount }: Props) {
  const [day, setDay] = useState(1)
  const [confirming, setConfirming] = useState(false)
  const [notice, setNotice] = useState('')

  const missing = missingDays()
  const warnings = contentWarnings()
  const brokenImages = useBrokenImages()

  const flash = (text: string) => {
    setNotice(text)
    window.setTimeout(() => setNotice((n) => (n === text ? '' : n)), 2500)
  }

  return (
    <section className="dev-panel" aria-labelledby="dev-panel-title">
      <h2 id="dev-panel-title" className="dev-panel-title">
        Ontwikkelaarspaneel
      </h2>
      <p className="dev-note">
        Alle vakjes zijn open om te testen. Testvoortgang ({completedCount} voltooid) staat los van de voortgang van je
        vriendin.
      </p>

      <div className="dev-status" data-testid="inhoudsstatus">
        <p className="dev-status-title">Inhoud</p>
        <ul>
          <li className={missing.length ? 'is-warning' : 'is-ok'}>
            {missing.length ? (
              <>
                {settings.totalDays - missing.length} van {settings.totalDays} dagen ingevuld. Nog leeg:{' '}
                <span className="nowrap">{formatRanges(missing)}</span>. Lege vakjes blijven publiek gesloten.
              </>
            ) : (
              `Alle ${settings.totalDays} dagen zijn ingevuld.`
            )}
          </li>
          {warnings.map((w) => (
            <li key={`w${w.day}`} className="is-warning">
              Dag {w.day} {w.text}.
            </li>
          ))}
          {brokenImages.map((b) => (
            <li key={`b${b.day}`} className="is-error">
              Dag {b.day}: afbeelding niet gevonden ({b.src}).
            </li>
          ))}
        </ul>
      </div>

      <div className="dev-row">
        <label htmlFor="preview-date">Voorbeeld-datum</label>
        <input
          id="preview-date"
          type="date"
          className="text-input text-input-small"
          value={dev.previewDate}
          min={`${settings.year}-11-01`}
          max={`${settings.year + 1}-01-31`}
          onChange={(e) => isValidDateKey(e.target.value) && onChange({ ...dev, previewDate: e.target.value })}
        />
      </div>

      <label className="dev-switch">
        <input
          type="checkbox"
          role="switch"
          checked={dev.previewAsFriend}
          onChange={(e) => onChange({ ...dev, previewAsFriend: e.target.checked })}
        />
        <span className="dev-switch-track" aria-hidden="true" />
        <span>Bekijk als vriendin op {isValidDateKey(dev.previewDate) ? formatDayMonth(dev.previewDate) : 'deze datum'}</span>
      </label>

      <div className="dev-row">
        <label htmlFor="reset-day">Dag</label>
        <select id="reset-day" className="text-input text-input-small" value={day} onChange={(e) => setDay(Number(e.target.value))}>
          {Array.from({ length: settings.totalDays }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Dag {i + 1}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-small"
          onClick={() => {
            onResetDay(day)
            flash(`Testvoortgang van dag ${day} is gewist.`)
          }}
        >
          Reset deze dag
        </button>
      </div>

      {!confirming ? (
        <button type="button" className="btn btn-small btn-danger-outline" onClick={() => setConfirming(true)}>
          Reset alle testvoortgang
        </button>
      ) : (
        <div className="dev-confirm" role="alertdialog" aria-labelledby="confirm-text">
          <p id="confirm-text">Alle testvoortgang wissen? De voortgang van je vriendin blijft staan.</p>
          <div className="dev-confirm-actions">
            <button
              type="button"
              className="btn btn-small btn-danger"
              onClick={() => {
                onResetAll()
                setConfirming(false)
                flash('Alle testvoortgang is gewist.')
              }}
            >
              Ja, alles wissen
            </button>
            <button type="button" className="btn btn-small" onClick={() => setConfirming(false)}>
              Annuleren
            </button>
          </div>
        </div>
      )}

      <p className="dev-notice" role="status" aria-live="polite">
        {notice}
      </p>
    </section>
  )
}

/** Probeert elke afbeelding uit de inhoud te laden en geeft terug welke niet bestaan. */
function useBrokenImages() {
  const [broken, setBroken] = useState<{ day: number; src: string }[]>([])
  useEffect(() => {
    let cancelled = false
    for (const img of contentImages()) {
      const probe = new Image()
      probe.onerror = () => !cancelled && setBroken((b) => [...b, img])
      probe.src = img.src
    }
    return () => {
      cancelled = true
    }
  }, [])
  return broken
}
