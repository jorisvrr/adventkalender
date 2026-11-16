import { useMemo, useRef, useState } from 'react'
import type { WordSearchDay } from '../content/days'
import { cellId, cellsBetween, findOccurrences, matchSelection, normalizeAnswer, type Cell } from '../lib/wordsearch'
import type { GameProps } from './types'

export interface WordSearchState {
  found: string[]
  solved: boolean
}

type Feedback = { tone: 'info' | 'good' | 'soft'; text: string } | null

export function WordSearch({ config, saved, onState, onComplete }: GameProps<WordSearchDay, WordSearchState>) {
  const { grid, words } = config
  const [found, setFound] = useState<string[]>(() => (saved?.found ?? []).filter((w) => words.includes(w)))
  const [solved, setSolved] = useState(saved?.solved === true)
  const [justSolved, setJustSolved] = useState(false)
  const [pending, setPending] = useState<Cell | null>(null)
  const [drag, setDrag] = useState<{ start: Cell; end: Cell } | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [answer, setAnswer] = useState('')
  const [answerFeedback, setAnswerFeedback] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const draggedRef = useRef(false)
  /** Na een sleepbeweging de klik die de browser er nog achteraan stuurt negeren. */
  const suppressClick = useRef(false)

  const allFound = found.length === words.length

  const foundCells = useMemo(() => {
    const ids = new Set<string>()
    for (const w of found) for (const occ of findOccurrences(grid, w)) occ.forEach((c) => ids.add(cellId(c)))
    return ids
  }, [found, grid])

  const activeCells = useMemo(() => {
    const ids = new Set<string>()
    if (drag) {
      const line = cellsBetween(drag.start, drag.end)
      if (line) line.forEach((c) => ids.add(cellId(c)))
      else ids.add(cellId(drag.start))
    }
    if (pending) ids.add(cellId(pending))
    return ids
  }, [drag, pending])

  const persist = (next: WordSearchState) => onState(next)

  const tryWord = (a: Cell, b: Cell) => {
    const cells = cellsBetween(a, b)
    if (!cells) {
      setFeedback({ tone: 'soft', text: 'Kies letters die op één rij of in één kolom liggen.' })
      return
    }
    const word = matchSelection(grid, words, cells, found)
    if (word) {
      const next = [...found, word]
      setFound(next)
      persist({ found: next, solved })
      setFeedback({
        tone: 'good',
        text: next.length === words.length ? `${word} gevonden! Alle woorden staan erin 🎉` : `${word} gevonden!`,
      })
    } else {
      const letters = cells.map((c) => grid[c.r][c.c]).join('')
      const already = words.find((w) => found.includes(w) && (w === letters || [...w].reverse().join('') === letters))
      setFeedback({ tone: 'soft', text: already ? `${already} had je al gevonden.` : 'Dat is geen van de woorden. Probeer het nog eens.' })
    }
  }

  const cellFromPoint = (x: number, y: number): Cell | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-cell]')
    if (!el) return null
    const [r, c] = el.dataset.cell!.split('-').map(Number)
    return { r, c }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    draggedRef.current = false
    suppressClick.current = false
    const cell = cellFromPoint(e.clientX, e.clientY)
    if (!cell || allFound) return
    setDrag({ start: cell, end: cell })
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return
    const cell = cellFromPoint(e.clientX, e.clientY)
    if (!cell) return
    if (cell.r !== drag.end.r || cell.c !== drag.end.c) {
      if (cell.r !== drag.start.r || cell.c !== drag.start.c) draggedRef.current = true
      setDrag({ start: drag.start, end: cell })
    }
  }

  const onPointerUp = () => {
    if (drag && draggedRef.current) {
      suppressClick.current = true
      setPending(null)
      tryWord(drag.start, drag.end)
    }
    setDrag(null)
  }

  // Tikken (en toetsenbord): eerst de beginletter, dan de eindletter.
  const onCellClick = (cell: Cell, e: React.MouseEvent) => {
    // detail === 0: klik via toetsenbord, nooit het staartje van een sleepbeweging.
    if (suppressClick.current && e.detail !== 0) {
      suppressClick.current = false
      return
    }
    if (allFound) return
    if (!pending) {
      setPending(cell)
      setFeedback({ tone: 'info', text: 'Tik nu op de laatste letter van het woord.' })
      return
    }
    if (pending.r === cell.r && pending.c === cell.c) {
      setPending(null)
      setFeedback(null)
      return
    }
    setPending(null)
    tryWord(pending, cell)
  }

  const submitAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    if (normalizeAnswer(answer) === config.solution) {
      setSolved(true)
      setJustSolved(true)
      setAnswerFeedback(null)
      persist({ found, solved: true })
      onComplete()
    } else {
      setAnswerFeedback(config.wrongAnswer)
    }
  }

  return (
    <div className="wordsearch">
      {!solved && <p className="lede">{config.instruction}</p>}

      <div className="ws-layout">
        <div>
          <div
            className={`ws-grid ${allFound ? 'is-done' : ''}`}
            style={{ gridTemplateColumns: `repeat(${grid[0].length}, 1fr)` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => setDrag(null)}
            role="grid"
            aria-label="Woordzoeker"
          >
            {grid.map((row, r) => (
              <div role="row" className="ws-row" key={r}>
                {[...row].map((letter, c) => {
                  const id = cellId({ r, c })
                  return (
                    <button
                      type="button"
                      role="gridcell"
                      key={id}
                      data-cell={id}
                      className={`ws-cell ${foundCells.has(id) ? 'is-found' : ''} ${activeCells.has(id) ? 'is-active' : ''}`}
                      aria-label={`${letter}, rij ${r + 1}, kolom ${c + 1}${foundCells.has(id) ? ', gevonden' : ''}`}
                      onClick={(e) => onCellClick({ r, c }, e)}
                    >
                      {letter}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          <p className={`feedback ws-feedback feedback-${feedback?.tone ?? 'info'}`} role="status" aria-live="polite">
            {feedback?.text}
          </p>
        </div>

        <div className="ws-side">
          <ol className="ws-words" aria-label="Woorden om te vinden">
            {words.map((w) => (
              <li key={w} className={found.includes(w) ? 'is-found' : ''} data-word={w}>
                <span>
                  <span className="ws-initial">{w[0]}</span>
                  {w.slice(1)}
                </span>
                {found.includes(w) && (
                  <svg className="ws-check" viewBox="0 0 24 24" width="18" height="18" aria-label="gevonden" role="img">
                    <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            ))}
          </ol>
          <p className="ws-count">
            {found.length} van {words.length} gevonden
          </p>
        </div>
      </div>

      {allFound && !solved && (
        <form className="answer card-inset" onSubmit={submitAnswer} noValidate>
          <label htmlFor="beginletters" className="answer-label">
            {config.answerLabel}
          </label>
          <div className="answer-row">
            <input
              id="beginletters"
              className="text-input"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value)
                setAnswerFeedback(null)
              }}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              enterKeyHint="done"
              placeholder="6 letters"
            />
            <button type="submit" className="btn btn-primary">
              Controleer
            </button>
          </div>
          <p className="feedback feedback-soft" role="alert">
            {answerFeedback}
          </p>
        </form>
      )}

      {solved && (
        <div className={`reward ${justSolved ? 'is-new' : ''}`} data-testid="beloning">
          <p className="reward-eyebrow">
            {justSolved ? 'Jouw letters' : 'Al opgelost · jouw letters'}: {config.solution}
          </p>
          <p className="reward-text">{config.rewardMessage}</p>
        </div>
      )}

      {!solved && (
        <div className="hint">
          <button type="button" className="btn btn-ghost" aria-expanded={showHint} onClick={() => setShowHint((v) => !v)}>
            {showHint ? 'Verberg hint' : 'Geef me een hint'}
          </button>
          {showHint && <p className="hint-text">{allFound ? config.hints.code : config.hints.search}</p>}
        </div>
      )}
    </div>
  )
}
