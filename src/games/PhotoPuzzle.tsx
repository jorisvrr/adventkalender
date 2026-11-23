import { useEffect, useRef, useState } from 'react'
import type { PhotoPuzzleDay } from '../content/days'
import { isSolved, isValidOrder, shuffledOrder, swap } from '../lib/puzzle'
import type { GameProps } from './types'
import { useAspect } from './CropImage'

export interface PhotoPuzzleState {
  order: number[]
  solved: boolean
}

export function PhotoPuzzle({ config, saved, onState, onComplete }: GameProps<PhotoPuzzleDay, PhotoPuzzleState>) {
  const count = config.size * config.size
  const [order, setOrder] = useState<number[]>(() =>
    isValidOrder(saved?.order, count) ? saved!.order : shuffledOrder(count),
  )
  const [solved, setSolved] = useState(saved?.solved === true || (isValidOrder(saved?.order, count) && isSolved(saved!.order)))
  const [justSolved, setJustSolved] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [preview, setPreview] = useState(false)
  const previewTimer = useRef<number>(undefined)
  // De puzzel volgt de beeldverhouding van de foto: 3×3 tegels van dezelfde verhouding,
  // dus niets wordt uitgerekt of afgesneden.
  const aspect = useAspect(config.image)

  // Eerste keer: de geschudde indeling meteen bewaren, zodat verversen dezelfde puzzel geeft.
  useEffect(() => {
    if (!isValidOrder(saved?.order, count)) onState({ order, solved: false })
  }, [])

  useEffect(() => () => window.clearTimeout(previewTimer.current), [])

  const showPreview = () => {
    setPreview(true)
    window.clearTimeout(previewTimer.current)
    previewTimer.current = window.setTimeout(() => setPreview(false), 2500)
  }

  const tap = (slot: number) => {
    if (solved) return
    if (selected === null) return setSelected(slot)
    if (selected === slot) return setSelected(null)
    const next = swap(order, selected, slot)
    setSelected(null)
    setOrder(next)
    const done = isSolved(next)
    onState({ order: next, solved: done })
    if (done) {
      setSolved(true)
      setJustSolved(true)
      onComplete()
    }
  }

  const tileStyle = (tile: number): React.CSSProperties => ({
    left: `${-(tile % config.size) * 100}%`,
    top: `${-Math.floor(tile / config.size) * 100}%`,
    width: `${config.size * 100}%`,
    height: `${config.size * 100}%`,
  })

  return (
    <div className="puzzle">
      {!solved && <p className="lede">{config.intro}</p>}

      <div className="puzzle-frame" style={{ '--ar': aspect } as React.CSSProperties}>
        {solved ? (
          <figure className={`puzzle-done ${justSolved ? 'is-new' : ''}`} data-testid="puzzel-klaar">
            <img src={config.image} alt={config.imageAlt} />
            <figcaption>{config.doneMessage}</figcaption>
          </figure>
        ) : (
          <>
            <div
              className="puzzle-grid"
              style={{ gridTemplateColumns: `repeat(${config.size}, 1fr)` }}
              aria-label="Puzzel"
            >
              {order.map((tile, slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`puzzle-tile ${selected === slot ? 'is-selected' : ''} ${tile === slot ? 'is-home' : ''}`}
                  data-slot={slot}
                  data-tile={tile}
                  aria-pressed={selected === slot}
                  aria-label={`Stukje ${tile + 1} op plek ${slot + 1}`}
                  onClick={() => tap(slot)}
                >
                  <img src={config.image} alt="" draggable={false} style={tileStyle(tile)} />
                </button>
              ))}
            </div>
            {preview && (
              <button type="button" className="puzzle-preview" onClick={() => setPreview(false)} aria-label="Voorbeeld sluiten">
                <img src={config.image} alt={config.imageAlt} />
              </button>
            )}
          </>
        )}
      </div>

      {!solved && (
        <div className="puzzle-actions">
          <button type="button" className="btn btn-secondary" onClick={showPreview} disabled={preview}>
            Bekijk het voorbeeld
          </button>
          <p className="feedback feedback-info" role="status" aria-live="polite">
            {selected !== null ? 'Tik nu op het stukje waarmee je wilt wisselen.' : ''}
          </p>
        </div>
      )}
      {solved && !justSolved && <p className="done-note">Deze puzzel heb je al gelegd.</p>}
    </div>
  )
}
