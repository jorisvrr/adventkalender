import { useState } from 'react'
import type { GiftDay } from '../content/days'
import type { GameProps } from './types'

const OPEN_MS = 650

export function GiftReveal({ config, completed, onComplete }: GameProps<GiftDay, undefined>) {
  const [opening, setOpening] = useState(false)
  const [open, setOpen] = useState(completed)

  const unwrap = () => {
    if (opening || open) return
    setOpening(true)
    onComplete()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => setOpen(true), reduce ? 0 : OPEN_MS)
  }

  if (open) {
    return (
      <figure className={`gift-open ${completed && !opening ? '' : 'is-new'}`} data-testid="cadeau-open">
        <img src={config.image} alt={config.imageAlt} />
        <figcaption>{config.message}</figcaption>
      </figure>
    )
  }

  return (
    <div className="gift">
      <button type="button" className={`gift-box ${opening ? 'is-opening' : ''}`} onClick={unwrap} aria-label={config.tapLabel}>
        <span className="gift-lid" aria-hidden="true" />
        <span className="gift-body" aria-hidden="true" />
        <span className="gift-bow" aria-hidden="true" />
      </button>
      <p className="gift-label">{config.tapLabel}</p>
    </div>
  )
}
