import { useCallback, useEffect, useRef, useState } from 'react'
import type { ScratchDay } from '../content/days'
import type { GameProps } from './types'

const REVEAL_AT = 0.5
const BRUSH = 38

export function ScratchCard({ config, completed, onComplete }: GameProps<ScratchDay, undefined>) {
  const [revealed, setRevealed] = useState(completed)
  const [fading, setFading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const last = useRef<{ x: number; y: number } | null>(null)
  const moves = useRef(0)
  const scratched = useRef(false)
  const dprRef = useRef(1)

  const reveal = useCallback(() => {
    if (revealed || fading) return
    setFading(true)
    onComplete()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => setRevealed(true), reduce ? 0 : 550)
  }, [revealed, fading, onComplete])

  // Kraslaag tekenen.
  useEffect(() => {
    if (revealed) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    dprRef.current = dpr
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.scale(dpr, dpr)
    const w = rect.width
    const h = rect.height

    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#C9A15A')
    g.addColorStop(0.45, '#E8CF94')
    g.addColorStop(0.55, '#D9B46C')
    g.addColorStop(1, '#B98C43')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)

    // Kleine sterretjes als patroon (vaste posities, geen toeval).
    ctx.fillStyle = 'rgba(255, 248, 230, 0.55)'
    for (let i = 0; i < 46; i++) {
      const x = ((i * 73) % 100) / 100 * w
      const y = ((i * 37 + 11) % 100) / 100 * h
      ctx.beginPath()
      ctx.arc(x, y, i % 3 === 0 ? 2.2 : 1.3, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawLabel = () => {
      if (scratched.current) return
      ctx.fillStyle = 'rgba(122, 18, 32, 0.92)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '600 30px "Fraunces Variable", Georgia, serif'
      ctx.fillText(config.coverLabel, w / 2, h / 2 - 8)
      ctx.font = '500 14px "DM Sans Variable", system-ui, sans-serif'
      ctx.fillStyle = 'rgba(122, 18, 32, 0.7)'
      ctx.fillText('met je vinger', w / 2, h / 2 + 22)
    }
    if (document.fonts?.ready) document.fonts.ready.then(drawLabel)
    else drawLabel()
  }, [revealed, config.coverLabel])

  /** Pointerpositie in de tekeneenheden van de canvas (ook als die sinds het tekenen is geschaald). */
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const scale = canvas.width / dprRef.current / rect.width
    return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale }
  }

  const coverage = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return 0
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let clear = 0
    let total = 0
    const stride = 4 * 6
    for (let i = 3; i < data.length; i += stride) {
      total++
      if (data[i] < 40) clear++
    }
    return total ? clear / total : 0
  }

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    const p = point(e)
    scratched.current = true
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = BRUSH
    ctx.beginPath()
    const from = last.current ?? p
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(p.x + 0.01, p.y)
    ctx.stroke()
    ctx.globalCompositeOperation = 'source-over'
    last.current = p
    if (++moves.current % 6 === 0 && coverage(canvas) >= REVEAL_AT) reveal()
  }

  return (
    <div className="scratch">
      {!completed && <p className="lede">{config.intro}</p>}
      <div className={`scratch-card ${revealed ? 'is-revealed' : ''}`}>
        <p className="scratch-message" aria-hidden={!revealed && !fading} aria-live="polite">
          {config.message}
        </p>
        {!revealed && (
          <canvas
            ref={canvasRef}
            className={`scratch-canvas ${fading ? 'is-fading' : ''}`}
            data-testid="kraslaag"
            role="img"
            aria-label="Kraskaartje. Gebruik de knop eronder om het bericht te onthullen."
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              last.current = null
              scratch(e)
            }}
            onPointerMove={(e) => {
              if (e.buttons === 0 && e.pointerType === 'mouse') return
              if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
              scratch(e)
            }}
            onPointerUp={(e) => {
              last.current = null
              if (coverage(e.currentTarget) >= REVEAL_AT) reveal()
            }}
            onPointerCancel={() => (last.current = null)}
          />
        )}
      </div>
      {!revealed && !fading ? (
        <button type="button" className="btn btn-secondary" onClick={reveal}>
          {config.revealButton}
        </button>
      ) : (
        <p className="done-note">{completed && !fading ? 'Dit kaartje heb je al opengekrast.' : 'Opengekrast ✓'}</p>
      )}
    </div>
  )
}
