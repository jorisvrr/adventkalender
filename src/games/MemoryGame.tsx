import { useEffect, useRef, useState } from 'react'
import type { MemoryDay } from '../content/days'
import { CropImage } from './CropImage'
import type { GameProps } from './types'

export interface MemoryState {
  /** deck[positie] = paarnummer (index in config.cards). */
  deck: number[]
  matched: number[]
  attempts: number
  done: boolean
}

const FLIP_BACK_MS = 900

function shuffledDeck(pairs: number): number[] {
  const deck = Array.from({ length: pairs * 2 }, (_, i) => i % pairs)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function isValidDeck(deck: unknown, pairs: number): deck is number[] {
  if (!Array.isArray(deck) || deck.length !== pairs * 2) return false
  const counts = new Array(pairs).fill(0)
  for (const p of deck) {
    if (!Number.isInteger(p) || p < 0 || p >= pairs) return false
    counts[p]++
  }
  return counts.every((c) => c === 2)
}

export function MemoryGame({ config, saved, onState, onComplete }: GameProps<MemoryDay, MemoryState>) {
  const pairs = config.cards.length
  const validSave = isValidDeck(saved?.deck, pairs)
  const [deck] = useState<number[]>(() => (validSave ? saved!.deck : shuffledDeck(pairs)))
  const [matched, setMatched] = useState<number[]>(() =>
    validSave ? (saved!.matched ?? []).filter((p) => Number.isInteger(p) && p >= 0 && p < pairs) : [],
  )
  const [attempts, setAttempts] = useState(validSave ? Number(saved!.attempts) || 0 : 0)
  const [done, setDone] = useState(validSave && saved!.done === true)
  const [justDone, setJustDone] = useState(false)
  const [flipped, setFlipped] = useState<number[]>([])
  const [locked, setLocked] = useState(false)
  const timer = useRef<number>(undefined)

  // Eerste keer: de geschudde volgorde meteen bewaren, zodat verversen hetzelfde spel geeft.
  useEffect(() => {
    if (!validSave) onState({ deck, matched: [], attempts: 0, done: false })
    return () => window.clearTimeout(timer.current)
  }, [])

  const tap = (pos: number) => {
    if (locked || done || flipped.includes(pos) || matched.includes(deck[pos])) return
    const open = [...flipped, pos]
    if (open.length < 2) return setFlipped(open)

    const tries = attempts + 1
    setAttempts(tries)
    const [a, b] = open
    if (deck[a] === deck[b]) {
      const nowMatched = [...matched, deck[a]]
      const finished = nowMatched.length === pairs
      setMatched(nowMatched)
      setFlipped([])
      onState({ deck, matched: nowMatched, attempts: tries, done: finished })
      if (finished) {
        setDone(true)
        setJustDone(true)
        onComplete()
      }
    } else {
      // Verkeerd paar: even laten zien, intussen geen extra tikken.
      setFlipped(open)
      setLocked(true)
      onState({ deck, matched, attempts: tries, done: false })
      timer.current = window.setTimeout(() => {
        setFlipped([])
        setLocked(false)
      }, FLIP_BACK_MS)
    }
  }

  return (
    <div className="memory">
      {!done && <p className="lede">{config.intro}</p>}

      <div className={`memory-grid ${locked ? 'is-locked' : ''}`} aria-label="Memory">
        {deck.map((pair, pos) => {
          const card = config.cards[pair]
          const isMatched = matched.includes(pair)
          const faceUp = isMatched || flipped.includes(pos)
          return (
            <button
              key={pos}
              type="button"
              className={`memory-card ${faceUp ? 'is-up' : ''} ${isMatched ? 'is-matched' : ''}`}
              data-pos={pos}
              data-pair={pair}
              aria-label={faceUp ? card.alt : `Kaartje ${pos + 1}`}
              aria-pressed={faceUp}
              onClick={() => tap(pos)}
            >
              <span className="memory-inner">
                <span className="memory-face memory-back" aria-hidden="true" />
                <span className="memory-face memory-front" aria-hidden="true">
                  <CropImage src={card.image} alt="" x={card.crop.x} y={card.crop.y} zoom={card.crop.zoom} />
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <p className="memory-status" role="status" aria-live="polite">
        {done ? (
          <span className={`memory-done ${justDone ? 'is-new' : ''}`} data-testid="memory-klaar">
            <strong>{config.doneMessage}</strong> In {attempts} {attempts === 1 ? 'poging' : 'pogingen'}.
          </span>
        ) : (
          <>
            {matched.length} van {pairs} paren · {attempts} {attempts === 1 ? 'poging' : 'pogingen'}
          </>
        )}
      </p>
    </div>
  )
}
