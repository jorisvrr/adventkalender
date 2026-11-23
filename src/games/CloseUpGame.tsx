import { useMemo, useState } from 'react'
import type { CloseUpDay } from '../content/days'
import { CropImage, useAspect } from './CropImage'
import type { GameProps } from './types'

export interface CloseUpState {
  round: number
  /** Huidige ronde is goed geraden (wacht op "Volgende"). */
  roundSolved: boolean
  done: boolean
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function CloseUpGame({ config, saved, onState, onComplete }: GameProps<CloseUpDay, CloseUpState>) {
  const last = config.rounds.length - 1
  const savedRound = Number.isInteger(saved?.round) ? Math.min(Math.max(saved!.round, 0), last) : 0
  const [round, setRound] = useState(savedRound)
  const [roundSolved, setRoundSolved] = useState(saved?.roundSolved === true)
  const [done, setDone] = useState(saved?.done === true)
  const [showSummary, setShowSummary] = useState(saved?.done === true)
  const [step, setStep] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])

  const r = config.rounds[round]
  const options = useMemo(() => shuffle(r.options), [r])
  const aspect = useAspect(r.image)
  const zoom = roundSolved ? 1 : r.zoomSteps[Math.min(step, r.zoomSteps.length - 1)]
  const fullyZoomedOut = step >= r.zoomSteps.length - 1

  const guess = (option: string) => {
    if (option !== r.answer) {
      setWrong((w) => [...w, option])
      return
    }
    setRoundSolved(true)
    const finished = round === last
    onState({ round, roundSolved: true, done: finished })
    if (finished) {
      setDone(true)
      onComplete()
    }
  }

  const next = () => {
    if (round === last) return setShowSummary(true)
    const n = round + 1
    setRound(n)
    setRoundSolved(false)
    setStep(0)
    setWrong([])
    onState({ round: n, roundSolved: false, done: false })
  }

  if (done && showSummary) {
    return (
      <div className="closeup">
        <p className="closeup-result" data-testid="closeup-klaar">
          {config.doneMessage}
        </p>
        <ul className="closeup-summary">
          {config.rounds.map((rd) => (
            <li key={rd.image}>
              <img src={rd.image} alt={rd.alt} loading="lazy" />
              <span>{rd.answer}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="closeup">
      <p className="lede">{config.intro}</p>
      <p className="closeup-round">
        Ronde {round + 1} van {config.rounds.length}
      </p>

      <div className="closeup-frame" style={{ '--ar': aspect } as React.CSSProperties} data-testid="closeup-foto" data-zoom={zoom}>
        <CropImage
          key={r.image}
          src={r.image}
          alt={roundSolved ? r.alt : 'Uitsnede van een foto'}
          x={r.focus.x}
          y={r.focus.y}
          zoom={zoom}
        />
      </div>

      {roundSolved ? (
        <div className="closeup-correct">
          <p className="feedback feedback-good" role="status">
            {config.correctMessage}
          </p>
          <button type="button" className="btn btn-primary" onClick={next}>
            Volgende
          </button>
        </div>
      ) : (
        <>
          <div className="closeup-options">
            {options.map((o) => (
              <button
                key={o}
                type="button"
                className={`btn closeup-option ${wrong.includes(o) ? 'is-wrong' : ''}`}
                disabled={wrong.includes(o)}
                onClick={() => guess(o)}
              >
                {o}
              </button>
            ))}
          </div>
          <p className="feedback feedback-soft" role="status" aria-live="polite">
            {wrong.length ? config.wrongMessage : ''}
          </p>
          <button
            type="button"
            className="btn btn-secondary closeup-zoom"
            onClick={() => setStep((s) => s + 1)}
            disabled={fullyZoomedOut}
          >
            Zoom uit
          </button>
        </>
      )}
    </div>
  )
}
